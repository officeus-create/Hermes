import assert from "node:assert/strict";
import { geoCarHaulingAnswerCandidate } from "../src/data/geo-car-hauling-answer-candidate.ts";
import {
  auditGeoQuestionVariants,
  buildGeoAnswerEvidenceQualityAudit,
  importGeoPublicSourceReviews,
} from "../src/data/geo-answer-evidence-quality.ts";

const sourceReview = {
  evidence_id: "car-hauling-public-owner",
  url: "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
  reviewed_at: "2026-08-19T08:00:00Z",
  state: "approved",
};
const ownerExpectation = {
  surface_id: "geo-car-hauling-dispatch-owner-candidate",
  canonical_owner: "/logistics/car-hauling-dispatch/",
  audience: "U.S. car-hauling owner-operators and small fleets evaluating dispatch support",
  use_case: "commercial service understanding, fit evaluation, and next-step selection",
};

const withProviderRelation = structuredClone(geoCarHaulingAnswerCandidate);
withProviderRelation.relationships.push({
  id: "car-hauling-service-provider",
  fromEntityId: "car-hauling-dispatch-service",
  toEntityId: "hermes_ecosystem",
  relationship: "provided_by",
  truthLabel: "verified_fact",
  evidenceIds: ["car-hauling-public-owner"],
});

const readyAudit = buildGeoAnswerEvidenceQualityAudit(
  [withProviderRelation],
  [sourceReview],
  [ownerExpectation],
  "2026-08-19T12:00:00Z",
);
assert.deepEqual(readyAudit.entityIdentityConflicts, []);
assert.deepEqual(readyAudit.readyOwners, ["/logistics/car-hauling-dispatch/"]);
const readyOwner = readyAudit.surfaceAudits[0];
assert.equal(readyOwner.claimSourceCompletenessRate, 100);
assert.equal(readyOwner.entityClaimCoverageRate, 100);
assert.equal(readyOwner.evidenceFreshnessState, "fresh");
assert.deepEqual(readyOwner.sourceReviewIssues, []);
assert.deepEqual(readyOwner.semanticParityIssues, []);
assert.deepEqual(readyOwner.serviceOrganizationIssues, []);
assert.equal(readyOwner.evidenceReady, true);
assert.equal(readyOwner.structureReady, true);
assert.equal(readyOwner.ready, true);

const existingDirectionAudit = buildGeoAnswerEvidenceQualityAudit(
  [geoCarHaulingAnswerCandidate],
  [sourceReview],
  [ownerExpectation],
  "2026-08-19T12:00:00Z",
);
assert.deepEqual(existingDirectionAudit.surfaceAudits[0].serviceOrganizationIssues, ["car-hauling-dispatch-service"]);
assert.equal(existingDirectionAudit.surfaceAudits[0].evidenceReady, true);
assert.equal(existingDirectionAudit.surfaceAudits[0].structureReady, false);
assert.equal(existingDirectionAudit.surfaceAudits[0].ready, false, "Structure alone cannot be silently treated as ready when provider relationship direction is incomplete");

const heldSourceAudit = buildGeoAnswerEvidenceQualityAudit(
  [withProviderRelation],
  [{ ...sourceReview, state: "hold" }],
  [ownerExpectation],
  "2026-08-19T12:00:00Z",
);
assert.equal(heldSourceAudit.surfaceAudits[0].structureReady, true);
assert.equal(heldSourceAudit.surfaceAudits[0].evidenceReady, false);
assert.equal(heldSourceAudit.surfaceAudits[0].ready, false, "A structurally clean owner must remain blocked when evidence is held");
assert.ok(heldSourceAudit.surfaceAudits[0].remediation[0].type === "evidence");

const staleSurface = structuredClone(withProviderRelation);
staleSurface.evidence[0].verifiedAt = "2026-01-01T00:00:00Z";
const staleAudit = buildGeoAnswerEvidenceQualityAudit(
  [staleSurface],
  [sourceReview],
  [ownerExpectation],
  "2026-08-19T12:00:00Z",
);
assert.equal(staleAudit.surfaceAudits[0].evidenceFreshnessState, "stale");
assert.equal(staleAudit.surfaceAudits[0].ready, false);

const heldEntitySurface = structuredClone(withProviderRelation);
heldEntitySurface.entities.push({
  id: "progressopro_marketing",
  name: "ProgressoPro",
  type: "organization",
  description: "Held relationship test entity.",
  relationToHermes: "Relationship unresolved.",
  whyItMatters: "A held entity must not leak into publishable GEO schema.",
  truthLabel: "verified_fact",
  evidenceIds: ["car-hauling-public-owner"],
});
heldEntitySurface.relationships.push({
  id: "held-entity-test-edge",
  fromEntityId: "car-hauling-dispatch-service",
  toEntityId: "progressopro_marketing",
  relationship: "test_held_relationship",
  truthLabel: "verified_fact",
  evidenceIds: ["car-hauling-public-owner"],
});
const heldEntityAudit = buildGeoAnswerEvidenceQualityAudit(
  [heldEntitySurface],
  [sourceReview],
  [ownerExpectation],
  "2026-08-19T12:00:00Z",
);
assert.deepEqual(heldEntityAudit.surfaceAudits[0].heldEntityLeaks, ["progressopro_marketing"]);
assert.equal(heldEntityAudit.surfaceAudits[0].ready, false);

const ownerMismatchAudit = buildGeoAnswerEvidenceQualityAudit(
  [withProviderRelation],
  [sourceReview],
  [{ ...ownerExpectation, canonical_owner: "/services/seo/" }],
  "2026-08-19T12:00:00Z",
);
assert.ok(ownerMismatchAudit.surfaceAudits[0].ownerIssues.includes("canonical_owner_mismatch"));
assert.equal(ownerMismatchAudit.surfaceAudits[0].ready, false);

const unusedEvidenceSurface = structuredClone(withProviderRelation);
unusedEvidenceSurface.evidence.push({
  id: "unused-demo-evidence",
  title: "Unused demo evidence",
  sourceName: "Demo",
  origin: "demo",
  truthLabel: "demo",
  summary: "Deliberately unused evidence for diagnostic coverage.",
});
const unusedAudit = buildGeoAnswerEvidenceQualityAudit(
  [unusedEvidenceSurface],
  [sourceReview],
  [ownerExpectation],
  "2026-08-19T12:00:00Z",
);
assert.deepEqual(unusedAudit.surfaceAudits[0].unusedEvidenceIds, ["unused-demo-evidence"]);

const identityConflictSurface = structuredClone(withProviderRelation);
identityConflictSurface.id = "geo-car-hauling-conflict-candidate";
identityConflictSurface.slug = "/demos/geo-car-hauling-conflict/";
identityConflictSurface.entities[0].name = "Different Hermes Name";
const identityAudit = buildGeoAnswerEvidenceQualityAudit(
  [withProviderRelation, identityConflictSurface],
  [sourceReview],
  [ownerExpectation, {
    surface_id: identityConflictSurface.id,
    canonical_owner: identityConflictSurface.slug,
    audience: identityConflictSurface.audience,
    use_case: identityConflictSurface.intent,
  }],
  "2026-08-19T12:00:00Z",
);
assert.ok(identityAudit.entityIdentityConflicts.includes("https://hermeslogisticsus.com/#organization"));

const variants = auditGeoQuestionVariants([
  { canonical_owner: "/services/seo/", question_id: "question-1", question: "What is SEO?", answer_fingerprint: "answer-same" },
  { canonical_owner: "/services/seo/", question_id: "question-2", question: "What is SEO", answer_fingerprint: "answer-same" },
  { canonical_owner: "/services/seo/", question_id: "question-3", question: "How does SEO work?", answer_fingerprint: "answer-a" },
  { canonical_owner: "/services/seo/", question_id: "question-4", question: "How does SEO work", answer_fingerprint: "answer-b" },
]);
assert.equal(variants.duplicates.length, 1);
assert.equal(variants.conflicts.length, 1);

assert.throws(() => importGeoPublicSourceReviews([{ ...sourceReview, account_id: "blocked" }]), /unsupported field: account_id/i);
assert.throws(() => importGeoPublicSourceReviews([{ ...sourceReview, url: "http://example.com" }]), /must be https/i);

console.log("GEO answer evidence quality contract passed");
