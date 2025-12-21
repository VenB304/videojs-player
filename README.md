# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.org/) - a modern, responsive, and highly configurable HTML5 video player.

## Preview
unmute for audio
<video src="https://github.com/user-attachments/assets/bf499c4d-008e-4f81-a5c5-c79fc7e523ee" controls="controls" width="100%"></video>

## 🌟 Capabilities

This plugin replaces the basic default player with a professional-grade alternative used by millions of websites.

*   **🔁 Live Hardware Transcoding**: On-the-fly conversion for **HEVC/H.265**, **AVI**, and more using **NVENC**, **QuickSync**, **AMF**, **Apple VideoToolbox**, or **VAAPI**.
*   **⏩ Smart Seeking**: Enables seeking in transcoded videos (Experimental) by restarting the stream at the requested timestamp.
*   **💾 State Persistence**: Remembers your **playback position** and **volume** settings, resuming exactly where you left off.
*   **🔄 Forced Re-mount Architecture**: Prevents "metadata bleed" (sticky titles/controls) by ensuring a clean player state when switching files.
*   **🎨 Integrated Theme Engine**: 5 built-in skins (`Standard`, `City`, `Fantasy`, `Forest`, `Sea`) selectable from the Admin Panel.
*   **📱 Enhanced Gestures**: Adds **double-tap to seek** (+/- 10s) and **auto-rotate** for mobile devices.
*   **🔒 Concurrency & Security**: Built-in **per-user rate limiting** and **global stream caps** to protect server resources.
*   **🚀 High Performance**: Uses **process piping** (RAM-to-RAM) to stream converted video instantly without writing temporary files.
*   **🔌 Deep HFS Integration**: Supports HFS **playlists** (auto-play next) and integrates with the `hfs-subtitles` plugin.
*   **🛠️ Extended Format Support**: Experimental native playback for **MKV** and **HLS (.m3u8)**.
*   **🔗 Direct Link Player**: Replaces the browser's native player when accessing files directly (e.g. `video.mp4`) or via **hfs-share-links**.(bundled Preact).

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

## ⚡ Quick Setup Guide

Get the most out of the player in 30 seconds:

1.  **Play Everything**: Go to the **Transcoding** tab and check **Enable FFmpeg Server Transcoding**. This fixes "Format Not Supported" errors for users attempting to view MKV, HEVC, and AVI files.
2.  **Auto-Play**: In the **Playback** tab, enable **Autoplay**. For best results on Chrome/Edge, also enable **Start Muted**.
3.  **Modern Look**: In the **Interface** tab, change **Player Theme** to `City` or `Sea` for a fresh look.
4.  **Mobile UX**: In the **Interaction** tab, ensure **Double Tap to Seek** is enabled for a YouTube-like mobile experience.

---



## ⚙️ Configuration Guide

Settings are organized into categories in **Admin Panel > Plugins > videojs-player**.

### 1. Playback
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Autoplay Video** | Start playing immediately on load. | `On` |
| **Start Muted** | Mute on start (Required for stable Autoplay). | `Off` |
| **Loop Playback** | Replay video when it ends. | `Off` |
| **Preload Strategy** | `Metadata` (Fast), `Auto` (Buffer), or `None`. | `Metadata` |
| **Remember Position** | Saves progress and resumes where you left off. | `On` |
| **Remember Volume** | Saves volume preference between plays. | `On` |
| **Default Volume (%)** | Initial volume if no preference is saved. | `100` |
| **Available Speeds** | Comma-separated list (e.g., `0.5, 1, 1.5, 2`). | `0.5, 1, 1.5, 2` |
| **Enable Audio Mode** | Use this player for audio files (`mp3`, `wav`). | `Off` |
| **Integrate Subtitles** | Detects `hfs-subtitles` for advanced captions. | `Off` |

### 2. Interface
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show Control Bar** | Uncheck to hide all playback controls. | `On` |
| **Auto-Hide (ms)** | Delay before controls fade. `0` = Always visible. | `2000` |
| **Player Theme** | Choose from: `Standard`, `City`, `Fantasy`, `Forest`, `Sea`. | `Standard` |
| **Show Seek Buttons** | Adds quick `+/- 10s` buttons to the bar. | `On` |
| **Seek Button Step** | Seconds skipped when using seek buttons. | `10` |
| **Download Button** | Adds an icon to download the original file. | `On` |
| **PiP Button** | Allow popping video into a floating window. | `On` |
| **Error style** | `Overlay` (Full screen) or `Toast` (Popup). | `Overlay` |

### 3. Layout
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Sizing Mode** | `Fluid` (Responsive), `Fill` (100%), `Fixed`, or `Native`. | `Fluid` |
| **Fixed Width** | Width for `Fixed` mode. | `640` |
| **Fixed Height** | Height for `Fixed` mode. | `360` |

### 4. Interaction
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Keyboard Hotkeys** | `Space`, `F`, `M`, `Arrows` and `K`, `P`. | `On` |
| **Hotkey Seek Time** | Seconds skipped per `Left`/`Right` arrow press. | `5` |
| **Hotkey Volume** | Volume % changed per `Up`/`Down` arrow press. | `5` |
| **Scroll Volume** | Change volume using the mouse wheel. | `On` |
| **Double Tap Seek** | Double-tap screen sides to seek (+/- 10s). | `On` |
| **Double Tap Secs** | Seconds skipped per double-tap. | `10` |
| **Auto-Landscape** | Automatically rotate to landscape in Fullscreen. | `On` |

### 5. Transcoding & Advanced
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable HLS/MKV** | Native client-side support for `.m3u8` or `.mkv`. | `Off` |
| **FFmpeg Transcoding** | Convert unsupported files on-the-fly. | `Off` |
| **Replace Direct Links** | Enable "Direct Link Player" mode for all video files. | `Off` |
| **Allow Seeking** | (Experimental) Allow seeking in converted videos. | `Off` |
| **Hardware Accel** | Choose Backend: `Software`, `Intel`, `NVENC`, `AMD`, `Apple`, `VAAPI`. | `Software` |
| **Encoder Preset** | Quality/Speed tradeoff (Options vary by Backend). | `Balanced` |
| **FFmpeg Path** | Path to binary if not in system PATH. | *Empty* |
| **Custom Flags** | Manual parameters for `Custom` mode. | *Empty* |
| **Max Global Streams** | Maximum number of concurrent server conversions. | `3` |
| **Allow Guests** | If off, guests must log in to use transcoding. | `On` |
| **Max Per User** | Limit simultaneous streams per user. Oldest stops if exceeded. | `1` |
| **Whitelisted Users** | Restriction list for transcoding access. | *Empty* |

---

## 🛠️ Troubleshooting

### 1. Playback & Layout
| Error/Event | Description | Solution(s) |
| :--- | :--- | :--- |
| **"Media could not be loaded"** | Generic playback error. Browser lacks codec support (e.g. HEVC on Chrome). | 1. Enable **Transcoding**.<br>2. Use a compatible browser (e.g. Safari for HEVC). |
| **Autoplay Blocked** | Browser blocked auto-play because audio is active. | Enable **Start Muted** in settings. |
| **Video Cut Off** | Video is cropped, zoomed, or black bars appear. | Switch **Sizing Mode** to `Fluid` or `Native`. |
| **Audio Title Stuck** | Metadata persists when switching files. | Ensure other plugins aren't blocking HFS `fileShow`. |
| **Double Tap** | Mobile gesture behavior. | Works on outer 30% (seek) vs center 40% (fullscreen). |

### 2. Transcoding & Performance
| Error/Event | Description | Solution(s) |
| :--- | :--- | :--- |
| **"Transcoding Failed"** | General failure to start FFmpeg process. | 1. Check `ffmpeg_path`.<br>2. Try **Software (x264)** backend.<br>3. Check Console Logs. |
| **Laggy Seeking** | Slow response when jumping execution time. | Normal behavior. Restarting the stream takes 1-5s. |
| **Error 503** | Service Unavailable / Server Busy. | Server reached **Max Global Streams** limit. |
| **High CPU Usage** | Server load is too high. | Switch to **Hardware Acceleration** (NVENC/QSV/AMF). |

### 3. Server Error Logs (Console)
| Error Code | Description | Solution(s) |
| :--- | :--- | :--- |
| **ENOENT** | Binary not found. | Install FFmpeg or fix `ffmpeg_path` in settings. |
| **Exit Code 1** | Invalid arguments / Generic Error. | Check **Custom Flags** or incompatible preset. |
| **Code 3221225781** | Windows DLL missing (0xC0000135). | Reinstall FFmpeg or missing dependencies. |
| **Code 3221225477** | Access Violation (0xC0000005). | Hardware Driver crash. Update GPU drivers. |

### 4. Installation & Security
| Error/Event | Description | Solution(s) |
| :--- | :--- | :--- |
| **Plugin not loading** | Player doesn't appear at all. | Requires **HFS 0.50.0+** (API 10.0+). |
| **Subtitles missing** | `hfs-subtitles` integration failed. | Move `hfs-subtitles` **above** this plugin in the list. |
| **Script "Access Denied"** | Update script permission error. | Run PowerShell as **Administrator**. |
| **Guest Limits** | ⚠️ **Security Warning** | Guests bypass per-user limits. Lower **Max Global Streams**. |

---

## 👨‍💻 Technical Details

### Architecture
This plugin bridges **HFS (Server)** and **Video.js (Client)** using a hybrid approach:
1.  **Backend (`plugin.js`)**: A Koa middleware intercepts requests containing `?ffmpeg`. It spawns a native `ffmpeg` process and pipes the output directly to the HTTP response as a fragmented **MP4** stream.
2.  **Frontend (`player.js`)**: A **React** component wraps Video.js. It handles error detection, auto-switches to transcoding if playback fails, and manages UX states (e.g., buffering indicators during conversion).

### Transcoding Pipeline
`Source` -> `Decoder` -> `Encoder (H.264/AAC)` -> `MP4 (piped)` -> `Browser`
*   **Software (x264)**: Standard CPU encoding using `libx264`.
*   **Intel QuickSync**: Hardware encoding using `h264_qsv` (Intel iGPU).
*   **NVIDIA NVENC**: Hardware encoding using `h264_nvenc` (NVIDIA GPU).
*   **AMD AMF**: Hardware encoding using `h264_amf` (AMD GPU).
*   **Apple VideoToolbox**: Hardware encoding using `h264_videotoolbox` (macOS).
*   **VAAPI**: Hardware encoding using `h264_vaapi` (Linux).
*   **Copy**: Passthrough stream copy (No re-encoding, just changing container).

---

## 🛠️ Maintenance & Updating
**Administrators** can ensure the plugin stays up-to-date with the latest Video.js features and security patches even if this plugin is no longer actively maintained.

### Updating Video.js Library
Included in the `scripts` folder are automated tools to fetch the latest `video.js` core files.

**Windows:**
1.  Open the plugin folder (`plugins/videojs-player/scripts`).
2.  Right-click `update-videojs.ps1` and select **Run with PowerShell**.

**Linux / macOS / Docker:**
1.  Navigate to the scripts folder: `cd plugins/videojs-player/scripts`
2.  Make the script executable: `chmod +x update-videojs.sh`
3.  Run the updater: `./update-videojs.sh`

The script will safely download the latest version from the official CDN and update the player files in `dist/public`.

> **Note**: Your custom themes and transcoding overlays are stored in a separate `custom.css` file and will **NOT** be overwritten by this update process.

### Updating Preact (For Offline Player)
The "Direct Link Player" relies on `preact.min.js` and `hooks.min.js`. To update these:

**Windows:**
1.  Open `plugins/videojs-player/scripts`.
2.  Right-click `update-preact.ps1` and select **Run with PowerShell**.

**Linux / macOS:**
1.  `cd plugins/videojs-player/scripts`
2.  `chmod +x update-preact.sh` (Create if needed, or stick to manual download)
3.  `./update-preact.sh` (If implemented) or manually download files to `dist/public`.

---

## 🏆 Credits and Special Mentions

### Core Technologies
*   **[Video.js](https://videojs.org/)**: The open-source HTML5 video player framework.
*   **[Preact](https://preactjs.com/)**: Fast 3kB React alternative used for the Direct Link Player interface.
*   **[FFmpeg](https://ffmpeg.org/)**: The leading multimedia framework used for server-side transcoding.

### HFS Community & Plugins
*   **[unsupported-videos](https://github.com/rejetto/unsupported-videos)**: Thanks to @rejetto for the original live transcoding code from the unsupported-videos plugin, which powers the backend of this player.
*   **[hfs-share-links](https://github.com/rejetto/hfs-share-links)**: This player fully supports shared links, allowing external users to view videos with the full player interface.
*   **[hfs-subtitles](https://github.com/rejetto/hfs-subtitles)**: It provides subtitle management and selection, which this player can integrate with.

