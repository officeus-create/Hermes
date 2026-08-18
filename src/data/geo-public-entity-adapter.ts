import {
  publicEntityRegistry,
  type PublicEntityId,
} from "./public-entity-registry.ts";
import type { GeoEntity } from "./geo-answer-contract.ts";

export interface GeoPublicEntityContext {
  description: string;
  relationToHermes: string;
  whyItMatters: string;
  evidenceIds: string[];
}

export interface GeoPublicEntityAdapterResult {
  status: "approved" | "hold";
  entityId: PublicEntityId;
  reason: string;
  entity?: GeoEntity;
}

export const adaptPublicEntityForGeo = (
  entityId: PublicEntityId,
  context: GeoPublicEntityContext,
): GeoPublicEntityAdapterResult => {
  const record = publicEntityRegistry[entityId];

  if (record.schemaPublication !== "approved") {
    return {
      status: "hold",
      entityId,
      reason: `${record.publicName} remains ${record.relationshipStatus}; GEO must not publish a competing entity relationship or sameAs claim.`,
    };
  }

  const approvedSameAs = record.socialProfiles
    .filter((profile) => profile.status === "approved_same_entity")
    .map((profile) => profile.url);

  return {
    status: "approved",
    entityId,
    reason: `${record.publicName} is approved for schema publication in the canonical public entity registry.`,
    entity: {
      id: record.id,
      name: record.publicName,
      type: "organization",
      description: context.description,
      relationToHermes: context.relationToHermes,
      whyItMatters: context.whyItMatters,
      truthLabel: "verified_fact",
      evidenceIds: context.evidenceIds,
      schemaId: record.schemaId,
      url: new URL(record.websiteOwner, "https://hermeslogisticsus.com").toString(),
      ...(approvedSameAs.length ? { sameAs: approvedSameAs } : {}),
    },
  };
};

export const geoEntityPublicationState = () =>
  Object.values(publicEntityRegistry).map((record) => ({
    entityId: record.id,
    publicName: record.publicName,
    relationshipStatus: record.relationshipStatus,
    schemaPublication: record.schemaPublication,
    approvedSameAsCount: record.socialProfiles.filter((profile) => profile.status === "approved_same_entity").length,
  }));