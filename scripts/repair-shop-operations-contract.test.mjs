import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [statusSource, followupSchema, followupEndpoint, bookingSource, operationsSource, componentSource, cleanupSource] = await Promise.all([
  readFile(new URL("../functions/api/repair-shop/bookings/[id]/status.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/_lib/repair-shop-followups-schema.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/followups.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/public/repair-booking.ts", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-operations.js", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/cleanup-booking-smoke.ts", import.meta.url), "utf8"),
]);

assert.match(statusSource, /confirmed:\s*\["in_progress", "completed", "cancelled", "no_show"\]/);
assert.match(statusSource, /no_show:\s*\[\]/);
assert.doesNotMatch(statusSource, /follow_up/);

assert.match(followupSchema, /CREATE TABLE IF NOT EXISTS repair_shop_booking_followups/);
assert.match(followupSchema, /booking_id TEXT PRIMARY KEY/);
assert.match(followupSchema, /needed INTEGER NOT NULL DEFAULT 1/);
assert.match(followupEndpoint, /specialist\.role !== "Shop Owner"/);
assert.match(followupEndpoint, /followup_requires_completed_booking/);
assert.match(followupEndpoint, /ON CONFLICT\(booking_id\) DO UPDATE/);
assert.match(followupEndpoint, /DELETE FROM repair_shop_booking_followups/);

const noShowExclusions = bookingSource.match(/NOT IN \('cancelled','canceled','no_show'\)/g) || [];
assert.equal(noShowExclusions.length, 2, "no_show must release capacity in both availability and booking writes");

assert.match(operationsSource, /\/api\/repair-shop\/followups/);
assert.match(operationsSource, /status:\s*"no_show"/);
assert.match(operationsSource, /data\.history/);
assert.match(operationsSource, /follow_up_needed/);
for (const locale of ["en", "ru", "uk", "es", "it", "fr"]) assert.match(operationsSource, new RegExp(`\\b${locale}: \\{`));
assert.doesNotMatch(operationsSource, /client_email|client_phone|vin|dataLayer|gtag/i);

assert.match(componentSource, /isRepairShopDashboard/);
assert.match(componentSource, /repair-shop-operations\.js/);
assert.match(cleanupSource, /DELETE FROM repair_shop_booking_followups/);

console.log("Repair Shop no-show and follow-up operating contract passed.");
