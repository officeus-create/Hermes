#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-booking-production-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-ops-$(date +%s)"
PASSWORD="HermesOps-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/ops-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"

echo "::add-mask::$PASSWORD"

if [[ -z "${GITHUB_SHA:-}" || -z "${GITHUB_REPOSITORY:-}" || -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GitHub deployment metadata unavailable; refusing an ungated operations smoke."
  exit 1
fi

# Use the same synthetic account only after capacity proof for this exact SHA is finished.
BASELINE_READY=false
for attempt in $(seq 1 90); do
  RUNS="$(curl -fsS -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?head_sha=${GITHUB_SHA}&event=push&per_page=100" || true)"
  STATUS="$(printf '%s' "$RUNS" | jq -r '[.workflow_runs[]? | select(.name=="Repair Shop capacity production smoke")] | sort_by(.created_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
  CONCLUSION="$(printf '%s' "$RUNS" | jq -r '[.workflow_runs[]? | select(.name=="Repair Shop capacity production smoke")] | sort_by(.created_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
  echo "CAPACITY_BASELINE_ATTEMPT_${attempt}: status=${STATUS} conclusion=${CONCLUSION}"
  if [[ "$STATUS" == "completed" && "$CONCLUSION" == "success" ]]; then BASELINE_READY=true; break; fi
  if [[ "$STATUS" == "completed" && "$CONCLUSION" != "success" && "$CONCLUSION" != "pending" ]]; then exit 1; fi
  sleep 10
done
test "$BASELINE_READY" = true

cleanup() { curl -sS -o "${TMP}/ops-cleanup.json" -X POST "$BASE/api/repair-shop/cleanup-booking-smoke" >/dev/null || true; }
trap cleanup EXIT

CODE="$(curl -sS -o "${TMP}/ops-preclean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
test "$CODE" = 200
test "$(jq -r '.success // false' "${TMP}/ops-preclean.json")" = true

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Operations Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production operating-status verification account."}')"
CODE="$(curl -sS -o "${TMP}/ops-register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "OPS_REGISTER_HTTP=$CODE"; test "$CODE" = 201

PROFILE='{"name":"Hermes Operations Smoke Shop","phone":"+1 414 555 0195","address_line1":"104 Operations Test Way","city":"Milwaukee","state":"WI","postal_code":"53202","timezone":"America/Chicago"}'
CODE="$(curl -sS -o "${TMP}/ops-profile.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/profile" -H 'Content-Type: application/json' --data-binary "$PROFILE")"
test "$CODE" = 200
SLUG="$(jq -r '.shop.slug' "${TMP}/ops-profile.json")"

CODE="$(curl -sS -o "${TMP}/ops-service.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/services" -H 'Content-Type: application/json' --data-binary '{"name":"Operations Smoke Service","duration_minutes":60}')"
test "$CODE" = 201
SERVICE_ID="$(jq -r '.service.id' "${TMP}/ops-service.json")"

DAYS='{"days":[{"day_of_week":0,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":1,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":2,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":3,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":4,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":5,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":6,"is_open":true,"start_time":"09:00","end_time":"17:00"}]}'
CODE="$(curl -sS -o "${TMP}/ops-hours.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/availability" -H 'Content-Type: application/json' --data-binary "$DAYS")"
test "$CODE" = 200

APPOINTMENT_DATE="$(TZ=America/Chicago date -d 'tomorrow' +%F)"
make_payload() {
  local suffix="$1"
  jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$APPOINTMENT_DATE" --arg email "ops-customer-${suffix}@hermesconnect.app" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"10:00",client_name:("Operations Customer "+$email),client_email:$email,client_phone:"+1 414 555 0186"}'
}

PAYLOAD="$(make_payload first)"
CODE="$(curl -sS -o "${TMP}/ops-first.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$PAYLOAD")"
echo "OPS_FIRST_BOOKING_HTTP=$CODE"; test "$CODE" = 201
BOOKING_ID="$(jq -r '.booking.id' "${TMP}/ops-first.json")"

CODE="$(curl -sS -o "${TMP}/ops-blocked.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$(make_payload blocked)")"
echo "OPS_PRE_NOSHOW_CONFLICT_HTTP=$CODE"; test "$CODE" = 409

CODE="$(curl -sS -o "${TMP}/ops-noshow.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$BOOKING_ID/status" -H 'Content-Type: application/json' --data-binary '{"status":"no_show"}')"
echo "OPS_NOSHOW_HTTP=$CODE"; cat "${TMP}/ops-noshow.json"; echo
test "$CODE" = 200
test "$(jq -r '.booking.status' "${TMP}/ops-noshow.json")" = no_show

CODE="$(curl -sS -o "${TMP}/ops-released.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
test "$CODE" = 200
test "$(jq '[.busy[] | select(.start_time=="10:00" and .end_time=="11:00")] | length' "${TMP}/ops-released.json")" = 0

CODE="$(curl -sS -o "${TMP}/ops-replacement.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$(make_payload replacement)")"
echo "OPS_REPLACEMENT_HTTP=$CODE"; test "$CODE" = 201
REPLACEMENT_ID="$(jq -r '.booking.id' "${TMP}/ops-replacement.json")"

CODE="$(curl -sS -o "${TMP}/ops-complete.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$REPLACEMENT_ID/status" -H 'Content-Type: application/json' --data-binary '{"status":"completed"}')"
echo "OPS_COMPLETE_HTTP=$CODE"; test "$CODE" = 200
test "$(jq -r '.booking.status' "${TMP}/ops-complete.json")" = completed

FOLLOW="$(jq -nc --arg id "$REPLACEMENT_ID" '{booking_id:$id,needed:true}')"
CODE="$(curl -sS -o "${TMP}/ops-follow-on.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/followups" -H 'Content-Type: application/json' --data-binary "$FOLLOW")"
echo "OPS_FOLLOWUP_ON_HTTP=$CODE"; test "$CODE" = 200
test "$(jq -r '.follow_up_needed' "${TMP}/ops-follow-on.json")" = true

CODE="$(curl -sS -o "${TMP}/ops-follow-list.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/followups")"
test "$CODE" = 200
test "$(jq --arg id "$REPLACEMENT_ID" '[.followups[] | select(.booking_id==$id)] | length' "${TMP}/ops-follow-list.json")" = 1

FOLLOW_OFF="$(jq -nc --arg id "$REPLACEMENT_ID" '{booking_id:$id,needed:false}')"
CODE="$(curl -sS -o "${TMP}/ops-follow-off.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/followups" -H 'Content-Type: application/json' --data-binary "$FOLLOW_OFF")"
echo "OPS_FOLLOWUP_OFF_HTTP=$CODE"; test "$CODE" = 200
test "$(jq -r '.follow_up_needed' "${TMP}/ops-follow-off.json")" = false

CODE="$(curl -sS -o "${TMP}/ops-follow-empty.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/followups")"
test "$CODE" = 200
test "$(jq '.followups | length' "${TMP}/ops-follow-empty.json")" = 0

cleanup
trap - EXIT
test "$(jq -r '.success // false' "${TMP}/ops-cleanup.json")" = true
test "$(jq -r '.remaining' "${TMP}/ops-cleanup.json")" = 0

echo "FINAL_REPAIR_SHOP_OPERATIONS_VERDICT=PASS"
