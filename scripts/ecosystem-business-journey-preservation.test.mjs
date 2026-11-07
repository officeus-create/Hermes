// Source-level release tripwire. This intentionally does NOT claim live signing,
// email delivery, browser behavior, permissions or visual parity are verified.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEFAULT_SCREENSHOT_ROUTES, SCREENSHOT_VIEWPORTS } from "./route-screenshot-contract.mjs";

const read = (relativePath) => readFile(new URL("../" + relativePath, import.meta.url), "utf8");
const journeys = [
  {
    id: "carrier-entry",
    source: "src/pages/carrier/index.astro",
    required: ["/logistics/carrier-onboarding/", "/logistics/carrier-offer/", "/logistics/carrier-agreement/", "data-commercial-primary-cta"],
  },
  {
    id: "shareable-signing",
    source: "src/pages/sign/index.astro",
    required: ["/logistics/carrier-onboarding/", "data-sign-short-url", "data-sign-sms", "data-commercial-primary-cta"],
  },
  {
    id: "commercial-plans",
    source: "src/pages/logistics/carrier-offer/index.astro",
    required: ["?plan=essential", "?plan=pro", "?plan=custom", 'data-primary-choice="agreement"'],
  },
  {
    id: "carrier-onboarding",
    source: "src/pages/logistics/carrier-onboarding/index.astro",
    required: ["selected_plan", "service_percentage", "/api/carrier-contract", "consent_document_review", "signature_jpeg"],
  },
  {
    id: "agreement-summary",
    source: "src/pages/logistics/carrier-agreement/index.astro",
    required: ["pdfReviewPath", "data-contract-esign", "data-agreement-version"],
  },
  {
    id: "agreement-pdf-viewer",
    source: "src/pages/contracts/carrier-agreement-v3/index.astro",
    required: ["data-download-pdf", 'type="application/pdf"', "data-pdf-asset", "pdfAssetPath"],
  },
  {
    id: "contract-api",
    source: "functions/api/carrier-contract.ts",
    required: ["CARRIER_CONTRACT_APPROVED_PDF_SHA256", "master_document_hash_mismatch", "signatureBytes", "delivery_ledger"],
  },
  {
    id: "load-board-public-intake",
    source: "src/pages/load-board.astro",
    required: ['id="carrier-access"', "data-load-board-form", "/logistics/request-vehicle-transport/", 'data-primary-entry="carrier"'],
  },
  {
    id: "load-board-account-access",
    source: "src/pages/services/hermes-connect/load-board/access/index.astro",
    required: ["data-auth-card", "data-register-form", "data-login-form"],
  },
  {
    id: "load-board-private-entitlements",
    source: "functions/api/load-board/carrier-workspace.ts",
    required: ["verified_carrier_access_required", "authorizedCarrier"],
  },
  {
    id: "business-lead-privacy",
    source: "src/components/BusinessLeadForm.astro",
    required: ["data-business-lead-form", 'name="consent"', "data-form-status"],
  },
  {
    id: "vehicle-transport-request",
    source: "src/pages/logistics/request-vehicle-transport/index.astro",
    required: ["VehicleTransportRequestEnhancer", "transport-intake"],
  },
  {
    id: "command-center-public-owner-boundary",
    source: "src/pages/services/hermes-connect/command-center/index.astro",
    required: ["HermesCommandCenterPublicContent"],
  },
];

for (const journey of journeys) {
  const source = await read(journey.source);
  for (const required of journey.required) {
    assert.ok(source.includes(required),
      `Ecosystem journey missing: ${journey.id} / ${journey.source} / ${required}. Check functional ownership before design merge.`);
  }
}

const snapshotRoutes = new Set(DEFAULT_SCREENSHOT_ROUTES.map(({ path }) => path));
const mustCapture = [
  "/", "/paths/logistics/", "/paths/marketing/", "/paths/academy/", "/paths/technology/",
  "/carrier/", "/sign/", "/logistics/carrier-offer/", "/logistics/carrier-agreement/",
  "/contracts/carrier-agreement-v3/", "/logistics/carrier-onboarding/",
  "/load-board/", "/services/hermes-connect/load-board/access/",
  "/logistics/request-vehicle-transport/", "/businesses/",
  "/services/hermes-connect/", "/services/hermes-connect/repair-shops/",
  "/contacts/", "/company-information/", "/terms/", "/opportunities/",
  "/academy/countries/philippines/", "/insights/", "/insights/marketing/organic-social-before-paid-ads-meta-learning/",
  "/gb/london/website-development/", "/services/seo-for-independent-auto-dealers/",
  "/logistics/car-hauler-loads/tacoma-wa/", "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
];
for (const path of mustCapture) {
  assert.ok(snapshotRoutes.has(path), `Missing critical screenshot route: ${path}`);
}
assert.deepEqual(SCREENSHOT_VIEWPORTS.map(({ width }) => width), [1440, 1024, 768, 430, 390],
  "Keep the desktop/tablet/mobile visual evidence matrix intact");
for (const guard of ["scripts/internal-link-audit.test.mjs", "scripts/hreflang-audit.test.mjs",
  "docs/DESIGN_INTEGRATION_CONTRACT.md"]) await read(guard);

console.log(`Ecosystem source preservation: ${journeys.length} journey contracts, ${mustCapture.length} critical screenshot routes, 5 viewports OK. Production and interactive E2E still require independent evidence.`);
