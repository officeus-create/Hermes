#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-booking-production-smoke@hermesconnect.app"
CLIENT_A="repair-concurrency-a@hermesconnect.app"
CLIENT_B="repair-concurrency-b@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-concurrency-$(date +%s)"
PASSWORD="HermesConcurrency-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/concurrency-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"
TARGET_SHA="$(git rev-parse HEAD)"

echo "::add-mask::$PASSWORD"

cleanup() {
  curl -sS -o "${TMP}/concurrency-cleanup-trap.json" -X POST "$BASE/api/repair-shop/cleanup-booking-smoke" >/dev/null || true
}
trap cleanup EXIT

# Refuse to write production test data until this exact checked-out main revision
# has a successful Cloudflare Pages deployment check.
PAGES_READY=false
for attempt in $(seq 1 60); do
  CHECKS="$(curl -fsS \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${TARGET_SHA}/check-runs?per_page=100" || true)"
  PAGES_STATUS="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
  PAGES_CONCLUSION="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
  echo "CLOUDFLARE_PAGES_ATTEMPT_${attempt}: status=${PAGES_STATUS} conclusion=${PAGES_CONCLUSION}"
  if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" == "success" ]]; then
    PAGES_READY=true
    break
  fi
  if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" != "success" && "$PAGES_CONCLUSION" != "pending" ]]; then
    echo "Cloudflare Pages failed for ${TARGET_SHA}; refusing concurrency proof."
    exit 1
  fi
  sleep 10
done
test "$PAGES_READY" = true

PRE_CLEAN="$(curl -sS -o "${TMP}/concurrency-pre-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
echo "PRE_CLEAN_HTTP=$PRE_CLEAN"; cat "${TMP}/concurrency-pre-clean.json"; echo
test "$PRE_CLEAN" = 200
test "$(jq -r '.success' "${TMP}/concurrency-pre-clean.json")" = true

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Concurrency Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production D1 concurrency verification account."}')"
RC="$(curl -sS -o "${TMP}/concurrency-register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "REGISTER_HTTP=$RC"; cat "${TMP}/concurrency-register.json"; echo
test "$RC" = 201

PROFILE='{"name":"Hermes Concurrency Smoke Shop","phone":"+1 414 555 0196","address_line1":"103 Concurrency Test Way","city":"Milwaukee","state":"WI","postal_code":"53202","timezone":"America/Chicago"}'
PC="$(curl -sS -o "${TMP}/concurrency-profile.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/profile" -H 'Content-Type: application/json' --data-binary "$PROFILE")"
echo "PROFILE_HTTP=$PC"; cat "${TMP}/concurrency-profile.json"; echo
test "$PC" = 200
SLUG="$(jq -r '.shop.slug' "${TMP}/concurrency-profile.json")"
test -n "$SLUG"

SERVICE='{"name":"Production Concurrency Smoke Service","duration_minutes":60}'
SC="$(curl -sS -o "${TMP}/concurrency-service.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/services" -H 'Content-Type: application/json' --data-binary "$SERVICE")"
echo "SERVICE_HTTP=$SC"; cat "${TMP}/concurrency-service.json"; echo
test "$SC" = 201
SERVICE_ID="$(jq -r '.service.id' "${TMP}/concurrency-service.json")"
test -n "$SERVICE_ID"

AVAILABILITY='{"days":[{"day_of_week":0,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":1,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":2,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":3,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":4,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":5,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":6,"is_open":true,"start_time":"09:00","end_time":"17:00"}]}'
AC="$(curl -sS -o "${TMP}/concurrency-availability.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/availability" -H 'Content-Type: application/json' --data-binary "$AVAILABILITY")"
echo "AVAILABILITY_HTTP=$AC"; cat "${TMP}/concurrency-availability.json"; echo
test "$AC" = 200

CAPACITY='{"parallel_booking_capacity":1}'
CC="$(curl -sS -o "${TMP}/concurrency-capacity.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/capacity" -H 'Content-Type: application/json' --data-binary "$CAPACITY")"
echo "CAPACITY_HTTP=$CC"; cat "${TMP}/concurrency-capacity.json"; echo
test "$CC" = 200
test "$(jq -r '.capabilities.parallel_booking_capacity' "${TMP}/concurrency-capacity.json")" = 1

APPOINTMENT_DATE="$(TZ=America/Chicago date -d 'tomorrow' +%F)"
PAYLOAD_A="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$APPOINTMENT_DATE" --arg email "$CLIENT_A" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"09:00",client_name:"Concurrency Customer A",client_email:$email,client_phone:"+1 414 555 0171"}')"
PAYLOAD_B="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$APPOINTMENT_DATE" --arg email "$CLIENT_B" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"09:00",client_name:"Concurrency Customer B",client_email:$email,client_phone:"+1 414 555 0172"}')"

# Launch both writes before waiting for either response. HTTP 409 is a successful
# curl transport result, so wait only detects transport failures here.
curl -sS -o "${TMP}/concurrency-a.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$PAYLOAD_A" > "${TMP}/concurrency-a.code" &
PID_A=$!
curl -sS -o "${TMP}/concurrency-b.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$PAYLOAD_B" > "${TMP}/concurrency-b.code" &
PID_B=$!
wait "$PID_A"
wait "$PID_B"

CODE_A="$(cat "${TMP}/concurrency-a.code")"
CODE_B="$(cat "${TMP}/concurrency-b.code")"
echo "CONCURRENT_A_HTTP=$CODE_A"; cat "${TMP}/concurrency-a.json"; echo
echo "CONCURRENT_B_HTTP=$CODE_B"; cat "${TMP}/concurrency-b.json"; echo
SORTED_CODES="$(printf '%s\n%s\n' "$CODE_A" "$CODE_B" | sort -n | paste -sd, -)"
test "$SORTED_CODES" = "201,409"

SUCCESS_COUNT=0
CONFLICT_COUNT=0
for suffix in a b; do
  code_file="${TMP}/concurrency-${suffix}.code"
  json_file="${TMP}/concurrency-${suffix}.json"
  code="$(cat "$code_file")"
  if [[ "$code" == "201" ]]; then
    test "$(jq -r '.success' "$json_file")" = true
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [[ "$code" == "409" ]]; then
    test "$(jq -r '.success' "$json_file")" = false
    test "$(jq -r '.error' "$json_file")" = slot_unavailable
    CONFLICT_COUNT=$((CONFLICT_COUNT + 1))
  else
    echo "Unexpected concurrent booking HTTP status: $code"
    exit 1
  fi
done
test "$SUCCESS_COUNT" = 1
test "$CONFLICT_COUNT" = 1

OWNER="$(curl -sS -o "${TMP}/concurrency-owner.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/bookings")"
echo "OWNER_BOOKINGS_HTTP=$OWNER"; cat "${TMP}/concurrency-owner.json"; echo
test "$OWNER" = 200
PERSISTED="$(jq -r --arg date "$APPOINTMENT_DATE" --arg a "$CLIENT_A" --arg b "$CLIENT_B" '[.bookings[] | select(.appointment_date==$date and .start_time=="09:00" and (.client_email==$a or .client_email==$b))] | length' "${TMP}/concurrency-owner.json")"
test "$PERSISTED" = 1

BUSY="$(curl -sS -o "${TMP}/concurrency-busy.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
echo "BUSY_AFTER_CONCURRENCY_HTTP=$BUSY"; cat "${TMP}/concurrency-busy.json"; echo
test "$BUSY" = 200
test "$(jq '[.busy[] | select(.start_time=="09:00" and .end_time=="10:00")] | length' "${TMP}/concurrency-busy.json")" = 1

FINAL_CLEAN="$(curl -sS -o "${TMP}/concurrency-cleanup.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
echo "CLEANUP_HTTP=$FINAL_CLEAN"; cat "${TMP}/concurrency-cleanup.json"; echo
test "$FINAL_CLEAN" = 200
test "$(jq -r '.success' "${TMP}/concurrency-cleanup.json")" = true
test "$(jq -r '.remaining' "${TMP}/concurrency-cleanup.json")" = 0
trap - EXIT

echo "FINAL_REPAIR_BOOKING_CONCURRENCY_VERDICT=PASS"
