import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, layout, leadReceiver] = await Promise.all([
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/logistics-lead.ts", import.meta.url), "utf8"),
]);

assert.match(layout, /RepairBookingGrowthEnhancer/);
assert.match(enhancer, /Grow My Business \/ Talk to Hermes/);
assert.match(enhancer, /data-growth-consent required/);
assert.match(enhancer, /interest:\s*"ProgressoPro"/);
assert.match(enhancer, /fetch\("\/api\/logistics-lead"/);
assert.match(enhancer, /"Idempotency-Key": requestId/);
assert.match(enhancer, /event:\s*"connect_hermes_growth_cta_requests"/);
assert.match(enhancer, /source:\s*"repair_booking_success"/);
assert.doesNotMatch(enhancer, /dataLayer\.push\([\s\S]{0,400}(bookingName|bookingEmail|messageInput|client-phone)/);
assert.match(leadReceiver, /\["ProgressoPro",\s*"GENERAL CONTACT \/ MARKETING"\]/);
assert.match(leadReceiver, /input\.consent !== true/);

console.log("Repair Shop growth CTA consent, private lead routing, and zero-PII telemetry contract passed.");
