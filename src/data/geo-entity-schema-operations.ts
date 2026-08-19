import {
  approvedHermesSameAs,
  heldCrossEntityProfiles,
  publicEntityRegistry,
  type PublicEntityId,
} from "./public-entity-registry.ts";
import { buildGeoAnswerSchema, validateGeoAnswerSurface, type GeoAnswerSurface } from "./geo-answer-contract.ts";

export const auditGeoPublicEntityPublicationState = () => {
  const rows = Object.values(publicEntityRegistry).map((entity) => ({
    entityId: entity.id,
    publicName: entity.publicName,
    publication: entity.schemaPublication,
    relationshipStatus: entity.relationshipStatus,
  }));
  const approved = rows.filter((row) => row.publication === "approved").map((row) => row.entityId).sort();
  const held = rows.filter((row) => row.publication === "hold").map((row) => row.entityId).sort();
  return {
    rows,
    approved,
    held,
    expectedApprovedSatisfied: approved.includes("hermes_ecosystem") && approved.includes("hermes_academy"),
    heldRemainHeld:
      held.includes("hermes_logistics") &&
      held.includes("progressopro_marketing") &&
      held.includes("hermes_it"),
  };
};

export const auditGeoSameAsLeakage = (surfaces: GeoAnswerSurface[]) => {
  const heldProfileUrls = new Set(heldCrossEntityProfiles.map((profile) => profile.url));
  const issues: string[] = [];
  for (const surface of surfaces) {
    validateGeoAnswerSurface(surface);
    for (const entity of surface.entities) {
      for (const sameAs of entity.sameAs ?? []) {
        if (heldProfileUrls.has(sameAs)) issues.push(`${surface.slug}:${entity.id}:held_profile_sameAs:${sameAs}`);
        if (entity.id === "hermes_ecosystem" && !approvedHermesSameAs.includes(sameAs)) {
          issues.push(`${surface.slug}:${entity.id}:unapproved_root_sameAs:${sameAs}`);
        }
      }
    }
  }
  return { ready: issues.length === 0, issues: issues.sort() };
};

export interface GeoServiceProviderRelationshipSignature {
  owner: string;
  serviceId: string;
  providerEntityId: PublicEntityId;
  relationshipDirection: "provider_provides_service" | "service_provided_by_provider";
  evidenceReference: string;
}

export const auditGeoServiceProviderRelationships = (rows: GeoServiceProviderRelationshipSignature[]) => {
  const issues: string[] = [];
  for (const row of rows) {
    const provider = publicEntityRegistry[row.providerEntityId];
    if (!row.owner.startsWith("/") || !row.serviceId.trim() || !row.evidenceReference.trim()) issues.push(`${row.owner}:invalid_relationship_signature`);
    if (provider.schemaPublication !== "approved") issues.push(`${row.owner}:held_provider:${row.providerEntityId}`);
  }
  return { ready: issues.length === 0, issues: issues.sort(), rows };
};

const normalizeQuestion = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export const auditGeoCrossOwnerQuestionCollisions = (surfaces: GeoAnswerSurface[]) => {
  const byQuestion = new Map<string, GeoAnswerSurface[]>();
  for (const surface of surfaces) {
    validateGeoAnswerSurface(surface);
    const key = normalizeQuestion(surface.question);
    byQuestion.set(key, [...(byQuestion.get(key) ?? []), surface]);
  }
  const collisions = [...byQuestion.entries()].flatMap(([questionKey, group]) => {
    const owners = [...new Set(group.map((surface) => surface.slug))];
    return owners.length > 1 ? [{ questionKey, owners: owners.sort(), surfaceIds: group.map((surface) => surface.id).sort() }] : [];
  });
  return { ready: collisions.length === 0, collisions };
};

export const auditGeoAnswerSchemaParity = (surface: GeoAnswerSurface) => {
  validateGeoAnswerSurface(surface);
  const schema = buildGeoAnswerSchema(surface) as any;
  const publicEvidenceUrls = surface.evidence.filter((item) => item.origin === "public_source" && item.url).map((item) => item.url).sort();
  const citations = schema.mainEntity?.acceptedAnswer?.citation ?? [];
  const schemaCitations = (Array.isArray(citations) ? citations : [citations]).filter(Boolean).sort();
  const expectedEntityIds = surface.entities.map((entity) => entity.schemaId ?? `${schema.url}#entity-${entity.id}`).sort();
  const actualEntityIds = (Array.isArray(schema.about) ? schema.about : []).map((entity: any) => entity["@id"]).filter(Boolean).sort();
  const issues: string[] = [];
  if (schema.name !== surface.question) issues.push("question_mismatch");
  if (schema.mainEntity?.acceptedAnswer?.text !== surface.layers.shortAnswer) issues.push("short_answer_mismatch");
  if (publicEvidenceUrls.join("|") !== schemaCitations.join("|")) issues.push("citation_set_mismatch");
  if (expectedEntityIds.join("|") !== actualEntityIds.join("|")) issues.push("entity_id_set_mismatch");
  return { ready: issues.length === 0, issues, schema };
};

export const auditGeoEvidenceEdges = (surface: GeoAnswerSurface, asOf: string, staleDays = 90) => {
  validateGeoAnswerSurface(surface);
  if (!Number.isFinite(Date.parse(asOf))) throw new Error("asOf must be a valid timestamp");
  if (!Number.isInteger(staleDays) || staleDays < 1) throw new Error("staleDays must be a positive integer");
  const evidenceIds = new Set(surface.evidence.map((item) => item.id));
  const referenced = new Set<string>();
  const orphanReferences: string[] = [];
  for (const claim of surface.claims) for (const id of claim.evidenceIds) evidenceIds.has(id) ? referenced.add(id) : orphanReferences.push(`claim:${claim.id}:${id}`);
  for (const entity of surface.entities) for (const id of entity.evidenceIds) evidenceIds.has(id) ? referenced.add(id) : orphanReferences.push(`entity:${entity.id}:${id}`);
  for (const relationship of surface.relationships) for (const id of relationship.evidenceIds) evidenceIds.has(id) ? referenced.add(id) : orphanReferences.push(`relationship:${relationship.id}:${id}`);
  const unusedEvidence = surface.evidence.filter((item) => !referenced.has(item.id)).map((item) => item.id);
  const staleOrUndated = surface.evidence.filter((item) => {
    if (!item.verifiedAt) return true;
    const age = Math.floor((Date.parse(asOf) - Date.parse(item.verifiedAt)) / 86_400_000);
    if (age < 0) throw new Error(`Evidence ${item.id} occurs after asOf`);
    return age > staleDays;
  }).map((item) => item.id);
  return {
    ready: orphanReferences.length === 0 && unusedEvidence.length === 0 && staleOrUndated.length === 0,
    orphanReferences: orphanReferences.sort(),
    unusedEvidence: unusedEvidence.sort(),
    staleOrUndated: staleOrUndated.sort(),
  };
};

export const auditGeoSchemaIdentityConflicts = (surfaces: GeoAnswerSurface[]) => {
  const identities = new Map<string, { name: string; type: string; owner: string }>();
  const conflicts: Array<{ schemaId: string; firstOwner: string; secondOwner: string }> = [];
  for (const surface of surfaces) {
    validateGeoAnswerSurface(surface);
    for (const entity of surface.entities) {
      const schemaId = entity.schemaId;
      if (!schemaId) continue;
      const prior = identities.get(schemaId);
      if (!prior) identities.set(schemaId, { name: entity.name, type: entity.type, owner: surface.slug });
      else if (prior.name !== entity.name || prior.type !== entity.type) conflicts.push({ schemaId, firstOwner: prior.owner, secondOwner: surface.slug });
    }
  }
  return { ready: conflicts.length === 0, conflicts };
};

export const auditGeoSchemaProvenanceRules = (surface: GeoAnswerSurface) => {
  const parity = auditGeoAnswerSchemaParity(surface);
  const schema = parity.schema as any;
  const serialized = JSON.stringify(schema);
  const nonPublicEvidence = surface.evidence.filter((item) => item.origin !== "public_source");
  const leaked = nonPublicEvidence.filter((item) => (item.url && serialized.includes(item.url)) || serialized.includes(item.id)).map((item) => item.id);
  const demoOrSimulatedEntities = surface.entities.filter((item) => item.truthLabel === "demo" || item.truthLabel === "simulated").map((item) => item.id);
  return {
    ready: leaked.length === 0 && demoOrSimulatedEntities.length === 0,
    nonPublicEvidenceLeaks: leaked.sort(),
    demoOrSimulatedEntities: demoOrSimulatedEntities.sort(),
    rule: "Only reviewed public-source URLs may become answer citations/isBasedOn. Demo/simulated entity nodes are not production schema evidence.",
  };
};

export const assertGeoEntitySchemaFailClosed = (input: {
  surfaces: GeoAnswerSurface[];
  sourceReviewStates: Record<string, "approved" | "hold" | "withdrawn" | "missing">;
  asOf: string;
}) => {
  const heldEntityIds = new Set(Object.values(publicEntityRegistry).filter((item) => item.schemaPublication !== "approved").map((item) => item.id));
  const blockers: string[] = [];
  for (const surface of input.surfaces) {
    validateGeoAnswerSurface(surface);
    for (const entity of surface.entities) if (heldEntityIds.has(entity.id as PublicEntityId)) blockers.push(`${surface.slug}:held_entity:${entity.id}`);
    for (const evidence of surface.evidence.filter((item) => item.origin === "public_source")) {
      const state = input.sourceReviewStates[evidence.id] ?? "missing";
      if (state !== "approved") blockers.push(`${surface.slug}:source_${state}:${evidence.id}`);
    }
    const edges = auditGeoEvidenceEdges(surface, input.asOf);
    blockers.push(...edges.staleOrUndated.map((id) => `${surface.slug}:stale_or_undated:${id}`));
  }
  return { ready: blockers.length === 0, blockers: blockers.sort() };
};
