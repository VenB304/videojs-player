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
                // Standard classes only. 
                videoElement.className = 'video-js vjs-big-play-centered';

                // FIX: HFS requires .showing on the element for Autoplay/JS detection.
                if (isShowing) {
                    videoElement.classList.add('showing');
                    // FIX: But HFS global CSS sets max-width on .showing.
                    // We must override this on the inner video element to prevent double-shrinking.
                    videoElement.style.maxWidth = '100%';
                }

                videoElementRef.current = videoElement;

                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                }

                // Initialize Video.js
                // CLEAN RESET: Use "fluid: true"
                const player = videojs(videoElement, {
                    controls: true,
                    autoplay: true,
                    preload: 'metadata',
                    fluid: true,
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src)
                    }]
                });
                playerRef.current = player;

                // FIX: Apply classes to Wrapper for Layout (Nav button clearance)
                if (props.className) {
                    player.addClass(props.className);
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
            // The container is a simple block div.
            // Sizing is controlled by the HFS parent (which has max-width rules)
            // and the `fluid: true` option in Video.js (which fills that width).
            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                // No custom styles. Let default CSS rule.
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