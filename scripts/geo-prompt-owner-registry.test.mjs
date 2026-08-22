import assert from "node:assert/strict";
import {
  findGeoOwnerForPrompt,
  geoPromptCoverageSummary,
  geoPromptOwnerRegistry,
} from "../src/data/geo-prompt-owner-registry.ts";

const summary = geoPromptCoverageSummary();
assert.equal(summary.totalPrompts, 48);
assert.ok(summary.canonicalOwners > 0 && summary.canonicalOwners < 48);
assert.equal(summary.weeklyPrompts + summary.monthlyPrompts, 48);

assert.equal(
  geoPromptOwnerRegistry.reduce((total, owner) => total + owner.promptCount, 0),
  48,
  "Every AI prompt must resolve to exactly one canonical owner",
);

const allPromptIds = geoPromptOwnerRegistry.flatMap((owner) => owner.promptIds);
assert.equal(new Set(allPromptIds).size, 48, "Prompt IDs must not be duplicated across canonical owners");
assert.ok(geoPromptOwnerRegistry.every((owner) => owner.canonicalOwner.startsWith("/")));
assert.ok(geoPromptOwnerRegistry.every((owner) => owner.expectedFacts.length > 0));
assert.ok(geoPromptOwnerRegistry.every((owner) => owner.prohibitedClaims.length > 0));

const logisticsEducationOwner = findGeoOwnerForPrompt("LOG-10");
assert.equal(logisticsEducationOwner.canonicalOwner, "/academy/us-logistics-operations/");
assert.ok(logisticsEducationOwner.promptIds.includes("ACA-01"));
assert.equal(logisticsEducationOwner.multiDirection, true);
assert.equal(logisticsEducationOwner.multiLanguage, true);
assert.equal(logisticsEducationOwner.multiIntent, true);

const technologyOwner = findGeoOwnerForPrompt("TEC-01");
assert.equal(technologyOwner.canonicalOwner, "/paths/technology/");
assert.equal(technologyOwner.multiIntent, true);

assert.throws(() => findGeoOwnerForPrompt("UNKNOWN-999"), /Unknown AI visibility prompt/);

console.log("GEO prompt owner registry passed");