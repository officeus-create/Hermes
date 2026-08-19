import {
  buildGeoAnswerSchema,
  validateGeoAnswerSurface,
  type GeoAnswerSurface,
  type GeoEvidenceReference,
} from "./geo-answer-contract.ts";
import { geoEntityPublicationState } from "./geo-public-entity-adapter.ts";

export type GeoSourceReviewState = "approved" | "hold" | "withdrawn";
export type GeoAnswerFreshnessState = "fresh" | "aging" | "stale" | "undated";
export type GeoAnswerRemediationType = "evidence" | "entity" | "owner" | "semantic_parity" | "structure";

export interface GeoPublicSourceReviewInput {
  evidence_id: string;
  url: string;
  reviewed_at: string;
  state: GeoSourceReviewState;
}

export interface GeoAnswerOwnerExpectation {
  surface_id: string;
  canonical_owner: string;
  audience: string;
  use_case: string;
}

export interface GeoQuestionVariantInput {
  canonical_owner: string;
  question_id: string;
  question: string;
  answer_fingerprint: string;
}

const sourceReviewFields = new Set(["evidence_id", "url", "reviewed_at", "state"]);
const ownerExpectationFields = new Set(["surface_id", "canonical_owner", "audience", "use_case"]);
const questionVariantFields = new Set(["canonical_owner", "question_id", "question", "answer_fingerprint"]);
const sourceStates = new Set<GeoSourceReviewState>(["approved", "hold", "withdrawn"]);
const timestampWithZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const opaque = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};
const exactFields = (row: Record<string, unknown>, fields: Set<string>, label: string) => {
  for (const key of Object.keys(row)) if (!fields.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  for (const key of fields) if (!(key in row)) throw new Error(`${label} is missing field: ${key}`);
};
const cleanPath = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) throw new Error(`${label} must be a clean site-relative path`);
  return value;
};
const cleanOpaque = (value: unknown, label: string) => {
  if (typeof value !== "string" || !opaque.test(value)) throw new Error(`${label} must be an opaque safe identifier`);
  return value;
};
const cleanText = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be non-empty text`);
  return value.trim();
};
const cleanHttps = (value: unknown, label: string) => {
  if (typeof value !== "string" || !value.startsWith("https://")) throw new Error(`${label} must be https`);
  return value;
};
const cleanTimestamp = (value: unknown, label: string) => {
  if (typeof value !== "string" || !timestampWithZone.test(value) || !Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp with explicit timezone`);
  return new Date(Date.parse(value)).toISOString();
};
const normalizeQuestion = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const rate = (numerator: number, denominator: number) => denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(1));

export const importGeoPublicSourceReviews = (inputs: unknown[]): GeoPublicSourceReviewInput[] => {
  if (!Array.isArray(inputs) || inputs.length > 5000) throw new Error("Public source reviews must contain at most 5000 rows");
  const rows = inputs.map((input, index) => {
    const row = asRecord(input, `source_reviews[${index}]`);
    exactFields(row, sourceReviewFields, `source_reviews[${index}]`);
    if (typeof row.state !== "string" || !sourceStates.has(row.state as GeoSourceReviewState)) throw new Error(`source_reviews[${index}].state is unsupported`);
    return {
      evidence_id: cleanOpaque(row.evidence_id, `source_reviews[${index}].evidence_id`),
      url: cleanHttps(row.url, `source_reviews[${index}].url`),
      reviewed_at: cleanTimestamp(row.reviewed_at, `source_reviews[${index}].reviewed_at`),
      state: row.state as GeoSourceReviewState,
    };
  });
  if (new Set(rows.map((row) => row.evidence_id)).size !== rows.length) throw new Error("Public source reviews must have unique evidence_id values");
  return rows.sort((a, b) => a.evidence_id.localeCompare(b.evidence_id));
};

export const importGeoAnswerOwnerExpectations = (inputs: unknown[]): GeoAnswerOwnerExpectation[] => {
  if (!Array.isArray(inputs) || inputs.length > 1000) throw new Error("Owner expectations must contain at most 1000 rows");
  const rows = inputs.map((input, index) => {
    const row = asRecord(input, `owner_expectations[${index}]`);
    exactFields(row, ownerExpectationFields, `owner_expectations[${index}]`);
    return {
      surface_id: cleanOpaque(row.surface_id, `owner_expectations[${index}].surface_id`),
      canonical_owner: cleanPath(row.canonical_owner, `owner_expectations[${index}].canonical_owner`),
      audience: cleanText(row.audience, `owner_expectations[${index}].audience`),
      use_case: cleanText(row.use_case, `owner_expectations[${index}].use_case`),
    };
  });
  if (new Set(rows.map((row) => row.surface_id)).size !== rows.length) throw new Error("Owner expectations must have unique surface_id values");
  return rows;
};

export const auditGeoQuestionVariants = (inputs: unknown[]) => {
  if (!Array.isArray(inputs) || inputs.length > 5000) throw new Error("Question variants must contain at most 5000 rows");
  const rows = inputs.map((input, index) => {
    const row = asRecord(input, `question_variants[${index}]`);
    exactFields(row, questionVariantFields, `question_variants[${index}]`);
    return {
      canonicalOwner: cleanPath(row.canonical_owner, `question_variants[${index}].canonical_owner`),
      questionId: cleanOpaque(row.question_id, `question_variants[${index}].question_id`),
      question: cleanText(row.question, `question_variants[${index}].question`),
      answerFingerprint: cleanOpaque(row.answer_fingerprint, `question_variants[${index}].answer_fingerprint`),
    };
  });
  const byKey = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.canonicalOwner}|${normalizeQuestion(row.question)}`;
    byKey.set(key, [...(byKey.get(key) ?? []), row]);
  }
  const duplicates: string[] = [];
  const conflicts: string[] = [];
  for (const [key, group] of byKey) {
    if (group.length < 2) continue;
    if (new Set(group.map((row) => row.answerFingerprint)).size === 1) duplicates.push(key);
    else conflicts.push(key);
  }
  return { rows, duplicates: duplicates.sort(), conflicts: conflicts.sort() };
};

const evidenceAgeState = (evidence: GeoEvidenceReference, asOfMs: number, freshDays: number, staleDays: number): GeoAnswerFreshnessState => {
  if (!evidence.verifiedAt) return "undated";
  const ageDays = Math.floor((asOfMs - Date.parse(evidence.verifiedAt)) / 86_400_000);
  if (ageDays < 0) throw new Error(`Evidence ${evidence.id} occurs after asOf`);
  if (ageDays <= freshDays) return "fresh";
  if (ageDays <= staleDays) return "aging";
  return "stale";
};

export const buildGeoAnswerEvidenceQualityAudit = (
  surfaces: GeoAnswerSurface[],
  sourceReviewInputs: unknown[],
  ownerExpectationInputs: unknown[],
  asOf: string,
  freshDays = 30,
  staleDays = 90,
) => {
  const asOfIso = cleanTimestamp(asOf, "asOf");
  if (!Number.isInteger(freshDays) || !Number.isInteger(staleDays) || freshDays < 1 || staleDays <= freshDays) throw new Error("freshDays/staleDays thresholds are invalid");
  const asOfMs = Date.parse(asOfIso);
  const sourceReviews = importGeoPublicSourceReviews(sourceReviewInputs);
  const sourceReviewByEvidence = new Map(sourceReviews.map((row) => [row.evidence_id, row]));
  const expectations = importGeoAnswerOwnerExpectations(ownerExpectationInputs);
  const expectationBySurface = new Map(expectations.map((row) => [row.surface_id, row]));
  const heldEntities = new Set(geoEntityPublicationState().filter((row) => row.schemaPublication !== "approved").map((row) => row.entityId));

  const identityMap = new Map<string, { name: string; type: string; surfaces: string[] }>();
  const entityIdentityConflicts: string[] = [];
  for (const surface of surfaces) {
    validateGeoAnswerSurface(surface);
    for (const entity of surface.entities) {
      const identity = entity.schemaId ?? entity.id;
      const current = identityMap.get(identity);
      if (!current) identityMap.set(identity, { name: entity.name, type: entity.type, surfaces: [surface.id] });
      else if (current.name !== entity.name || current.type !== entity.type) entityIdentityConflicts.push(identity);
      else current.surfaces.push(surface.id);
    }
  }

  const surfaceAudits = surfaces.map((surface) => {
    const expectation = expectationBySurface.get(surface.id);
    const ownerIssues: string[] = [];
    if (!expectation) ownerIssues.push("missing_owner_expectation");
    else {
      if (surface.slug !== expectation.canonical_owner) ownerIssues.push("canonical_owner_mismatch");
      if (surface.audience !== expectation.audience) ownerIssues.push("audience_mismatch");
      if (surface.intent !== expectation.use_case) ownerIssues.push("use_case_mismatch");
    }

    const heldEntityLeaks = surface.entities.filter((entity) => heldEntities.has(entity.id as never)).map((entity) => entity.id);
    const publicSources = surface.evidence.filter((evidence) => evidence.origin === "public_source");
    const sourceReviewIssues = publicSources.flatMap((evidence) => {
      if (!evidence.url) return [`${evidence.id}:missing_public_url`];
      const review = sourceReviewByEvidence.get(evidence.id);
      if (!review) return [`${evidence.id}:missing_source_review`];
      if (review.url !== evidence.url) return [`${evidence.id}:review_url_mismatch`];
      if (review.state !== "approved") return [`${evidence.id}:source_${review.state}`];
      return [];
    });

    const referencedEvidence = new Set<string>();
    for (const claim of surface.claims) for (const evidenceId of claim.evidenceIds) referencedEvidence.add(evidenceId);
    for (const entity of surface.entities) for (const evidenceId of entity.evidenceIds) referencedEvidence.add(evidenceId);
    for (const relation of surface.relationships) for (const evidenceId of relation.evidenceIds) referencedEvidence.add(evidenceId);
    const unusedEvidenceIds = surface.evidence.filter((evidence) => !referencedEvidence.has(evidence.id)).map((evidence) => evidence.id);

    const claimsWithReviewedSource = surface.claims.filter((claim) => claim.evidenceIds.some((evidenceId) => {
      const evidence = surface.evidence.find((candidate) => candidate.id === evidenceId);
      if (!evidence) return false;
      if (evidence.origin !== "public_source") return true;
      const review = sourceReviewByEvidence.get(evidence.id);
      return Boolean(review && review.state === "approved" && review.url === evidence.url);
    }));
    const claimSourceCompletenessRate = rate(claimsWithReviewedSource.length, surface.claims.length);

    const claimEvidenceIds = new Set(surface.claims.flatMap((claim) => claim.evidenceIds));
    const entitiesCoveredByClaims = surface.entities.filter((entity) => entity.evidenceIds.some((evidenceId) => claimEvidenceIds.has(evidenceId)));
    const entityClaimCoverageRate = rate(entitiesCoveredByClaims.length, surface.entities.length);

    const serviceEntities = surface.entities.filter((entity) => entity.type === "service");
    const organizationIds = new Set(surface.entities.filter((entity) => entity.type === "organization" || entity.type === "provider").map((entity) => entity.id));
    const serviceOrganizationIssues = serviceEntities.filter((service) => !surface.relationships.some((relationship) =>
      relationship.fromEntityId === service.id && organizationIds.has(relationship.toEntityId),
    )).map((service) => service.id);

    const schema = buildGeoAnswerSchema(surface) as any;
    const schemaAbout = Array.isArray(schema.about) ? schema.about : [];
    const schemaCitation = schema.mainEntity?.acceptedAnswer?.citation ?? [];
    const expectedCitations = publicSources.filter((source) => source.url).map((source) => source.url).sort();
    const actualCitations = (Array.isArray(schemaCitation) ? schemaCitation : [schemaCitation]).filter(Boolean).sort();
    const semanticParityIssues: string[] = [];
    if (schema.name !== surface.question) semanticParityIssues.push("question_name_mismatch");
    if (schema.mainEntity?.acceptedAnswer?.text !== surface.layers.shortAnswer) semanticParityIssues.push("short_answer_mismatch");
    if (schemaAbout.length !== surface.entities.length) semanticParityIssues.push("entity_count_mismatch");
    else {
      for (const entity of surface.entities) if (!schemaAbout.some((item: any) => item.name === entity.name && item["@id"] === (entity.schemaId ?? `${schema.url}#entity-${entity.id}`))) semanticParityIssues.push(`entity_mismatch:${entity.id}`);
    }
    if (expectedCitations.join("|") !== actualCitations.join("|")) semanticParityIssues.push("citation_set_mismatch");

    const freshness = surface.evidence.map((evidence) => ({ evidenceId: evidence.id, state: evidenceAgeState(evidence, asOfMs, freshDays, staleDays) }));
    const evidenceFreshnessState: GeoAnswerFreshnessState = freshness.some((item) => item.state === "stale") ? "stale"
      : freshness.some((item) => item.state === "undated") ? "undated"
      : freshness.some((item) => item.state === "aging") ? "aging" : "fresh";

    const remediation: { type: GeoAnswerRemediationType; issue: string; priority: number }[] = [];
    for (const issue of sourceReviewIssues) remediation.push({ type: "evidence", issue, priority: 100 });
    if (claimSourceCompletenessRate < 100) remediation.push({ type: "evidence", issue: "claim_source_completeness_below_100", priority: 95 });
    if (evidenceFreshnessState === "stale" || evidenceFreshnessState === "undated") remediation.push({ type: "evidence", issue: `evidence_freshness_${evidenceFreshnessState}`, priority: 90 });
    for (const issue of heldEntityLeaks) remediation.push({ type: "entity", issue: `held_entity_leak:${issue}`, priority: 100 });
    for (const issue of serviceOrganizationIssues) remediation.push({ type: "entity", issue: `service_org_relationship_missing:${issue}`, priority: 80 });
    for (const issue of ownerIssues) remediation.push({ type: "owner", issue, priority: 85 });
    for (const issue of semanticParityIssues) remediation.push({ type: "semantic_parity", issue, priority: 70 });
    for (const issue of unusedEvidenceIds) remediation.push({ type: "structure", issue: `unused_evidence:${issue}`, priority: 30 });
    remediation.sort((a, b) => b.priority - a.priority || a.issue.localeCompare(b.issue));

    const evidenceReady = sourceReviewIssues.length === 0 && claimSourceCompletenessRate === 100 && evidenceFreshnessState !== "stale" && evidenceFreshnessState !== "undated";
    const structureReady = ownerIssues.length === 0 && heldEntityLeaks.length === 0 && serviceOrganizationIssues.length === 0 && semanticParityIssues.length === 0;
    const ready = evidenceReady && structureReady;

    return {
      surfaceId: surface.id,
      canonicalOwner: surface.slug,
      ownerIssues,
      heldEntityLeaks,
      sourceReviewIssues,
      claimSourceCompletenessRate,
      unusedEvidenceIds,
      entityClaimCoverageRate,
      serviceOrganizationIssues,
      semanticParityIssues,
      freshness,
      evidenceFreshnessState,
      evidenceReady,
      structureReady,
      ready,
      remediation,
    };
  });

  return {
    asOf: asOfIso,
    entityIdentityConflicts: [...new Set(entityIdentityConflicts)].sort(),
    surfaceAudits,
    readyOwners: surfaceAudits.filter((audit) => audit.ready).map((audit) => audit.canonicalOwner),
    blockedOwners: surfaceAudits.filter((audit) => !audit.ready).map((audit) => audit.canonicalOwner),
  };
};
