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

        // 1. Define the Video.js React Wrapper Component
        class VideoJsPlayer extends React.Component {
            componentDidMount() {
                console.log("VideoJS Plugin: Mounted with props:", this.props);

                // Manual DOM creation to avoid Preact reconciliation conflicts
                this.videoElement = document.createElement('video');
                this.videoElement.className = `video-js vjs-big-play-centered ${this.props.className || ''}`;

                // Append correctly to the container ref
                if (this.containerRef) {
                    this.containerRef.appendChild(this.videoElement);
                }

                // Initialize Video.js on the video node
                this.player = videojs(this.videoElement, {
                    controls: true,
                    autoplay: true, // Force autoplay to ensure video starts
                    preload: 'metadata',
                    fluid: true, // Responsive
                    sources: [{
                        src: this.props.src,
                        type: this.determineMimeType(this.props.src)
                    }]
                });

                // Hook into Video.js events to trigger HFS callbacks
                this.player.on('play', () => {
                    console.log("VideoJS Plugin: Play event");
                    if (this.props.onPlay) this.props.onPlay();
                });

                this.player.on('ended', () => {
                    console.log("VideoJS Plugin: Ended event");
                    if (this.props.onEnded) this.props.onEnded();
                });

                this.player.on('error', () => {
                    if (this.props.onError) this.props.onError(this.player.error());
                });
            }

            componentDidUpdate(prevProps) {
                if (this.props.src !== prevProps.src) {
                    console.log("VideoJS Plugin: Source changed to", this.props.src);
                    if (this.player) {
                        this.player.src({
                            src: this.props.src,
                            type: this.determineMimeType(this.props.src)
                        });
                        this.player.play(); // Force play on source change
                    }
                }
            }

            componentWillUnmount() {
                // Clean up player when user closes the file or navigates away
                if (this.player) {
                    this.player.dispose();
                    this.player = null;
                }
                // Manually remove video element if it still exists (double safety)
                if (this.videoElement && this.videoElement.parentNode) {
                    this.videoElement.parentNode.removeChild(this.videoElement);
                }
            }

            // Duck typing: Expose video element properties/methods for HFS
            // Return safe defaults if player isn't ready
            get duration() { return this.player ? this.player.duration() : 0; }
            get currentTime() { return this.player ? this.player.currentTime() : 0; }
            set currentTime(t) { if (this.player) this.player.currentTime(t); }
            get paused() { return this.player ? this.player.paused() : true; }
            get ended() { return this.player ? this.player.ended() : false; }
            play() { if (this.player) this.player.play(); }
            pause() { if (this.player) this.player.pause(); }

            determineMimeType(src) {
                const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
                if (ext === '.webm') return 'video/webm';
                if (ext === '.ogv') return 'video/ogg';
                if (ext === '.mkv') return 'video/x-matroska';
                return 'video/mp4'; // Default
            }

            render() {
                // Render a static container that Preact controls.
                // We manually append the video element into this.
                return h('div', {
                    'data-vjs-player': true,
                    ref: el => this.containerRef = el
                });
            }
        }

        // 2. Hook into the 'fileShow' event
        // This event is triggered when HFS is about to display a file preview
        HFS.onEvent('fileShow', (params) => {
            const { entry } = params;

            // Check if the file name ends with a known video extension
            const ext = entry.n.substring(entry.n.lastIndexOf('.')).toLowerCase();
            if (!VIDEO_EXTS.includes(ext)) {
                return; // Not a video, let HFS handle it normally
            }

            // Replace the default Component.
            // HFS will instantiate it and pass props: { src, entry, className, onPlay, onError, ... }
            params.Component = VideoJsPlayer;
        });
    } else {
        // This else block is now unreachable due to the early return above.
        // It's kept for consistency with the original structure, but could be removed.
        console.error("VideoJS Plugin: React/Preact not found on window or HFS. Plugin execution aborted.");
    }
}