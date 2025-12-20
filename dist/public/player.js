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
            enable_transcoding_seeking: rawConfig.enable_transcoding_seeking ?? false,
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


        // --- Assets ---
        const SVGs = {
            download: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
            search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
        };

        // --- Helper: Mobile Gestures Setup ---
        const setupMobileGestures = (player, notify, videoElementRef) => {
            const { enableDoubleTap, doubleTapSeekSeconds } = C;
            if (!player || !enableDoubleTap) return;

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

                    const seekSeconds = doubleTapSeekSeconds;

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
        };

        // --- Helper: Hotkeys Setup ---
        const setupHotkeys = (player, notify) => {
            const { enableHotkeys, hotkeySeekStep, hotkeyVolumeStep } = C;
            if (!player || !enableHotkeys) return;

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
                        player.currentTime(player.currentTime() - hotkeySeekStep);
                        notify(player, `Rewind ${hotkeySeekStep}s`, "info", 500);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        player.currentTime(player.currentTime() + hotkeySeekStep);
                        notify(player, `Forward ${hotkeySeekStep}s`, "info", 500);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        {
                            const v = Math.min(player.volume() + hotkeyVolumeStep, 1);
                            player.volume(v);
                            notify(player, `Volume: ${Math.round(v * 100)}%`, "info", 500);
                        }
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        {
                            const v = Math.max(player.volume() - hotkeyVolumeStep, 0);
                            player.volume(v);
                            notify(player, `Volume: ${Math.round(v * 100)}%`, "info", 500);
                        }
                        break;
                }
            };

            // Attach to player.el() (The main Video.js div)
            const el = player.el();
            if (el) {
                el.addEventListener('keydown', handleKey);
                // Store handler for cleanup
                player.on('dispose', () => {
                    el.removeEventListener('keydown', handleKey);
                });
            }
        };

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
            const isAbsoluteTimestampRef = React.useRef(false); // Detects if browser respected -copyts

            const [overlayState, setOverlayState] = React.useState(null); // { message, type, show }

            // Calculate styles for Render
            let cssClasses = 'video-js vjs-big-play-centered';
            if (C.theme !== 'default') {
                cssClasses += ` vjs-theme-${C.theme}`;
            }

            // --- STYLE CALCULATION ---
            // Hoisted to top so useEffect can access it for manual DOM creation.

            const mode = C.sizingMode;
            const isAudioRender = C.enableAudio && (
                determineMimeType(props.src).startsWith('audio/') ||
                AUDIO_EXTS.some(ext => props.src.toLowerCase().endsWith(ext))
            );

            let containerStyle = {
                // Default relative for Block/Inline-Block modes
                position: 'relative'
            };

            // Calculated Video Element Style (The actual player box)
            const videoStyleOverride = {};

            if (isAudioRender) {
                // AUDIO: Unified "Black Box" Layout
                // User requested to apply 'Fixed' logic (black box + full fill) to all audio modes.

                // Common Audio Styles
                containerStyle.backgroundColor = '#000';
                containerStyle.position = 'relative';

                // Force player element to fill the black box
                videoStyleOverride.width = '100%';
                videoStyleOverride.height = '100%';
                videoStyleOverride.pointerEvents = 'auto';

                if (mode === 'fixed') {
                    // Fixed: Respect explicit dimensions
                    containerStyle.display = 'inline-block';
                    // We must ensure the strings are valid numbers for CSS
                    const fw = C.fixedWidth || 0;
                    const fh = C.fixedHeight || 0;
                    if (fw > 0) containerStyle.width = `${fw}px`;
                    if (fh > 0) containerStyle.height = `${fh}px`;

                    console.log(`VideoJS Audio Fixed: ${fw}x${fh}`);
                } else {
                    // Fluid / Fill / Native: Fill the parent container
                    // User wants "bottom alignment", which VJS handles naturally if given 100% height of a container.
                    containerStyle.display = 'block';
                    containerStyle.width = '100%';
                    containerStyle.height = '100%';
                }

            } else {
                // VIDEO MODES
                switch (mode) {
                    case 'native':
                        // Native: Intrinsic video size, but FULL width/height Player Wrapper (to put controls at bottom)
                        // Video uses absolute positioning to center itself and flow freely (overflow allowed).
                        containerStyle.display = 'block';
                        containerStyle.width = '100%';
                        containerStyle.height = '100%';

                        // Video Override: Intrinsic size, Center, Overflow
                        videoStyleOverride.width = 'auto';
                        videoStyleOverride.height = 'auto';
                        videoStyleOverride.maxWidth = 'none';
                        videoStyleOverride.maxHeight = 'none';
                        videoStyleOverride.position = 'absolute';
                        videoStyleOverride.top = '50%';
                        videoStyleOverride.left = '50%';
                        videoStyleOverride.transform = 'translate(-50%, -50%)';
                        videoStyleOverride.pointerEvents = 'auto';
                        break;

                    case 'fluid':
                        // Fluid: "Good" - display: contents
                        containerStyle.display = 'contents';
                        break;

                    case 'fill':
                        // Fill: "Good" - Block 100%
                        containerStyle.display = 'block';
                        containerStyle.width = '100%';
                        containerStyle.height = '100%';
                        // Video Override
                        videoStyleOverride.width = '100%';
                        videoStyleOverride.height = '100%';
                        videoStyleOverride.objectFit = 'cover';
                        break;

                    case 'fixed':
                    default:
                        // Fixed: "Good" - Inline-Block (Standard)
                        containerStyle.display = 'inline-block';
                        break;
                }
            }

            const videoStyle = {
                // Base styles, mostly handled by overrides now, but kept for legacy
            };


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

                // Video.js generic error mapping
                if (message.includes("The media could not be loaded")) {
                    displayMessage = "Playback Failed: Network error or Format not supported.";
                }

                // If converting failed, append info
                if (isConvertingRef.current) {
                    displayMessage = "Transcoding Failed: Server could not process video.";
                    // Async check for rate limits (503)
                    fetch(player.currentSrc(), { method: 'HEAD' }).then(res => {
                        if (res.status === 503 && res.headers.get('X-Transcode-Reason') === 'global_limit') {
                            notify(player, "Service Unavailable: Too many users transcoding (Limit Reached).", "error", 0);
                        }
                    }).catch(e => console.warn("[VideoJS] Error check failed:", e));
                }

                if (!errorShownRef.current) {
                    notify(player, displayMessage, "error", 0); // Persistent
                    errorShownRef.current = true;
                }
            };

            // --- Helper: Resume Playback ---
            const hasResumedRef = React.useRef(false);

            const attemptResume = (src) => {
                if (!C.resumePlayback || !src) return;
                if (hasResumedRef.current) return;

                const resumeKey = `vjs-resume-${src.split('/').pop()}`;
                const savedTime = localStorage.getItem(resumeKey);

                if (savedTime) {
                    const t = parseFloat(savedTime);
                    if (!isNaN(t) && t > 1) {

                        // HEADACHE: Disable resume for transcoding
                        if (conversionMode) {
                            console.log("[VideoJS] Resume skipped for transcoding.");
                            notify(playerRef.current, "Resume disabled for converted video", "info", 3000);
                            hasResumedRef.current = true;
                            return;
                        }


                        const applyResume = () => {
                            const p = playerRef.current;
                            if (!p) return;
                            const dur = p.duration();
                            if (!dur || (dur - t > 5)) {
                                p.currentTime(t);
                                notify(p, `Resumed at ${Math.round(t)}s`, "info", 2000);
                                hasResumedRef.current = true;
                            }
                        };

                        const p = playerRef.current;
                        if (p) {
                            if (p.readyState() > 0) applyResume();
                            else p.one('loadedmetadata', applyResume);
                        }
                    } else {
                        hasResumedRef.current = true;
                    }
                } else {
                    hasResumedRef.current = true;
                }
            };

            React.useEffect(() => {
                if (!window._videoConfigLogged) {
                    console.log("VideoJS Plugin: Mounted with config:", C);
                    window._videoConfigLogged = true;
                }

                // --- MANUAL DOM MANAGEMENT FOR VIDEO ELEMENT ---
                // We create the video element manually to prevent React from reconciling it and stripping classes/styles
                // that Video.js adds (like vjs-audio-mode, vjs-playing, etc).
                if (!videoElementRef.current && containerRef.current) {
                    const vid = document.createElement('video');

                    // Apply initial props
                    vid.className = cssClasses;
                    Object.assign(vid.style, videoStyle, videoStyleOverride); // Apply calculated styles immediately
                    vid.tabIndex = 0;

                    // Append to container
                    containerRef.current.appendChild(vid);
                    videoElementRef.current = vid;

                    // Forward Ref if provided
                    if (ref) {
                        if (typeof ref === 'function') ref(vid);
                        else if (ref.hasOwnProperty('current')) ref.current = vid;
                    }
                }

                const videoElement = videoElementRef.current;
                const dummyVideo = dummyVideoRef.current;

                if (!videoElement || !dummyVideo) return; // Should not happen

                // --- Inject Custom Styles for Audio Mode ---
                // Always update styles to ensure latest CSS is applied (fixes SPA navigation issues)
                let styleEl = document.getElementById('vjs-custom-styles');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'vjs-custom-styles';
                    document.head.appendChild(styleEl);
                }
                styleEl.innerHTML = `
                    /* converting overlay */
                    .vjs-converting::after {
                        content: "Transcoding Media...";
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-family: sans-serif;
                        font-size: 14px;
                        z-index: 99;
                        pointer-events: none;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    /* Simple Spinner */
                    .vjs-converting::before {
                        content: "";
                        position: absolute;
                        top: 40%; 
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 24px;
                        height: 24px;
                        border: 3px solid #fff;
                        border-bottom-color: transparent;
                        border-radius: 50%;
                        animation: vjs-spin 1s linear infinite;
                        z-index: 100;
                    }
                    @keyframes vjs-spin {
                        0% { transform: translate(-50%, -50%) rotate(0deg); }
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
                    }

                    /* Native Mode: Force Control Bar to Bottom */
                    .vjs-native-mode .vjs-control-bar {
                        position: absolute !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        z-index: 101 !important; /* Ensure above video if active */
                    }
                `;

                // --- Dummy Video Settings ---
                // Monkey patch play to satisfy HFS checking
                dummyVideo.play = () => Promise.resolve();

                // Parse playback rates
                const rates = C.playbackRates.split(',').map(r => parseFloat(r.trim())).filter(n => !isNaN(n));

                // Determine Video.js sizing options
                // `mode` and `isAudioRender` are now defined at the top of the component.

                console.log(`VideoJS Mount: isAudio=${isAudioRender}, Poster=${props.poster}`);


                // Initialize Video.js
                // Pass existing element ref
                const player = videojs(videoElement, {
                    controls: C.controls,
                    autoplay: C.autoplay,
                    loop: C.loop,
                    muted: C.muted,
                    preload: C.preload,
                    fluid: mode === 'fluid' && !isAudioRender, // Initial fluid state
                    fill: (mode === 'fill' || mode === 'native') && !isAudioRender, // Native also needs full-size wrapper for control bar placement
                    height: isAudioRender ? 50 : undefined,
                    playbackRates: rates.length ? rates : [0.5, 1, 1.5, 2],
                    inactivityTimeout: isAudioRender ? 0 : C.inactivityTimeout, // Always show controls for Audio
                    controlBar: {
                        pictureInPictureToggle: C.enablePiP, // Always enable, hide via CSS
                        fullscreenToggle: true             // Always enable, hide via CSS
                    },
                    userActions: {
                        hotkeys: false // We handle our own
                    },
                    sources: [] // Initialize empty
                });
                playerRef.current = player;

                // Call Custom Setup Helpers
                setupMobileGestures(player, notify, videoElementRef);
                setupHotkeys(player, notify);

                if (isAudioRender) {
                    player.addClass('vjs-audio-mode');
                    // Force height
                    player.height(50);
                }

                // Native Mode Overflow Fix
                if (mode === 'native') {
                    player.addClass('vjs-native-mode'); // Enable custom CSS for bottom alignment
                    // Allow video to overflow the container (so we see full intrinsic size if desired)
                    // The control bar will stay constrained to the 100% wrapper.
                    player.el().style.overflow = 'visible';
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
                                className: 'vjs-visible-text vjs-download-button',
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

                            // Use SVGs constant
                            btnDl.el().innerHTML = SVGs.download;
                            btnDl.el().title = "Download Video";
                            btnDl.el().style.cursor = "pointer";
                        }
                    });
                }



                // --- Feature 4: Mobile Double-Tap Gestures (Moved to Hook) ---


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

                // --- Custom Sizing Logic (Native & Fixed Modes) ---
                const resizePlayer = () => {
                    const mode = C.sizingMode;
                    if (mode !== 'native' && mode !== 'fixed') return;

                    const el = player.el();
                    if (!el) return;

                    const vidW = player.videoWidth();
                    const vidH = player.videoHeight();

                    // Fixed Mode: Configured Dimensions
                    if (mode === 'fixed') {
                        player.width(C.fixedWidth || 640);
                        player.height(C.fixedHeight || 360);
                        return;
                    }

                    // Native Mode: Intrinsic Dimensions
                    if (!vidW || !vidH) return;
                    player.width(vidW);
                    player.height(vidH);
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
                        // FIX: Focus the player wrapper (.video-js) instead of the tech element.
                        // The tech element is display:none in Audio mode, causing focus to fail and controls to become unreachable.
                        // The wrapper is always visible and handles hotkeys/tabIndex.
                        if (player && player.el()) {
                            player.el().focus();
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
                        // DISABLE RESUME SAVE FOR TRANSCODING UNLESS SEEKING IS ENABLED
                        if (isConvertingRef.current && !C.enable_transcoding_seeking) return;

                        const now = Date.now();
                        if (now - lastSave > 2000) {
                            const cur = player.currentTime();
                            const dur = player.duration();
                            // Don't save if near end
                            if (cur > 0 && (!dur || (dur - cur > 10))) {
                                // Use props.src for stable key (ignoring query params added by transcoding)
                                const src = props.src || player.currentSrc();
                                if (src) {
                                    const key = `vjs-resume-${src.split('/').pop().split('?')[0]}`; // Ensure clean filename
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

                // --- Feature: Converting State UI ---
                const setConvertingState = (isBuffering) => {
                    if (isConvertingRef.current && isBuffering) {
                        player.addClass('vjs-converting');
                    } else {
                        player.removeClass('vjs-converting');
                    }
                };

                player.on('waiting', () => setConvertingState(true));
                player.on('canplay', () => setConvertingState(false));
                player.on('playing', () => setConvertingState(false));
                player.on('pause', () => setConvertingState(false)); // Don't show if paused
                player.on('error', () => player.removeClass('vjs-converting')); // Clear on error

                player.on('ended', () => {
                    player.removeClass('vjs-converting');
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
                    if (videoElementRef.current) {
                        videoElementRef.current.remove();
                        videoElementRef.current = null;
                    }
                    if (containerRef.current) containerRef.current.innerHTML = '';
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
                        hasResumedRef.current = false; // Allow resume for new source
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

                        // --- Mode Switching Logic (Audio <-> Video) ---
                        // MOVED TO EVENT LISTENERS (enforcePlayerState) for robustness.

                        player.src({
                            src: targetSrc,
                            type: conversionMode ? 'video/mp4' : determineMimeType(props.src)
                        });

                        // Don't resume playback for converted streams as seeking is disabled (unless enabled in config)
                        if (!conversionMode || C.enable_transcoding_seeking) {
                            attemptResume(props.src);
                        }

                        if (C.autoplay || conversionMode) {
                            const p = player.play();
                            if (p && p.catch) {
                                p.catch(e => {
                                    // Ignore errors if we are converting (since we expect an abort on switch)
                                    if (isConvertingRef.current) return;

                                    console.warn("Auto-play blocked:", e);
                                    // Safety check: Ensure player is not disposed and tech is ready before checking paused()
                                    const isPaused = (!player || player.isDisposed() || !player.tech(true)) ? true : player.paused();
                                    if (!isPaused) {
                                        // It thinks it's playing?
                                    } else if (player && !player.isDisposed()) {
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

                // --- Helper: Enforce Player State (Resetting any lingering audio-mode artifacts) ---
                const enforcePlayerState = () => {
                    setTimeout(() => {
                        if (!player || player.isDisposed()) return;

                        // We no longer have a specialized audio mode. 
                        // Video.js handles audio files natively in the video frame (showing the poster).

                        // Cleanup any legacy classes if they somehow persist
                        if (player.hasClass('vjs-audio-mode')) {
                            player.removeClass('vjs-audio-mode');
                        }

                        // Trigger HFS metadata update (Native HFS UI)
                        if (props.onPlay) props.onPlay();
                    }, 10);
                };

                // Helper: Aggressive Duration Enforcement
                // Browsers often reset duration to Infinity for open pipes. We must fight back.
                const enforceDuration = () => {
                    if (conversionMode && window._vjs_saved_duration && player) {
                        const d = player.duration();
                        // Allow a small tolerance, but if it differs significantly or is Infinity, fix it
                        if (d === Infinity || Math.abs(d - window._vjs_saved_duration) > 5) {
                            // console.log(`[VideoJS] Enforcing duration: ${window._vjs_saved_duration} (was ${d})`);
                            player.duration(window._vjs_saved_duration);

                            // Also fix the UI if it thinks it's live
                            if (player.hasClass('vjs-live')) {
                                player.removeClass('vjs-live');
                            }
                            const durDisplay = player.getChild('ControlBar')?.getChild('DurationDisplay');
                            if (durDisplay && durDisplay.el()) {
                                // Force show if hidden
                                durDisplay.show();
                            }
                        }
                    }
                };

                // Listeners for enforcement
                player.on('loadstart', enforcePlayerState);
                player.on('loadedmetadata', enforcePlayerState);
                player.on('durationchange', enforceDuration); // Existing
                player.on('timeupdate', enforceDuration); // Existing

                // Detect Absolute vs Relative Timestamps
                player.on('timeupdate', () => {
                    if (!conversionMode || !C.enable_transcoding_seeking || seekOffset === 0) return;

                    // Only check once or periodically? Continuous check is fine as it's cheap boolean set
                    const t = player.currentTime();
                    // If we are at 100s, and offset is 100s. We are absolute.
                    // If we are at 0s, and offset is 100s. We are relative.
                    if (t > seekOffset * 0.5 && t > 1) {
                        isAbsoluteTimestampRef.current = true;
                    } else if (t < 10 && seekOffset > 20) {
                        // Careful unique case: User seeked to start? 
                        // But if we just loaded, and t is low, it's relative.
                        isAbsoluteTimestampRef.current = false;
                    }
                });

                // Intercept Seek Requests (Monkey-patch currentTime)
                // This is necessary because browsers often clamp 'currentTime' to 0 for live streams,
                // making it impossible to read the user's desired seek time from the 'seeking' event.
                if (conversionMode && C.enable_transcoding_seeking) {
                    const originalCurrentTime = player.currentTime;
                    let seekDebounce = null;

                    // Override
                    player.currentTime = function (time) {
                        if (time !== undefined) {
                            // Setter call - User (or internal logic) is trying to seek
                            const targetTime = parseFloat(time);

                            // Ignore seek to near 0
                            if (targetTime > 0.1) {
                                // console.log("[VideoJS] Intercepted Seek Intent:", targetTime);

                                if (seekDebounce) clearTimeout(seekDebounce);
                                seekDebounce = setTimeout(() => {
                                    // Use detection to decide logic
                                    let newOffset = 0;
                                    if (isAbsoluteTimestampRef.current) {
                                        // Absolute Mode: The bar is showing real time. Target is absolute.
                                        // console.log("[VideoJS] Seek Mode: ABSOLUTE. Target:", targetTime);
                                        newOffset = targetTime;
                                    } else {
                                        // Relative Mode: The bar resets to 0. Target is relative to current chunk.
                                        // console.log("[VideoJS] Seek Mode: RELATIVE. Target:", targetTime, "+ Offset:", seekOffset);
                                        newOffset = seekOffset + targetTime;
                                    }

                                    // Safety: Clamp to saved duration
                                    if (window._vjs_saved_duration && newOffset > window._vjs_saved_duration) {
                                        newOffset = window._vjs_saved_duration - 5;
                                    }

                                    setSeekOffset(newOffset);
                                    notify(player, `Seeking to ${Math.round(newOffset)}s...`, "info", 2000);
                                }, 600);
                            }
                        }
                        // Always pass through to original to keep Video.js happy
                        return originalCurrentTime.apply(player, arguments);
                    };

                    // console.log("[VideoJS] Intercepted currentTime execution for seeking support");

                    return () => {
                        // console.log("[VideoJS] Restoring original currentTime");
                        // Restore original function on cleanup
                        player.currentTime = originalCurrentTime;
                        if (seekDebounce) clearTimeout(seekDebounce);
                        player.off('durationchange', enforceDuration);
                        player.off('timeupdate', enforceDuration);
                        player.off('loadedmetadata', enforceDuration);
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

            // Fix for React Re-render Clobbering Video.js Context
            // We use Manual DOM management (created in useEffect) to ensure React never touches the video element.
            // This prevents React from stripping classes like 'vjs-audio-mode' or 'vjs-playing'.

            // Dynamic Container Styling Logic MOVED to top of component (lines ~280)
            // variables `containerStyle` and `videoStyleOverride` are now available in scope.

            // Apply Dynamic Overrides to Manual Video Element
            React.useEffect(() => {
                if (videoElementRef.current) {
                    Object.assign(videoElementRef.current.style, videoStyleOverride);
                }
            }); // Run every render to ensure overrides persist against Video.js changes

            return h('div', {
                'data-vjs-player': true,
                ref: containerRef,
                style: containerStyle
            }, [
                // Manual Video Element is appended here by useEffect

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

                // Audio Title Overlay (REMOVED)


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
            const isAudio = C.enableAudio && AUDIO_EXTS.includes(ext);
            const isVideo = VIDEO_EXTS.includes(ext) || (enableHLS && (ext === '.m3u8' || ext === '.mkv'));

            if (!isVideo && !isAudio) {
                return;
            }

            // Dynamic Component Marking (Ensures HFS show.ts knows if it's Audio or Video)
            let ComponentToUse = VideoJsPlayer;
            if (C.enableSubtitlePluginIntegration && HFS.markVideoComponent) {
                ComponentToUse = HFS.markVideoComponent(ComponentToUse);
            }
            if (isAudio && HFS.markAudioComponent) {
                ComponentToUse = HFS.markAudioComponent(ComponentToUse);
            }

            // FORCED RE-MOUNT: Using a wrapper component with a dynamic key based on SRC.
            // This forces React to destroy and recreate the player when switching files,
            // effectively resetting all internal and Video.js states (fixes sticky metadata).
            params.Component = (props) => h(ComponentToUse, { ...props, key: props.src });
        });
    } else {
        console.error("VideoJS Plugin: React/Preact not found on window or HFS. Plugin execution aborted.");
    }
}
