#!/bin/bash
set -euo pipefail
umask 077

LABEL="com.hermes.internal-ai.runner"
KEYCHAIN_SERVICE="com.hermes.internal-ai.runner-token"
KEYCHAIN_ACCOUNT="hermes-internal-ai-runner"
API_ORIGIN="https://hermeslogisticsus.com"
MODE="install"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/ai/install-hermes-internal-ai-launchagent.sh [--api-origin https://hermeslogisticsus.com] [--check-only]
  bash scripts/ai/install-hermes-internal-ai-launchagent.sh --uninstall

The installer never creates, prints, or stores the runner token. Before --install,
provision the scoped token in the macOS login Keychain under:
  service: com.hermes.internal-ai.runner-token
  account: hermes-internal-ai-runner

Installation is an owner/security action. The LaunchAgent starts only after a
user login session exists; it cannot execute work while the Mac is powered off.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-origin) [[ $# -ge 2 ]] || { usage; exit 64; }; API_ORIGIN="$2"; shift 2 ;;
    --check-only) MODE="check"; shift ;;
    --uninstall) MODE="uninstall"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) printf "Unknown argument: %s\n" "$1" >&2; usage; exit 64 ;;
  esac
done

[[ "$(uname -s)" == "Darwin" ]] || { echo "macOS required" >&2; exit 69; }
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
WRAPPER="$REPO_ROOT/scripts/ai/hermes-internal-ai-launch-wrapper.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/HermesInternalAI"
UID_VALUE="$(id -u)"

if [[ "$MODE" == "uninstall" ]]; then
  launchctl bootout "gui/$UID_VALUE/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  printf "HERMES_INTERNAL_AI_LAUNCHAGENT=REMOVED\n"
  printf "KEYCHAIN_ITEM=UNCHANGED\n"
  exit 0
fi

[[ -f "$WRAPPER" ]] || { echo "Wrapper missing: $WRAPPER" >&2; exit 66; }
[[ -f "$REPO_ROOT/scripts/ai/hermes-internal-ai-runner.py" ]] || { echo "Runner missing" >&2; exit 66; }
[[ -x "$REPO_ROOT/scripts/ai/codex-hermes-doctor" ]] || { echo "Doctor missing or not executable" >&2; exit 66; }

CODEX_BIN="$(command -v codex || true)"
[[ -n "$CODEX_BIN" && -x "$CODEX_BIN" ]] || { echo "Codex binary not found in the current owner shell" >&2; exit 69; }

/usr/bin/python3 - "$API_ORIGIN" <<'PY'
import sys
from urllib.parse import urlsplit
u=urlsplit(sys.argv[1])
assert (u.scheme == "https" and u.hostname == "hermeslogisticsus.com" and u.port is None and
        not u.username and not u.password and u.path in ("", "/") and not u.query and not u.fragment), "API origin must be canonical https://hermeslogisticsus.com"
PY

# Never create a second local poller alongside a manually started runner.
# If this exact LaunchAgent already owns the runner, reinstall/check remains safe.
if ! launchctl print "gui/$UID_VALUE/$LABEL" >/dev/null 2>&1; then
  RUNNER_PATH="$REPO_ROOT/scripts/ai/hermes-internal-ai-runner.py"
  if /bin/ps ax -o command= | /usr/bin/grep -F "$RUNNER_PATH" | /usr/bin/grep -v '[g]rep' >/dev/null 2>&1; then
    printf "UNMANAGED_RUNNER_ACTIVE=BLOCKED\n" >&2
    printf "Stop or reconcile the existing manual Internal AI runner before installing this LaunchAgent.\n" >&2
    exit 78
  fi
fi

if ! /usr/bin/security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT" >/dev/null 2>&1; then
  printf "KEYCHAIN_ITEM=PENDING\n"
  printf "Install is blocked until the scoped runner token is provisioned in the login Keychain.\n" >&2
  exit 78
fi

printf "REPO_ROOT=%s\n" "$REPO_ROOT"
printf "CODEX_BIN=%s\n" "$CODEX_BIN"
printf "API_ORIGIN=%s\n" "$API_ORIGIN"
printf "KEYCHAIN_ITEM=PRESENT\n"
if [[ "$MODE" == "check" ]]; then
  printf "HERMES_INTERNAL_AI_LAUNCHAGENT=CHECK_ONLY_PASS\n"
  exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"
chmod 700 "$LOG_DIR"
export HERMES_LAUNCH_LABEL="$LABEL" HERMES_LAUNCH_WRAPPER="$WRAPPER" HERMES_LAUNCH_REPO="$REPO_ROOT"
export HERMES_LAUNCH_API="$API_ORIGIN" HERMES_LAUNCH_CODEX="$CODEX_BIN"
export HERMES_LAUNCH_KEYCHAIN_SERVICE="$KEYCHAIN_SERVICE" HERMES_LAUNCH_KEYCHAIN_ACCOUNT="$KEYCHAIN_ACCOUNT"
export HERMES_LAUNCH_STDOUT="$LOG_DIR/runner.stdout.log" HERMES_LAUNCH_STDERR="$LOG_DIR/runner.stderr.log"
/usr/bin/python3 - "$PLIST" <<'PY'
import os, plistlib, sys
path=sys.argv[1]
d={
 "Label":os.environ["HERMES_LAUNCH_LABEL"],
 "ProgramArguments":["/bin/bash",os.environ["HERMES_LAUNCH_WRAPPER"]],
 "WorkingDirectory":os.environ["HERMES_LAUNCH_REPO"],
 "RunAtLoad":True,
 "KeepAlive":{"SuccessfulExit":False},
 "ThrottleInterval":60,
 "ProcessType":"Background",
 "StandardOutPath":os.environ["HERMES_LAUNCH_STDOUT"],
 "StandardErrorPath":os.environ["HERMES_LAUNCH_STDERR"],
 "EnvironmentVariables":{
   "HERMES_REPO_ROOT":os.environ["HERMES_LAUNCH_REPO"],
   "HERMES_INTERNAL_AI_API":os.environ["HERMES_LAUNCH_API"],
   "HERMES_INTERNAL_AI_CODEX_BIN":os.environ["HERMES_LAUNCH_CODEX"],
   "HERMES_INTERNAL_AI_KEYCHAIN_SERVICE":os.environ["HERMES_LAUNCH_KEYCHAIN_SERVICE"],
   "HERMES_INTERNAL_AI_KEYCHAIN_ACCOUNT":os.environ["HERMES_LAUNCH_KEYCHAIN_ACCOUNT"],
 }
}
with open(path,"wb") as f: plistlib.dump(d,f,sort_keys=True)
PY
chmod 600 "$PLIST"
plutil -lint "$PLIST" >/dev/null

# Replace only this exact LaunchAgent label. Existing Viktor/HAE jobs are untouched.
launchctl bootout "gui/$UID_VALUE/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID_VALUE" "$PLIST"
launchctl kickstart -k "gui/$UID_VALUE/$LABEL"
printf "HERMES_INTERNAL_AI_LAUNCHAGENT=INSTALLED\n"
printf "PLIST=%s\n" "$PLIST"
printf "ROLLBACK=bash scripts/ai/install-hermes-internal-ai-launchagent.sh --uninstall\n"
