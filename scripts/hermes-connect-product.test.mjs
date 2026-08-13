import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  categoryCatalog,
  createEarlyAccessRequest,
  getCategory,
} from "../public/demos/hermes-connect/profile-workspace.mjs";
import {
  calculateTripEconomics,
  validateTripInputs,
} from "../public/demos/hermes-connect/load-analyzer/trip-economics.mjs";

const requiredCategoryIds = [
  "beauty-wellness",
  "fitness-coaching",
  "professional-services",
  "logistics-field",
  "auto-service-repair",
  "truck-car-hauler-repair",
  "heavy-equipment-service",
  "oversize-specialty-equipment",
  "education-events",
  "home-local",
];

assert.equal(categoryCatalog.length, requiredCategoryIds.length, "Hermes Connect must expose the approved ten-category catalog");
assert.deepEqual(
  categoryCatalog.map((category) => category.id),
  requiredCategoryIds,
  "Hermes Connect category order or IDs changed unexpectedly",
);
assert.equal(new Set(categoryCatalog.map((category) => category.id)).size, categoryCatalog.length, "Category IDs must be unique");
assert.equal(new Set(categoryCatalog.map((category) => category.name)).size, categoryCatalog.length, "Category names must be unique");

for (const category of categoryCatalog) {
  assert.equal(getCategory(category.id), category, `getCategory must resolve ${category.id}`);
  assert.match(category.id, /^[a-z0-9-]+$/, `Category ID must be analytics-safe: ${category.id}`);
  assert.ok(category.name.length >= 4, `Category name is incomplete: ${category.id}`);
  assert.ok(category.label.length >= 8, `Category label is incomplete: ${category.id}`);
  assert.ok(category.headline.length >= 30, `Category headline is incomplete: ${category.id}`);
  assert.ok(category.previewName.length >= 4, `Preview business name is incomplete: ${category.id}`);
  assert.ok(category.previewRole.length >= 10, `Preview role is incomplete: ${category.id}`);
  assert.equal(category.previewServices.length, 3, `Each category must provide exactly three preview services: ${category.id}`);
  assert.equal(new Set(category.previewServices).size, 3, `Preview services must be unique: ${category.id}`);
  assert.match(category.accent, /^#[0-9a-f]{6}$/i, `Accent must be a six-digit hex value: ${category.id}`);
  assert.match(category.icon, /^[A-Z]{2}$/, `Category icon must be a two-letter code: ${category.id}`);

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
  assert.deepEqual(
    Object.keys(request.public_dimensions).sort(),
    ["category_id", "platform_id"],
    "Public analytics dimensions must remain allowlisted and free of submitted values",
  );
  assert.match(request.message, new RegExp(`Category: ${category.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.equal(request.source_path, "/hermes-connect/web-access/");
}

for (const invalidId of ["", "other", "auto-repair<script>", "heavy equipment"]) {
  assert.equal(getCategory(invalidId), null, `Unknown category must not resolve: ${invalidId}`);
}

const canonicalRpmInputs = {
  loadedMiles: 500,
  deadheadMiles: 75,
  grossPay: 1500,
  fuelPrice: 4,
  mpg: 7.5,
  reservePerMile: 0.25,
  fixedCosts: 75,
  servicePercent: 8,
  paymentFeePercent: 0,
  targetNet: 500,
};
const canonicalRpmResult = calculateTripEconomics(canonicalRpmInputs);
assert.equal(canonicalRpmResult.grossLoadedRpm.toFixed(2), "3.00", "Load Analyzer loaded RPM must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.allMileRpm.toFixed(2), "2.61", "Load Analyzer all-mile RPM must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.fuelCost.toFixed(2), "306.67", "Load Analyzer fuel cost must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.reserveCost.toFixed(2), "143.75", "Load Analyzer reserve must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.serviceFee.toFixed(2), "120.00", "Load Analyzer service fee must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.operatingCost.toFixed(2), "645.42", "Load Analyzer operating cost must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.estimatedNet.toFixed(2), "854.58", "Load Analyzer estimated net must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.breakEvenGross.toFixed(2), "571.11", "Load Analyzer break-even gross must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.breakEvenLoadedRpm.toFixed(2), "1.14", "Load Analyzer loaded break-even RPM must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.breakEvenAllMileRpm.toFixed(2), "0.99", "Load Analyzer all-mile break-even RPM must match the public RPM calculator contract");
assert.equal(canonicalRpmResult.recommendation, "GOOD", "The default result must meet its explicit user-entered target");
assert.equal(
  calculateTripEconomics({ ...canonicalRpmInputs, targetNet: 900 }).recommendation,
  "BORDERLINE",
  "Positive net below the user target must be BORDERLINE",
);
assert.equal(
  calculateTripEconomics({ ...canonicalRpmInputs, grossPay: 400 }).recommendation,
  "BAD",
  "Negative estimated net must be BAD",
);
assert.equal(
  calculateTripEconomics({ ...canonicalRpmInputs, paymentFeePercent: 2 }).paymentFee.toFixed(2),
  "30.00",
  "Optional payment/factoring fee must use only the user's entered percentage",
);
assert.equal(
  validateTripInputs({ ...canonicalRpmInputs, servicePercent: 70, paymentFeePercent: 30 }).valid,
  false,
  "Combined percentage fees at or above 100% must be rejected",
);

const [appSource, pageSource, serviceOverviewSource, salesPackage, loadAnalyzerPage, loadAnalyzerApp] = await Promise.all([
  readFile(new URL("../public/demos/hermes-connect/app.mjs", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/HERMES_CONNECT_SALES_TEST_PACKAGE.md", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/load-analyzer/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/load-analyzer/app.mjs", import.meta.url), "utf8"),
]);

assert.match(appSource, /categoryCatalog/, "The Web App must render from the controlled category catalog");
assert.match(appSource, /connect_category_selected/, "Category-selection analytics contract is missing");
assert.match(appSource, /public_dimensions/, "The access request must retain controlled public dimensions");
assert.match(pageSource, /data-category-grid/, "The Web App category grid is missing");
assert.match(pageSource, /data-category-select/, "The access form category select is missing");
assert.match(pageSource, /No client data needed for this request/, "The Web App privacy boundary is missing");
assert.match(pageSource, /does not automatically create an account, booking, payment, calendar event, or subscription/i, "The controlled-release boundary is missing");

assert.match(loadAnalyzerPage, /<meta name="robots" content="noindex,nofollow">/, "Load Analyzer must remain noindex during the controlled MVP");
assert.match(loadAnalyzerPage, /data-load-analyzer-form/, "Load Analyzer form is missing");
assert.match(loadAnalyzerPage, /GOOD \/ BORDERLINE \/ BAD uses your own target net/i, "Load Analyzer must explain its recommendation boundary");
assert.match(loadAnalyzerPage, /No live load-board API is connected/i, "Load Analyzer must not imply a live load-board integration");
assert.match(loadAnalyzerPage, /No form submission or server request occurs/i, "Load Analyzer local-only boundary is missing");
assert.match(loadAnalyzerApp, /load_analyzer_start/, "Load Analyzer start analytics contract is missing");
assert.match(loadAnalyzerApp, /load_analyzer_complete/, "Load Analyzer completion analytics contract is missing");
assert.match(loadAnalyzerApp, /load_analyzer_compare/, "Load Analyzer comparison analytics contract is missing");
assert.match(loadAnalyzerApp, /load_analyzer_handoff/, "Load Analyzer handoff analytics contract is missing");
assert.doesNotMatch(loadAnalyzerApp, /\bfetch\s*\(/, "Load Analyzer must not transmit trip inputs over the network");

for (const category of categoryCatalog) {
  assert.ok(salesPackage.includes(category.name), `Sales test package must include ${category.name}`);
  assert.ok(serviceOverviewSource.includes(category.name), `Public Hermes Connect overview must include ${category.name}`);
}

assert.match(
  serviceOverviewSource,
  /auto service and repair, truck and car-hauler repair, heavy equipment service, oversize and specialty equipment/i,
  "The public FAQ must describe the automotive and equipment category expansion",
);

for (const requiredText of [
  "https://connect.hermeslogisticsus.com/",
  "Desktop and mobile checklist",
  "Synthetic test data",
  "Pass/fail scorecard",
  "Do not use preview-deployment URLs with prospects",
  "No integration is assumed",
]) {
  assert.ok(salesPackage.includes(requiredText), `Sales test package is missing: ${requiredText}`);
}

console.log(`Hermes Connect product contract passed for ${categoryCatalog.length} categories plus Load Analyzer MVP.`);
