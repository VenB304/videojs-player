<#
.SYNOPSIS
    Updates the Video.js library files (video.min.js and video-js.css) to the latest version.

.DESCRIPTION
    This script downloads the latest release of Video.js from unpkg.com and updates the local
    'dist/public' directory.
    
    It allows administrators to easily update the underlying player engine without waiting for
    a plugin release.
    
    CRITICAL NOTE:
    This script safely overwrites 'video-js.css' because this plugin stores its custom overrides
    in a separate file named 'custom.css'. Your custom styles (like the transcoding overlay)
    will NOT be lost.

.EXAMPLE
    .\update-videojs.ps1

    Downloads the latest version and updates the files in ..\dist\public
#>

$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Target relative to this script. Adjust if you move this script.
$targetDir = Join-Path $scriptDir "..\dist\public"

# Source URLs (Using unpkg which redirects to the latest stable version)
$jsUrl = "https://unpkg.com/video.js/dist/video.min.js"
$cssUrl = "https://unpkg.com/video.js/dist/video-js.css"
# ---------------------

Clear-Host
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    Video.js Plugin - Auto Updater       " -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target Directory: " -NoNewline
Write-Host "$targetDir" -ForegroundColor Yellow
Write-Host ""

# 1. Sanity Check
if (-not (Test-Path $targetDir)) {
    Write-Host "[ERROR] Target directory not found!" -ForegroundColor Red
    Write-Host "Expected to find: 'dist\public' relative to this script."
    Write-Host "Please ensure this script is inside the 'scripts' folder of the plugin."
    Write-Host ""
    Read-Host -Prompt "Press Enter to exit"
    exit 1
}

# 2. Update JavaScript
Write-Host "1. Updating 'video.min.js'..." -NoNewline
try {
    $jsPath = Join-Path $targetDir "video.min.js"
    Invoke-WebRequest -Uri $jsUrl -OutFile $jsPath
    Write-Host " [DONE]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "Error downloading JS: $_" -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit 1
}

# 3. Update CSS
Write-Host "2. Updating 'video-js.css'..." -NoNewline
try {
    $cssPath = Join-Path $targetDir "video-js.css"
    Invoke-WebRequest -Uri $cssUrl -OutFile $cssPath
    Write-Host " [DONE]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "Error downloading CSS: $_" -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit 1
}

# 4. Success Message
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   UPDATE COMPLETE SUCCESSFULLY!         " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "The Video.js core files have been updated."
Write-Host "Plugin custom styles (custom.css) remain untouched."
Write-Host ""
Read-Host -Prompt "Press Enter to close"
