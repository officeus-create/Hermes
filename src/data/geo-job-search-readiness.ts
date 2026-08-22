import { isVacancyEligibleForJobPosting, publicVacancyRegistry } from "./careers-governance.ts";
import { geoFreshGscCheckpoint20260819, validateGeoGscExactCheckpoint } from "./geo-gsc-fresh-checkpoint.ts";

export const firstJobVacancyId = "car-hauling-dispatcher-2026" as const;
export const firstJobCanonicalOwner = "/careers/car-hauling-dispatcher/" as const;

const firstJob = publicVacancyRegistry.find((item) => item.id === firstJobVacancyId);
if (!firstJob) throw new Error("First public vacancy is missing from careers governance");

export type GeoJobEvidenceState = "not_provided" | "owner_provided_handoff" | "platform_verified";
export type GeoJobEvidenceType = "url_inspection" | "jobposting_enhancement" | "bing_exact_url";

export interface GeoJobEvidenceSlot {
  type: GeoJobEvidenceType;
  canonicalOwner: string;
  state: GeoJobEvidenceState;
  checkedAt: string | null;
  evidenceReference: string | null;
  detail: string;
}

export const firstJobEvidenceSlots: GeoJobEvidenceSlot[] = [
  {
    type: "url_inspection",
    canonicalOwner: firstJobCanonicalOwner,
    state: "not_provided",
    checkedAt: null,
    evidenceReference: null,
    detail: "Authenticated Google URL Inspection evidence for the exact public job URL has not been supplied.",
  },
  {
    type: "jobposting_enhancement",
    canonicalOwner: firstJobCanonicalOwner,
    state: "not_provided",
    checkedAt: null,
    evidenceReference: null,
    detail: "Authenticated Google JobPosting enhancement evidence has not been supplied.",
  },
  {
    type: "bing_exact_url",
    canonicalOwner: firstJobCanonicalOwner,
    state: "not_provided",
    checkedAt: null,
    evidenceReference: null,
    detail: "Exact Bing URL evidence is pending. IndexNow submission or acceptance is not treated as indexation/performance proof.",
  },
];

export const validateFirstJobEvidenceSlots = (slots: GeoJobEvidenceSlot[] = firstJobEvidenceSlots) => {
  if (new Set(slots.map((item) => item.type)).size !== slots.length) throw new Error("Duplicate public job evidence slot");
  for (const slot of slots) {
    if (slot.canonicalOwner !== firstJobCanonicalOwner) throw new Error("Public job evidence owner mismatch");
    if (slot.state === "platform_verified") {
      if (!slot.checkedAt || !Number.isFinite(Date.parse(slot.checkedAt))) throw new Error(`${slot.type} requires a checkedAt timestamp`);
      if (!slot.evidenceReference?.trim()) throw new Error(`${slot.type} requires an evidence reference`);
    }
    if (slot.state === "not_provided" && (slot.checkedAt || slot.evidenceReference)) throw new Error(`${slot.type} not_provided slot cannot carry verification metadata`);
  }
  return slots;
};

export const auditFirstJobPostingContract = () => ({
  vacancyId: firstJob.id,
  canonicalOwner: `/careers/${firstJob.slug}/`,
  isFirstCanonicalOwner: `/careers/${firstJob.slug}/` === firstJobCanonicalOwner,
  eligibleForJobPosting: isVacancyEligibleForJobPosting(firstJob),
  verifiedOpen: firstJob.status === "verified_open",
  publicationApproved: firstJob.ownerApprovedForPublication,
  descriptionEvidencePresent: firstJob.descriptionSourceIds.length > 0,
  compensationClaimsSuppressed: firstJob.compensationSourceIds.length === 0,
  liveExternalSubmission: Boolean(firstJob.submissionUrl?.startsWith("https://")),
  hermesApplicationIsPreparationRoute: Boolean(firstJob.applicationPath?.startsWith("/")),
  directApply: false as const,
});

export const buildFirstJobFreshSearchCheckpoint = () => {
  const checkpoint = geoFreshGscCheckpoint20260819;
  validateGeoGscExactCheckpoint(checkpoint);
  const organic = checkpoint.pages.find((item) => item.canonicalOwner === firstJobCanonicalOwner);
  const googleJobs = checkpoint.searchAppearances.find((item) => item.appearance === "Job listings");
  if (!organic || !googleJobs) throw new Error("Fresh checkpoint is missing first-job search evidence");
  return {
    schemaVersion: "geo_job_search_checkpoint_v1" as const,
    exactWindow: {
      startDate: checkpoint.startDate,
      endDate: checkpoint.endDate,
      inclusiveDays: checkpoint.inclusiveDays,
      evidenceClass: checkpoint.evidenceClass,
    },
    organicBlueLink: {
      canonicalOwner: firstJobCanonicalOwner,
      impressions: organic.impressions,
      clicks: organic.clicks,
      ctr: organic.ctr,
      averagePosition: organic.averagePosition,
    },
    googleJobsAppearance: {
      impressions: googleJobs.impressions,
      clicks: googleJobs.clicks,
      ctr: googleJobs.ctr,
      averagePosition: googleJobs.averagePosition,
    },
    channelsSeparated: true as const,
    note: "Organic blue-link and Google Jobs appearance evidence are separate channels and must not be averaged together.",
  };
};

export interface GeoJobPublicApplicationSemantics {
  liveSubmissionUrl: string;
  hermesPreparationPath: string;
  preparationRouteTransmitsData: boolean;
  humanReviewStatementPresent: boolean;
  noOutcomeGuaranteeStatementPresent: boolean;
}

export const auditFirstJobPublicApplicationSemantics = (input: GeoJobPublicApplicationSemantics = {
  liveSubmissionUrl: firstJob.submissionUrl ?? "",
  hermesPreparationPath: firstJob.applicationPath ?? "",
  preparationRouteTransmitsData: false,
  humanReviewStatementPresent: true,
  noOutcomeGuaranteeStatementPresent: true,
}) => ({
  liveSubmissionReady: input.liveSubmissionUrl.startsWith("https://"),
  hermesPreparationClearlySeparate: input.hermesPreparationPath.startsWith("/") && !input.preparationRouteTransmitsData,
  humanReviewStatementPresent: input.humanReviewStatementPresent,
  noOutcomeGuaranteeStatementPresent: input.noOutcomeGuaranteeStatementPresent,
  ready:
    input.liveSubmissionUrl.startsWith("https://") &&
    input.hermesPreparationPath.startsWith("/") &&
    !input.preparationRouteTransmitsData &&
    input.humanReviewStatementPresent &&
    input.noOutcomeGuaranteeStatementPresent,
});

export interface GeoJobDiscoveryEdge {
  sourceOwner: string;
  targetOwner: string;
  sourceType: "careers_hub" | "logistics_hub" | "academy" | "homepage" | "sitemap";
  evidenceReference: string;
}

export const auditFirstJobDiscovery = (edges: GeoJobDiscoveryEdge[]) => {
  const inbound = edges.filter((edge) => edge.targetOwner === firstJobCanonicalOwner);
  const human = inbound.filter((edge) => edge.sourceType !== "sitemap");
  const careersHub = inbound.some((edge) => edge.sourceType === "careers_hub");
  return {
    inboundCount: inbound.length,
    humanDiscoveryCount: human.length,
    careersHubLinkVerified: careersHub,
    sitemapOnly: inbound.length > 0 && human.length === 0,
    gap: careersHub ? null : "careers_hub_to_first_job_link_not_verified",
  };
};

export interface GeoSecondJobPublicationEvidence {
  roleKey: string;
  publicTitle: string;
  distinctFromExistingRole: boolean;
  rolePublicationApproved: boolean;
  roleNeedEvidenceReferences: string[];
  descriptionEvidenceReferences: string[];
  liveSubmissionRouteReady: boolean;
  publicRoleFactsComplete: boolean;
  responsibilities: string[];
  copiedResponsibilityRatio: number;
}

export const evaluateSecondJobPublicationGate = (input: GeoSecondJobPublicationEvidence) => {
  if (!input.roleKey.trim() || !input.publicTitle.trim()) throw new Error("Second public job candidate requires role key and title");
  if (!Number.isFinite(input.copiedResponsibilityRatio) || input.copiedResponsibilityRatio < 0 || input.copiedResponsibilityRatio > 1) throw new Error("copiedResponsibilityRatio must be between 0 and 1");
  const gaps: string[] = [];
  if (!input.distinctFromExistingRole) gaps.push("role_not_distinct");
  if (!input.rolePublicationApproved) gaps.push("publication_approval_missing");
  if (!input.roleNeedEvidenceReferences.length) gaps.push("distinct_role_need_evidence_missing");
  if (!input.descriptionEvidenceReferences.length) gaps.push("description_evidence_missing");
  if (!input.liveSubmissionRouteReady) gaps.push("live_submission_route_missing");
  if (!input.publicRoleFactsComplete) gaps.push("public_role_facts_incomplete");
  if (input.responsibilities.length < 3) gaps.push("responsibilities_too_thin");
  if (input.copiedResponsibilityRatio > 0.5) gaps.push("thin_or_cloned_job_content");
  return {
    publishable: gaps.length === 0,
    state: gaps.length ? "hold_second_job" as const : "distinct_verified_public_role" as const,
    gaps,
    reason: gaps.length
      ? "Do not create another public job page from keyword opportunity, generic interest, or a clone of the first role."
      : "A distinct second role may proceed through the same verified-open public vacancy and production validation gates.",
  };
};

validateFirstJobEvidenceSlots();
