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

        // HFS API REQUIREMENT: getPluginConfig MUST be called at the very top level
        const rawConfig = HFS.getPluginConfig ? HFS.getPluginConfig() : {};

        // Process config into usable defaults
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
            hotkeyVolumeStep: (parseInt(rawConfig.hotkeyVolumeStep) || 10) / 100,
            persistentVolume: rawConfig.persistentVolume ?? true,
            resumePlayback: rawConfig.resumePlayback ?? true,
            autoRotate: rawConfig.autoRotate ?? true,
            enableDoubleTap: rawConfig.enableDoubleTap ?? true,
            enableScrollVolume: rawConfig.enableScrollVolume ?? true,
            enablePiP: rawConfig.enablePiP ?? true,
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

        const ICONS = {
            rewind: (skip) => `<svg viewBox="0 0 24 24" fill="white" width="22" height="22" style="vertical-align: middle;"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="16" font-size="8" fill="white" text-anchor="middle" font-weight="bold" style="text-shadow: 1px 1px 1px black;">${skip}</text></svg>`,
            forward: (skip) => `<svg viewBox="0 0 24 24" fill="white" width="22" height="22" style="vertical-align: middle;"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="16" font-size="8" fill="white" text-anchor="middle" font-weight="bold" style="text-shadow: 1px 1px 1px black;">${skip}</text></svg>`,
            download: `<svg viewBox="0 0 24 24" fill="white" width="22" height="22" style="vertical-align: middle;"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`
        };

        function determineMimeType(src) {
            if (!src) return 'video/mp4';
            const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
            if (ext === '.webm') return 'video/webm';
            if (ext === '.ogv' || ext === '.ogg') return 'video/ogg';
            if (ext === '.mp3') return 'audio/mpeg';
            if (ext === '.wav') return 'audio/wav';
            if (ext === '.m4a') return 'audio/mp4';
            if (ext === '.aac') return 'audio/aac';
            if (ext === '.flac') return 'audio/flac';

            if (C.enableHLS) {
                if (ext === '.mkv') return 'video/webm';
                if (ext === '.m3u8') return 'application/x-mpegURL';
            }
            return 'video/mp4';
        }

        // --- Custom Hook: Player State (Volume, Resume) ---
        const usePlayerState = (playerRef, notify) => {
            React.useEffect(() => {
                const player = playerRef.current;
                if (!player) return;

                // Resume Playback Logic
                const attemptResume = (src) => {
                    if (!C.resumePlayback || !src) return;
                    // Use simple filename key to sync across same file paths
                    const resumeKey = `vjs-resume-${src.split('/').pop().split('?')[0]}`;
                    const savedTime = localStorage.getItem(resumeKey);

                    if (savedTime) {
                        const t = parseFloat(savedTime);
                        if (!isNaN(t) && t > 1) {
                            const applyResume = () => {
                                const dur = player.duration();
                                if (!dur || (dur - t > 5)) { // Don't resume if near end
                                    player.currentTime(t);
                                    notify(player, `Resumed at ${Math.round(t)}s`, "info", 2000);
                                }
                            };
                            if (player.readyState() > 0) applyResume();
                            else player.one('loadedmetadata', applyResume);
                        }
                    }
                };

                // Expose to component for manual calls (e.g. after src change)
                player._attemptResume = attemptResume;

                // Persistence Listeners
                const onVolumeChange = () => {
                    localStorage.setItem('vjs-volume-level', player.volume());
                };

                const onTimeUpdate = () => {
                    const src = player.currentSrc();
                    if (!C.resumePlayback || !src) return;

                    // Don't save if converting without seek support (infinity duration issues)
                    // We can check if it's a blob or pipe? 
                    // Actually, let logic in useTranscoding control this prohibition if needed.
                    // But here we just assume if valid time, save it.
                    const cur = player.currentTime();
                    const dur = player.duration();

                    if (cur > 0 && (!dur || (dur - cur > 10))) {
                        const key = `vjs-resume-${src.split('/').pop().split('?')[0]}`;
                        localStorage.setItem(key, cur.toFixed(1));
                    }
                };

                // Debounced/Throttled listeners
                let lastVolSave = 0;
                const debouncedVol = () => {
                    const now = Date.now();
                    if (now - lastVolSave > 1000) {
                        onVolumeChange();
                        lastVolSave = now;
                    }
                };

                let lastTimeSave = 0;
                const debouncedTime = () => {
                    const now = Date.now();
                    if (now - lastTimeSave > 2000) {
                        onTimeUpdate();
                        lastTimeSave = now;
                    }
                };

                player.on('volumechange', debouncedVol);
                player.on('timeupdate', debouncedTime);
                player.on('ended', () => {
                    const src = player.currentSrc();
                    if (src) {
                        const key = `vjs-resume-${src.split('/').pop().split('?')[0]}`;
                        localStorage.removeItem(key);
                    }
                });

                return () => {
                    player.off('volumechange', debouncedVol);
                    player.off('timeupdate', debouncedTime);
                };
            }, [playerRef.current]);
        };

        // --- Custom Hook: Hotkeys ---
        const useHotkeys = (playerRef, notify) => {
            React.useEffect(() => {
                if (!C.enableHotkeys || !playerRef.current) return;
                const player = playerRef.current;

                const handleKey = (e) => {
                    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                    if (!player || player.isDisposed()) return;

                    switch (e.key) {
                        case ' ':
                        case 'k':
                        case 'K':
                            e.preventDefault();
                            player.paused() ? player.play() : player.pause();
                            notify(player, player.paused() ? "Pause" : "Play", "info", 500);
                            break;
                        case 'f':
                        case 'F':
                            e.preventDefault();
                            player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
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
                            if (document.pictureInPictureElement) document.exitPictureInPicture();
                            else if (player.videoWidth() > 0) player.requestPictureInPicture();
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

                const el = player.el();
                if (el) el.addEventListener('keydown', handleKey);

                return () => {
                    if (el) el.removeEventListener('keydown', handleKey);
                };
            }, [playerRef.current]);
        };

        // --- Custom Hook: Mobile Gestures ---
        const useMobileGestures = (playerRef, notify, videoElementRef) => {
            React.useEffect(() => {
                const player = playerRef.current;
                if (!player) return;

                // Double Tap
                if (C.enableDoubleTap) {
                    let lastTouchTime = 0;
                    const handleTouch = (e) => {
                        const now = Date.now();
                        if (now - lastTouchTime < 300) {
                            e.preventDefault();
                            const touch = e.changedTouches[0];
                            let rect = e.currentTarget.getBoundingClientRect();
                            if (rect.width === 0 && videoElementRef.current) {
                                rect = videoElementRef.current.getBoundingClientRect();
                            }

                            const width = rect.width;
                            if (width === 0) return;

                            const x = touch.clientX - rect.left;
                            const pct = x / width;
                            const seekSeconds = C.doubleTapSeekSeconds;

                            if (pct < 0.3) {
                                player.currentTime(player.currentTime() - seekSeconds);
                                notify(player, `Rewind ${seekSeconds}s`, "info", 1000);
                            } else if (pct > 0.7) {
                                player.currentTime(player.currentTime() + seekSeconds);
                                notify(player, `Forward ${seekSeconds}s`, "info", 1000);
                            } else {
                                player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
                            }
                        }
                        lastTouchTime = now;
                    };

                    const el = player.el();
                    if (el) {
                        el.style.touchAction = 'manipulation';
                        el.addEventListener('touchend', handleTouch, { capture: true, passive: false });
                    }
                    // Cleanup handled by ref change usually, but explicit remove is good
                    // Actually React useEffect cleanup is better
                }

                // Scroll Volume
                if (C.enableScrollVolume) {
                    const handleWheel = (e) => {
                        if (e.deltaY === 0) return;
                        e.preventDefault();
                        const step = C.hotkeyVolumeStep;
                        const newVol = e.deltaY < 0
                            ? Math.min(player.volume() + step, 1)
                            : Math.max(player.volume() - step, 0);
                        player.volume(newVol);
                        player.userActive(true);
                        notify(player, `Volume: ${Math.round(newVol * 100)}%`, "info", 500);
                    };
                    const el = player.el();
                    if (el) el.addEventListener('wheel', handleWheel, { passive: false });
                }

                // Auto Rotate
                const onFullscreenChange = () => {
                    if (C.autoRotate && screen.orientation && screen.orientation.lock) {
                        if (player.isFullscreen()) {
                            if (player.videoWidth() > player.videoHeight()) {
                                screen.orientation.lock("landscape").catch(() => { });
                            }
                        } else {
                            screen.orientation.unlock();
                        }
                    }
                };
                player.on('fullscreenchange', onFullscreenChange);

                return () => {
                    player.off('fullscreenchange', onFullscreenChange);
                };
            }, [playerRef.current]);
        };

        // --- Custom Hook: Transcoding Logic ---
        const useTranscoding = (playerRef, notify, savedDurationRef) => {
            const [conversionMode, setConversionMode] = React.useState(false);
            const isConvertingRef = React.useRef(false);
            const [seekOffset, setSeekOffset] = React.useState(0);
            const errorShownRef = React.useRef(false);

            // Logic to switch to conversion
            const handlePlaybackError = (player, message = "Video format not supported.") => {
                if (C.enable_ffmpeg_transcoding) {
                    if (!isConvertingRef.current) {
                        console.log("[VideoJS] Unsupported detected. Switching to transcoding...");
                        notify(player, "Unsupported format. Attempting conversion...", "info", 3000);

                        const d = player.duration();
                        if (d && d > 0 && d !== Infinity) {
                            savedDurationRef.current = d;
                        }

                        isConvertingRef.current = true;
                        setConversionMode(true);
                        return;
                    }
                }

                // Fallback Error
                if (!errorShownRef.current) {
                    notify(player, `${message}${isConvertingRef.current ? " (Conversion failed)" : ""}`, "error", 0);
                    errorShownRef.current = true;
                }
            };

            const checkHevc = () => {
                const player = playerRef.current;
                if (!player || player.isDisposed() || player.ended() || isConvertingRef.current) return;

                // Simple heuristic: if video but 0x0 dimensions
                const w = player.videoWidth();
                const h = player.videoHeight();
                if (determineMimeType(player.currentSrc()).startsWith('video/') && (w === 0 || h === 0)) {
                    // Retry once quickly
                    setTimeout(() => {
                        if (player.videoWidth() === 0) handlePlaybackError(player, "HEVC/Unsupported format detected.");
                    }, 500);
                }
            };

            // Duration Enforcer (Simple)
            React.useEffect(() => {
                const player = playerRef.current;
                if (!player || !conversionMode) return;

                const enforceDuration = () => {
                    if (savedDurationRef.current) {
                        const d = player.duration();
                        if (d === Infinity || Math.abs(d - savedDurationRef.current) > 5) {
                            player.duration(savedDurationRef.current);
                        }
                    }
                };

                player.on('durationchange', enforceDuration);
                player.on('loadedmetadata', enforceDuration);
                return () => {
                    player.off('durationchange', enforceDuration);
                    player.off('loadedmetadata', enforceDuration);
                };
            }, [conversionMode, playerRef.current]);

            // Simple Seek Interceptor that just updates the state to trigger reload
            // We removed the complex currentTime patch.
            // If user seeks using the bar, VideoJS updates currentTime.
            // We need to catch that 'seeking' event? 
            // Actually, for Live streams, the standard seek bar might be disabled or erratic.
            // But let's try to trust the standard 'seeking' event if duration is set.
            React.useEffect(() => {
                const player = playerRef.current;
                if (!player || !conversionMode || !C.enable_transcoding_seeking) return;

                const onSeek = () => {
                    // User seeked. We need to reload the stream at this position.
                    const t = player.currentTime();
                    // Debounce?
                    if (Math.abs(t - seekOffset) > 2) { // 2s threshold
                        console.log(`[VideoJS] Seek detected: ${t}`);
                        setSeekOffset(t);
                        notify(player, `Seeking to ${Math.round(t)}s...`, "info", 2000);
                    }
                };

                // Use 'seeking' or 'seeked'? 'seeking' fires repeatedly while dragging.
                // We want 'seeked' but sometimes that doesn't fire if stream stalls.
                // Let's monkey patch currentTime SETTER only simplistically to catch intent.
                const originalCurrentTime = player.currentTime;
                let debounce = null;

                player.currentTime = function (val) {
                    if (val !== undefined) {
                        const t = parseFloat(val);
                        if (debounce) clearTimeout(debounce);
                        debounce = setTimeout(() => {
                            setSeekOffset(t);
                            notify(player, `Seeking to ${Math.round(t)}s...`, "info", 2000);
                        }, 500);
                        // We do NOT call original setter because we are about to reload the source!
                        // Calling it might confuse the player or buffer.
                        return t;
                    }
                    return originalCurrentTime.apply(player);
                };

                return () => {
                    player.currentTime = originalCurrentTime;
                };

            }, [conversionMode, seekOffset, playerRef.current]);

            return {
                conversionMode,
                setConversionMode,
                isConvertingRef,
                seekOffset,
                setSeekOffset,
                handlePlaybackError,
                checkHevc,
                errorShownRef
            };
        };

        /**
         * Video.js Player Component
         */
        const VideoJsPlayer = React.forwardRef((props, ref) => {
            const containerRef = React.useRef(null);
            const playerRef = React.useRef(null);
            const videoElementRef = React.useRef(null);
            const dummyVideoRef = React.useRef(null);
            const savedDurationRef = React.useRef(0);

            const [overlayState, setOverlayState] = React.useState(null);

            const notify = (player, message, type = 'info', duration = 2000) => {
                if (C.errorStyle === 'toast' && HFS && HFS.toast) {
                    HFS.toast(message, type);
                } else {
                    setOverlayState({ message, type, show: true });
                    if (duration > 0) {
                        setTimeout(() => {
                            setOverlayState(prev => prev && prev.message === message ? { ...prev, show: false } : prev);
                        }, duration);
                    }
                }
            };

            // Custom Hooks
            usePlayerState(playerRef, notify);
            useHotkeys(playerRef, notify);
            useMobileGestures(playerRef, notify, videoElementRef);
            const {
                conversionMode, setConversionMode, isConvertingRef,
                seekOffset, setSeekOffset, handlePlaybackError, checkHevc, errorShownRef
            } = useTranscoding(playerRef, notify, savedDurationRef);

            // Main Init Effect
            React.useEffect(() => {
                if (!videoElementRef.current) return;

                // Audio Mode Style Injection
                if (!document.getElementById('vjs-custom-styles')) {
                    const style = document.createElement('style');
                    style.id = 'vjs-custom-styles';
                    style.innerHTML = `.vjs-audio-mode { background-color: transparent !important; } .vjs-audio-mode .vjs-tech { display: none; } .vjs-audio-mode .vjs-control-bar { display: flex !important; visibility: visible !important; opacity: 1 !important; background-color: rgba(0,0,0,0.5); }`;
                    document.head.appendChild(style);
                }

                // Configuration
                const isAudio = C.enableAudio && (determineMimeType(props.src || '').startsWith('audio/') || AUDIO_EXTS.some(ext => (props.src || '').toLowerCase().endsWith(ext)));
                const rates = C.playbackRates.split(',').map(r => parseFloat(r.trim())).filter(n => !isNaN(n));

                // Initialize Video.js
                const player = videojs(videoElementRef.current, {
                    controls: C.controls,
                    autoplay: C.autoplay,
                    loop: C.loop,
                    muted: C.muted,
                    preload: C.preload,
                    fluid: C.sizingMode === 'fluid' && !isAudio,
                    fill: C.sizingMode === 'fill' && !isAudio,
                    height: isAudio ? 50 : undefined,
                    playbackRates: rates.length ? rates : [0.5, 1, 1.5, 2],
                    inactivityTimeout: C.inactivityTimeout,
                    controlBar: {
                        pictureInPictureToggle: C.enablePiP && !isAudio,
                        fullscreenToggle: !isAudio
                    },
                    userActions: { hotkeys: false }
                });
                playerRef.current = player;

                if (isAudio) {
                    player.addClass('vjs-audio-mode');
                    player.height(50);
                }
                player.addClass(C.theme !== 'default' ? `vjs-theme-${C.theme}` : '');

                // Button features
                player.ready(() => {
                    const cb = player.getChild('ControlBar');
                    if (!cb) return;
                    const pc = cb.getChild('ProgressControl');
                    const idx = pc ? cb.children().indexOf(pc) : 0;

                    if (C.showSeekButtons) {
                        const btnRw = cb.addChild('button', { controlText: `Rewind ${C.seekButtonStep}s`, className: 'vjs-seek-button vjs-seek-backward', clickHandler: () => player.currentTime(player.currentTime() - C.seekButtonStep) }, idx);
                        btnRw.el().innerHTML = ICONS.rewind(C.seekButtonStep);

                        const btnFwd = cb.addChild('button', { controlText: `Forward ${C.seekButtonStep}s`, className: 'vjs-seek-button vjs-seek-forward', clickHandler: () => player.currentTime(player.currentTime() + C.seekButtonStep) }, idx + 2);
                        btnFwd.el().innerHTML = ICONS.forward(C.seekButtonStep);
                    }
                    if (C.showDownloadButton) {
                        const btnDl = cb.addChild('button', { controlText: "Download", className: 'vjs-download-button', clickHandler: () => { const a = document.createElement('a'); a.href = player.currentSrc(); a.download = player.currentSrc().split('/').pop(); a.click(); } });
                        btnDl.el().innerHTML = ICONS.download;
                    }
                });

                // Set Initial Volume
                let startVol = C.volume;
                if (C.persistentVolume) {
                    const s = localStorage.getItem('vjs-volume-level');
                    if (s) startVol = parseFloat(s);
                }
                player.volume(startVol);

                // Auto-Focus & Error Handling
                player.on('playing', () => { setTimeout(() => videoElementRef.current?.focus(), 50); checkHevc(); });
                player.on('loadedmetadata', checkHevc);
                player.on('error', () => {
                    const error = player.error();
                    const code = error ? error.code : 0;
                    // Code 4: Source not supported
                    // Code 2: Network error (often happens when aborting a stream for seeking)
                    if (code === 4 || code === 2) {
                        player.error(null);
                        handlePlaybackError(player, code === 2 ? "Network error (retrying...)" : undefined);
                    } else if (props.onError) {
                        props.onError(error);
                    }
                });

                // HFS Play Next Proxy
                player.on('ended', () => dummyVideoRef.current?.dispatchEvent(new Event('ended')));
                if (dummyVideoRef.current) dummyVideoRef.current.play = () => Promise.resolve();

                // Call Ref
                if (ref) {
                    if (typeof ref === 'function') ref(videoElementRef.current);
                    else if (ref.hasOwnProperty('current')) ref.current = videoElementRef.current;
                }

                // Resize logic for native mode
                if (C.sizingMode === 'native') {
                    const resize = () => {
                        const w = C.fixedWidth || player.videoWidth();
                        const h = C.fixedHeight || player.videoHeight();
                        if (w && h) { player.width(w); player.height(h); }
                    };
                    player.on('loadedmetadata', resize);
                    setTimeout(resize, 100);
                }

                return () => player.dispose();
            }, []);

            // Source Switching Effect
            React.useEffect(() => {
                const player = playerRef.current;
                if (!player || !props.src) return;

                // Reset logic if source changed cleanly
                const currentSrc = player.currentSrc();
                if (props.src && currentSrc && !decodeURI(currentSrc).includes(decodeURI(props.src))) {
                    setConversionMode(false);
                    isConvertingRef.current = false;
                    setSeekOffset(0);
                    errorShownRef.current = false;
                    setOverlayState(null);
                }

                // Construct Target URL
                let suffix = '';
                if (conversionMode) {
                    suffix = '?ffmpeg';
                    if (seekOffset > 0) suffix += `&startTime=${seekOffset}`;
                }
                const targetSrc = props.src + suffix;

                if (!currentSrc || !decodeURI(currentSrc).includes(decodeURI(targetSrc))) {
                    console.log(`VideoJS Plugin: Load ${targetSrc}`);
                    player.src({ src: targetSrc, type: conversionMode ? 'video/mp4' : determineMimeType(props.src) });

                    if (!conversionMode) {
                        // Standard Resume for direct files
                        if (player._attemptResume) player._attemptResume(props.src);
                    } else if (C.enable_transcoding_seeking && C.resumePlayback && seekOffset === 0) {
                        // Special Resume for Transcoding
                        // We set seekOffset directly to start the stream at the resume point.
                        // We only do this if seekOffset is 0 (fresh conversion start) to avoid overriding user seeks.
                        const key = `vjs-resume-${props.src.split('/').pop().split('?')[0]}`;
                        const saved = localStorage.getItem(key);
                        if (saved) {
                            const t = parseFloat(saved);
                            if (!isNaN(t) && t > 5) { // Threshold >5 to ensure meaningful resume
                                console.log(`[VideoJS] Resuming transcoding at ${t}s`);
                                setSeekOffset(t);
                                // Note: calling setSeekOffset will trigger this effect again with the new URL.
                                // This is expected and desired.
                            }
                        }
                    }

                    if (C.autoplay || conversionMode) {
                        player.play().catch(e => {
                            if (!isConvertingRef.current) notify(player, "Click to Play", "info", 0);
                        });
                    }
                }
            }, [props.src, conversionMode, seekOffset]);

            // Render
            if (!props.src) return h('div', { style: { color: '#666', padding: '20px' } }, "No Video Selected");

            return h('div', { 'data-vjs-player': true, ref: containerRef, style: { display: 'contents', position: 'relative' } }, [
                h('video', { ref: videoElementRef, className: `video-js vjs-big-play-centered`, style: C.sizingMode === 'fill' ? { objectFit: 'cover' } : {}, tabIndex: 0 }, props.children),
                (overlayState && overlayState.show) ? h('div', {
                    style: {
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        zIndex: 99, padding: '12px 20px', borderRadius: '8px',
                        backgroundColor: overlayState.type === 'error' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)',
                        color: overlayState.type === 'error' ? '#ff6b6b' : '#fff',
                        border: overlayState.type === 'error' ? '1px solid #ff6b6b' : 'none',
                        pointerEvents: 'none'
                    }
                }, overlayState.message) : null,
                h('video', { ref: dummyVideoRef, className: 'showing', style: { display: 'none' } })
            ]);
        });

        HFS.onEvent('fileShow', (params) => {
            const { entry } = params;
            const ext = entry.n.substring(entry.n.lastIndexOf('.')).toLowerCase();
            if (!VIDEO_EXTS.includes(ext) && !(C.enableAudio && AUDIO_EXTS.includes(ext)) && !(C.enableHLS && ['.m3u8', '.mkv'].includes(ext))) return;

            params.Component = (C.enableSubtitlePluginIntegration && HFS.markVideoComponent)
                ? HFS.markVideoComponent(VideoJsPlayer)
                : VideoJsPlayer;
        });

    } else {
        console.error("VideoJS Plugin: React not found.");
    }
}
