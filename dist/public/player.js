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

        const VIDEO_EXTS = ['.mp4', '.webm', '.ogv', '.mov'];

        function determineMimeType(src, enableHLS) {
            const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
            if (ext === '.webm') return 'video/webm';
            if (ext === '.ogv') return 'video/ogg';
            if (enableHLS) {
                if (ext === '.mkv') return 'video/webm'; // Trick for MKV
                if (ext === '.m3u8') return 'application/x-mpegURL'; // HLS
            }
            return 'video/mp4';
        }

        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);

            // Get Configs (with defaults in case they are missing)
            const config = HFS.getPluginConfig ? HFS.getPluginConfig() : {};
            const C = {
                autoplay: config.autoplay ?? true,
                loop: config.loop ?? false,
                muted: config.muted ?? false,
                controls: config.controls ?? true,
                volume: config.volume ?? 1.0,
                sizingMode: config.sizingMode || 'fit',
                fillContainer: config.fillContainer ?? false,
                playbackRates: config.playbackRates || "0.5, 1, 1.5, 2",
                preload: config.preload || 'metadata',
                enableHLS: config.enableHLS ?? false,
            };

            React.useEffect(() => {
                console.log("VideoJS Plugin: Mounted with config:", C);

                const videoElement = document.createElement('video');
                videoElement.className = 'video-js vjs-big-play-centered';
                if (C.fillContainer) {
                    videoElement.style.objectFit = 'cover';
                }
                videoElementRef.current = videoElement;

                // --- Dummy Video Proxy for HFS Autoplay ---
                const dummyVideo = document.createElement('video');
                dummyVideo.className = 'showing';
                dummyVideo.style.display = 'none';
                dummyVideo.play = () => Promise.resolve();

                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                    containerRef.current.appendChild(dummyVideo);
                }

                // Parse playback rates
                const rates = C.playbackRates.split(',').map(r => parseFloat(r.trim())).filter(n => !isNaN(n));

                // Initialize Video.js
                const player = videojs(videoElement, {
                    controls: C.controls,
                    autoplay: C.autoplay,
                    loop: C.loop,
                    muted: C.muted,
                    preload: C.preload,
                    fluid: C.sizingMode === 'fluid', // Built-in fluid mode
                    fill: C.sizingMode === 'fluid',
                    playbackRates: rates.length ? rates : [0.5, 1, 1.5, 2],
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src, C.enableHLS)
                    }]
                });
                playerRef.current = player;

                // Set Volume
                player.ready(() => {
                    player.volume(C.volume);
                });

                // Apply HFS classes to wrapper (excluding .showing)
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
                const resizePlayer = () => {
                    if (C.sizingMode === 'fluid') return; // Video.js handles this

                    const el = player.el();
                    if (!el) return;

                    const vidW = player.videoWidth();
                    const vidH = player.videoHeight();
                    if (!vidW || !vidH) return;

                    if (C.sizingMode === 'native') {
                        player.width(vidW);
                        player.height(vidH);
                        return;
                    }

                    // Fit to Container (Default)
                    const container = el.closest('.showing-container') || document.body;
                    const rect = container.getBoundingClientRect();
                    const maxW = rect.width;
                    const maxH = rect.height;

                    const scale = Math.min(maxW / vidW, maxH / vidH, 1);
                    const finalW = Math.floor(vidW * scale);
                    const finalH = Math.floor(vidH * scale);

                    player.width(finalW);
                    player.height(finalH);
                };

                // Listeners for resizing
                player.on('loadedmetadata', resizePlayer);
                window.addEventListener('resize', resizePlayer);
                setTimeout(resizePlayer, 100);

                // Event Listeners
                player.on('play', () => { if (props.onPlay) props.onPlay(); });
                player.on('ended', () => {
                    if (props.onEnded) props.onEnded();
                    dummyVideo.dispatchEvent(new Event('ended'));
                });
                player.on('error', () => { if (props.onError) props.onError(player.error()); });

                return () => {
                    window.removeEventListener('resize', resizePlayer);
                    if (player) player.dispose();
                    if (videoElement && videoElement.parentNode) videoElement.parentNode.removeChild(videoElement);
                    if (dummyVideo && dummyVideo.parentNode) dummyVideo.parentNode.removeChild(dummyVideo);
                };
            }, []); // Re-mount if config conceptually changes? No, config is static per reload usually.

            React.useEffect(() => {
                const player = playerRef.current;
                if (player && props.src) {
                    const currentSrc = player.currentSrc();
                    if (!currentSrc || !currentSrc.includes(encodeURI(props.src))) {
                        console.log("VideoJS Plugin: Source updating to", props.src);
                        player.src({
                            src: props.src,
                            type: determineMimeType(props.src, C.enableHLS)
                        });
                        player.play();
                    }
                }
            }, [props.src]);

            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: { display: 'contents' }
            });
        });

        HFS.onEvent('fileShow', (params) => {
            const { entry } = params;
            // Get config for logic checking
            const config = HFS.getPluginConfig ? HFS.getPluginConfig() : {};
            const enableHLS = config.enableHLS ?? false;

            const ext = entry.n.substring(entry.n.lastIndexOf('.')).toLowerCase();

            // Check extensions
            if (!VIDEO_EXTS.includes(ext)) {
                // If not in standard list, check if HLS allows it
                if (!enableHLS || (ext !== '.m3u8' && ext !== '.mkv')) {
                    return;
                }
            }
            params.Component = VideoJsPlayer;
        });
    } else {
        console.error("VideoJS Plugin: React/Preact not found on window or HFS. Plugin execution aborted.");
    }
}