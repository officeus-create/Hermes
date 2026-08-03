export type ContentDirection =
  | "hermes_logistics"
  | "progressopro_marketing"
  | "hermes_academy"
  | "hermes_it";

export type SourcePlatform =
  | "instagram"
  | "facebook"
  | "threads"
  | "x"
  | "youtube"
  | "tiktok"
  | "website"
  | "owner_upload";

export type MediaType = "text" | "image" | "carousel" | "video" | "mixed";
export type PermissionStatus = "unverified" | "owner_confirmed" | "licensed" | "public_embed_allowed";
export type EvidenceStatus = "missing" | "owner_claim" | "public_source" | "official_source" | "first_party_verified";
export type PrivacyClass = "public" | "internal" | "restricted";
export type ContentDecision = "awaiting_source" | "publish_candidate" | "merge_or_expand" | "hold" | "reject";
export type ReviewState =
  | "awaiting_owner_source"
  | "raw"
  | "classified"
  | "needs_evidence"
  | "reviewed"
  | "approved"
  | "generated"
  | "published"
  | "measured"
  | "retired";

export interface ContentEntityRecord {
  id: ContentDirection;
  publicName: string;
  websiteOwner: string;
  relationshipStatus: "approved_parent" | "owner_verification_required" | "relationship_resolution_required";
  socialProfiles: Array<{
    platform: SourcePlatform;
    url: string;
    status: "existing_public_signal" | "owner_verification_required" | "approved";
  }>;
  publishingStatus: "blocked" | "preview_only" | "approved";
  notes: string;
}

export interface ContentAssetInput {
  id: string;
  slotId?: string;
  direction: ContentDirection;
  platform: SourcePlatform;
  sourceUrl: string | null;
  originalPublishedAt: string | null;
  mediaType: MediaType;
  sourceText: string;
  transcript: string | null;
  proposedTopic: string;
  proposedQuery: string;
  canonicalOwner: string;
  intendedCta: string;
  audience: string;
  permissionStatus: PermissionStatus;
  evidenceStatus: EvidenceStatus;
  privacyClass: PrivacyClass;
  containsCurrentMarketClaim: boolean;
  containsPrivateOperationalData: boolean;
  materiallySimilarTo: string | null;
  reviewer: string | null;
  reviewState: ReviewState;
}

export interface ContentScore {
  usefulness: number;
  distinctness: number;
  evidence: number;
  freshness: number;
  commercialFit: number;
  reusePotential: number;
  rightsReadiness: number;
  privacySafety: number;
  canonicalFit: number;
  total: number;
}

export interface ContentReviewResult {
  decision: ContentDecision;
  score: ContentScore;
  fingerprint: string;
  blockers: string[];
  nextActions: string[];
}

const SCORE_MIN = 0;
const SCORE_MAX = 2;
const clampScore = (value: number) => Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(value)));

export const contentEntityRegistry: ContentEntityRecord[] = [
  {
    id: "hermes_logistics",
    publicName: "Hermes Logistics",
    websiteOwner: "/paths/logistics/",
    relationshipStatus: "owner_verification_required",
    socialProfiles: [
      { platform: "instagram", url: "https://www.instagram.com/hermes.logistics/", status: "owner_verification_required" },
      { platform: "threads", url: "https://www.threads.com/@hermes.logistics", status: "owner_verification_required" },
    ],
    publishingStatus: "blocked",
    notes: "Existing public profiles appear in current schema, but control and exact entity ownership must be re-verified before API or sameAs expansion.",
  },
  {
    id: "progressopro_marketing",
    publicName: "ProgressoPro",
    websiteOwner: "/paths/marketing/",
    relationshipStatus: "relationship_resolution_required",
    socialProfiles: [
      { platform: "instagram", url: "https://www.instagram.com/progressopro/", status: "owner_verification_required" },
    ],
    publishingStatus: "blocked",
    notes: "Resolve whether ProgressoPro is an alternate brand, service brand, department, or distinct public entity before schema or publishing integration.",
  },
  {
    id: "hermes_academy",
    publicName: "Hermes Business Academy",
    websiteOwner: "/paths/academy/",
    relationshipStatus: "approved_parent",
    socialProfiles: [],
    publishingStatus: "preview_only",
    notes: "The website relationship to the Hermes ecosystem is explicit. Social/community URLs still require owner verification.",
  },
  {
    id: "hermes_it",
    publicName: "Hermes IT / Technology",
    websiteOwner: "/paths/technology/",
    relationshipStatus: "owner_verification_required",
    socialProfiles: [],
    publishingStatus: "preview_only",
    notes: "The website service direction exists; a separate social/account identity has not been approved.",
  },
];

export const normalizeSourceUrl = (value: string | null): string => {
  if (!value) return "";
  try {
    const url = new URL(value);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "fbclid" || key === "igshid" || key === "igsh") {
        url.searchParams.delete(key);
      }
    }
    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.protocol}//${url.host.toLowerCase()}${normalizedPath}${url.search}`;
  } catch {
    return value.trim().toLowerCase();
  }
};

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

const hashString = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
};

export const createContentFingerprint = (asset: ContentAssetInput): string => {
  const source = normalizeSourceUrl(asset.sourceUrl);
  const text = normalizeText([asset.sourceText, asset.transcript ?? "", asset.proposedTopic].join(" ")).slice(0, 600);
  return `${asset.direction}:${asset.platform}:${hashString(`${source}|${text}|${asset.canonicalOwner}`)}`;
};

const hasSubstantialSource = (asset: ContentAssetInput): boolean =>
  normalizeText(`${asset.sourceText} ${asset.transcript ?? ""}`).length >= 180;

const isFreshEnough = (asset: ContentAssetInput, now = new Date("2026-08-03T00:00:00Z")): boolean => {
  if (!asset.originalPublishedAt) return false;
  const published = new Date(asset.originalPublishedAt);
  if (Number.isNaN(published.getTime())) return false;
  const ageDays = (now.getTime() - published.getTime()) / 86_400_000;
  return ageDays <= 730;
};

export const scoreContentAsset = (asset: ContentAssetInput): ContentScore => {
  const usefulLength = normalizeText(`${asset.sourceText} ${asset.transcript ?? ""}`).length;
  const usefulness = clampScore(usefulLength >= 700 ? 2 : usefulLength >= 180 ? 1 : 0);
  const distinctness = clampScore(asset.materiallySimilarTo ? 0 : asset.proposedTopic && asset.proposedQuery ? 2 : 1);
  const evidence = clampScore(
    asset.evidenceStatus === "official_source" || asset.evidenceStatus === "first_party_verified"
      ? 2
      : asset.evidenceStatus === "public_source"
        ? 1
        : 0,
  );
  const freshness = clampScore(isFreshEnough(asset) ? 2 : asset.originalPublishedAt ? 1 : 0);
  const commercialFit = clampScore(asset.canonicalOwner.startsWith("/") && asset.intendedCta.startsWith("/") ? 2 : asset.canonicalOwner ? 1 : 0);
  const reusePotential = clampScore(asset.mediaType === "video" || asset.mediaType === "mixed" || asset.transcript ? 2 : hasSubstantialSource(asset) ? 1 : 0);
  const rightsReadiness = clampScore(asset.permissionStatus === "owner_confirmed" || asset.permissionStatus === "licensed" ? 2 : asset.permissionStatus === "public_embed_allowed" ? 1 : 0);
  const privacySafety = clampScore(asset.privacyClass === "public" && !asset.containsPrivateOperationalData ? 2 : asset.privacyClass === "internal" ? 1 : 0);
  const canonicalFit = clampScore(asset.canonicalOwner.startsWith("/") && asset.canonicalOwner !== "/" ? 2 : asset.canonicalOwner === "/" ? 0 : 1);
  const total = usefulness + distinctness + evidence + freshness + commercialFit + reusePotential + rightsReadiness + privacySafety + canonicalFit;

  return {
    usefulness,
    distinctness,
    evidence,
    freshness,
    commercialFit,
    reusePotential,
    rightsReadiness,
    privacySafety,
    canonicalFit,
    total,
  };
};

export const reviewContentAsset = (asset: ContentAssetInput): ContentReviewResult => {
  const score = scoreContentAsset(asset);
  const blockers: string[] = [];
  const nextActions: string[] = [];

  if (!asset.sourceUrl) blockers.push("Owner-controlled source URL or file reference is missing.");
  if (asset.permissionStatus === "unverified") blockers.push("Rights or owner permission are not verified.");
  if (asset.privacyClass !== "public" || asset.containsPrivateOperationalData) blockers.push("Source is not approved for public use.");
  if (asset.containsCurrentMarketClaim && !["official_source", "first_party_verified"].includes(asset.evidenceStatus)) {
    blockers.push("Current market, route, rate, availability, or performance claim lacks approved current evidence.");
  }
  if (asset.evidenceStatus === "missing") blockers.push("Evidence status is missing.");
  if (!asset.canonicalOwner.startsWith("/") || asset.canonicalOwner === "/") blockers.push("A distinct canonical website owner has not been selected.");
  if (!asset.intendedCta.startsWith("/")) blockers.push("A controlled internal CTA is not defined.");

  if (!asset.sourceUrl) {
    nextActions.push("Add the exact owner-approved social post, video, upload, or transcript reference.");
    return { decision: "awaiting_source", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
  }

  if (asset.privacyClass === "restricted" || asset.containsPrivateOperationalData) {
    nextActions.push("Reject public use or replace the source with an approved anonymized/public-safe asset.");
    return { decision: "reject", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
  }

  if (asset.materiallySimilarTo) {
    nextActions.push(`Merge useful evidence into ${asset.materiallySimilarTo} instead of creating a competing page.`);
    return { decision: "merge_or_expand", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
  }

  if (blockers.length > 0) {
    nextActions.push("Resolve rights, evidence, entity, privacy, canonical-owner, and CTA blockers before drafting an indexable page.");
    return { decision: "hold", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
  }

  if (score.total >= 14 && hasSubstantialSource(asset)) {
    nextActions.push("Prepare a review-only Article or Video insight draft with internal links, FAQ, CTA, source attribution, and sitemap candidate.");
    return { decision: "publish_candidate", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
  }

  if (score.total >= 9) {
    nextActions.push("Cluster with related sources or expand the material before requesting publication approval.");
    return { decision: "merge_or_expand", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
  }

  nextActions.push("Reject as a standalone page or retain only as a minor supporting note for another approved asset.");
  return { decision: "reject", score, fingerprint: createContentFingerprint(asset), blockers, nextActions };
};

export const pilotQuota: Record<ContentDirection, number> = {
  hermes_logistics: 10,
  progressopro_marketing: 10,
  hermes_academy: 5,
  hermes_it: 5,
};

export interface PilotAssetSlot {
  id: string;
  direction: ContentDirection;
  ordinal: number;
  status: "awaiting_owner_source" | "source_added";
  sourceUrl: string | null;
  ownerNote: string;
}

export const buildPilotAssetSlots = (): PilotAssetSlot[] =>
  (Object.entries(pilotQuota) as Array<[ContentDirection, number]>).flatMap(([direction, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${direction}-${String(index + 1).padStart(2, "0")}`,
      direction,
      ordinal: index + 1,
      status: "awaiting_owner_source" as const,
      sourceUrl: null,
      ownerNote: "Add one exact owner-approved post, video, transcript, or upload. This slot is not an invented content asset.",
    })),
  );

export const summarizePilotSlots = (slots: PilotAssetSlot[]) => ({
  total: slots.length,
  awaitingOwnerSource: slots.filter((slot) => slot.status === "awaiting_owner_source").length,
  sourceAdded: slots.filter((slot) => slot.status === "source_added").length,
  byDirection: (Object.keys(pilotQuota) as ContentDirection[]).map((direction) => ({
    direction,
    required: pilotQuota[direction],
    current: slots.filter((slot) => slot.direction === direction && slot.status === "source_added").length,
  })),
});
