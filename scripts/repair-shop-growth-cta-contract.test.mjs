import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, runtime, layout, leadReceiver] = await Promise.all([
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-booking-growth.js", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/logistics-lead.ts", import.meta.url), "utf8"),
]);

assert.match(layout, /RepairBookingGrowthEnhancer/);
assert.match(enhancer, /Grow My Business \/ Talk to Hermes/);
assert.match(enhancer, /data-growth-consent required/);
assert.match(enhancer, /\/repair-booking-growth\.js/);
assert.match(runtime, /interest:\s*"ProgressoPro"/);
assert.match(runtime, /fetch\("\/api\/logistics-lead"/);
assert.match(runtime, /"Idempotency-Key": requestId/);
assert.match(runtime, /event:\s*"connect_hermes_growth_cta_requests"/);
assert.match(runtime, /source:\s*"repair_booking_success"/);
assert.doesNotMatch(runtime, /dataLayer\.push\([\s\S]{0,400}(bookingName|bookingEmail|messageInput|client-phone)/);
assert.match(leadReceiver, /\["ProgressoPro",\s*"GENERAL CONTACT \/ MARKETING"\]/);
assert.match(leadReceiver, /input\.consent !== true/);

console.log("Repair Shop growth CTA consent, private lead routing, and zero-PII telemetry contract passed.");
