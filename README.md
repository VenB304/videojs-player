# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.org/) - a modern, responsive, and highly configurable HTML5 video player.

## Preview
unmute for audio
<video src="https://github.com/user-attachments/assets/bf499c4d-008e-4f81-a5c5-c79fc7e523ee" controls="controls" width="100%"></video>

## 🌟 Capabilities

This plugin replaces the basic default player with a professional-grade alternative used by millions of websites.

*   **🔁 Live FFmpeg Transcoding**: On-the-fly conversion for **HEVC/H.265** videos. Includes **Smart Seeking** (Beta) which restarts the stream at the requested timestamp. Thanks to @rejetto for the original code from their [unsupported-videos](https://github.com/rejetto/unsupported-videos) plugin.
*   **💾 State Persistence**: Uses local storage to remember your **playback position** and **volume** settings for every video, resuming exactly where you left off.
*   **🎨 Integrated Theme Engine**: Choose from 5 built-in skins (`Standard`, `City`, `Fantasy`, `Forest`, `Sea`) directly from the HFS Admin Panel.
*   **📱 Enhanced Gestures**: Adds **double-tap to seek** (+/- 10s) and **auto-rotate** for Android integration—features missing from the standard HTML5 player.
*   **�️ Enterprise-Grade Security**: Includes built-in **Rate Limiting** (max streams per user) and **User Whitelisting** to prevent server overload.
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
| **Autoplay** | Automatically start videos when the page loads. | `On` |
| **Start Muted** | Forces video to start at 0% volume. *Required for autoplay in some browsers.* | `Off` |
| **Loop** | Automatically restart the video when it ends. | `Off` |
| **Preload Strategy** | • `Metadata`: Loads size/duration.<br>• `Auto`: Buffers immediately.<br>• `None`: No data loaded until clicked. | `Metadata` |
| **Enable Audio Support** | Use this player for audio files (.mp3, .wav, etc.). | `Off` |
| **Integrate with HFS-Subtitles** | Uses [`hfs-subtitles`](https://github.com/rejetto/hfs-subtitles) plugin for advanced subtitles if installed. | `Off` |
| **Resume Playback** | Remembers your playback position and restores it next time.<br>*(Requires **Enable Seek** for transcoded videos)* | `On` |
| **Remember Volume** | Saves your volume level between sessions. | `On` |
| **Default Volume** | Sets the initial volume (0 to 100%). | `100` |
| **Playback Rates** | Define speed options (e.g., `0.5, 1, 1.5, 2`). | `0.5, 1, 1.5, 2` |

### 2. Player Controls
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show Controls** | Toggle the control bar. | `On` |
| **Controls Hide Delay** | Time (ms) before controls fade out. `0` = always visible. | `2000` |
| **Show Seek Buttons** | Adds +/- buttons to control bar. | `On` |
| **Seek Button Time** | Seconds to increment/decrement per tap. | `10` |
| **Show Download Button** | Adds a Download button to the control bar. | `On` |
| **Enable Scroll Volume** | Adjust volume by scrolling over player. | `On` |
| **Enable Picture-in-Picture** | Show Picture-in-Picture button. | `On` |

### 3. Keyboard Shortcuts
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable Hotkeys** | `Space` (Play/Pause), `F` (Fullscreen), `M` (Mute), `Arrows` (Seek/Vol). | `On` |
| **Hotkey Seek Time** | Seconds to skip with Left/Right arrows. | `5` |
| **Hotkey Volume Step** | Percentage to change volume with Up/Down arrows. | `5` |

### 4. Layout & Sizing
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Sizing Mode** | • `Fluid`: Responsive width, aspect-ratio height.<br>• `Fill`: Fills container (cover).<br>• `Fixed / Native`: Hard pixel size. | `Fluid` |
| **Fixed Width/Height** | Overrides for **Fixed** mode. `0` = use video's intrinsic size. | `640` / `360` |

### 5. Appearance
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Player Theme** | Choose a skin: `Standard`, `City`, `Fantasy`, `Forest`, `Sea`. | `Standard` |
| **Notification Style** | How to show errors and info (Toast/Overlay). | `Overlay` |

### 6. Mobile Experience
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Double Tap to Seek** | Double-tap sides of screen to seek. Center to toggle fullscreen. | `On` |
| **Double Tap Seek Time** | Seconds to seek on double tap. | `10` |
| **Mobile Auto-Landscape** | Automatically enter landscape mode when in fullscreen. | `On` |

### 7. Advanced / Experimental
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable MKV / HLS Support** | Experimental streaming for .mkv and .m3u8. | `Off` |
| **Use FFmpeg** | **Live Transcoding**. Automatically converts unsupported videos (like HEVC/H.265) on the fly. | `Off` |
| **Enable Seek in Transcoding** | **(Beta)** Allows seeking, but may cause instability or delays. | `Off` |
| **FFmpeg Path** | Absolute path to `ffmpeg.exe`. Leave empty if in system PATH. | *Empty* |
| **FFmpeg Parameters** | Additional FFmpeg params (e.g. for hardware accel). | *Empty* |

### 8. Transcoding Limits & Security
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Max Global Concurrent Streams** | Limit total number of active conversions. | `3` |
| **Allow Guest Transcoding** | If disabled, only logged-in users can stream. | `On` |
| **Max Streams Per User** | Limit active conversions per account. | `1` |
| **Allowed Users (Whitelist)** | Usernames allowed to transcode. Leave empty to allow all. | *Empty* |

---

## 🛠️ Troubleshooting

### Common Playback Issues
*   **"The media could not be loaded..."**: This generic error usually means the file type is unsupported by your browser (e.g. HEVC in Chrome Windows) or the network connection failed.
*   **Autoplay Blocked**: Browsers often block autoplay with sound. Enable **Start Muted** in settings to fix this.

### Transcoding / FFmpeg Issues
If "Use FFmpeg" is enabled but videos still fail:
1.  **Check Permissions**: If you are not logged in, ensure **Allow Guest Transcoding** is enabled in the plugin settings.
2.  **Seeking Lags**: Seeking in transcoding mode requires restarting the FFmpeg process. This can take 1-3 seconds.
3.  **Rate Limiting (Error 429)**: The server limits the number of simultaneous conversions (Default: 3 global, 1 per user). Pass videojs-player config to increase this if your server is powerful.
4.  **Performance**: High CPU usage? Add hardware acceleration flags (e.g., `-hwaccel auto`) to **FFmpeg Parameters**.
5.  **Error Logs**: Check the server console (HFS terminal) for `VideoJS FFmpeg Error` messages.

### Mobile & Touch
*   **Double Tap**: Works on the left/right 30% of the screen. The center area toggles fullscreen.
*   **Auto-Rotate**: Only works on Android devices playing in Fullscreen. Requires correct HTTPS context in some browsers.

### Layout Problems
*   **Video Cut Off**: Switch **Sizing Mode** to `Fluid` or `Native`. `Fill` mode crops video to cover the container (like Instagram stories).

---

## 👨‍💻 Technical Details

### Architecture
This plugin bridges **HFS (Server)** and **Video.js (Client)** using a hybrid approach:
*   **Backend (`plugin.js`)**: A Koa middleware intercepts requests containing `?ffmpeg`. It spawns a native `ffmpeg` process and pipes the output (`stdout`) directly to the HTTP response as an MP4 stream.
    *   *Security*: Input parameters are sanitized. Processes are strictly managed and killed if the request ends or the client disconnects.
*   **Frontend (`player.js`)**: A **React** component wraps the Video.js instance.
    *   *Proxy*: A hidden "dummy" video element exists to satisfy HFS's playlist logic (handling `ended` events to trigger "Play Next").
    *   *State*: Volume and playback position are saved to `localStorage`, enabling persistent settings without server-side databases.

### FFmpeg Integration
The transcoding pipeline is **on-demand (Live)**:
`Source Video` -> `FFmpeg Process` -> `Pipe` -> `Browser`
No temporary files are created on disk. This ensures low latency but requires a stable CPU.

---
## Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students
