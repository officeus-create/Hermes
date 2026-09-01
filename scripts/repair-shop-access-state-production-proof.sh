#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-booking-production-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-access-$(date +%s)"
PASSWORD="HermesAccess-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/repair-access-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"
TARGET_SHA="$(git rev-parse HEAD)"
SHOP_ID=""
DB_ID=""

emit_classification() {
  local value="$1"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "classification=$value" >> "$GITHUB_OUTPUT"
  fi
  echo "REPAIR_ACCESS_PROOF_CLASS=$value"
}

fail_classified() {
  emit_classification "$1"
  exit 1
}

echo "::add-mask::$PASSWORD"

if [[ -z "${GITHUB_REPOSITORY:-}" || -z "${GITHUB_TOKEN:-}" ]]; then
  fail_classified "github_release_evidence_unavailable"
fi

CURRENT_MAIN="$(gh api "repos/${GITHUB_REPOSITORY}/branches/main" --jq '.commit.sha' 2>/dev/null || true)"
if [[ -z "$CURRENT_MAIN" || "$CURRENT_MAIN" != "$TARGET_SHA" ]]; then
  fail_classified "stale_main"
fi

DEPLOY_RUNS="$(gh api "repos/${GITHUB_REPOSITORY}/actions/workflows/cloudflare-pages-production-v2.yml/runs?branch=main&per_page=50" 2>/dev/null || true)"
DEPLOY_OK="$(TARGET_SHA="$TARGET_SHA" RUNS="$DEPLOY_RUNS" node - <<'NODE'
let body = null;
try { body = JSON.parse(process.env.RUNS || "null"); } catch {}
const sha = process.env.TARGET_SHA;
const ok = Array.isArray(body?.workflow_runs) && body.workflow_runs.some(
  (run) => run?.head_sha === sha && run?.status === "completed" && run?.conclusion === "success"
);
process.stdout.write(ok ? "yes" : "no");
NODE
)"
if [[ "$DEPLOY_OK" != "yes" ]]; then
  fail_classified "production_parity_required"
fi

if [[ -z "${CLOUDFLARE_PAGES_API_TOKEN:-}" || -z "${CLOUDFLARE_D1_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  fail_classified "blocked_cloudflare_account_access"
fi

echo "::add-mask::$CLOUDFLARE_PAGES_API_TOKEN"
echo "::add-mask::$CLOUDFLARE_D1_API_TOKEN"
echo "::add-mask::$CLOUDFLARE_ACCOUNT_ID"

PAGES_HTTP="$(curl -sS -o "${TMP}/access-pages-project.json" -w '%{http_code}' \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/hermes" \
  -H "Authorization: Bearer ${CLOUDFLARE_PAGES_API_TOKEN}" \
  -H 'Content-Type: application/json')"
if [[ "$PAGES_HTTP" != "200" ]]; then
  fail_classified "blocked_cloudflare_pages_read"
fi

DB_ID="$(jq -r '.result.deployment_configs.production.d1_databases.DB.id // empty' "${TMP}/access-pages-project.json")"
rm -f "${TMP}/access-pages-project.json"
if [[ -z "$DB_ID" || "$DB_ID" == "null" ]]; then
  fail_classified "production_db_binding_missing"
fi
echo "::add-mask::$DB_ID"

cleanup() {
  curl -sS -o "${TMP}/access-cleanup-trap.json" -X POST "$BASE/api/repair-shop/cleanup-booking-smoke" >/dev/null || true
}
trap cleanup EXIT

PRE_CLEAN="$(curl -sS -o "${TMP}/access-pre-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
if [[ "$PRE_CLEAN" != "200" ]] || [[ "$(jq -r '.success // false' "${TMP}/access-pre-clean.json")" != "true" ]]; then
  fail_classified "synthetic_cleanup_unavailable"
fi

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Access Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production access-state verification account."}')"
REGISTER_HTTP="$(curl -sS -o "${TMP}/access-register.json" -w '%{http_code}' -c "$COOKIE" \
  -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
if [[ "$REGISTER_HTTP" != "201" ]]; then
  fail_classified "synthetic_registration_unavailable"
fi

PROFILE='{"name":"Hermes Access Smoke Shop","phone":"+1 414 555 0195","address_line1":"105 Access Test Way","city":"Milwaukee","state":"WI","postal_code":"53202","timezone":"America/Chicago"}'
PROFILE_HTTP="$(curl -sS -o "${TMP}/access-profile.json" -w '%{http_code}' -b "$COOKIE" \
  -X PUT "$BASE/api/repair-shop/profile" -H 'Content-Type: application/json' --data-binary "$PROFILE")"
if [[ "$PROFILE_HTTP" != "200" ]]; then
  fail_classified "synthetic_profile_unavailable"
fi
SHOP_ID="$(jq -r '.shop.id // empty' "${TMP}/access-profile.json")"
if [[ -z "$SHOP_ID" || "$SHOP_ID" == "null" ]]; then
  fail_classified "synthetic_shop_identity_unavailable"
fi
echo "::add-mask::$SHOP_ID"

TRIAL_HTTP="$(curl -sS -o "${TMP}/access-trial.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/access")"
if [[ "$TRIAL_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-trial.json")" != "true" ]] \
  || [[ "$(jq -r '.access.state // empty' "${TMP}/access-trial.json")" != "trialing" ]] \
  || [[ "$(jq -r '.access.plan_id // empty' "${TMP}/access-trial.json")" != "repair_shop_founding" ]]; then
  fail_classified "trialing_readback_failed"
fi

NOW="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
UPSERT_BODY="$(jq -nc --arg shop "$SHOP_ID" --arg now "$NOW" '{
  sql:"INSERT INTO repair_shop_access (shop_id,access_state,plan_id,started_at,current_period_end,updated_at) VALUES (?, 'founding', 'repair_shop_founding', ?, NULL, ?) ON CONFLICT(shop_id) DO UPDATE SET access_state = 'founding', plan_id = 'repair_shop_founding', current_period_end = NULL, updated_at = excluded.updated_at;",
  params:[$shop,$now,$now]
}')"
UPSERT_HTTP="$(curl -sS -o "${TMP}/access-upsert.json" -w '%{http_code}' \
  -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DB_ID}/query" \
  -H "Authorization: Bearer ${CLOUDFLARE_D1_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-binary "$UPSERT_BODY")"
if [[ "$UPSERT_HTTP" == "401" || "$UPSERT_HTTP" == "403" ]]; then
  fail_classified "blocked_cloudflare_d1_write"
fi
if [[ "$UPSERT_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-upsert.json")" != "true" ]] \
  || [[ "$(jq -r '.result[0].success // false' "${TMP}/access-upsert.json")" != "true" ]]; then
  fail_classified "d1_access_transition_failed"
fi

FOUNDING_HTTP="$(curl -sS -o "${TMP}/access-founding.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/access")"
if [[ "$FOUNDING_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-founding.json")" != "true" ]] \
  || [[ "$(jq -r '.access.state // empty' "${TMP}/access-founding.json")" != "founding" ]] \
  || [[ "$(jq -r '.access.plan_id // empty' "${TMP}/access-founding.json")" != "repair_shop_founding" ]] \
  || [[ "$(jq -r '.access.next_action // empty' "${TMP}/access-founding.json")" != "none" ]]; then
  fail_classified "owner_founding_readback_failed"
fi

READ_BODY="$(jq -nc --arg shop "$SHOP_ID" '{sql:"SELECT access_state,plan_id FROM repair_shop_access WHERE shop_id = ? LIMIT 1;",params:[$shop]}')"
READ_HTTP="$(curl -sS -o "${TMP}/access-d1-read.json" -w '%{http_code}' \
  -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DB_ID}/query" \
  -H "Authorization: Bearer ${CLOUDFLARE_D1_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-binary "$READ_BODY")"
if [[ "$READ_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-d1-read.json")" != "true" ]] \
  || [[ "$(jq -r '.result[0].results[0].access_state // empty' "${TMP}/access-d1-read.json")" != "founding" ]] \
  || [[ "$(jq -r '.result[0].results[0].plan_id // empty' "${TMP}/access-d1-read.json")" != "repair_shop_founding" ]]; then
  fail_classified "d1_founding_readback_failed"
fi

FINAL_CLEAN="$(curl -sS -o "${TMP}/access-final-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
if [[ "$FINAL_CLEAN" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-final-clean.json")" != "true" ]] \
  || [[ "$(jq -r '.remaining // -1' "${TMP}/access-final-clean.json")" != "0" ]]; then
  fail_classified "synthetic_cleanup_failed"
fi

COUNT_BODY="$(jq -nc --arg shop "$SHOP_ID" '{sql:"SELECT COUNT(*) AS count FROM repair_shop_access WHERE shop_id = ?;",params:[$shop]}')"
COUNT_HTTP="$(curl -sS -o "${TMP}/access-d1-clean-read.json" -w '%{http_code}' \
  -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DB_ID}/query" \
  -H "Authorization: Bearer ${CLOUDFLARE_D1_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-binary "$COUNT_BODY")"
if [[ "$COUNT_HTTP" != "200" ]] \
  || [[ "$(jq -r '.result[0].results[0].count // -1' "${TMP}/access-d1-clean-read.json")" != "0" ]]; then
  fail_classified "cleanup_readback_failed"
fi

CURRENT_MAIN_AFTER="$(gh api "repos/${GITHUB_REPOSITORY}/branches/main" --jq '.commit.sha' 2>/dev/null || true)"
if [[ "$CURRENT_MAIN_AFTER" != "$TARGET_SHA" ]]; then
  fail_classified "stale_main_after_proof"
fi

trap - EXIT
emit_classification "pass"
echo "FINAL_REPAIR_ACCESS_STATE_PRODUCTION_VERDICT=PASS"
