import assert from "node:assert/strict";
import {
  importGeoSearchQueryPageBatch,
  importGeoSearchQueryPageRow,
} from "../src/data/geo-search-diagnostics-import.ts";

const safeRow = {
  window_days: 7,
  source: "google",
  query_key: "Q_LOG_001",
  page_path: "/logistics/car-hauling-dispatch/",
  discovery_type: "non_branded",
  query_intent: "commercial_service",
  page_intent: "commercial_owner",
  country_code: "US",
  impressions: 80,
  clicks: 4,
  evidence_class: "platform_verified",
};

const imported = importGeoSearchQueryPageRow(safeRow);
assert.deepEqual(imported, {
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
});
assert.equal(importGeoSearchQueryPageBatch([safeRow]).length, 1);

assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, raw_query: "car hauling dispatch near me" }),
  /Unsupported GEO query-page field: raw_query/,
  "raw query text must not enter the repository import contract",
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, email: "private@example.com" }),
  /Unsupported GEO query-page field: email/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, query_key: "raw query with spaces" }),
  /opaque safe identifier/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, page_path: "/logistics/car-hauling-dispatch/?lead=private" }),
  /clean site-relative path/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, country_code: "USA" }),
  /two-letter uppercase country code/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, clicks: 81 }),
  /clicks cannot exceed impressions/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, query_intent: "guessed_intent" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, page_intent: "robot_page" }),
  /unsupported value/,
);

const serialized = JSON.stringify(importGeoSearchQueryPageBatch([safeRow])).toLowerCase();
for (const prohibitedKey of ["raw_query", "query_text", "email", "phone", "name", "company", "token", "cookie", "accountid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedKey}\"`), `query-page import output must not add ${prohibitedKey}`);
}

console.log("GEO strict query-page import boundary passed");
