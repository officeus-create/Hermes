import assert from "node:assert/strict";
import {
  buildGeoOperationalScorecardReport,
  geoOperationalScorecardInputVersion,
  geoOperationalScorecardReportVersion,
} from "../src/data/geo-operational-scorecard.ts";

const asOf = "2026-08-18T12:00:00Z";
const owner = "/logistics/car-hauling-dispatch/";

const bundle = {
  schema_version: geoOperationalScorecardInputVersion,
  as_of: asOf,
  ai_visibility_evidence_class: "owner_provided_handoff",
  ai_observations: [
    {
      id: "obs_log_01_chatgpt_20260817",
      prompt_id: "LOG-01",
      provider: "chatgpt",
      observed_at: "2026-08-17T12:00:00Z",
      reviewer_label: "reviewer_ops_1",
      brand_mentioned: true,
      linked_citation: true,
      cited_path: owner,
      recommendation: "considered_option",
      entity_accuracy: "accurate",
      description_accuracy: "accurate",
      factual_error: false,
      competitors: ["Example Carrier Support"],
      corrective_action: "",
      evidence_reference: "ops-review-alpha",
    },
  ],
  search_checkpoints: [
    {
      source: "google",
      page_path: owner,
      discovery_type: "non_branded",
      start_date: "2026-08-12",
      end_date: "2026-08-18",
      impressions: 100,
      clicks: 10,
      evidence_class: "owner_provided_handoff",
    },
    {
      source: "google",
      page_path: owner,
      discovery_type: "branded",
      start_date: "2026-08-03",
      end_date: "2026-08-18",
      impressions: 40,
      clicks: 8,
      evidence_class: "owner_provided_handoff",
    },
  ],
  analytics_events: [
    {
      family: "carrier",
      window_days: 7,
      journey_path: owner,
      event_page_path: owner,
      event_name: "commercial_cta_click",
      count: 10,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "carrier",
      window_days: 7,
      journey_path: owner,
      event_page_path: "/logistics/start-car-hauling-dispatch/",
      event_name: "carrier_intake_start",
      count: 8,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "carrier",
      window_days: 7,
      journey_path: owner,
      event_page_path: "/logistics/start-car-hauling-dispatch/",
      event_name: "carrier_intake_preview_ready",
      count: 6,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "carrier",
      window_days: 7,
      journey_path: owner,
      event_page_path: "/logistics/start-car-hauling-dispatch/",
      event_name: "carrier_handoff_ready",
      count: 5,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "carrier",
      window_days: 7,
      journey_path: owner,
      event_page_path: "/logistics/start-car-hauling-dispatch/",
      event_name: "carrier_delivery_confirmed",
      count: 4,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "seo",
      window_days: 7,
      journey_path: "/services/seo/",
      event_page_path: "/services/seo/",
      event_name: "commercial_cta_click",
      count: 5,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "seo",
      window_days: 7,
      journey_path: "/services/seo/",
      event_page_path: "/paths/marketing/",
      event_name: "seo_intake_start",
      count: 4,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "seo",
      window_days: 7,
      journey_path: "/services/seo/",
      event_page_path: "/paths/marketing/",
      event_name: "seo_intake_preview_ready",
      count: 3,
      evidence_class: "owner_provided_handoff",
    },
    {
      family: "seo",
      window_days: 7,
      journey_path: "/services/seo/",
      event_page_path: "/paths/marketing/",
      event_name: "seo_handoff_ready",
      count: 2,
      evidence_class: "owner_provided_handoff",
    },
  ],
  outcomes: [
    {
      window_days: 7,
      page_path: owner,
      reviewed_inquiries: 4,
      qualified_leads: 3,
      opportunities: 2,
      wins: 1,
      losses: 1,
      revenue_reconciled_wins: 1,
      evidence_class: "private_operations_verified",
    },
  ],
};

const report = buildGeoOperationalScorecardReport(bundle);
assert.equal(report.schemaVersion, geoOperationalScorecardReportVersion);
assert.equal(report.asOf, asOf);
assert.deepEqual(report.ingestion, {
  aiObservations: 1,
  searchCheckpoints: 2,
  standardSearchAggregates: 1,
  heldSearchCheckpoints: 1,
  analyticsEventRows: 9,
  readyFunnels: 1,
  incompleteFunnels: 1,
  outcomeRows: 1,
});

assert.equal(report.heldSearchCheckpoints[0].windowDays, 16);
assert.match(report.heldSearchCheckpoints[0].reason, /do not manufacture a 7\/28\/90-day row/i);

assert.equal(report.incompleteFunnels[0].family, "seo");
assert.deepEqual(report.incompleteFunnels[0].registryGaps, ["delivery_confirmed_event_not_established"]);

const sevenDay = report.scorecards.find((item) => item.windowDays === 7);
assert.ok(sevenDay);
assert.equal(sevenDay.search.impressions, 100);
assert.equal(sevenDay.search.clicks, 10);
assert.equal(sevenDay.search.nonBrandedImpressions, 100);
assert.equal(sevenDay.funnel.deliveryConfirmed, 4);
assert.equal(sevenDay.leadQuality.qualifiedLeads, 3);
assert.equal(sevenDay.aiVisibility.observationsInWindow, 1);

const twentyEightDay = report.scorecards.find((item) => item.windowDays === 28);
assert.ok(twentyEightDay);
assert.equal(twentyEightDay.search.impressions, 0, "16-day evidence must not be fabricated into the 28-day scorecard");

const ownerWindow = report.ownerScorecards.find((item) => item.windowDays === 7);
assert.ok(ownerWindow);
const ownerRecord = ownerWindow.owners.find((item) => item.canonicalOwner === owner);
assert.ok(ownerRecord);
assert.equal(ownerRecord.reconciliation.status, "complete");
assert.deepEqual(ownerRecord.reconciliation.missingLayers, []);
assert.deepEqual(ownerRecord.reconciliation.integrityGaps, []);

assert.throws(
  () => buildGeoOperationalScorecardReport({ ...bundle, email: "private@example.com" }),
  /Unsupported GEO operational bundle field: email/,
);

const futureObservation = structuredClone(bundle);
futureObservation.ai_observations[0].observed_at = "2026-08-19T12:00:00Z";
assert.throws(
  () => buildGeoOperationalScorecardReport(futureObservation),
  /occurs after as_of/,
);

const futureSearch = structuredClone(bundle);
futureSearch.search_checkpoints[0].end_date = "2026-08-19";
assert.throws(
  () => buildGeoOperationalScorecardReport(futureSearch),
  /ends after as_of/,
);

const serializedReport = JSON.stringify(report);
assert.ok(!serializedReport.includes("private@example.com"));
assert.ok(!serializedReport.includes("raw_response"));

console.log("GEO operational scorecard compiler passed");
