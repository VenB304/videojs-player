exports.description = "Upgrade your HFS streaming experience with Video.js - a modern, responsive HTML5 video player.";
exports.version = 1.0;
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