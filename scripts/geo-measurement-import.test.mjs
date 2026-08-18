import assert from "node:assert/strict";
import {
  importGeoAnalyticsEventBatch,
  importGeoAnalyticsEventRow,
  importGeoOutcomeBatch,
  importGeoOutcomeRow,
  importGeoSearchCheckpointBatch,
  importGeoSearchCheckpointRow,
} from "../src/data/geo-measurement-import.ts";
import { adaptExactSearchCheckpoint } from "../src/data/geo-measurement-adapters.ts";

const searchRow = {
  source: "google",
  page_path: "/logistics/car-hauling-dispatch/",
  discovery_type: "non_branded",
  start_date: "2026-08-12",
  end_date: "2026-08-18",
  impressions: 120,
  clicks: 6,
  evidence_class: "platform_verified",
};

const search = importGeoSearchCheckpointRow(searchRow);
assert.equal(search.pagePath, "/logistics/car-hauling-dispatch/");
assert.equal(adaptExactSearchCheckpoint(search).status, "ready");
assert.equal(importGeoSearchCheckpointBatch([searchRow]).length, 1);

const nonStandard = importGeoSearchCheckpointRow({
  ...searchRow,
  start_date: "2026-08-03",
  end_date: "2026-08-18",
});
assert.equal(adaptExactSearchCheckpoint(nonStandard).status, "non_standard_window");
assert.equal(adaptExactSearchCheckpoint(nonStandard).windowDays, 16);

const analyticsRow = {
  family: "carrier",
  window_days: 7,
  journey_path: "/logistics/car-hauling-dispatch/",
  event_page_path: "/logistics/start-car-hauling-dispatch/",
  event_name: "carrier_intake_start",
  count: 8,
  evidence_class: "platform_verified",
};
const analytics = importGeoAnalyticsEventRow(analyticsRow);
assert.equal(analytics.family, "carrier");
assert.equal(analytics.aggregate.eventName, "carrier_intake_start");
assert.equal(importGeoAnalyticsEventBatch([analyticsRow]).length, 1);

const outcomeRow = {
  window_days: 7,
  page_path: "/logistics/car-hauling-dispatch/",
  reviewed_inquiries: 3,
  qualified_leads: 2,
  opportunities: 1,
  wins: 1,
  losses: 0,
  revenue_reconciled_wins: 1,
  evidence_class: "private_operations_verified",
};
const outcome = importGeoOutcomeRow(outcomeRow);
assert.equal(outcome.qualifiedLeads, 2);
assert.equal(outcome.revenueReconciledWins, 1);
assert.equal(importGeoOutcomeBatch([outcomeRow]).length, 1);

for (const [label, importer, row] of [
  ["search", importGeoSearchCheckpointRow, searchRow],
  ["analytics", importGeoAnalyticsEventRow, analyticsRow],
  ["outcome", importGeoOutcomeRow, outcomeRow],
]) {
  assert.throws(
    () => importer({ ...row, email: "private@example.com" }),
    /unsupported field/,
    `${label} import must reject undeclared private fields`,
  );
  assert.throws(
    () => importer({ ...row, account_id: "123" }),
    /unsupported field/,
    `${label} import must reject account identifiers`,
  );
}

assert.throws(
  () => importGeoSearchCheckpointRow({ ...searchRow, page_path: "/logistics/car-hauling-dispatch/?email=private" }),
  /query parameters or fragments/,
);
assert.throws(
  () => importGeoSearchCheckpointRow({ ...searchRow, clicks: 121 }),
  /cannot exceed search.impressions/,
);
assert.throws(
  () => importGeoAnalyticsEventRow({ ...analyticsRow, window_days: 16 }),
  /unsupported value/,
);
assert.throws(
  () => importGeoAnalyticsEventRow({ ...analyticsRow, count: -1 }),
  /non-negative integer/,
);
assert.throws(
  () => importGeoOutcomeRow({ ...outcomeRow, qualified_leads: 4 }),
  /qualified_leads cannot exceed reviewed_inquiries/,
);
assert.throws(
  () => importGeoOutcomeRow({ ...outcomeRow, opportunities: 3, qualified_leads: 2 }),
  /opportunities cannot exceed qualified_leads/,
);
assert.throws(
  () => importGeoOutcomeRow({ ...outcomeRow, wins: 1, losses: 1, opportunities: 1 }),
  /wins \+ losses cannot exceed opportunities/,
);
assert.throws(
  () => importGeoOutcomeRow({ ...outcomeRow, revenue_reconciled_wins: 2, wins: 1 }),
  /revenue_reconciled_wins cannot exceed wins/,
);

const serialized = JSON.stringify({ search, analytics, outcome }).toLowerCase();
for (const prohibitedKey of ["email", "phone", "name", "company", "mc", "usdot", "vin", "token", "cookie", "accountid", "revenue_amount"]) {
  assert.ok(!serialized.includes(`\"${prohibitedKey}\"`), `measurement import output must not add ${prohibitedKey} fields`);
}

console.log("GEO sanitized measurement import boundary passed");
