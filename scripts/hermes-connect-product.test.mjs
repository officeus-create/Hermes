import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  categoryCatalog,
  createEarlyAccessRequest,
  getCategory,
} from "../public/demos/hermes-connect/profile-workspace.mjs";

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

const [appSource, pageSource, salesPackage] = await Promise.all([
  readFile(new URL("../public/demos/hermes-connect/app.mjs", import.meta.url), "utf8"),
  readFile(new URL("../public/demos/hermes-connect/index.html", import.meta.url), "utf8"),
  readFile(new URL("../docs/HERMES_CONNECT_SALES_TEST_PACKAGE.md", import.meta.url), "utf8"),
]);

assert.match(appSource, /categoryCatalog/, "The Web App must render from the controlled category catalog");
assert.match(appSource, /connect_category_selected/, "Category-selection analytics contract is missing");
assert.match(appSource, /public_dimensions/, "The access request must retain controlled public dimensions");
assert.match(pageSource, /data-category-grid/, "The Web App category grid is missing");
assert.match(pageSource, /data-category-select/, "The access form category select is missing");
assert.match(pageSource, /No client data needed for this request/, "The Web App privacy boundary is missing");
assert.match(pageSource, /does not automatically create an account, booking, payment, calendar event, or subscription/i, "The controlled-release boundary is missing");

for (const category of categoryCatalog) {
  assert.ok(salesPackage.includes(category.name), `Sales test package must include ${category.name}`);
}

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

console.log(`Hermes Connect product contract passed for ${categoryCatalog.length} categories.`);
