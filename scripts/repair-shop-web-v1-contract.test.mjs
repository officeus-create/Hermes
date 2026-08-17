import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [runtime, qrRuntime, activationLoader, headers, accessApi, dashboard, availability, booking, customers] = await Promise.all([
  readFile(new URL("../public/repair-shop-web-v1.js", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-qr.js", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairShopActivationEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/_headers", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/access.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/dashboard.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/availability.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/booking.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/customers.astro", import.meta.url), "utf8"),
]);

assert.match(activationLoader, /\/repair-shop-web-v1\.js/);
assert.match(activationLoader, /\/repair-shop-qr\.js/);

// Persisted access state from D1, not browser state.
assert.match(runtime, /fetch\("\/api\/repair-shop\/access"/);
assert.match(accessApi, /ensureDefaultRepairShopAccess/);
for (const state of ["trialing", "founding", "active", "past_due", "cancelled", "comped"]) assert.match(runtime, new RegExp(state));
assert.doesNotMatch(runtime, /localStorage.*(?:access|paid|plan)/i);

// First-ten-minute quick start reuses existing forms/APIs rather than creating a second data path.
assert.match(runtime, /oil_change/);
assert.match(runtime, /diagnostics/);
assert.match(runtime, /brake_inspection/);
assert.match(runtime, /serviceForm\.requestSubmit\(\)/);
assert.match(dashboard, /fetch\("\/api\/services"/);
assert.match(runtime, /connect_shop_service_preset_used/);
assert.match(runtime, /connect_shop_weekday_hours_preset_used/);
assert.match(availability, /fetch\("\/api\/repair-shop\/availability"/);

// Share/repeat/contact/feedback stay on the canonical web workflow.
assert.match(runtime, /navigator\.share/);
assert.match(runtime, /connect_shop_share_link/);
assert.match(runtime, /connect_repeat_booking/);
assert.match(runtime, /mailto:/);
assert.match(runtime, /tel:/);
assert.match(runtime, /sms:/);
assert.match(runtime, /hc-repair-completed-feedback-dismissed/);
assert.match(runtime, /feedback-message/);
assert.match(dashboard, /\/api\/repair-shop\/feedback/);

// QR is lazy and encodes only the already-public canonical booking URL.
assert.match(qrRuntime, /https:\/\/quickchart\.io\/qr/);
assert.match(qrRuntime, /url\.searchParams\.set\("text", bookingUrl\)/);
assert.match(qrRuntime, /data-repair-qr-toggle/);
assert.match(qrRuntime, /connect_shop_qr_view/);
assert.match(qrRuntime, /connect_shop_qr_download/);
assert.match(qrRuntime, /connect_shop_qr_print/);
assert.doesNotMatch(qrRuntime, /client_name|client_email|client_phone|\bvin\b|shopName/);
assert.match(headers, /img-src[^;]*https:\/\/quickchart\.io/);
assert.match(headers, /connect-src[^;]*https:\/\/quickchart\.io/);

// Existing functional foundation remains present.
assert.match(dashboard, /\/api\/repair-shop\/bookings/);
assert.match(dashboard, /\/status/);
assert.match(booking, /Add to calendar \(\.ics\)/);
assert.match(booking, /\/api\/public\/repair-booking/);
assert.match(customers, /\/api\/repair-shop\/customers/);

// Do not add PII to public analytics.
assert.doesNotMatch(runtime, /dataLayer\.push\([\s\S]{0,300}\b(?:email|phone|client_name|client_email|client_phone|shopName|slug|vin)\b/);
assert.doesNotMatch(qrRuntime, /dataLayer\.push\([\s\S]{0,300}\b(?:email|phone|client_name|client_email|client_phone|shopName|slug|vin)\b/);

console.log("Repair Shop Web V1 access, quick-start, sharing, QR, repeat-booking, customer-contact, and feedback contracts passed.");
