import assert from "node:assert/strict";
import {
  buildGeoGoogleBingIndexDisagreements,
  buildGeoIndexFreshness,
  buildGeoPrioritySearchEvidenceMatrix,
  buildGeoSearchPlatformReceiptReport,
  compareGeoSearchPlatformReceipts,
  geoSearchPlatformReceiptVersion,
  importGeoJobInspectionEvidence,
  importGeoSelectedCanonicalEvidence,
  reconcileGeoIndexNowWithBing,
} from "../src/data/geo-search-platform-evidence.ts";

const row = (overrides = {}) => ({
  query_key: "query_group_carhaul",
  intent_group_key: "intent_carhaul_dispatch",
  page_path: "/logistics/car-hauling-dispatch/",
  canonical_owner: "/logistics/car-hauling-dispatch/",
  discovery_type: "non_branded",
  discovery_review_state: "reviewed",
  query_intent: "commercial_service",
  page_intent: "commercial_owner",
  country_bucket: "US",
  device_bucket: "DESKTOP",
  impressions: 120,
  clicks: 6,
  average_position: 18.4,
  ...overrides,
});

const receipt = (overrides = {}) => ({
  schema_version: geoSearchPlatformReceiptVersion,
  reference_id: "gsc-carhaul-7d-current",
  source: "google",
  start_date: "2026-08-12",
  end_date: "2026-08-18",
  observed_at: "2026-08-18T18:00:00Z",
  evidence_class: "platform_verified",
  rows: [
    row(),
    row({
      query_key: "query_group_low_volume",
      intent_group_key: "intent_low_volume",
      impressions: 2,
      clicks: 0,
      average_position: 51,
    }),
  ],
  ...overrides,
});

const current = buildGeoSearchPlatformReceiptReport(receipt(), {
  anonymityThreshold: 3,
  commercialCtaOwners: ["/logistics/car-hauling-dispatch/"],
});
assert.equal(current.exactWindowDays, 7);
assert.equal(current.standardWindowDays, 7);
assert.equal(current.status, "diagnostic_ready");
assert.equal(current.totals.rows, 2);
assert.equal(current.totals.impressions, 122);
assert.equal(current.diagnosticRows.length, 1);
assert.equal(current.heldLowVolumeRows.length, 1);
assert.equal(current.heldLowVolumeRows[0].reason, "below_query_group_anonymity_threshold");
assert.ok(!JSON.stringify(current.heldLowVolumeRows).includes("query_group_low_volume"));
assert.equal(current.diagnostics.totals.impressions, 120);
assert.deepEqual(current.diagnostics.platformEvidenceQueryKeys, ["query_group_carhaul"]);

const nonStandard = buildGeoSearchPlatformReceiptReport(
  receipt({
    reference_id: "gsc-exact-16d",
    start_date: "2026-07-28",
    end_date: "2026-08-12",
  }),
);
assert.equal(nonStandard.exactWindowDays, 16);
assert.equal(nonStandard.standardWindowDays, null);
assert.equal(nonStandard.status, "held_non_standard_window");
assert.equal(nonStandard.diagnosticRows.length, 0);
assert.equal(nonStandard.diagnostics, null);
assert.equal(nonStandard.totals.impressions, 122);

const previous = buildGeoSearchPlatformReceiptReport(
  receipt({
    reference_id: "gsc-carhaul-7d-previous",
    start_date: "2026-08-05",
    end_date: "2026-08-11",
    rows: [row({ impressions: 100, clicks: 4, average_position: 20 })],
  }),
);
const comparison = compareGeoSearchPlatformReceipts(current, previous);
assert.equal(comparison.windowDays, 7);
assert.equal(comparison.impressionsDelta, 22);
assert.equal(comparison.clicksDelta, 2);
assert.equal(comparison.ctrDeltaPoints, 0.92);
assert.throws(
  () => compareGeoSearchPlatformReceipts(current, buildGeoSearchPlatformReceiptReport(receipt({ start_date: "2026-08-04", end_date: "2026-08-10" }))),
  /adjacent, non-overlapping/,
);
assert.throws(() => compareGeoSearchPlatformReceipts(nonStandard, previous), /exact 7-day or 28-day/);

const bing7 = buildGeoSearchPlatformReceiptReport(receipt({
  reference_id: "bing-carhaul-7d",
  source: "bing",
}));
const google28 = buildGeoSearchPlatformReceiptReport(receipt({
  reference_id: "gsc-carhaul-28d",
  start_date: "2026-07-22",
  end_date: "2026-08-18",
}));
const bing28 = buildGeoSearchPlatformReceiptReport(receipt({
  reference_id: "bing-carhaul-28d",
  source: "bing",
  start_date: "2026-07-22",
  end_date: "2026-08-18",
}));
const matrix = buildGeoPrioritySearchEvidenceMatrix([current, bing7, google28, bing28]);
const carHaul = matrix.find((item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/");
assert.equal(carHaul.complete, true);
assert.deepEqual(carHaul.missing, []);
const home = matrix.find((item) => item.canonicalOwner === "/");
assert.equal(home.complete, false);
assert.equal(home.missing.length, 4);

const canonical = importGeoSelectedCanonicalEvidence({
  page_path: "/careers/car-hauling-dispatcher/",
  checked_at: "2026-08-18T16:00:00Z",
  selected_canonical_state: "MATCHES_DECLARED",
  selected_canonical_path: "/careers/car-hauling-dispatcher/",
  evidence_class: "platform_verified",
});
assert.equal(canonical.selectedCanonicalState, "MATCHES_DECLARED");

const job = importGeoJobInspectionEvidence({
  page_path: "/careers/car-hauling-dispatcher/",
  checked_at: "2026-08-18T16:00:00Z",
  selected_canonical_state: "MATCHES_DECLARED",
  selected_canonical_path: "/careers/car-hauling-dispatcher/",
  evidence_class: "platform_verified",
  index_state: "INDEXED",
  jobposting_enhancement_state: "VALID",
});
assert.equal(job.indexState, "INDEXED");
assert.equal(job.jobPostingEnhancementState, "VALID");
assert.throws(
  () => importGeoSelectedCanonicalEvidence({
    page_path: "/careers/car-hauling-dispatcher/",
    checked_at: "2026-08-18T16:00:00Z",
    selected_canonical_state: "MATCHES_DECLARED",
    selected_canonical_path: null,
    evidence_class: "platform_verified",
  }),
  /requires selected_canonical_path/,
);

const indexRecords = [
  {
    source: "google",
    pagePath: "/careers/car-hauling-dispatcher/",
    state: "INDEXED",
    checkedAt: "2026-08-18T12:00:00.000Z",
    evidenceClass: "platform_verified",
  },
  {
    source: "bing",
    pagePath: "/careers/car-hauling-dispatcher/",
    state: "CRAWLED",
    checkedAt: "2026-08-17T12:00:00.000Z",
    evidenceClass: "platform_verified",
  },
  {
    source: "bing",
    pagePath: "/logistics/car-hauling-dispatch/",
    state: "INDEXED",
    checkedAt: "2026-08-18T12:00:00.000Z",
    evidenceClass: "platform_verified",
  },
];
const freshness = buildGeoIndexFreshness(indexRecords, "2026-08-18T20:00:00Z", 7);
assert.ok(freshness.every((item) => item.freshnessState === "current"));
assert.throws(
  () => buildGeoIndexFreshness(indexRecords, "2026-08-16T20:00:00Z", 7),
  /occurs after asOf/,
);

const indexNow = [
  {
    pagePath: "/careers/car-hauling-dispatcher/",
    submittedAt: "2026-08-16T12:00:00.000Z",
    acceptance: "ACCEPTED",
    evidenceClass: "owner_provided_handoff",
  },
  {
    pagePath: "/logistics/car-hauling-dispatch/",
    submittedAt: "2026-08-16T12:00:00.000Z",
    acceptance: "ACCEPTED",
    evidenceClass: "owner_provided_handoff",
  },
];
const indexNowReconciliation = reconcileGeoIndexNowWithBing(indexRecords, indexNow);
const jobIndexNow = indexNowReconciliation.find((item) => item.pagePath === "/careers/car-hauling-dispatcher/");
assert.equal(jobIndexNow.indexNowAccepted, true);
assert.equal(jobIndexNow.bingState, "CRAWLED");
assert.equal(jobIndexNow.status, "accepted_not_indexed");
assert.equal(jobIndexNow.indexNowIsNotIndexProof, true);
const carHaulIndexNow = indexNowReconciliation.find((item) => item.pagePath === "/logistics/car-hauling-dispatch/");
assert.equal(carHaulIndexNow.status, "accepted_and_indexed");

const disagreements = buildGeoGoogleBingIndexDisagreements(indexRecords);
assert.deepEqual(disagreements, [{
  pagePath: "/careers/car-hauling-dispatcher/",
  googleState: "INDEXED",
  bingState: "CRAWLED",
  resolution: "review_platform_evidence_no_automatic_winner",
}]);

assert.throws(() => buildGeoSearchPlatformReceiptReport(receipt({ raw_query: "forbidden" })), /unsupported field: raw_query/i);
assert.throws(() => buildGeoSearchPlatformReceiptReport(receipt({ start_date: "2026-08-19", end_date: "2026-08-18" })), /end_date cannot be before/);
assert.throws(() => buildGeoSearchPlatformReceiptReport(receipt(), { anonymityThreshold: 0 }), /between 1 and 100/);

console.log("GEO search platform evidence contract passed");
