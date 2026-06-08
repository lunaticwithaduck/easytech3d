#!/bin/bash
# Figma MCP Setup — Prerequisites checker and guided setup
# Usage: bash ~/.claude/skills/figma/scripts/setup.sh
set -euo pipefail

REPO_URL="https://github.com/grab/cursor-talk-to-figma-mcp.git"
INSTALL_DIR="$HOME/.figma-mcp"
SETTINGS_FILE="$HOME/.claude/settings.local.json"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════════"
echo "  Figma MCP Setup (grab/cursor-talk-to-figma)"
echo "═══════════════════════════════════════════════"
echo ""

# ─── Check Prerequisites ─────────────────────────────────────
echo "Checking prerequisites..."

# Bun
if command -v bun &> /dev/null; then
    ok "Bun installed ($(bun --version))"
    BUN_OK=true
else
    fail "Bun not installed"
    echo "    Install: curl -fsSL https://bun.sh/install | bash"
    BUN_OK=false
fi

# Node.js (fallback)
if command -v node &> /dev/null; then
    ok "Node.js installed ($(node --version))"
else
    warn "Node.js not found (optional, Bun is primary)"
fi

# Figma desktop
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Figma.app" ]; then
        ok "Figma desktop app found"
        FIGMA_OK=true
    else
        fail "Figma desktop app not found in /Applications"
        echo "    Download: https://www.figma.com/downloads/"
        FIGMA_OK=false
    fi
else
    warn "Non-macOS detected — check Figma desktop manually"
    FIGMA_OK=true
fi

# Git
if command -v git &> /dev/null; then
    ok "Git installed"
else
    fail "Git not installed"
    exit 1
fi

echo ""

# ─── Clone or Update Repo ────────────────────────────────────
echo "Setting up MCP server..."

if [ -d "$INSTALL_DIR" ]; then
    ok "Repo already cloned at $INSTALL_DIR"
    echo "    Updating..."
    cd "$INSTALL_DIR"
    git pull --quiet 2>/dev/null || warn "Could not update (check network)"
    cd - > /dev/null
else
    echo "  Cloning to $INSTALL_DIR..."
    git clone --quiet "$REPO_URL" "$INSTALL_DIR"
    ok "Repo cloned"
fi

# Install dependencies
echo "  Installing dependencies..."
cd "$INSTALL_DIR"
bun install --silent 2>/dev/null && ok "Dependencies installed" || fail "bun install failed"
cd - > /dev/null

echo ""

# ─── Claude Code MCP Config ──────────────────────────────────
echo "Configuring Claude Code MCP..."

# Check if MCP server is already registered
if command -v claude &> /dev/null; then
    MCP_LIST=$(claude mcp list 2>/dev/null || echo "")
    if echo "$MCP_LIST" | grep -q "TalkToFigma"; then
        ok "MCP server 'TalkToFigma' already registered"
    else
        echo "  Registering MCP server with Claude Code..."
        claude mcp add --transport stdio TalkToFigma bunx cursor-talk-to-figma-mcp@latest 2>/dev/null \
            && ok "MCP server registered" \
            || warn "Could not auto-register. Run manually:"
        echo "    claude mcp add --transport stdio TalkToFigma bunx cursor-talk-to-figma-mcp@latest"
    fi
else
    warn "Claude CLI not found. Register MCP server manually:"
    echo "    claude mcp add --transport stdio TalkToFigma bunx cursor-talk-to-figma-mcp@latest"
fi

echo ""

# ─── Figma Plugin Setup ──────────────────────────────────────
echo "Figma plugin setup..."

MANIFEST="$INSTALL_DIR/src/cursor_mcp_plugin/manifest.json"
if [ -f "$MANIFEST" ]; then
    ok "Plugin manifest found at:"
    echo "    $MANIFEST"
    echo ""
    echo "  To install in Figma:"
    echo "    1. Open Figma desktop app"
    echo "    2. Go to Plugins → Development → New Plugin"
    echo "    3. Select 'Link existing plugin'"
    echo "    4. Browse to: $MANIFEST"
else
    fail "Plugin manifest not found"
fi

echo ""

# ─── Usage Instructions ──────────────────────────────────────
echo "═══════════════════════════════════════════════"
echo "  Setup Complete — How to Use"
echo "═══════════════════════════════════════════════"
echo ""
echo "  1. Start the WebSocket bridge:"
echo "     cd $INSTALL_DIR && bun socket"
echo ""
echo "  2. Open Figma desktop and run the MCP plugin"
echo "     (Plugins → Development → cursor-talk-to-figma-mcp)"
echo ""
echo "  3. In the plugin UI, enter a channel name"
echo "     (e.g., 'design-team') and click Join"
echo ""
echo "  4. In Claude Code, connect to the same channel:"
echo "     Use the join_channel tool with channel='design-team'"
echo ""
echo "  5. Verify connection:"
echo "     Use get_document_info to confirm"
echo ""

if [ "$BUN_OK" = false ] || [ "$FIGMA_OK" = false ]; then
    echo -e "${RED}Some prerequisites are missing. Fix them before using.${NC}"
    exit 1
else
    echo -e "${GREEN}All prerequisites met. Ready to go!${NC}"
fi
