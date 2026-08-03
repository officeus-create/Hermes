export type PublicEntityId =
  | "hermes_ecosystem"
  | "hermes_logistics"
  | "progressopro_marketing"
  | "hermes_academy"
  | "hermes_it";

export type EntityRelationshipStatus =
  | "approved_root"
  | "approved_direction"
  | "owner_verification_required"
  | "relationship_resolution_required";

export type SocialProfileStatus =
  | "approved_same_entity"
  | "website_linked_signal"
  | "owner_verification_required"
  | "relationship_hold";

export interface PublicEntityRecord {
  id: PublicEntityId;
  publicName: string;
  schemaId: string;
  websiteOwner: string;
  relationshipStatus: EntityRelationshipStatus;
  schemaPublication: "approved" | "hold";
  socialProfiles: Array<{
    platform: "instagram" | "threads" | "facebook" | "telegram" | "x" | "youtube";
    url: string;
    status: SocialProfileStatus;
    evidence: string;
  }>;
  notes: string;
}

export const publicEntityRegistry: Record<PublicEntityId, PublicEntityRecord> = {
  hermes_ecosystem: {
    id: "hermes_ecosystem",
    publicName: "Hermes",
    schemaId: "https://hermeslogisticsus.com/#organization",
    websiteOwner: "/",
    relationshipStatus: "approved_root",
    schemaPublication: "approved",
    socialProfiles: [
      {
        platform: "instagram",
        url: "https://www.instagram.com/hermes.logistics/",
        status: "approved_same_entity",
        evidence: "Existing owner-controlled homepage schema and public website link.",
      },
      {
        platform: "threads",
        url: "https://www.threads.com/@hermes.logistics",
        status: "approved_same_entity",
        evidence: "Existing owner-controlled homepage schema and public website link.",
      },
    ],
    notes:
      "The root Organization represents the Hermes website ecosystem. Only profiles approved as the same public entity may appear in its sameAs array.",
  },
  hermes_logistics: {
    id: "hermes_logistics",
    publicName: "Hermes Logistics",
    schemaId: "https://hermeslogisticsus.com/#logistics",
    websiteOwner: "/paths/logistics/",
    relationshipStatus: "owner_verification_required",
    schemaPublication: "hold",
    socialProfiles: [
      {
        platform: "instagram",
        url: "https://www.instagram.com/hermes.logistics/",
        status: "website_linked_signal",
        evidence: "Linked from the public Hermes website; exact root-versus-direction ownership still requires a canonical owner decision.",
      },
      {
        platform: "threads",
        url: "https://www.threads.com/@hermes.logistics",
        status: "website_linked_signal",
        evidence: "Linked from the public Hermes website; exact root-versus-direction ownership still requires a canonical owner decision.",
      },
    ],
    notes:
      "Do not create a competing Organization node or duplicate sameAs arrays until the owner confirms whether these profiles represent the root Hermes brand or the Logistics direction specifically.",
  },
  progressopro_marketing: {
    id: "progressopro_marketing",
    publicName: "ProgressoPro",
    schemaId: "https://hermeslogisticsus.com/#progressopro",
    websiteOwner: "/paths/marketing/",
    relationshipStatus: "relationship_resolution_required",
    schemaPublication: "hold",
    socialProfiles: [
      {
        platform: "instagram",
        url: "https://www.instagram.com/progressopro/",
        status: "relationship_hold",
        evidence: "Previously placed in the Hermes root sameAs array; this does not prove that ProgressoPro is the same Organization entity.",
      },
    ],
    notes:
      "Confirm whether ProgressoPro is a distinct company, service brand, alternate brand, department, or approved brand relationship before publishing Organization/Brand sameAs or connecting provider credentials.",
  },
  hermes_academy: {
    id: "hermes_academy",
    publicName: "Hermes Business Academy",
    schemaId: "https://hermeslogisticsus.com/#academy",
    websiteOwner: "/paths/academy/",
    relationshipStatus: "approved_direction",
    schemaPublication: "approved",
    socialProfiles: [],
    notes:
      "The website relationship to the Hermes ecosystem is approved. Social and community profiles require exact owner-controlled URLs before sameAs publication.",
  },
  hermes_it: {
    id: "hermes_it",
    publicName: "Hermes IT Development",
    schemaId: "https://hermeslogisticsus.com/#technology",
    websiteOwner: "/paths/technology/",
    relationshipStatus: "owner_verification_required",
    schemaPublication: "hold",
    socialProfiles: [],
    notes:
      "The service direction is public, but a separate organization/brand identity and social account map have not been approved.",
  },
};

export const approvedHermesSameAs = publicEntityRegistry.hermes_ecosystem.socialProfiles
  .filter((profile) => profile.status === "approved_same_entity")
  .map((profile) => profile.url);

export const heldCrossEntityProfiles = Object.values(publicEntityRegistry)
  .filter((entity) => entity.id !== "hermes_ecosystem")
  .flatMap((entity) =>
    entity.socialProfiles
      .filter((profile) => profile.status !== "approved_same_entity")
      .map((profile) => ({ entityId: entity.id, publicName: entity.publicName, ...profile })),
  );
