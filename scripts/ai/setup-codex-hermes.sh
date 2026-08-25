#!/usr/bin/env bash
set -euo pipefail

FCC_REF="8b312c3a18279466732c3942d7e9246a75725d51"
FCC_VERSION="5.14.5"
HERMES_AI_HOME="${HERMES_AI_HOME:-$HOME/.hermes-ai}"
FCC_VENV="${HERMES_FCC_VENV:-$HERMES_AI_HOME/fcc-venv}"
HERMES_CODEX_HOME="${HERMES_CODEX_HOME:-$HOME/.codex-hermes}"

log() {
  printf '[codex-hermes setup] %s\n' "$*"
}

fail() {
  printf '[codex-hermes setup] ERROR: %s\n' "$*" >&2
  exit 1
}

command -v codex >/dev/null 2>&1 || fail "Official Codex CLI is not on PATH. Install it separately first; this setup intentionally does not replace or modify the official codex command."
command -v uv >/dev/null 2>&1 || fail "uv is required for the isolated FCC environment. On macOS: brew install uv"

mkdir -p "$HERMES_AI_HOME" "$HERMES_CODEX_HOME"
chmod 700 "$HERMES_AI_HOME" "$HERMES_CODEX_HOME" 2>/dev/null || true

if [[ ! -x "$FCC_VENV/bin/python" ]]; then
  log "Creating isolated FCC Python environment at $FCC_VENV"
  uv venv --python 3.14 "$FCC_VENV"
fi

log "Installing reviewed Free Claude Code revision $FCC_REF into the isolated Hermes FCC environment"
uv pip install \
  --python "$FCC_VENV/bin/python" \
  --upgrade \
  "git+https://github.com/Alishahryar1/free-claude-code.git@$FCC_REF"

[[ -x "$FCC_VENV/bin/fcc-codex" ]] || fail "fcc-codex was not installed at $FCC_VENV/bin/fcc-codex"
[[ -x "$FCC_VENV/bin/fcc-server" ]] || fail "fcc-server was not installed at $FCC_VENV/bin/fcc-server"

installed_version="$($FCC_VENV/bin/python -c 'import importlib.metadata as m; print(m.version("free-claude-code"))')"
if [[ "$installed_version" != "$FCC_VERSION" ]]; then
  fail "Expected Free Claude Code $FCC_VERSION from $FCC_REF, got $installed_version"
fi

log "Official Codex remains: $(command -v codex)"
log "Hermes FCC runtime: $FCC_VENV"
log "Hermes Codex state: $HERMES_CODEX_HOME"
log "FCC provider configuration remains outside the repository under ~/.fcc. Do not commit provider keys or tokens."
log "Next: ./scripts/ai/codex-hermes-server"
