import assert from "node:assert/strict";
import {
  buildGeoCommercialOutcomeChains,
  buildGeoQualifiedDemandPrioritization,
  compareGeoCommercialOutcomeChains,
  geoCommercialOutcomeEvidenceVersion,
  importGeoCommercialOutcomeReceiptBatch,
} from "../src/data/geo-commercial-outcome-evidence.ts";

const owner = "/logistics/car-hauling-dispatch/";
const stageReceipt = (stage, count, overrides = {}) => ({
  schema_version: geoCommercialOutcomeEvidenceVersion,
  reference_id: `outcome-${stage}-current`,
  canonical_owner: owner,
  stage,
  start_date: "2026-08-12",
  end_date: "2026-08-18",
  observed_at: "2026-08-18T18:30:00Z",
  count,
  evidence_class: stage === "delivered" ? "production_receiver_verified" : "private_operations_verified",
  supersedes_reference_id: null,
  ...overrides,
});

const completeInput = [
  stageReceipt("delivered", 20),
  stageReceipt("reviewed", 18),
  stageReceipt("qualified", 9),
  stageReceipt("opportunity", 6),
  stageReceipt("won", 2),
  stageReceipt("lost", 3),
  stageReceipt("revenue_reconciled_win", 2),
];
const receipts = importGeoCommercialOutcomeReceiptBatch(completeInput);
const chains = buildGeoCommercialOutcomeChains(receipts);
assert.equal(chains.length, 1);
const chain = chains[0];
assert.equal(chain.windowDays, 7);
assert.equal(chain.chainComplete, true);
assert.equal(chain.verifiedChainComplete, true);
assert.deepEqual(chain.missingStages, []);
assert.deepEqual(chain.integrityIssues, []);
assert.deepEqual(chain.evidenceIssues, []);
assert.equal(chain.conversions.deliveredToReviewed, 90);
assert.equal(chain.conversions.reviewedToQualified, 50);
assert.equal(chain.conversions.qualifiedToOpportunity, 66.7);
assert.equal(chain.conversions.opportunityToWon, 33.3);
assert.equal(chain.conversions.revenueReconciledWinCoverage, 100);

const ranking = buildGeoQualifiedDemandPrioritization(chains);
assert.equal(ranking.length, 1);
assert.equal(ranking[0].rank, 1);
assert.equal(ranking[0].qualified, 9);
assert.equal(ranking[0].wins, 2);

const unverifiedDelivery = buildGeoCommercialOutcomeChains(importGeoCommercialOutcomeReceiptBatch([
  ...completeInput.filter((item) => item.stage !== "delivered"),
  stageReceipt("delivered", 20, { reference_id: "outcome-delivery-handoff", evidence_class: "owner_provided_handoff" }),
]))[0];
assert.equal(unverifiedDelivery.chainComplete, true);
assert.equal(unverifiedDelivery.verifiedChainComplete, false);
assert.deepEqual(unverifiedDelivery.evidenceIssues, ["delivered_evidence_not_verified_for_stage"]);
assert.deepEqual(buildGeoQualifiedDemandPrioritization([unverifiedDelivery]), []);

const downstreamWithoutUpstream = buildGeoCommercialOutcomeChains(importGeoCommercialOutcomeReceiptBatch([
  stageReceipt("qualified", 4),
]))[0];
assert.ok(downstreamWithoutUpstream.integrityIssues.includes("qualified_without_reviewed_evidence"));
assert.equal(downstreamWithoutUpstream.conversions.reviewedToQualified, null);
assert.equal(downstreamWithoutUpstream.verifiedChainComplete, false);

const inversion = buildGeoCommercialOutcomeChains(importGeoCommercialOutcomeReceiptBatch([
  stageReceipt("delivered", 5),
  stageReceipt("reviewed", 6),
  stageReceipt("qualified", 4),
  stageReceipt("opportunity", 3),
  stageReceipt("won", 2),
  stageReceipt("lost", 2),
  stageReceipt("revenue_reconciled_win", 3),
]))[0];
assert.ok(inversion.integrityIssues.includes("reviewed_exceeds_delivered"));
assert.ok(inversion.integrityIssues.includes("won_plus_lost_exceeds_opportunity"));
assert.ok(inversion.integrityIssues.includes("reconciled_wins_exceed_wins"));
assert.equal(inversion.verifiedChainComplete, false);

const previousInput = completeInput.map((item) => ({
  ...item,
  reference_id: item.reference_id.replace("current", "previous"),
  start_date: "2026-08-05",
  end_date: "2026-08-11",
  count:
    item.stage === "delivered" ? 18 :
    item.stage === "reviewed" ? 15 :
    item.stage === "qualified" ? 7 :
    item.stage === "opportunity" ? 5 :
    item.stage === "won" ? 1 :
    item.stage === "lost" ? 3 : 1,
}));
const previous = buildGeoCommercialOutcomeChains(importGeoCommercialOutcomeReceiptBatch(previousInput))[0];
const trend = compareGeoCommercialOutcomeChains(chain, previous);
assert.equal(trend.state, "comparable");
assert.equal(trend.windowDays, 7);
assert.deepEqual(trend.deltas, {
  delivered: 2,
  reviewed: 3,
  qualified: 2,
  opportunity: 1,
  won: 1,
  lost: 0,
  revenueReconciledWin: 1,
});

const overlappingInput = previousInput.map((item) => ({ ...item, start_date: "2026-08-06", end_date: "2026-08-12" }));
const overlapping = buildGeoCommercialOutcomeChains(importGeoCommercialOutcomeReceiptBatch(overlappingInput))[0];
const notComparable = compareGeoCommercialOutcomeChains(chain, overlapping);
assert.equal(notComparable.state, "not_comparable");
assert.equal(notComparable.deltas, null);
assert.match(notComparable.reason, /adjacent exact 7d\/28d/);

const oldQualified = stageReceipt("qualified", 8, {
  reference_id: "qualified-old",
  observed_at: "2026-08-17T18:00:00Z",
});
const newQualified = stageReceipt("qualified", 9, {
  reference_id: "qualified-new",
  supersedes_reference_id: "qualified-old",
});
const superseded = importGeoCommercialOutcomeReceiptBatch([oldQualified, newQualified]);
const supersededChain = buildGeoCommercialOutcomeChains(superseded)[0];
assert.equal(supersededChain.counts.qualified, 9);

assert.throws(
  () => importGeoCommercialOutcomeReceiptBatch([
    oldQualified,
    { ...newQualified, canonical_owner: "/services/seo/" },
  ]),
  /preserve owner\/stage\/period/,
);
assert.throws(
  () => importGeoCommercialOutcomeReceiptBatch([{ ...stageReceipt("qualified", 1), email: "blocked@example.com" }]),
  /unsupported field: email/i,
);
assert.throws(
  () => importGeoCommercialOutcomeReceiptBatch([stageReceipt("qualified", -1)]),
  /count must be a non-negative integer/,
);
assert.ok(!JSON.stringify(chain).match(/revenue_value|amount|email|phone|lead_id/i));

console.log("GEO commercial outcome evidence contract passed");
