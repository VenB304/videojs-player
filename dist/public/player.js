'use strict';
{
    let { React, h, HFS } = window;

    // Polyfill/Fallback for React
    if (!React) {
        if (window.preact) {
            React = window.preact;
            if (!React.Component && window.preact.Component) {
                React.Component = window.preact.Component;
            }
        } else if (HFS && HFS.React) {
            React = HFS.React;
        }
    }

    if (React) {
        if (!h && React.createElement) {
            h = React.createElement;
        }

        const VIDEO_EXTS = ['.mp4', '.mkv', '.webm', '.ogv', '.mov'];

        function determineMimeType(src) {
            const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
            if (ext === '.webm') return 'video/webm';
            if (ext === '.ogv') return 'video/ogg';
            if (ext === '.mkv') return 'video/webm'; // Chrome often plays MKV if treated as WebM
            return 'video/mp4';
        }

        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);

            React.useEffect(() => {
                console.log("VideoJS Plugin: Mounted with props:", props);

                const videoElement = document.createElement('video');
                videoElement.className = 'video-js vjs-big-play-centered';
                videoElementRef.current = videoElement;

                // --- Dummy Video Proxy for HFS Autoplay ---
                // HFS requires checking `querySelector('.showing') instanceof HTMLMediaElement`
                // to attach the 'ended' listener for autoplay. 
                // Video.js wrapper structure complicates this.
                // SOLUTION: Create a hidden dummy <video class="showing"> that HFS finds.
                // we forward events from the real player to this dummy.
                const dummyVideo = document.createElement('video');
                dummyVideo.className = 'showing';
                dummyVideo.style.display = 'none';
                // Mock play to satisfy HFS .play() call
                dummyVideo.play = () => Promise.resolve();

                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                    containerRef.current.appendChild(dummyVideo);
                }

                // Initialize Video.js
                // We DISABLE fluid mode because it forces width: 100%, which breaks 
                // layout for tall videos (overflows height) and small videos (upscales).
                const player = videojs(videoElement, {
                    controls: true,
                    autoplay: true,
                    preload: 'metadata',
                    fluid: false, // Custom resize logic used instead
                    fill: false,
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src)
                    }]
                });
                playerRef.current = player;

                // Apply HFS classes to wrapper, BUT EXCLUDE .showing
                // We want HFS to find the dummy video, not the wrapper
                if (props.className) {
                    const wrapperClasses = props.className.replace(/\bshowing\b/g, '').trim();
                    if (wrapperClasses) {
                        player.addClass(wrapperClasses);
                    }
                }

                if (ref) {
                    if (typeof ref === 'function') {
                        ref(videoElement);
                    } else if (ref.hasOwnProperty('current')) {
                        ref.current = videoElement;
                    }
                }

                // --- Custom Sizing Logic ---
                // mimicks native HFS behavior: fit in container, don't upscale small, maintain aspect
                const resizePlayer = () => {
                    const el = player.el();
                    if (!el) return;

                    // Get native video dimensions
                    const vidW = player.videoWidth();
                    const vidH = player.videoHeight();
                    if (!vidW || !vidH) return;

                    // Find container constraints
                    // We look for the sliding container or fallback to window
                    const container = el.closest('.showing-container') || document.body;
                    const rect = container.getBoundingClientRect();

                    // HFS .showing often has max-width calculations (e.g. calc(100% - 4vw))
                    // We approximate available space. 
                    const maxW = rect.width;
                    const maxH = rect.height;

                    // Calculate scale to fit
                    // 1. Scale down if video > container
                    // 2. Scale = 1 if video < container (don't upscale)
                    const scale = Math.min(
                        maxW / vidW,
                        maxH / vidH,
                        1
                    );

                    const finalW = Math.floor(vidW * scale);
                    const finalH = Math.floor(vidH * scale);

                    // Apply dimensions
                    player.width(finalW);
                    player.height(finalH);
                };

                // Listeners for resizing
                player.on('loadedmetadata', resizePlayer);
                window.addEventListener('resize', resizePlayer);

                // Also trigger initially in case metadata is already there or for slight delays
                setTimeout(resizePlayer, 100);

                // Event Listeners
                player.on('play', () => {
                    if (props.onPlay) props.onPlay();
                });

                player.on('ended', () => {
                    if (props.onEnded) props.onEnded();
                    // FORWARD TO DUMMY: Signal HFS that playback ended
                    dummyVideo.dispatchEvent(new Event('ended'));
                });

                player.on('error', () => {
                    if (props.onError) props.onError(player.error());
                });

                return () => {
                    window.removeEventListener('resize', resizePlayer);
                    if (player) {
                        player.dispose();
                    }
                    if (videoElement && videoElement.parentNode) {
                        videoElement.parentNode.removeChild(videoElement);
                    }
                    if (dummyVideo && dummyVideo.parentNode) {
                        dummyVideo.parentNode.removeChild(dummyVideo);
                    }
                };
            }, []);

            React.useEffect(() => {
                const player = playerRef.current;
                if (player && props.src) {
                    const currentSrc = player.currentSrc();
                    if (!currentSrc || !currentSrc.includes(encodeURI(props.src))) {
                        console.log("VideoJS Plugin: Source updating to", props.src);
                        player.src({
                            src: props.src,
                            type: determineMimeType(props.src)
                        });
                        player.play();
                    }
                }
            }, [props.src]);

            // Render container with display: contents to let Video.js element 
            // participate directly in HFS flex layout
            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: { display: 'contents' }
            });
        });

        HFS.onEvent('fileShow', (params) => {
            const { entry } = params;
            const ext = entry.n.substring(entry.n.lastIndexOf('.')).toLowerCase();
            if (!VIDEO_EXTS.includes(ext)) {
                return;
            }
            params.Component = VideoJsPlayer;
        });
    } else {
        console.error("VideoJS Plugin: React/Preact not found on window or HFS. Plugin execution aborted.");
    }
}