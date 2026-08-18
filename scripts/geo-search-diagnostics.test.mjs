import assert from "node:assert/strict";
import {
  buildGeoPageDiscoveryTrends,
  buildGeoSearchDiagnostics,
  classifyGeoCtrBand,
  classifyGeoPositionBand,
  findGeoSearchQueryDiagnostic,
  validateGeoSearchQueryPageRows,
} from "../src/data/geo-search-diagnostics.ts";

const base = {
  source: "google",
  discoveryType: "non_branded",
  discoveryReviewState: "reviewed",
  queryIntent: "commercial_service",
  pageIntent: "commercial_owner",
  countryBucket: "US",
  deviceBucket: "MOBILE",
  evidenceClass: "platform_verified",
};

const rows = [
  {
    ...base,
    windowDays: 7,
    queryKey: "Q_LOG_001",
    intentGroupKey: "INTENT_CAR_HAUL_DISPATCH",
    pagePath: "/logistics/car-hauling-dispatch/",
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    impressions: 80,
    clicks: 4,
    averagePosition: 12,
  },
  {
    ...base,
    windowDays: 7,
    queryKey: "Q_LOG_001",
    intentGroupKey: "INTENT_CAR_HAUL_DISPATCH",
    pagePath: "/logistics/owner-operator-dispatch-support/",
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    impressions: 20,
    clicks: 1,
    averagePosition: 18,
  },
  {
    ...base,
    windowDays: 7,
    source: "bing",
    queryKey: "Q_LOG_002",
    intentGroupKey: "INTENT_DISPATCH_COMPARE",
    pagePath: "/logistics/resources/dispatch-service-vs-self-dispatch/",
    canonicalOwner: "/logistics/resources/dispatch-service-vs-self-dispatch/",
    queryIntent: "comparison",
    pageIntent: "resource",
    impressions: 30,
    clicks: 0,
    averagePosition: 6,
    evidenceClass: "owner_provided_handoff",
  },
  {
    ...base,
    windowDays: 7,
    queryKey: "Q_LOG_003",
    intentGroupKey: "INTENT_CAR_HAUL_DISPATCH",
    pagePath: "/logistics/owner-operator-dispatch-support/",
    canonicalOwner: "/logistics/owner-operator-dispatch-support/",
    discoveryReviewState: "pending_review",
    deviceBucket: "DESKTOP",
    impressions: 10,
    clicks: 2,
    averagePosition: 4,
  },
  {
    ...base,
    windowDays: 28,
    queryKey: "Q_MKT_001",
    intentGroupKey: "INTENT_LOGISTICS_SEO",
    pagePath: "/services/seo/",
    canonicalOwner: "/services/seo/",
    countryBucket: "WORLDWIDE",
    deviceBucket: "DESKTOP",
    impressions: 200,
    clicks: 8,
    averagePosition: 22,
  },
  {
    ...base,
    windowDays: 90,
    queryKey: "Q_HIST_001",
    intentGroupKey: "INTENT_HISTORICAL",
    pagePath: "/resources/technical-seo-checklist/",
    canonicalOwner: "/resources/technical-seo-checklist/",
    queryIntent: "informational",
    pageIntent: "resource",
    countryBucket: "WORLDWIDE",
    deviceBucket: "OTHER",
    impressions: 50,
    clicks: 2,
    averagePosition: 35,
  },
];

assert.doesNotThrow(() => validateGeoSearchQueryPageRows(rows));

const seven = buildGeoSearchDiagnostics(rows, 7, {
  commercialCtaOwners: ["/logistics/car-hauling-dispatch/"],
});
assert.deepEqual(seven.totals, {
  queryPageRows: 4,
  uniqueQueryKeys: 3,
  uniquePages: 3,
  impressions: 140,
  clicks: 7,
  ctr: 5,
});
assert.deepEqual(seven.multiPageQueryKeys, ["Q_LOG_001"]);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.pages.length, 2);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.ctr, 5);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.averagePosition, 13.2);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.ctrBand, "ctr_5_plus");
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.positionBand, "position_11_to_20");
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_002")?.ctrBand, undefined, "owner handoff must not masquerade as authenticated CTR-band evidence");
assert.equal(findGeoSearchQueryDiagnostic(seven, "UNKNOWN"), null);
assert.deepEqual(seven.byCountry, [{ key: "US", impressions: 140, clicks: 7, ctr: 5 }]);
assert.equal(seven.byDevice.find((item) => item.key === "MOBILE").impressions, 130);
assert.deepEqual(seven.pendingDiscoveryReviewQueryKeys, ["Q_LOG_003"]);
assert.deepEqual(seven.nonCanonicalQueryKeys, ["Q_LOG_001"]);
assert.deepEqual(seven.competingOwnerIntentGroupKeys, [], "pending-review ownership must not create a reviewed conflict");
assert.deepEqual(seven.zeroClickOpportunityQueryKeys, ["Q_LOG_002"]);
assert.ok(seven.clicksWithoutCommercialCtaQueryKeys.includes("Q_LOG_003"));
assert.equal(seven.commercialCtaEvidenceProvided, true);
assert.ok(seven.platformEvidenceQueryKeys.includes("Q_LOG_001"));
assert.ok(seven.platformEvidenceQueryKeys.includes("Q_LOG_003"));

const reviewedConflictRows = rows.map((row) => ({ ...row }));
reviewedConflictRows[3].discoveryReviewState = "reviewed";
const withConflict = buildGeoSearchDiagnostics(reviewedConflictRows, 7);
assert.deepEqual(withConflict.competingOwnerIntentGroupKeys, ["INTENT_CAR_HAUL_DISPATCH"]);
assert.equal(withConflict.commercialCtaEvidenceProvided, false);
assert.deepEqual(withConflict.clicksWithoutCommercialCtaQueryKeys, []);

const twentyEight = buildGeoSearchDiagnostics(rows, 28);
assert.equal(twentyEight.totals.impressions, 200);
assert.equal(twentyEight.totals.uniqueQueryKeys, 1);
assert.deepEqual(twentyEight.byCountry, [{ key: "WORLDWIDE", impressions: 200, clicks: 8, ctr: 4 }]);

assert.equal(classifyGeoCtrBand(0), "ctr_0");
assert.equal(classifyGeoCtrBand(1.9), "ctr_under_2");
assert.equal(classifyGeoCtrBand(2), "ctr_2_to_under_5");
assert.equal(classifyGeoCtrBand(5), "ctr_5_plus");
assert.equal(classifyGeoPositionBand(3), "position_1_to_3");
assert.equal(classifyGeoPositionBand(10), "position_4_to_10");
assert.equal(classifyGeoPositionBand(20), "position_11_to_20");
assert.equal(classifyGeoPositionBand(50), "position_21_to_50");
assert.equal(classifyGeoPositionBand(51), "position_51_plus");

const trends = buildGeoPageDiscoveryTrends(rows);
assert.equal(trends.find((item) => item.pagePath === "/logistics/car-hauling-dispatch/").state, "recent_discovery");
assert.equal(trends.find((item) => item.pagePath === "/services/seo/").state, "recent_gap");
assert.equal(trends.find((item) => item.pagePath === "/resources/technical-seo-checklist/").state, "historical_only");

assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], queryKey: "raw query with spaces" }]),
  /opaque safe identifier/,
  "raw query text must not be accepted as queryKey",
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], intentGroupKey: "raw intent group" }]),
  /opaque safe identifier/,
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], pagePath: "/logistics/car-hauling-dispatch/?q=private" }]),
  /clean site-relative path/,
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], clicks: 81 }]),
  /clicks cannot exceed impressions/,
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], averagePosition: Number.NaN }]),
  /finite non-negative number/,
);

const serialized = JSON.stringify(seven).toLowerCase();
for (const prohibitedField of ["querytext", "rawquery", "email", "phone", "name", "company", "mc", "usdot", "vin", "token", "cookie", "accountid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedField}\"`), `search diagnostics must not add ${prohibitedField} fields`);
}

console.log("GEO privacy-safe reviewed query-group diagnostics passed");
