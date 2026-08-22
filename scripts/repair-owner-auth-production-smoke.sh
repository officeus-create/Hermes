#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-owner-auth-production-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-$(date +%s)"
PASSWORD="HermesOwnerAuth-${TEST_ID}-A9!"
TMP="${RUNNER_TEMP:-/tmp}"
COOKIE="${TMP}/repair-owner-auth.cookies"

echo "::add-mask::$PASSWORD"

if [[ -n "${GITHUB_SHA:-}" && -n "${GITHUB_REPOSITORY:-}" && -n "${GITHUB_TOKEN:-}" ]]; then
  PAGES_READY=false
  for attempt in $(seq 1 60); do
    CHECKS="$(curl -fsS -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/check-runs?per_page=100" || true)"
    PAGES_STATUS="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
    PAGES_CONCLUSION="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
    echo "CLOUDFLARE_PAGES_ATTEMPT_${attempt}: status=${PAGES_STATUS} conclusion=${PAGES_CONCLUSION}"
    if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" == "success" ]]; then PAGES_READY=true; break; fi
    if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" != "success" && "$PAGES_CONCLUSION" != "pending" ]]; then exit 1; fi
    sleep 10
  done
  test "$PAGES_READY" = true
else
  echo "GitHub deployment metadata unavailable; refusing ungated production smoke."
  exit 1
fi

cleanup() {
  curl -sS -o "${TMP}/owner-auth-cleanup.json" -X POST "$BASE/api/repair-shop/cleanup-owner-auth-smoke" >/dev/null || true
}
trap cleanup EXIT

PRE="$(curl -sS -o "${TMP}/owner-auth-pre.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-owner-auth-smoke")"
echo "PRE_CLEAN_HTTP=$PRE"; cat "${TMP}/owner-auth-pre.json"; echo
test "$PRE" = 200

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Owner Auth Smoke",role:"Shop Owner",location:"United States",bio:"Temporary Hermes Connect owner authentication verification account."}')"
RC="$(curl -sS -o "${TMP}/owner-auth-register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "REGISTER_HTTP=$RC"; cat "${TMP}/owner-auth-register.json"; echo
test "$RC" = 201

ME1="$(curl -sS -o "${TMP}/owner-auth-me1.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/auth/me")"
echo "SESSION_AFTER_REGISTER_HTTP=$ME1"; cat "${TMP}/owner-auth-me1.json"; echo
test "$ME1" = 200
test "$(jq -r '.success' "${TMP}/owner-auth-me1.json")" = true
test "$(jq -r '.specialist.email' "${TMP}/owner-auth-me1.json")" = "$EMAIL"

# A second independent request with the persisted cookie proves reload/session continuity.
ME2="$(curl -sS -o "${TMP}/owner-auth-me2.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/auth/me")"
echo "SESSION_RELOAD_HTTP=$ME2"; cat "${TMP}/owner-auth-me2.json"; echo
test "$ME2" = 200

LO="$(curl -sS -o "${TMP}/owner-auth-logout.json" -w '%{http_code}' -b "$COOKIE" -c "$COOKIE" -X POST "$BASE/api/auth/logout")"
echo "LOGOUT_HTTP=$LO"; cat "${TMP}/owner-auth-logout.json"; echo
test "$LO" = 200

ME3="$(curl -sS -o "${TMP}/owner-auth-after-logout.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/auth/me")"
echo "SESSION_AFTER_LOGOUT_HTTP=$ME3"; cat "${TMP}/owner-auth-after-logout.json"; echo
test "$ME3" = 401

LOGIN="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password}')"
LI="$(curl -sS -o "${TMP}/owner-auth-login.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' --data-binary "$LOGIN")"
echo "LOGIN_AGAIN_HTTP=$LI"; cat "${TMP}/owner-auth-login.json"; echo
test "$LI" = 200

ME4="$(curl -sS -o "${TMP}/owner-auth-restored.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/auth/me")"
echo "RESTORED_SESSION_HTTP=$ME4"; cat "${TMP}/owner-auth-restored.json"; echo
test "$ME4" = 200
test "$(jq -r '.specialist.email' "${TMP}/owner-auth-restored.json")" = "$EMAIL"

CLEAN="$(curl -sS -o "${TMP}/owner-auth-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-owner-auth-smoke")"
echo "CLEANUP_HTTP=$CLEAN"; cat "${TMP}/owner-auth-clean.json"; echo
test "$CLEAN" = 200
test "$(jq -r '.success' "${TMP}/owner-auth-clean.json")" = true
test "$(jq -r '.remaining' "${TMP}/owner-auth-clean.json")" = 0

AFTER="$(curl -sS -o "${TMP}/owner-auth-after-cleanup.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/auth/me")"
echo "SESSION_AFTER_CLEANUP_HTTP=$AFTER"; cat "${TMP}/owner-auth-after-cleanup.json"; echo
test "$AFTER" = 401

trap - EXIT
echo "FINAL_OWNER_AUTH_VERDICT=PASS"
