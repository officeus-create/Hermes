import assert from "node:assert/strict";
import {
  compareGeoMeasurementScorecards,
  compareGeoOperationalReports,
} from "../src/data/geo-operational-comparison.ts";

const scorecard = (windowDays, overrides = {}) => ({
  windowDays,
  aiVisibility: {
    total: 1,
    mentioned: 1,
    cited: 1,
    recommended: 0,
    factualErrors: 0,
    mentionRate: 50,
    citationRate: 25,
    recommendationRate: 0,
    entityAccuracyRate: 100,
    descriptionAccuracyRate: 100,
    factualErrorRate: 0,
    observationsInWindow: 1,
    ...(overrides.aiVisibility ?? {}),
  },
  search: {
    impressions: 100,
    clicks: 10,
    ctr: 10,
    brandedImpressions: 20,
    brandedClicks: 4,
    brandedCtr: 20,
    nonBrandedImpressions: 80,
    nonBrandedClicks: 6,
    nonBrandedCtr: 7.5,
    ...(overrides.search ?? {}),
  },
  funnel: {
    ctaClicks: 10,
    intakeStarts: 8,
    previewReady: 7,
    handoffReady: 6,
    deliveryConfirmed: 5,
    ctaToIntakeRate: 80,
    intakeToPreviewRate: 87.5,
    previewToHandoffRate: 85.7,
    handoffToDeliveryRate: 83.3,
    ...(overrides.funnel ?? {}),
  },
  leadQuality: {
    reviewedInquiries: 5,
    qualifiedLeads: 4,
    opportunities: 3,
    wins: 1,
    losses: 1,
    revenueReconciledWins: 1,
    reviewToQualifiedRate: 80,
    qualifiedToOpportunityRate: 75,
    opportunityToWinRate: 33.3,
    deliveryToQualifiedRate: 80,
    ...(overrides.leadQuality ?? {}),
  },
  evidence: {
    aiVisibility: ["owner_provided_handoff"],
    search: ["platform_verified"],
    funnel: ["production_receiver_verified"],
    outcomes: ["private_operations_verified"],
  },
  gaps: [],
});

const previousSeven = scorecard(7);
const currentSeven = scorecard(7, {
  aiVisibility: { mentionRate: 75, citationRate: 50 },
  search: { impressions: 150, clicks: 18, ctr: 12, nonBrandedImpressions: 120 },
  funnel: { ctaClicks: 14, intakeStarts: 10, deliveryConfirmed: 7 },
  leadQuality: { qualifiedLeads: 6, opportunities: 4, wins: 2 },
});

const delta = compareGeoMeasurementScorecards(currentSeven, previousSeven);
assert.deepEqual(delta, {
  aiMentionRate: 25,
  aiCitationRate: 25,
  searchImpressions: 50,
  searchClicks: 8,
  searchCtr: 2,
  nonBrandedImpressions: 40,
  ctaClicks: 4,
  intakeStarts: 2,
  deliveryConfirmed: 2,
  qualifiedLeads: 2,
  opportunities: 1,
  wins: 1,
});

assert.throws(
  () => compareGeoMeasurementScorecards(currentSeven, scorecard(28)),
  /Cannot compare 7-day scorecard with 28-day scorecard/,
);

const report = (asOf, seven) => ({
  asOf,
  scorecards: [seven, scorecard(28), scorecard(90)],
  ownerScorecards: [
    { windowDays: 7, owners: [{ canonicalOwner: "/a/", scorecard: seven }] },
    { windowDays: 28, owners: [{ canonicalOwner: "/a/", scorecard: scorecard(28) }] },
    { windowDays: 90, owners: [{ canonicalOwner: "/a/", scorecard: scorecard(90) }] },
  ],
});

const comparison = compareGeoOperationalReports(
  report("2026-08-18T12:00:00Z", currentSeven),
  report("2026-08-11T12:00:00Z", previousSeven),
);
assert.equal(comparison.global.length, 3);
assert.equal(comparison.global.find((item) => item.windowDays === 7).metrics.searchImpressions, 50);
assert.equal(comparison.owners.find((item) => item.windowDays === 7).metrics.wins, 1);

assert.throws(
  () => compareGeoOperationalReports(
    report("2026-08-11T12:00:00Z", currentSeven),
    report("2026-08-18T12:00:00Z", previousSeven),
  ),
  /current.asOf must be later than previous.asOf/,
);

console.log("GEO comparable-window delta contract passed");
