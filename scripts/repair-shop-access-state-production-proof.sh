#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
OPERATOR_PATH="/api/internal/repair-shop-access-proof"
OPERATION_ID="repair_access_state_proof_2026_10_04"
TEST_ID="${GITHUB_RUN_ID:-0}-${GITHUB_RUN_ATTEMPT:-1}"
EMAIL="repair-access-production-smoke+${TEST_ID}@hermesconnect.app"
PASSWORD="$(node -e 'const { randomBytes } = require("node:crypto"); process.stdout.write(randomBytes(24).toString("base64url") + "!Aa9")')"
COOKIE="${RUNNER_TEMP:-/tmp}/repair-access-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"
TARGET_SHA="$(git rev-parse HEAD)"
CLEANUP_READY=0

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
if [[ -z "${OIDC_TOKEN:-}" ]]; then
  fail_classified "operator_not_authorized"
fi
echo "::add-mask::$OIDC_TOKEN"

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

call_operator() {
  local action="$1"
  local output_file="$2"
  local extra_json="${3:-{}}"
  local body
  body="$(jq -nc \
    --arg op "$OPERATION_ID" \
    --arg action "$action" \
    --arg test "$TEST_ID" \
    --argjson extra "$extra_json" \
    '{operation_id:$op,action:$action,test_id:$test} + $extra')"
  curl -sS --retry 2 --retry-all-errors --retry-delay 1 --connect-timeout 10 --max-time 30 \
    -o "$output_file" -w '%{http_code}' \
    -X POST "$BASE$OPERATOR_PATH" \
    -H "Authorization: Bearer $OIDC_TOKEN" \
    -H 'Content-Type: application/json' \
    --data-binary "$body"
}

cleanup_synthetic() {
  local http
  http="$(call_operator "cleanup" "${TMP}/access-cleanup.json")"
  [[ "$http" == "200" ]] \
    && [[ "$(jq -r '.success // false' "${TMP}/access-cleanup.json")" == "true" ]] \
    && [[ "$(jq -r '.remaining // -1' "${TMP}/access-cleanup.json")" == "0" ]]
}

cleanup_trap() {
  if [[ "$CLEANUP_READY" == "1" ]]; then
    cleanup_synthetic >/dev/null 2>&1 || true
  fi
}
trap cleanup_trap EXIT

CREDS="$(PASSWORD="$PASSWORD" node --input-type=module - <<'NODE'
import { hashPassword } from './src/legacy-prototype/auth.mjs';
const { hash, salt } = await hashPassword(process.env.PASSWORD || '');
process.stdout.write(JSON.stringify({ hash, salt }));
NODE
)"
PASSWORD_HASH="$(jq -r '.hash' <<<"$CREDS")"
PASSWORD_SALT="$(jq -r '.salt' <<<"$CREDS")"
echo "::add-mask::$PASSWORD_HASH"
echo "::add-mask::$PASSWORD_SALT"

SETUP_EXTRA="$(jq -nc --arg hash "$PASSWORD_HASH" --arg salt "$PASSWORD_SALT" '{password_hash:$hash,password_salt:$salt}')"
SETUP_HTTP="$(call_operator "setup" "${TMP}/access-setup.json" "$SETUP_EXTRA")"
if [[ "$SETUP_HTTP" == "401" || "$SETUP_HTTP" == "403" ]]; then
  fail_classified "operator_not_authorized"
fi
if [[ "$SETUP_HTTP" != "200" ]] || [[ "$(jq -r '.success // false' "${TMP}/access-setup.json")" != "true" ]]; then
  fail_classified "synthetic_setup_failed"
fi
CLEANUP_READY=1

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

CURRENT_MAIN_BEFORE_TRANSITION="$(gh api "repos/${GITHUB_REPOSITORY}/branches/main" --jq '.commit.sha' 2>/dev/null || true)"
if [[ "$CURRENT_MAIN_BEFORE_TRANSITION" != "$TARGET_SHA" ]]; then
  fail_classified "stale_main_before_transition"
fi

FOUNDING_OPERATOR_HTTP="$(call_operator "founding" "${TMP}/access-founding-operator.json")"
if [[ "$FOUNDING_OPERATOR_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-founding-operator.json")" != "true" ]] \
  || [[ "$(jq -r '.access_state // empty' "${TMP}/access-founding-operator.json")" != "founding" ]] \
  || [[ "$(jq -r '.plan_id // empty' "${TMP}/access-founding-operator.json")" != "repair_shop_founding" ]]; then
  fail_classified "access_transition_failed"
fi

FOUNDING_HTTP="$(curl -sS -o "${TMP}/access-founding.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/access")"
if [[ "$FOUNDING_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-founding.json")" != "true" ]] \
  || [[ "$(jq -r '.access.state // empty' "${TMP}/access-founding.json")" != "founding" ]] \
  || [[ "$(jq -r '.access.plan_id // empty' "${TMP}/access-founding.json")" != "repair_shop_founding" ]] \
  || [[ "$(jq -r '.access.next_action // empty' "${TMP}/access-founding.json")" != "none" ]]; then
  fail_classified "owner_founding_readback_failed"
fi

D1_READ_HTTP="$(call_operator "readback" "${TMP}/access-d1-read.json")"
if [[ "$D1_READ_HTTP" != "200" ]] \
  || [[ "$(jq -r '.success // false' "${TMP}/access-d1-read.json")" != "true" ]] \
  || [[ "$(jq -r '.access_state // empty' "${TMP}/access-d1-read.json")" != "founding" ]] \
  || [[ "$(jq -r '.plan_id // empty' "${TMP}/access-d1-read.json")" != "repair_shop_founding" ]]; then
  fail_classified "d1_founding_readback_failed"
fi

if ! cleanup_synthetic; then
  fail_classified "synthetic_cleanup_failed"
fi
CLEANUP_READY=0

CURRENT_MAIN_AFTER="$(gh api "repos/${GITHUB_REPOSITORY}/branches/main" --jq '.commit.sha' 2>/dev/null || true)"
if [[ "$CURRENT_MAIN_AFTER" != "$TARGET_SHA" ]]; then
  fail_classified "stale_main_after_proof"
fi

trap - EXIT
emit_classification "pass"
echo "FINAL_REPAIR_ACCESS_STATE_PRODUCTION_VERDICT=PASS"
