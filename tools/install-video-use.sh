#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_REPO="https://github.com/browser-use/video-use.git"
INSTALL_DIR="${HOME}/Developer/video-use"

say() {
  printf '[video-use] %s\n' "$*"
}

fail() {
  printf '[video-use] ERROR: %s\n' "$*" >&2
  exit 1
}

command -v git >/dev/null 2>&1 || fail "git is required."
command -v python3 >/dev/null 2>&1 || fail "python3 is required."

mkdir -p "$(dirname "$INSTALL_DIR")"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  say "Updating existing install at $INSTALL_DIR"
  git -C "$INSTALL_DIR" pull --ff-only
else
  if [[ -e "$INSTALL_DIR" ]]; then
    fail "$INSTALL_DIR exists but is not a git checkout. Move it aside and rerun."
  fi
  say "Cloning browser-use/video-use into $INSTALL_DIR"
  git clone "$UPSTREAM_REPO" "$INSTALL_DIR"
fi

say "Installing Python dependencies"
if command -v uv >/dev/null 2>&1; then
  (cd "$INSTALL_DIR" && uv sync)
else
  python3 -m pip install -e "$INSTALL_DIR"
fi

missing_media_tools=0
for tool in ffmpeg ffprobe; do
  if command -v "$tool" >/dev/null 2>&1; then
    say "$tool: OK"
  else
    say "$tool: MISSING"
    missing_media_tools=1
  fi
done

register_skill() {
  local skills_root="$1"
  local label="$2"
  mkdir -p "$skills_root"
  ln -sfn "$INSTALL_DIR" "$skills_root/video-use"
  say "Registered for $label: $skills_root/video-use -> $INSTALL_DIR"
}

registered=0

# Register for Codex when its home exists or the codex command is available.
if [[ -d "${HOME}/.codex" ]] || command -v codex >/dev/null 2>&1; then
  register_skill "${HOME}/.codex/skills" "Codex"
  registered=1
fi

# Register for Claude Code when its home exists or the claude command is available.
if [[ -d "${HOME}/.claude" ]] || command -v claude >/dev/null 2>&1; then
  register_skill "${HOME}/.claude/skills" "Claude Code"
  registered=1
fi

if [[ "$registered" -eq 0 ]]; then
  say "No Codex/Claude home was detected. The upstream install is ready at $INSTALL_DIR."
  say "When an agent is installed, symlink the whole directory into that agent's skills directory as video-use."
fi

say "Verifying helper entrypoint"
python3 "$INSTALL_DIR/helpers/timeline_view.py" --help >/dev/null
say "helpers: OK"

if [[ "$missing_media_tools" -eq 1 ]]; then
  say "ffmpeg/ffprobe are required before real editing."
  if command -v brew >/dev/null 2>&1; then
    say "On this Mac, install them with: brew install ffmpeg"
  else
    say "Install a modern ffmpeg package for this operating system, then rerun this script."
  fi
fi

say "Installation/registration complete."
say "No API key was requested or stored, and no transcription was run."
say "Before the first real video job, read: $INSTALL_DIR/SKILL.md"
say "When transcription is actually needed, configure ELEVENLABS_API_KEY outside the Hermes repo (for example in $INSTALL_DIR/.env)."
