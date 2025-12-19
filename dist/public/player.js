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
            enableScrollVolume: rawConfig.enableScrollVolume ?? true,
            enablePiP: rawConfig.enablePiP ?? true,
            doubleTapSeekSeconds: parseInt(rawConfig.doubleTapSeekSeconds) || 10,
            doubleTapSeekSeconds: parseInt(rawConfig.doubleTapSeekSeconds) || 10,
            errorStyle: rawConfig.errorStyle || 'overlay',
            theme: rawConfig.theme || 'default',
            inactivityTimeout: parseInt(rawConfig.inactivityTimeout) || 2000,
            enable_ffmpeg_transcoding: rawConfig.enable_ffmpeg_transcoding ?? false,
            enableAudio: rawConfig.enableAudio ?? false,
            enableSubtitlePluginIntegration: rawConfig.enableSubtitlePluginIntegration ?? true,

        };

        const VIDEO_EXTS = ['.mp4', '.webm', '.ogv', '.mov'];
        const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

        function determineMimeType(src) {
            const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
            if (ext === '.webm') return 'video/webm';
            if (ext === '.ogv' || ext === '.ogg') return 'video/ogg';
            if (ext === '.mp3') return 'audio/mpeg';
            if (ext === '.wav') return 'audio/wav';
            if (ext === '.m4a') return 'audio/mp4';
            if (ext === '.aac') return 'audio/aac';
            if (ext === '.flac') return 'audio/flac';

            if (C.enableHLS) {
                if (ext === '.mkv')
                    return 'video/webm'; // Trick for MKV
                if (ext === '.m3u8')
                    return 'application/x-mpegURL'; // HLS
            }
            return 'video/mp4';
        }

        /**
         * Video.js Player Component
         * Wraps the Video.js library in a React component.
         */
        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);
            const dummyVideoRef = React.useRef(null); // PROXY for HFS Play Next
            const errorShownRef = React.useRef(false);
            const hevcTimeoutRef = React.useRef(null);

            // --- Helper: Handle Playback Error (Conversion Integration) ---
            const [conversionMode, setConversionMode] = React.useState(false);
            const isConvertingRef = React.useRef(false);
            const [seekOffset, setSeekOffset] = React.useState(0);  // Track virtual start time for transcoding

            const [overlayState, setOverlayState] = React.useState(null); // { message, type, show }

            // Calculate styles for Render
            let cssClasses = 'video-js vjs-big-play-centered';
            if (C.theme !== 'default') {
                cssClasses += ` vjs-theme-${C.theme}`;
            }
            const videoStyle = {};
            if (C.sizingMode === 'fill') {
                videoStyle.objectFit = 'cover';
            }

            // --- Helper: Notification System (Toast vs Overlay) ---
            const notify = (player, message, type = 'info', duration = 2000) => {
                if (C.errorStyle === 'toast') {
                    if (HFS && HFS.toast) {
                        HFS.toast(message, type);
                    }
                } else {
                    // State-based Overlay
                    setOverlayState({ message, type, show: true });

                    if (duration > 0) {
                        setTimeout(() => {
                            // Only hide if it matches the current message (simple check) to avoid race conditions hiding new errors 
                            // Actually a simple timeout is fine for now, or use a ref to track active timeout ID.
                            setOverlayState(prev => prev && prev.message === message ? { ...prev, show: false } : prev);
                        }, duration);
                    }
                }
            };

            // --- Helper: Handle Playback Error (Conversion Integration) ---
            const handlePlaybackError = (player, message = "Video format not supported.") => {
                // Check if integration is enabled
                if (C.enable_ffmpeg_transcoding) {
                    // Check if we already attempted conversion (via Ref to avoid closure staleness)
                    if (!isConvertingRef.current) {
                        // Attempt to switch to conversion stream
                        console.log("[VideoJS] Unsupported video detected. Switching to streaming conversion...");
                        notify(player, "Unsupported format. Attempting conversion...", "info", 3000);

                        // Capture duration to persist it (since stream won't have it)
                        const d = player.duration();
                        if (d && d > 0 && d !== Infinity) {
                            window._vjs_saved_duration = d;
                            console.log("[VideoJS] Saved duration for transcoding:", d);
                        }

                        isConvertingRef.current = true;
                        setConversionMode(true);
                        return;
                    } else {
                        // Already using ffmpeg, so conversion failed or timed out
                        console.error("[VideoJS] Streaming conversion failed or timed out.");
                    }
                }

                // --- Helper: UI State for Transcoding is handled by the useEffect below ---


                // Fallback to standard error handling
                let displayMessage = message;
                if (message.includes("The media could not be loaded")) {
                    displayMessage = "Playback Failed: Format not supported or network error.";
                }

                // If converting failed, append info
                if (isConvertingRef.current) {
                    displayMessage += " (Conversion failed)";
                }

                if (!errorShownRef.current) {
                    notify(player, displayMessage, "error", 0); // Persistent
                    errorShownRef.current = true;
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
                                notify(p, `Resumed at ${Math.round(t)}s`, "info", 2000);
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
                if (!window._videoConfigLogged) {
                    console.log("VideoJS Plugin: Mounted with config:", C);
                    window._videoConfigLogged = true;
                }

                const videoElement = videoElementRef.current;
                const dummyVideo = dummyVideoRef.current;

                if (!videoElement || !dummyVideo) return; // Should not happen

                // --- Inject Custom Styles for Audio Mode ---
                if (!document.getElementById('vjs-custom-styles')) {
                    const style = document.createElement('style');
                    style.id = 'vjs-custom-styles';
                    style.innerHTML = `
                        .vjs-audio-mode { background-color: transparent !important; }
                        .vjs-audio-mode .vjs-tech { display: none; }
                        .vjs-audio-mode .vjs-poster { display: none; }
                        .vjs-audio-mode .vjs-big-play-button { display: none; }
                        .vjs-audio-mode .vjs-control-bar { 
                            display: flex !important; 
                            visibility: visible !important; 
                            opacity: 1 !important; 
                            background-color: rgba(0,0,0,0.5); 
                            border-radius: 8px;
                        }
                    `;
                    document.head.appendChild(style);
                }

                // --- Dummy Video Settings ---
                // Monkey patch play to satisfy HFS checking
                dummyVideo.play = () => Promise.resolve();

                // Parse playback rates
                const rates = C.playbackRates.split(',').map(r => parseFloat(r.trim())).filter(n => !isNaN(n));

                // Determine Video.js sizing options
                const mode = C.sizingMode;
                const isFluid = mode === 'fluid';
                const isFill = mode === 'fill';

                // Detect Audio Mode
                const isAudio = C.enableAudio && (
                    determineMimeType(props.src || '').startsWith('audio/') ||
                    AUDIO_EXTS.some(ext => (props.src || '').toLowerCase().endsWith(ext))
                );

                // Initialize Video.js
                // Pass existing element ref
                const player = videojs(videoElement, {
                    controls: C.controls,
                    autoplay: C.autoplay,
                    loop: C.loop,
                    muted: C.muted,
                    preload: C.preload,
                    fluid: isFluid && !isAudio, // Audio shouldn't be fluid (usually)
                    fill: isFill && !isAudio,
                    height: isAudio ? 50 : undefined,
                    playbackRates: rates.length ? rates : [0.5, 1, 1.5, 2],
                    inactivityTimeout: C.inactivityTimeout,
                    controlBar: {
                        pictureInPictureToggle: C.enablePiP && !isAudio,
                        fullscreenToggle: !isAudio
                    },
                    userActions: {
                        hotkeys: false // We handle our own
                    },
                    sources: [] // Initialize empty
                });
                playerRef.current = player;

                if (isAudio) {
                    player.addClass('vjs-audio-mode');
                    // Force height
                    player.height(50);
                }

                // Attempt to load sidecar subtitle (blind guess)
                // We guess format .vtt or .srt (VideoJS mainly supports VTT natively, others maybe with plugins)
                // But let's try VTT first.


                // Ensure player wrapper is focusable for hotkeys
                const playerEl = player.el();
                if (playerEl) {
                    playerEl.tabIndex = 0;
                }

                // Set Volume and optional Persistence (Set immediately to update UI)
                let startVolume = C.volume;
                if (C.persistentVolume) {
                    const savedVol = localStorage.getItem('vjs-volume-level');
                    if (savedVol !== null) {
                        startVolume = parseFloat(savedVol);
                    }
                }
                player.volume(startVolume);

                player.ready(() => {
                    // Ready listeners if any (Volume set above)
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
                            // Find FullscreenToggle to insert before it
                            const fsToggle = controlBar.getChild('FullscreenToggle');
                            const insertIndex = fsToggle ? controlBar.children().indexOf(fsToggle) : undefined;

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
                            }, insertIndex);

                            // Use a standard download icon if available or text
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
                                if (player.paused()) {
                                    player.play();
                                    notify(player, "Play", "info", 500);
                                } else {
                                    player.pause();
                                    notify(player, "Pause", "info", 500);
                                }
                                break;
                            case 'f':
                            case 'F':
                                e.preventDefault();
                                if (player.isFullscreen()) {
                                    player.exitFullscreen();
                                } else {
                                    player.requestFullscreen();
                                }
                                break;
                            case 'm':
                            case 'M':
                                e.preventDefault();
                                player.muted(!player.muted());
                                notify(player, player.muted() ? "Muted" : "Unmuted", "info", 1000);
                                break;
                            case 'p':
                            case 'P':
                                e.preventDefault();
                                if (document.pictureInPictureElement) {
                                    document.exitPictureInPicture();
                                } else if (player.videoWidth() > 0) {
                                    player.requestPictureInPicture();
                                }
                                break;
                            case 'ArrowLeft':
                                e.preventDefault();
                                player.currentTime(player.currentTime() - C.hotkeySeekStep);
                                notify(player, `Rewind ${C.hotkeySeekStep}s`, "info", 500);
                                break;
                            case 'ArrowRight':
                                e.preventDefault();
                                player.currentTime(player.currentTime() + C.hotkeySeekStep);
                                notify(player, `Forward ${C.hotkeySeekStep}s`, "info", 500);
                                break;
                            case 'ArrowUp':
                                e.preventDefault();
                                {
                                    const v = Math.min(player.volume() + C.hotkeyVolumeStep, 1);
                                    player.volume(v);
                                    notify(player, `Volume: ${Math.round(v * 100)}%`, "info", 500);
                                }
                                break;
                            case 'ArrowDown':
                                e.preventDefault();
                                {
                                    const v = Math.max(player.volume() - C.hotkeyVolumeStep, 0);
                                    player.volume(v);
                                    notify(player, `Volume: ${Math.round(v * 100)}%`, "info", 500);
                                }
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
                                notify(player, `Rewind ${seekSeconds}s`, "info", 1000);
                            } else if (pct > 0.7) {
                                // Right 30%: Forward
                                let newTime = player.currentTime() + seekSeconds;
                                if (newTime > player.duration()) newTime = player.duration();
                                player.currentTime(newTime);
                                notify(player, `Forward ${seekSeconds}s`, "info", 1000);
                            } else {
                                // Center 40%: Fullscreen Toggle
                                if (player.isFullscreen()) {
                                    player.exitFullscreen();
                                } else {
                                    player.requestFullscreen();
                                }
                                // notify(player, player.isFullscreen() ? "Full Screen" : "Windowed", 'info', 1000);
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

                // --- Feature 5: Scroll for Volume ---
                if (C.enableScrollVolume) {
                    const handleWheel = (e) => {
                        // Only handle vertical scroll
                        if (e.deltaY === 0) return;

                        e.preventDefault();

                        // Determine direction
                        const step = C.hotkeyVolumeStep;
                        const currentVol = player.volume();
                        let newVol = currentVol;

                        if (e.deltaY < 0) {
                            // Scroll Up -> Increase Volume
                            newVol = Math.min(currentVol + step, 1);
                        } else {
                            // Scroll Down -> Decrease Volume
                            newVol = Math.max(currentVol - step, 0);
                        }

                        if (newVol !== currentVol) {
                            player.volume(newVol);
                            player.userActive(true); // Wake up controls so volume bar is seen
                            notify(player, `Volume: ${Math.round(newVol * 100)}%`, "info", 500);
                        }
                    };

                    const el = player.el();
                    if (el) {
                        el.addEventListener('wheel', handleWheel, { passive: false });
                        player.on('dispose', () => {
                            el.removeEventListener('wheel', handleWheel);
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

                // --- Helper: Debounce ---
                const debounce = (func, wait) => {
                    let timeout;
                    return (...args) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => func.apply(this, args), wait);
                    };
                };

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

                const debouncedResize = debounce(resizePlayer, 200);

                // Listeners for resizing
                player.on('loadedmetadata', resizePlayer); // Immediate on load
                player.on('loadedmetadata', () => {
                    if (props.onLoad) props.onLoad();
                });

                window.addEventListener('resize', debouncedResize);
                setTimeout(resizePlayer, 100);

                // Feature: Auto-Focus on Play
                player.on('playing', () => {
                    setTimeout(() => {
                        if (videoElementRef.current) {
                            videoElementRef.current.focus();
                        }
                    }, 50);
                    checkHevc();
                });

                // Helper: Check for HEVC failure faster
                const checkHevc = () => {
                    if (!player || (player.isDisposed && player.isDisposed()) || player.ended()) return;

                    // Don't check if we are already converting
                    if (isConvertingRef.current) return;

                    const w = player.videoWidth();
                    const h = player.videoHeight();
                    const currentSrc = player.currentSrc();
                    const isVideo = currentSrc ? determineMimeType(currentSrc).startsWith('video/') : false;

                    // Browser support check
                    const hevcSupported = videoElement.canPlayType('video/mp4; codecs="hvc1"') !== "" ||
                        videoElement.canPlayType('video/mp4; codecs="hev1"') !== "";

                    // Condition 2: Dimensions are 0x0 while playing (classic hevc black screen)
                    if (isVideo && (w === 0 || h === 0)) {
                        // Retry briefly to be sure it's not just loading
                        if (hevcTimeoutRef.current) clearTimeout(hevcTimeoutRef.current);
                        hevcTimeoutRef.current = setTimeout(() => {
                            if (player.videoWidth() === 0) {
                                handlePlaybackError(player, "HEVC/Unsupported format detected. Audio may still play.");
                            }
                        }, 250); // Fast check (was 1000)
                    }
                };

                player.on('loadedmetadata', checkHevc);

                // Persistence Listeners
                if (C.persistentVolume) {
                    let lastVolSave = 0;
                    player.on('volumechange', () => {
                        const now = Date.now();
                        if (now - lastVolSave > 1000) {
                            localStorage.setItem('vjs-volume-level', player.volume());
                            lastVolSave = now;
                        }
                    });
                }

                if (C.resumePlayback) {
                    // Save progress every few seconds
                    // Throttle manually or just use timeupdate (fires 3-4 times a second)
                    // We can save every second.
                    let lastSave = 0;
                    player.on('timeupdate', () => {
                        // DISABLE RESUME SAVE FOR TRANSCODING
                        if (isConvertingRef.current) return;

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
                    setOverlayState(prev => (prev && prev.type === 'error') ? { ...prev, show: false } : prev);

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

                    // Dispatch ended on proxy for HFS
                    if (dummyVideoRef.current) {
                        dummyVideoRef.current.dispatchEvent(new Event('ended'));
                    }
                });
                player.on('error', () => {
                    // Intercept generic errors
                    const code = player.error() ? player.error().code : 0;
                    if (code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
                        player.error(null); // Dismiss default error to prevent blocking interaction
                        handlePlaybackError(player, "The media could not be loaded, either because the server or network failed or because the format is not supported.");
                        return;
                    }
                    if (props.onError) props.onError(player.error());
                });

                return () => {
                    // Cleanup
                    if (videoElementRef.current && document.pictureInPictureElement === videoElementRef.current) {
                        try {
                            // document.exitPictureInPicture(); // DISABLED per user request
                        } catch (e) {
                            // ignore
                        }
                    }
                    if (hevcTimeoutRef.current) clearTimeout(hevcTimeoutRef.current);
                    window.removeEventListener('resize', debouncedResize);
                    if (player) player.dispose();
                    // React removes the video elements automatically since we render them
                };
            }, []);


            React.useEffect(() => {
                const player = playerRef.current;

                // Reset conversion mode when src changes to a new file
                if (props.src) {
                    const currentSrc = player && player.currentSrc();
                    // If the base src is different, reset conversion
                    // Use decodeURI to ensure safe comparison regardless of encoding (fixes infinite loop on files with spaces)
                    if (currentSrc && !decodeURI(currentSrc).includes(decodeURI(props.src))) {
                        setConversionMode(false);
                        isConvertingRef.current = false;
                        setSeekOffset(0);
                    }
                }

                if (player && props.src) {
                    let suffix = '';
                    if (conversionMode) {
                        suffix = '?ffmpeg';
                        if (seekOffset > 0) {
                            suffix += `&startTime=${seekOffset}`;
                        }
                    }

                    const targetSrc = props.src + suffix;

                    // Robust check: matches if absolute paths match OR if currentSrc strings match
                    // We decode both to be safe against browser encoding differences (e.g. %20 vs space)
                    const currentSrc = player.currentSrc();
                    const decodedCurrent = currentSrc ? decodeURI(currentSrc) : '';
                    const decodedTarget = decodeURI(targetSrc);

                    // Update if first load (!currentSrc) or if URL has changed
                    const needsUpdate = !currentSrc || !decodedCurrent.includes(decodedTarget);

                    if (needsUpdate) {
                        console.log(`VideoJS Plugin: Switch Source -> ${targetSrc} (Offset: ${seekOffset})`);

                        // Clear previous errors/overlays
                        setOverlayState(null);
                        errorShownRef.current = false;

                        player.src({
                            src: targetSrc,
                            type: conversionMode ? 'video/mp4' : determineMimeType(props.src)
                        });

                        // Don't resume playback for converted streams as seeking is disabled
                        if (!conversionMode) {
                            attemptResume(props.src);
                        }

                        if (C.autoplay || conversionMode) {
                            const p = player.play();
                            if (p && p.catch) {
                                p.catch(e => {
                                    // Ignore errors if we are converting (since we expect an abort on switch)
                                    if (isConvertingRef.current) return;

                                    console.warn("Auto-play blocked:", e);
                                    if (!player.paused()) {
                                        // It thinks it's playing?
                                    } else {
                                        notify(player, "Click to Play (Autoplay Blocked)", "info", 0); // 0 = persistent
                                    }
                                });
                            }
                        }

                        // Restore duration for seeking UI if we saved it
                        if (conversionMode && window._vjs_saved_duration) {
                            player.one('loadedmetadata', () => {
                                console.log("[VideoJS] Restoring duration:", window._vjs_saved_duration);
                                player.duration(window._vjs_saved_duration);
                            });
                        }
                    }
                }

                // Listen for seeking in conversion mode to trigger virtual seek (reload)
                if (conversionMode) {
                    const handleSeeking = () => {
                        const currentTime = player.currentTime();
                        console.log("[VideoJS] Seeking event detected. Time:", currentTime);

                        // Ignore seek to near 0 (initial load often triggers seek to 0)
                        if (currentTime < 1) return;

                        // Debounce seek
                        if (player._seekTimeout) clearTimeout(player._seekTimeout);
                        player._seekTimeout = setTimeout(() => {
                            console.log("[VideoJS] Seek Timeout Executing. CurrentTime:", currentTime, "Old Offset:", seekOffset);
                            const newOffset = seekOffset + currentTime;
                            setSeekOffset(newOffset);
                            notify(player, `Seeking to ${Math.round(newOffset)}s...`, "info", 2000);
                        }, 600);
                    };

                    console.log("[VideoJS] Attaching seek listener via useEffect");
                    player.on('seeking', handleSeeking);
                    return () => {
                        console.log("[VideoJS] Detaching seek listener");
                        player.off('seeking', handleSeeking);
                        if (player._seekTimeout) clearTimeout(player._seekTimeout);
                    };
                }

            }, [props.src, conversionMode, seekOffset]);

            // Clear timeout on unmount
            React.useEffect(() => {
                return () => {
                    if (playerRef.current && playerRef.current._seekTimeout) {
                        clearTimeout(playerRef.current._seekTimeout);
                    }
                };
            }, []);



            // Render with valid Structure
            if (!props.src) {
                return h('div', {
                    style: {
                        width: '100%', height: '100%', minHeight: '150px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#000', color: '#666', fontFamily: 'sans-serif'
                    }
                }, "No Video Selected");
            }

            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: { display: 'contents', position: 'relative' } // Ensure relative for overlay
            }, [
                h('video', {
                    ref: videoElementRef,
                    className: cssClasses,
                    style: videoStyle,
                    tabIndex: 0
                }, props.children),
                // React-Native Overlay Component (Integrated)
                (overlayState && overlayState.show) ? h('div', {
                    className: 'vjs-custom-overlay',
                    style: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 99,
                        textAlign: 'center',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontFamily: 'sans-serif',
                        transition: 'opacity 0.3s ease',
                        opacity: 1,
                        backgroundColor: overlayState.type === 'error' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)',
                        color: overlayState.type === 'error' ? '#ff6b6b' : '#fff',
                        border: overlayState.type === 'error' ? '1px solid #ff6b6b' : 'none',
                        fontSize: overlayState.type === 'error' ? '1.1em' : '1.2em',
                        maxWidth: overlayState.type === 'error' ? '80%' : 'auto'
                    }
                }, [
                    overlayState.type === 'error' ? h('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, 'Error') : null,
                    h('div', {}, overlayState.message)
                ]) : null,

                // Dummy video for HFS (Hidden)
                h('video', {
                    ref: dummyVideoRef,
                    className: 'showing',
                    style: { display: 'none' }
                })
            ]);
        });
        HFS.onEvent('fileShow', (params) => {
            const { entry } = params;
            // Use the top-level captured config
            const enableHLS = C.enableHLS;

            const ext = entry.n.substring(entry.n.lastIndexOf('.')).toLowerCase();

            // Check extensions
            if (!VIDEO_EXTS.includes(ext)) {
                // Check Audio
                if (C.enableAudio && AUDIO_EXTS.includes(ext)) {
                    // Allowed
                }
                // If not in standard list, check if HLS allows it
                else if (!enableHLS || (ext !== '.m3u8' && ext !== '.mkv')) {
                    return;
                }
            }
            // Integration with HFS-Subtitles
            // We only wrap if enabled and the API exists
            const ComponentToUse = (C.enableSubtitlePluginIntegration && HFS.markVideoComponent)
                ? HFS.markVideoComponent(VideoJsPlayer)
                : VideoJsPlayer;

            params.Component = ComponentToUse;
        });
    } else {
        console.error("VideoJS Plugin: React/Preact not found on window or HFS. Plugin execution aborted.");
    }
}
