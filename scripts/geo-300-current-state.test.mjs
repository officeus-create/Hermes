import assert from "node:assert/strict";
import {
  applyExactHeadCiEvidence,
  auditGeoFourDirectionAlignment,
  auditGeoPageExpansionCandidates,
  buildGeo300ClosureState,
  buildGeo300CurrentState,
  buildGeoNextHighestValueBacklog,
  geo300ImplementedPackages,
  geo300KnownExternalGaps,
} from "../src/data/geo-300-current-state.ts";

assert.equal(geo300ImplementedPackages.length, 9);
assert.deepEqual(geo300ImplementedPackages.map((item) => item.range), [
  "201–210", "211–220", "221–230", "231–240", "241–250", "251–260", "261–270", "271–280", "281–290",
]);
assert.ok(geo300ImplementedPackages.every((item) => item.state === "implemented_not_verified"));
assert.ok(geo300ImplementedPackages.every((item) => item.visualChange === false));

const first = geo300ImplementedPackages[0];
const queued = applyExactHeadCiEvidence(geo300ImplementedPackages, [{
  headSha: first.headSha,
  state: "queued",
  workflowRunId: 1,
  build: "pending",
  unit: "pending",
  e2e: "pending",
}]);
assert.equal(queued[0].state, "implemented_not_verified", "queued CI must never become verified");
const wrongHead = applyExactHeadCiEvidence(geo300ImplementedPackages, [{
  headSha: "0000000000000000000000000000000000000000",
  state: "success",
  workflowRunId: 2,
  build: "success",
  unit: "success",
  e2e: "success",
}]);
assert.equal(wrongHead[0].state, "implemented_not_verified", "a success on a different SHA must not verify the package");
const success = applyExactHeadCiEvidence(geo300ImplementedPackages, [{
  headSha: first.headSha,
  state: "success",
  workflowRunId: 3,
  build: "success",
  unit: "success",
  e2e: "success",
}]);
assert.equal(success[0].state, "ci_verified");

const directions = auditGeoFourDirectionAlignment();
assert.equal(directions.ready, true);
assert.equal(directions.directionCount, 4);
assert.deepEqual(directions.directions, ["academy", "logistics", "marketing", "technology"]);

const pageAudit = auditGeoPageExpansionCandidates([
  {
    path: "/logistics/example-city/",
    dimension: "location",
    distinctIntentEvidence: false,
    distinctFirstPartyEvidence: false,
    canonicalOwnerConflict: false,
    proposedCount: 50,
  },
  {
    path: "/resources/single-reviewed-answer/",
    dimension: "answer",
    distinctIntentEvidence: true,
    distinctFirstPartyEvidence: true,
    canonicalOwnerConflict: false,
    proposedCount: 1,
  },
]);
assert.equal(pageAudit[0].publishable, false);
assert.ok(pageAudit[0].gaps.includes("bulk_location_equipment_lane_factory_blocked"));
assert.ok(pageAudit[0].gaps.includes("distinct_intent_evidence_missing"));
assert.equal(pageAudit[1].publishable, true);
assert.match(pageAudit[0].rule, /No location\/equipment\/lane page factory/);

const backlog = buildGeoNextHighestValueBacklog();
assert.ok(backlog.length > 0);
assert.equal(backlog[0].key, "us_owner_level_gsc");
assert.ok(backlog.findIndex((item) => item.key === "ga4_exact_once") < backlog.findIndex((item) => item.key === "manual_ai_review_wave"));

const current = buildGeo300CurrentState({
  packageCiEvidence: [],
  currentHeadCi: {
    headSha: "current-head",
    state: "queued",
    workflowRunId: 99,
    build: "pending",
    unit: "pending",
    e2e: "pending",
  },
});
assert.equal(current.closure.state, "blocked_at_ci");
assert.equal(current.closure.closeIssue, false);
assert.deepEqual(current.implementation.verifiedRanges, []);
assert.equal(current.fourDirections.ready, true);
assert.equal(current.materialVisualQueueRefs.length, 0);

const allVerified = geo300ImplementedPackages.map((item) => ({ ...item, state: "ci_verified" }));
const externalOpen = buildGeo300ClosureState({
  packages: allVerified,
  currentHeadCi: {
    headSha: "current-head",
    state: "success",
    workflowRunId: 100,
    build: "success",
    unit: "success",
    e2e: "success",
  },
  externalGaps: geo300KnownExternalGaps,
  materialVisualQueueRefs: [],
});
assert.equal(externalOpen.state, "engineering_verified_external_evidence_open");
assert.equal(externalOpen.closeIssue, false);
assert.ok(externalOpen.openExternal.length > 0);

const visualOpen = buildGeo300ClosureState({
  packages: allVerified,
  currentHeadCi: {
    headSha: "current-head",
    state: "success",
    workflowRunId: 101,
    build: "success",
    unit: "success",
    e2e: "success",
  },
  externalGaps: geo300KnownExternalGaps.map((gap) => ({ ...gap, status: "complete" })),
  materialVisualQueueRefs: ["V-001"],
});
assert.equal(visualOpen.state, "engineering_and_external_verified_visual_decisions_open");
assert.equal(visualOpen.closeIssue, false);

const closable = buildGeo300ClosureState({
  packages: allVerified,
  currentHeadCi: {
    headSha: "current-head",
    state: "success",
    workflowRunId: 102,
    build: "success",
    unit: "success",
    e2e: "success",
  },
  externalGaps: geo300KnownExternalGaps.map((gap) => ({ ...gap, status: "complete" })),
  materialVisualQueueRefs: [],
});
assert.equal(closable.state, "ready_to_close");
assert.equal(closable.closeIssue, true);

console.log("GEO-300 current-state operating loop passed");
