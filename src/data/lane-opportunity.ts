export type EvidenceScore = 0 | 1 | 2;

export type LanePublicationStatus =
  | "blocked_missing_source"
  | "research_only"
  | "eligible_for_editorial_review";

export interface LaneEndpoint {
  city: string;
  state: string;
  postalCode?: string;
}

export interface LaneEvidence {
  sourceIds: string[];
  reviewedAt: string;
  routeEvidence: EvidenceScore;
  competitionEvidence: EvidenceScore;
  serviceFit: EvidenceScore;
  uniqueLocalValue: EvidenceScore;
  crawlablePathAndCta: 0 | 1;
  approvedSource: 0 | 1;
}

export interface LaneOpportunityInput {
  origin: LaneEndpoint;
  destination: LaneEndpoint;
  equipment: string[];
  languages: string[];
  evidence: LaneEvidence;
}

export interface LaneOpportunityResult {
  score: number;
  threshold: 7;
  status: LanePublicationStatus;
  blockers: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function evaluateLaneOpportunity(
  input: LaneOpportunityInput,
): LaneOpportunityResult {
  const blockers: string[] = [];

  if (!hasText(input.origin.city) || !hasText(input.origin.state)) {
    blockers.push("origin is incomplete");
  }

  if (!hasText(input.destination.city) || !hasText(input.destination.state)) {
    blockers.push("destination is incomplete");
  }

  if (input.equipment.length === 0 || input.equipment.some((item) => !hasText(item))) {
    blockers.push("equipment evidence is missing");
  }

  if (input.evidence.sourceIds.length === 0) {
    blockers.push("no evidence source is attached");
  }

  if (!ISO_DATE.test(input.evidence.reviewedAt)) {
    blockers.push("reviewedAt must use YYYY-MM-DD");
  }

  const score =
    input.evidence.routeEvidence +
    input.evidence.competitionEvidence +
    input.evidence.serviceFit +
    input.evidence.uniqueLocalValue +
    input.evidence.crawlablePathAndCta +
    input.evidence.approvedSource;

  if (blockers.length > 0) {
    return {
      score,
      threshold: 7,
      status: "blocked_missing_source",
      blockers,
    };
  }

  if (score < 7) {
    return {
      score,
      threshold: 7,
      status: "research_only",
      blockers: ["publication score is below 7/10"],
    };
  }

  return {
    score,
    threshold: 7,
    status: "eligible_for_editorial_review",
    blockers: [],
  };
}
