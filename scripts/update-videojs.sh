#!/bin/bash

# ==============================================================================
#  Video.js Plugin - Auto Updater (Linux/macOS)
# ==============================================================================
#  This script downloads the latest release of Video.js from unpkg.com
#  and updates the local 'dist/public' directory.
#
#  Usage: ./update-videojs.sh
# ==============================================================================

# Stop on error
set -e

# --- CONFIGURATION ---
# Determine script directory (handling symlinks if necessary, though simple is usually fine)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/../dist/public"

# Source URLs
JS_URL="https://unpkg.com/video.js/dist/video.min.js"
CSS_URL="https://unpkg.com/video.js/dist/video-js.css"

# --- COLORS ---
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Header
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}    Video.js Plugin - Auto Updater       ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""
echo -e "Target Directory: ${YELLOW}$TARGET_DIR${NC}"
echo ""

# 1. Sanity Check
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}[ERROR] Target directory not found!${NC}"
    echo "Expected to find: 'dist/public' relative to this script."
    exit 1
fi

# 2. Update JavaScript
echo -n "1. Updating 'video.min.js'..."

# Use curl or wget
if command -v curl &> /dev/null; then
    if curl -L -s -f -o "$TARGET_DIR/video.min.js" "$JS_URL"; then
        echo -e " ${GREEN}[DONE]${NC}"
    else
        echo -e " ${RED}[FAILED]${NC}"
        exit 1
    fi
elif command -v wget &> /dev/null; then
    if wget -q -O "$TARGET_DIR/video.min.js" "$JS_URL"; then
        echo -e " ${GREEN}[DONE]${NC}"
    else
        echo -e " ${RED}[FAILED]${NC}"
        exit 1
    fi
else
    echo -e " ${RED}[ERROR] Neither 'curl' nor 'wget' found.${NC}"
    exit 1
fi

# 3. Update CSS
echo -n "2. Updating 'video-js.css'..."

if command -v curl &> /dev/null; then
    if curl -L -s -f -o "$TARGET_DIR/video-js.css" "$CSS_URL"; then
        echo -e " ${GREEN}[DONE]${NC}"
    else
        echo -e " ${RED}[FAILED]${NC}"
        exit 1
    fi
elif command -v wget &> /dev/null; then
    if wget -q -O "$TARGET_DIR/video-js.css" "$CSS_URL"; then
        echo -e " ${GREEN}[DONE]${NC}"
    else
        echo -e " ${RED}[FAILED]${NC}"
        exit 1
    fi
else
    # Should be caught above, but just in case
    exit 1
fi

# 4. Success Message
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   UPDATE COMPLETE SUCCESSFULLY!         ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo "Plugin custom styles (custom.css) remain untouched."
echo ""
