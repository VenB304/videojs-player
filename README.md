# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.org/) - a modern, responsive, and highly configurable HTML5 video player.

## Preview
unmute for audio
<video src="https://github.com/user-attachments/assets/bf499c4d-008e-4f81-a5c5-c79fc7e523ee" controls="controls" width="100%"></video>

## 🌟 Capabilities

This plugin replaces the basic default player with a professional-grade alternative used by millions of websites.

*   **📺 Modern & Responsive**: Looks stunning on any device, from desktops to mobile phones.
*   **📱 Mobile Optimized**: Native-like gestures including **double-tap to seek**, **auto-rotate**, and touch-friendly controls.
*   **🔁 Live Transcoding**: Integrated **FFmpeg support** to play unsupported formats (HEVC/H.265) on the fly. Thanks to @rejetto for the original code from their [unsupported-videos](https://github.com/rejetto/unsupported-videos) plugin.
*   **⏯️ Smart Playback**: Features **auto-resume** (remembers where you left off), **persistent volume**, and sequential playback.
*   **🎛️ Highly Configurable**: Organized settings menu in HFS Admin Panel to customize themes, hotkeys, sizing, and more.
*   **🛠️ Advanced Format Support**: Experimental support for **MKV** containers and **HLS (.m3u8)** streaming.

<details>
<summary><b>📸 Click to view Photo Preview</b></summary>
<br>

| Desktop | Mobile |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/452f3a64-a5cf-4ae4-83f6-76f58faa298d" width="100%" /> | <img src="https://github.com/user-attachments/assets/32097ed1-1c42-4be7-ba3b-0ae9c979ba95" width="100%" /> |

</details>

<details>
<summary><b>📸 Click to view Admin Settings</b></summary>
<br>

| **1. Core Playback** | **2. Player Controls** |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/890007d4-56e1-4ece-b4dc-898d06abbf02" width="400" /> | <img src="https://github.com/user-attachments/assets/2b03b828-6170-4617-ad94-b95653f52cb4" width="400" /> |

| **3. Shortcuts** | **4. Layout & Sizing** |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/add78b6b-f9b6-4974-94d6-56deed3c705f" width="400" /> | <img src="https://github.com/user-attachments/assets/7536fd64-3679-4502-90c6-119a68b3cd3c" width="400" /> |

| **5. Appearance** | **6. Mobile Experience** |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/ae8501c2-a97f-4fc3-8f6e-a15a4e815923" width="400" /> | <img src="https://github.com/user-attachments/assets/e288eb92-ac04-4ff6-b4b9-b5ec4c738081" width="400" /> |

| **7. Advanced** | **8. Transcoding** |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/13d034a6-a145-46d1-b1cf-5885b0700de7" width="400" /> | <img src="https://github.com/user-attachments/assets/871ffe8f-59a1-4f06-b56e-11241bf514d0" width="400" /> |

</details>

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
| **Preload Strategy** | • `Metadata` (Default): Loads size/duration.<br>• `Auto`: Buffers immediately.<br>• `None`: No data loaded until clicked. | `Metadata` |
| **Resume Playback** | Remembers your playback position and restores it next time. | `On` |
| **Remember Volume** | Saves your volume level between sessions. | `On` |
| **Default Volume** | Sets the initial volume (0 to 100%). | `100` |
| **Playback Rates** | Define speed options (e.g., `0.5, 1, 1.5, 2`). | `-` |

### 2. Player Controls
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show Controls** | Toggle the control bar. | `On` |
| **Controls Hide Delay** | Time (ms) before controls fade out. `0` = always visible. | `2000` |
| **Show Seek Buttons** | Adds Rewind/Forward buttons to the control bar. | `On` |
| **Show Download Button** | Adds a Download button to the control bar. | `On` |

### 3. Keyboard Shortcuts
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable Hotkeys** | `Space` (Play/Pause), `F` (Fullscreen), `M` (Mute), `Arrows` (Seek/Vol). | `On` |
| **Hotkey Seek Time** | Seconds to skip with Left/Right arrows. | `5` |
| **Hotkey Volume Step** | Percentage to change volume with Up/Down arrows. | `10` |

### 4. Layout & Sizing
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Sizing Mode** | • `Fluid`: Responsive width, aspect-ratio height.<br>• `Fill`: Fills container (cover).<br>• `Fixed / Native`: Hard pixel size. | `Fluid` |
| **Fixed Width/Height** | Overrides for **Fixed** mode. `0` = use video's intrinsic size. | `640` / `360` |

### 5. Appearance
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Player Theme** | Choose a skin: `Standard`, `City`, `Fantasy`, `Forest`, `Sea`. | `Standard` |
| **HEVC Error Style** | How to handle unsupported formats (if transcoding is off):<br>• `Overlay`: Shows error on player.<br>• `System Notification`: Small toast popup. | `Overlay` |

### 6. Mobile Experience
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Double Tap to Seek** | Double-tap sides of screen to seek. Center to toggle fullscreen. | `On` |
| **Seek Time** | Seconds to skip on double-tap. | `10` |
| **Auto-Rotate** | Automatically lock to landscape in fullscreen (android only). | `On` |

### 7. Advanced / Transcoding
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable MKV / HLS** | Experimental support for .mkv and .m3u8 streaming. | `Off` |
| **Use FFmpeg** | **Live Transcoding**. Automatically converts unsupported videos (like HEVC/H.265) to MP4 on the fly. | `Off` |
| **FFmpeg Path** | Absolute path to `ffmpeg.exe`. Leave empty if in system PATH. | *Empty* |
| **FFmpeg Parameters** | Extra flags for FFmpeg (e.g. hardware acceleration). | *Empty* |

---

## 🛠️ Troubleshooting

### Common Playback Issues
*   **"The media could not be loaded..."**: This generic error usually means the file type is unsupported by your browser (e.g. HEVC in Chrome Windows) or the network connection failed.
*   **Autoplay Blocked**: Browsers often block autoplay with sound. Enable **Start Muted** in settings to fix this.

### Transcoding / FFmpeg Issues
If "Use FFmpeg" is enabled but videos still fail:
1.  **Check Permissions**: If you are not logged in, ensure **Allow Guest Transcoding** is enabled in the plugin settings.
2.  **Rate Limiting (Error 429)**: The server limits the number of simultaneous conversions (Default: 3 global, 1 per user). Pass videojs-player config to increase this if your server is powerful.
3.  **Performance**: High CPU usage? Add hardware acceleration flags (e.g., `-hwaccel auto`) to **FFmpeg Parameters**.
4.  **Error Logs**: Check the server console (HFS terminal) for `VideoJS FFmpeg Error` messages.

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
