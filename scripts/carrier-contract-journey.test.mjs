import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const [shortPage, journey, layout, logisticsLinks, playbook, analyticsDelta] = await Promise.all([
  read("src/pages/carrier/index.astro"),
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
  assert.ok(shortPage.includes(required), `Short carrier sales page is missing: ${required}`);
}

assert.doesNotMatch(shortPage, /guaranteed (?:load|rate|revenue|income)/i);
assert.doesNotMatch(shortPage, /limited time|expires today|only \d+ spots|act now/i);
assert.doesNotMatch(shortPage, /(?:carrier|driver)[_-]?(?:name|email|phone|mc|usdot)=/i);
assert.doesNotMatch(shortPage, /input[^>]+type=["']password/i);

for (const required of [
  '"/carrier/"',
  '"/logistics/carrier/"',
  '"/logistics/carrier-offer/"',
  '"/logistics/carrier-agreement/"',
  'primaryLabel: "Review plans and carrier packet"',
  'primaryHref: "/carrier/"',
  'primaryHref: "/logistics/carrier-onboarding/"',
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
]) {
  assert.ok(journey.includes(requiredAnalyticsContract), `Carrier analytics contract is missing: ${requiredAnalyticsContract}`);
}

for (const requiredRegistryBoundary of [
  "DATALAYER_PRESENT / GA4_UNVERIFIED",
  "DELIVERY_RECONCILIATION_REQUIRED",
  "steps 1–5 exactly once per page session",
  "GTM may add its own internal keys such as `gtm.uniqueEventId`",
  "review/onboarding packet as final executed agreement while #280 is open",
]) {
  assert.ok(analyticsDelta.includes(requiredRegistryBoundary), `Carrier analytics registry delta is missing: ${requiredRegistryBoundary}`);
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
  assert.ok(
    !journey.includes(prohibitedAnalyticsReference),
    `Carrier analytics component references prohibited form data: ${prohibitedAnalyticsReference}`,
  );
}

assert.doesNotMatch(analyticsDelta, /@[a-z0-9.-]+\.[a-z]{2,}/i, "Analytics registry delta must not contain an email address");
assert.doesNotMatch(analyticsDelta, /\b(?:MC|USDOT|DOT)\s*-?\s*\d{5,8}\b/i, "Analytics registry delta must not contain a carrier identifier");
assert.doesNotMatch(analyticsDelta, /\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4}/, "Analytics registry delta must not contain a phone number");

assert.ok(layout.includes('import CarrierContractJourney from "../components/CarrierContractJourney.astro"'));
assert.ok(layout.includes("<CarrierContractJourney />"));
assert.ok(logisticsLinks.includes('href="/carrier/"'));
assert.ok(logisticsLinks.includes("Carrier plans, packet, and agreement"));
assert.ok(logisticsLinks.includes("Carrier proposal and packet"));

for (const required of [
  "https://hermeslogisticsus.com/carrier/",
  "Start the carrier packet",
  "Review plans and support",
  "Review the agreement draft",
  "Do not use fake deadlines, false scarcity, guaranteed income, guaranteed loads, or hidden conditions.",
  "DRAFT-2026-08-05",
]) {
  assert.ok(playbook.includes(required), `Carrier sales handoff playbook is missing: ${required}`);
}

console.log("Carrier contract journey contract passed: short SMS URL, site entry, trust-first CTA hierarchy, carrier-audience handoff, privacy-safe funnel analytics, registry delta, and execution boundaries are present.");
