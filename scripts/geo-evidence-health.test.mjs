import assert from "node:assert/strict";
import {
  buildGeoEvidenceFreshnessRecords,
  buildGeoOwnerCoverageSummary,
  buildGeoOwnerReadiness,
  classifyGeoEvidenceFreshness,
  summarizeGeoEvidenceProvenance,
} from "../src/data/geo-evidence-health.ts";

const asOf = "2026-08-18T12:00:00.000Z";

assert.deepEqual(
  classifyGeoEvidenceFreshness("platform_verified", "2026-08-17T12:00:00Z", asOf),
  { freshness: "fresh", ageDays: 1 },
);
assert.deepEqual(
  classifyGeoEvidenceFreshness("platform_verified", "2026-08-08T12:00:00Z", asOf),
  { freshness: "aging", ageDays: 10 },
);
assert.deepEqual(
  classifyGeoEvidenceFreshness("platform_verified", "2026-07-01T12:00:00Z", asOf),
  { freshness: "stale", ageDays: 48 },
);
assert.deepEqual(classifyGeoEvidenceFreshness("production_verified", undefined, asOf), { freshness: "undated" });
assert.deepEqual(classifyGeoEvidenceFreshness("unverified", "2026-08-18T11:00:00Z", asOf), { freshness: "unverified" });
assert.deepEqual(classifyGeoEvidenceFreshness(undefined, undefined, asOf), { freshness: "missing" });
assert.throws(
  () => classifyGeoEvidenceFreshness("platform_verified", "2026-08-19T12:00:00Z", asOf),
  /cannot be after asOf/,
);

const records = buildGeoEvidenceFreshnessRecords([
  {
    layer: "search",
    windowDays: 7,
    canonicalOwner: "/a/",
    evidenceClass: "platform_verified",
    observedAt: "2026-08-17T12:00:00Z",
  },
  {
    layer: "outcomes",
    windowDays: 7,
    canonicalOwner: "/a/",
    evidenceClass: "private_operations_verified",
    observedAt: "2026-08-01T12:00:00Z",
  },
  {
    layer: "funnel",
    windowDays: 28,
    canonicalOwner: "/a/",
    evidenceClass: "owner_provided_handoff",
  },
], asOf);
assert.equal(records.length, 3);
assert.equal(records.find((item) => item.layer === "search").freshness, "fresh");
assert.equal(records.find((item) => item.layer === "outcomes").freshness, "aging");
assert.equal(records.find((item) => item.layer === "funnel").freshness, "undated");

const provenance = summarizeGeoEvidenceProvenance(records);
const seven = provenance.find((item) => item.windowDays === 7);
assert.ok(seven);
assert.equal(seven.records, 2);
assert.deepEqual(
  seven.byLayer.find((item) => item.layer === "search").evidenceClasses,
  ["platform_verified"],
);

const baseEvidence = {
  aiVisibility: ["owner_provided_handoff"],
  search: ["platform_verified"],
  funnel: ["production_receiver_verified"],
  outcomes: ["private_operations_verified"],
};
const ownerRecord = (canonicalOwner, windowDays, evidence, status = "complete") => ({
  canonicalOwner,
  windowDays,
  promptCoverage: {
    promptCount: 0,
    promptIds: [],
    directions: [],
    languages: [],
    intents: [],
    geographies: [],
    weeklyPromptCount: 0,
    monthlyPromptCount: 0,
  },
  scorecard: {
    windowDays,
    aiVisibility: {
      total: 1,
      mentioned: 1,
      cited: 1,
      recommended: 1,
      factualErrors: 0,
      mentionRate: 100,
      citationRate: 100,
      recommendationRate: 100,
      entityAccuracyRate: 100,
      descriptionAccuracyRate: 100,
      factualErrorRate: 0,
      observationsInWindow: evidence.aiVisibility.length ? 1 : 0,
    },
    search: {
      impressions: evidence.search.length ? 1 : 0,
      clicks: 0,
      ctr: 0,
      brandedImpressions: 0,
      brandedClicks: 0,
      brandedCtr: 0,
      nonBrandedImpressions: 0,
      nonBrandedClicks: 0,
      nonBrandedCtr: 0,
    },
    funnel: {
      ctaClicks: 0,
      intakeStarts: 0,
      previewReady: 0,
      handoffReady: 0,
      deliveryConfirmed: 0,
      ctaToIntakeRate: 0,
      intakeToPreviewRate: 0,
      previewToHandoffRate: 0,
      handoffToDeliveryRate: 0,
    },
    leadQuality: {
      reviewedInquiries: 0,
      qualifiedLeads: 0,
      opportunities: 0,
      wins: 0,
      losses: 0,
      revenueReconciledWins: 0,
      reviewToQualifiedRate: 0,
      qualifiedToOpportunityRate: 0,
      opportunityToWinRate: 0,
      deliveryToQualifiedRate: 0,
    },
    evidence,
    gaps: [],
  },
  reconciliation: {
    status,
    missingLayers: [],
    integrityGaps: [],
  },
});

const readiness = buildGeoOwnerReadiness([
  { windowDays: 7, owners: [ownerRecord("/a/", 7, baseEvidence)] },
  {
    windowDays: 28,
    owners: [
      ownerRecord("/a/", 28, {
        aiVisibility: [],
        search: ["platform_verified", "owner_provided_handoff"],
        funnel: [],
        outcomes: [],
      }, "incomplete"),
    ],
  },
  {
    windowDays: 90,
    owners: [
      ownerRecord("/a/", 90, { aiVisibility: [], search: [], funnel: [], outcomes: [] }, "incomplete"),
    ],
  },
]);

const sevenReadiness = readiness.find((item) => item.windowDays === 7);
assert.equal(sevenReadiness.readinessPercent, 100);
assert.deepEqual(sevenReadiness.missingLayers, []);
const twentyEightReadiness = readiness.find((item) => item.windowDays === 28);
assert.equal(twentyEightReadiness.readinessPercent, 25);
assert.deepEqual(twentyEightReadiness.mixedEvidenceLayers, ["search"]);

const coverage = buildGeoOwnerCoverageSummary(readiness);
assert.deepEqual(coverage[0].windowsWithAnyEvidence, [7, 28]);
assert.deepEqual(coverage[0].completeWindows, [7]);
assert.deepEqual(coverage[0].missingWindows, [90]);

console.log("GEO evidence freshness and readiness passed");
