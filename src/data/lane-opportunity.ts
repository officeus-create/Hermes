export type EvidenceScore = 0 | 1 | 2;

export type LaneEvidenceMode =
  | "synthetic"
  | "owner_approved_sanitized"
  | "verified_public";

export type RouteEvidenceBasis =
  | "completed_history"
  | "verified_public_source"
  | "current_offer_observation";

export type LanePublicationStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export interface LaneEndpoint {
  city: string;
  state: string;
}

export interface LaneEvidenceDimension {
  score: EvidenceScore;
  sourceIds: string[];
  reviewedAt: string;
}

export interface LaneEvidence {
  mode: LaneEvidenceMode;
  routeBasis: RouteEvidenceBasis;
  routeEvidence: LaneEvidenceDimension;
  demandEvidence: LaneEvidenceDimension;
  competitionEvidence: LaneEvidenceDimension;
  operationalFit: LaneEvidenceDimension;
  uniqueLocalValue: LaneEvidenceDimension;
  approvedSources: boolean;
  privacyReviewed: boolean;
  crawlablePathAndCta: boolean;
}

export interface LaneOpportunityInput {
  origin: LaneEndpoint;
  destination: LaneEndpoint;
  equipment: string[];
  languages: string[];
  evidence: LaneEvidence;
}

export interface LaneScoreBreakdown {
  routeEvidence: EvidenceScore;
  demandEvidence: EvidenceScore;
  competitionEvidence: EvidenceScore;
  operationalFit: EvidenceScore;
  uniqueLocalValue: EvidenceScore;
}

export interface LaneOpportunityResult {
  score: number;
  maximumScore: 10;
  threshold: 7;
  status: LanePublicationStatus;
  breakdown: LaneScoreBreakdown;
  blockers: string[];
  limitations: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATE_CODE = /^[A-Z]{2}$/;
const THRESHOLD = 7 as const;
const MAXIMUM_SCORE = 10 as const;

const dimensions = [
  ["routeEvidence", "route evidence"],
  ["demandEvidence", "demand evidence"],
  ["competitionEvidence", "competition evidence"],
  ["operationalFit", "operational fit"],
  ["uniqueLocalValue", "unique local value"],
] as const;

const limitations = [
  "Eligibility is an internal research result, not publication approval.",
  "No completed, verified, or scored record automatically becomes published.",
  "Current load-board offers do not prove completed routes, capacity, rates, or availability.",
];

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isEvidenceScore(value: unknown): value is EvidenceScore {
  return value === 0 || value === 1 || value === 2;
}

function isIsoCalendarDate(value: unknown): value is string {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateEndpoint(label: string, endpoint: LaneEndpoint, blockers: string[]): void {
  if (!hasText(endpoint?.city)) blockers.push(`${label} city is missing`);
  if (!hasText(endpoint?.state) || !STATE_CODE.test(endpoint.state.trim().toUpperCase())) {
    blockers.push(`${label} state must use a two-letter code`);
  }
}

function safeScore(value: unknown): EvidenceScore {
  return isEvidenceScore(value) ? value : 0;
}

export function evaluateLaneOpportunity(input: LaneOpportunityInput): LaneOpportunityResult {
  const blockers: string[] = [];

  validateEndpoint("origin", input.origin, blockers);
  validateEndpoint("destination", input.destination, blockers);

  if (!Array.isArray(input.equipment) || input.equipment.length === 0 || input.equipment.some((item) => !hasText(item))) {
    blockers.push("equipment evidence is missing");
  }

  if (!Array.isArray(input.languages) || input.languages.length === 0 || input.languages.some((item) => !hasText(item))) {
    blockers.push("language scope is missing");
  }

  for (const [key, label] of dimensions) {
    const dimension = input.evidence?.[key];

    if (!dimension || typeof dimension !== "object") {
      blockers.push(`${label} is missing`);
      continue;
    }

    if (!isEvidenceScore(dimension.score)) {
      blockers.push(`${label} score must be 0, 1, or 2`);
    }

    if (!Array.isArray(dimension.sourceIds) || !dimension.sourceIds.some((sourceId) => hasText(sourceId))) {
      blockers.push(`${label} provenance is missing`);
    }

    if (!isIsoCalendarDate(dimension.reviewedAt)) {
      blockers.push(`${label} reviewedAt must use a valid YYYY-MM-DD date`);
    }
  }

  if (!input.evidence?.approvedSources) {
    blockers.push("approved source review is required");
  }

  if (!input.evidence?.privacyReviewed) {
    blockers.push("privacy review is required");
  }

  if (!input.evidence?.crawlablePathAndCta) {
    blockers.push("crawlable path and useful CTA are required");
  }

  const breakdown: LaneScoreBreakdown = {
    routeEvidence: safeScore(input.evidence?.routeEvidence?.score),
    demandEvidence: safeScore(input.evidence?.demandEvidence?.score),
    competitionEvidence: safeScore(input.evidence?.competitionEvidence?.score),
    operationalFit: safeScore(input.evidence?.operationalFit?.score),
    uniqueLocalValue: safeScore(input.evidence?.uniqueLocalValue?.score),
  };

  const score = Object.values(breakdown).reduce<number>((total, value) => total + value, 0);

  if (blockers.length > 0) {
    return {
      score,
      maximumScore: MAXIMUM_SCORE,
      threshold: THRESHOLD,
      status: "blocked_missing_evidence",
      breakdown,
      blockers,
      limitations,
    };
  }

  const researchOnlyReasons: string[] = [];

  if (input.evidence.mode === "synthetic") {
    researchOnlyReasons.push("synthetic evidence cannot support public publication");
  }

  if (input.evidence.routeBasis === "current_offer_observation") {
    researchOnlyReasons.push("current load-board observations are not confirmed route evidence");
  }

  if (score < THRESHOLD) {
    researchOnlyReasons.push("publication score is below 7/10");
  }

  if (researchOnlyReasons.length > 0) {
    return {
      score,
      maximumScore: MAXIMUM_SCORE,
      threshold: THRESHOLD,
      status: "research_only",
      breakdown,
      blockers: researchOnlyReasons,
      limitations,
    };
  }

  return {
    score,
    maximumScore: MAXIMUM_SCORE,
    threshold: THRESHOLD,
    status: "eligible_for_editorial_review",
    breakdown,
    blockers: [],
    limitations,
  };
}
