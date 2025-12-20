exports.description = "A Video.js player plugin for HFS.";
exports.version = 127;
exports.apiRequired = 10.0; // Ensures HFS version is compatible
exports.repo = "VenB304/videojs-player";
exports.preview = ["https://github.com/user-attachments/assets/d8502d67-6c5b-4a9a-9f05-e5653122820c", "https://github.com/user-attachments/assets/39be202e-fbb9-42de-8aea-3cf8852f1018", "https://github.com/user-attachments/assets/5e21ffca-5a4c-4905-b862-660eafafe690"]
// HFS allows loading external URLs directly in frontend_js/css
exports.frontend_css = [
    'video-js.css', // Local Video.js Styles
    'themes.css'    // Official Themes Bundle
];

exports.frontend_js = [
    'video.min.js', // Local Video.js Library
    'player.js'     // Your custom script (in public folder)
];

exports.config = {

    // === Configuration Group Selector ===
    config_tab: {
        type: 'select',
        defaultValue: 'all',
        options: {
            '0. All Settings': 'all',
            '1. Core Playback': 'core',
            '2. Player Controls': 'controls',
            '3. Keyboard Shortcuts': 'keys',
            '4. Layout & Sizing': 'layout',
            '5. Appearance': 'appearance',
            '6. Mobile Experience': 'mobile',
            '7. Advanced / Experimental': 'advanced',
            '8. Transcoding': 'transcoding'
        },
        label: "Configuration Category",
        helperText: "Select a category to view and edit settings.",
        frontend: true // Needs to be sent to frontend? Actually only used in admin panel logic usually. keeping true just in case.
    },

    // === 1. Core Playback ===
    autoplay: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: true, label: "Autoplay", helperText: "Automatically start video", frontend: true
    },
    muted: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: false, label: "Start Muted", helperText: "Useful for browsers that block autoplay with sound", frontend: true
    },
    loop: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: false, label: "Loop", helperText: "Repeat video when finished", frontend: true
    },
    preload: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'select',
        defaultValue: 'metadata',
        options: { 'Metadata': 'metadata', 'Auto': 'auto', 'None': 'none' },
        label: "Preload Strategy",
        helperText: "How to load video data",
        frontend: true
    },
    enableAudio: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: false, label: "Enable Audio Support", helperText: "Use this player for mp3, wav, etc.", frontend: true
    },
    enableSubtitlePluginIntegration: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: false, label: "Integrate with HFS-Subtitles", helperText: "Uses hfs-subtitles plugin for advanced subtitles if installed", frontend: true
    },

    resumePlayback: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: true, label: "Resume Playback", helperText: "Continue from last position", frontend: true
    },
    persistentVolume: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'boolean', defaultValue: true, label: "Remember Volume", helperText: "Save volume between sessions", frontend: true
    },
    volume: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'number', defaultValue: 100, min: 0, max: 100, step: 5, label: "Default Volume (%)", helperText: "0 to 100", frontend: true
    },
    playbackRates: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'core',
        type: 'string', defaultValue: "0.5, 1, 1.5, 2", label: "Playback Rates", helperText: "Comma separated numbers", frontend: true
    },


    // === 2. Player Controls ===
    controls: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'boolean', defaultValue: true, label: "Show Controls", helperText: "Enables the control bar", frontend: true
    },
    inactivityTimeout: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'number', defaultValue: 2000, min: 0, label: "Controls Hide Delay (ms)", helperText: "0 = always visible", frontend: true
    },
    showSeekButtons: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'boolean', defaultValue: true, label: "Show Seek Buttons", helperText: "Adds +/- buttons to control bar", frontend: true
    },
    seekButtonStep: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'number', defaultValue: 10, min: 1, label: "Seek Button Time (s)", helperText: "Seconds per tap", frontend: true
    },
    showDownloadButton: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'boolean', defaultValue: true, label: "Show Download Button", helperText: "Adds download icon to controls", frontend: true
    },
    enableScrollVolume: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'boolean', defaultValue: true, label: "Enable Scroll Volume", helperText: "Adjust volume by scrolling over player", frontend: true
    },
    enablePiP: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'controls',
        type: 'boolean', defaultValue: true, label: "Enable Picture-in-Picture", helperText: "Show Picture-in-Picture button", frontend: true
    },


    // === 3. Keyboard Shortcuts ===
    enableHotkeys: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'keys',
        type: 'boolean', defaultValue: true, label: "Enable Hotkeys", helperText: "Space, F, Arrows, M", frontend: true
    },
    hotkeySeekStep: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'keys',
        type: 'number', defaultValue: 5, min: 1, label: "Hotkey Seek Time (s)", helperText: "Seconds to skip", frontend: true
    },
    hotkeyVolumeStep: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'keys',
        type: 'number', defaultValue: 5, min: 1, max: 100, label: "Hotkey Volume Step (%)", helperText: "Percent to change", frontend: true
    },


    // === 4. Layout & Sizing ===
    sizingMode: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'layout',
        type: 'select',
        defaultValue: 'fluid',
        options: { 'Fluid': 'fluid', 'Fill': 'fill', 'Fixed / Native': 'native' },
        label: "Sizing Mode",
        frontend: true
    },
    fixedWidth: {
        type: 'number',
        defaultValue: 640,
        min: 0,
        label: "Fixed Width (px)",
        helperText: "0 = intrinsic size",
        frontend: true,
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'layout') && x.sizingMode === 'native'
    },
    fixedHeight: {
        type: 'number',
        defaultValue: 360,
        min: 0,
        label: "Fixed Height (px)",
        helperText: "0 = intrinsic size",
        frontend: true,
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'layout') && x.sizingMode === 'native'
    },


    // === 5. Appearance ===
    theme: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'appearance',
        type: 'select',
        defaultValue: 'default',
        options: {
            'Standard (Default)': 'default',
            'City': 'city',
            'Fantasy': 'fantasy',
            'Forest': 'forest',
            'Sea': 'sea'
        },
        label: "Player Theme",
        frontend: true
    },
    errorStyle: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'appearance',
        type: 'select', options: ['overlay', 'toast'], defaultValue: 'overlay', label: "Notification Style", helperText: "How to show errors and info (Toast/Overlay)", frontend: true
    },



    // === 6. Mobile Experience ===
    enableDoubleTap: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'mobile',
        type: 'boolean', defaultValue: true, label: "Double Tap to Seek", helperText: "Double tap at the sides of the screen to seek forward/backward", frontend: true
    },
    doubleTapSeekSeconds: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'mobile',
        type: 'number', defaultValue: 10, min: 1, label: "Double Tap Seek Time (s)", helperText: "Seconds to seek on double tap", frontend: true
    },
    autoRotate: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'mobile',
        type: 'boolean', defaultValue: true, label: "Mobile Auto-Landscape", helperText: "Automatically enter landscape mode when in fullscreen", frontend: true
    },


    // === 7. Advanced / Experimental ===
    enableHLS: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'advanced',
        type: 'boolean',
        defaultValue: false,
        label: "Enable MKV / HLS Support",
        helperText: "Experimental streaming for .mkv and .m3u8",
        frontend: true
    },
    enable_ffmpeg_transcoding: {
        showIf: x => x.config_tab === 'all' || x.config_tab === 'advanced',
        type: 'boolean',
        defaultValue: false,
        label: "Use FFmpeg for unsupported videos",
        helperText: "Transcodes formats like HEVC on the fly. Requires FFmpeg installed.",
        frontend: true
    },
    enable_transcoding_seeking: {
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'advanced') && x.enable_ffmpeg_transcoding,
        type: 'boolean',
        defaultValue: false,
        label: "Enable Seeking in Transcoded Videos (Beta)",
        helperText: "Experimental. Allows seeking, but may cause instability or delays.",
        frontend: true
    },
    ffmpeg_path: {
        type: 'real_path',
        fileMask: 'ffmpeg*',
        helperText: "Path to ffmpeg executable. Leave empty if in system PATH.",
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'advanced') && x.enable_ffmpeg_transcoding
    },
    ffmpeg_parameters: {
        defaultValue: '',
        helperText: "Additional FFmpeg params (e.g. for hardware accel)",
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'advanced') && x.enable_ffmpeg_transcoding
    },

    // === 8. Transcoding Limits & Security ===
    transcoding_concurrency: {
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'transcoding') && x.enable_ffmpeg_transcoding,
        type: 'number', defaultValue: 3, min: 1, max: 50, label: "Max Global Concurrent Streams", helperText: "Limit total number of active conversions", frontend: true
    },
    transcoding_allow_anonymous: {
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'transcoding') && x.enable_ffmpeg_transcoding,
        type: 'boolean', defaultValue: true, label: "Allow Guest Transcoding", helperText: "If disabled, only logged-in users can stream", frontend: true
    },
    transcoding_rate_limit_per_user: {
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'transcoding') && x.enable_ffmpeg_transcoding && !x.transcoding_allow_anonymous,
        type: 'number', defaultValue: 1, min: 1, max: 10, label: "Max Streams Per User", helperText: "Limit active conversions per account", frontend: true
    },
    transcoding_allowed_users: {
        showIf: x => (x.config_tab === 'all' || x.config_tab === 'transcoding') && x.enable_ffmpeg_transcoding && !x.transcoding_allow_anonymous,
        type: 'username', multiple: true, label: "Allowed Users (Whitelist)", helperText: "Leave empty to allow all logged-in users", frontend: true
    }

};

exports.init = api => {
    const running = new Map() // key=process, value=username
    const { spawn } = api.require('child_process')

    /**
     * Terminate a process safely
     * @param {import('child_process').ChildProcess} proc 
     */
    function terminate(proc) {
        proc.kill()
        setTimeout(() => proc.kill('SIGKILL'), 10_000)
    }

    // cleanup on server exit to prevent zombies
    const onExit = () => {
        for (const proc of running.keys()) terminate(proc);
    };

    process.on('exit', onExit);
    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);

    return {
        unload() {
            process.off('exit', onExit);
            process.off('SIGINT', onExit);
            process.off('SIGTERM', onExit);
            for (const proc of running.keys())
                terminate(proc)
        },
        /**
         * Middleware to intercept ?ffmpeg requests and stream converted video
         * @param {object} ctx - Koa context
         */
        middleware: async ctx => {
            return async () => { // wait for fileSource to be available
                // Only intercept if we are enabled AND querystring is ffmpeg
                const transcodingEnabled = api.getConfig('enable_ffmpeg_transcoding');
                if (!transcodingEnabled) return;

                /* 
                 * LIVE TRANSCODING LOGIC
                 * Adapted from @rejetto/unsupported-videos plugin
                 * Credits to Rejetto for the original implementation.
                 */

                const src = ctx.state.fileSource
                if (!ctx.querystring.startsWith('ffmpeg') || !src) return

                const username = api.getCurrentUsername(ctx);

                // --- Access Control ---
                const allowAnonymous = api.getConfig('transcoding_allow_anonymous');
                if (!allowAnonymous) {
                    if (!username) return ctx.status = 401; // Unauthorized

                    const allowedUsers = api.getConfig('transcoding_allowed_users');
                    if (allowedUsers && allowedUsers.length > 0 && !api.ctxBelongsTo(ctx, allowedUsers)) {
                        return ctx.status = 403; // Forbidden
                    }
                }

                // --- Concurrency Limits (With Preemption) ---
                const maxGlobal = api.getConfig('transcoding_concurrency');
                const maxPerUser = !allowAnonymous ? api.getConfig('transcoding_rate_limit_per_user') : 0;

                // 1. Global Limit Check (Return 503 if overloaded globally)
                if (running.size >= maxGlobal) {
                    // Try to preempt an anonymous process to make room for a user?
                    // For now, simple FIFO logic or Hard Reject.
                    // Let's hard reject for global safety.
                    return ctx.status = 503; // Service Unavailable
                }

                // 2. User Limit Check (Preemption)
                if (maxPerUser > 0) {
                    const userProcs = [];
                    for (const [p, u] of running.entries()) {
                        if (u === username) userProcs.push(p);
                    }

                    if (userProcs.length >= maxPerUser) {
                        // Preemption Logic: Kill the oldest process for this user
                        // The Map inserts in order, so the first one we found is likely the oldest?
                        // Actually Map iteration order is insertion order in JS.
                        const oldest = userProcs[0];
                        console.log(`[VideoJS] User ${username} hit concurrency limit. Preempting old process...`);
                        terminate(oldest);
                        running.delete(oldest);
                        // running.delete is important so we don't count it immediately again, 
                        // though terminate() is async, the removal from our 'running' map acts as the semaphore release.
                    }
                }

                // Per-User Debounce (Map of timeouts)
                // We shouldn't use a global sleep(500) because that blocks the thread or just delays everything.
                // We should use a per-user debounce to avoid "fast seek" spam.
                // However, the "Preemption" logic above handles the spam by killing the old one,
                // so we mainly need to ensure we don't spawn 10 processes in 10ms.
                // The client debounces seeking. Let's keep a small server delay for safety.
                await new Promise(res => setTimeout(res, 200));

                if (ctx.socket.closed) return

                // SECURITY NOTE: These configs are Admin-only.
                // We assume the Admin does not want to hack their own server.
                // However, we should be careful about injection if we ever expose this to non-admins.
                const ffmpegPath = api.getConfig('ffmpeg_path') || 'ffmpeg';
                const extraParamsStr = api.getConfig('ffmpeg_parameters') || '';

                // Improved argument tokenizer
                // Splits by spaces but respects quotes (single and double)
                const extraParams = [];
                let currentToken = '';
                let inQuote = false;
                let quoteChar = '';

                for (let i = 0; i < extraParamsStr.length; i++) {
                    const char = extraParamsStr[i];
                    if (inQuote) {
                        if (char === quoteChar) {
                            inQuote = false;
                        } else {
                            currentToken += char;
                        }
                    } else {
                        if (char === '"' || char === "'") {
                            inQuote = true;
                            quoteChar = char;
                        } else if (char === ' ') {
                            if (currentToken.length > 0) {
                                extraParams.push(currentToken);
                                currentToken = '';
                            }
                        } else {
                            currentToken += char;
                        }
                    }
                }
                if (currentToken.length > 0) extraParams.push(currentToken);

                // Sanitize src? HFS usually provides a clean absolute path in fileSource.
                // But just in case, we trust the `spawn` array method to handle argument escaping for the shell.

                // Seek support via URLSearchParams
                const qs = new URLSearchParams(ctx.querystring);
                const startTimeInput = qs.get('startTime');
                const startTime = startTimeInput ? parseFloat(startTimeInput) : 0;

                console.log(`[VideoJS] FFmpeg Request: ${src} | Start: ${startTime} | QS: ${ctx.querystring}`);

                const mkArgs = (src, start, extra) => {
                    const args = [];
                    // Input seeking is faster: -ss before -i
                    if (start > 0) {
                        args.push('-ss', String(start));
                    }
                    args.push('-i', src);
                    args.push(
                        '-f', 'mp4',
                        '-movflags', 'frag_keyframe+empty_moov+delay_moov',
                        '-vcodec', 'libx264',
                        '-pix_fmt', 'yuv420p',
                        '-acodec', 'aac',
                        '-strict', '-2',
                        '-copyts',
                        '-preset', 'superfast'
                    );
                    if (extra && extra.length > 0) {
                        args.push(...extra);
                    }
                    args.push('pipe:1');
                    return args;
                }

                const proc = spawn(ffmpegPath, mkArgs(src, startTime, extraParams));

                running.set(proc, username)

                proc.on('error', (err) => {
                    console.error("VideoJS FFmpeg Error:", err);
                    running.delete(proc);
                })
                proc.on('exit', (code) => {
                    if (code !== 0 && code !== null) console.log("VideoJS FFmpeg Exited with code:", code);
                    running.delete(proc);
                })

                // Pipe stderr to console for debugging
                proc.stderr.on('data', x => console.log('VideoJS FFmpeg:', String(x)))

                ctx.type = 'video/mp4'
                ctx.body = proc.stdout
                ctx.req.on('end', () => terminate(proc))
                return ctx.status = 200
            }
        }
    }
}