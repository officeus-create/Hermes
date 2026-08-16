import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, layout, repairLanding, paidPlan] = await Promise.all([
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/plan.astro", import.meta.url), "utf8"),
]);

// Public repair booking confirmation is customer-focused. Do not reuse a repair
// customer's booking contact details to create an unrelated B2B marketing lead.
assert.match(layout, /RepairBookingGrowthEnhancer/);
assert.match(enhancer, /Intentionally no public booking-success cross-sell/);
assert.doesNotMatch(enhancer, /Grow My Business \/ Talk to Hermes/);
assert.doesNotMatch(enhancer, /data-growth-consent/);
assert.doesNotMatch(enhancer, /repair-booking-growth\.js/);
assert.doesNotMatch(enhancer, /ProgressoPro/);
assert.doesNotMatch(enhancer, /\/api\/logistics-lead/);

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

console.log("Repair Shop customer-focused booking confirmation, paid activation intent, money-page schema, and zero-PII telemetry contract passed.");