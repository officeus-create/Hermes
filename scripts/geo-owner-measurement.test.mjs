import assert from "node:assert/strict";
import {
  buildGeoOwnerMeasurement,
  buildGeoOwnerMeasurementLayer,
  findGeoOwnerMeasurement,
} from "../src/data/geo-owner-measurement.ts";

const asOf = "2026-08-18T12:00:00Z";
const carOwner = "/logistics/car-hauling-dispatch/";
const websiteOwner = "/services/website-development/";
const measurementOnlyOwner = "/measurement-only-owner/";

const observation = (overrides) => ({
  id: "OBS-BASE",
  promptId: "LOG-01",
  provider: "chatgpt",
  observedAt: "2026-08-17T12:00:00Z",
  reviewer: "Sanitized reviewer label",
  brandMentioned: true,
  linkedCitation: true,
  citedPath: carOwner,
  recommendation: "considered_option",
  entityAccuracy: "accurate",
  descriptionAccuracy: "accurate",
  factualError: false,
  competitors: [],
  correctiveAction: "",
  evidenceReference: "approved-note://geo/owner-measurement",
  ...overrides,
});

const input = {
  asOf,
  aiVisibilityEvidenceClass: "owner_provided_handoff",
  aiObservations: [
    observation({ id: "OBS-CAR", promptId: "LOG-01", citedPath: carOwner }),
    observation({ id: "OBS-WEB", promptId: "MKT-02", provider: "gemini", citedPath: websiteOwner }),
    observation({
      id: "OBS-CAR-SYNTHETIC",
      promptId: "LOG-01",
      provider: "perplexity",
      citedPath: carOwner,
      synthetic: true,
    }),
  ],
  search: [
    {
      windowDays: 7,
      source: "google",
      pagePath: carOwner,
      discoveryType: "non_branded",
      impressions: 100,
      clicks: 5,
      evidenceClass: "platform_verified",
    },
    {
      windowDays: 7,
      source: "google",
      pagePath: websiteOwner,
      discoveryType: "non_branded",
      impressions: 200,
      clicks: 8,
      evidenceClass: "platform_verified",
    },
    {
      windowDays: 7,
      source: "bing",
      pagePath: measurementOnlyOwner,
      discoveryType: "non_branded",
      impressions: 50,
      clicks: 1,
      evidenceClass: "owner_provided_handoff",
    },
  ],
  funnel: [
    {
      windowDays: 7,
      pagePath: carOwner,
      ctaClicks: 10,
      intakeStarts: 8,
      previewReady: 6,
      handoffReady: 4,
      deliveryConfirmed: 3,
      evidenceClass: "production_receiver_verified",
    },
    {
      windowDays: 7,
      pagePath: websiteOwner,
      ctaClicks: 7,
      intakeStarts: 5,
      previewReady: 4,
      handoffReady: 3,
      deliveryConfirmed: 2,
      evidenceClass: "owner_provided_handoff",
    },
  ],
  outcomes: [
    {
      windowDays: 7,
      pagePath: carOwner,
      reviewedInquiries: 3,
      qualifiedLeads: 2,
      opportunities: 1,
      wins: 1,
      losses: 0,
      revenueReconciledWins: 1,
      evidenceClass: "private_operations_verified",
    },
    {
      windowDays: 7,
      pagePath: websiteOwner,
      reviewedInquiries: 2,
      qualifiedLeads: 1,
      opportunities: 1,
      wins: 0,
      losses: 0,
      revenueReconciledWins: 0,
      evidenceClass: "owner_provided_handoff",
    },
    {
      windowDays: 7,
      pagePath: measurementOnlyOwner,
      reviewedInquiries: 1,
      qualifiedLeads: 1,
      opportunities: 0,
      wins: 0,
      losses: 0,
      revenueReconciledWins: 0,
      evidenceClass: "owner_provided_handoff",
    },
  ],
};

const sevenDayOwners = buildGeoOwnerMeasurement(input, 7);
const car = findGeoOwnerMeasurement(sevenDayOwners, carOwner);
const website = findGeoOwnerMeasurement(sevenDayOwners, websiteOwner);
const measurementOnly = findGeoOwnerMeasurement(sevenDayOwners, measurementOnlyOwner);

assert.ok(car.promptCoverage.promptIds.includes("LOG-01"));
assert.equal(car.scorecard.aiVisibility.observationsInWindow, 1, "synthetic observations must not inflate owner AI visibility");
assert.equal(car.scorecard.search.impressions, 100, "search evidence must remain scoped to the canonical owner");
assert.equal(car.scorecard.funnel.ctaClicks, 10, "funnel evidence must remain scoped to the canonical owner");
assert.equal(car.scorecard.leadQuality.qualifiedLeads, 2, "qualified outcomes must remain scoped to the canonical owner");
assert.equal(car.reconciliation.status, "complete");
assert.deepEqual(car.reconciliation.missingLayers, []);
assert.deepEqual(car.reconciliation.integrityGaps, []);

assert.ok(website.promptCoverage.promptIds.includes("MKT-02"));
assert.equal(website.scorecard.aiVisibility.observationsInWindow, 1);
assert.equal(website.scorecard.search.impressions, 200);
assert.equal(website.scorecard.funnel.ctaClicks, 7);
assert.equal(website.scorecard.leadQuality.qualifiedLeads, 1);
assert.equal(website.reconciliation.status, "complete");

assert.equal(measurementOnly.promptCoverage.promptCount, 0, "measurement-only owners must not receive invented AI prompts");
assert.equal(measurementOnly.scorecard.search.impressions, 50);
assert.equal(measurementOnly.scorecard.leadQuality.qualifiedLeads, 1);
assert.ok(measurementOnly.reconciliation.missingLayers.includes("ai_visibility"));
assert.ok(measurementOnly.reconciliation.missingLayers.includes("funnel"));
assert.ok(measurementOnly.reconciliation.integrityGaps.includes("outcome_without_delivery_evidence"));
assert.equal(measurementOnly.reconciliation.status, "inconsistent");

const untouchedPromptOwner = sevenDayOwners.find((item) => item.canonicalOwner === "/academy/us-logistics-operations/");
assert.ok(untouchedPromptOwner, "all governed prompt owners must remain visible even before measurement evidence arrives");
assert.equal(untouchedPromptOwner.reconciliation.status, "incomplete");
assert.ok(untouchedPromptOwner.reconciliation.missingLayers.includes("search"));

const layer = buildGeoOwnerMeasurementLayer(input);
assert.deepEqual(layer.map((item) => item.windowDays), [7, 28, 90]);
assert.equal(findGeoOwnerMeasurement(layer[1].owners, carOwner).scorecard.search.impressions, 0);

assert.throws(
  () => buildGeoOwnerMeasurement({
    ...input,
    aiObservations: [observation({ id: "OBS-UNKNOWN", promptId: "UNKNOWN-PROMPT" })],
  }, 7),
  /Unknown AI visibility prompt/,
  "unknown prompt IDs must never be silently assigned to an owner",
);

const privateKeys = JSON.stringify(sevenDayOwners).toLowerCase();
for (const prohibitedField of ["email", "phone", "mc", "usdot", "vin", "token", "cookie", "accountid"]) {
  assert.ok(!privateKeys.includes(`\"${prohibitedField}\"`), `owner scorecards must not add ${prohibitedField} fields`);
}

console.log("GEO canonical owner measurement reconciliation passed");
