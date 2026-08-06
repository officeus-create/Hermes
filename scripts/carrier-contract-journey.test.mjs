import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [shortPage, signPage, journey, layout, logisticsLinks, playbook, analyticsDelta] = await Promise.all([
  read("src/pages/carrier/index.astro"),
  read("src/pages/sign/index.astro"),
  read("src/components/CarrierContractJourney.astro"),
  read("src/layouts/BaseLayout.astro"),
  read("src/components/LogisticsCommercialLinks.astro"),
  read("docs/CARRIER_SALES_HANDOFF_PLAYBOOK.md"),
  read("docs/analytics-registry-deltas/2026-08-06-carrier-contract.md"),
]);

for (const required of [
  'robots="noindex,nofollow"',
  'const shortUrl = "https://hermeslogisticsus.com/carrier/"',
  'href={onboardingPath}',
  'href={offerPath}',
  'href={agreementPath}',
  'href={`tel:${salesPhone}`}',
  "Start the carrier packet",
  "Review plans and support",
  "Review the agreement draft",
  "You approve every load",
  "Freight payments go to your company",
  "No passwords collected here",
  "Final legal execution activates only",
  "data-carrier-share",
  "data-carrier-copy",
  "data-carrier-sms",
]) {
  assert.ok(shortPage.includes(required), `Carrier proposal page is missing: ${required}`);
}

for (const required of [
  'robots="noindex,nofollow"',
  'const shortUrl = "https://hermeslogisticsus.com/sign/"',
  "Everything is clear before you sign.",
  "No exclusivity required here",
  "You approve every load",
  "Freight payments stay with your company",
  "Continue to carrier packet",
  "Review the agreement first",
  "Ask a question",
  "data-sign-copy",
  "data-sign-sms",
]) {
  assert.ok(signPage.includes(required), `Short signing page is missing: ${required}`);
}

for (const source of [shortPage, signPage]) {
  assert.doesNotMatch(source, /guaranteed (?:load|rate|revenue|income)/i);
  assert.doesNotMatch(source, /limited time|expires today|only \d+ spots|act now/i);
  assert.doesNotMatch(source, /(?:carrier|driver)[_-]?(?:name|email|phone|mc|usdot)=/i);
  assert.doesNotMatch(source, /input[^>]+type=["']password/i);
}

for (const required of [
  '"/carrier/"',
  '"/sign/"',
  '"/logistics/carrier/"',
  '"/logistics/carrier-offer/"',
  '"/logistics/carrier-agreement/"',
  'primaryLabel: "Review the signing path"',
  'primaryHref: "/sign/"',
  'primaryHref: "/logistics/carrier-onboarding/"',
  'const shortUrl = "https://hermeslogisticsus.com/sign/"',
  "Copy link",
  "data-carrier-journey-sms",
  "tel:+12623023626",
]) {
  assert.ok(journey.includes(required), `Carrier journey component is missing: ${required}`);
}

const carrierAnalyticsEvents = [
  "commercial_cta_click",
  "carrier_contract_share",
  "carrier_contract_document_action",
  "carrier_contract_intake_start",
  "carrier_contract_step_reached",
  "carrier_contract_packet_result",
];

for (const eventName of carrierAnalyticsEvents) {
  assert.ok(journey.includes(`event: "${eventName}"`), `Carrier analytics implementation is missing: ${eventName}`);
  assert.ok(analyticsDelta.includes(`\`${eventName}\``), `Carrier analytics registry delta is missing: ${eventName}`);
}

for (const requiredAnalyticsContract of [
  'service_group: "carrier_contract"',
  'carrierEventBase("carrier_contract_onboarding")',
  "stepNumber",
  'preview_status: previewStatus',
  '"delivered"',
  '"pending"',
  '"failed"',
  '"carrier_signing_entry"',
]) {
  assert.ok(journey.includes(requiredAnalyticsContract), `Carrier analytics contract is missing: ${requiredAnalyticsContract}`);
}

for (const prohibitedAnalyticsReference of [
  "legal_company_name",
  "signer_name",
  "signer_email",
  "signer_phone",
  "mc_number",
  "usdot_number",
  "preferred_lanes",
  "equipment_types",
  "signature_jpeg",
  "typed_signature",
  "custom_percentage",
  "custom_scope",
]) {
  assert.ok(!journey.includes(prohibitedAnalyticsReference), `Carrier analytics component references prohibited form data: ${prohibitedAnalyticsReference}`);
}

assert.ok(layout.includes('import CarrierContractJourney from "../components/CarrierContractJourney.astro"'));
assert.ok(layout.includes("<CarrierContractJourney />"));
assert.ok(logisticsLinks.includes('href="/carrier/"'));
assert.ok(logisticsLinks.includes("Carrier plans, packet, and agreement"));

for (const required of [
  "https://hermeslogisticsus.com/carrier/",
  "https://hermeslogisticsus.com/sign/",
  "Start the carrier packet",
  "Review plans and support",
  "Review the agreement draft",
  "Do not use fake deadlines, false scarcity, guaranteed income, guaranteed loads, or hidden conditions.",
  "DRAFT-2026-08-05",
]) {
  assert.ok(playbook.includes(required), `Carrier sales handoff playbook is missing: ${required}`);
}

console.log("Carrier contract journey passed: proposal entry, short signing URL, trust-first CTA hierarchy, privacy-safe SMS handoff, analytics, and execution boundaries are present.");
