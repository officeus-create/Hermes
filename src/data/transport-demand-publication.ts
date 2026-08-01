import type { VehicleTransportDemandIntentId } from "./vehicle-transport-demand-registry";

export type DemandPublicationEvidenceMode =
  | "synthetic"
  | "owner_approved_sanitized"
  | "verified_public";

export type DemandPublicationStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export interface DatedEvidenceReference {
  sourceIds: string[];
  reviewedAt: string;
}

export interface CarrierCapacityEvidence extends DatedEvidenceReference {
  status: "unconfirmed" | "research_only" | "manually_confirmed_for_review";
  basis: "completed_history" | "manual_capacity_confirmation" | "current_offer_observation";
  expiresAt?: string;
}

export interface DemandPublicationCandidate {
  candidateId: string;
  evidenceMode: DemandPublicationEvidenceMode;
  demandIntent: VehicleTransportDemandIntentId;
  laneCandidateId: string;
  carrierCapacity: CarrierCapacityEvidence;
  localDemand: DatedEvidenceReference;
  competition: DatedEvidenceReference;
  uniqueOperationalGuidance: string[];
  carrierPagePath: string;
  demandPagePath: string;
  usefulCtaId: string;
  privacyReviewed: boolean;
  claimsReviewed: boolean;
}

export interface DemandPublicationEvaluation {
  status: DemandPublicationStatus;
  blockers: string[];
  limitations: string[];
}

export interface DemandCtaVariant {
  id: string;
  audience: "dealer" | "shipper" | "broker" | "private_customer";
  label: string;
  destination: string;
  disclosure: string;
}

export interface LanePairLinkRule {
  id: string;
  requiredSharedEvidence: string[];
  requiredLinks: string[];
  prohibitedInterpretations: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const reviewOnlyDisclosure =
  "Submission begins a manual review. It does not create a booking or guarantee a carrier, capacity, rate, pickup date, delivery date, recurring volume, or acceptance.";

export const demandCtaVariants: DemandCtaVariant[] = [
  {
    id: "dealer-demand-review",
    audience: "dealer",
    label: "Share the vehicles, pickup market, destination, condition, release status, and ready date for review.",
    destination: "/logistics/dealer-vehicle-transportation/",
    disclosure: reviewOnlyDisclosure,
  },
  {
    id: "shipper-demand-review",
    audience: "shipper",
    label: "Describe the vehicle types, estimated frequency, common markets, timing, and operating requirements for review.",
    destination: "/logistics/shipper-dealer/",
    disclosure: reviewOnlyDisclosure,
  },
  {
    id: "broker-opportunity-review",
    audience: "broker",
    label: "Submit the route, vehicle or commodity, equipment requirement, timing, and verification details for review.",
    destination: "/logistics/broker/",
    disclosure: reviewOnlyDisclosure,
  },
  {
    id: "private-customer-review",
    audience: "private_customer",
    label: "Prepare the pickup and delivery markets, vehicle condition, equipment preference, and ready date for review.",
    destination: "/paths/logistics/customers/vehicle-transport/",
    disclosure: reviewOnlyDisclosure,
  },
];

export const lanePairLinkRules: LanePairLinkRule[] = [
  {
    id: "verified-lane-demand-pair",
    requiredSharedEvidence: [
      "reviewed route or corridor",
      "equipment or vehicle category",
      "service area or market",
      "dated carrier evidence",
      "dated demand evidence",
    ],
    requiredLinks: [
      "logistics hub to carrier service page",
      "logistics hub to customer or dealer page",
      "carrier page to related demand page",
      "demand page to related carrier or equipment page",
      "both pages to direct contact or approved intake",
      "supporting checklist to relevant commercial page",
    ],
    prohibitedInterpretations: [
      "an internal link proves live capacity",
      "an internal link proves current demand",
      "paired pages guarantee a rate, load, booking, or recurring volume",
    ],
  },
];

export const customerDemandMeasurement = {
  searchConsoleMetrics: [
    "impressions",
    "clicks",
    "CTR",
    "average position",
    "query family",
    "canonical demand page",
    "competing Hermes pages",
  ],
  ga4Events: ["logistics_cta_click", "contact_click"],
  qualifiedDemandDefinition:
    "Count qualified customer demand only from an approved internal aggregate after manual review of intent, route, equipment, timing, consent, and business fit.",
  clickBoundary: "A CTA or contact click is not a qualified transport request.",
  prohibitedAnalyticsData: [
    "name",
    "phone",
    "email",
    "company",
    "exact address",
    "VIN",
    "gate code",
    "account or order number",
    "free-form message",
    "individual rate",
    "shipment document",
    "customer, broker, or carrier identity",
  ],
  cannibalizationRules: [
    "assign one preferred page per primary demand intent",
    "compare query and page filters in Search Console",
    "keep lane pages separate only when evidence and unique guidance are distinct",
    "improve titles, headings, anchors, and content before consolidation",
    "do not delete or redirect without owner approval",
  ],
} as const;

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoCalendarDate(value: unknown): value is string {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateDatedEvidence(
  label: string,
  evidence: DatedEvidenceReference,
  blockers: string[],
): void {
  if (!Array.isArray(evidence?.sourceIds) || !evidence.sourceIds.some((sourceId) => hasText(sourceId))) {
    blockers.push(`${label} provenance is required`);
  }
  if (!isIsoCalendarDate(evidence?.reviewedAt)) {
    blockers.push(`${label} reviewedAt must use a valid YYYY-MM-DD date`);
  }
}

export function evaluateDemandPublicationCandidate(
  candidate: DemandPublicationCandidate,
): DemandPublicationEvaluation {
  const blockers: string[] = [];

  if (!hasText(candidate.candidateId)) blockers.push("candidateId is required");
  if (!hasText(candidate.laneCandidateId)) blockers.push("lane candidate reference is required");
  if (!hasText(candidate.carrierPagePath) || !candidate.carrierPagePath.startsWith("/")) {
    blockers.push("carrier page path is required");
  }
  if (!hasText(candidate.demandPagePath) || !candidate.demandPagePath.startsWith("/")) {
    blockers.push("demand page path is required");
  }
  if (!hasText(candidate.usefulCtaId) || !demandCtaVariants.some((cta) => cta.id === candidate.usefulCtaId)) {
    blockers.push("approved demand CTA is required");
  }

  validateDatedEvidence("carrier capacity", candidate.carrierCapacity, blockers);
  validateDatedEvidence("local demand", candidate.localDemand, blockers);
  validateDatedEvidence("competition", candidate.competition, blockers);

  if (candidate.carrierCapacity.status !== "manually_confirmed_for_review") {
    blockers.push("real carrier capacity must be manually confirmed before editorial review");
  }
  if (candidate.carrierCapacity.basis === "current_offer_observation") {
    blockers.push("current offer observations cannot confirm carrier capacity");
  }
  if (!isIsoCalendarDate(candidate.carrierCapacity.expiresAt)) {
    blockers.push("manual capacity confirmation requires a valid expiry date");
  }
  if (!Array.isArray(candidate.uniqueOperationalGuidance) || candidate.uniqueOperationalGuidance.length < 3) {
    blockers.push("at least three unique operational guidance points are required");
  } else if (candidate.uniqueOperationalGuidance.some((item) => !hasText(item))) {
    blockers.push("unique operational guidance cannot be empty");
  }
  if (!candidate.privacyReviewed) blockers.push("privacy review is required");
  if (!candidate.claimsReviewed) blockers.push("claims review is required");

  const limitations = [
    "Manual capacity confirmation is time-limited and internal; it is not a public availability promise.",
    "Dated demand and competition evidence support editorial review only, not a booking or performance guarantee.",
    "No candidate automatically creates a page, sitemap entry, customer record, or carrier assignment.",
  ];

  if (blockers.length > 0) {
    return { status: "blocked_missing_evidence", blockers, limitations };
  }

  if (candidate.evidenceMode === "synthetic") {
    return {
      status: "research_only",
      blockers: ["synthetic publication candidates cannot support public publication"],
      limitations,
    };
  }

  return { status: "eligible_for_editorial_review", blockers: [], limitations };
}
