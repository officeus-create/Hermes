#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-access-production-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-access-$(date +%s)"
PASSWORD="HermesAccess-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/repair-access-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"
TARGET_SHA="$(git rev-parse HEAD)"
SHOP_ID=""
DB_ID=""
SPECIALIST_ID=""

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

post_d1() {
  local output_file="$1"
  local body="$2"
  curl -sS -o "$output_file" -w '%{http_code}' \
    -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DB_ID}/query" \
    -H "Authorization: Bearer ${CLOUDFLARE_D1_API_TOKEN}" \
    -H 'Content-Type: application/json' \
    --data-binary "$body"
}

cleanup_synthetic() {
  local body http
  body="$(jq -nc --arg email "$EMAIL" '{batch:[
    {sql:"DELETE FROM repair_shop_access WHERE shop_id IN (SELECT r.id FROM repair_shops r JOIN specialists s ON s.id = r.owner_specialist_id WHERE s.email = ?);",params:[$email]},
    {sql:"DELETE FROM sessions WHERE specialist_id IN (SELECT id FROM specialists WHERE email = ?);",params:[$email]},
    {sql:"DELETE FROM repair_shops WHERE owner_specialist_id IN (SELECT id FROM specialists WHERE email = ?);",params:[$email]},
    {sql:"DELETE FROM specialists WHERE email = ?;",params:[$email]}
  ]}')"
  http="$(post_d1 "${TMP}/access-cleanup.json" "$body")"
  [[ "$http" == "200" ]] \
    && [[ "$(jq -r '.success // false' "${TMP}/access-cleanup.json")" == "true" ]] \
    && [[ "$(jq -r '[.result[]?.success == true] | all' "${TMP}/access-cleanup.json")" == "true" ]]
}

cleanup_trap() {
  cleanup_synthetic >/dev/null 2>&1 || true
}
trap cleanup_trap EXIT

if ! cleanup_synthetic; then
  fail_classified "synthetic_cleanup_unavailable"
fi

# The public Shop Owner registration and profile-creation endpoints intentionally
# close after the September 15 free-registration window. Production QA must not
# add a user-facing bypass. Create only this fixed synthetic identity and shop
# through the authenticated D1 operator path, then exercise the normal login,
# session, and owner access API exactly as the product does.
UUID="$(node -e 'console.log(crypto.randomUUID())')"
SPECIALIST_ID="specialist-access-smoke-${UUID}"
SHOP_ID="shop-access-smoke-${UUID}"
SHOP_SLUG="hermes-access-smoke-${UUID%%-*}"
echo "::add-mask::$SPECIALIST_ID"
echo "::add-mask::$SHOP_ID"
echo "::add-mask::$SHOP_SLUG"

CREDS="$(PASSWORD="$PASSWORD" node --input-type=module - <<'NODE'
import { hashPassword } from './src/legacy-prototype/auth.mjs';
const { hash, salt } = await hashPassword(process.env.PASSWORD || '');
process.stdout.write(JSON.stringify({ hash, salt }));
NODE
)"
PASSWORD_HASH="$(jq -r '.hash' <<<"$CREDS")"
PASSWORD_SALT="$(jq -r '.salt' <<<"$CREDS")"
CREATED_AT="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"

echo "::add-mask::$PASSWORD_HASH"
echo "::add-mask::$PASSWORD_SALT"

SETUP_BODY="$(jq -nc \
  --arg specialist "$SPECIALIST_ID" \
  --arg shop "$SHOP_ID" \
  --arg slug "$SHOP_SLUG" \
  --arg email "$EMAIL" \
  --arg hash "$PASSWORD_HASH" \
  --arg salt "$PASSWORD_SALT" \
  --arg created "$CREATED_AT" \
  '{batch:[
    {sql:"INSERT INTO specialists (id,email,password_hash,password_salt,name,role,location,bio,created_at) VALUES (?,?,?,?,?,?,?,?,?);",params:[$specialist,$email,$hash,$salt,"Hermes Access Smoke Owner","Shop Owner","United States","Temporary production access-state verification account.",$created]},
    {sql:"INSERT INTO repair_shops (id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",params:[$shop,$specialist,"Hermes Access Smoke Shop",$slug,"+1 414 555 0195","105 Access Test Way","Milwaukee","WI","53202","America/Chicago",$created,$created]}
  ]}')"
SETUP_HTTP="$(post_d1 "${TMP}/access-setup.json" "$SETUP_BODY")"
if [[ "$SETUP_HTTP" == "401" || "$SETUP_HTTP" == "403" ]]; then
  fail_classified "blocked_cloudflare_d1_write"
fi
if [[ "$SETUP_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-setup.json")" != "true" ]] \
  || [[ "$(jq -r '[.result[]?.success == true] | all' "${TMP}/access-setup.json")" != "true" ]]; then
  fail_classified "synthetic_identity_setup_failed"
fi

LOGIN="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password}')"
LOGIN_HTTP="$(curl -sS -o "${TMP}/access-login.json" -w '%{http_code}' -c "$COOKIE" \
  -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' --data-binary "$LOGIN")"
if [[ "$LOGIN_HTTP" != "200" ]] || [[ "$(jq -r '.success // false' "${TMP}/access-login.json")" != "true" ]]; then
  fail_classified "synthetic_login_failed"
fi

TRIAL_HTTP="$(curl -sS -o "${TMP}/access-trial.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/access")"
if [[ "$TRIAL_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-trial.json")" != "true" ]] \
  || [[ "$(jq -r '.access.state // empty' "${TMP}/access-trial.json")" != "trialing" ]] \
  || [[ "$(jq -r '.access.plan_id // empty' "${TMP}/access-trial.json")" != "repair_shop_founding" ]] \
  || [[ "$(jq -r '.access.next_action // empty' "${TMP}/access-trial.json")" != "choose_plan" ]]; then
  fail_classified "trialing_readback_failed"
fi

NOW="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
UPSERT_BODY="$(jq -nc --arg shop "$SHOP_ID" --arg now "$NOW" '{
  sql:"INSERT INTO repair_shop_access (shop_id,access_state,plan_id,started_at,current_period_end,updated_at) VALUES (?, 'founding', 'repair_shop_founding', ?, NULL, ?) ON CONFLICT(shop_id) DO UPDATE SET access_state = 'founding', plan_id = 'repair_shop_founding', current_period_end = NULL, updated_at = excluded.updated_at;",
  params:[$shop,$now,$now]
}')"
UPSERT_HTTP="$(post_d1 "${TMP}/access-upsert.json" "$UPSERT_BODY")"
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
READ_HTTP="$(post_d1 "${TMP}/access-d1-read.json" "$READ_BODY")"
if [[ "$READ_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-d1-read.json")" != "true" ]] \
  || [[ "$(jq -r '.result[0].results[0].access_state // empty' "${TMP}/access-d1-read.json")" != "founding" ]] \
  || [[ "$(jq -r '.result[0].results[0].plan_id // empty' "${TMP}/access-d1-read.json")" != "repair_shop_founding" ]]; then
  fail_classified "d1_founding_readback_failed"
fi

if ! cleanup_synthetic; then
  fail_classified "synthetic_cleanup_failed"
fi

VERIFY_CLEAN_BODY="$(jq -nc \
  --arg email "$EMAIL" \
  --arg specialist "$SPECIALIST_ID" \
  --arg shop "$SHOP_ID" \
  '{sql:"SELECT (SELECT COUNT(*) FROM specialists WHERE email = ?) AS specialists_count, (SELECT COUNT(*) FROM sessions WHERE specialist_id = ?) AS sessions_count, (SELECT COUNT(*) FROM repair_shops WHERE id = ?) AS shops_count, (SELECT COUNT(*) FROM repair_shop_access WHERE shop_id = ?) AS access_count;",params:[$email,$specialist,$shop,$shop]}')"
VERIFY_CLEAN_HTTP="$(post_d1 "${TMP}/access-clean-read.json" "$VERIFY_CLEAN_BODY")"
if [[ "$VERIFY_CLEAN_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-clean-read.json")" != "true" ]] \
  || [[ "$(jq -r '.result[0].results[0].specialists_count // -1' "${TMP}/access-clean-read.json")" != "0" ]] \
  || [[ "$(jq -r '.result[0].results[0].sessions_count // -1' "${TMP}/access-clean-read.json")" != "0" ]] \
  || [[ "$(jq -r '.result[0].results[0].shops_count // -1' "${TMP}/access-clean-read.json")" != "0" ]] \
  || [[ "$(jq -r '.result[0].results[0].access_count // -1' "${TMP}/access-clean-read.json")" != "0" ]]; then
  fail_classified "cleanup_readback_failed"
fi

CURRENT_MAIN_AFTER="$(gh api "repos/${GITHUB_REPOSITORY}/branches/main" --jq '.commit.sha' 2>/dev/null || true)"
if [[ "$CURRENT_MAIN_AFTER" != "$TARGET_SHA" ]]; then
  fail_classified "stale_main_after_proof"
fi

trap - EXIT
emit_classification "pass"
echo "FINAL_REPAIR_ACCESS_STATE_PRODUCTION_VERDICT=PASS"
