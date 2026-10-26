#!/bin/bash
set -euo pipefail
umask 077

# Login-session bootstrap for the existing outbound Hermes Internal AI runner.
# This script is a process supervisor boundary only. It is not a second scheduler,
# task queue, CRM, or authorization system.

REPO_ROOT="${HERMES_REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd -P)}"
API_ORIGIN="${HERMES_INTERNAL_AI_API:-https://hermeslogisticsus.com}"
KEYCHAIN_SERVICE="${HERMES_INTERNAL_AI_KEYCHAIN_SERVICE:-com.hermes.internal-ai.runner-token}"
KEYCHAIN_ACCOUNT="${HERMES_INTERNAL_AI_KEYCHAIN_ACCOUNT:-hermes-internal-ai-runner}"
CODEX_BIN="${HERMES_INTERNAL_AI_CODEX_BIN:-}"
DOCTOR="$REPO_ROOT/scripts/ai/codex-hermes-doctor"
RUNNER="$REPO_ROOT/scripts/ai/hermes-internal-ai-runner.py"

fail() { printf "[hermes-internal-ai-launch] BLOCKED: %s\n" "$1" >&2; exit 78; }

[[ "$(uname -s)" == "Darwin" ]] || fail "macOS is required for this LaunchAgent wrapper."
[[ -f "$REPO_ROOT/AGENTS.md" ]] || fail "Hermes repository boundary is missing."
[[ -x "$DOCTOR" ]] || fail "Internal AI doctor is missing or not executable."
[[ -f "$RUNNER" ]] || fail "Internal AI runner is missing."

/usr/bin/python3 - "$API_ORIGIN" <<'PY' || exit 78
import sys
from urllib.parse import urlsplit
u=urlsplit(sys.argv[1])
if u.scheme != "https" or not u.netloc or u.username or u.password or u.path not in ("", "/") or u.query or u.fragment:
    print("[hermes-internal-ai-launch] BLOCKED: HERMES_INTERNAL_AI_API must be an HTTPS origin with no credentials, path, query, or fragment.", file=sys.stderr)
    raise SystemExit(1)
PY

if [[ -n "$CODEX_BIN" ]]; then
  [[ -x "$CODEX_BIN" ]] || fail "Configured Codex binary is not executable; reinstall the LaunchAgent after Codex moves."
  export PATH="$(dirname "$CODEX_BIN"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
else
  export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
  CODEX_BIN="$(command -v codex || true)"
  [[ -n "$CODEX_BIN" && -x "$CODEX_BIN" ]] || fail "Codex binary is not discoverable in the login-session runner PATH."
fi

# The scoped runner token lives only in the macOS login Keychain. It must never
# be written into a plist, repository file, Drive file, command log, or browser.
TOKEN="$(/usr/bin/security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT" -w 2>/dev/null || true)"
[[ ${#TOKEN} -ge 32 ]] || fail "Scoped Internal AI runner token is unavailable from the login Keychain."

# A one-time bootstrap owner token must never leak into the long-lived runner.
unset HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN || true
export HERMES_REPO_ROOT="$REPO_ROOT"
export HERMES_INTERNAL_AI_API="$API_ORIGIN"
export HERMES_INTERNAL_AI_RUNNER_TOKEN="$TOKEN"

# Read-only preflight is mandatory on every process start. A failed preflight
# exits nonzero; launchd may retry later, but no task is claimed from a bad state.
if ! "$DOCTOR" --internal-ai; then
  fail "Internal AI preflight failed. No task was claimed."
fi

printf "[hermes-internal-ai-launch] PRECHECK=PASS repo=%s\n" "$REPO_ROOT"
exec /usr/bin/python3 "$RUNNER"
