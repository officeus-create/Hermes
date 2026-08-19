#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-feedback-production-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-$(date +%s)"
PASSWORD="HermesFeedback-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/repair-feedback-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"
MESSAGE="Private feedback production smoke ${TEST_ID}"

echo "::add-mask::$PASSWORD"

if [[ -n "${GITHUB_SHA:-}" && -n "${GITHUB_REPOSITORY:-}" && -n "${GITHUB_TOKEN:-}" ]]; then
  PAGES_READY=false
  for attempt in $(seq 1 60); do
    CHECKS="$(curl -fsS -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/check-runs?per_page=100" || true)"
    PAGES_STATUS="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
    PAGES_CONCLUSION="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
    echo "CLOUDFLARE_PAGES_ATTEMPT_${attempt}: status=${PAGES_STATUS} conclusion=${PAGES_CONCLUSION}"
    if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" == "success" ]]; then PAGES_READY=true; break; fi
    if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" != "success" && "$PAGES_CONCLUSION" != "pending" ]]; then
      echo "Cloudflare Pages failed for ${GITHUB_SHA}; refusing production smoke."
      exit 1
    fi
    sleep 10
  done
  test "$PAGES_READY" = true
else
  echo "GitHub deployment metadata unavailable; refusing an ungated production smoke."
  exit 1
fi

cleanup() {
  curl -sS -o "${TMP}/feedback-cleanup.json" -X POST "$BASE/api/repair-shop/cleanup-feedback-smoke" >/dev/null || true
}
trap cleanup EXIT

PRE="$(curl -sS -o "${TMP}/feedback-pre-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-feedback-smoke")"
echo "PRE_CLEAN_HTTP=$PRE"; cat "${TMP}/feedback-pre-clean.json"; echo
test "$PRE" = 200
test "$(jq -r '.success // false' "${TMP}/feedback-pre-clean.json")" = true

UNAUTH="$(curl -sS -o "${TMP}/feedback-unauth.json" -w '%{http_code}' "$BASE/api/repair-shop/feedback")"
echo "UNAUTH_FEEDBACK_HTTP=$UNAUTH"; cat "${TMP}/feedback-unauth.json"; echo
test "$UNAUTH" = 401

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Feedback Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production private-feedback verification account."}')"
RC="$(curl -sS -o "${TMP}/feedback-register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "REGISTER_HTTP=$RC"; cat "${TMP}/feedback-register.json"; echo
test "$RC" = 201

BAD="$(curl -sS -o "${TMP}/feedback-bad.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/repair-shop/feedback" -H 'Content-Type: application/json' --data-binary '{"category":"booking","rating":6,"message":"This intentionally invalid rating must be rejected."}')"
echo "INVALID_FEEDBACK_HTTP=$BAD"; cat "${TMP}/feedback-bad.json"; echo
test "$BAD" = 400
test "$(jq -r '.error' "${TMP}/feedback-bad.json")" = invalid_feedback_rating

PAYLOAD="$(jq -nc --arg message "$MESSAGE" '{category:"booking",rating:5,message:$message}')"
POST="$(curl -sS -o "${TMP}/feedback-post.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/repair-shop/feedback" -H 'Content-Type: application/json' --data-binary "$PAYLOAD")"
echo "POST_FEEDBACK_HTTP=$POST"; cat "${TMP}/feedback-post.json"; echo
test "$POST" = 201
test "$(jq -r '.success' "${TMP}/feedback-post.json")" = true
test "$(jq -r '.feedback.category' "${TMP}/feedback-post.json")" = booking
test "$(jq -r '.feedback.rating' "${TMP}/feedback-post.json")" = 5
test "$(jq -r '.feedback.message' "${TMP}/feedback-post.json")" = "$MESSAGE"
FEEDBACK_ID="$(jq -r '.feedback.id' "${TMP}/feedback-post.json")"
CREATED_AT="$(jq -r '.feedback.created_at' "${TMP}/feedback-post.json")"
RETENTION_UNTIL="$(jq -r '.feedback.retention_until' "${TMP}/feedback-post.json")"
test -n "$FEEDBACK_ID"
test "$(date -d "$RETENTION_UNTIL" +%s)" -gt "$(date -d "$CREATED_AT" +%s)"

GET="$(curl -sS -o "${TMP}/feedback-get.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/feedback")"
echo "GET_FEEDBACK_HTTP=$GET"; cat "${TMP}/feedback-get.json"; echo
test "$GET" = 200
test "$(jq -r '.success' "${TMP}/feedback-get.json")" = true
test "$(jq -r --arg id "$FEEDBACK_ID" '[.feedback[] | select(.id==$id)] | length' "${TMP}/feedback-get.json")" = 1
test "$(jq -r --arg id "$FEEDBACK_ID" '.feedback[] | select(.id==$id) | .message' "${TMP}/feedback-get.json")" = "$MESSAGE"

CLEAN="$(curl -sS -o "${TMP}/feedback-cleanup.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-feedback-smoke")"
echo "CLEANUP_HTTP=$CLEAN"; cat "${TMP}/feedback-cleanup.json"; echo
test "$CLEAN" = 200
test "$(jq -r '.success' "${TMP}/feedback-cleanup.json")" = true
test "$(jq -r '.remaining' "${TMP}/feedback-cleanup.json")" = 0
trap - EXIT

AFTER="$(curl -sS -o "${TMP}/feedback-after.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/feedback")"
echo "SESSION_AFTER_CLEANUP_HTTP=$AFTER"; cat "${TMP}/feedback-after.json"; echo
test "$AFTER" = 401

echo "FINAL_REPAIR_FEEDBACK_PRODUCTION_SMOKE=PASS"
