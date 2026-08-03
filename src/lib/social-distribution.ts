import { normalizeSourceUrl, type ContentDirection } from "./content-pipeline.ts";

export type DistributionPlatform = "facebook" | "threads" | "instagram" | "x";
export type DistributionCampaign =
  | "logistics_insights"
  | "marketing_insights"
  | "academy"
  | "it_insights";
export type DistributionState =
  | "generated"
  | "reviewed"
  | "approved"
  | "rejected"
  | "manual_export_ready";
export type ChannelReadiness = "blocked" | "preview_only" | "live_gate_required";
export type ChannelMode = "synthetic_preview" | "owner_verified";

export interface ApprovedWebsiteAsset {
  id: string;
  contentVersion: string;
  status: "distribution_approved" | "review_required" | "blocked";
  productionApproved: boolean;
  indexable: boolean;
  canonicalUrl: string;
  title: string;
  conciseValue: string;
  practicalPoints: string[];
  direction: ContentDirection;
  campaign: DistributionCampaign;
  audience: string;
  language: string;
  ctaLabel: string;
  visualReference: string | null;
  evidenceNumber: string | null;
  privacySafe: boolean;
  claimsApproved: boolean;
  entityApproved: boolean;
}

export interface DistributionChannel {
  alias: string;
  platform: DistributionPlatform;
  direction: ContentDirection;
  mode: ChannelMode;
  readiness: ChannelReadiness;
  entityApproved: boolean;
  ownerVerified: boolean;
  accountLabel: string;
  note: string;
}

export interface DistributionDraft {
  id: string;
  assetId: string;
  contentVersion: string;
  platform: DistributionPlatform;
  channelAlias: string;
  channelMode: ChannelMode;
  campaign: DistributionCampaign;
  audience: string;
  language: string;
  hook: string;
  copy: string;
  ctaLabel: string;
  trackedUrl: string;
  destinationStrategy: string;
  visualReference: string | null;
  fingerprint: string;
  state: DistributionState;
  reviewer: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  exportedAt: string | null;
}

export interface DistributionEligibility {
  eligible: boolean;
  blockers: string[];
}

export interface DistributionAuditEntry {
  jobId: string;
  from: DistributionState | "none";
  to: DistributionState;
  actor: string;
  at: string;
  reason: string;
}

const allowedSources = new Set<DistributionPlatform>(["facebook", "threads", "instagram", "x"]);
const allowedCampaigns = new Set<DistributionCampaign>([
  "logistics_insights",
  "marketing_insights",
  "academy",
  "it_insights",
]);
const safeVariantPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const privateValuePattern = /(?:@|\+?\d[\d\s().-]{7,}|\b(?:mc|dot|usdot)\s*#?\s*\d+\b)/i;

const hashString = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
};

const truncate = (value: string, max: number): string =>
  value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;

export const validateDistributionEligibility = (
  asset: ApprovedWebsiteAsset,
  channel: DistributionChannel,
): DistributionEligibility => {
  const blockers: string[] = [];
  if (asset.status !== "distribution_approved") blockers.push("Website asset is not distribution-approved.");
  if (!asset.productionApproved) blockers.push("Website asset is not production-approved.");
  if (!asset.indexable) blockers.push("Website asset is not indexable.");
  if (!asset.canonicalUrl.startsWith("https://hermeslogisticsus.com/")) blockers.push("Canonical URL is outside the approved Hermes domain.");
  if (!asset.privacySafe) blockers.push("Privacy review is incomplete.");
  if (!asset.claimsApproved) blockers.push("Claims review is incomplete.");
  if (!asset.entityApproved) blockers.push("Asset entity ownership is unresolved.");
  if (channel.direction !== asset.direction) blockers.push("Channel direction does not match the website asset.");
  if (!allowedSources.has(channel.platform)) blockers.push("Unsupported platform.");
  if (channel.readiness === "blocked") blockers.push("Channel is blocked.");

  if (channel.mode === "synthetic_preview") {
    if (channel.readiness !== "preview_only") blockers.push("Synthetic channels must remain preview-only.");
    if (channel.entityApproved || channel.ownerVerified) {
      blockers.push("Synthetic preview channels must not claim real entity or account verification.");
    }
  } else {
    if (!channel.entityApproved) blockers.push("Channel entity ownership is unresolved.");
    if (!channel.ownerVerified) blockers.push("Channel ownership is not verified.");
  }

  return { eligible: blockers.length === 0, blockers };
};

export const buildTrackedUrl = (
  canonicalUrl: string,
  platform: DistributionPlatform,
  campaign: DistributionCampaign,
  variantId: string,
): string => {
  if (!allowedSources.has(platform)) throw new Error(`Unsupported UTM source: ${platform}`);
  if (!allowedCampaigns.has(campaign)) throw new Error(`Unsupported UTM campaign: ${campaign}`);
  if (!safeVariantPattern.test(variantId) || privateValuePattern.test(variantId)) {
    throw new Error("UTM content variant must be a stable privacy-safe identifier.");
  }

  const normalized = normalizeSourceUrl(canonicalUrl);
  const url = new URL(normalized);
  if (url.hostname !== "hermeslogisticsus.com") throw new Error("Tracked URLs must stay on the approved Hermes domain.");
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("utm_") || key === "fbclid" || key === "igshid") url.searchParams.delete(key);
  }
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", variantId);
  return url.toString();
};

export const createDistributionFingerprint = (
  asset: ApprovedWebsiteAsset,
  channel: DistributionChannel,
): string => {
  const canonical = normalizeSourceUrl(asset.canonicalUrl);
  return `${channel.platform}:${channel.alias}:${hashString(`${canonical}|${asset.campaign}|${asset.contentVersion}`)}`;
};

const facebookDraft = (asset: ApprovedWebsiteAsset, trackedUrl: string) => {
  const points = asset.practicalPoints.slice(0, 3).map((point) => `• ${point}`).join("\n");
  return {
    hook: asset.title,
    copy: `${asset.conciseValue}\n\n${points}\n\n${asset.ctaLabel}: ${trackedUrl}`,
    destinationStrategy: "Direct canonical link in a Facebook Page draft after owner review.",
  };
};

const threadsDraft = (asset: ApprovedWebsiteAsset, trackedUrl: string) => {
  const firstPoint = asset.practicalPoints[0] ?? asset.conciseValue;
  return {
    hook: "A useful page is not enough if the reader never reaches the right next step.",
    copy: `${firstPoint}\n\n${asset.conciseValue}\n\nWhat part of this process creates the most friction for you?\n${trackedUrl}`,
    destinationStrategy: "Canonical tracked link included only when the verified Threads format supports it.",
  };
};

const instagramDraft = (asset: ApprovedWebsiteAsset, trackedUrl: string) => {
  const points = asset.practicalPoints.slice(0, 4).map((point, index) => `${index + 1}. ${point}`).join("\n");
  return {
    hook: "Save this checklist before your next review.",
    copy: `${asset.title}\n\n${points}\n\n${asset.conciseValue}\n\n${asset.ctaLabel}. Use the approved profile-link or Story destination.`,
    destinationStrategy: `Visual-first caption. Do not assume a clickable caption link. Approved destination preview: ${trackedUrl}`,
  };
};

const xDraft = (asset: ApprovedWebsiteAsset, trackedUrl: string) => {
  const evidence = asset.evidenceNumber ? `${asset.evidenceNumber} ` : "";
  const suffix = ` ${trackedUrl}`;
  const body = `${evidence}${asset.practicalPoints[0] ?? asset.conciseValue} ${asset.ctaLabel}.`;
  return {
    hook: truncate(asset.title, 90),
    copy: `${truncate(body, 280 - suffix.length)}${suffix}`,
    destinationStrategy: "Tracked canonical link. Live X access, tier, pricing, caps, and media workflow remain unverified.",
  };
};

export const generatePlatformDraft = (
  asset: ApprovedWebsiteAsset,
  channel: DistributionChannel,
  createdAt = "2026-08-03T00:00:00Z",
): DistributionDraft => {
  const eligibility = validateDistributionEligibility(asset, channel);
  if (!eligibility.eligible) throw new Error(`Distribution blocked: ${eligibility.blockers.join(" ")}`);

  const variantId = `${asset.id}-${asset.contentVersion}-${channel.platform}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  const trackedUrl = buildTrackedUrl(asset.canonicalUrl, channel.platform, asset.campaign, variantId);
  const adapted = channel.platform === "facebook"
    ? facebookDraft(asset, trackedUrl)
    : channel.platform === "threads"
      ? threadsDraft(asset, trackedUrl)
      : channel.platform === "instagram"
        ? instagramDraft(asset, trackedUrl)
        : xDraft(asset, trackedUrl);
  const fingerprint = createDistributionFingerprint(asset, channel);

  return {
    id: `distribution-${fingerprint}`,
    assetId: asset.id,
    contentVersion: asset.contentVersion,
    platform: channel.platform,
    channelAlias: channel.alias,
    channelMode: channel.mode,
    campaign: asset.campaign,
    audience: asset.audience,
    language: asset.language,
    hook: adapted.hook,
    copy: adapted.copy,
    ctaLabel: asset.ctaLabel,
    trackedUrl,
    destinationStrategy: adapted.destinationStrategy,
    visualReference: asset.visualReference,
    fingerprint,
    state: "generated",
    reviewer: null,
    rejectionReason: null,
    createdAt,
    reviewedAt: null,
    approvedAt: null,
    exportedAt: null,
  };
};

const allowedTransitions: Record<DistributionState, DistributionState[]> = {
  generated: ["reviewed", "rejected"],
  reviewed: ["approved", "rejected"],
  approved: ["manual_export_ready", "rejected"],
  rejected: [],
  manual_export_ready: [],
};

export const transitionDistributionDraft = (
  draft: DistributionDraft,
  to: DistributionState,
  actor: string,
  at: string,
  reason: string,
): { draft: DistributionDraft; audit: DistributionAuditEntry } => {
  if (!allowedTransitions[draft.state].includes(to)) {
    throw new Error(`Invalid distribution transition: ${draft.state} -> ${to}`);
  }
  if (!actor.trim()) throw new Error("A human reviewer is required.");
  if (to === "rejected" && !reason.trim()) throw new Error("A rejection reason is required.");

  const next: DistributionDraft = {
    ...draft,
    state: to,
    reviewer: actor,
    rejectionReason: to === "rejected" ? reason : draft.rejectionReason,
    reviewedAt: to === "reviewed" ? at : draft.reviewedAt,
    approvedAt: to === "approved" ? at : draft.approvedAt,
    exportedAt: to === "manual_export_ready" ? at : draft.exportedAt,
  };
  return {
    draft: next,
    audit: {
      jobId: draft.id,
      from: draft.state,
      to,
      actor,
      at,
      reason,
    },
  };
};

export const findDuplicateDrafts = (drafts: DistributionDraft[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const draft of drafts) {
    if (seen.has(draft.fingerprint)) duplicates.add(draft.fingerprint);
    seen.add(draft.fingerprint);
  }
  return [...duplicates];
};

export const createManualExport = (draft: DistributionDraft): string => {
  if (draft.state !== "manual_export_ready") throw new Error("Draft is not approved for manual export.");
  return [
    `Mode: ${draft.channelMode}`,
    `Platform: ${draft.platform}`,
    `Channel alias: ${draft.channelAlias}`,
    `Campaign: ${draft.campaign}`,
    `Fingerprint: ${draft.fingerprint}`,
    "",
    draft.copy,
    "",
    `Destination strategy: ${draft.destinationStrategy}`,
  ].join("\n");
};
