import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, runtime, page, layout, leadReceiver] = await Promise.all([
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-partner-offer.js", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/logistics-lead.ts", import.meta.url), "utf8"),
]);

assert.match(layout, /RepairPartnerOfferEnhancer/);
assert.match(page, /id="partner-beta-form"/);
assert.match(enhancer, /Contact Name/);
assert.match(enhancer, /Business Email/);
assert.match(enhancer, /partner-contact-consent/);

// The live runtime must remove historical browser-only listeners before attaching its own handler.
assert.match(runtime, /cloneNode\(true\)/);
assert.match(runtime, /originalForm\.replaceWith\(form\)/);
assert.match(runtime, /removeAttribute\("data-demo-form"\)/);
assert.match(runtime, /data-live-partner-offer/);
assert.match(runtime, /addEventListener\("submit",[\s\S]*true\);/);
assert.match(runtime, /event\.stopImmediatePropagation\(\)/);

// Delivery is server-confirmed, idempotent, consented, and remains human-reviewed.
assert.match(runtime, /fetch\("\/api\/logistics-lead"/);
assert.match(runtime, /interest:\s*"Hermes Logistics"/);
assert.match(runtime, /"Idempotency-Key": requestId/);
assert.match(runtime, /!response\.ok \|\| !result\?\.success/);
assert.doesNotMatch(runtime, /salesperson[_ -]?code|commission|\?rep=/i);
assert.match(runtime, /OFFER_SUBMITTED — awaiting human review/);
assert.doesNotMatch(runtime, /setTimeout\([\s\S]{0,500}UNDER_REVIEW/);
assert.match(runtime, /event:\s*"connect_offer_submitted"|safeAnalytics\("connect_offer_submitted"/);
const analyticsCalls = runtime.match(/safeAnalytics\([\s\S]*?\);/g) || [];
assert.equal(analyticsCalls.length, 3, "Partner offer should emit only the three bounded lifecycle analytics calls.");
for (const call of analyticsCalls) {
  assert.doesNotMatch(call, /contactName|contactEmail|contactPhone|cityState/, "Partner offer analytics must not include contact/location PII variables.");
}
assert.match(runtime, /safeAnalytics\("connect_offer_draft_prepared", \{ shop_subtype:/);
assert.match(runtime, /safeAnalytics\("connect_offer_submitted", \{ shop_subtype: offer\.shopSubtype, request_state:/);
assert.match(runtime, /safeAnalytics\("connect_offer_delivery_failed", \{ failure_class:/);
assert.match(leadReceiver, /\["Hermes Logistics",\s*"GENERAL CONTACT \/ LOGISTICS"\]/);
assert.match(leadReceiver, /input\.consent !== true/);

console.log("Repair Shop partner offer live-only handler, server-confirmed delivery, human-review boundary, idempotency, and zero-PII telemetry contract passed.");
