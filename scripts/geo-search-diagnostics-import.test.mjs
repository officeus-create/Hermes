import assert from "node:assert/strict";
import {
  importGeoSearchQueryPageBatch,
  importGeoSearchQueryPageRow,
} from "../src/data/geo-search-diagnostics-import.ts";

const safeRow = {
  window_days: 7,
  source: "google",
  query_key: "Q_LOG_001",
  intent_group_key: "INTENT_CAR_HAUL_DISPATCH",
  page_path: "/logistics/car-hauling-dispatch/",
  canonical_owner: "/logistics/car-hauling-dispatch/",
  discovery_type: "non_branded",
  discovery_review_state: "reviewed",
  query_intent: "commercial_service",
  page_intent: "commercial_owner",
  country_bucket: "US",
  device_bucket: "MOBILE",
  impressions: 80,
  clicks: 4,
  average_position: 12.4,
  evidence_class: "platform_verified",
};

const imported = importGeoSearchQueryPageRow(safeRow);
assert.deepEqual(imported, {
  windowDays: 7,
  source: "google",
  queryKey: "Q_LOG_001",
  intentGroupKey: "INTENT_CAR_HAUL_DISPATCH",
  pagePath: "/logistics/car-hauling-dispatch/",
  canonicalOwner: "/logistics/car-hauling-dispatch/",
  discoveryType: "non_branded",
  discoveryReviewState: "reviewed",
  queryIntent: "commercial_service",
  pageIntent: "commercial_owner",
  countryBucket: "US",
  deviceBucket: "MOBILE",
  impressions: 80,
  clicks: 4,
  averagePosition: 12.4,
  evidenceClass: "platform_verified",
});
assert.equal(importGeoSearchQueryPageBatch([safeRow]).length, 1);

for (const forbidden of [
  { raw_query: "car hauling dispatch near me" },
  { query_text: "car hauling dispatch near me" },
  { email: "private@example.com" },
  { account_id: "private-account" },
]) {
  assert.throws(
    () => importGeoSearchQueryPageRow({ ...safeRow, ...forbidden }),
    /Forbidden GEO query-page field/,
  );
}

assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, query_key: "raw query with spaces" }),
  /opaque safe identifier/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, intent_group_key: "raw intent group" }),
  /opaque safe identifier/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, page_path: "/logistics/car-hauling-dispatch/?lead=private" }),
  /clean site-relative path/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, canonical_owner: "https://example.com/private" }),
  /clean site-relative path/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, country_bucket: "CA" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, device_bucket: "PHONE" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, discovery_review_state: "guessed" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoSearchQueryPageRow({ ...safeRow, average_position: -1 }),
  /finite non-negative number/,
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

assert.throws(
  () => importGeoSearchQueryPageBatch([safeRow, { ...safeRow }]),
  /Duplicate GEO query-page aggregate/,
);

const serialized = JSON.stringify(importGeoSearchQueryPageBatch([safeRow])).toLowerCase();
for (const prohibitedKey of ["raw_query", "query_text", "email", "phone", "name", "company", "token", "cookie", "accountid"]) {
  assert.ok(!serialized.includes(`\"${prohibitedKey}\"`), `query-page import output must not add ${prohibitedKey}`);
}

console.log("GEO strict reviewed query-group import boundary passed");
