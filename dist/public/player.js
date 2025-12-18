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

        // HFS API REQUIREMENT: getPluginConfig MUST be called at the very top level of the module
        // We capture it once here.
        const rawConfig = HFS.getPluginConfig ? HFS.getPluginConfig() : {};

        // Process config into usable defaults immediately
        const C = {
            autoplay: rawConfig.autoplay ?? true,
            loop: rawConfig.loop ?? false,
            muted: rawConfig.muted ?? false,
            controls: rawConfig.controls ?? true,
            volume: (rawConfig.volume ?? 100) / 100,
            sizingMode: rawConfig.sizingMode || 'fluid',
            fixedWidth: parseInt(rawConfig.fixedWidth) || 0,
            fixedHeight: parseInt(rawConfig.fixedHeight) || 0,
            playbackRates: rawConfig.playbackRates || "0.5, 1, 1.5, 2",
            preload: rawConfig.preload || 'metadata',
            enableHLS: rawConfig.enableHLS ?? false,
            hevcErrorStyle: rawConfig.hevcErrorStyle || 'overlay',
            theme: rawConfig.theme || 'default',
        };

        const VIDEO_EXTS = ['.mp4', '.webm', '.ogv', '.mov'];

        function determineMimeType(src) {
            const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
            if (ext === '.webm')
                return 'video/webm';
            if (ext === '.ogv')
                return 'video/ogg';
            if (C.enableHLS) {
                if (ext === '.mkv')
                    return 'video/webm'; // Trick for MKV
                if (ext === '.m3u8')
                    return 'application/x-mpegURL'; // HLS
            }
            return 'video/mp4';
        }

        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);
            const hevcErrorShownRef = React.useRef(false);
            const hevcTimeoutRef = React.useRef(null);

            React.useEffect(() => {
                console.log("VideoJS Plugin: Mounted with config:", C);

                const videoElement = document.createElement('video');
                let cssClasses = 'video-js vjs-big-play-centered';
                if (C.theme !== 'default') {
                    cssClasses += ` vjs-theme-${C.theme}`;
                }
                videoElement.className = cssClasses;
                if (C.sizingMode === 'fill') {
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

                // Determine Video.js sizing options
                const mode = C.sizingMode;
                const isFluid = mode === 'fluid';
                const isFill = mode === 'fill';

                // Initialize Video.js
                const player = videojs(videoElement, {
                    controls: C.controls,
                    autoplay: C.autoplay,
                    loop: C.loop,
                    muted: C.muted,
                    preload: C.preload,
                    fluid: isFluid,
                    fill: isFill,
                    playbackRates: rates.length ? rates : [0.5, 1, 1.5, 2],
                    sources: [{
                        src: props.src,
                        type: determineMimeType(props.src)
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

                // --- Custom Sizing Logic (Native Mode Only) ---
                const resizePlayer = () => {
                    if (C.sizingMode !== 'native') return;

                    const el = player.el();
                    if (!el) return;

                    const vidW = player.videoWidth();
                    const vidH = player.videoHeight();
                    if (!vidW || !vidH) return;

                    // Force strict native dimensions or custom fixed override
                    const finalW = C.fixedWidth > 0 ? C.fixedWidth : vidW;
                    const finalH = C.fixedHeight > 0 ? C.fixedHeight : vidH;

                    player.width(finalW);
                    player.height(finalH);
                };

                // Listeners for resizing
                player.on('loadedmetadata', resizePlayer);
                window.addEventListener('resize', resizePlayer);
                setTimeout(resizePlayer, 100);

                // Event Listeners
                player.on('playing', () => {
                    // Check for hidden HEVC playback failure (Audio plays, Video is 0x0)
                    if (hevcTimeoutRef.current) clearTimeout(hevcTimeoutRef.current);

                    hevcTimeoutRef.current = setTimeout(() => {
                        // Safety check if player is destroyed or disposed
                        if (!player || (player.isDisposed && player.isDisposed()) || player.paused() || player.ended()) return;

                        const w = player.videoWidth();
                        const h = player.videoHeight();
                        const currentSrc = player.currentSrc();
                        const isVideo = currentSrc ? determineMimeType(currentSrc).startsWith('video/') : false;

                        if (isVideo && (w === 0 || h === 0)) {
                            // Check browser support for HEVC
                            const hevcSupported = videoElement.canPlayType('video/mp4; codecs="hvc1"') !== "" ||
                                videoElement.canPlayType('video/mp4; codecs="hev1"') !== "";

                            if (!hevcSupported) {
                                // HEVC Failure Detected
                                if (C.hevcErrorStyle === 'toast') {
                                    // Option A: HFS System Notification
                                    if (!hevcErrorShownRef.current && HFS && HFS.toast) {
                                        HFS.toast("Video format not supported (HEVC). Audio playing...", "error");
                                        hevcErrorShownRef.current = true;
                                    }
                                } else {
                                    // Option B: Player Overlay (Default)
                                    player.controls(true); // Ensure controls are visible

                                    // Create custom error overlay (Centered Toast)
                                    const errDiv = document.createElement('div');
                                    errDiv.className = 'vjs-hevc-error-overlay';
                                    errDiv.style.position = 'absolute';
                                    errDiv.style.top = '50%';
                                    errDiv.style.left = '50%';
                                    errDiv.style.transform = 'translate(-50%, -50%)';
                                    errDiv.style.width = 'auto';
                                    errDiv.style.maxWidth = '80%';
                                    errDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                                    errDiv.style.borderRadius = '8px';
                                    errDiv.style.zIndex = '10'; // Above video, below controls
                                    errDiv.style.display = 'flex';
                                    errDiv.style.flexDirection = 'column';
                                    errDiv.style.alignItems = 'center';
                                    errDiv.style.justifyContent = 'center';
                                    errDiv.style.color = '#fff';
                                    errDiv.style.textAlign = 'center';
                                    errDiv.style.padding = '20px';
                                    errDiv.style.pointerEvents = 'none'; // Click-through
                                    errDiv.innerHTML = `
                                    <div style="font-size: 1.1em; font-weight: bold; margin-bottom: 8px;">Video Format Not Supported</div>
                                    <div style="font-size: 0.9em;">HEVC video is not supported by your browser.</div>
                                    <div style="font-size: 0.9em; opacity: 0.8; margin-top: 4px;">Audio playing...</div>
                                `;

                                    const playerEl = player.el();
                                    if (playerEl) {
                                        const existing = playerEl.querySelector('.vjs-hevc-error-overlay');
                                        if (existing) existing.remove();
                                        playerEl.appendChild(errDiv);
                                    }
                                }
                            }
                        }
                    }, 1000);
                });

                player.on('play', () => {
                    // Remove error overlay if retrying or playing new source
                    const playerEl = player.el();
                    if (playerEl) {
                        const existing = playerEl.querySelector('.vjs-hevc-error-overlay');
                        if (existing) existing.remove();
                    }
                    if (props.onPlay) props.onPlay();
                });
                player.on('ended', () => {
                    if (props.onEnded) props.onEnded();
                    dummyVideo.dispatchEvent(new Event('ended'));
                });
                player.on('error', () => { if (props.onError) props.onError(player.error()); });

                return () => {
                    if (hevcTimeoutRef.current) clearTimeout(hevcTimeoutRef.current);
                    window.removeEventListener('resize', resizePlayer);
                    if (player) player.dispose();
                    if (videoElement && videoElement.parentNode) videoElement.parentNode.removeChild(videoElement);
                    if (dummyVideo && dummyVideo.parentNode) dummyVideo.parentNode.removeChild(dummyVideo);
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
                        hevcErrorShownRef.current = false;
                        if (C.autoplay) {
                            player.play();
                        }
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
            // Use the top-level captured config
            const enableHLS = C.enableHLS;

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