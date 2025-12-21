exports.description = "A Video.js player plugin for HFS.";
exports.version = 169;
exports.apiRequired = 10.0; // Ensures HFS version is compatible
exports.repo = "VenB304/videojs-player";
exports.preview = ["https://github.com/user-attachments/assets/d8502d67-6c5b-4a9a-9f05-e5653122820c", "https://github.com/user-attachments/assets/39be202e-fbb9-42de-8aea-3cf8852f1018", "https://github.com/user-attachments/assets/5e21ffca-5a4c-4905-b862-660eafafe690"]
// HFS allows loading external URLs directly in frontend_js/css
exports.frontend_css = [
    'video-js.css', // Local Video.js Styles
    'themes.css',    // Official Themes Bundle
    'custom.css'     // Plugin Specific Styles
];

exports.frontend_js = [
    'video.min.js', // Local Video.js Library
    'player.js'     // Your custom script (in public folder)
];

exports.config = {

    // === Configuration Group Selector ===
    config_tab: {
        type: 'select',
        defaultValue: 'playback',
        options: {
            '1. Playback': 'playback',
            '2. Interface': 'ui',
            '3. Layout': 'layout',
            '4. Interaction': 'input',
            '5. Transcoding & Advanced': 'transcoding'
        },
        label: "Configuration Category",
        helperText: "Select a category to view and edit settings.",
        frontend: true
    },

    // === 1. Playback Settings ===
    autoplay: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: true, label: "Autoplay Video", helperText: "Start playing immediately when the page loads. Note: Browsers may block this if audio is enabled.", frontend: true
    },
    muted: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: false, label: "Start Muted", helperText: "Mutes the video on start. Required for 'Autoplay' to work consistently in Chrome/Edge/Firefox.", frontend: true
    },
    loop: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: false, label: "Loop Playback", helperText: "Automatically replay the video when it ends.", frontend: true
    },
    preload: {
        showIf: x => x.config_tab === 'playback',
        type: 'select',
        defaultValue: 'metadata',
        options: { 'Metadata (Fastest)': 'metadata', 'Auto (Buffer)': 'auto', 'None (Save Bandwidth)': 'none' },
        label: "Preload Strategy",
        helperText: "'Metadata' loads duration only. 'Auto' downloads some video data. 'None' waits for play.",
        frontend: true
    },
    resumePlayback: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: true, label: "Remember Playback Position (Resume)", helperText: "Saves your progress and resumes video where you left off. (Disabled for Transcoded streams)", frontend: true
    },
    persistentVolume: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: true, label: "Remember Volume Level", helperText: "Saves your volume preference between plays.", frontend: true
    },
    volume: {
        showIf: x => x.config_tab === 'playback',
        type: 'number', defaultValue: 100, min: 0, max: 100, step: 5, label: "Default Volume (%)", helperText: "Initial volume if no preference is saved. (0-100)", frontend: true
    },
    playbackRates: {
        showIf: x => x.config_tab === 'playback',
        type: 'string', defaultValue: "0.5, 1, 1.5, 2", label: "Available Speed Options", helperText: "Comma-separated list of playback speeds (e.g. 0.5, 1, 2) available in the menu.", frontend: true
    },
    enableAudio: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: false, label: "Enable Audio Player Mode", helperText: "If enabled, audio files (mp3, wav) will use this player instead of the browser default. Posters are hidden in audio mode.", frontend: true
    },
    enableSubtitlePluginIntegration: {
        showIf: x => x.config_tab === 'playback',
        type: 'boolean', defaultValue: false, label: "Integrate 'hfs-subtitles' Plugin", helperText: "Detects the 'hfs-subtitles' plugin to provide advanced subtitle selection. Requires that plugin to be installed separately.", frontend: true
    },


    // === 2. Interface Settings ===
    controls: {
        showIf: x => x.config_tab === 'ui',
        type: 'boolean', defaultValue: true, label: "Show Control Bar", helperText: "Uncheck to hide all controls (Play/Pause/Timeline). Useful for background videos.", frontend: true
    },
    inactivityTimeout: {
        showIf: x => x.config_tab === 'ui',
        type: 'number', defaultValue: 2000, min: 0, label: "Auto-Hide Controls (ms)", helperText: "How long controls stay visible after mouse movement. Set 0 to keep always visible.", frontend: true
    },
    theme: {
        showIf: x => x.config_tab === 'ui',
        type: 'select',
        defaultValue: 'default',
        options: {
            'Standard (Default)': 'default',
            'City (Modern)': 'city',
            'Fantasy (Classic)': 'fantasy',
            'Forest (Green)': 'forest',
            'Sea (Blue)': 'sea'
        },
        label: "Player Theme",
        helperText: "Choose a visual style provided by Video.js themes.",
        frontend: true
    },
    showSeekButtons: {
        showIf: x => x.config_tab === 'ui',
        type: 'boolean', defaultValue: true, label: "Show Seek Buttons (+/- 10s)", helperText: "Adds quick rewind/forward buttons to the control bar.", frontend: true
    },
    seekButtonStep: {
        showIf: x => x.config_tab === 'ui',
        type: 'number', defaultValue: 10, min: 1, label: "Seek Button Step (Seconds)", helperText: "Time to skip when clicking the seek buttons.", frontend: true
    },
    showDownloadButton: {
        showIf: x => x.config_tab === 'ui',
        type: 'boolean', defaultValue: true, label: "Show Download Button", helperText: "Adds a download icon to the control bar to download the original file.", frontend: true
    },
    enablePiP: {
        showIf: x => x.config_tab === 'ui',
        type: 'boolean', defaultValue: true, label: "Picture-in-Picture Button", helperText: "Allow users to pop the video out into a floating window.", frontend: true
    },
    errorStyle: {
        showIf: x => x.config_tab === 'ui',
        type: 'select', options: ['overlay', 'toast'], defaultValue: 'overlay', label: "Error Notification Style", helperText: "'Overlay' covers the player. 'Toast' shows a popup message.", frontend: true
    },


    // === 3. Layout Settings ===
    sizingMode: {
        showIf: x => x.config_tab === 'layout',
        type: 'select',
        defaultValue: 'fluid',
        options: {
            'Fluid (Responsive & Transparent)': 'fluid',
            'Fill (100% Parent Block)': 'fill',
            'Fixed (Custom Size)': 'fixed',
            'Native (Video Intrinsic Size)': 'native'
        },
        label: "Player Sizing Mode",
        helperText: "Fluid: Responsive. Fill: 100% Block. Fixed: Custom Px. Native: Source Px.",
        frontend: true
    },
    fixedWidth: {
        type: 'number',
        defaultValue: 640,
        min: 0,
        label: "Fixed Width (px)",
        helperText: "Width for 'Fixed' mode.",
        frontend: true,
        showIf: x => x.config_tab === 'layout' && x.sizingMode === 'fixed'
    },
    fixedHeight: {
        type: 'number',
        defaultValue: 360,
        min: 0,
        label: "Fixed Height (px)",
        helperText: "Height for 'Fixed' mode.",
        frontend: true,
        showIf: x => x.config_tab === 'layout' && x.sizingMode === 'fixed'
    },


    // === 4. Interaction Settings ===
    enableHotkeys: {
        showIf: x => x.config_tab === 'input',
        type: 'boolean', defaultValue: true, label: "Enable Keyboard Hotkeys", helperText: "Space (Pause), F (Fullscreen), M (Mute), Arrows (Seek/Volume).", frontend: true
    },
    hotkeySeekStep: {
        showIf: x => x.config_tab === 'input',
        type: 'number', defaultValue: 5, min: 1, label: "Arrow Key Seek Time", helperText: "Seconds to skip when pressing Left/Right arrows.", frontend: true
    },
    hotkeyVolumeStep: {
        showIf: x => x.config_tab === 'input',
        type: 'number', defaultValue: 5, min: 1, max: 100, label: "Arrow Key Volume Step", helperText: "Volume change % when pressing Up/Down arrows.", frontend: true
    },
    enableScrollVolume: {
        showIf: x => x.config_tab === 'input',
        type: 'boolean', defaultValue: true, label: "Scroll to Change Volume", helperText: "Change volume by scrolling the mouse wheel over the video area.", frontend: true
    },
    enableDoubleTap: {
        showIf: x => x.config_tab === 'input',
        type: 'boolean', defaultValue: true, label: "Double Tap to Seek", helperText: "Like YouTube/Netflix. Double tap the sides of the screen to seek.", frontend: true
    },
    doubleTapSeekSeconds: {
        showIf: x => x.config_tab === 'input',
        type: 'number', defaultValue: 10, min: 1, label: "Double Tap Seconds", helperText: "Time skipped per double-tap.", frontend: true
    },
    autoRotate: {
        showIf: x => x.config_tab === 'input',
        type: 'boolean', defaultValue: true, label: "Mobile Auto-Landscape", helperText: "Automatically locks screen to landscape when entering fullscreen on phones.", frontend: true
    },


    // === 5. Transcoding & Advanced ===
    enableHLS: {
        showIf: x => x.config_tab === 'transcoding',
        type: 'boolean',
        defaultValue: false,
        label: "Enable HLS/MKV Client Support",
        helperText: "Tries to play .m3u8 or .mkv files natively. Experimental.",
        frontend: true
    },
    enable_ffmpeg_transcoding: {
        showIf: x => x.config_tab === 'transcoding',
        type: 'boolean',
        defaultValue: false,
        label: "Enable FFmpeg Server Transcoding",
        helperText: "Allows playing unsupported files (HEVC, AVI, etc.) by converting them on the server. Requires FFmpeg installed.",
        frontend: true
    },
    enable_direct_link_player: {
        showIf: x => x.config_tab === 'transcoding',
        type: 'boolean',
        defaultValue: false,
        label: "Replace Direct Download Links",
        helperText: "If enabled, accessing a video file directly opens it in this player instead of downloading it. Works with HFS Share Links.",
        frontend: true
    },
    enable_transcoding_seeking: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding,
        type: 'boolean',
        defaultValue: false,
        label: "Allow Seeking in Transcoded Videos (Experimental)",
        helperText: "Enables seeking for converted videos. May be slow or unstable depending on CPU/Server speed.",
        frontend: true
    },
    ffmpeg_hardware_accel: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding,
        type: 'select',
        defaultValue: 'cpu',
        options: {
            'Software (x264)': 'cpu',
            'Intel Quick Sync': 'intel_qsv',
            'NVIDIA NVENC': 'nvidia_nvenc',
            'AMD AMF': 'amd_amf',
            'Apple VideoToolbox': 'apple_vt',
            'VAAPI (Linux)': 'vaapi',
            'Stream Copy (No Transcoding)': 'copy',
            'Custom (Manual Configuration)': 'custom'
        },
        label: "Hardware Acceleration",
        helperText: "Select the encoder backend. Ensure your hardware supports it.",
        frontend: true
    },

    // --- Dynamic Presets (Conditional) ---
    preset_cpu: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'cpu',
        type: 'select', defaultValue: 'medium',
        options: { 'Ultrafast': 'ultrafast', 'Superfast': 'superfast', 'Veryfast': 'veryfast', 'Faster': 'faster', 'Fast': 'fast', 'Medium (Default)': 'medium', 'Slow': 'slow', 'Slower': 'slower', 'Veryslow': 'veryslow' },
        label: "x264 Preset", helperText: "Speed vs Quality tradeoff.", frontend: true
    },
    preset_intel_qsv: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'intel_qsv',
        type: 'select', defaultValue: 'balanced',
        options: { 'Very Fast': 'veryfast', 'Faster': 'faster', 'Balanced (Default)': 'balanced', 'Better': 'better', 'Best': 'best' },
        label: "QSV Preset", helperText: "Intel QuickSync Quality Balance.", frontend: true
    },
    preset_nvidia_nvenc: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'nvidia_nvenc',
        type: 'select', defaultValue: 'balanced',
        options: { 'Fastest (p1)': 'fastest', 'Fast (p3)': 'fast', 'Balanced (p5)': 'balanced', 'Quality (p6)': 'quality', 'Best Quality (p7)': 'best_quality' },
        label: "NVENC Preset", helperText: "NVIDIA Encoder Quality (P-States).", frontend: true
    },
    preset_amd_amf: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'amd_amf',
        type: 'select', defaultValue: 'balanced',
        options: { 'Speed': 'speed', 'Balanced': 'balanced', 'Quality': 'quality' },
        label: "AMF Preset", helperText: "AMD Advanced Media Framework Quality.", frontend: true
    },
    preset_apple_vt: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'apple_vt',
        type: 'select', defaultValue: 'balanced',
        options: { 'Low Latency': 'low-latency', 'Balanced': 'balanced', 'Quality': 'quality' },
        label: "VideoToolbox Preset", helperText: "Apple Hardware Encoder Quality.", frontend: true
    },
    preset_vaapi: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'vaapi',
        type: 'select', defaultValue: 'balanced',
        options: { 'Fast': 'fast', 'Balanced': 'balanced', 'Quality': 'quality' },
        label: "VAAPI Preset", helperText: "Linux VAAPI Quality Simulation.", frontend: true
    },

    ffmpeg_path: {
        type: 'real_path',
        fileMask: 'ffmpeg*',
        label: "FFmpeg Executable Path",
        helperText: "Path to the ffmpeg.exe or binary. Leave empty if added to system PATH.",
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding
    },
    ffmpeg_parameters: {
        defaultValue: '',
        label: "Custom FFmpeg Flags",
        helperText: "Enter custom parameters (e.g. -c:v libx265 -crf 23). These are appended to the command. Only visible in 'Custom' mode.",
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && x.ffmpeg_hardware_accel === 'custom'
    },
    transcoding_concurrency: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding,
        type: 'number', defaultValue: 3, min: 1, max: 50, label: "Max Global Concurrent Streams", helperText: "Prevents server overload. Maximum number of conversions happening at once.", frontend: true
    },
    transcoding_allow_anonymous: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding,
        type: 'boolean', defaultValue: true, label: "Allow Guest Transcoding", helperText: "If unchecked, guests must log in to play unsupported videos that require transcoding.", frontend: true
    },
    transcoding_rate_limit_per_user: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && !x.transcoding_allow_anonymous,
        type: 'number', defaultValue: 1, min: 1, max: 10, label: "Max Streams Per User", helperText: "Limit how many videos a single user can convert at once.", frontend: true
    },
    transcoding_allowed_users: {
        showIf: x => x.config_tab === 'transcoding' && x.enable_ffmpeg_transcoding && !x.transcoding_allow_anonymous,
        type: 'username', multiple: true, label: "Whitelisted Users (Access List)", helperText: "Only these users can trigger transcoding. Leave empty to allow all logged-in users.", frontend: true
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

    /**
     * Generates the standalone HTML page for the player.
     * @param {object} api - Plugin API
     * @param {object} ctx - Koa context
     */
    function generatePlayerHtml(api, ctx) {
        // Construct paths to public assets
        // Use api.id (the plugin folder name) instead of exports.repo to ensure correct path regardless of installation folder
        const p = "/~/plugins/" + api.id + "/";

        // Construct configuration object manually since api.getPluginConfig might not be available
        const config = {};
        for (const key in exports.config) {
            config[key] = api.getConfig(key);
        }

        // Ensure the config we pass has the correct structure for the player
        // The player expects standard keys.

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Video Player</title>
    <link href="${p}video-js.css" rel="stylesheet">
    <link href="${p}themes.css" rel="stylesheet">
    <link href="${p}custom.css" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
        #root { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        /* Fix for Preact not automatically mounting sometimes? */
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- Dependencies (Local) -->
    <script src="${p}video.min.js"></script>
    <script src="${p}preact.min.js"></script>
    <script src="${p}hooks.min.js"></script>

    <!-- Mock HFS Environment -->
    <script>
        // Polyfill HFS Global for the player script
        // We are using raw Preact, so we need to bridge it to look like React
        window.HFS = {
            getPluginConfig: () => (${JSON.stringify(config)}),
            React: window.preact,
            h: window.preact.h,
            onEvent: () => {}, // No-op for standalone mode
            // Mock other used HFS functions if any
            markVideoComponent: (c) => c,
            markAudioComponent: (c) => c,
            // Minimal toast for notifications
            toast: (msg, type) => {
                console.log('[Toast]', type, msg);
                // We could implement a simple HTML toast here if needed
            }
        };

        // Initialize React object from Preact
        window.React = window.preact;
        window.h = window.preact.h;

        // Attach Hooks
        if (window.preactHooks) {
            Object.assign(window.React, window.preactHooks);
        } else {
             console.error("VideoJS Player: preactHooks not found. Hooks will fail.");
        }

        // Polyfill forwardRef (Not in raw Preact, usually in preact/compat)
        // Simple implementation: Just treat it as a HOC that passes ref down
        if (!window.React.forwardRef) {
            window.React.forwardRef = function(fn) {
                return function(props) {
                    return fn(props, props.ref);
                }
            };
        }
    </script>

    <!-- Player Script -->
    <script src="${p}player.js"></script>

    <!-- Mount App -->
    <script>
        (function() {
            const { h, render } = window.preact;
            const VideoJsPlayer = window.VideoJsPlayer;

            if (VideoJsPlayer) {
                // Determine SRC
                // Check if 'sharelink' is present, if so, we must preserve it in the src
                const params = new URLSearchParams(window.location.search);
                
                // If we are here, we are intercepting.
                // We need to fetch the RAW video.
                // We append 'raw=1' to current URL.
                // BUT if sharelink is present, HFS share-links logic might need 'sharelink' param to authorize.
                // Middleware checks 'sharelink' param.
                
                // Construct the src URL
                // If we simply append raw=1, HFS (and our middleware) will skip interception.
                // HFS core will serve the file if we satisfy permissions.
                
                // Clone current params and add raw=1
                params.append('raw', '1');
                
                // Current path + params
                const src = window.location.pathname + '?' + params.toString();
                
                // Props
                const props = {
                    src: src,
                    poster: "", // No easy way to get poster in standalone mode without extra request
                    className: "showing" // Trigger full size styles
                };
                
                const root = document.getElementById('root');
                render(h(VideoJsPlayer, props), root);
            } else {
                console.error("VideoJsPlayer component not found. script loading failed?");
                document.getElementById('root').innerHTML = "<div style='color:white;text-align:center;'>Player Load Error</div>";
            }
        })();
    </script>
</body>
</html>`;
    }

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

                // --- DIRECT LINK PLAYER LOGIC ---
                const directLinkEnabled = api.getConfig('enable_direct_link_player');
                const dlSrc = ctx.state.fileSource;

                // Compatibility Checks:
                // 1. Must be enabled
                // 2. Must be browser navigation (accepts html)
                // 3. Must NOT be 'raw' access (standard HFS param)
                // 4. Must NOT be 'dl' access (force download)
                // 5. Must NOT have 'player=0' (manual bypass)
                // 6. Must be a supported video file OR a sharelink

                const isHtmlReq = ctx.get('Accept')?.includes('text/html');
                const dlQs = new URLSearchParams(ctx.querystring);
                const isRaw = dlQs.has('raw') || dlQs.has('dl') || dlQs.get('player') === '0';

                if (directLinkEnabled && isHtmlReq && !isRaw && dlSrc) {
                    const ext = dlSrc.substring(dlSrc.lastIndexOf('.')).toLowerCase();
                    const VIDEO_EXTS = ['.mp4', '.webm', '.ogv', '.mov', '.mkv', '.avi', '.wma', '.m4v'];

                    // Special Case: Share Links (token in query or path?)
                    // HFS Share Links plugin passes 'sharelink' query param.
                    const isShareLink = dlQs.has('sharelink');

                    if (VIDEO_EXTS.includes(ext) || isShareLink) {
                        ctx.type = 'text/html';
                        ctx.body = generatePlayerHtml(api, ctx);
                        return; // Stop processing, serve player
                    }
                }

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
                    ctx.set('X-Transcode-Reason', 'global_limit');
                    ctx.status = 503;
                    ctx.body = "Service Unavailable: Too many concurrent transcoding requests.";
                    return;
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
                const hardware = api.getConfig('ffmpeg_hardware_accel') || 'cpu';

                // --- SECURITY: Input Validation ---
                // Validate ffmpegPath to prevent command injection
                if (/[;&|]/.test(ffmpegPath)) {
                    console.error(`[VideoJS] Security Error: Invalid characters detected in ffmpeg_path: ${ffmpegPath}`);
                    return ctx.status = 500;
                }


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

                console.log(`[VideoJS] FFmpeg Request: ${src} | Start: ${startTime} | HW: ${hardware}`);

                const mkArgs = (src, start, extra) => {
                    const args = [];
                    // Input seeking is faster: -ss before -i
                    if (start > 0) {
                        args.push('-ss', String(start));
                    }
                    args.push('-i', src);



                    // --- Dynamic Hardware Logic ---

                    if (hardware === 'custom') {
                        // Custom Mode: Minimal defaults + User Parameters
                        args.push(
                            '-f', 'mp4',
                            '-movflags', 'frag_keyframe+empty_moov+delay_moov',
                            '-strict', '-2'
                        );
                        // Append User Parameters (ffmpeg_parameters)
                        if (extra && extra.length > 0) {
                            args.push(...extra);
                        }
                    } else {
                        // Standard Mode: Apply Base Container Flags
                        args.push(
                            '-f', 'mp4',
                            '-movflags', 'frag_keyframe+empty_moov+delay_moov',
                            '-strict', '-2',
                            '-c:a', 'aac', // Always AAC for safety
                            '-ac', '2'     // Stereo
                        );

                        // --- Encoder Selection ---
                        const getPreset = (name) => api.getConfig(name) || 'balanced'; // Fallback

                        switch (hardware) {
                            case 'intel_qsv': {
                                const p = getPreset('preset_intel_qsv');
                                const pMap = {
                                    'veryfast': '7', 'faster': '6', 'balanced': '4', 'better': '2', 'best': '1'
                                };
                                args.push(
                                    '-c:v', 'h264_qsv',
                                    '-preset', pMap[p] || '4',
                                    '-global_quality', '23',
                                    '-load_plugin', 'hevc_hw'
                                );
                                break;
                            }
                            case 'nvidia_nvenc': {
                                const p = getPreset('preset_nvidia_nvenc');
                                const pMap = {
                                    'fastest': 'p1', 'fast': 'p3', 'balanced': 'p5', 'quality': 'p6', 'best_quality': 'p7'
                                };
                                args.push(
                                    '-c:v', 'h264_nvenc',
                                    '-preset', pMap[p] || 'p5',
                                    '-tune', 'll' // Low Latency tune is usually good for streaming
                                );
                                break;
                            }
                            case 'amd_amf': {
                                const p = getPreset('preset_amd_amf');
                                args.push(
                                    '-c:v', 'h264_amf',
                                    '-usage', 'transcoding', // Optimize for streaming
                                    '-quality', p // speed, balanced, quality
                                );
                                break;
                            }
                            case 'apple_vt': {
                                const p = getPreset('preset_apple_vt');
                                args.push(
                                    '-c:v', 'h264_videotoolbox',
                                    '-realtime', 'true'
                                );
                                break;
                            }
                            case 'vaapi': {
                                const p = getPreset('preset_vaapi');
                                args.push('-c:v', 'h264_vaapi');
                                // Simulate presets
                                if (p === 'fast') args.push('-qp', '28');
                                else if (p === 'quality') args.push('-qp', '20');
                                else args.push('-qp', '24'); // Balanced
                                break;
                            }
                            case 'copy': {
                                // Stream Copy (Passthrough)
                                args.push('-c', 'copy');
                                break;
                            }
                            case 'cpu':
                            default: {
                                const p = getPreset('preset_cpu');
                                args.push(
                                    '-c:v', 'libx264',
                                    '-preset', p, // ultrafast ... veryslow matches ffmpeg directly
                                    '-pix_fmt', 'yuv420p'
                                );
                                break;
                            }
                        }

                        // CopyTS logic
                        args.push('-copyts');
                    }

                    args.push('pipe:1');
                    return args;
                }

                // --- OPTIMIZATION: Process Priority ---
                // Lower priority to keep HFS responsive
                let spawnCmd = ffmpegPath;
                let spawnArgs = mkArgs(src, startTime, extraParams);
                let spawnOptions = {};

                if (process.platform === 'win32') {
                    // Windows: Use 'cmd /c start /BELOWNORMAL /B ...'
                    // This is tricky with spawn because we need to wrap the whole command.
                    // Instead, we can try to rely on 'start' command. 
                    // However, piping stdout from 'start' is hard.
                    // ALTERNATIVE: Just spawn normally, HFS/Node usually handle this fine.
                    // BUT USER REQUESTED PRIORITY. 
                    // Let's use 'wmic' or PowerShell AFTER spawn? No, too slow.
                    // Let's stick to standard spawn for reliability unless we are sure.
                    // Wait, we can use a small trick:
                    // spawn('cmd', ['/c', 'start', '/b', '/belownormal', '/wait', 'ffmpeg', ...])
                    // But 'start' doesn't pipe stdout standardly. 

                    // DECISION: On Windows, simple spawn is safer for piping. 
                    // We will attempt to use 'nice' ONLY on Linux/Mac/Docker.
                } else {
                    // Linux/Mac: Use 'nice'
                    spawnCmd = 'nice'; // Use nice binary
                    spawnArgs = ['-n', '10', ffmpegPath, ...spawnArgs];
                }

                // const proc = spawn(ffmpegPath, mkArgs(src, startTime, extraParams));
                const proc = spawn(spawnCmd, spawnArgs, spawnOptions);


                running.set(proc, username)

                proc.on('error', (err) => {
                    console.error("VideoJS FFmpeg Error:", err);
                    if (err.code === 'ENOENT') {
                        console.error("VideoJS Critical Error: FFmpeg binary not found. Check 'ffmpeg_path' in plugin settings.");
                    }
                    running.delete(proc);
                })
                proc.on('exit', (code) => {
                    if (code !== 0 && code !== null) {
                        console.log("VideoJS FFmpeg Process Exited with Error Code:", code);
                        if (code === 1) console.log("VideoJS Hint: Possible invalid arguments or unsupported codec/preset.");
                    }
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