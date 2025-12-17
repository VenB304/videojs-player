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
            if (ext === '.mkv') return 'video/x-matroska';
            return 'video/mp4';
        }

        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);

            React.useEffect(() => {
                console.log("VideoJS Plugin: Mounted with props:", props);

                const rawClass = props.className || '';
                const isShowing = rawClass.includes('showing');
                const wrapperClass = rawClass.replace('showing', '').trim();

                const videoElement = document.createElement('video');
                // Standard classes + wrapper class
                videoElement.className = `video-js vjs-big-play-centered ${wrapperClass}`;
                videoElementRef.current = videoElement;

                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                }

                // Initialize Video.js
                // fluid: false, fill: false. Let strictly CSS control the flow.
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

                // Add 'showing' to video element for HFS detection
                if (isShowing) {
                    videoElement.classList.add('showing');
                }

                if (ref) {
                    if (typeof ref === 'function') {
                        ref(videoElement);
                    } else if (ref.hasOwnProperty('current')) {
                        ref.current = videoElement;
                    }
                }

                // Event Listeners
                player.on('play', () => {
                    if (props.onPlay) props.onPlay();
                });

                player.on('ended', () => {
                    if (props.onEnded) props.onEnded();
                });

                player.on('error', () => {
                    if (props.onError) props.onError(player.error());
                });

                return () => {
                    if (player) {
                        player.dispose();
                    }
                    if (videoElement && videoElement.parentNode) {
                        videoElement.parentNode.removeChild(videoElement);
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

            // Render container
            // 1. Emulate Native Layout Strategy:
            //    - .video-js wrapper -> inline-block, width: auto (shrinks to child).
            //    - .vjs-tech (video) -> position: relative (drives the size).
            //    - background: transparent (removes black bars).
            // 2. Parent Container:
            //    - Centered via Flexbox.
            //    - 100% size to provide the canvas.
            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            }, h('style', {}, `
                .video-js {
                    background-color: transparent !important;
                    display: inline-block !important;
                    width: auto !important;
                    height: auto !important;
                    max-width: 100%;
                    max-height: 100%;
                    overflow: visible !important;
                }
                .video-js .vjs-tech {
                    position: relative !important;
                    top: 0;
                    left: 0;
                    width: 100% !important;
                    height: auto !important;
                }
                /* Ensure controls sit at the bottom of the visible video area */
                .video-js .vjs-control-bar {
                    width: 100%;
                    bottom: 0;
                }
                /* FIX 3: Revert Grid, use Width 100% on Tech to match Controls */
                .video-js .vjs-tech {
                    display: block !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    /* Expand to fill the wrapper (which might have phantom width) */
                    width: 100% !important; 
                    height: auto !important;
                    max-width: 100%;
                    position: relative !important;
                }
            `));
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