import assert from "node:assert/strict";
import {
  carrierEquipmentClusters,
  carrierProblemClusters,
  evaluateCarrierResearchRecord,
  vendorIntroductionBoundaries,
} from "../src/data/carrier-research-registry.ts";

assert.equal(carrierEquipmentClusters.length, 4);
assert.equal(new Set(carrierEquipmentClusters.map((item) => item.id)).size, 4);
assert.deepEqual(
  carrierEquipmentClusters.map((item) => item.id).sort(),
  ["enclosed_car_hauler", "hotshot_car_hauler", "multi_car_trailer", "open_car_hauler"],
);

for (const cluster of carrierEquipmentClusters) {
  assert.ok(cluster.label.trim().length > 0);
  assert.ok(cluster.requiredEvidence.length >= 4);
  assert.ok(cluster.requiredEvidence.every((item) => item.trim().length > 0));
  assert.ok(cluster.prohibitedAssumptions.length >= 3);
  assert.ok(cluster.prohibitedAssumptions.every((item) => item.trim().length > 0));
}

assert.equal(carrierProblemClusters.length, 5);
assert.equal(new Set(carrierProblemClusters.map((item) => item.id)).size, 5);
assert.deepEqual(
  carrierProblemClusters.map((item) => item.id).sort(),
  [
    "backhaul_deadhead",
    "direct_shipper_dealer_development",
    "documents_setup",
    "load_search",
    "rate_negotiation_support",
  ],
);

for (const cluster of carrierProblemClusters) {
  assert.ok(cluster.allowedSupport.length >= 3);
  assert.ok(cluster.requiredEvidence.length >= 3);
  assert.ok(cluster.prohibitedClaims.length >= 3);
}

assert.equal(vendorIntroductionBoundaries.length, 6);
assert.equal(new Set(vendorIntroductionBoundaries.map((item) => item.category)).size, 6);
for (const boundary of vendorIntroductionBoundaries) {
  assert.ok(boundary.allowedActivity.some((item) => /manual process/i.test(item)));
  assert.ok(boundary.providerControls.some((item) => /eligibility and approval/i.test(item)));
  assert.ok(boundary.prohibitedClaims.some((item) => /guaranteed approval/i.test(item)));
  assert.ok(boundary.prohibitedClaims.some((item) => /referral relationship/i.test(item)));
}

const baseRecord = {
  recordId: "fixture-carrier-research-001",
  sourceIds: ["fixture-approved-source-001"],
  reviewedAt: "2026-07-31",
  evidenceMode: "owner_approved_sanitized",
  equipmentCluster: "open_car_hauler",
  operatingStage: "active_owner_operator",
  problemClusters: ["load_search", "backhaul_deadhead"],
  language: "en",
  privacyReviewed: true,
  serviceScopeReviewed: true,
  laneCandidateId: "fixture-lane-candidate-001",
};

const eligible = evaluateCarrierResearchRecord(baseRecord);
assert.equal(eligible.status, "eligible_for_editorial_review");
assert.deepEqual(eligible.blockers, []);
assert.ok(eligible.limitations.some((item) => /not a carrier approval/i.test(item)));
assert.ok(eligible.limitations.some((item) => /never creates a public page/i.test(item)));

const synthetic = evaluateCarrierResearchRecord({
  ...baseRecord,
  recordId: "fixture-carrier-research-synthetic",
  evidenceMode: "synthetic",
  sourceIds: ["fixture-synthetic-source-001"],
});
assert.equal(synthetic.status, "research_only");
assert.ok(synthetic.blockers.includes("synthetic records cannot support public publication"));

const blocked = evaluateCarrierResearchRecord({
  ...baseRecord,
  recordId: "",
  sourceIds: [],
  reviewedAt: "31-07-2026",
  equipmentCluster: "unknown_equipment",
  problemClusters: [],
  language: "",
  privacyReviewed: false,
  serviceScopeReviewed: false,
});
assert.equal(blocked.status, "blocked_missing_evidence");
assert.ok(blocked.blockers.includes("recordId is required"));
assert.ok(blocked.blockers.includes("source provenance is required"));
assert.ok(blocked.blockers.includes("reviewedAt must use a valid YYYY-MM-DD date"));
assert.ok(blocked.blockers.includes("supported equipment cluster is required"));
assert.ok(blocked.blockers.includes("at least one carrier problem cluster is required"));
assert.ok(blocked.blockers.includes("language scope is required"));
assert.ok(blocked.blockers.includes("privacy review is required"));
assert.ok(blocked.blockers.includes("service-scope review is required"));

const unsupportedProblem = evaluateCarrierResearchRecord({
  ...baseRecord,
  problemClusters: ["guaranteed_revenue"],
});
assert.equal(unsupportedProblem.status, "blocked_missing_evidence");
assert.ok(unsupportedProblem.blockers.includes("unsupported carrier problem cluster"));

const publicDataShape = Object.keys(baseRecord);
for (const prohibitedField of [
  "name",
  "phone",
  "email",
  "company",
  "mc",
  "dot",
  "exactAddress",
  "vin",
  "orderId",
  "invoice",
  "bol",
  "pod",
  "notes",
  "rate",
  "commission",
  "livePosition",
  "credentials",
]) {
  assert.ok(!publicDataShape.includes(prohibitedField), `research record must not define ${prohibitedField}`);
}

for (const result of [eligible, synthetic, blocked, unsupportedProblem]) {
  assert.notEqual(result.status, "published");
  assert.notEqual(result.status, "approved_carrier");
}

console.log("carrier-research registry tests passed: provenance, equipment, problems, vendor boundaries, privacy, and no automatic publication.");
