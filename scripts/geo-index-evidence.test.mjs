import assert from "node:assert/strict";
import {
  buildGeoIndexEvidenceReport,
  importGeoAuthenticatedIndexStateBatch,
  importGeoAuthenticatedIndexStateRow,
  importGeoIndexNowReceiptBatch,
  importGeoIndexNowReceiptRow,
} from "../src/data/geo-index-evidence.ts";

const indexed = {
  source: "google",
  page_path: "/logistics/car-hauling-dispatch/",
  state: "INDEXED",
  checked_at: "2026-08-18T12:00:00Z",
  evidence_class: "platform_verified",
};
const crawled = {
  source: "bing",
  page_path: "/services/seo/",
  state: "CRAWLED",
  checked_at: "2026-08-18T12:05:00Z",
  evidence_class: "platform_verified",
};
const receipt = {
  page_path: "/services/seo/",
  submitted_at: "2026-08-18T11:00:00Z",
  acceptance: "ACCEPTED",
  evidence_class: "owner_provided_handoff",
};

assert.equal(importGeoAuthenticatedIndexStateRow(indexed).state, "INDEXED");
assert.equal(importGeoIndexNowReceiptRow(receipt).acceptance, "ACCEPTED");

const states = importGeoAuthenticatedIndexStateBatch([indexed, crawled]);
const receipts = importGeoIndexNowReceiptBatch([receipt]);
const report = buildGeoIndexEvidenceReport(states, receipts);
assert.deepEqual(report.indexedPages, ["/logistics/car-hauling-dispatch/"]);
assert.deepEqual(report.notIndexedPages, ["/services/seo/"]);
assert.deepEqual(report.indexNowAcceptedPages, ["/services/seo/"]);
assert.equal(report.indexNowSeparatedFromIndexState, true);
assert.ok(!report.indexedPages.includes("/services/seo/"), "IndexNow acceptance must never manufacture INDEXED state");

assert.throws(
  () => importGeoAuthenticatedIndexStateRow({ ...indexed, evidence_class: "owner_provided_handoff" }),
  /must be platform_verified/,
);
assert.throws(
  () => importGeoAuthenticatedIndexStateRow({ ...indexed, state: "INDEXNOW_ACCEPTED" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoAuthenticatedIndexStateRow({ ...indexed, checked_at: "not-a-date" }),
  /valid ISO date\/time/,
);
assert.throws(
  () => importGeoAuthenticatedIndexStateRow({ ...indexed, page_path: "/services/seo/?private=1" }),
  /clean site-relative path/,
);
assert.throws(
  () => importGeoAuthenticatedIndexStateRow({ ...indexed, email: "private@example.com" }),
  /unsupported field/,
);
assert.throws(
  () => importGeoIndexNowReceiptRow({ ...receipt, acceptance: "INDEXED" }),
  /unsupported value/,
);
assert.throws(
  () => importGeoAuthenticatedIndexStateBatch([indexed, indexed]),
  /Duplicate GEO index-state evidence/,
);

const serialized = JSON.stringify(report).toLowerCase();
for (const prohibited of ["email", "phone", "query_text", "raw_query", "account_id", "property_id", "token", "cookie"]) {
  assert.ok(!serialized.includes(`\"${prohibited}\"`));
}

console.log("GEO authenticated index-state and IndexNow separation passed");
