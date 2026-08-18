#!/usr/bin/env bash
set -euo pipefail

BASE="https://hermeslogisticsus.com"
OWNER_EMAIL="officeus+hc-owner-qa-v3-20260818@hermeslogisticsus.com"
OWNER_NAME="Волкогон В."
SHOP_NAME="Northstar Auto Care — Hermes CEO QA"
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

REGISTER="$(jq -nc --arg email "$OWNER_EMAIL" --arg password "$PASSWORD" --arg name "$OWNER_NAME" '{email:$email,password:$password,name:$name,role:"Shop Owner",location:"United States",bio:"Persistent internal QA owner for Hermes Connect Repair Shops. Test data only; no real customer identity."}')"
REGISTER_HTTP="$(curl -sS -o "$TMP/register.json" -w '%{http_code}' -c "$COOKIE" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' --data-binary "$REGISTER")"
echo "REGISTER_HTTP=$REGISTER_HTTP"
if [[ "$REGISTER_HTTP" != "201" ]]; then
  cat "$TMP/register.json"
  echo "Fresh QA alias was not created; refusing to overwrite an existing account."
  exit 1
fi
test "$(jq -r '.success // false' "$TMP/register.json")" = true

PROFILE="$(jq -nc --arg name "$SHOP_NAME" '{name:$name,phone:"+1 414 555 0176",address_line1:"QA profile — not a customer-facing physical location",city:"Milwaukee",state:"WI",postal_code:"53202",timezone:"America/Chicago"}')"
PROFILE_HTTP="$(request PUT "$BASE/api/repair-shop/profile" "$TMP/profile.json" "$PROFILE" yes)"
echo "PROFILE_HTTP=$PROFILE_HTTP"
test "$PROFILE_HTTP" = 200
SLUG="$(jq -r '.shop.slug // empty' "$TMP/profile.json")"
test -n "$SLUG"

create_service() {
  local name="$1" duration="$2" out="$3" payload code
  payload="$(jq -nc --arg name "$name" --argjson duration "$duration" '{name:$name,duration_minutes:$duration}')"
  code="$(request POST "$BASE/api/services" "$out" "$payload" yes)"
  echo "SERVICE_HTTP=$code name=$name" >&2
  test "$code" = 201
  jq -r '.service.id' "$out"
}

SERVICE_OIL="$(create_service "Oil Change & Inspection" 45 "$TMP/service-oil.json")"
SERVICE_BRAKE="$(create_service "Brake Inspection & Diagnostic" 60 "$TMP/service-brake.json")"
SERVICE_DIAG="$(create_service "Full Vehicle Diagnostic" 60 "$TMP/service-diagnostic.json")"
for id in "$SERVICE_OIL" "$SERVICE_BRAKE" "$SERVICE_DIAG"; do [[ "$id" == service-* ]]; done

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

next_weekday() {
  local offset="$1" date dow
  date="$(TZ=America/Chicago date -d "+${offset} day" +%F)"
  dow="$(TZ=America/Chicago date -d "$date" +%u)"
  while [[ "$dow" -gt 5 ]]; do
    offset=$((offset + 1))
    date="$(TZ=America/Chicago date -d "+${offset} day" +%F)"
    dow="$(TZ=America/Chicago date -d "$date" +%u)"
  done
  printf '%s' "$date"
}
DATE1="$(next_weekday 1)"
DATE2="$(next_weekday 2)"
if [[ "$DATE2" == "$DATE1" ]]; then DATE2="$(next_weekday 3)"; fi
CLIENT_EMAIL="hermes-connect-qa-customer@example.com"

BOOK1="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_OIL" --arg date "$DATE1" --arg email "$CLIENT_EMAIL" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"10:00",client_name:"Alex QA Customer",client_email:$email,client_phone:"+1 414 555 0181",vehicle_year:2022,vehicle_make:"Toyota",vehicle_model:"Camry",mileage:42000,vin:"4T1G11AK0NU000001"}')"
BOOK1_HTTP="$(request POST "$BASE/api/public/repair-booking" "$TMP/booking1.json" "$BOOK1")"
echo "BOOKING1_HTTP=$BOOK1_HTTP"
test "$BOOK1_HTTP" = 201
BOOKING1_ID="$(jq -r '.booking.id // empty' "$TMP/booking1.json")"
test -n "$BOOKING1_ID"
STATUS1_HTTP="$(request PATCH "$BASE/api/repair-shop/bookings/$BOOKING1_ID/status" "$TMP/status-in-progress.json" '{"status":"in_progress"}' yes)"
STATUS2_HTTP="$(request PATCH "$BASE/api/repair-shop/bookings/$BOOKING1_ID/status" "$TMP/status-completed.json" '{"status":"completed"}' yes)"
test "$STATUS1_HTTP" = 200
test "$STATUS2_HTTP" = 200

BOOK2="$(jq -nc --arg slug "$SLUG" --arg service "$SERVICE_BRAKE" --arg date "$DATE2" --arg email "$CLIENT_EMAIL" '{shop_slug:$slug,service_id:$service,appointment_date:$date,start_time:"11:00",client_name:"Alex QA Customer",client_email:$email,client_phone:"+1 414 555 0181",vehicle_year:2022,vehicle_make:"Toyota",vehicle_model:"Camry",mileage:42120,vin:"4T1G11AK0NU000001"}')"
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

# Encrypt the generated password to a one-time public key. Only the assistant's
# ephemeral private key can decrypt the envelope; plaintext never enters GitHub.
cat > "$TMP/handoff-public.pem" <<'EOF'
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsMKUNRKh606CmotFB9TA
0nzLpcXWjjiMeH7DQhkhmchIEVbGSus1SZ029a25CHlDCmRwLzfa9b08Sw+m0JiL
vwMTC1XF6tyFqwUGElu0gsuzqga0EyPnyPS9hx0vzSVKxa2xW6eyZVonEimaGRZc
e/yrEjpontJGeibfliG4ZAiCjPL/3lxA0Mo5ndOrcjwiFP2xR3Cip1pNTEUSaVRE
Sxmbb5/Svua+EvPZYmGs8u5G4+JFRJWk+iMFzVGhDieHFuvS2oE/kJ9+5RbEC8BZ
SxHu6IjX17DJGfVWA+KXdU67G0PwEKSK/ShqOeFiWX+s/ZBQH5ePiIUAOmu5LDFi
QQIDAQAB
-----END PUBLIC KEY-----
EOF
printf '%s' "$PASSWORD" | openssl pkeyutl -encrypt -pubin -inkey "$TMP/handoff-public.pem" -pkeyopt rsa_padding_mode:oaep -out "$TMP/password.enc"
PASSWORD_ENVELOPE="$(base64 -w0 "$TMP/password.enc")"

printf '%s\n' \
  "## Hermes Connect CEO QA provisioning — PASS / SECURE HANDOFF" \
  "" \
  "Owner: **$OWNER_NAME**" \
  "Shop: **$SHOP_NAME**" \
  "Account alias: \`$OWNER_EMAIL\`" \
  "Shop slug: \`$SLUG\`" \
  "" \
  "Production checks passed: owner session, profile, 3 services, weekly availability, public shop, completed booking, confirmed booking, booking inbox, customer CRM." \
  "" \
  "Login: $LOGIN_URL" \
  "Dashboard: $DASHBOARD_URL" \
  "Public booking: $BOOKING_URL" \
  "" \
  "Encrypted credential envelope (RSA-OAEP): \`$PASSWORD_ENVELOPE\`" \
  > "$ARTIFACT_DIR/issue-comment.md"

echo "HC_OWNER_QA_PROVISION_PASS"
