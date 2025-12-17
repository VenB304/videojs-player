exports.description = "Replaces the default video player with Video.js";
exports.version = 1.0;
exports.apiRequired = 10.0; // Ensures HFS version is compatible
exports.repo = "rejetto/videojs-player"; // REPLACE THIS WITH YOUR ACTUAL REPO URL

// HFS allows loading external URLs directly in frontend_js/css
exports.frontend_css = [
    'video-js.css', // Local Video.js Styles
];

exports.frontend_js = [
    'video.min.js', // Local Video.js Library
    'player.js'     // Your custom script (in public folder)
];