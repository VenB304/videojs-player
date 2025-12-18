exports.description = "A Video.js player plugin for HFS.";
exports.version = 65;
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
    // --- Core Playback ---
    autoplay: { type: 'boolean', defaultValue: true, label: "Autoplay", frontend: true },
    loop: { type: 'boolean', defaultValue: false, label: "Loop", frontend: true },
    muted: { type: 'boolean', defaultValue: false, label: "Start Muted", helperText: "Useful for browsers that block autoplay with sound", frontend: true },
    resumePlayback: { type: 'boolean', defaultValue: true, label: "Resume Playback", helperText: "Continue from last position", frontend: true },
    preload: {
        type: 'select',
        defaultValue: 'metadata',
        options: { 'Metadata': 'metadata', 'Auto': 'auto', 'None': 'none' },
        label: "Preload Strategy",
        frontend: true
    },
    enableHLS: { type: 'boolean', defaultValue: false, label: "Enable MKV/HLS Support", helperText: "Treat .mkv/.m3u8 as playable streams (experimental)", frontend: true },
    playbackRates: { type: 'string', defaultValue: "0.5, 1, 1.5, 2", label: "Playback Rates", helperText: "Comma separated numbers", frontend: true },

    // --- Volume & Audio ---
    volume: { type: 'number', defaultValue: 100, min: 0, max: 100, step: 5, label: "Default Volume (%)", helperText: "0 to 100", frontend: true },
    persistentVolume: { type: 'boolean', defaultValue: true, label: "Remember Volume", helperText: "Save volume between sessions", frontend: true },
    hotkeyVolumeStep: { type: 'number', defaultValue: 10, min: 1, max: 100, label: "Hotkey Volume Step (%)", helperText: "Volume change per arrow key press", frontend: true },

    // --- Interface & Controls ---
    controls: { type: 'boolean', defaultValue: true, label: "Show Controls", helperText: "Enables the control bar", frontend: true },
    inactivityTimeout: { type: 'number', defaultValue: 2000, min: 0, label: "Controls Hide Delay (ms)", helperText: "Time before controls hide (0 = always on)", frontend: true },
    showDownloadButton: { type: 'boolean', defaultValue: true, label: "Show Download Button", helperText: "Adds a download icon to control bar", frontend: true },
    theme: {
        type: 'select',
        defaultValue: 'default',
        options: { 'Standard (Default)': 'default', 'City': 'city', 'Fantasy': 'fantasy', 'Forest': 'forest', 'Sea': 'sea' },
        label: "Player Theme",
        frontend: true
    },
    hevcErrorStyle: {
        type: 'select',
        defaultValue: 'overlay',
        options: { 'Player Overlay (Default)': 'overlay', 'System Notification': 'toast' },
        label: "HEVC Error Style",
        frontend: true
    },

    // --- Seeking & Navigation ---
    showSeekButtons: { type: 'boolean', defaultValue: true, label: "Show Seek Buttons", helperText: "Adds +/- seek buttons to control bar", frontend: true },
    seekButtonStep: { type: 'number', defaultValue: 10, min: 1, label: "Seek Button Time (s)", helperText: "Seconds to seek with on-screen buttons", frontend: true },
    enableHotkeys: { type: 'boolean', defaultValue: true, label: "Enable Hotkeys", helperText: "Keyboard shortcuts (Space, F, Arrows, M)", frontend: true },
    hotkeySeekStep: { type: 'number', defaultValue: 5, min: 1, label: "Hotkey Seek Time (s)", helperText: "Seconds to seek with arrow keys", frontend: true },
    enableDoubleTap: { type: 'boolean', defaultValue: true, label: "Double Tap to Seek", helperText: "Enable double tap gestures on mobile", frontend: true },
    doubleTapSeekSeconds: { type: 'number', defaultValue: 10, min: 1, label: "Double Tap Seek Time (s)", helperText: "Seconds to seek on double tap", frontend: true },

    // --- Layout & Sizing ---
    sizingMode: {
        type: 'select',
        defaultValue: 'fluid',
        options: { 'Fluid': 'fluid', 'Fill': 'fill', 'Fixed / Native': 'native' },
        label: "Sizing Mode",
        frontend: true
    },
    fixedWidth: { type: 'number', defaultValue: 640, min: 0, label: "Fixed Width (px)", helperText: "Default 640. Set to 0 for Intrinsic/Native size", frontend: true },
    fixedHeight: { type: 'number', defaultValue: 360, min: 0, label: "Fixed Height (px)", helperText: "Default 360. Set to 0 for Intrinsic/Native size", frontend: true },
    autoRotate: { type: 'boolean', defaultValue: true, label: "Mobile Auto-Rotate", helperText: "Automatically rotate to landscape in fullscreen", frontend: true }
};