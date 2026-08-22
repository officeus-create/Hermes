import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildSecureGeoOperationalScorecardReport,
} from "../src/data/geo-operational-secure-runner.ts";

const inputPath = "examples/geo-operational-input.synthetic.json";
const snapshotPath = "examples/geo-operational-output.synthetic.json";
const input = JSON.parse(readFileSync(inputPath, "utf8"));
const expected = JSON.parse(readFileSync(snapshotPath, "utf8"));
const report = buildSecureGeoOperationalScorecardReport(input);

const windows = report.scorecards.map((scorecard) => ({
  window_days: scorecard.windowDays,
  search_impressions: scorecard.search.impressions,
  search_clicks: scorecard.search.clicks,
  search_ctr: scorecard.search.ctr,
  non_branded_impressions: scorecard.search.nonBrandedImpressions,
  cta_clicks: scorecard.funnel.ctaClicks,
  intake_starts: scorecard.funnel.intakeStarts,
  delivery_confirmed: scorecard.funnel.deliveryConfirmed,
  qualified_leads: scorecard.leadQuality.qualifiedLeads,
  opportunities: scorecard.leadQuality.opportunities,
  wins: scorecard.leadQuality.wins,
  revenue_reconciled_wins: scorecard.leadQuality.revenueReconciledWins,
}));

const readiness = report.ownerReadiness.find(
  (item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/" && item.windowDays === 7,
);
assert.ok(readiness);
const ownerRecord = report.ownerScorecards
  .find((item) => item.windowDays === 7)
  ?.owners.find((item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/");
assert.ok(ownerRecord);

const actual = {
  schema_version: "geo_operational_example_snapshot_v1",
  synthetic_example: true,
  source: inputPath,
  as_of: report.asOf,
  ingestion: {
    ai_observations: report.ingestion.aiObservations,
    search_checkpoints: report.ingestion.searchCheckpoints,
    standard_search_aggregates: report.ingestion.standardSearchAggregates,
    held_search_checkpoints: report.ingestion.heldSearchCheckpoints,
    analytics_event_rows: report.ingestion.analyticsEventRows,
    ready_funnels: report.ingestion.readyFunnels,
    incomplete_funnels: report.ingestion.incompleteFunnels,
    outcome_rows: report.ingestion.outcomeRows,
  },
  windows,
  car_hauling_owner_readiness: {
    window_days: readiness.windowDays,
    readiness_percent: readiness.readinessPercent,
    reconciliation_status: ownerRecord.reconciliation.status,
    missing_layers: ownerRecord.reconciliation.missingLayers,
  },
  truth_notice: "All example counts are synthetic and unverified; this snapshot demonstrates shape and reconciliation behavior only.",
};

assert.deepEqual(actual, expected, "committed synthetic output snapshot must match the secure compiler");
assert.ok(
  report.evidenceHealth.records.every((item) => item.evidenceClass === "unverified"),
  "synthetic example evidence must never masquerade as verified",
);
assert.equal(report.evidenceHealth.records.every((item) => item.freshness === "unverified"), true);

const serialized = JSON.stringify({ input, expected }).toLowerCase();
for (const forbidden of [
  "private@example.com",
  "raw_query",
  "raw_response",
  "full_answer",
  "account_id",
  "property_id",
  "stream_id",
  "token",
  "cookie",
  "revenue_amount",
]) {
  assert.ok(!serialized.includes(forbidden));
}

console.log("GEO synthetic operating input/output examples passed");
