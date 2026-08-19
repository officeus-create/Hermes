import assert from "node:assert/strict";
import { geoCarHaulingAnswerCandidate } from "../src/data/geo-car-hauling-answer-candidate.ts";
import {
  assertGeoEntitySchemaFailClosed,
  auditGeoAnswerSchemaParity,
  auditGeoCrossOwnerQuestionCollisions,
  auditGeoEvidenceEdges,
  auditGeoPublicEntityPublicationState,
  auditGeoSameAsLeakage,
  auditGeoSchemaIdentityConflicts,
  auditGeoSchemaProvenanceRules,
  auditGeoServiceProviderRelationships,
} from "../src/data/geo-entity-schema-operations.ts";

const publication = auditGeoPublicEntityPublicationState();
assert.equal(publication.expectedApprovedSatisfied, true);
assert.equal(publication.heldRemainHeld, true);
assert.deepEqual(publication.approved.sort(), ["hermes_academy", "hermes_ecosystem"].sort());
assert.ok(publication.held.includes("hermes_logistics"));
assert.ok(publication.held.includes("progressopro_marketing"));
assert.ok(publication.held.includes("hermes_it"));

assert.deepEqual(auditGeoSameAsLeakage([geoCarHaulingAnswerCandidate]), { ready: true, issues: [] });
const leakedRoot = {
  ...geoCarHaulingAnswerCandidate,
  id: "geo-car-leaked-sameas",
  entities: geoCarHaulingAnswerCandidate.entities.map((entity) => entity.id === "hermes_ecosystem"
    ? { ...entity, sameAs: [...(entity.sameAs ?? []), "https://www.instagram.com/progressopro/"] }
    : entity),
};
const sameAsLeak = auditGeoSameAsLeakage([leakedRoot]);
assert.equal(sameAsLeak.ready, false);
assert.ok(sameAsLeak.issues.some((issue) => issue.includes("held_profile_sameAs")));

const providerAudit = auditGeoServiceProviderRelationships([
  {
    owner: "/logistics/car-hauling-dispatch/",
    serviceId: "car-hauling-dispatch-service",
    providerEntityId: "hermes_ecosystem",
    relationshipDirection: "provider_provides_service",
    evidenceReference: "repo:geo-car-hauling-answer-candidate",
  },
  {
    owner: "/services/seo-for-logistics-companies/",
    serviceId: "logistics-seo-service",
    providerEntityId: "hermes_ecosystem",
    relationshipDirection: "service_provided_by_provider",
    evidenceReference: "repo:DigitalServicePage.serviceSchema",
  },
  {
    owner: "/paths/academy/",
    serviceId: "hermes-academy-programs",
    providerEntityId: "hermes_academy",
    relationshipDirection: "provider_provides_service",
    evidenceReference: "repo:academy-public-entity",
  },
]);
assert.equal(providerAudit.ready, true);
const heldProvider = auditGeoServiceProviderRelationships([
  {
    owner: "/services/seo-for-logistics-companies/",
    serviceId: "logistics-seo-service",
    providerEntityId: "progressopro_marketing",
    relationshipDirection: "provider_provides_service",
    evidenceReference: "unapproved-provider-test",
  },
]);
assert.equal(heldProvider.ready, false);
assert.ok(heldProvider.issues.some((issue) => issue.includes("held_provider:progressopro_marketing")));

const parity = auditGeoAnswerSchemaParity(geoCarHaulingAnswerCandidate);
assert.equal(parity.ready, true);
assert.deepEqual(parity.issues, []);

const edges = auditGeoEvidenceEdges(geoCarHaulingAnswerCandidate, "2026-08-19T12:00:00Z");
assert.equal(edges.ready, true);
assert.deepEqual(edges.orphanReferences, []);
assert.deepEqual(edges.unusedEvidence, []);
assert.deepEqual(edges.staleOrUndated, []);
const staleEdges = auditGeoEvidenceEdges(geoCarHaulingAnswerCandidate, "2027-01-01T12:00:00Z", 90);
assert.equal(staleEdges.ready, false);
assert.ok(staleEdges.staleOrUndated.includes("car-hauling-public-owner"));

const distinctQuestion = {
  ...geoCarHaulingAnswerCandidate,
  id: "geo-car-hauling-distinct-question",
  slug: "/logistics/resources/car-hauling-example/",
  question: "How should a carrier compare car-hauling support models?",
};
assert.deepEqual(auditGeoCrossOwnerQuestionCollisions([geoCarHaulingAnswerCandidate, distinctQuestion]), { ready: true, collisions: [] });
const questionCollision = auditGeoCrossOwnerQuestionCollisions([
  geoCarHaulingAnswerCandidate,
  { ...distinctQuestion, question: geoCarHaulingAnswerCandidate.question },
]);
assert.equal(questionCollision.ready, false);
assert.equal(questionCollision.collisions.length, 1);
assert.equal(questionCollision.collisions[0].owners.length, 2);

assert.deepEqual(auditGeoSchemaIdentityConflicts([geoCarHaulingAnswerCandidate]), { ready: true, conflicts: [] });
const identityConflictSurface = {
  ...distinctQuestion,
  entities: distinctQuestion.entities.map((entity) => entity.id === "car-hauling-dispatch-service"
    ? { ...entity, name: "Conflicting service identity name" }
    : entity),
};
const identityConflict = auditGeoSchemaIdentityConflicts([geoCarHaulingAnswerCandidate, identityConflictSurface]);
assert.equal(identityConflict.ready, false);
assert.ok(identityConflict.conflicts.some((item) => item.schemaId === "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/#service"));

const provenance = auditGeoSchemaProvenanceRules(geoCarHaulingAnswerCandidate);
assert.equal(provenance.ready, true);
assert.deepEqual(provenance.nonPublicEvidenceLeaks, []);
assert.deepEqual(provenance.demoOrSimulatedEntities, []);

const failClosedPass = assertGeoEntitySchemaFailClosed({
  surfaces: [geoCarHaulingAnswerCandidate],
  sourceReviewStates: { "car-hauling-public-owner": "approved" },
  asOf: "2026-08-19T12:00:00Z",
});
assert.equal(failClosedPass.ready, true);
assert.deepEqual(failClosedPass.blockers, []);
const heldSource = assertGeoEntitySchemaFailClosed({
  surfaces: [geoCarHaulingAnswerCandidate],
  sourceReviewStates: { "car-hauling-public-owner": "hold" },
  asOf: "2026-08-19T12:00:00Z",
});
assert.equal(heldSource.ready, false);
assert.ok(heldSource.blockers.some((item) => item.includes("source_hold:car-hauling-public-owner")));

console.log("GEO entity/schema fail-closed operations passed");
