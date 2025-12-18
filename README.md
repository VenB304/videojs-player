# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.com/) - a modern, responsive, and highly configurable HTML5 video player.

## 🌟 Capabilities

This plugin replaces the basic default player with a professional-grade alternative used by millions of websites.

*   **📺 Modern & Responsive**: Looks stunning on any device, from desktops to mobile phones.
*   **📱 Mobile Optimized**: Native-like gestures including **double-tap to seek**, **auto-rotate**, and touch-friendly controls.
*   **🔁 Live Transcoding**: Integrated **FFmpeg support** to play unsupported formats (HEVC/H.265) on the fly.
*   **⏯️ Smart Playback**: Features **auto-resume** (remembers where you left off), **persistent volume**, and sequential playback.
*   **🎛️ Highly Configurable**: Organized settings menu in HFS Admin Panel to customize themes, hotkeys, sizing, and more.
*   **🛠️ Advanced Format Support**: Experimental support for **MKV** containers and **HLS (.m3u8)** streaming.

## Preview

### Desktop
<img width="1567" height="919" alt="image" src="https://github.com/user-attachments/assets/452f3a64-a5cf-4ae4-83f6-76f58faa298d" />

### Mobile
<img width="385" height="828" alt="image" src="https://github.com/user-attachments/assets/32097ed1-1c42-4be7-ba3b-0ae9c979ba95" />

### Admin Settings

#### Core Playback
<img width="452" height="746" alt="image" src="https://github.com/user-attachments/assets/890007d4-56e1-4ece-b4dc-898d06abbf02" />

#### Player Controls
<img width="455" height="557" alt="image" src="https://github.com/user-attachments/assets/2b03b828-6170-4617-ad94-b95653f52cb4" />

#### Keyboard Shortcuts
<img width="449" height="340" alt="image" src="https://github.com/user-attachments/assets/add78b6b-f9b6-4974-94d6-56deed3c705f" />

#### Layout & Sizing
<img width="364" height="185" alt="image" src="https://github.com/user-attachments/assets/7536fd64-3679-4502-90c6-119a68b3cd3c" />

#### Appearance
<img width="452" height="256" alt="image" src="https://github.com/user-attachments/assets/ae8501c2-a97f-4fc3-8f6e-a15a4e815923" />

#### Mobile Experience
<img width="455" height="368" alt="image" src="https://github.com/user-attachments/assets/e288eb92-ac04-4ff6-b4b9-b5ec4c738081" />

#### Advanced / Transcoding
<img width="460" height="485" alt="image" src="https://github.com/user-attachments/assets/13d034a6-a145-46d1-b1cf-5885b0700de7" />

---

## 🚀 Installation

### Option 1: Automatic (Recommended)
1.  Go to your **HFS Admin Panel**.
2.  Navigate to **Plugins** -> **Search online**.
3.  Search for **`videojs-player`**.
4.  Click **Install**.

### Option 2: Manual
1.  Download the `dist` folder from this repository.
2.  Place it inside your HFS `plugins` directory (e.g., `plugins/videojs-player/`).
3.  Restart HFS or reload plugins.

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
| **Show Seek Buttons** | Adds -10s / +10s buttons to the control bar. | `On` |
| **Show Download Button** | Adds a download icon (⬇) to controls. | `On` |

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
| **Player Theme** | Choose a skin: `Default`, `City`, `Fantasy`, `Forest`, `Sea`. | `Default` |
| **HEVC Error Style** | How to handle unsupported formats (if transcoding is off):<br>• `Overlay`: Shows error on player.<br>• `System Notification`: Small toast popup. | `Overlay` |

### 6. Mobile Experience
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Double Tap to Seek** | Double-tap sides of screen to seek. Center to toggle fullscreen. | `On` |
| **Seek Time** | Seconds to skip on double-tap. | `10` |
| **Auto-Rotate** | Automatically lock to landscape in fullscreen (mobile only). | `On` |

### 7. Advanced / Transcoding
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable MKV / HLS** | Experimental support for .mkv and .m3u8 streaming. | `Off` |
| **Use FFmpeg** | **Live Transcoding**. Automatically converts unsupported videos (like HEVC/H.265) to MP4 on the fly. | `Off` |
| **FFmpeg Path** | Absolute path to `ffmpeg.exe`. Leave empty if in system PATH. | *Empty* |
| **FFmpeg Parameters** | Extra flags for FFmpeg (e.g. hardware acceleration). | *Empty* |

---

## 🛠️ Troubleshooting

### Autoplay stops working
*   Modern browsers (Chrome, Safari) often block autoplay with sound. Enable **Start Muted** in settings to allow autoplay.

### "Video format not supported" (HEVC/H.265)
*   **Cause**: The video uses the HEVC codec, which browsers like Chrome (on Windows) do not natively support.
*   **Solution**:
    1.  Go to **Admin / Plugins / videojs-player / "Advanced / Experimental"** settings.
    2.  Enable **Use FFmpeg for unsupported videos**.
    3.  Ensure **FFmpeg** is installed on your server.
    4.  Point **FFmpeg Path** to the absolute path of `ffmpeg.exe`.
    5.  (Optional) Add extra flags for FFmpeg (e.g. hardware acceleration) to **FFmpeg Parameters**.
    6.  Save Configuration.

### Video is cut off or too big
*   Check your **Sizing Mode**. **Fluid** is best for general use. **Fill** acts like `object-fit: cover` and will crop if the aspect ratio doesn't match.

---

## 👨‍💻 Technical Details

This plugin uses a **React ForwardRef** wrapper to integrate Video.js 8.x with certain HFS-specific features:
*   **Event Proxy**: Proxies the `ended` event to HFS so "Play Next" works automatically.
*   **Client-Side Persistence**: Uses `localStorage` for volume and resume playback (no server database needed).
*   **Middleware**: Intercepts requests with `?ffmpeg` query string to pipe FFmpeg output directly to the client.

---
# Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students
