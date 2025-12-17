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
                // HFS uses the 'showing' class to identify the active media element.
                // We must ensure this class ends up on the ACTUAL <video> element, 
                // NOT the VideoJS wrapper div, or HFS's 'instanceof HTMLMediaElement' check will fail.
                const rawClass = props.className || '';
                const isShowing = rawClass.includes('showing');
                const wrapperClass = rawClass.replace('showing', '').trim(); // Remove 'showing' from wrapper

                // Manual DOM creation
                const videoElement = document.createElement('video');
                // Initial class for VideoJS. We purposely OMIT 'showing' here so it doesn't get promoted to the wrapper.
                videoElement.className = `video-js vjs-big-play-centered ${wrapperClass}`;
                videoElementRef.current = videoElement;

                // Append video element to our container
                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                }

                // Initialize Video.js
                const player = videojs(videoElement, {
                    controls: true,
                    autoplay: true,
                    preload: 'metadata',
                    fluid: false, // Disable fluid to prevent overflow
                    fill: true,   // Fill the container instead
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src)
                    }]
                });
                playerRef.current = player;

                // POST-INIT: Manually add 'showing' to the underlying video element ONLY.
                // This ensures container.querySelector('.showing') returns the <video> element.
                if (isShowing) {
                    // Access the tech's element (the real video tag)
                    const techEl = player.tech().el();
                    if (techEl) techEl.classList.add('showing');
                }

                // CRITICAL: Expose the real video element to HFS for 'instanceof' check
                if (ref) {
                    if (typeof ref === 'function') {
                        ref(videoElement);
                    } else if (ref.hasOwnProperty('current')) {
                        ref.current = videoElement;
                    }
                }

                // Event Listeners
                player.on('play', () => {
                    console.log("VideoJS Plugin: Play event");
                    if (props.onPlay) props.onPlay();
                });

                player.on('ended', () => {
                    console.log("VideoJS Plugin: Ended event");
                    if (props.onEnded) props.onEnded();
                    videoElement.dispatchEvent(new Event('ended'));
                });

                player.on('error', () => {
                    if (props.onError) props.onError(player.error());
                });

                // Cleanup
                return () => {
                    if (player) {
                        player.dispose();
                    }
                    if (videoElement && videoElement.parentNode) {
                        videoElement.parentNode.removeChild(videoElement);
                    }
                };
            }, []); // Run only on Mount

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

            // Render container with 100% size to contain the 'fill' player
            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: { width: '100%', height: '100%' }
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