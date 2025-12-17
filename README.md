# VideoJS Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.com/) - a modern, responsive HTML5 video player.

## Features

- **Modern Player**: Replaces the default browser player with a sleek, customizable Video.js interface.
- **HFS Integration**:
  - Fully supports HFS's **Autoplay** and **Next File** logic (videos play sequentially).
  - Respects HFS permissions and authentication (HAP).
- **Responsive Layout**:
  - **Fit to Container**: Intelligently sizes the video to fit the screen without upscaling (default).
  - **Fluid Mode**: Standard responsive width (may overflow vertically on tall videos).
  - **Native Size**: Displays the video at its original resolution.
- **Experimental Format Support**:
  - Toggle support for **HLS (.m3u8)** and **MKV** (WebM-compatible codecs) directly in the browser (no transcoding).
- **Customizable**: extensive configuration options available directly in the HFS Admin Panel.

## Installation

### Automatic (Recommended)
1. Go to your **HFS Admin Panel**.
2. Navigate to the **Search online** tab in the Plugins section.
3. Search for `videojs-player`.
4. Click **Install**.

### Manual
1. Copy the `dist` folder to your HFS `plugins` directory.
2. Rename the folder to `videojs-player`.

## Configuration

You can customize the player behavior in **Admin Panel > Plugins > videojs-player**.

### Playback Settings
- **Autoplay**: Start playing immediately when the file loads. (Default: `On`)
- **Loop**: Restart the video automatically when it finishes. (Default: `Off`)
- **Start Muted**: Important for browsers that block autoplay with sound. (Default: `Off`)
- **Show Controls**: Display the play/pause, volume, and seek controls. (Default: `On`)
- **Default Volume**: Set the startup volume level (0.0 to 1.0).

### Layout & Visuals
- **Sizing Mode**:
  - `Fit to Container`: Best for most users. Ensures the whole video is visible without scrolling.
  - `Fluid`: Fills 100% width. Good for standard 16:9 content, but may push controls off-screen for tall videos.
  - `Native Size`: Shows the raw video dimensions.
- **Fill Container (Crop)**: Zooms the video to fill the entire container (`object-fit: cover`). Ideal for background-style playback.

### Advanced
- **Playback Rates**: Customize the speed options in the menu (e.g., `0.5, 1, 1.5, 2`).
- **Preload Strategy**: Control how much data loads before playback (`Metadata`, `Auto`, `None`).
- **Enable MKV/HLS Support**: Attempts to play `.m3u8` streams and `.mkv` files natively. 
  > **Note**: This is client-side only. It works if your browser supports the underlying codecs (e.g., Chrome playing H.264 in MKV). It does **not** transcode incompatible formats.

# Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students