'use strict';
{
    let { React, h, HFS } = window;

    // Polyfill/Fallback for React if not directly on window
    if (!React) {
        if (window.preact) {
            console.log("VideoJS Plugin: Using Preact");
            React = window.preact;
            // Ensure compatibility if Preact uses different structure
            if (!React.Component && window.preact.Component) {
                React.Component = window.preact.Component;
            }
        } else if (HFS && HFS.React) {
            console.log("VideoJS Plugin: Using HFS.React");
            React = HFS.React;
        }
    }

    if (React) {
        // Ensure 'h' (createElement) is available
        if (!h && React.createElement) {
            h = React.createElement;
        }

        // Supported video extensions
        const VIDEO_EXTS = ['.mp4', '.mkv', '.webm', '.ogv', '.mov'];

        function determineMimeType(src) {
            const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
            if (ext === '.webm') return 'video/webm';
            if (ext === '.ogv') return 'video/ogg';
            if (ext === '.mkv') return 'video/x-matroska';
            return 'video/mp4'; // Default
        }

        // 1. Define the Video.js React Wrapper Component using Functional Component + forwardRef
        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);

            // Mount / Unmount Logic
            React.useEffect(() => {
                console.log("VideoJS Plugin: Mounted with props:", props);

                // Prepare classes
                const rawClass = props.className || '';
                const isShowing = rawClass.includes('showing');
                const wrapperClass = rawClass.replace('showing', '').trim();

                // Manual DOM creation
                const videoElement = document.createElement('video');
                // Initial class for VideoJS. Omit 'showing'.
                videoElement.className = `video-js vjs-big-play-centered ${wrapperClass}`;
                videoElementRef.current = videoElement;

                // Append video element to our container
                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                }

                // Initialize Video.js
                // Note: fluid=false, fill=false. We will manage size manually.
                const player = videojs(videoElement, {
                    controls: true,
                    autoplay: true,
                    preload: 'metadata',
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src)
                    }]
                });
                playerRef.current = player;

                // POST-INIT: Manually add 'showing' to the underlying video element ONLY.
                if (isShowing) {
                    videoElement.classList.add('showing');
                }

                // CRITICAL: Expose the real video element to HFS for 'instanceof' check
                if (ref) {
                    if (typeof ref === 'function') {
                        ref(videoElement);
                    } else if (ref.hasOwnProperty('current')) {
                        ref.current = videoElement;
                    }
                }

                // --- Layout Logic: Resize to fit container while maintaining aspect ratio ---
                const handleResize = () => {
                    if (!player || !containerRef.current) return;

                    const vWidth = player.videoWidth();
                    const vHeight = player.videoHeight();
                    if (!vWidth || !vHeight) return;

                    const container = containerRef.current.parentElement || containerRef.current; // Use parent usually HFS container
                    const cWidth = container.clientWidth;
                    const cHeight = container.clientHeight;

                    if (!cWidth || !cHeight) return;

                    // Calculate scale to fit
                    const widthScale = cWidth / vWidth;
                    const heightScale = cHeight / vHeight;
                    const scale = Math.min(widthScale, heightScale, 1); // 1 = max native size (optional, remove if we want upscale)

                    // Actually, user said "only be the resolution of the file". 
                    // But if resolution > screen, we must shrink.
                    // If resolution < screen, keeping it at native (scale <= 1) is good. 
                    // If we want to UPSCALING to fit screen, remove the ", 1".
                    // Let's stick to safe "contain" logic:
                    const finalScale = Math.min(widthScale, heightScale);

                    const newWidth = vWidth * finalScale;
                    const newHeight = vHeight * finalScale;

                    player.width(newWidth);
                    player.height(newHeight);
                };

                player.on('loadedmetadata', handleResize);
                window.addEventListener('resize', handleResize);
                // --------------------------------------------------------------------------

                // Event Listeners
                player.on('play', () => {
                    console.log("VideoJS Plugin: Play event");
                    if (props.onPlay) props.onPlay();
                });

                player.on('ended', () => {
                    console.log("VideoJS Plugin: Ended event");
                    if (props.onEnded) props.onEnded();
                    // FIX: REMOVED manual dispatch of native 'ended' event.
                    // This was causing an infinite loop because HFS listens to ref, but VideoJS also listens
                    // and re-triggers its own ended event when the native one fires.
                });

                player.on('error', () => {
                    if (props.onError) props.onError(player.error());
                });

                // Cleanup
                return () => {
                    window.removeEventListener('resize', handleResize);
                    if (player) {
                        player.dispose();
                    }
                    if (videoElement && videoElement.parentNode) {
                        videoElement.parentNode.removeChild(videoElement);
                    }
                };
            }, []); // Mount only

            // Handle Source Changes
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

            // Render container.
            // Using Flexbox to center the player if it acts like an image.
            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden' // Ensure it doesn't spill out
                }
            });
        });

        // 2. Hook into the 'fileShow' event
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