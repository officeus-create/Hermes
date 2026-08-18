import assert from "node:assert/strict";
import {
  buildGeoSearchDiagnostics,
  findGeoSearchQueryDiagnostic,
  validateGeoSearchQueryPageRows,
} from "../src/data/geo-search-diagnostics.ts";

const rows = [
  {
    windowDays: 7,
    source: "google",
    queryKey: "Q_LOG_001",
    pagePath: "/logistics/car-hauling-dispatch/",
    discoveryType: "non_branded",
    queryIntent: "commercial_service",
    pageIntent: "commercial_owner",
    countryCode: "US",
    impressions: 80,
    clicks: 4,
    evidenceClass: "platform_verified",
  },
  {
    windowDays: 7,
    source: "google",
    queryKey: "Q_LOG_001",
    pagePath: "/logistics/owner-operator-dispatch-support/",
    discoveryType: "non_branded",
    queryIntent: "commercial_service",
    pageIntent: "commercial_owner",
    countryCode: "US",
    impressions: 20,
    clicks: 1,
    evidenceClass: "platform_verified",
  },
  {
    windowDays: 7,
    source: "bing",
    queryKey: "Q_LOG_002",
    pagePath: "/logistics/resources/dispatch-service-vs-self-dispatch/",
    discoveryType: "non_branded",
    queryIntent: "comparison",
    pageIntent: "resource",
    countryCode: "US",
    impressions: 30,
    clicks: 3,
    evidenceClass: "owner_provided_handoff",
  },
  {
    windowDays: 28,
    source: "google",
    queryKey: "Q_MKT_001",
    pagePath: "/services/seo/",
    discoveryType: "non_branded",
    queryIntent: "commercial_service",
    pageIntent: "commercial_owner",
    countryCode: "ALL",
    impressions: 200,
    clicks: 8,
    evidenceClass: "platform_verified",
  },
];

assert.doesNotThrow(() => validateGeoSearchQueryPageRows(rows));

const seven = buildGeoSearchDiagnostics(rows, 7);
assert.deepEqual(seven.totals, {
  queryPageRows: 3,
  uniqueQueryKeys: 2,
  uniquePages: 3,
  impressions: 130,
  clicks: 8,
  ctr: 6.2,
});
assert.deepEqual(seven.multiPageQueryKeys, ["Q_LOG_001"]);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.pages.length, 2);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_001")?.ctr, 5);
assert.equal(findGeoSearchQueryDiagnostic(seven, "Q_LOG_002")?.multiPage, false);
assert.equal(findGeoSearchQueryDiagnostic(seven, "UNKNOWN"), null);
assert.deepEqual(seven.byCountry, [{ key: "US", impressions: 130, clicks: 8, ctr: 6.2 }]);
assert.equal(seven.byQueryIntent[0].key, "commercial_service");
assert.equal(seven.byQueryIntent[0].impressions, 100);
assert.ok(seven.evidenceClasses.includes("platform_verified"));
assert.ok(seven.evidenceClasses.includes("owner_provided_handoff"));

const twentyEight = buildGeoSearchDiagnostics(rows, 28);
assert.equal(twentyEight.totals.impressions, 200);
assert.equal(twentyEight.totals.uniqueQueryKeys, 1);
assert.deepEqual(twentyEight.byCountry, [{ key: "ALL", impressions: 200, clicks: 8, ctr: 4 }]);

assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], queryKey: "raw query with spaces" }]),
  /opaque safe identifier/,
  "raw query text must not be accepted as queryKey",
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], pagePath: "/logistics/car-hauling-dispatch/?q=private" }]),
  /clean site-relative path/,
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], countryCode: "USA" }]),
  /two-letter uppercase country code/,
);
assert.throws(
  () => validateGeoSearchQueryPageRows([{ ...rows[0], clicks: 81 }]),
  /clicks cannot exceed impressions/,
);

const serialized = JSON.stringify(seven).toLowerCase();
for (const prohibitedField of ["querytext", "rawquery", "email", "phone", "name", "company", "mc", "usdot", "vin", "token", "cookie", "accountid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedField}\"`), `search diagnostics must not add ${prohibitedField} fields`);
}

console.log("GEO privacy-safe query-page diagnostics passed");
