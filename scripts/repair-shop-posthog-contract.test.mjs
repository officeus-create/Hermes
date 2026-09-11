import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const adapter = readFileSync("src/components/RepairShopAnalytics.astro", "utf8");
const consent = readFileSync("src/components/TrackingConsent.astro", "utf8");
const privacy = readFileSync("src/pages/privacy.astro", "utf8");

const requiredEvents = [
  "hc_repair_owner_opened",
  "hc_repair_profile_saved",
  "hc_repair_service_saved",
  "hc_repair_schedule_saved",
  "hc_repair_public_booking_opened",
  "hc_repair_booking_created",
  "hc_repair_booking_completed",
  "hc_repair_paid_intent_submitted",
];

for (const event of requiredEvents) assert.ok(adapter.includes(`\"${event}\"`), `missing Repair Shop event ${event}`);

for (const property of ["locale", "viewport_class", "vertical", "authenticated", "surface", "result_class", "synthetic"]) {
  assert.ok(adapter.includes(`\"${property}\"`), `missing allowed Repair Shop property ${property}`);
}

assert.match(adapter, /PUBLIC_POSTHOG_PROJECT_KEY/);
assert.match(adapter, /PUBLIC_POSTHOG_HOST/);
assert.doesNotMatch(adapter, /phc_[A-Za-z0-9_-]+/);
assert.match(adapter, /hermes-analytics-consent/);
assert.match(adapter, /PROD_HOSTS/);
assert.match(adapter, /\$process_person_profile["']?:\s*false/);
assert.match(adapter, /\$geoip_disable["']?:\s*true/);
assert.match(adapter, /sessionStorage/);
assert.match(adapter, /\.catch\(\(\) => undefined\)/);
assert.match(adapter, /window\.addEventListener\("hermes:analytics"/);
assert.match(adapter, /trackEvent\(/);
assert.match(adapter, /\/capture\//);

for (const forbidden of [
  "email",
  "phone",
  "vin",
  "license_plate",
  "address",
  "customer_name",
  "shop_id",
  "booking_id",
  "payment_id",
  "invoice_id",
  "calendar_event",
  "oauth_token",
  "message",
  "notes",
]) {
  assert.ok(!adapter.includes(`\"${forbidden}\"`), `forbidden analytics property ${forbidden} entered transport adapter`);
}

assert.match(consent, /isRepairShopRoute\s*&&\s*<RepairShopAnalytics\s*\/>/);
assert.match(consent, /PostHog product event stream/);
assert.match(privacy, /PostHog product-event stream/);
assert.match(privacy, /does not enable PostHog autocapture/);
assert.match(privacy, /calendar\/OAuth data/);

console.log("Repair Shop PostHog privacy contract passed.");
