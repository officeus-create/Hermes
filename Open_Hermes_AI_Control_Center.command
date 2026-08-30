#!/usr/bin/env bash
set -euo pipefail

# Double-click this file in Finder to open the local Hermes AI control panel.
# It never deploys the website or sends information outside this Mac.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
HERMES_AI_HOME="${HERMES_AI_HOME:-$HOME/.hermes-ai}"
ADMIN_URL="http://127.0.0.1:8082/admin"
SERVER_LOG="$HERMES_AI_HOME/fcc-server.log"

cd "$ROOT_DIR"

if [[ "${1:-}" == "--status" ]]; then
  ./scripts/ai/codex-hermes-doctor
  if curl --silent --fail --max-time 2 "$ADMIN_URL" >/dev/null; then
    printf '\n[READY] Hermes AI control panel: %s\n' "$ADMIN_URL"
  else
    printf '\n[NOT RUNNING] Double-click this file without --status to start the local control panel.\n'
  fi
  exit 0
fi

if ! curl --silent --fail --max-time 2 "$ADMIN_URL" >/dev/null; then
  mkdir -p "$HERMES_AI_HOME"
  nohup ./scripts/ai/codex-hermes-server >"$SERVER_LOG" 2>&1 &
  for _ in {1..20}; do
    if curl --silent --fail --max-time 2 "$ADMIN_URL" >/dev/null; then
      break
    fi
    sleep 1
  done
fi

if ! curl --silent --fail --max-time 2 "$ADMIN_URL" >/dev/null; then
  printf '[ERROR] Hermes AI could not start. Check: %s\n' "$SERVER_LOG" >&2
  exit 1
fi

open "$ADMIN_URL"
printf '[READY] Hermes AI control panel opened.\n'
