#!/bin/bash

# =========================================
#    Preact Library - Auto Updater
# =========================================

# Strict mode
set -e

# --- CONFIGURATION ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/../dist/public"
PREACT_URL="https://unpkg.com/preact/dist/preact.min.js"
HOOKS_URL="https://unpkg.com/preact/hooks/dist/hooks.umd.js"
# ---------------------

echo "========================================="
echo "    Preact Library - Auto Updater        "
echo "========================================="
echo ""
echo "Target Directory: $TARGET_DIR"
echo ""

# 1. Sanity Check
if [ ! -d "$TARGET_DIR" ]; then
    echo "[ERROR] Target directory not found!"
    echo "Expected to find: 'dist/public' relative to this script."
    echo "Please ensure this script is inside the 'scripts' folder of the plugin."
    echo ""
    exit 1
fi

# Helper function to download file
download_file() {
    local url="$1"
    local dest="$2"
    
    if command -v curl &> /dev/null; then
        curl -L -s -o "$dest" "$url"
    elif command -v wget &> /dev/null; then
        wget -q -O "$dest" "$url"
    else
        echo "[ERROR] Neither 'curl' nor 'wget' found. Please install one of them."
        exit 1
    fi
}

# 2. Update Preact
echo -n "1. Updating 'preact.min.js'..."
download_file "$PREACT_URL" "$TARGET_DIR/preact.min.js"
echo " [DONE]"

# 3. Update Preact Hooks
echo -n "2. Updating 'hooks.min.js'..."
download_file "$HOOKS_URL" "$TARGET_DIR/hooks.min.js"
echo " [DONE]"

# 4. Success Message
echo ""
echo "========================================="
echo "   UPDATE COMPLETE SUCCESSFULLY!         "
echo "========================================="
echo "Preact dependencies have been updated."
echo ""
