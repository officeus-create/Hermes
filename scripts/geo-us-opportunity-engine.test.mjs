import assert from "node:assert/strict";
import {
  adaptFreshCheckpointPagesToUsOpportunityEvidence,
  buildFreshCheckpointUsMarketSignal,
  buildGeoUsOwnerOpportunity,
  classifyGeoUsPositionBand,
  rankGeoUsOwnerOpportunities,
} from "../src/data/geo-us-opportunity-engine.ts";

assert.equal(classifyGeoUsPositionBand(5), "position_1_10");
assert.equal(classifyGeoUsPositionBand(15), "position_11_20");
assert.equal(classifyGeoUsPositionBand(30), "position_21_40");
assert.equal(classifyGeoUsPositionBand(46.06), "position_41_plus");
assert.equal(classifyGeoUsPositionBand(null), "unknown");

const market = buildFreshCheckpointUsMarketSignal();
assert.equal(market.impressions, 500);
assert.equal(market.clicks, 2);
assert.equal(market.ctr, 0.4);
assert.equal(market.averagePosition, 46.06);
assert.equal(market.state, "ranking_problem");
assert.equal(market.nextBestAction, "ranking");
assert.equal(market.ownerLevelActionable, false);

const freshOwners = adaptFreshCheckpointPagesToUsOpportunityEvidence();
assert.equal(freshOwners.length, 4);
const freshRanked = rankGeoUsOwnerOpportunities(freshOwners);
assert.ok(freshRanked.every((row) => row.scope === "global_or_unspecified"));
assert.ok(freshRanked.every((row) => row.confidence === "gated"));
assert.ok(freshRanked.every((row) => row.nextBestAction === "wait_for_data"));
assert.ok(freshRanked.every((row) => row.highImpressionLowClickCandidate === false));
assert.ok(freshRanked.some((row) => row.evidenceGaps.includes("us_owner_scope_missing")));

const platformZeroClick = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/services/seo-for-logistics-companies/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 242,
  clicks: 0,
  ctr: 0,
  averagePosition: 46,
  commercialIntent: "high",
});
assert.equal(platformZeroClick.positionBand, "position_41_plus");
assert.equal(platformZeroClick.state, "ranking_problem");
assert.equal(platformZeroClick.nextBestAction, "ranking");
assert.equal(platformZeroClick.highImpressionLowClickCandidate, true);
assert.equal(platformZeroClick.confidence, "high");

const ownerProvidedSameNumbers = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/services/seo-for-logistics-companies/",
  evidenceClass: "owner_provided_handoff",
  scope: "us",
  impressions: 242,
  clicks: 0,
  ctr: 0,
  averagePosition: 46,
  commercialIntent: "high",
});
assert.equal(ownerProvidedSameNumbers.highImpressionLowClickCandidate, false, "owner-provided evidence must not be upgraded to authenticated platform evidence");
assert.equal(ownerProvidedSameNumbers.confidence, "medium");
assert.ok(ownerProvidedSameNumbers.evidenceGaps.includes("platform_verification_missing"));

const benchmarks = [
  { positionBand: "position_1_10", comparableCtr: 2.5, minimumImpressions: 50, evidenceReference: "gsc-reviewed-cohort-top10" },
  { positionBand: "position_11_20", comparableCtr: 1.2, minimumImpressions: 50, evidenceReference: "gsc-reviewed-cohort-page2" },
];

const pageTwoCtrProblem = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/services/seo/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 120,
  clicks: 1,
  ctr: 0.83,
  averagePosition: 14,
  commercialIntent: "high",
}, benchmarks);
assert.equal(pageTwoCtrProblem.ctrComparable, true);
assert.equal(pageTwoCtrProblem.ctrUnderperformance, true);
assert.equal(pageTwoCtrProblem.state, "snippet_ctr_problem");
assert.equal(pageTwoCtrProblem.nextBestAction, "title_snippet");

const pageTwoNoBenchmark = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/logistics/car-hauling-dispatch/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 120,
  clicks: 1,
  ctr: 0.83,
  averagePosition: 14,
  commercialIntent: "high",
});
assert.equal(pageTwoNoBenchmark.ctrComparable, false);
assert.equal(pageTwoNoBenchmark.ctrUnderperformance, false, "CTR underperformance must not be invented without comparable position evidence");
assert.equal(pageTwoNoBenchmark.state, "intent_review");
assert.equal(pageTwoNoBenchmark.nextBestAction, "intent");
assert.ok(pageTwoNoBenchmark.evidenceGaps.includes("comparable_ctr_benchmark_missing"));

const internalLinkOpportunity = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/resources/test/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 150,
  clicks: 3,
  ctr: 2,
  averagePosition: 28,
  commercialIntent: "medium",
});
assert.equal(internalLinkOpportunity.state, "internal_link_opportunity");
assert.equal(internalLinkOpportunity.nextBestAction, "internal_link");

const topTenCtrProblem = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/services/test/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 200,
  clicks: 2,
  ctr: 1,
  averagePosition: 7,
  commercialIntent: "high",
}, benchmarks);
assert.equal(topTenCtrProblem.state, "snippet_ctr_problem");
assert.equal(topTenCtrProblem.nextBestAction, "title_snippet");

const topTenHealthy = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/services/healthy/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 200,
  clicks: 8,
  ctr: 4,
  averagePosition: 7,
  commercialIntent: "high",
}, benchmarks);
assert.equal(topTenHealthy.ctrUnderperformance, false);
assert.equal(topTenHealthy.state, "observe");
assert.equal(topTenHealthy.nextBestAction, "wait_for_data");

const lowVolume = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/services/low-volume/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 8,
  clicks: 0,
  ctr: 0,
  averagePosition: 12,
  commercialIntent: "high",
}, benchmarks);
assert.equal(lowVolume.noiseCapped, true);
assert.ok(lowVolume.priorityScore <= 30);
assert.equal(lowVolume.confidence, "low");

const ordered = rankGeoUsOwnerOpportunities([
  {
    canonicalOwner: "/global-vanity/",
    evidenceClass: "platform_verified",
    scope: "global_or_unspecified",
    impressions: 5000,
    clicks: 500,
    ctr: 10,
    averagePosition: 2,
    commercialIntent: "high",
  },
  {
    canonicalOwner: "/us-high-volume/",
    evidenceClass: "platform_verified",
    scope: "us",
    impressions: 300,
    clicks: 2,
    ctr: 0.67,
    averagePosition: 35,
    commercialIntent: "high",
  },
  {
    canonicalOwner: "/us-low-volume/",
    evidenceClass: "platform_verified",
    scope: "us",
    impressions: 5,
    clicks: 0,
    ctr: 0,
    averagePosition: 12,
    commercialIntent: "high",
  },
]);
assert.equal(ordered[0].canonicalOwner, "/us-high-volume/", "US high-volume commercial owner must outrank global vanity traffic and low-volume noise");
assert.equal(ordered.at(-1).canonicalOwner, "/global-vanity/", "global/unspecified evidence must remain gated behind US-scoped evidence");

const incompleteCtr = buildGeoUsOwnerOpportunity({
  canonicalOwner: "/partial-export/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 100,
  clicks: 2,
  ctr: null,
  averagePosition: 8,
  commercialIntent: "high",
});
assert.equal(incompleteCtr.clickState, "unknown");
assert.equal(incompleteCtr.ctrUnderperformance, false);

assert.throws(() => buildGeoUsOwnerOpportunity({
  canonicalOwner: "/bad-missing-counts/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: null,
  clicks: null,
  ctr: 2,
  averagePosition: 8,
  commercialIntent: "high",
}), /CTR requires known clicks and impressions/);

assert.throws(() => buildGeoUsOwnerOpportunity({
  canonicalOwner: "/bad-ctr/",
  evidenceClass: "platform_verified",
  scope: "us",
  impressions: 100,
  clicks: 2,
  ctr: 5,
  averagePosition: 8,
  commercialIntent: "high",
}), /CTR does not reconcile/);

console.log("GEO US CTR/position opportunity engine passed");
