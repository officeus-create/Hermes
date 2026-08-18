import assert from "node:assert/strict";
import {
  buildGeoMeasurementLayer,
  buildGeoMeasurementScorecard,
  filterRealAiObservationsForWindow,
  geoMeasurementWindows,
  validateGeoMeasurementInput,
} from "../src/data/geo-measurement-layer.ts";

const asOf = "2026-08-18T12:00:00Z";

const aiObservations = [
  {
    id: "OBS-REAL-7D",
    promptId: "LOG-01",
    provider: "chatgpt",
    observedAt: "2026-08-17T12:00:00Z",
    reviewer: "Sanitized reviewer label",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/logistics/car-hauling-dispatch/",
    recommendation: "considered_option",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: [],
    correctiveAction: "",
    evidenceReference: "approved-note://geo/real-7d",
  },
  {
    id: "OBS-REAL-28D",
    promptId: "MKT-01",
    provider: "gemini",
    observedAt: "2026-08-01T12:00:00Z",
    reviewer: "Sanitized reviewer label",
    brandMentioned: true,
    linkedCitation: false,
    citedPath: "",
    recommendation: "source_only",
    entityAccuracy: "partially_accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: ["Reviewed competitor label"],
    correctiveAction: "Review entity description.",
    evidenceReference: "approved-note://geo/real-28d",
  },
  {
    id: "OBS-SYNTHETIC",
    promptId: "LOG-01",
    provider: "perplexity",
    observedAt: "2026-08-18T11:00:00Z",
    reviewer: "Synthetic QA fixture",
    brandMentioned: true,
    linkedCitation: true,
    citedPath: "/",
    recommendation: "explicit_recommendation",
    entityAccuracy: "accurate",
    descriptionAccuracy: "accurate",
    factualError: false,
    competitors: [],
    correctiveAction: "",
    evidenceReference: "synthetic://geo/test",
    synthetic: true,
  },
];

const input = {
  asOf,
  aiObservations,
  aiVisibilityEvidenceClass: "owner_provided_handoff",
  search: [
    {
      windowDays: 7,
      source: "google",
      pagePath: "/services/seo-for-logistics-companies/",
      discoveryType: "non_branded",
      impressions: 120,
      clicks: 6,
      evidenceClass: "platform_verified",
    },
    {
      windowDays: 7,
      source: "google",
      pagePath: "/",
      discoveryType: "branded",
      impressions: 30,
      clicks: 9,
      evidenceClass: "platform_verified",
    },
    {
      windowDays: 28,
      source: "bing",
      pagePath: "/services/website-development/",
      discoveryType: "non_branded",
      impressions: 200,
      clicks: 10,
      evidenceClass: "owner_provided_handoff",
    },
  ],
  funnel: [
    {
      windowDays: 7,
      pagePath: "/services/seo-for-logistics-companies/",
      ctaClicks: 20,
      intakeStarts: 10,
      previewReady: 8,
      handoffReady: 6,
      deliveryConfirmed: 3,
      evidenceClass: "platform_verified",
    },
  ],
  outcomes: [
    {
      windowDays: 7,
      pagePath: "/services/seo-for-logistics-companies/",
      reviewedInquiries: 3,
      qualifiedLeads: 2,
      opportunities: 1,
      wins: 1,
      losses: 0,
      revenueReconciledWins: 1,
      evidenceClass: "private_operations_verified",
    },
  ],
};

assert.deepEqual(geoMeasurementWindows, [7, 28, 90]);
assert.doesNotThrow(() => validateGeoMeasurementInput(input));

const sevenDayAi = filterRealAiObservationsForWindow(aiObservations, 7, asOf);
assert.equal(sevenDayAi.length, 1, "7-day AI window must exclude older and synthetic observations");
assert.equal(sevenDayAi[0].id, "OBS-REAL-7D");

const twentyEightDayAi = filterRealAiObservationsForWindow(aiObservations, 28, asOf);
assert.equal(twentyEightDayAi.length, 2, "28-day AI window must include both real observations and exclude synthetic QA");

const sevenDay = buildGeoMeasurementScorecard(input, 7);
assert.equal(sevenDay.aiVisibility.observationsInWindow, 1);
assert.equal(sevenDay.aiVisibility.mentionRate, 100);
assert.equal(sevenDay.aiVisibility.citationRate, 100);
assert.equal(sevenDay.search.impressions, 150);
assert.equal(sevenDay.search.clicks, 15);
assert.equal(sevenDay.search.ctr, 10);
assert.equal(sevenDay.search.brandedCtr, 30);
assert.equal(sevenDay.search.nonBrandedCtr, 5);
assert.equal(sevenDay.funnel.ctaToIntakeRate, 50);
assert.equal(sevenDay.funnel.intakeToPreviewRate, 80);
assert.equal(sevenDay.funnel.previewToHandoffRate, 75);
assert.equal(sevenDay.funnel.handoffToDeliveryRate, 50);
assert.equal(sevenDay.leadQuality.reviewToQualifiedRate, 66.7);
assert.equal(sevenDay.leadQuality.qualifiedToOpportunityRate, 50);
assert.equal(sevenDay.leadQuality.opportunityToWinRate, 100);
assert.equal(sevenDay.leadQuality.deliveryToQualifiedRate, 66.7);
assert.deepEqual(sevenDay.evidence.aiVisibility, ["owner_provided_handoff"]);
assert.deepEqual(sevenDay.evidence.search, ["platform_verified"]);
assert.deepEqual(sevenDay.evidence.outcomes, ["private_operations_verified"]);
assert.deepEqual(sevenDay.gaps, []);

const twentyEightDay = buildGeoMeasurementScorecard(input, 28);
assert.equal(twentyEightDay.aiVisibility.observationsInWindow, 2);
assert.equal(twentyEightDay.search.impressions, 200);
assert.equal(twentyEightDay.search.nonBrandedImpressions, 200);
assert.ok(twentyEightDay.gaps.includes("funnel_receipt_missing"));
assert.ok(twentyEightDay.gaps.includes("qualified_outcome_reconciliation_missing"));

const ninetyDay = buildGeoMeasurementScorecard(input, 90);
assert.equal(ninetyDay.search.impressions, 0);
assert.equal(ninetyDay.funnel.ctaClicks, 0);
assert.equal(ninetyDay.leadQuality.qualifiedLeads, 0);
assert.ok(ninetyDay.gaps.includes("search_baseline_missing"));
assert.ok(ninetyDay.gaps.includes("funnel_receipt_missing"));
assert.ok(ninetyDay.gaps.includes("qualified_outcome_reconciliation_missing"));

const layer = buildGeoMeasurementLayer(input);
assert.deepEqual(layer.map((item) => item.windowDays), [7, 28, 90]);

assert.throws(
  () => validateGeoMeasurementInput({
    ...input,
    search: [{ ...input.search[0], clicks: 121 }],
  }),
  /cannot exceed/,
);

assert.throws(
  () => validateGeoMeasurementInput({
    ...input,
    outcomes: [{ ...input.outcomes[0], opportunities: 3 }],
  }),
  /cannot exceed/,
);

const sourceText = JSON.stringify({
  search: input.search,
  funnel: input.funnel,
  outcomes: input.outcomes,
}).toLowerCase();
for (const prohibitedField of [
  "email",
  "phone",
  "name",
  "company",
  "mc",
  "usdot",
  "vin",
  "route",
  "budget",
  "message",
  "token",
  "cookie",
  "accountid",
  "streamid",
]) {
  assert.ok(!sourceText.includes(`\"${prohibitedField}\"`), `GEO aggregate fixtures must not contain ${prohibitedField} fields`);
}

console.log("GEO measurement layer contract passed");
