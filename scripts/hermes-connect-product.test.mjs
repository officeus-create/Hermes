import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { categoryCatalog, createEarlyAccessRequest, getCategory } from "../public/demos/hermes-connect/profile-workspace.mjs";
import { calculateTripEconomics, validateTripInputs } from "../public/demos/hermes-connect/load-analyzer/trip-economics.mjs";

// Preserved category and calculator assets remain valid reference/demo inputs.
const requiredCategoryIds = [
  "beauty-wellness", "fitness-coaching", "professional-services", "logistics-field",
  "auto-service-repair", "truck-car-hauler-repair", "heavy-equipment-service",
  "oversize-specialty-equipment", "education-events", "home-local",
];
assert.deepEqual(categoryCatalog.map((category) => category.id), requiredCategoryIds);
assert.equal(new Set(categoryCatalog.map((category) => category.id)).size, categoryCatalog.length);

for (const category of categoryCatalog) {
  assert.equal(getCategory(category.id), category);
  assert.equal(category.previewServices.length, 3);
  const request = createEarlyAccessRequest({
    name: "Hermes Connect Test",
    email: "connect-test@example.com",
    businessName: "TEST Category Review",
    categoryId: category.id,
    role: "Sales QA",
    teamSize: "2–5 people",
    currentMethod: "Website form",
    mustHave: "TEST ONLY: client chooses a service and sends a structured request.",
    consent: true,
  });
  assert.equal(request.public_dimensions.category_id, category.id);
  assert.equal(request.public_dimensions.platform_id, "web");
  assert.deepEqual(Object.keys(request.public_dimensions).sort(), ["category_id", "platform_id"]);
}

const canonicalRpmInputs = {
  loadedMiles: 500, deadheadMiles: 75, grossPay: 1500, fuelPrice: 4, mpg: 7.5,
  reservePerMile: 0.25, fixedCosts: 75, servicePercent: 8, paymentFeePercent: 0, targetNet: 500,
};
const result = calculateTripEconomics(canonicalRpmInputs);
assert.equal(result.grossLoadedRpm.toFixed(2), "3.00");
assert.equal(result.allMileRpm.toFixed(2), "2.61");
assert.equal(result.fuelCost.toFixed(2), "306.67");
assert.equal(result.estimatedNet.toFixed(2), "854.58");
assert.equal(result.recommendation, "GOOD");
assert.equal(calculateTripEconomics({ ...canonicalRpmInputs, targetNet: 900 }).recommendation, "BORDERLINE");
assert.equal(calculateTripEconomics({ ...canonicalRpmInputs, grossPay: 400 }).recommendation, "BAD");
assert.equal(validateTripInputs({ ...canonicalRpmInputs, servicePercent: 70, paymentFeePercent: 30 }).valid, false);

const [appSource, legacyPageSource, hubSource, loadAnalyzerPage, loadAnalyzerApp, capabilityPage] = await Promise.all([
  readFile(new URL("../public/demos/hermes-connect/app.mjs", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/load-analyzer/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/load-analyzer/app.mjs", import.meta.url), "utf8"),
  readFile(new URL("../src/components/HermesConnectCapabilityPage.astro", import.meta.url), "utf8"),
]);

// Preserved demos keep explicit no-side-effect boundaries.
assert.match(appSource, /categoryCatalog/);
assert.match(appSource, /public_dimensions/);
assert.match(legacyPageSource, /No client data needed for this request/);
assert.match(legacyPageSource, /does not automatically create an account, booking, payment, calendar event, or subscription/i);
assert.match(loadAnalyzerPage, /<meta name="robots" content="noindex,nofollow">/);
assert.match(loadAnalyzerPage, /No live load-board API is connected/i);
assert.match(loadAnalyzerPage, /No form submission or server request occurs/i);
assert.match(loadAnalyzerApp, /load_analyzer_start/);
assert.match(loadAnalyzerApp, /load_analyzer_complete/);
assert.doesNotMatch(loadAnalyzerApp, /\bfetch\s*\(/);

// The canonical public product family is one adaptive operating system with one verified public live vertical.
assert.match(hubSource, /Run your business/);
assert.match(hubSource, /with AI\./);
assert.match(hubSource, /One system\. Different business realities\./);
assert.match(hubSource, /Repair Shops/);
assert.match(hubSource, /LIVE PRODUCT/);
assert.match(hubSource, /PREVIEW CONFIGURATION/);
assert.match(hubSource, /WORKSPACE PREVIEW · SAMPLE DATA/);
assert.match(hubSource, /Configuration preview · not a released vertical/);
assert.match(hubSource, /One product family/);
assert.match(hubSource, /PRIVATE LEARNER WORKSPACE/);
assert.match(hubSource, /\/services\/hermes-connect\/academy\//);
assert.match(hubSource, /Beauty & Wellness/);
assert.match(hubSource, /PRIVATE OWNER FOUNDATION/);
assert.match(hubSource, /Owner-scoped salon profile, team, and shared services are available in a private Hermes workspace/);
assert.match(hubSource, /modules: \["Profile", "Team", "Services"\]/);
assert.match(hubSource, /\/services\/hermes-connect\/beauty\/workspace\//);
assert.match(hubSource, /Appointments, CRM, payments, revenue, inventory, payroll, and autonomous outreach remain deferred/);
assert.doesNotMatch(hubSource, /Other industries are previews/);
assert.doesNotMatch(hubSource, /Appointments, clients, services, specialists, repeat visits, reviews, and relationship management/);
assert.doesNotMatch(hubSource, /connect\.hermeslogisticsus\.com\/workspace/);
assert.doesNotMatch(hubSource, /\$99|\$299|\$799/);
assert.match(capabilityPage, /Reference capability · not current live pilot/);
assert.match(capabilityPage, /Open current Repair Shop product/);

console.log(`Hermes Connect product contract passed: ${categoryCatalog.length} preserved reference categories, adaptive vertical OS presentation, private Academy and Beauty entries with bounded scope, Load Analyzer demo boundary, and one canonical Repair Shop public live product.`);
