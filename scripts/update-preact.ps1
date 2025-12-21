<#
.SYNOPSIS
    Updates the Preact library files (preact.min.js and hooks.min.js) to the latest version.

.DESCRIPTION
    This script downloads the latest release of Preact and Preact Hooks from unpkg.com
    and updates the local 'dist/public' directory.
    
    This is required for the "Direct Link Player" feature to work offline.

.EXAMPLE
    .\update-preact.ps1

    Downloads the latest version and updates the files in ..\dist\public
#>

$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Target relative to this script. Adjust if you move this script.
$targetDir = Join-Path $scriptDir "..\dist\public"

# Source URLs (Using unpkg which redirects to the latest stable version)
$preactUrl = "https://unpkg.com/preact/dist/preact.min.js"
$hooksUrl = "https://unpkg.com/preact/hooks/dist/hooks.umd.js"
# ---------------------

Clear-Host
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    Preact Library - Auto Updater        " -ForegroundColor White
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

# 2. Update Preact
Write-Host "1. Updating 'preact.min.js'..." -NoNewline
try {
    $preactPath = Join-Path $targetDir "preact.min.js"
    Invoke-WebRequest -Uri $preactUrl -OutFile $preactPath
    Write-Host " [DONE]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "Error downloading Preact: $_" -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit 1
}

# 3. Update Preact Hooks
Write-Host "2. Updating 'hooks.min.js'..." -NoNewline
try {
    $hooksPath = Join-Path $targetDir "hooks.min.js"
    Invoke-WebRequest -Uri $hooksUrl -OutFile $hooksPath
    Write-Host " [DONE]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "Error downloading Hooks: $_" -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit 1
}

# 4. Success Message
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   UPDATE COMPLETE SUCCESSFULLY!         " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Preact dependencies have been updated."
Write-Host ""
Read-Host -Prompt "Press Enter to close"
