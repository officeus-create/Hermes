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
  'robots="noindex,nofollow"',
  'const shortUrl = "https://hermeslogisticsus.com/carrier/"',
  "Keep control. Add a dispatch team.",
  "You approve every load",
  "Non-exclusive · no minimum volume",
  "Freight funds go to your company or factor",
  "No passwords, W-9, bank data, or CDL image here",
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
  assert.doesNotMatch(source, /guaranteed (?:load|rate|revenue|income)/i);
  assert.doesNotMatch(source, /limited time|expires today|only \d+ spots|act now/i);
  assert.doesNotMatch(source, /input[^>]+type=["']password/i);
}

assert.doesNotMatch(signPage, /(?:carrier|driver)[_-]?(?:name|email|phone|mc|usdot)=/i);
assert.doesNotMatch(signPage, /[?&](?:rate|plan|rep|offer)=/i);

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
  "Review mode is not final legal activation",
]) assert.ok(onboarding.includes(required), `Minimized carrier signing form is missing: ${required}`);

for (const prohibited of ["business_address", "preferred_lanes", "equipment_types", "load_boards", "access_handoff_method"])
  assert.ok(!onboarding.includes(`name=\"${prohibited}\"`), `Pre-signature form still collects legacy field: ${prohibited}`);

for (const required of [
  "ATTORNEY-REVIEW-V3-2026-08-06",
  "Percentage only in Appendix A",
  "No personal guaranty or UCC lien",
  "Five-business-day objection window",
  "9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb",
  'data-contract-download="pdf"',
]) assert.ok(agreement.includes(required), `v3 agreement page is missing: ${required}`);

for (const required of [
  "Dispatch Support",
  "Operations + Growth",
  "Custom Cooperation",
  "The percentage is private and carrier-specific.",
  'data-primary-choice="agreement"',
  'data-primary-choice="learn"',
  "No personal guaranty or UCC lien",
]) assert.ok(offer.includes(required), `Carrier support page is missing: ${required}`);

assert.doesNotMatch(offer, />\s*(?:5|6|8)(?:\.00)?%\s*</i, "Offer page must not publish a fixed percentage outside the carrier-specific Appendix A context.");

for (const required of [
  "https://hermeslogisticsus.com/sign/",
  "Continue to carrier packet",
  "No passwords, bank details, W-9, CDL image, VIN list, or shipment documents in this flow.",
  "Do not use fake deadlines, false scarcity, guaranteed income, guaranteed loads, hidden conditions, or threatening language.",
  "ATTORNEY-REVIEW-V3-2026-08-06",
  "CARRIER_CONTRACT_ALLOWED_PERCENTAGES",
  "opaque, signed, expiring",
]) assert.ok(playbook.includes(required), `Carrier sales handoff playbook is missing: ${required}`);

console.log("Carrier agreement journey v3 passed: clean SMS entry, trust-first review, three-step minimized packet, private Appendix A percentage, privacy-safe analytics, and execution gates are present.");