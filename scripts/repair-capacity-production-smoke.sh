#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-booking-production-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-capacity-$(date +%s)"
PASSWORD="HermesCapacity-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/capacity-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"

echo "::add-mask::$PASSWORD"

if [[ -z "${GITHUB_SHA:-}" || -z "${GITHUB_REPOSITORY:-}" || -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GitHub deployment metadata unavailable; refusing an ungated production capacity smoke."
  exit 1
fi

# Serialize behind the existing production booking smoke for the same main SHA.
BASELINE_READY=false
for attempt in $(seq 1 90); do
  RUNS="$(curl -fsS \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?head_sha=${GITHUB_SHA}&event=push&per_page=100" || true)"
  BASELINE_STATUS="$(printf '%s' "$RUNS" | jq -r '[.workflow_runs[]? | select(.name=="Repair Shop real booking production smoke")] | sort_by(.created_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
  BASELINE_CONCLUSION="$(printf '%s' "$RUNS" | jq -r '[.workflow_runs[]? | select(.name=="Repair Shop real booking production smoke")] | sort_by(.created_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
  echo "BASELINE_BOOKING_SMOKE_ATTEMPT_${attempt}: status=${BASELINE_STATUS} conclusion=${BASELINE_CONCLUSION}"
  if [[ "$BASELINE_STATUS" == "completed" && "$BASELINE_CONCLUSION" == "success" ]]; then
    BASELINE_READY=true
    break
  fi
  if [[ "$BASELINE_STATUS" == "completed" && "$BASELINE_CONCLUSION" != "success" && "$BASELINE_CONCLUSION" != "pending" ]]; then
    echo "Baseline production booking smoke failed for ${GITHUB_SHA}; refusing capacity writes."
    exit 1
  fi
  sleep 10
done
test "$BASELINE_READY" = true

cleanup() {
  curl -sS -o "${TMP}/capacity-cleanup.json" -X POST "$BASE/api/repair-shop/cleanup-booking-smoke" >/dev/null || true
}
trap cleanup EXIT

PRE="$(curl -sS -o "${TMP}/capacity-pre-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
echo "CAPACITY_PRE_CLEAN_HTTP=$PRE"; cat "${TMP}/capacity-pre-clean.json"; echo
test "$PRE" = 200
test "$(jq -r '.success // false' "${TMP}/capacity-pre-clean.json")" = true

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Capacity Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production capacity verification account."}')"
RC="$(curl -sS -o "${TMP}/capacity-register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "CAPACITY_REGISTER_HTTP=$RC"; cat "${TMP}/capacity-register.json"; echo
test "$RC" = 201

PROFILE='{"name":"Hermes Capacity Smoke Shop","phone":"+1 414 555 0196","address_line1":"103 Capacity Test Way","city":"Milwaukee","state":"WI","postal_code":"53202","timezone":"America/Chicago"}'
PC="$(curl -sS -o "${TMP}/capacity-profile.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/profile" -H 'Content-Type: application/json' --data-binary "$PROFILE")"
echo "CAPACITY_PROFILE_HTTP=$PC"; cat "${TMP}/capacity-profile.json"; echo
test "$PC" = 200
SLUG="$(jq -r '.shop.slug' "${TMP}/capacity-profile.json")"
test -n "$SLUG"

SERVICE='{"name":"Capacity Smoke Service","duration_minutes":60}'
SC="$(curl -sS -o "${TMP}/capacity-service.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/services" -H 'Content-Type: application/json' --data-binary "$SERVICE")"
echo "CAPACITY_SERVICE_HTTP=$SC"; cat "${TMP}/capacity-service.json"; echo
test "$SC" = 201
SERVICE_ID="$(jq -r '.service.id' "${TMP}/capacity-service.json")"
test -n "$SERVICE_ID"

AVAILABILITY='{"days":[{"day_of_week":0,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":1,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":2,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":3,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":4,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":5,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":6,"is_open":true,"start_time":"09:00","end_time":"17:00"}]}'
AC="$(curl -sS -o "${TMP}/capacity-availability.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/availability" -H 'Content-Type: application/json' --data-binary "$AVAILABILITY")"
echo "CAPACITY_AVAILABILITY_HTTP=$AC"; cat "${TMP}/capacity-availability.json"; echo
test "$AC" = 200

CC="$(curl -sS -o "${TMP}/capacity-setting.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/capacity" -H 'Content-Type: application/json' --data-binary '{"parallel_booking_capacity":2}')"
echo "CAPACITY_SETTING_HTTP=$CC"; cat "${TMP}/capacity-setting.json"; echo
test "$CC" = 200
test "$(jq -r '.capabilities.parallel_booking_capacity' "${TMP}/capacity-setting.json")" = 2

APPOINTMENT_DATE="$(TZ=America/Chicago date -d 'tomorrow' +%F)"
PREWARM="$(curl -sS -o "${TMP}/capacity-prewarm.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
echo "CAPACITY_PREWARM_HTTP=$PREWARM"; cat "${TMP}/capacity-prewarm.json"; echo
test "$PREWARM" = 200
test "$(jq -r '.capacity' "${TMP}/capacity-prewarm.json")" = 2
test "$(jq '.busy | length' "${TMP}/capacity-prewarm.json")" = 0

make_payload() {
  local suffix="$1"
  jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$APPOINTMENT_DATE" --arg email "capacity-customer-${suffix}@hermesconnect.app" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"10:00",client_name:("Capacity Customer "+$email),client_email:$email,client_phone:"+1 414 555 0187"}'
}

for i in 1 2 3; do
  PAYLOAD="$(make_payload "$i")"
  (
    CODE="$(curl -sS -o "${TMP}/capacity-booking-${i}.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$PAYLOAD")"
    printf '%s' "$CODE" > "${TMP}/capacity-booking-${i}.code"
  ) &
done
wait

ACCEPTED=0
REJECTED=0
ACCEPTED_IDS=()
for i in 1 2 3; do
  CODE="$(cat "${TMP}/capacity-booking-${i}.code")"
  echo "CAPACITY_CONCURRENT_${i}_HTTP=$CODE"; cat "${TMP}/capacity-booking-${i}.json"; echo
  if [[ "$CODE" == "201" ]]; then
    ACCEPTED=$((ACCEPTED + 1))
    ACCEPTED_IDS+=("$(jq -r '.booking.id' "${TMP}/capacity-booking-${i}.json")")
  elif [[ "$CODE" == "409" ]]; then
    REJECTED=$((REJECTED + 1))
    test "$(jq -r '.error' "${TMP}/capacity-booking-${i}.json")" = slot_unavailable
  else
    echo "Unexpected capacity concurrency HTTP: $CODE"
    exit 1
  fi
done

echo "CAPACITY_CONCURRENT_ACCEPTED=$ACCEPTED REJECTED=$REJECTED"
test "$ACCEPTED" = 2
test "$REJECTED" = 1
test "${#ACCEPTED_IDS[@]}" = 2

SAT="$(curl -sS -o "${TMP}/capacity-saturated.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
echo "CAPACITY_SATURATED_HTTP=$SAT"; cat "${TMP}/capacity-saturated.json"; echo
test "$SAT" = 200
test "$(jq '[.busy[] | select(.start_time=="10:00" and .end_time=="11:00")] | length' "${TMP}/capacity-saturated.json")" = 1

CANCEL_ID="${ACCEPTED_IDS[0]}"
CANCEL="$(curl -sS -o "${TMP}/capacity-cancel.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$CANCEL_ID/status" -H 'Content-Type: application/json' --data-binary '{"status":"cancelled"}')"
echo "CAPACITY_CANCEL_HTTP=$CANCEL"; cat "${TMP}/capacity-cancel.json"; echo
test "$CANCEL" = 200
test "$(jq -r '.booking.status' "${TMP}/capacity-cancel.json")" = cancelled

RELEASED="$(curl -sS -o "${TMP}/capacity-released.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
echo "CAPACITY_RELEASED_HTTP=$RELEASED"; cat "${TMP}/capacity-released.json"; echo
test "$RELEASED" = 200
test "$(jq '[.busy[] | select(.start_time=="10:00" and .end_time=="11:00")] | length' "${TMP}/capacity-released.json")" = 0

REPLACEMENT_PAYLOAD="$(make_payload replacement)"
REPLACEMENT="$(curl -sS -o "${TMP}/capacity-replacement.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$REPLACEMENT_PAYLOAD")"
echo "CAPACITY_REPLACEMENT_HTTP=$REPLACEMENT"; cat "${TMP}/capacity-replacement.json"; echo
test "$REPLACEMENT" = 201

EXCESS_PAYLOAD="$(make_payload excess)"
EXCESS="$(curl -sS -o "${TMP}/capacity-excess.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$EXCESS_PAYLOAD")"
echo "CAPACITY_EXCESS_HTTP=$EXCESS"; cat "${TMP}/capacity-excess.json"; echo
test "$EXCESS" = 409
test "$(jq -r '.error' "${TMP}/capacity-excess.json")" = slot_unavailable

cleanup
trap - EXIT
test "$(jq -r '.success // false' "${TMP}/capacity-cleanup.json")" = true
test "$(jq -r '.remaining' "${TMP}/capacity-cleanup.json")" = 0

echo "FINAL_REPAIR_SHOP_CAPACITY_VERDICT=PASS"
