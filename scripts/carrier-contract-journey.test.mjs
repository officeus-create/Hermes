import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relative) => readFile(path.join(root, relative), "utf8");

const [carrierPage, signPage, journey, layout, logisticsLinks, playbook, onboarding, agreement, offer] = await Promise.all([
  read("src/pages/carrier/index.astro"),
  read("src/pages/sign/index.astro"),
  read("src/components/CarrierContractJourney.astro"),
  read("src/layouts/BaseLayout.astro"),
  read("src/components/LogisticsCommercialLinks.astro"),
  read("docs/CARRIER_SALES_HANDOFF_PLAYBOOK.md"),
  read("src/pages/logistics/carrier-onboarding/index.astro"),
  read("src/pages/logistics/carrier-agreement/index.astro"),
  read("src/pages/logistics/carrier-offer/index.astro"),
]);

for (const required of [
  'title="Carrier Support & Agreement | Hermes Logistics"',
  'robots="noindex,nofollow"',
  'const pageUrl = "https://hermeslogisticsus.com/carrier/"',
  'const shareUrl = "https://hermeslogisticsus.com/sign/"',
  "Keep control. Add a dispatch team.",
  "You approve every load",
  "Non-exclusive · no minimum volume",
  "Freight funds go to your company or factor",
  "No passwords, W-9, bank data, or CDL image here",
  "Send hermeslogisticsus.com/sign",
  "data-carrier-share",
  "data-carrier-copy",
  "data-carrier-sms",
]) assert.ok(carrierPage.includes(required), `Detailed carrier page is missing: ${required}`);

for (const required of [
  'robots="noindex,nofollow"',
  'const shortUrl = "https://hermeslogisticsus.com/sign/"',
  "Everything is clear before you sign.",
  "Continue to carrier packet",
  "Review the agreement first",
  "Ask a question",
  "Non-exclusive support",
  "You approve every load",
  "Freight payments stay with your company",
  "No passwords, bank details, W-9, CDL image, VIN list, or shipment documents in this flow.",
  "data-sign-copy",
  "data-sign-sms",
]) assert.ok(signPage.includes(required), `Short signing page is missing: ${required}`);

for (const source of [carrierPage, signPage]) {
  assert.doesNotMatch(source, /\b(?:we|Hermes)\s+guarantee(?:s|d)?\b/i);
  assert.doesNotMatch(source, /limited time|expires today|only \d+ spots|act now/i);
  assert.doesNotMatch(source, /input[^>]+type=["']password/i);
  assert.doesNotMatch(source, /searchParams\.(?:get|set)\(["'](?:rate|rep|offer|carrier_name|mc|usdot)["']/i);
  assert.doesNotMatch(source, /[?&](?:rate|rep|offer|carrier_name|mc|usdot)=/i);
}
assert.doesNotMatch(signPage, /(?:carrier|driver)[_-]?(?:name|email|phone|mc|usdot)=/i);

for (const required of [
  '"/carrier/"',
  '"/sign/"',
  '"/logistics/carrier/"',
  '"/logistics/carrier-offer/"',
  '"/logistics/carrier-agreement/"',
  'primaryLabel: "Continue to carrier packet"',
  'primaryLabel: "Review and continue"',
  'primaryHref: "/sign/"',
  'const shortUrl = "https://hermeslogisticsus.com/sign/"',
  "Copy link",
  "data-carrier-journey-sms",
  "tel:+12623023626",
]) assert.ok(journey.includes(required), `Carrier journey component is missing: ${required}`);

for (const requiredAnalytics of [
  'event: "commercial_cta_click"',
  'event: "carrier_contract_share"',
  'event: "carrier_contract_document_action"',
  'event: "carrier_contract_intake_start"',
  'event: "carrier_contract_step_reached"',
  'event: "carrier_contract_packet_result"',
  'service_group: "carrier_contract"',
  'carrierEventBase("carrier_contract_onboarding")',
  "stepNumber",
  "preview_status: previewStatus",
  '"delivered"',
  '"pending"',
  '"failed"',
]) assert.ok(journey.includes(requiredAnalytics), `Carrier analytics contract is missing: ${requiredAnalytics}`);

for (const prohibited of [
  "legal_company_name",
  "signer_name",
  "signer_email",
  "signer_phone",
  "mc_number",
  "usdot_number",
  "company_website",
  "service_percentage",
  "offer_code",
  "signature_jpeg",
  "typed_signature",
  "custom_scope",
]) assert.ok(!journey.includes(prohibited), `Carrier analytics component references prohibited form data: ${prohibited}`);

assert.ok(layout.includes('import CarrierContractJourney from "../components/CarrierContractJourney.astro"'));
assert.ok(layout.includes("<CarrierContractJourney />"));
assert.ok(logisticsLinks.includes('href="/carrier/"'));

for (const required of [
  "Step 1 of 3",
  "Agreed service percentage for Appendix A",
  "company_website",
  "No full street address required",
  "service_percentage",
  "offer_code",
  "data-signature-canvas",
  "Confirm the exact standard terms before signing",
  'const requestedPlan = currentUrl.searchParams.get("plan")',
  "window.history.replaceState",
]) assert.ok(onboarding.includes(required), `Minimized carrier signing form is missing: ${required}`);

for (const prohibited of ["business_address", "preferred_lanes", "equipment_types", "load_boards", "access_handoff_method"])
  assert.ok(!onboarding.includes(`name=\"${prohibited}\"`), `Pre-signature form still collects legacy field: ${prohibited}`);
for (const rawParameter of ["rate", "rep", "offer", "carrier_name", "mc", "usdot"])
  assert.ok(!onboarding.includes(`searchParams.get(\"${rawParameter}\")`), `Onboarding still trusts raw URL parameter: ${rawParameter}`);

for (const required of [
  'title="Carrier Agreement Terms | Hermes Logistics"',
  "HERMES-CARRIER-EXECUTION-V2026-08-06",
  "Percentage only in Appendix A",
  "No personal guaranty or UCC lien",
  "Five-business-day objection window",
  "ac35ae765617010dd7551b4a22537b32715923c49601d9aac1f21bbb5e0904a8",
  'data-contract-download="pdf"',
]) assert.ok(agreement.includes(required), `v3 agreement page is missing: ${required}`);

assert.notEqual(
  carrierPage.match(/<BaseLayout\s+[\s\S]*?title="([^"]+)"/)?.[1],
  agreement.match(/<BaseLayout\s+[\s\S]*?title="([^"]+)"/)?.[1],
  "Carrier entry and agreement terms pages must keep distinct, purpose-specific titles.",
);

for (const required of [
  "Dispatch Support",
  "Full Partnership",
  "Carrier Proposal",
  "The percentage is private and carrier-specific.",
  'data-primary-choice="agreement"',
  'data-primary-choice="learn"',
  "personal guaranty",
  "UCC lien",
  "The carrier confirms the exact commercial term in the private signing form",
]) assert.ok(offer.includes(required), `Carrier support page is missing: ${required}`);

const offerPercentages = new Set([...offer.matchAll(/>\s*(\d+(?:\.\d+)?)%\s*</g)].map((match) => match[1]));
assert.deepEqual(
  offerPercentages,
  new Set(["6", "8"]),
  "Offer page may publish only the two owner-approved standard tiers (6% Dispatch Support, 8% Full Partnership); every other percentage stays private to the carrier-specific Appendix A context.",
);
assert.doesNotMatch(offer, /searchParams\.(?:get|set)\(["'](?:rate|rep|offer)["']/i);
assert.doesNotMatch(offer, /[?&](?:rate|rep|offer)=/i);
assert.match(offer, /\?plan=essential/);
assert.match(offer, /\?plan=pro/);
assert.match(offer, /\?plan=custom/);

for (const required of [
  "https://hermeslogisticsus.com/sign/",
  "Continue to carrier packet",
  "No passwords, bank details, W-9, CDL image, VIN list, or shipment documents in this flow.",
  "Do not use fake deadlines, false scarcity, guaranteed income, guaranteed loads, hidden conditions, or threatening language.",
  "HERMES-CARRIER-EXECUTION-V2026-08-06",
  "CARRIER_CONTRACT_ALLOWED_PERCENTAGES",
  "opaque, signed, expiring",
]) assert.ok(playbook.includes(required), `Carrier sales handoff playbook is missing: ${required}`);

console.log("Carrier agreement journey v3 passed: clean SMS entry, plan-only same-origin context, trust-first review, three-step minimized packet, private Appendix A percentage, privacy-safe analytics, and execution gates are present.");
