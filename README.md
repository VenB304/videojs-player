# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.com/) - a modern, responsive HTML5 video player.

## Preview
### Desktop
<img width="1920" height="922" alt="image" src="https://github.com/user-attachments/assets/d8502d67-6c5b-4a9a-9f05-e5653122820c" />

### Mobile
<img width="383" height="828" alt="image" src="https://github.com/user-attachments/assets/39be202e-fbb9-42de-8aea-3cf8852f1018" />

### Admin
<img width="890" height="861" alt="image" src="https://github.com/user-attachments/assets/5e21ffca-5a4c-4905-b862-660eafafe690" />


## 🌟 Why use this plugin?

The default HFS player is functional but basic. This plugin replaces it with a professional-grade player used by millions of websites. It allows for:
- **Sequential Playback**: Fully integrates with HFS's autoplay to play the next file automatically.
- **Better Format Support**: Adds experimental support for **MKV** and **HLS (.m3u8)** streams.
- **Responsive Design**: Looks great on mobile and desktop, with multiple sizing modes.
- **Customizable**: extensive configuration options available directly in the HFS Admin Panel.

## 🚀 Installation

### Automatic (Recommended)
1. Go to your **HFS Admin Panel**.
2. Navigate to the **Search online** tab in the Plugins section.
3. Search for `videojs-player`.
4. Click **Install**.

### Manual
1. Download the `dist` folder from this repository.
2. Copy it to your HFS `plugins` directory.
3. Rename the folder to `videojs-player`.
4. Restart HFS or reload plugins.

## ⚙️ Configuration Guide

You can customize the player behavior in **Admin Panel > Plugins > videojs-player**.

### Playback Settings
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Autoplay** | Automatically plays the video when loaded. Essential for HFS playslists ("Play All") to work seamlessly. | `On` |
| **Loop** | Restarts the video from the beginning every time it finishes. | `Off` |
| **Start Muted** | Forces the video to start at 0% volume. **Highly Recommended** if you experience autoplay issues, as many browsers block unmuted autoplay. | `Off` |
| **Default Volume** | Sets the initial volume (0 to 100). | `100` |
| **Show Controls** | Toggle the bottom control bar (play, volume, seek, fullscreen). | `On` |

### Layout & Visuals
| Setting | Description | Logic Verified |
| :--- | :--- | :--- |
| **Sizing Mode** | Controls how the player adapts to the page:<br>• **Fit to Container**: (Default) Intelligently scales the video to fit within the available space without cropping. Does not distort aspect ratio.<br>• **Fluid**: Takes full width of the container and adjusts height automatically based on video aspect ratio (16:9, etc).<br>• **Native Size**: Displays the video at its actual file resolution (e.g. 1920x1080). May cause scrolling. | `Fit` |
| **Fill Container** | **Overrules Sizing Mode**. Forces the player to expand to the exact width AND height of its container. Uses `object-fit: cover` to fill the space, which **will crop** the video edges if aspect ratios don't match. Ideal for full-screen / immersive layouts. | `Off` |

### Advanced
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Playback Rates** | Define the speed options in the menu (e.g., `0.5, 1, 1.5, 2`). Must be a comma-separated list of numbers. | `0.5, 1, 1.5, 2` |
| **Preload Strategy** | • `Metadata`: Loads only duration/dimensions. Saves bandwidth.<br>• `Auto`: Browser chooses; typically buffers some segments immediately for faster start.<br>• `None`: No data loaded until user clicks play. | `Metadata` |
| **Enable MKV/HLS** | Experimental toggle. • **MKV**: Treats `.mkv` as standard web video (Chrome supports this for H.264/VP9 codecs inside MKV).<br>• **HLS**: Passes `application/x-mpegURL` type for `.m3u8` files. | `Off` |

## 🛠️ Troubleshooting

### Autoplay isn't working / "Play Next" stops
- **Check your browser settings**: Chrome and Safari block autoplay with sound. Try enabling **Start Muted** in the plugin config.
- **Check the specific file**: Corrupt metadata in a video file can sometimes cause the `ended` event to fail.

### MKV files show an error or black screen
- This plugin allows the *attempt* to play MKV, but it relies on your browser.
- **Chrome/Edge**: Usually plays MKV if the internal video codec is H.264 or VP9. HEVC (H.265) often requires hardware support.
- **Firefox**: Has poorer MKV support.
- **Solution**: If playback fails, the user must download the file or use a proper transcoding solution (this plugin is just a player).

### Video is cut off / too large
- Change the **Sizing Mode** to `Fit to Container`.
- Ensure **Fill Container (Crop)** is set to `Off`.

## 👨‍💻 Technical Details (For Developers)

This plugin wraps Video.js in a React component compatible with HFS's frontend.
- **React ForwardRef**: Used to bridge the DOM-based Video.js library with React's virtual DOM.
- **Dummy Video Trick**: HFS expects a standard `<video>` element to dispatch events for playlist logic. This plugin injects a hidden `<video>` element that proxies the `ended` event from Video.js to HFS, ensuring core features work without modifying HFS code.
- **Config Scoping**: Configuration is read via `HFS.getPluginConfig()` at the module level to ensure stability across re-renders.

---
# Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students
