import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, runtime, layout, leadReceiver, repairLanding, paidPlan] = await Promise.all([
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-booking-growth.js", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/logistics-lead.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/plan.astro", import.meta.url), "utf8"),
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

// Revenue V1: keep the public Repair Shop path value-first and route paid intent
// through the existing private lead receiver without introducing website payment tech.
assert.match(repairLanding, /Give customers one link to book your repair shop\./);
assert.match(repairLanding, /\/services\/hermes-connect\/repair-shops\/plan\//);
assert.match(repairLanding, /Founding Shop Plan: \$99\/month per location/);
assert.doesNotMatch(repairLanding, /Current live pilot/);

assert.match(paidPlan, /Founding Shop Plan/);
assert.match(paidPlan, /\$99\/month/);
assert.match(paidPlan, /per repair shop location/);
assert.match(paidPlan, /Try the workspace first/);
assert.match(paidPlan, /id="plan-consent" type="checkbox" required/);
assert.match(paidPlan, /fetch\("\/api\/logistics-lead"/);
assert.match(paidPlan, /"Idempotency-Key": requestId/);
assert.match(paidPlan, /connect_paid_plan_requested/);
assert.match(paidPlan, /No payment is taken here/);
assert.match(paidPlan, /"@type": "Service"/);
assert.match(paidPlan, /"@type": "BreadcrumbList"/);
assert.match(paidPlan, /"@type": "FAQPage"/);
assert.doesNotMatch(paidPlan, /js\.stripe\.com|from\s+["']stripe["']|payment_intents|checkout\.sessions\.create|paypal\.com\/sdk/i);
assert.doesNotMatch(
  paidPlan,
  /window\.dataLayer(?:\.|\?\.)push\(\{[^}]*\b(?:email|phone|contactName|shopName|cityState|goal)\b[^}]*\}\)/s,
);

console.log("Repair Shop growth CTA, paid activation intent, indexed money-page schema, private lead routing, and zero-PII telemetry contract passed.");
