exports.description = "Upgrade your HFS streaming experience with Video.js - a modern, responsive HTML5 video player.";
exports.version = 26;
exports.apiRequired = 10.0; // Ensures HFS version is compatible
exports.repo = "VenB304/videojs-player";

// HFS allows loading external URLs directly in frontend_js/css
exports.frontend_css = [
    'video-js.css', // Local Video.js Styles
];

exports.frontend_js = [
    'video.min.js', // Local Video.js Library
    'player.js'     // Your custom script (in public folder)
];

exports.config = {
    autoplay: { type: 'boolean', defaultValue: true, label: "Autoplay", frontend: true },
    loop: { type: 'boolean', defaultValue: false, label: "Loop", frontend: true },
    muted: { type: 'boolean', defaultValue: false, label: "Start Muted", helperText: "Useful for browsers that block autoplay with sound", frontend: true },
    controls: { type: 'boolean', defaultValue: true, label: "Show Controls", frontend: true },
    volume: { type: 'number', defaultValue: 1.0, min: 0, max: 1, step: 0.1, label: "Default Volume", helperText: "0.0 to 1.0", frontend: true },
    sizingMode: {
        type: 'select',
        defaultValue: 'fit',
        options: { 'Fit to Container': 'fit', 'Fluid (Full Width)': 'fluid', 'Native Size': 'native' },
        label: "Sizing Mode",
        frontend: true
    },
    fillContainer: { type: 'boolean', defaultValue: false, label: "Fill Container (Crop)", helperText: "Zoom to fill entire area (object-fit: cover)", frontend: true },
    playbackRates: { type: 'string', defaultValue: "0.5, 1, 1.5, 2", label: "Playback Rates", helperText: "Comma separated numbers", frontend: true },
    preload: {
        type: 'select',
        defaultValue: 'metadata',
        options: { 'Metadata': 'metadata', 'Auto': 'auto', 'None': 'none' },
        label: "Preload Strategy",
        frontend: true
    },
    enableHLS: { type: 'boolean', defaultValue: false, label: "Enable MKV/HLS Support", helperText: "Treat .mkv/.m3u8 as playable streams (experimental)", frontend: true }
};