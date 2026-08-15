#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
OWNER_EMAIL="repair-customer-crm-production-smoke@hermesconnect.app"
CLIENT_EMAIL="repair-customer-crm-client@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-$(date +%s)"
PASSWORD="HermesCRM-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/crm-owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"

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
  exit 1
fi

PRE="$(curl -sS -o "${TMP}/crm-pre-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-customer-crm-smoke")"
echo "PRE_CLEAN_HTTP=$PRE"; cat "${TMP}/crm-pre-clean.json"; echo
test "$PRE" = 200

REGISTER="$(jq -nc --arg email "$OWNER_EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes CRM Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production customer CRM verification account for Hermes Connect Repair Shops."}')"
RC="$(curl -sS -o "${TMP}/crm-register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
test "$RC" = 201

PROFILE='{"name":"Hermes CRM Smoke Shop","phone":"+1 414 555 0196","address_line1":"100 CRM Test Way","city":"Milwaukee","state":"WI","postal_code":"53202","timezone":"America/Chicago"}'
PC="$(curl -sS -o "${TMP}/crm-profile.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/profile" -H 'Content-Type: application/json' --data-binary "$PROFILE")"
test "$PC" = 200
SLUG="$(jq -r '.shop.slug' "${TMP}/crm-profile.json")"

SERVICE='{"name":"CRM Smoke Service","duration_minutes":60}'
SC="$(curl -sS -o "${TMP}/crm-service.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/services" -H 'Content-Type: application/json' --data-binary "$SERVICE")"
test "$SC" = 201
SERVICE_ID="$(jq -r '.service.id' "${TMP}/crm-service.json")"

AVAILABILITY='{"days":[{"day_of_week":0,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":1,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":2,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":3,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":4,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":5,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":6,"is_open":true,"start_time":"09:00","end_time":"17:00"}]}'
AC="$(curl -sS -o "${TMP}/crm-availability.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/availability" -H 'Content-Type: application/json' --data-binary "$AVAILABILITY")"
test "$AC" = 200

DATE1="$(TZ=America/Chicago date -d 'tomorrow' +%F)"
DATE2="$(TZ=America/Chicago date -d '+2 days' +%F)"
VIN="1FTFW1E50MFA54321"

BOOK1="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$DATE1" --arg email "$CLIENT_EMAIL" --arg vin "$VIN" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"10:00",client_name:"CRM Repeat Customer",client_email:$email,client_phone:"+1 414 555 0185",vehicle_year:2021,vehicle_make:"Ford",vehicle_model:"F-150",mileage:84500,vin:$vin}')"
B1="$(curl -sS -o "${TMP}/crm-book1.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$BOOK1")"
test "$B1" = 201
ID1="$(jq -r '.booking.id' "${TMP}/crm-book1.json")"

STATUS="$(curl -sS -o "${TMP}/crm-status.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$ID1/status" -H 'Content-Type: application/json' --data-binary '{"status":"completed"}')"
test "$STATUS" = 200

BOOK2="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$DATE2" --arg email "$CLIENT_EMAIL" --arg vin "$VIN" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"11:30",client_name:"CRM Repeat Customer",client_email:$email,client_phone:"+1 414 555 0185",vehicle_year:2021,vehicle_make:"Ford",vehicle_model:"F-150",mileage:90250,vin:$vin}')"
B2="$(curl -sS -o "${TMP}/crm-book2.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$BOOK2")"
test "$B2" = 201
ID2="$(jq -r '.booking.id' "${TMP}/crm-book2.json")"

CC="$(curl -sS -o "${TMP}/crm-customers.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/customers")"
echo "CUSTOMERS_HTTP=$CC"; cat "${TMP}/crm-customers.json"; echo
test "$CC" = 200
test "$(jq '.customers | length' "${TMP}/crm-customers.json")" = 1
test "$(jq -r '.[0].email' < <(jq '.customers' "${TMP}/crm-customers.json"))" = "$CLIENT_EMAIL"
test "$(jq -r '.customers[0].total_bookings' "${TMP}/crm-customers.json")" = 2
test "$(jq -r '.customers[0].completed_visits' "${TMP}/crm-customers.json")" = 1
test "$(jq -r '.customers[0].last_service_date' "${TMP}/crm-customers.json")" = "$DATE1"
test "$(jq -r '.customers[0].next_appointment.booking_id' "${TMP}/crm-customers.json")" = "$ID2"
test "$(jq -r '.customers[0].vehicles | length' "${TMP}/crm-customers.json")" = 1
test "$(jq -r '.customers[0].vehicles[0].make' "${TMP}/crm-customers.json")" = Ford
test "$(jq -r '.customers[0].vehicles[0].model' "${TMP}/crm-customers.json")" = F-150
test "$(jq -r '.customers[0].vehicles[0].mileage' "${TMP}/crm-customers.json")" = 90250
test "$(jq -r '.customers[0].vehicles[0].vin' "${TMP}/crm-customers.json")" = "$VIN"
test "$(jq -r '.customers[0].services | index("CRM Smoke Service") != null' "${TMP}/crm-customers.json")" = true

CLEAN="$(curl -sS -o "${TMP}/crm-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-customer-crm-smoke")"
echo "CLEANUP_HTTP=$CLEAN"; cat "${TMP}/crm-clean.json"; echo
test "$CLEAN" = 200
test "$(jq -r '.remaining' "${TMP}/crm-clean.json")" = 0

echo "REPAIR_CUSTOMER_CRM_PRODUCTION_PASS=YES"
