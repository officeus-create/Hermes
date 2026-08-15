#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
EMAIL="repair-booking-production-smoke@hermesconnect.app"
CLIENT_EMAIL="repair-booking-customer-smoke@hermesconnect.app"
TEST_ID="${GITHUB_RUN_ID:-manual}-$(date +%s)"
PASSWORD="HermesBooking-${TEST_ID}-A9!"
COOKIE="${RUNNER_TEMP:-/tmp}/owner.cookies"
TMP="${RUNNER_TEMP:-/tmp}"

echo "::add-mask::$PASSWORD"

# Production is the source of truth. Never start product writes until the
# Cloudflare Pages check for this exact main SHA has completed successfully.
if [[ -n "${GITHUB_SHA:-}" && -n "${GITHUB_REPOSITORY:-}" && -n "${GITHUB_TOKEN:-}" ]]; then
  PAGES_READY=false
  for attempt in $(seq 1 60); do
    CHECKS="$(curl -fsS \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/check-runs?per_page=100" || true)"
    PAGES_STATUS="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .status // "missing"' 2>/dev/null || echo missing)"
    PAGES_CONCLUSION="$(printf '%s' "$CHECKS" | jq -r '[.check_runs[]? | select(.name=="Cloudflare Pages")] | sort_by(.started_at) | last | .conclusion // "pending"' 2>/dev/null || echo pending)"
    echo "CLOUDFLARE_PAGES_ATTEMPT_${attempt}: status=${PAGES_STATUS} conclusion=${PAGES_CONCLUSION}"
    if [[ "$PAGES_STATUS" == "completed" && "$PAGES_CONCLUSION" == "success" ]]; then
      PAGES_READY=true
      break
    fi
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

CLEAN="$(curl -sS -o "${TMP}/pre-clean.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
echo "PRE_CLEAN_HTTP=$CLEAN"; cat "${TMP}/pre-clean.json"; echo
test "$CLEAN" = 200
test "$(jq -r '.success // false' "${TMP}/pre-clean.json")" = true

REGISTER="$(jq -nc --arg email "$EMAIL" --arg password "$PASSWORD" '{email:$email,password:$password,name:"Hermes Booking Smoke Owner",role:"Shop Owner",location:"United States",bio:"Temporary production booking verification account for Hermes Connect Repair Shops."}')"
RC="$(curl -sS -o "${TMP}/register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "REGISTER_HTTP=$RC"; cat "${TMP}/register.json"; echo
test "$RC" = 201

PROFILE='{"name":"Hermes Booking Smoke Shop","phone":"+1 414 555 0199","address_line1":"100 Booking Test Way","city":"Milwaukee","state":"WI","postal_code":"53202","timezone":"America/Chicago"}'
PC="$(curl -sS -o "${TMP}/profile.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/profile" -H 'Content-Type: application/json' --data-binary "$PROFILE")"
echo "PROFILE_HTTP=$PC"; cat "${TMP}/profile.json"; echo
test "$PC" = 200
SLUG="$(jq -r '.shop.slug' "${TMP}/profile.json")"
test -n "$SLUG"

SERVICE='{"name":"Production Booking Smoke Service","duration_minutes":60}'
SC="$(curl -sS -o "${TMP}/service.json" -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/services" -H 'Content-Type: application/json' --data-binary "$SERVICE")"
echo "SERVICE_HTTP=$SC"; cat "${TMP}/service.json"; echo
test "$SC" = 201
SERVICE_ID="$(jq -r '.service.id' "${TMP}/service.json")"
test -n "$SERVICE_ID"

AVAILABILITY='{"days":[{"day_of_week":0,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":1,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":2,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":3,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":4,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":5,"is_open":true,"start_time":"09:00","end_time":"17:00"},{"day_of_week":6,"is_open":true,"start_time":"09:00","end_time":"17:00"}]}'
AC="$(curl -sS -o "${TMP}/availability.json" -w '%{http_code}' -b "$COOKIE" -X PUT "$BASE/api/repair-shop/availability" -H 'Content-Type: application/json' --data-binary "$AVAILABILITY")"
echo "AVAILABILITY_HTTP=$AC"; cat "${TMP}/availability.json"; echo
test "$AC" = 200

PUBLIC="$(curl -sS -o "${TMP}/public.json" -w '%{http_code}' "$BASE/api/public/repair-shop?slug=$SLUG")"
echo "PUBLIC_SHOP_HTTP=$PUBLIC"; cat "${TMP}/public.json"; echo
test "$PUBLIC" = 200
test "$(jq -r --arg id "$SERVICE_ID" '[.services[] | select(.id==$id)] | length' "${TMP}/public.json")" = 1

APPOINTMENT_DATE="$(TZ=America/Chicago date -d 'tomorrow' +%F)"
BUSY0="$(curl -sS -o "${TMP}/busy0.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
echo "BUSY_BEFORE_HTTP=$BUSY0"; cat "${TMP}/busy0.json"; echo
test "$BUSY0" = 200
test "$(jq '.busy | length' "${TMP}/busy0.json")" = 0

BOOKING="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_ID" --arg date "$APPOINTMENT_DATE" --arg email "$CLIENT_EMAIL" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"10:00",client_name:"Booking Smoke Customer",client_email:$email,client_phone:"+1 414 555 0188"}')"
BC="$(curl -sS -o "${TMP}/booking.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$BOOKING")"
echo "PUBLIC_BOOKING_HTTP=$BC"; cat "${TMP}/booking.json"; echo
test "$BC" = 201
test "$(jq -r '.success' "${TMP}/booking.json")" = true
BOOKING_ID="$(jq -r '.booking.id' "${TMP}/booking.json")"
test -n "$BOOKING_ID"

OWNER="$(curl -sS -o "${TMP}/owner-bookings.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/bookings")"
echo "OWNER_BOOKINGS_HTTP=$OWNER"; cat "${TMP}/owner-bookings.json"; echo
test "$OWNER" = 200
test "$(jq -r --arg id "$BOOKING_ID" '[.bookings[] | select(.id==$id)] | length' "${TMP}/owner-bookings.json")" = 1
test "$(jq -r --arg id "$BOOKING_ID" '.bookings[] | select(.id==$id) | .client_email' "${TMP}/owner-bookings.json")" = "$CLIENT_EMAIL"
test "$(jq -r --arg id "$BOOKING_ID" '.bookings[] | select(.id==$id) | .status' "${TMP}/owner-bookings.json")" = confirmed
test "$(jq -r --arg id "$BOOKING_ID" '[.bookings[] | select(.id==$id) | .history[] | select(.from_status==null and .to_status=="confirmed")] | length' "${TMP}/owner-bookings.json")" = 1

S1="$(curl -sS -o "${TMP}/status1.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$BOOKING_ID/status" -H 'Content-Type: application/json' --data-binary '{"status":"in_progress"}')"
echo "STATUS_IN_PROGRESS_HTTP=$S1"; cat "${TMP}/status1.json"; echo
test "$S1" = 200
test "$(jq -r '.booking.status' "${TMP}/status1.json")" = in_progress
test "$(jq -r '[.history[] | select(.from_status=="confirmed" and .to_status=="in_progress")] | length' "${TMP}/status1.json")" = 1

OWNER2="$(curl -sS -o "${TMP}/owner2.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/bookings")"
echo "OWNER_AFTER_IN_PROGRESS_HTTP=$OWNER2"; cat "${TMP}/owner2.json"; echo
test "$OWNER2" = 200
test "$(jq -r --arg id "$BOOKING_ID" '.bookings[] | select(.id==$id) | .status' "${TMP}/owner2.json")" = in_progress
test "$(jq -r --arg id "$BOOKING_ID" '.bookings[] | select(.id==$id) | .history | length' "${TMP}/owner2.json")" = 2

S2="$(curl -sS -o "${TMP}/status2.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$BOOKING_ID/status" -H 'Content-Type: application/json' --data-binary '{"status":"completed"}')"
echo "STATUS_COMPLETED_HTTP=$S2"; cat "${TMP}/status2.json"; echo
test "$S2" = 200
test "$(jq -r '.booking.status' "${TMP}/status2.json")" = completed
test "$(jq -r '[.history[] | select(.from_status=="in_progress" and .to_status=="completed")] | length' "${TMP}/status2.json")" = 1

OWNER3="$(curl -sS -o "${TMP}/owner3.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/bookings")"
echo "OWNER_AFTER_COMPLETED_HTTP=$OWNER3"; cat "${TMP}/owner3.json"; echo
test "$OWNER3" = 200
test "$(jq -r --arg id "$BOOKING_ID" '.bookings[] | select(.id==$id) | .status' "${TMP}/owner3.json")" = completed
test "$(jq -r --arg id "$BOOKING_ID" '.bookings[] | select(.id==$id) | .history | length' "${TMP}/owner3.json")" = 3

TERMINAL="$(curl -sS -o "${TMP}/terminal.json" -w '%{http_code}' -b "$COOKIE" -X PATCH "$BASE/api/repair-shop/bookings/$BOOKING_ID/status" -H 'Content-Type: application/json' --data-binary '{"status":"cancelled"}')"
echo "TERMINAL_TRANSITION_HTTP=$TERMINAL"; cat "${TMP}/terminal.json"; echo
test "$TERMINAL" = 409
test "$(jq -r '.error' "${TMP}/terminal.json")" = invalid_status_transition

DUP="$(curl -sS -o "${TMP}/duplicate.json" -w '%{http_code}' -X POST "$BASE/api/public/repair-booking" -H 'Content-Type: application/json' --data-binary "$BOOKING")"
echo "DUPLICATE_BOOKING_HTTP=$DUP"; cat "${TMP}/duplicate.json"; echo
test "$DUP" = 409
test "$(jq -r '.error' "${TMP}/duplicate.json")" = slot_unavailable

BUSY1="$(curl -sS -o "${TMP}/busy1.json" -w '%{http_code}' "$BASE/api/public/repair-booking?shop=$SLUG&date=$APPOINTMENT_DATE")"
echo "BUSY_AFTER_HTTP=$BUSY1"; cat "${TMP}/busy1.json"; echo
test "$BUSY1" = 200
test "$(jq '[.busy[] | select(.start_time=="10:00" and .end_time=="11:00")] | length' "${TMP}/busy1.json")" = 1
test "$(jq '[.busy[] | has("id") or has("status")] | any' "${TMP}/busy1.json")" = false

DELETE_SERVICE="$(curl -sS -o "${TMP}/delete-service.json" -w '%{http_code}' -b "$COOKIE" -X DELETE "$BASE/api/services/$SERVICE_ID")"
echo "DELETE_BOOKED_SERVICE_HTTP=$DELETE_SERVICE"; cat "${TMP}/delete-service.json"; echo
test "$DELETE_SERVICE" = 409
test "$(jq -r '.error' "${TMP}/delete-service.json")" = service_has_bookings

CLEAN2="$(curl -sS -o "${TMP}/cleanup.json" -w '%{http_code}' -X POST "$BASE/api/repair-shop/cleanup-booking-smoke")"
echo "CLEANUP_HTTP=$CLEAN2"; cat "${TMP}/cleanup.json"; echo
test "$CLEAN2" = 200
test "$(jq -r '.success' "${TMP}/cleanup.json")" = true
test "$(jq -r '.remaining' "${TMP}/cleanup.json")" = 0

AFTER="$(curl -sS -o "${TMP}/after.json" -w '%{http_code}' -b "$COOKIE" "$BASE/api/repair-shop/bookings")"
echo "OWNER_SESSION_AFTER_CLEANUP_HTTP=$AFTER"; cat "${TMP}/after.json"; echo
test "$AFTER" = 401

echo "REPAIR_BOOKING_STATUS_HISTORY_PRODUCTION_PASS=YES"
