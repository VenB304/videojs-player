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
            showSeekButtons: rawConfig.showSeekButtons ?? true,
            showDownloadButton: rawConfig.showDownloadButton ?? true,
            enableHotkeys: rawConfig.enableHotkeys ?? true,
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

                // --- Feature 1: Seek Buttons ---
                if (C.showSeekButtons) {
                    player.ready(() => {
                        const skipTime = 10;
                        const controlBar = player.getChild('ControlBar');
                        const playToggle = controlBar.getChild('PlayToggle');
                        const insertIndex = controlBar.children().indexOf(playToggle) + 1;

                        // Create Forward Button
                        const btnFwd = controlBar.addChild('button', {
                            controlText: `Forward ${skipTime}s`,
                            className: 'vjs-visible-text vjs-seek-button vjs-seek-forward',
                            clickHandler: () => {
                                let newTime = player.currentTime() + skipTime;
                                if (newTime > player.duration()) newTime = player.duration();
                                player.currentTime(newTime);
                            }
                        }, insertIndex);
                        btnFwd.el().innerHTML = `<span class="vjs-icon-placeholder" aria-hidden="true" style="font-family: 'VideoJS'; content: '\\f101'; font-size: 1.5em; line-height: 1.6;">+${skipTime}</span>`;
                        btnFwd.el().style.fontSize = '0.8em';
                        btnFwd.el().title = `Forward ${skipTime}s`;

                        // Create Rewind Button
                        const btnRw = controlBar.addChild('button', {
                            controlText: `Rewind ${skipTime}s`,
                            className: 'vjs-visible-text vjs-seek-button vjs-seek-backward',
                            clickHandler: () => {
                                let newTime = player.currentTime() - skipTime;
                                if (newTime < 0) newTime = 0;
                                player.currentTime(newTime);
                            }
                        }, insertIndex);
                        // Insert Rewind BEFORE Forward (so it's Play -> Rewind -> Forward)
                        // Note: addChild index is live, so inserting at same index pushes previous one right? No, standard array splice logic.
                        // Actually VideoJS addChild index behavior: index is where it puts it.
                        // If we want Play [Rew] [Fwd], we insert [Fwd] at index+1, then [Rew] at index+1.
                        btnRw.el().innerHTML = `<span class="vjs-icon-placeholder" aria-hidden="true" style="font-family: 'VideoJS'; content: '\\f102'; font-size: 1.5em; line-height: 1.6;">-${skipTime}</span>`;
                        btnRw.el().style.fontSize = '0.8em';
                        btnRw.el().title = `Rewind ${skipTime}s`;
                    });
                }

                // --- Feature 2: Download Button ---
                if (C.showDownloadButton) {
                    player.ready(() => {
                        const controlBar = player.getChild('ControlBar');
                        if (controlBar) {
                            const btnDl = controlBar.addChild('button', {
                                controlText: "Download Video",
                                className: 'vjs-download-button',
                                clickHandler: () => {
                                    const src = player.currentSrc();
                                    if (src) {
                                        const a = document.createElement('a');
                                        a.href = src;
                                        a.download = src.split('/').pop();
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }
                                }
                            });
                            // Use a standard download icon if available or text
                            // VideoJS font char \f105 is download-alt in some versions, or standard download.
                            // Let's use generic CSS or SVG if needed. VideoJS doesn't guarantee a download icon in default font.
                            // We will use a simple unicode or SVG or generic icon.
                            // Safe bet: text or standard icon. Let's try standard share/download.
                            // Actually VideoJS 7+ usually has icons.
                            btnDl.el().innerHTML = `<span class="vjs-icon-placeholder" aria-hidden="true" style="transform: scale(0.8);">⬇</span>`;
                            btnDl.el().title = "Download";
                        }
                    });
                }

                // --- Feature 3: Hotkeys ---
                if (C.enableHotkeys) {
                    // We attach to the CONTAINER or Button, but global keys are risky if iframe?
                    // Best scope is checking if player is active or has focus, or just global if user wants typical behavior.
                    // VideoJS often handles focus. We'll attach to the videoElement's parent (focus-visible).
                    // Or usually document 'keydown' but check if player is in view/active.
                    // Simple approach: Document listener that checks if player has focus OR is playing.

                    const handleKey = (e) => {
                        // Ignore if typing in an input
                        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

                        // Check if player is visible/active (simple check)
                        if (!player || player.isDisposed()) return;

                        // optional: check if hover or active? For now, global enabled if focused or body.

                        // Prevent default scrolling for arrows/space if we handle it

                        switch (e.key) {
                            case ' ':
                            case 'k':
                            case 'K':
                                e.preventDefault();
                                if (player.paused()) player.play(); else player.pause();
                                break;
                            case 'f':
                            case 'F':
                                e.preventDefault();
                                if (player.isFullscreen()) player.exitFullscreen(); else player.requestFullscreen();
                                break;
                            case 'm':
                            case 'M':
                                e.preventDefault();
                                player.muted(!player.muted());
                                break;
                            case 'ArrowLeft':
                                e.preventDefault();
                                player.currentTime(player.currentTime() - 5);
                                break;
                            case 'ArrowRight':
                                e.preventDefault();
                                player.currentTime(player.currentTime() + 5);
                                break;
                            case 'ArrowUp':
                                e.preventDefault();
                                player.volume(Math.min(player.volume() + 0.1, 1));
                                break;
                            case 'ArrowDown':
                                e.preventDefault();
                                player.volume(Math.max(player.volume() - 0.1, 0));
                                break;
                        }
                    };
                    // Attach to player.el() to capture keys when player is focused
                    videoElement.parentElement.addEventListener('keydown', handleKey);
                    // Also make sure player can be focused
                    videoElement.parentElement.tabIndex = 0;
                }

                // --- Feature 4: Mobile Double-Tap Fullscreen ---
                let lastTouch = 0;
                const handleTouch = (e) => {
                    const now = Date.now();
                    if (now - lastTouch < 300) {
                        // Double tap detected
                        if (player.isFullscreen()) player.exitFullscreen(); else player.requestFullscreen();
                    }
                    lastTouch = now;
                };
                // Attach to video wrapper
                if (videoElement.parentElement) {
                    videoElement.parentElement.addEventListener('touchend', handleTouch);
                }


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
                    if (containerRef.current) {
                        containerRef.current.removeEventListener('keydown', handleKey);
                        containerRef.current.removeEventListener('touchend', handleTouch);
                    }
                    if (document.pictureInPictureElement === videoElementRef.current) {
                        try {
                            document.exitPictureInPicture();
                        } catch (e) {
                            // ignore
                        }
                    }
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