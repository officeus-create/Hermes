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
assert.match(runtime, /addEventListener\("submit",[\s\S]*true\);/);
assert.match(runtime, /event\.stopImmediatePropagation\(\)/);
assert.match(runtime, /fetch\("\/api\/logistics-lead"/);
assert.match(runtime, /interest:\s*"Hermes Logistics"/);
assert.match(runtime, /"Idempotency-Key": requestId/);
assert.doesNotMatch(runtime, /salesperson[_ -]?code|commission|\?rep=/i);
assert.match(runtime, /OFFER_SUBMITTED — awaiting human review/);
assert.doesNotMatch(runtime, /setTimeout\([\s\S]{0,500}UNDER_REVIEW/);
assert.match(runtime, /event:\s*"connect_offer_submitted"|safeAnalytics\("connect_offer_submitted"/);
assert.doesNotMatch(runtime, /dataLayer\.push\([\s\S]{0,500}(contactName|contactEmail|contactPhone|cityState)/);
assert.match(leadReceiver, /\["Hermes Logistics",\s*"GENERAL CONTACT \/ LOGISTICS"\]/);
assert.match(leadReceiver, /input\.consent !== true/);

console.log("Repair Shop partner offer live delivery, human-review boundary, server-only attribution boundary, and zero-PII telemetry contract passed.");
