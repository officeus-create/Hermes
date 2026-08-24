#!/usr/bin/env bash
set -euo pipefail

BASE="${ACADEMY_SMOKE_BASE:-https://hermeslogisticsus.com}"
TMP="${RUNNER_TEMP:-/tmp}/academy-production-smoke"
mkdir -p "$TMP"

# Never treat a branch/commit as production until Cloudflare Pages reports
# success for this exact SHA.
if [[ -n "${GITHUB_SHA:-}" && -n "${GITHUB_REPOSITORY:-}" && -n "${GITHUB_TOKEN:-}" ]]; then
  pages_ready=false
  for attempt in $(seq 1 60); do
    checks="$(curl -fsS \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/check-runs?per_page=100" || true)"
    pages_status="$(printf '%s' "$checks" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
    pages_conclusion="$(printf '%s' "$checks" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
    echo "CLOUDFLARE_PAGES_ATTEMPT_${attempt}: status=${pages_status} conclusion=${pages_conclusion}"
    if [[ "$pages_status" == "completed" && "$pages_conclusion" == "success" ]]; then
      pages_ready=true
      break
    fi
    if [[ "$pages_status" == "completed" && "$pages_conclusion" != "success" && "$pages_conclusion" != "pending" ]]; then
      echo "Cloudflare Pages failed for ${GITHUB_SHA}; refusing production smoke."
      exit 1
    fi
    sleep 10
  done
  test "$pages_ready" = true
else
  echo "GitHub deployment metadata unavailable; refusing an ungated production smoke."
  exit 1
fi

page_index=0
check_page() {
  local path="$1"
  local marker="$2"
  page_index=$((page_index + 1))
  local body="${TMP}/page-${page_index}.html"
  local cache_bust
  cache_bust="${GITHUB_RUN_ID:-manual}-${page_index}-$(date +%s)"
  local separator="?"
  [[ "$path" == *"?"* ]] && separator="&"
  local code
  code="$(curl -sS -L -o "$body" -w '%{http_code}' \
    -H 'cache-control: no-cache' \
    -H 'pragma: no-cache' \
    -H 'user-agent: HermesAcademyProductionSmoke/1.0' \
    "${BASE}${path}${separator}academy_smoke=${cache_bust}")"
  echo "PAGE ${path} HTTP=${code}"
  test "$code" = 200
  grep -Fq "$marker" "$body"
  grep -Fq "noindex,nofollow" "$body"
}

check_page "/services/hermes-connect/academy/" "One learner identity. One reviewed progression path."
check_page "/services/hermes-connect/academy/auth/" "Use one Hermes account across the ecosystem."
check_page "/services/hermes-connect/academy/dashboard/" "Loading your Academy state"
check_page "/services/hermes-connect/academy/program/us-logistics-operations/" "U.S. Logistics Operations"
logistics_body="${TMP}/page-${page_index}.html"
test "$(grep -o 'data-full-lesson-link' "$logistics_body" | wc -l | tr -d ' ')" = 6
check_page "/services/hermes-connect/academy/program/marketing/" "Marketing"
marketing_body="${TMP}/page-${page_index}.html"
test "$(grep -o 'data-full-lesson-link' "$marketing_body" | wc -l | tr -d ' ')" = 6
check_page "/services/hermes-connect/academy/submissions/" "Evidence"
check_page "/services/hermes-connect/academy/progression/" "Progression"
check_page "/services/hermes-connect/academy/support/" "support"
check_page "/services/hermes-connect/academy/reviewer/" "review"
check_page "/services/hermes-connect/academy/reviewer/progression/" "Progression"
check_page "/services/hermes-connect/academy/reviewer/support/" "support"

check_unauth_api() {
  local path="$1"
  local output="$2"
  local code
  code="$(curl -sS -o "${TMP}/${output}.json" -w '%{http_code}' \
    -H 'cache-control: no-cache' \
    -H 'user-agent: HermesAcademyProductionSmoke/1.0' \
    "${BASE}${path}")"
  echo "API ${path} HTTP=${code}"
  test "$code" = 401
  test "$(jq -r '.success // false' "${TMP}/${output}.json")" = false
  test "$(jq -r '.error // empty' "${TMP}/${output}.json")" = "not_authenticated"
}

# Read-only negative authorization checks. No cookie, account, learner row,
# submission, reviewer permission, support item, or progression state is created.
check_unauth_api "/api/academy/profile" "profile"
check_unauth_api "/api/academy/enrollments" "enrollments"
check_unauth_api "/api/academy/progress?program_slug=us-logistics-operations" "progress"
check_unauth_api "/api/academy/submissions" "submissions"
check_unauth_api "/api/academy/progression" "progression"
check_unauth_api "/api/academy/support" "support"
check_unauth_api "/api/academy/reviewer/submissions" "reviewer-submissions"
check_unauth_api "/api/academy/reviewer/progression" "reviewer-progression"
check_unauth_api "/api/academy/reviewer/support" "reviewer-support"

echo "ACADEMY_PRODUCTION_READONLY_VERDICT=PASS"
echo "ACADEMY_LOGISTICS_FULL_LESSON_LINKS=6"
echo "ACADEMY_MARKETING_FULL_LESSON_LINKS=6"
echo "ACADEMY_PRODUCTION_WRITES=0"
