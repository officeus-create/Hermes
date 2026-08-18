import assert from "node:assert/strict";
import {
  buildGeoAnswerOwnerAudit,
  buildGeoAnswerOwnerRemediation,
  checkGeoAnswerSchemaSemanticParity,
  detectReviewedPromptIntentOwnerConflicts,
  geoProductionAnswerCandidates,
  geoReviewedPromptFactCoverage,
} from "../src/data/geo-answer-owner-audit.ts";
import { geoCarHaulingAnswerCandidate } from "../src/data/geo-car-hauling-answer-candidate.ts";
import { geoPromptOwnerRegistry } from "../src/data/geo-prompt-owner-registry.ts";

const audit = buildGeoAnswerOwnerAudit();
assert.equal(audit.length, geoPromptOwnerRegistry.length);

const carHauling = audit.find((item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/");
assert.ok(carHauling);
assert.equal(carHauling.surfaceId, geoCarHaulingAnswerCandidate.id);
assert.equal(carHauling.surfacePresent, true);
assert.equal(carHauling.surfaceValid, true);
assert.equal(carHauling.expectedFactCoverageRate, 100);
assert.equal(carHauling.prohibitedClaimCoverageRate, 100);
assert.equal(carHauling.entityDefinitionsComplete, true);
assert.equal(carHauling.evidenceSourceModuleComplete, true);
assert.equal(carHauling.conciseAnswerComplete, true);
assert.equal(carHauling.longFormSupportComplete, true);
assert.equal(carHauling.schemaSemanticParityComplete, true);
assert.equal(carHauling.evidenceGapCount, 0);
assert.deepEqual(carHauling.gaps, []);
assert.equal(checkGeoAnswerSchemaSemanticParity(geoCarHaulingAnswerCandidate), true);

const missingOwner = audit.find((item) => item.canonicalOwner === "/logistics/resources/new-authority-car-hauler-readiness-checklist/");
assert.ok(missingOwner);
assert.equal(missingOwner.surfacePresent, false);
assert.ok(missingOwner.gaps.includes("answer_surface_missing"));
assert.ok(missingOwner.gaps.includes("expected_fact_review_missing"));
assert.ok(missingOwner.gaps.includes("evidence_source_module_incomplete"));
assert.ok(missingOwner.gaps.includes("question_answer_surface_incomplete"));

const remediation = buildGeoAnswerOwnerRemediation(audit);
assert.ok(remediation.length > 0);
assert.ok(remediation[0].evidenceGapCount >= remediation.at(-1).evidenceGapCount);
assert.match(remediation[0].priorityReason, /Evidence\/review gaps/);
assert.ok(!remediation.some((item) => item.canonicalOwner === "/logistics/car-hauling-dispatch/"));

const conflicts = detectReviewedPromptIntentOwnerConflicts([
  {
    promptId: "LOG-01",
    intentGroupKey: "REVIEWED_DISPATCH_INTENT",
    canonicalOwner: "/logistics/car-hauling-dispatch/",
  },
  {
    promptId: "LOG-02",
    intentGroupKey: "REVIEWED_DISPATCH_INTENT",
    canonicalOwner: "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  },
]);
assert.equal(conflicts.length, 1);
assert.equal(conflicts[0].intentGroupKey, "REVIEWED_DISPATCH_INTENT");
assert.deepEqual(conflicts[0].promptIds, ["LOG-01", "LOG-02"]);
assert.equal(conflicts[0].canonicalOwners.length, 2);

assert.deepEqual(
  detectReviewedPromptIntentOwnerConflicts([
    {
      promptId: "LOG-01",
      intentGroupKey: "CAR_HAUL_SUPPORT",
      canonicalOwner: "/logistics/car-hauling-dispatch/",
    },
  ]),
  [],
);

assert.throws(
  () => detectReviewedPromptIntentOwnerConflicts([
    {
      promptId: "LOG-01",
      intentGroupKey: "raw intent group",
      canonicalOwner: "/logistics/car-hauling-dispatch/",
    },
  ]),
  /opaque reviewed identifier/,
);
assert.throws(
  () => detectReviewedPromptIntentOwnerConflicts([
    {
      promptId: "LOG-01",
      intentGroupKey: "CAR_HAUL_SUPPORT",
      canonicalOwner: "/services/seo/",
    },
  ]),
  /must match prompt registry owner/,
);

const invalidFactReview = structuredClone(geoReviewedPromptFactCoverage);
invalidFactReview[0].coveredExpectedFacts.push("Invented expected fact");
assert.throws(
  () => buildGeoAnswerOwnerAudit({
    surfaces: geoProductionAnswerCandidates,
    factCoverage: invalidFactReview,
  }),
  /not registered for LOG-01/,
);

const duplicateSurface = structuredClone(geoCarHaulingAnswerCandidate);
duplicateSurface.id = "duplicate-surface-id";
assert.throws(
  () => buildGeoAnswerOwnerAudit({
    surfaces: [geoCarHaulingAnswerCandidate, duplicateSurface],
    factCoverage: geoReviewedPromptFactCoverage,
  }),
  /Only one reviewed answer surface may own a canonical slug/,
);

const serialized = JSON.stringify({ audit, remediation }).toLowerCase();
for (const prohibited of ["email", "phone", "raw_response", "conversation", "account_id", "token", "cookie"]) {
  assert.ok(!serialized.includes(`\"${prohibited}\"`));
}

console.log("GEO canonical owner answer audit passed");
