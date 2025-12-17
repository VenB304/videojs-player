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
        // This is crucial: forwardRef allows us to pass the ACTUAL video element back to HFS
        // satisfying HFS's "instanceof HTMLMediaElement" check for autoplay/slideshows.
        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);

            // Mount / Unmount Logic
            React.useEffect(() => {
                console.log("VideoJS Plugin: Mounted with props:", props);

                // Manual DOM creation to isolate VideoJS from Preact's reconciliation
                // This prevents the "removeChild" crash when switching away from video.
                const videoElement = document.createElement('video');
                videoElement.className = `video-js vjs-big-play-centered ${props.className || ''}`;
                videoElementRef.current = videoElement;

                // Append video element to our container
                if (containerRef.current) {
                    containerRef.current.appendChild(videoElement);
                }

                // Initialize Video.js
                const player = videojs(videoElement, {
                    controls: true,
                    autoplay: true, // Force autoplay on load
                    preload: 'metadata',
                    fluid: true,
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src)
                    }]
                });
                playerRef.current = player;

                // CRITICAL: Expose the real video element to HFS
                // HFS expects an HTMLMediaElement. We give it exactly that.
                if (ref) {
                    if (typeof ref === 'function') {
                        ref(videoElement);
                    } else if (ref.hasOwnProperty('current')) {
                        ref.current = videoElement;
                    }
                }

                // Event Listeners
                // Signal to HFS that playback has started/ended
                player.on('play', () => {
                    console.log("VideoJS Plugin: Play event");
                    if (props.onPlay) props.onPlay();
                });

                player.on('ended', () => {
                    console.log("VideoJS Plugin: Ended event");
                    if (props.onEnded) props.onEnded();
                    // Dispatch native event on the video element too, just in case HFS is listening directly
                    videoElement.dispatchEvent(new Event('ended'));
                });

                player.on('error', () => {
                    if (props.onError) props.onError(player.error());
                });

                // Cleanup function
                return () => {
                    if (player) {
                        player.dispose();
                    }
                    // Manually remove video element if it still exists
                    if (videoElement && videoElement.parentNode) {
                        videoElement.parentNode.removeChild(videoElement);
                    }
                };
            }, []); // Empty dependency array -> Run only on Mount

            // Handle Source Changes (Playlist Navigation)
            React.useEffect(() => {
                const player = playerRef.current;
                if (player && props.src) {
                    // Check if src actually changed to avoid Redundant loads
                    const currentSrc = player.currentSrc();
                    // Simple check: if the new src is not contained in the current full URL
                    if (!currentSrc || !currentSrc.includes(encodeURI(props.src))) {
                        console.log("VideoJS Plugin: Source updating to", props.src);
                        player.src({
                            src: props.src,
                            type: determineMimeType(props.src)
                        });
                        player.play(); // Ensure it plays immediately
                    }
                }
            }, [props.src]);

            // Render a static container for Preact to hold
            return h('div', {
                'data-vjs-player': true,
                ref: containerRef
            });
        });

        // 2. Hook into the 'fileShow' event
        HFS.onEvent('fileShow', (params) => {
            const { entry } = params;

            // Check if the file name ends with a known video extension
            const ext = entry.n.substring(entry.n.lastIndexOf('.')).toLowerCase();
            if (!VIDEO_EXTS.includes(ext)) {
                return; // Not a video, let HFS handle it normally
            }

            // Replace the default Component.
            params.Component = VideoJsPlayer;
        });
    } else {
        console.error("VideoJS Plugin: React/Preact not found on window or HFS. Plugin execution aborted.");
    }
}