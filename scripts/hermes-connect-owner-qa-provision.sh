#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
OWNER_EMAIL="officeus+hc-owner-qa-20260818@hermeslogisticsus.com"
OWNER_NAME="Волкогон В."
SHOP_NAME="Northstar Auto Care — Hermes QA"
COOKIE="${RUNNER_TEMP:-/tmp}/hc-owner-qa.cookies"
TMP="${RUNNER_TEMP:-/tmp}/hc-owner-qa"
ARTIFACT_DIR="artifacts/hc-owner-qa"
PASSWORD="HcQA-$(cat /proc/sys/kernel/random/uuid)-A9!"

mkdir -p "$TMP" "$ARTIFACT_DIR"
chmod 700 "$ARTIFACT_DIR"
echo "::add-mask::$PASSWORD"

request() {
  local method="$1" url="$2" output="$3" payload="${4:-}" auth="${5:-no}"
  local args=(-sS -o "$output" -w '%{http_code}' -X "$method")
  if [[ "$auth" == "yes" ]]; then args+=(-b "$COOKIE"); fi
  if [[ -n "$payload" ]]; then args+=(-H 'Content-Type: application/json' --data-binary "$payload"); fi
  curl "${args[@]}" "$url"
}

REGISTER="$(jq -nc \
  --arg email "$OWNER_EMAIL" \
  --arg password "$PASSWORD" \
  --arg name "$OWNER_NAME" \
  '{email:$email,password:$password,name:$name,role:"Shop Owner",location:"United States",bio:"Persistent internal QA owner for Hermes Connect Repair Shops. Test data only; no real customer identity."}')"

REGISTER_HTTP="$(curl -sS -o "$TMP/register.json" -w '%{http_code}' -c "$COOKIE" \
  -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "REGISTER_HTTP=$REGISTER_HTTP"
if [[ "$REGISTER_HTTP" != "201" ]]; then
  cat "$TMP/register.json"
  echo "Provisioning requires a fresh dedicated QA alias; refusing to overwrite an existing owner."
  exit 1
fi

test "$(jq -r '.success // false' "$TMP/register.json")" = true

PROFILE="$(jq -nc --arg name "$SHOP_NAME" '{
  name:$name,
  phone:"+1 414 555 0176",
  address_line1:"QA profile — not a customer-facing physical location",
  city:"Milwaukee",
  state:"WI",
  postal_code:"53202",
  timezone:"America/Chicago"
}')"
PROFILE_HTTP="$(request PUT "$BASE/api/repair-shop/profile" "$TMP/profile.json" "$PROFILE" yes)"
echo "PROFILE_HTTP=$PROFILE_HTTP"
test "$PROFILE_HTTP" = 200
SLUG="$(jq -r '.shop.slug // empty' "$TMP/profile.json")"
test -n "$SLUG"

create_service() {
  local name="$1" duration="$2" out="$3"
  local payload
  payload="$(jq -nc --arg name "$name" --argjson duration "$duration" '{name:$name,duration_minutes:$duration}')"
  local code
  code="$(request POST "$BASE/api/services" "$out" "$payload" yes)"
  echo "SERVICE_HTTP=$code name=$name"
  test "$code" = 201
  jq -r '.service.id' "$out"
}

SERVICE_OIL="$(create_service "Oil Change & Inspection" 45 "$TMP/service-oil.json")"
SERVICE_BRAKE="$(create_service "Brake Inspection & Diagnostic" 60 "$TMP/service-brake.json")"
SERVICE_DIAG="$(create_service "Full Vehicle Diagnostic" 60 "$TMP/service-diagnostic.json")"
test -n "$SERVICE_OIL"
test -n "$SERVICE_BRAKE"
test -n "$SERVICE_DIAG"

AVAILABILITY='{"days":[{"day_of_week":0,"is_open":false,"start_time":"09:00","end_time":"17:00"},{"day_of_week":1,"is_open":true,"start_time":"08:00","end_time":"17:00"},{"day_of_week":2,"is_open":true,"start_time":"08:00","end_time":"17:00"},{"day_of_week":3,"is_open":true,"start_time":"08:00","end_time":"17:00"},{"day_of_week":4,"is_open":true,"start_time":"08:00","end_time":"17:00"},{"day_of_week":5,"is_open":true,"start_time":"08:00","end_time":"17:00"},{"day_of_week":6,"is_open":true,"start_time":"09:00","end_time":"14:00"}]}'
AVAIL_HTTP="$(request PUT "$BASE/api/repair-shop/availability" "$TMP/availability.json" "$AVAILABILITY" yes)"
echo "AVAILABILITY_HTTP=$AVAIL_HTTP"
test "$AVAIL_HTTP" = 200

ME_HTTP="$(request GET "$BASE/api/auth/me" "$TMP/me.json" "" yes)"
PROFILE_GET_HTTP="$(request GET "$BASE/api/repair-shop/profile" "$TMP/profile-get.json" "" yes)"
SERVICES_GET_HTTP="$(request GET "$BASE/api/services" "$TMP/services-get.json" "" yes)"
AVAIL_GET_HTTP="$(request GET "$BASE/api/repair-shop/availability" "$TMP/availability-get.json" "" yes)"
PUBLIC_HTTP="$(request GET "$BASE/api/public/repair-shop?slug=$SLUG" "$TMP/public.json")"

test "$ME_HTTP" = 200
test "$PROFILE_GET_HTTP" = 200
test "$SERVICES_GET_HTTP" = 200
test "$AVAIL_GET_HTTP" = 200
test "$PUBLIC_HTTP" = 200
test "$(jq '.services | length' "$TMP/public.json")" -ge 3

# Two realistic QA bookings for the same fictional customer populate both the
# owner inbox and booking-derived CRM without involving a real person.
DATE1="$(TZ=America/Chicago date -d '+1 day' +%F)"
DATE2="$(TZ=America/Chicago date -d '+2 day' +%F)"
CLIENT_EMAIL="hermes-connect-qa-customer@example.com"

BOOK1="$(jq -nc \
  --arg slug "$SLUG" --arg service "$SERVICE_OIL" --arg date "$DATE1" --arg email "$CLIENT_EMAIL" \
  '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"10:00",client_name:"Alex QA Customer",client_email:$email,client_phone:"+1 414 555 0181",vehicle_year:2022,vehicle_make:"Toyota",vehicle_model:"Camry",mileage:42000,vin:"4T1G11AK0NU000001"}')"
BOOK1_HTTP="$(request POST "$BASE/api/public/repair-booking" "$TMP/booking1.json" "$BOOK1")"
echo "BOOKING1_HTTP=$BOOK1_HTTP"
test "$BOOK1_HTTP" = 201
BOOKING1_ID="$(jq -r '.booking.id // empty' "$TMP/booking1.json")"
test -n "$BOOKING1_ID"

STATUS1_HTTP="$(request PATCH "$BASE/api/repair-shop/bookings/$BOOKING1_ID/status" "$TMP/status-in-progress.json" '{"status":"in_progress"}' yes)"
STATUS2_HTTP="$(request PATCH "$BASE/api/repair-shop/bookings/$BOOKING1_ID/status" "$TMP/status-completed.json" '{"status":"completed"}' yes)"
test "$STATUS1_HTTP" = 200
test "$STATUS2_HTTP" = 200

BOOK2="$(jq -nc \
  --arg slug "$SLUG" --arg service "$SERVICE_BRAKE" --arg date "$DATE2" --arg email "$CLIENT_EMAIL" \
  '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"11:00",client_name:"Alex QA Customer",client_email:$email,client_phone:"+1 414 555 0181",vehicle_year:2022,vehicle_make:"Toyota",vehicle_model:"Camry",mileage:42120,vin:"4T1G11AK0NU000001"}')"
BOOK2_HTTP="$(request POST "$BASE/api/public/repair-booking" "$TMP/booking2.json" "$BOOK2")"
echo "BOOKING2_HTTP=$BOOK2_HTTP"
test "$BOOK2_HTTP" = 201
BOOKING2_ID="$(jq -r '.booking.id // empty' "$TMP/booking2.json")"
test -n "$BOOKING2_ID"

BOOKINGS_HTTP="$(request GET "$BASE/api/repair-shop/bookings" "$TMP/bookings.json" "" yes)"
CUSTOMERS_HTTP="$(request GET "$BASE/api/repair-shop/customers" "$TMP/customers.json" "" yes)"
test "$BOOKINGS_HTTP" = 200
test "$CUSTOMERS_HTTP" = 200
test "$(jq --arg id "$BOOKING1_ID" '[.bookings[] | select(.id==$id and .status=="completed")] | length' "$TMP/bookings.json")" = 1
test "$(jq --arg id "$BOOKING2_ID" '[.bookings[] | select(.id==$id and .status=="confirmed")] | length' "$TMP/bookings.json")" = 1

LOGIN_URL="$BASE/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru"
DASHBOARD_URL="$BASE/services/hermes-connect/repair-shops/dashboard/?lang=ru"
BOOKING_URL="$BASE/services/hermes-connect/repair-shops/booking/?shop=$SLUG&lang=ru"
CUSTOMERS_URL="$BASE/services/hermes-connect/repair-shops/customers/?lang=ru"
AVAILABILITY_URL="$BASE/services/hermes-connect/repair-shops/availability/?lang=ru"

cat > "$ARTIFACT_DIR/credentials.txt" <<EOF
Hermes Connect CEO QA owner
Email: $OWNER_EMAIL
Password: $PASSWORD
Owner: $OWNER_NAME
Shop: $SHOP_NAME
Login: $LOGIN_URL
Dashboard: $DASHBOARD_URL
Public booking: $BOOKING_URL
Customers: $CUSTOMERS_URL
Availability: $AVAILABILITY_URL
EOF
chmod 600 "$ARTIFACT_DIR/credentials.txt"

cat > "$ARTIFACT_DIR/report.md" <<EOF
# Hermes Connect CEO QA owner — production readback

- Owner registration: PASS ($REGISTER_HTTP)
- Authenticated session: PASS ($ME_HTTP)
- Shop profile save/read: PASS ($PROFILE_HTTP / $PROFILE_GET_HTTP)
- Services create/read: PASS (3 services / $SERVICES_GET_HTTP)
- Weekly availability save/read: PASS ($AVAIL_HTTP / $AVAIL_GET_HTTP)
- Public shop readback: PASS ($PUBLIC_HTTP)
- Completed sample booking: PASS ($BOOK1_HTTP)
- Confirmed next booking: PASS ($BOOK2_HTTP)
- Owner booking inbox: PASS ($BOOKINGS_HTTP)
- Customer CRM readback: PASS ($CUSTOMERS_HTTP)

Shop slug: $SLUG
Dashboard: $DASHBOARD_URL
Public booking: $BOOKING_URL
EOF

# Public issue comments remain sanitized. The password exists only in the
# private Actions artifact.
printf '%s\n' \
  "## Hermes Connect CEO QA provisioning — PASS" \
  "" \
  "Owner: **$OWNER_NAME**" \
  "Shop: **$SHOP_NAME**" \
  "Account alias: \`$OWNER_EMAIL\`" \
  "Shop slug: \`$SLUG\`" \
  "" \
  "Production checks passed: owner session, profile, 3 services, weekly availability, public shop, completed booking, confirmed booking, booking inbox, customer CRM." \
  "" \
  "Dashboard: $DASHBOARD_URL" \
  "Public booking: $BOOKING_URL" \
  "" \
  "Generated password is intentionally omitted from logs/comments and stored only in the private workflow artifact." \
  > "$ARTIFACT_DIR/issue-comment.md"

echo "HC_OWNER_QA_PROVISION_PASS"
