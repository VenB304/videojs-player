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
            seekButtonStep: parseInt(rawConfig.seekButtonStep) || 10,
            showDownloadButton: rawConfig.showDownloadButton ?? true,
            enableHotkeys: rawConfig.enableHotkeys ?? true,
            hotkeySeekStep: parseInt(rawConfig.hotkeySeekStep) || 5,
            hotkeyVolumeStep: (parseInt(rawConfig.hotkeyVolumeStep) || 10) / 100, // Convert to decimal 0.0-1.0
            persistentVolume: rawConfig.persistentVolume ?? true,
            resumePlayback: rawConfig.resumePlayback ?? true,
            autoRotate: rawConfig.autoRotate ?? true,
            enableDoubleTap: rawConfig.enableDoubleTap ?? true,
            doubleTapSeekSeconds: parseInt(rawConfig.doubleTapSeekSeconds) || 10,
            hevcErrorStyle: rawConfig.hevcErrorStyle || 'overlay',
            theme: rawConfig.theme || 'default',
            inactivityTimeout: parseInt(rawConfig.inactivityTimeout) || 2000,
            integration_unsupported_videos: rawConfig.integration_unsupported_videos ?? false,
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

            // --- Helper: Handle Playback Error (Conversion Integration) ---
            const [conversionMode, setConversionMode] = React.useState(false);
            const isConvertingRef = React.useRef(false);

            // --- Helper: Handle Playback Error (Conversion Integration) ---
            const handlePlaybackError = (player, message = "Video format not supported.") => {
                // Check if integration is enabled
                if (C.integration_unsupported_videos) {
                    // Check if we already attempted conversion (via Ref to avoid closure staleness)
                    if (!isConvertingRef.current) {
                        // Attempt to switch to conversion stream
                        console.log("[VideoJS] Unsupported video detected. Switching to streaming conversion...");
                        HFS.toast("Unsupported format. Attempting conversion...", "info");
                        isConvertingRef.current = true;
                        setConversionMode(true);
                        return;
                    } else {
                        // Already using ffmpeg, so conversion failed or timed out
                        console.error("[VideoJS] Streaming conversion failed or timed out.");
                    }
                }

                // Fallback to standard error handling (Toast or Overlay)
                if (C.hevcErrorStyle === 'toast') {
                    if (!hevcErrorShownRef.current && HFS && HFS.toast) {
                        HFS.toast(`${message} Audio playing...`, "error");
                        hevcErrorShownRef.current = true;
                    }
                } else {
                    // Option B: Player Overlay
                    player.controls(true);
                    const playerEl = player.el();
                    if (playerEl) {
                        // Remove existing
                        const existing = playerEl.querySelector('.vjs-hevc-error-overlay');
                        if (existing) existing.remove();

                        const errDiv = document.createElement('div');
                        errDiv.className = 'vjs-hevc-error-overlay';
                        // Style it...
                        errDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:auto;max-width:80%;background:rgba(0,0,0,0.8);border-radius:8px;z-index:10;padding:20px;color:#fff;text-align:center;pointer-events:none;';

                        // Custom message for generic network/unsupported error
                        let displayMessage = message;
                        if (message.includes("The media could not be loaded")) {
                            displayMessage = "Playback Failed: Format not supported or network error.";
                        }

                        errDiv.innerHTML = `
                             <div style="font-size: 1.1em; font-weight: bold; margin-bottom: 8px;">Playback Error</div>
                             <div style="font-size: 0.9em;">${displayMessage}</div>
                             ${isConvertingRef.current ? '<div style="font-size: 0.8em; opacity: 0.7; margin-top: 5px;">Conversion failed. Check plugin config (ffmpeg).</div>' : ''}
                        `;
                        playerEl.appendChild(errDiv);
                    }
                }
            };

            // --- Helper: Resume Playback ---
            const attemptResume = (src) => {
                if (!C.resumePlayback || !src) return;

                const resumeKey = `vjs-resume-${src.split('/').pop()}`;
                const savedTime = localStorage.getItem(resumeKey);

                if (savedTime) {
                    const t = parseFloat(savedTime);
                    if (!isNaN(t) && t > 1) {
                        // console.log(`[Resume] Found saved time for ${src}: ${t}`);
                        const applyResume = () => {
                            const p = playerRef.current;
                            if (!p) return;
                            const dur = p.duration();
                            if (!dur || (dur - t > 5)) { // Don't resume if near end
                                p.currentTime(t);
                                HFS.toast(`Resumed playback`, "info");
                            }
                        };

                        const p = playerRef.current;
                        if (p) {
                            if (p.readyState() > 0) {
                                applyResume();
                            } else {
                                p.one('loadedmetadata', applyResume);
                            }
                        }
                    }
                }
            };

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
                if (C.sizingMode === 'fill') {
                    videoElement.style.objectFit = 'cover';
                }
                videoElement.tabIndex = 0; // Ensure vjs-tech is focusable
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
                    muted: C.muted,
                    preload: C.preload,
                    fluid: isFluid,
                    fill: isFill,
                    playbackRates: rates.length ? rates : [0.5, 1, 1.5, 2],
                    inactivityTimeout: C.inactivityTimeout,
                    sources: [] // Initialize empty, let useEffect handle source
                });
                playerRef.current = player;

                // Ensure player wrapper is focusable for hotkeys
                const playerEl = player.el();
                if (playerEl) {
                    playerEl.tabIndex = 0;
                }

                // Set Volume and optional Persistence
                player.ready(() => {
                    let startVolume = C.volume;
                    if (C.persistentVolume) {
                        const savedVol = localStorage.getItem('vjs-volume-level');
                        if (savedVol !== null) {
                            startVolume = parseFloat(savedVol);
                        }
                    }
                    player.volume(startVolume);
                });


                if (C.showSeekButtons) {
                    player.ready(() => {
                        const skipTime = C.seekButtonStep;
                        const controlBar = player.getChild('ControlBar');
                        const progressControl = controlBar.getChild('ProgressControl');

                        if (progressControl) {
                            const progressIndex = controlBar.children().indexOf(progressControl);

                            // Create Rewind Button (Left of Seek Bar)
                            const btnRw = controlBar.addChild('button', {
                                controlText: `Rewind ${skipTime}s`,
                                className: 'vjs-visible-text vjs-seek-button vjs-seek-backward',
                                clickHandler: () => {
                                    let newTime = player.currentTime() - skipTime;
                                    if (newTime < 0) newTime = 0;
                                    player.currentTime(newTime);
                                }
                            }, progressIndex); // Insert before ProgressControl

                            btnRw.el().innerHTML = `
                                <svg viewBox="0 0 24 24" fill="white" width="22" height="22" style="vertical-align: middle;">
                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                    <text x="12" y="16" font-size="8" fill="white" text-anchor="middle" font-weight="bold" style="text-shadow: 1px 1px 1px black;">${skipTime}</text>
                                </svg>`;
                            btnRw.el().title = `Rewind ${skipTime}s`;
                            btnRw.el().style.cursor = "pointer";

                            // Create Forward Button (Right of Seek Bar)
                            // Note: Inserting Rewind shifted ProgressControl to index + 1.
                            // We want Forward AFTER ProgressControl, so at original index + 2.
                            const btnFwd = controlBar.addChild('button', {
                                controlText: `Forward ${skipTime}s`,
                                className: 'vjs-visible-text vjs-seek-button vjs-seek-forward',
                                clickHandler: () => {
                                    let newTime = player.currentTime() + skipTime;
                                    if (newTime > player.duration()) newTime = player.duration();
                                    player.currentTime(newTime);
                                }
                            }, progressIndex + 2);

                            btnFwd.el().innerHTML = `
                                <svg viewBox="0 0 24 24" fill="white" width="22" height="22" style="vertical-align: middle;">
                                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                                    <text x="12" y="16" font-size="8" fill="white" text-anchor="middle" font-weight="bold" style="text-shadow: 1px 1px 1px black;">${skipTime}</text>
                                </svg>`;

                            btnFwd.el().title = `Forward ${skipTime}s`;
                            btnFwd.el().style.cursor = "pointer";
                        }
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
                            btnDl.el().innerHTML = `
                                <svg viewBox="0 0 24 24" fill="white" width="22" height="22" style="vertical-align: middle;">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                </svg>`;
                            btnDl.el().title = "Download";
                            btnDl.el().style.cursor = "pointer";
                        }
                    });
                }

                // --- Feature 3: Hotkeys ---
                if (C.enableHotkeys) {
                    const handleKey = (e) => {
                        // Ignore if typing in an input
                        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

                        // Check if player is visible/active (simple check)
                        if (!player || player.isDisposed()) return;

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
                                player.currentTime(player.currentTime() - C.hotkeySeekStep);
                                break;
                            case 'ArrowRight':
                                e.preventDefault();
                                player.currentTime(player.currentTime() + C.hotkeySeekStep);
                                break;
                            case 'ArrowUp':
                                e.preventDefault();
                                player.volume(Math.min(player.volume() + C.hotkeyVolumeStep, 1));
                                break;
                            case 'ArrowDown':
                                e.preventDefault();
                                player.volume(Math.max(player.volume() - C.hotkeyVolumeStep, 0));
                                break;
                        }
                    };

                    // Attach to player.el() (The main Video.js div)
                    // We must wait for player to be ready or just attach now since initialized above
                    const el = player.el();
                    if (el) {
                        el.addEventListener('keydown', handleKey);
                        // Store handler for cleanup
                        player.on('dispose', () => {
                            el.removeEventListener('keydown', handleKey);
                        });
                    }
                }

                // --- Feature 4: Mobile Double-Tap Gestures ---
                if (C.enableDoubleTap) {
                    let lastTouchTime = 0;
                    const handleTouch = (e) => {
                        const now = Date.now();
                        // Double tap threshold: 300ms
                        if (now - lastTouchTime < 300) {
                            e.preventDefault(); // Prevent zoom/default browser actions

                            // Calculate touch position relative to the player
                            const touch = e.changedTouches[0];
                            let rect = e.currentTarget.getBoundingClientRect();

                            // Fallback: If player wrapper has 0 width (e.g. display issues), try the video element itself
                            if (rect.width === 0 && videoElementRef.current) {
                                rect = videoElementRef.current.getBoundingClientRect();
                            }

                            const x = touch.clientX - rect.left;
                            const width = rect.width;
                            const pct = x / width;

                            // Sanity check
                            if (width === 0) return;

                            const seekSeconds = C.doubleTapSeekSeconds;

                            if (pct < 0.3) {
                                // Left 30%: Rewind
                                let newTime = player.currentTime() - seekSeconds;
                                if (newTime < 0) newTime = 0;
                                player.currentTime(newTime);
                                HFS.toast(`Rewind ${seekSeconds}s`, "info");
                            } else if (pct > 0.7) {
                                // Right 30%: Forward
                                let newTime = player.currentTime() + seekSeconds;
                                if (newTime > player.duration()) newTime = player.duration();
                                player.currentTime(newTime);
                                HFS.toast(`Forward ${seekSeconds}s`, "info");
                            } else {
                                // Center 40%: Fullscreen Toggle
                                if (player.isFullscreen()) {
                                    player.exitFullscreen();
                                } else {
                                    player.requestFullscreen();
                                }
                                HFS.toast(player.isFullscreen() ? "Exit Fullscreen" : "Fullscreen", "info");
                            }
                        }
                        lastTouchTime = now;
                    };

                    const el = player.el();
                    if (el) {
                        el.style.touchAction = 'manipulation'; // Prevent double-tap to zoom
                        // Use capture phase to ensure we get the event before Video.js internals
                        const opts = { capture: true, passive: false };
                        el.addEventListener('touchend', handleTouch, opts);

                        player.on('dispose', () => {
                            el.removeEventListener('touchend', handleTouch, opts);
                        });
                    }
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
                    // Feature: Auto-Focus on Play
                    // Focus the vjs-tech (video element) with a slight delay
                    // Bubbling will allow player.el() listener to catch keydown
                    setTimeout(() => {
                        if (videoElementRef.current) {
                            videoElementRef.current.focus();
                        }
                    }, 50);

                    // Check for hidden HEVC playback failure (Audio plays, Video is 0x0)

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
                                handlePlaybackError(player, "HEVC video is not supported by your browser.");
                            }
                        }
                    }, 1000);
                });

                // Persistence Listeners
                if (C.persistentVolume) {
                    player.on('volumechange', () => {
                        // debounce slightly or just save? volumechange fires rapidly. LocalStorage is sync but fast enough.
                        localStorage.setItem('vjs-volume-level', player.volume());
                    });
                }

                if (C.resumePlayback) {
                    // Save progress every few seconds
                    // Throttle manually or just use timeupdate (fires 3-4 times a second)
                    // We can save every second.
                    let lastSave = 0;
                    player.on('timeupdate', () => {
                        const now = Date.now();
                        if (now - lastSave > 2000) {
                            const cur = player.currentTime();
                            const dur = player.duration();
                            // Don't save if near end
                            if (cur > 0 && (!dur || (dur - cur > 10))) {
                                const src = player.currentSrc();
                                if (src) {
                                    const key = `vjs-resume-${src.split('/').pop()}`;
                                    localStorage.setItem(key, cur.toFixed(1));
                                }
                            }
                            lastSave = now;
                        }
                    });
                }

                // Feature: Auto-Rotate on Mobile Fullscreen
                player.on('fullscreenchange', () => {
                    if (C.autoRotate && screen.orientation && screen.orientation.lock) {
                        if (player.isFullscreen()) {
                            // Only rotate if video is wider than tall (Landscape-ish)
                            const vidW = player.videoWidth();
                            const vidH = player.videoHeight();
                            if (vidW > vidH) {
                                screen.orientation.lock("landscape").catch((err) => {
                                    // Expected on desktop or unsupported devices, silent ignore
                                    // console.log("Orientation lock failed:", err);
                                });
                            }
                        } else {
                            screen.orientation.unlock();
                        }
                    }
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
                    if (C.resumePlayback) {
                        const src = player.currentSrc();
                        if (src) {
                            const key = `vjs-resume-${src.split('/').pop()}`;
                            localStorage.removeItem(key);
                        }
                    }
                    if (props.onEnded) props.onEnded();
                    dummyVideo.dispatchEvent(new Event('ended'));
                });
                player.on('error', () => {
                    // Intercept generic errors
                    const code = player.error() ? player.error().code : 0;
                    if (code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
                        handlePlaybackError(player, "The media could not be loaded, either because the server or network failed or because the format is not supported.");
                        return;
                    }
                    if (props.onError) props.onError(player.error());
                });

                return () => {
                    // Note: wrapper listeners (on containerRef) removed automatically by React unmount?
                    // No, manual ones on containerRef needs removal if attached there.
                    // But we moved them to player.el() which is disposed by player.dispose() -> player.on('dispose', ...) logic covers it.
                    // However, just in case logic fails or we need cleaner unmount:

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

                // Reset conversion mode when src changes to a new file
                if (props.src) {
                    const currentSrc = player && player.currentSrc();
                    // If the base src is different, reset conversion
                    if (currentSrc && !currentSrc.includes(encodeURI(props.src))) {
                        setConversionMode(false);
                        isConvertingRef.current = false;
                    }
                }

                if (player && props.src) {
                    const suffix = conversionMode ? '?ffmpeg' : '';
                    const targetSrc = props.src + suffix;
                    const currentSrc = player.currentSrc();

                    const needsUpdate = !currentSrc || !currentSrc.includes(encodeURI(targetSrc));

                    if (needsUpdate) {
                        console.log(`VideoJS Plugin: Loading ${conversionMode ? 'CONVERTED' : 'STANDARD'} source:`, targetSrc);
                        player.src({
                            src: targetSrc,
                            type: conversionMode ? 'video/mp4' : determineMimeType(props.src)
                        });

                        hevcErrorShownRef.current = false;
                        attemptResume(props.src);

                        if (C.autoplay || conversionMode) {
                            const p = player.play();
                            if (p && p.catch) p.catch(e => console.warn("Auto-play blocked:", e));
                        }
                    }
                }
            }, [props.src, conversionMode]);

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
