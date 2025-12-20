# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.org/) - a modern, responsive, and highly configurable HTML5 video player.

## Preview
unmute for audio
<video src="https://github.com/user-attachments/assets/bf499c4d-008e-4f81-a5c5-c79fc7e523ee" controls="controls" width="100%"></video>

## 🌟 Capabilities

This plugin replaces the basic default player with a professional-grade alternative used by millions of websites.

*   **🔁 Live Hardware Transcoding**: On-the-fly conversion for **HEVC/H.265** videos using **NVENC**, **QuickSync**, **AMF**, or **Apple VideoToolbox**. Includes **Smart Seeking** (Beta) which restarts the stream at the requested timestamp.
*   **💾 State Persistence**: Uses local storage to remember your **playback position** and **volume** settings for every video, resuming exactly where you left off.
*   **🎨 Integrated Theme Engine**: Choose from 5 built-in skins (`Standard`, `City`, `Fantasy`, `Forest`, `Sea`) directly from the HFS Admin Panel.
*   **📱 Enhanced Gestures**: Adds **double-tap to seek** (+/- 10s) and **auto-rotate** for Android integration—features missing from the standard HTML5 player.
*   **🔒 Enterprise-Grade Security**: Includes built-in **Rate Limiting** (max streams per user) and **User Whitelisting** to prevent server overload.
*   **🚀 High Performance**: Uses **process piping** (RAM-to-RAM) to stream converted video instantly without writing temporary files to disk.
*   **🔌 Deep HFS Integration**: Fully supports HFS **playlists** (auto-play next) and integrates with the `hfs-subtitles` plugin.
*   **🛠️ Extended Format Support**: Adds experimental playback for **MKV** containers and **HLS (.m3u8)** streams.

---

## 🚀 Installation

### Option 1: Automatic (Recommended)
1.  Go to your **HFS Admin Panel**.
2.  Navigate to **Plugins** -> **Search online**.
3.  Search for **`videojs-player`**.
4.  Click **Install**.

### Option 2: Manual
1.  Download the `dist` folder from this repository.
2.  Place it inside your HFS `plugins` directory
3.  Rename `dist` folder to `videojs-player`
4.  Restart HFS or reload plugins.

---

## ⚙️ Configuration Guide

Settings are organized into categories in **Admin Panel > Plugins > videojs-player**. Use the **Configuration Category** dropdown to filter options.

### 1. Core Playback
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Autoplay Video** | Automatically start videos when the page loads. *Note: Browsers may block this if audio is enabled.* | `On` |
| **Start Muted** | Forces video to start at 0% volume. *Required for autoplay in strictly blocking browsers.* | `Off` |
| **Loop Playback** | Automatically restart the video when it ends. | `Off` |
| **Preload Strategy** | • `Metadata`: loads duration only (Fastest).<br>• `Auto`: Buffers immediately.<br>• `None`: No data loaded until clicked. | `Metadata` |
| **Enable Audio Player Mode** | Use this player for audio files (.mp3, .wav). Posters are hidden in audio mode. | `Off` |
| **Integrate 'hfs-subtitles'** | Detects the `hfs-subtitles` plugin for advanced subtitle selection. | `Off` |
| **Resume Playback** | Remembers playback position per video. *(Disabled for "Live Transcoded" streams)* | `On` |
| **Remember Volume** | Saves your volume level between sessions. | `On` |
| **Default Volume** | Initial volume (0-100%) if no preference is saved. | `100` |
| **Playback Rates** | Comma-separated list of speed options (e.g. `0.5, 1, 2`). | `0.5, 1, 1.5, 2` |

### 2. Player Controls
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show Control Bar** | Toggle the bottom control bar visibility. | `On` |
| **Auto-Hide Controls** | Time (ms) before controls fade out. `0` = always visible. | `2000` |
| **Show Seek Buttons** | Adds +/- 10s buttons to the control bar. | `On` |
| **Seek Button Step** | Seconds to increment/decrement per tap. | `10` |
| **Show Download Button** | Adds a Download icon to the control bar. | `On` |
| **Scroll to Change Volume** | Adjust volume by scrolling the mouse wheel over the player. | `On` |
| **Picture-in-Picture** | Show the PiP toggle button. | `On` |

### 3. Keyboard Shortcuts
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable Hotkeys** | `Space` (Play/Pause), `F` (Fullscreen), `M` (Mute), `Arrows` (Seek/Vol). | `On` |
| **Arrow Key Seek Time** | Seconds to skip with Left/Right arrows. | `5` |
| **Arrow Key Volume Step** | Percentage to change volume with Up/Down arrows. | `5` |

### 4. Layout & Sizing
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Sizing Mode** | • `Fluid`: Responsive width, aspect-ratio height (Best for web).<br>• `Fill`: Fills container 100%.<br>• `Fixed`: Hard pixel size. | `Fluid` |
| **Fixed Width/Height** | Overrides only for **Fixed** mode. `0` = use video's intrinsic size. | `640` / `360` |

### 5. Appearance
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Player Theme** | Visual skins: `Standard`, `City`, `Fantasy`, `Forest`, `Sea`. | `Standard` |
| **Error Notification Style** | • `Overlay`: Covers the player (Good for mobile).<br>• `Toast`: Shows a popup message. | `Overlay` |

### 6. Mobile Experience
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Double Tap to Seek** | Double-tap screen sides to seek. Center toggles controls. | `On` |
| **Double Tap Seconds** | Time skipped per interaction. | `10` |
| **Mobile Auto-Landscape** | Automatically locks screen to landscape when entering fullscreen on Android. | `On` |

### 7. Advanced / Hardware Acceleration
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable HLS/MKV Client Support** | Experimental client-side playback for .m3u8 and .mkv. | `Off` |
| **Enable FFmpeg Transcoding** | **Live Transcoding**. Automatically converts unsupported videos (HEVC/H.265, AVI) on the server. | `Off` |
| **Allow Seeking in Transocded Videos** | **(Beta)** Allows seeking in converted streams. May cause delays. | `Off` |
| **Hardware Acceleration (Preset)** | Select your Hardware Acceleration optimization:<br>• **Universal**: CPU (libx264). Safe fallback.<br>• **Intel QuickSync**: `h264_qsv`.<br>• **NVIDIA NVENC**: `h264_nvenc`.<br>• **AMD AMF**: `h264_amf`.<br>• **Apple VideoToolbox**: `h264_videotoolbox` (macOS).<br>• **Stream Copy**: No re-encoding.<br>• **Custom**: Manual. | `Universal` |
| **FFmpeg Executable Path** | Absolute path to `ffmpeg.exe`. | *Empty* |
| **Custom FFmpeg Flags** | Only visible if **Preset** is set to `Custom`. Example: `-c:v libx265 -crf 23`. | *Empty* |

### 8. Transcoding Limits
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Max Global Streams** | Limit total active conversions on the server. | `3` |
| **Allow Guest Transcoding** | If disabled, guests must login to play HEVC files. | `On` |
| **Max Streams Per User** | Limit active conversions per single user. | `1` |
| **Whitelisted Users** | Restrict transcoding to specific usernames. | *Empty* |

---

## 🛠️ Troubleshooting

### Common Playback Issues
*   **"The media could not be loaded..."**: Generic error. Usually means the browser doesn't support the codec (e.g. HEVC on Chrome) and Transcoding is disabled.
*   **Autoplay Blocked**: Browsers often block autoplay with sound. Enable **Start Muted** in settings to fix this.

### Transcoding Performance
*   **"Transcoding Failed"**:
    1.  Check if `ffmpeg` is installed and in your system PATH (or specified in settings).
    2.  Check if your chosen **Preset** (e.g. NVENC) is supported by your hardware. Try switching to **Universal** to test.
*   **High CPU Usage**:
    *   Switch to a Hardware Accelerated preset (NVENC/QuickSync) if available.
    *   Limit **Max Global Streams** to prevent server overload.
*   **Laggy Seeking**: Seeking in transcoding mode requires restarting the FFmpeg process. This can take 1-3 seconds.
*   **Rate Limiting (Error 429)**: The server limits the number of simultaneous conversions (Default: 3 global, 1 per user). Pass videojs-player config to increase this if your server is powerful.
*   **Error Logs**: Check the server console (HFS terminal) for `VideoJS FFmpeg Error` messages.

### Mobile & Touch
*   **Double Tap**: Works on the left/right 30% of the screen. The center area toggles fullscreen.
*   **Auto-Rotate**: Only works on Android devices playing in Fullscreen. Requires correct HTTPS context in some browsers.

### Layout Problems
*   **Video Cut Off**: Switch **Sizing Mode** to `Fluid` or `Native`. `Fill` mode crops video to cover the container (like Instagram stories).

---

## 👨‍💻 Technical Details

### Architecture
This plugin bridges **HFS (Server)** and **Video.js (Client)** using a hybrid approach:
1.  **Backend (`plugin.js`)**: A Koa middleware intercepts requests containing `?ffmpeg`. It spawns a native `ffmpeg` process based on your **Preset** selection and pipes the output (`stdout`) directly to the HTTP response as an MP4 stream.
2.  **Frontend (`player.js`)**: A **React** component wraps Video.js. It handles error detection, auto-switches to transcoding if playback fails, and manages UX states (Loading overlays).

### Transcoding Pipeline
`Source` -> `Decoder` -> `Encoder (H.264/AAC)` -> `MPEG-TS/MP4 Container` -> `Browser`
*   **Universal**: Uses `libx264` (CPU).
*   **NVENC**: Uses `h264_nvenc`.
*   **QuickSync**: Uses `h264_qsv`.
*   **AMF**: Uses `h264_amf` (AMD).
*   **VideoToolbox**: Uses `h264_videotoolbox` (macOS).
*   **Copy**: Uses `-c copy`.

---

## 🏆 Credits

*   **@rejetto**: Special thanks for the original live transcoding code from the [unsupported-videos](https://github.com/rejetto/unsupported-videos) plugin, which powers the FFmpeg backend of this player.

---

## Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students
