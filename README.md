# Video.js Player Plugin for HFS

Upgrade your HFS streaming experience with [Video.js](https://videojs.com/) - a modern, responsive, and highly configurable HTML5 video player.

## 🌟 Capabilities

This plugin replaces the basic default player with a professional-grade alternative used by millions of websites.

*   **📺 Modern & Responsive**: Looks stunning on any device, from desktops to mobile phones.
*   **📱 Mobile Optimized**: Includes native-like gestures such as **double-tap to seek**, **auto-rotate**, and touch-friendly controls.
*   **⏯️ Smart Playback**: Features **auto-resume** (remembers where you left off), **persistent volume**, and sequential playback support.
*   **🎛️ Highly Configurable**: Customize everything from **themes** and **hotkeys** to **sizing modes** and **control timeout** directly in the HFS Admin Panel.
*   **🛠️ Advanced Format Support**: Experimental support for **MKV** containers and **HLS (.m3u8)** streaming.

## Preview

### Desktop
<img width="1920" height="922" alt="image" src="https://github.com/user-attachments/assets/d8502d67-6c5b-4a9a-9f05-e5653122820c" />

### Mobile
<img width="383" height="828" alt="image" src="https://github.com/user-attachments/assets/39be202e-fbb9-42de-8aea-3cf8852f1018" />

### Admin Settings
<img width="406" height="633" alt="image" src="https://github.com/user-attachments/assets/935d257b-8fa6-4b09-b08b-ab2223b624d6" />

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

All settings can be tweaked in **Admin Panel > Plugins > videojs-player**.

### 1. Core Playback
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Autoplay** | Automatically start videos when the page loads. | `On` |
| **Start Muted** | Forces video to start at 0% volume. *Required for autoplay in some browsers (Chrome/Safari).* | `Off` |
| **Loop** | Automatically restart the video when it ends. | `Off` |
| **Preload Strategy** | • `Metadata`: Saves bandwidth (loads only size/duration).<br>• `Auto`: Buffers immediately for faster start.<br>• `None`: No data loaded until play is clicked. | `Metadata` |
| **Resume Playback** | Remembers your playback position and restores it if you leave and return to the video. | `On` |
| **Remember Volume** | Saves your volume level between sessions. | `On` |
| **Default Volume (%)** | Sets the initial volume (0 to 100). | `100` |
| **Playback Rates** | Define the speed options in the menu (e.g., `0.5, 1, 1.5, 2`). | `0.5, 1, 1.5, 2` |

### 2. Player Controls
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Show Controls** | Toggle the entire bottom control bar. | `On` |
| **Controls Hide Delay** | Time (ms) before controls fade out. Set to `0` to keep them always visible. | `2000` |
| **Show Seek Buttons** | Adds **Rewind** and **Forward** buttons to the control bar. | `On` |
| **Seek Button Time (s)** | Seconds to skip when using the seek buttons. | `10` |
| **Show Download Button** | Adds a download icon (⬇) to the control bar. | `On` |

### 3. Keyboard Shortcuts
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable Hotkeys** | Active when player is focused: `Space` (Play/Pause), `F` (Fullscreen), `M` (Mute), `Arrows` (Seek/Vol). | `On` |
| **Hotkey Seek Time (s)** | Seconds to skip with Left/Right arrows. | `5` |
| **Hotkey Volume Step (%)** | Volume percentage change with Up/Down arrows. | `10` |

### 4. Layout & Sizing
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Sizing Mode** | • **Fluid** (Default): Responsive; fits width, calculates height based on aspect ratio.<br>• **Fixed / Native**: Hard pixel size (video's intrinsic size or custom).<br>• **Fill**: Fills parent container completely (object-fit: cover). | `Fluid` |
| **Fixed Width (px)** | Overrides for **Fixed** mode. Set to `0` to use the video's actual resolution. | `640` |
| **Fixed Height (px)** | Overrides for **Fixed** mode. Set to `0` to use the video's actual resolution. | `360` |

### 5. Appearance
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Player Theme** | Choose an official Skin: `Default`, `City`, `Fantasy`, `Forest`, `Sea`. | `Default` |
| **HEVC Error Style** | How to handle unsupported H.265 videos:<br>• **Overlay**: Shows error message on player.<br>• **Notification**: System toast message. | `Overlay` |

### 6. Mobile Experience
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Double Tap to Seek** | Double-tap left/right sides of the video to rewind/forward, like YouTube. | `On` |
| **Double Tap Seek Time (s)** | Seconds to skip on double-tap. | `10` |
| **Mobile Auto-Rotate** | Automatically locks screen to landscape when entering fullscreen on mobile (and unlocks on exit). | `On` |

### 7. Advanced / Experimental
| Setting | Description | Default |
| :--- | :--- | :--- |
| **Enable HLS Support** | **Experimental**. Tries to play HLS `.m3u8` streams. | `Off` |

---

## 🛠️ Troubleshooting

### Autoplay stops working
*   Modern browsers (Chrome, Safari) block autoplay with sound. Enable **Start Muted** in settings to fix this.

### "Video format not supported" (HEVC/H.265)
*   **Cause**: The video uses the HEVC codec, which many browsers (like Chrome on Windows) do not support natively without hardware extensions.
*   **Solution**: The player will detect this and show an error (or toast notification). Users generally need to use a browser with support (Safari) or download the file.

### Video is cut off or too big
*   Check your **Sizing Mode**.
*   **Fluid** is best for general use.
*   **Fill** will crop the video if the aspect ratio doesn't match the container.

---

## 👨‍💻 Technical Details

This plugin uses a **React ForwardRef** wrapper to integrate Video.js with the HFS frontend.
*   **Event Proxy**: It injects a hidden dummy `<video>` element to proxy the `ended` event to HFS, ensuring "Play Next" functionality works without modifying HFS core files.
*   **State Persistence**: Uses `localStorage` to handle `resumePlayback` and `persistentVolume` entirely client-side.
*   **Framework**: Built on **Video.js 8.x**.

---
# Sponsored by Google's Antigravity, Gemini 3 Pro and 1 Year Google AI Pro for Students
