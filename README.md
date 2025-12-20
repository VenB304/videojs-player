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

Settings are organized into categories in **Admin Panel > Plugins > videojs-player**.

### 1. Playback
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Autoplay Video** | Automatically start videos on load. *Browsers may block this w/ audio.* | `On` |
| **Start Muted** | Forces 0% volume on start. Required for consistent Autoplay. | `Off` |
| **Loop Playback** | Automatically restart video when ended. | `Off` |
| **Preload Strategy** | • `Metadata`: Duration only (Fast).<br>• `Auto`: Buffers video.<br>• `None`: No load until click. | `Metadata` |
| **Remember Resume** | Saves playback position per video. (Disabled for Transcoded streams). | `On` |
| **Remember Volume** | Saves volume preference between sessions. | `On` |
| **Default Volume** | Initial volume (0-100%). | `100` |
| **Playback Rates** | Speed options (e.g. `0.5, 1, 1.5, 2`). | `0.5...` |
| **Enable Audio Mode** | Use this player for .mp3/.wav files. | `Off` |
| **Integrate Subtitles** | Detects `hfs-subtitles` plugin for advanced captions. | `Off` |

### 2. Interface
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show Control Bar** | Toggle bottom controls (Play/Pause/Timeline). | `On` |
| **Auto-Hide Controls** | Time (ms) before controls fade. `0` = Always visible. | `2000` |
| **Player Theme** | Visual skins (`Standard`, `City`, `Sea`, etc). | `Standard` |
| **Show Seek Buttons** | Adds +/- 10s buttons to control bar. | `On` |
| **Seek Button Step** | Seconds to skip per click. | `10` |
| **Show Download Button** | Adds download icon to control bar. | `On` |
| **Picture-in-Picture** | Show PiP toggle button. | `On` |
| **Error Style** | `Overlay` (Cover) or `Toast` (Popup) notifications. | `Overlay` |

### 3. Layout & Sizing
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Sizing Mode** | • `Fluid`: Responsive & **Transparent**. Best for layouts.<br>• `Fill`: **Block** element. Fills parent 100%.<br>• `Fixed`: Custom pixel size.<br>• `Native`: Intrinsic video size. | `Fluid` |
| **Fixed Width/Height** | Overrides only for **Fixed** mode. | `640`x`360` |

### 4. Interaction
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable Hotkeys** | Space (Pause), F (Full), M (Mute), Arrows (Seek/Vol). | `On` |
| **Arrow Seek/Vol Step** | Time(s) or Vol(%) changed by arrow keys. | `5` |
| **Scroll Volume** | Mouse wheel changes volume. | `On` |
| **Double Tap Seek** | (Mobile) Double-tap sides to seek. | `On` |
| **Double Tap Seconds** | Time skipped per tap. | `10` |
| **Auto-Rotate** | (Mobile) Lock landscape in fullscreen. | `On` |

### 5. Transcoding & Advanced
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable HLS/MKV** | Experimental client-side support for .m3u8/.mkv. | `Off` |
| **Enable Transcoding** | **Live Server Conversion** for unsupported formats (HEVC, AVI). | `Off` |
| **Allow Seeking** | (Beta) Enable seeking in converted streams. | `Off` |
| **Hardware Preset** | • `Universal`: CPU (Safe).<br>• `NVENC` / `QuickSync` / `AMF` / `VideoToolbox`: GPU.<br>• `Copy`: Passthrough. | `Universal` |
| **FFmpeg Path** | Absolute path to binary. Empty = System PATH. | *Empty* |
| **Limits** | • **Max Global**: Total active streams.<br>• **Max User**: Streams per user.<br>• **Allowed Users**: Whitelist. | `3`, `1`, `All` |
---

## 🛠️ Troubleshooting

### Common Playback Issues
*   **"The media could not be loaded..."**: Generic error. Usually means the browser doesn't support the codec (e.g. HEVC on Chrome) and Transcoding is disabled.
*   **Autoplay Blocked**: Browsers often block autoplay with sound. Enable **Start Muted** in settings to fix this.

### Transcoding Performance
*   **"Transcoding Failed"**:
    1.  Check if `ffmpeg` is installed and in your system PATH (or specified in settings).
    2.  Check if your chosen **Preset** is supported by your server hardware. Try switching to **Universal** as fallback.
*   **High CPU Usage**:
    *   Switch to a Hardware Accelerated preset (NVENC/QuickSync/AMF/VideoToolbox) if available.
    *   Limit **Max Global Streams** to prevent server overload.
*   **Laggy Seeking**: Seeking in transcoding mode requires restarting the FFmpeg process. This can take 1-3 seconds.
*   **Rate Limiting (Error 429)**: The server limits the number of simultaneous conversions (Default: 3 global, 1 per user). Pass videojs-player config to increase this if your server is powerful.
*   **Error Logs**: Check the server console (HFS terminal) for `VideoJS FFmpeg` messages.
    *   **Status 503 / "Service Unavailable"**: Global `Max Streams` limit reached.
    *   **ENOENT / "Binary not found"**: The path in `ffmpeg_path` is incorrect, or FFmpeg is not installed.
    *   **Exit Code 1**: General Logic Error. Usually means invalid arguments (e.g. `Custom` flags are wrong).
    *   **Exit Code 3221225781** (Windows): Missing DLLs or dependencies. Reinstall FFmpeg.
    *   **Exit Code 3221225477** (Access Violation): Hardware Driver crash. Try updating GPU drivers or switch to a Supported Preset or try `Universal`.

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
*   **NVIDIA NVENC**: Uses `h264_nvenc`.
*   **Intel QuickSync**: Uses `h264_qsv`.
*   **AMD AMF**: Uses `h264_amf`.
*   **Apple VideoToolbox**: Uses `h264_videotoolbox`.
*   **Copy**: Uses `-c copy`.

---

## 🏆 Credits

*   **@rejetto**: Special thanks for the original live transcoding code from the [unsupported-videos](https://github.com/rejetto/unsupported-videos) plugin, which powers the FFmpeg backend of this player.

---

## Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students
