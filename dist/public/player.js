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
                // No fluid/fill options. Let CSS control size.
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
            // 1. Container: fills available space (100% w/h), uses flexbox to align player in center.
            // 2. Style: Forces the inner video-js element to respect max constraints, mimicking standard video behavior.
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
                    max-width: 100%;
                    max-height: 100%;
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