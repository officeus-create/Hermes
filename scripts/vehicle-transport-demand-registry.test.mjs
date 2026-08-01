import assert from "node:assert/strict";
import {
  evaluateVehicleTransportDemand,
  vehicleTransportDemandIntents,
} from "../src/data/vehicle-transport-demand-registry.ts";

assert.equal(vehicleTransportDemandIntents.length, 9);
assert.equal(new Set(vehicleTransportDemandIntents.map((intent) => intent.id)).size, 9);
assert.deepEqual(
  vehicleTransportDemandIntents.map((intent) => intent.id).sort(),
  [
    "auction_pickup",
    "broker_opportunity",
    "classic_luxury_vehicle",
    "dealer_group_relocation",
    "independent_dealer_transport",
    "port_storage_pickup",
    "private_customer",
    "recurring_volume_shipper",
    "remarketing_volume",
  ],
);

for (const intent of vehicleTransportDemandIntents) {
  assert.ok(intent.label.trim().length > 0);
  assert.ok(intent.requiredEvidence.length >= 4);
  assert.ok(intent.allowedScope.length >= 3);
  assert.ok(intent.prohibitedClaims.length >= 3);
}

const portIntent = vehicleTransportDemandIntents.find((intent) => intent.id === "port_storage_pickup");
assert.ok(portIntent.prohibitedClaims.some((claim) => /warehousing or storage/i.test(claim)));
assert.ok(portIntent.prohibitedClaims.some((claim) => /owns or operates/i.test(claim)));

const privateIntent = vehicleTransportDemandIntents.find((intent) => intent.id === "private_customer");
assert.ok(privateIntent.prohibitedClaims.some((claim) => /submission creates a booking/i.test(claim)));
assert.ok(privateIntent.prohibitedClaims.some((claim) => /guaranteed carrier or rate/i.test(claim)));

const recurringIntent = vehicleTransportDemandIntents.find((intent) => intent.id === "recurring_volume_shipper");
assert.ok(recurringIntent.requiredEvidence.some((item) => /evidence before classification/i.test(item)));
assert.ok(recurringIntent.prohibitedClaims.some((claim) => /guaranteed volume/i.test(claim)));

const baseRecord = {
  recordId: "fixture-demand-001",
  sourceIds: ["fixture-demand-source-001"],
  reviewedAt: "2026-07-31",
  evidenceMode: "owner_approved_sanitized",
  intent: "independent_dealer_transport",
  laneCandidateId: "fixture-verified-lane-001",
  carrierLaneEvidenceStatus: "verified",
  originCity: "Sample Origin",
  originState: "WI",
  destinationCity: "Sample Destination",
  destinationState: "IL",
  equipmentRequirement: "open",
  operableStatus: "operable",
  recurringPotential: "one_time",
  demandEvidenceReviewed: true,
  privacyReviewed: true,
};

const eligible = evaluateVehicleTransportDemand(baseRecord);
assert.equal(eligible.status, "eligible_for_editorial_review");
assert.deepEqual(eligible.blockers, []);
assert.ok(eligible.limitations.some((item) => /not a shipment, booking/i.test(item)));
assert.ok(eligible.limitations.some((item) => /does not prove live capacity/i.test(item)));

const synthetic = evaluateVehicleTransportDemand({
  ...baseRecord,
  recordId: "fixture-demand-synthetic",
  sourceIds: ["fixture-synthetic-demand-source"],
  evidenceMode: "synthetic",
});
assert.equal(synthetic.status, "research_only");
assert.ok(synthetic.blockers.includes("synthetic demand records cannot support public publication"));

for (const carrierLaneEvidenceStatus of ["missing", "research_only"]) {
  const unverifiedLane = evaluateVehicleTransportDemand({
    ...baseRecord,
    carrierLaneEvidenceStatus,
  });
  assert.equal(unverifiedLane.status, "blocked_missing_evidence");
  assert.ok(unverifiedLane.blockers.includes("demand may link only to verified carrier-lane evidence"));
}

const blocked = evaluateVehicleTransportDemand({
  ...baseRecord,
  recordId: "",
  sourceIds: [],
  reviewedAt: "31-07-2026",
  intent: "guaranteed_demand",
  laneCandidateId: "",
  carrierLaneEvidenceStatus: "missing",
  originCity: "",
  originState: "Wisconsin",
  destinationCity: "",
  destinationState: "Illinois",
  demandEvidenceReviewed: false,
  privacyReviewed: false,
});
assert.equal(blocked.status, "blocked_missing_evidence");
assert.ok(blocked.blockers.includes("recordId is required"));
assert.ok(blocked.blockers.includes("demand provenance is required"));
assert.ok(blocked.blockers.includes("reviewedAt must use a valid YYYY-MM-DD date"));
assert.ok(blocked.blockers.includes("supported demand intent is required"));
assert.ok(blocked.blockers.includes("sanitized lane candidate reference is required"));
assert.ok(blocked.blockers.includes("demand may link only to verified carrier-lane evidence"));
assert.ok(blocked.blockers.includes("normalized origin city/state is required"));
assert.ok(blocked.blockers.includes("normalized destination city/state is required"));
assert.ok(blocked.blockers.includes("dated demand evidence review is required"));
assert.ok(blocked.blockers.includes("privacy review is required"));

const recordFields = Object.keys(baseRecord);
for (const prohibitedField of [
  "name",
  "phone",
  "email",
  "company",
  "mc",
  "dot",
  "exactAddress",
  "vin",
  "gateCode",
  "accountNumber",
  "orderId",
  "invoice",
  "bol",
  "pod",
  "notes",
  "rate",
  "commission",
  "customerIdentity",
  "carrierIdentity",
  "livePosition",
  "credentials",
]) {
  assert.ok(!recordFields.includes(prohibitedField), `demand record must not define ${prohibitedField}`);
}

for (const result of [eligible, synthetic, blocked]) {
  assert.notEqual(result.status, "published");
  assert.notEqual(result.status, "capacity_confirmed");
  assert.notEqual(result.status, "booked");
}

console.log("vehicle-transport demand registry tests passed: verified-lane linking, nine intents, privacy, no warehousing claims, and no automatic publication.");
