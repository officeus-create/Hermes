import {
  validateGeoAnswerSurface,
  type GeoAnswerSurface,
  type GeoEvidenceReference,
} from "./geo-answer-contract.ts";

export interface GeoEvidenceUsageRecord {
  evidenceId: string;
  claimIds: string[];
  entityIds: string[];
  relationshipIds: string[];
  supportsVisibleAnswerClaim: boolean;
}

export interface GeoEvidenceGraphDiagnostic {
  answerClaimIds: string[];
  answerEvidenceIds: string[];
  publicAnswerCitationUrls: string[];
  usage: GeoEvidenceUsageRecord[];
  unusedEvidenceIds: string[];
  unexposedClaimIds: string[];
  isolatedEntityIds: string[];
  publicSourceWithoutUrlIds: string[];
}

const unique = <T>(values: T[]) => [...new Set(values)];

const publicUrls = (evidence: GeoEvidenceReference[]) =>
  unique(
    evidence
      .filter((item) => item.origin === "public_source" && item.url)
      .map((item) => item.url as string),
  );

export const buildGeoEvidenceGraph = (surface: GeoAnswerSurface): GeoEvidenceGraphDiagnostic => {
  validateGeoAnswerSurface(surface);

  const visibleClaimIds = new Set(surface.layers.evidenceClaimIds);
  const evidenceById = new Map(surface.evidence.map((item) => [item.id, item]));
  const answerEvidenceIds = unique(
    surface.claims
      .filter((claim) => visibleClaimIds.has(claim.id))
      .flatMap((claim) => claim.evidenceIds),
  );

  const usage: GeoEvidenceUsageRecord[] = surface.evidence.map((evidence) => {
    const claimIds = surface.claims
      .filter((claim) => claim.evidenceIds.includes(evidence.id))
      .map((claim) => claim.id);
    const entityIds = surface.entities
      .filter((entity) => entity.evidenceIds.includes(evidence.id))
      .map((entity) => entity.id);
    const relationshipIds = surface.relationships
      .filter((relationship) => relationship.evidenceIds.includes(evidence.id))
      .map((relationship) => relationship.id);

    return {
      evidenceId: evidence.id,
      claimIds,
      entityIds,
      relationshipIds,
      supportsVisibleAnswerClaim: claimIds.some((claimId) => visibleClaimIds.has(claimId)),
    };
  });

  const connectedEntityIds = new Set(
    surface.relationships.flatMap((relationship) => [relationship.fromEntityId, relationship.toEntityId]),
  );

  return {
    answerClaimIds: [...visibleClaimIds],
    answerEvidenceIds,
    publicAnswerCitationUrls: publicUrls(
      answerEvidenceIds
        .map((evidenceId) => evidenceById.get(evidenceId))
        .filter((item): item is GeoEvidenceReference => Boolean(item)),
    ),
    usage,
    unusedEvidenceIds: usage
      .filter((item) => item.claimIds.length === 0 && item.entityIds.length === 0 && item.relationshipIds.length === 0)
      .map((item) => item.evidenceId),
    unexposedClaimIds: surface.claims
      .filter((claim) => !visibleClaimIds.has(claim.id))
      .map((claim) => claim.id),
    isolatedEntityIds: surface.entities
      .filter((entity) => !connectedEntityIds.has(entity.id))
      .map((entity) => entity.id),
    publicSourceWithoutUrlIds: surface.evidence
      .filter((item) => item.origin === "public_source" && !item.url)
      .map((item) => item.id),
  };
};

export const assertGeoEvidenceGraphReady = (surface: GeoAnswerSurface) => {
  const diagnostic = buildGeoEvidenceGraph(surface);
  if (diagnostic.unusedEvidenceIds.length > 0) {
    throw new Error(`Unused GEO evidence: ${diagnostic.unusedEvidenceIds.join(", ")}`);
  }
  if (diagnostic.unexposedClaimIds.length > 0) {
    throw new Error(`GEO claims not exposed in the human answer evidence layer: ${diagnostic.unexposedClaimIds.join(", ")}`);
  }
  if (diagnostic.publicSourceWithoutUrlIds.length > 0) {
    throw new Error(`Public GEO source missing reviewed URL: ${diagnostic.publicSourceWithoutUrlIds.join(", ")}`);
  }
  return diagnostic;
};
