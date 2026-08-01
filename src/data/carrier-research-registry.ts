export type CarrierEvidenceMode =
  | "synthetic"
  | "owner_approved_sanitized"
  | "verified_public";

export type CarrierResearchStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export type CarrierEquipmentClusterId =
  | "open_car_hauler"
  | "enclosed_car_hauler"
  | "hotshot_car_hauler"
  | "multi_car_trailer";

export type CarrierOperatingStage =
  | "new_authority"
  | "active_owner_operator"
  | "small_fleet"
  | "growth_stage";

export type CarrierProblemClusterId =
  | "load_search"
  | "backhaul_deadhead"
  | "documents_setup"
  | "rate_negotiation_support"
  | "direct_shipper_dealer_development";

export type VendorResearchCategory =
  | "insurance_agent"
  | "truck_listing"
  | "trailer_listing"
  | "maintenance_service"
  | "compliance_service"
  | "technology_tool";

export interface CarrierEquipmentCluster {
  id: CarrierEquipmentClusterId;
  label: string;
  requiredEvidence: string[];
  prohibitedAssumptions: string[];
}

export interface CarrierProblemCluster {
  id: CarrierProblemClusterId;
  label: string;
  allowedSupport: string[];
  requiredEvidence: string[];
  prohibitedClaims: string[];
}

export interface VendorIntroductionBoundary {
  category: VendorResearchCategory;
  allowedActivity: string[];
  providerControls: string[];
  prohibitedClaims: string[];
}

export interface CarrierResearchRecord {
  recordId: string;
  sourceIds: string[];
  reviewedAt: string;
  evidenceMode: CarrierEvidenceMode;
  equipmentCluster: CarrierEquipmentClusterId;
  operatingStage: CarrierOperatingStage;
  problemClusters: CarrierProblemClusterId[];
  language: string;
  privacyReviewed: boolean;
  serviceScopeReviewed: boolean;
  laneCandidateId?: string;
}

export interface CarrierResearchEvaluation {
  status: CarrierResearchStatus;
  blockers: string[];
  limitations: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const limitations = [
  "A carrier research record is an internal content-research object, not a carrier approval.",
  "No research record proves current loads, rates, capacity, revenue, vendor approval, or direct freight.",
  "Eligibility for editorial review never creates a public page or changes a record to published.",
];

export const carrierEquipmentClusters: CarrierEquipmentCluster[] = [
  {
    id: "open_car_hauler",
    label: "Open car hauler",
    requiredEvidence: [
      "explicit open vehicle-transport equipment",
      "documented operating area or research lane",
      "capacity stated only when approved evidence exists",
      "operable and inoperable handling boundary",
    ],
    prohibitedAssumptions: [
      "unit capacity inferred from a photo or company name",
      "current availability",
      "guaranteed dealer or auction freight",
    ],
  },
  {
    id: "enclosed_car_hauler",
    label: "Enclosed car hauler",
    requiredEvidence: [
      "explicit enclosed vehicle-transport equipment",
      "documented dimensions and operating restrictions when relevant",
      "verified service area or research lane",
      "carrier-controlled acceptance of every shipment",
    ],
    prohibitedAssumptions: [
      "automatic suitability for luxury or classic vehicles",
      "white-glove service without approved scope",
      "current enclosed capacity",
    ],
  },
  {
    id: "hotshot_car_hauler",
    label: "Hotshot car hauler",
    requiredEvidence: [
      "explicit truck and trailer configuration",
      "documented authority and insurance review boundary",
      "verified operating area or research lane",
      "equipment and weight fit remains the carrier decision",
    ],
    prohibitedAssumptions: [
      "authority, insurance, weight, or equipment compliance approval",
      "guaranteed first load",
      "capacity inferred without documentation",
    ],
  },
  {
    id: "multi_car_trailer",
    label: "Multi-car trailer",
    requiredEvidence: [
      "explicit multi-unit vehicle-transport equipment",
      "documented unit count before using a capacity modifier",
      "verified operating area or research lane",
      "loading sequence and equipment fit remain operational review items",
    ],
    prohibitedAssumptions: [
      "specific unit count without approved evidence",
      "full-trailer availability",
      "guaranteed recurring volume",
    ],
  },
];

export const carrierProblemClusters: CarrierProblemCluster[] = [
  {
    id: "load_search",
    label: "Load search",
    allowedSupport: [
      "research opportunities against approved equipment and operating preferences",
      "organize available information for carrier review",
      "preserve carrier approval before booking",
    ],
    requiredEvidence: [
      "verified equipment class",
      "current operating area supplied through an approved private channel",
      "carrier-defined timing and route constraints",
    ],
    prohibitedClaims: [
      "guaranteed loads",
      "guaranteed mileage",
      "public current-capacity statements",
    ],
  },
  {
    id: "backhaul_deadhead",
    label: "Backhaul and deadhead research",
    allowedSupport: [
      "review return-market options",
      "compare disclosed deadhead and schedule constraints",
      "prepare transparent research notes for carrier decision",
    ],
    requiredEvidence: [
      "confirmed current destination or reviewed historical lane",
      "equipment fit",
      "dated source provenance",
    ],
    prohibitedClaims: [
      "guaranteed return load",
      "guaranteed empty-mile reduction",
      "claimed savings without a reviewed method",
    ],
  },
  {
    id: "documents_setup",
    label: "Documents and setup",
    allowedSupport: [
      "organize carrier-packet requirements",
      "coordinate approved document workflow",
      "identify missing information for manual review",
    ],
    requiredEvidence: [
      "current signed service scope",
      "approved document checklist",
      "secure handling path outside public content",
    ],
    prohibitedClaims: [
      "authority approval",
      "insurance approval",
      "broker acceptance guarantee",
    ],
  },
  {
    id: "rate_negotiation_support",
    label: "Rate-negotiation support",
    allowedSupport: [
      "organize available load and route inputs",
      "support communication within the signed scope",
      "present terms for final carrier decision",
    ],
    requiredEvidence: [
      "approved operating scope",
      "carrier-controlled minimums and constraints kept private",
      "separate posted, negotiated, and booked values in internal systems",
    ],
    prohibitedClaims: [
      "guaranteed rate",
      "guaranteed gross or net income",
      "publication of individual private rates",
    ],
  },
  {
    id: "direct_shipper_dealer_development",
    label: "Direct shipper and dealer development",
    allowedSupport: [
      "research potential relationships around verified equipment and markets",
      "identify decision-maker roles without publishing private identities",
      "maintain a separate long-term business-development workflow",
    ],
    requiredEvidence: [
      "verified carrier equipment and service area",
      "approved outreach scope",
      "approximate timeline and manual qualification process",
    ],
    prohibitedClaims: [
      "guaranteed direct customers",
      "guaranteed direct freight",
      "guaranteed response, exclusivity, or recurring volume",
    ],
  },
];

export const vendorIntroductionBoundaries: VendorIntroductionBoundary[] = [
  "insurance_agent",
  "truck_listing",
  "trailer_listing",
  "maintenance_service",
  "compliance_service",
  "technology_tool",
].map((category) => ({
  category: category as VendorResearchCategory,
  allowedActivity: [
    "research public or owner-approved provider information",
    "prepare a comparison for carrier review",
    "make an introduction only through an approved manual process",
  ],
  providerControls: [
    "eligibility and approval",
    "pricing and terms",
    "inventory, underwriting, financing, condition, and service decisions where applicable",
  ],
  prohibitedClaims: [
    "guaranteed approval",
    "guaranteed price or availability",
    "undocumented referral relationship or compensation",
  ],
}));

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoCalendarDate(value: unknown): value is string {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const equipmentIds = new Set(carrierEquipmentClusters.map((item) => item.id));
const problemIds = new Set(carrierProblemClusters.map((item) => item.id));

export function evaluateCarrierResearchRecord(
  record: CarrierResearchRecord,
): CarrierResearchEvaluation {
  const blockers: string[] = [];

  if (!hasText(record.recordId)) blockers.push("recordId is required");
  if (!Array.isArray(record.sourceIds) || !record.sourceIds.some((sourceId) => hasText(sourceId))) {
    blockers.push("source provenance is required");
  }
  if (!isIsoCalendarDate(record.reviewedAt)) {
    blockers.push("reviewedAt must use a valid YYYY-MM-DD date");
  }
  if (!equipmentIds.has(record.equipmentCluster)) {
    blockers.push("supported equipment cluster is required");
  }
  if (!Array.isArray(record.problemClusters) || record.problemClusters.length === 0) {
    blockers.push("at least one carrier problem cluster is required");
  } else if (record.problemClusters.some((problem) => !problemIds.has(problem))) {
    blockers.push("unsupported carrier problem cluster");
  }
  if (!hasText(record.language)) blockers.push("language scope is required");
  if (!record.privacyReviewed) blockers.push("privacy review is required");
  if (!record.serviceScopeReviewed) blockers.push("service-scope review is required");

  if (blockers.length > 0) {
    return { status: "blocked_missing_evidence", blockers, limitations };
  }

  if (record.evidenceMode === "synthetic") {
    return {
      status: "research_only",
      blockers: ["synthetic records cannot support public publication"],
      limitations,
    };
  }

  return {
    status: "eligible_for_editorial_review",
    blockers: [],
    limitations,
  };
}
