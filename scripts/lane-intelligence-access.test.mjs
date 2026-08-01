import assert from "node:assert/strict";
import {
  LANE_INTELLIGENCE_AUTHENTICATION_IMPLEMENTED,
  LANE_INTELLIGENCE_PRODUCTION_DATA_ENABLED,
  LANE_INTELLIGENCE_REAL_CONNECTORS_ENABLED,
  evaluateLaneIntelligenceAccess,
  validateSanitizedLaneRecord,
} from "../src/lib/lane-intelligence-access.ts";

assert.equal(LANE_INTELLIGENCE_AUTHENTICATION_IMPLEMENTED, false);
assert.equal(LANE_INTELLIGENCE_PRODUCTION_DATA_ENABLED, false);
assert.equal(LANE_INTELLIGENCE_REAL_CONNECTORS_ENABLED, false);

const publicSynthetic = evaluateLaneIntelligenceAccess({
  surface: "public_demo",
  datasetClass: "synthetic",
  role: "anonymous",
  capability: "read_only",
});
assert.equal(publicSynthetic.allowed, true);
assert.equal(publicSynthetic.externalActionPerformed, false);

const publicSanitized = evaluateLaneIntelligenceAccess({
  surface: "public_demo",
  datasetClass: "owner_approved_sanitized",
  role: "anonymous",
  capability: "read_only",
});
assert.equal(publicSanitized.allowed, false);
assert.match(publicSanitized.reason, /synthetic data only/i);

const publicWrite = evaluateLaneIntelligenceAccess({
  surface: "public_demo",
  datasetClass: "synthetic",
  role: "anonymous",
  capability: "write",
});
assert.equal(publicWrite.allowed, false);
assert.match(publicWrite.reason, /writes are disabled/i);

const internalDispatcher = evaluateLaneIntelligenceAccess({
  surface: "internal_workspace",
  datasetClass: "owner_approved_sanitized",
  role: "dispatcher",
  capability: "read_only",
  authenticated: true,
  sourceApproved: true,
  subjectScopeMatched: true,
});
assert.equal(internalDispatcher.allowed, false);
assert.match(internalDispatcher.reason, /authentication is implemented and reviewed/i);

const safeRecord = {
  laneId: "SYN-LANE-001",
  originRegion: "Chicago metro, IL",
  destinationRegion: "Nashville metro, TN",
  equipmentClass: "car_hauler_open",
  periodStart: "2026-01-01",
  periodEnd: "2026-06-30",
  completedShipmentCount: 12,
  medianLoadedMiles: 486,
  medianDeadheadMiles: 34,
  publicationStatus: "research_only",
  provenance: {
    sourceType: "synthetic",
    sourceDate: "2026-07-31",
    reviewDate: "2026-07-31",
  },
};

const safeValidation = validateSanitizedLaneRecord(safeRecord);
assert.equal(safeValidation.valid, true);
assert.deepEqual(safeValidation.errors, []);
assert.equal(safeValidation.value?.laneId, "SYN-LANE-001");
assert.equal(Object.isFrozen(safeValidation.value), true);
assert.equal(Object.isFrozen(safeValidation.value?.provenance), true);

const forbiddenValidation = validateSanitizedLaneRecord({
  ...safeRecord,
  carrier_name: "PRIVATE CARRIER",
  exact_address: "PRIVATE ADDRESS",
  booked_rate: 9999,
});
assert.equal(forbiddenValidation.valid, false);
assert.equal(forbiddenValidation.value, undefined);
assert.match(forbiddenValidation.errors.join(" | "), /carrier_name/);
assert.match(forbiddenValidation.errors.join(" | "), /exact_address/);
assert.match(forbiddenValidation.errors.join(" | "), /booked_rate/);
assert.equal(forbiddenValidation.errors.join(" | ").includes("PRIVATE CARRIER"), false);
assert.equal(forbiddenValidation.errors.join(" | ").includes("PRIVATE ADDRESS"), false);
assert.equal(forbiddenValidation.errors.join(" | ").includes("9999"), false);

const missingProvenance = validateSanitizedLaneRecord({
  ...safeRecord,
  provenance: undefined,
});
assert.equal(missingProvenance.valid, false);
assert.match(missingProvenance.errors.join(" | "), /provenance is required/);

console.log("Lane Intelligence authorization and sanitized-contract checks passed.");
