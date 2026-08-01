export type DemandEvidenceMode =
  | "synthetic"
  | "owner_approved_sanitized"
  | "verified_public";

export type DemandResearchStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export type CarrierLaneEvidenceStatus =
  | "missing"
  | "research_only"
  | "verified";

export type VehicleTransportDemandIntentId =
  | "independent_dealer_transport"
  | "dealer_group_relocation"
  | "auction_pickup"
  | "remarketing_volume"
  | "classic_luxury_vehicle"
  | "port_storage_pickup"
  | "private_customer"
  | "broker_opportunity"
  | "recurring_volume_shipper";

export interface VehicleTransportDemandIntent {
  id: VehicleTransportDemandIntentId;
  label: string;
  requiredEvidence: string[];
  allowedScope: string[];
  prohibitedClaims: string[];
}

export interface VehicleTransportDemandRecord {
  recordId: string;
  sourceIds: string[];
  reviewedAt: string;
  evidenceMode: DemandEvidenceMode;
  intent: VehicleTransportDemandIntentId;
  laneCandidateId: string;
  carrierLaneEvidenceStatus: CarrierLaneEvidenceStatus;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  equipmentRequirement: "open" | "enclosed" | "either" | "special_review";
  operableStatus: "operable" | "inoperable" | "mixed" | "unknown";
  recurringPotential: "one_time" | "unverified_repeat_interest" | "verified_recurring_pattern" | "unknown";
  demandEvidenceReviewed: boolean;
  privacyReviewed: boolean;
}

export interface DemandResearchEvaluation {
  status: DemandResearchStatus;
  blockers: string[];
  limitations: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATE_CODE = /^[A-Z]{2}$/;

const limitations = [
  "A demand record is an internal research object, not a shipment, booking, customer commitment, or public capacity statement.",
  "Linking demand to a verified carrier lane does not prove live capacity, price, timing, acceptance, or recurring volume.",
  "Editorial eligibility never creates a page or publishes private shipment information.",
];

export const vehicleTransportDemandIntents: VehicleTransportDemandIntent[] = [
  {
    id: "independent_dealer_transport",
    label: "Independent dealer transport",
    requiredEvidence: [
      "vehicle count and general vehicle type",
      "pickup and delivery city/state",
      "operable status and equipment preference",
      "ready window and release status where relevant",
    ],
    allowedScope: [
      "prepare a transport request",
      "review route and equipment fit",
      "coordinate information for manual carrier review",
    ],
    prohibitedClaims: [
      "guaranteed carrier",
      "guaranteed rate or pickup date",
      "dealer affiliation without evidence",
    ],
  },
  {
    id: "dealer_group_relocation",
    label: "Dealer-group relocation",
    requiredEvidence: [
      "approved business relationship or public business evidence",
      "inventory count and movement pattern",
      "origin/destination markets and timing",
      "equipment and delivery-sequence requirements",
    ],
    allowedScope: [
      "research multi-location movement requirements",
      "review compatible equipment categories",
      "prepare recurring-pattern evidence for manual review",
    ],
    prohibitedClaims: [
      "guaranteed recurring volume",
      "exclusive dealer-group relationship",
      "live multi-car capacity without confirmation",
    ],
  },
  {
    id: "auction_pickup",
    label: "Auction pickup",
    requiredEvidence: [
      "actual facility and pickup city/state",
      "release status and pickup window",
      "vehicle condition, keys, and loading constraints when known",
      "storage deadline and destination market",
    ],
    allowedScope: [
      "organize pickup requirements",
      "review equipment and access constraints",
      "coordinate transport information after release review",
    ],
    prohibitedClaims: [
      "auction affiliation without evidence",
      "release or payment confirmation by Hermes",
      "guaranteed pickup before a storage deadline",
    ],
  },
  {
    id: "remarketing_volume",
    label: "Remarketing volume",
    requiredEvidence: [
      "reviewed business source",
      "vehicle mix and estimated frequency",
      "common markets or corridors",
      "documented repeat pattern before using recurring language",
    ],
    allowedScope: [
      "classify one-time versus repeat interest",
      "research equipment and route fit",
      "prepare a manually reviewed volume profile",
    ],
    prohibitedClaims: [
      "verified recurring volume without evidence",
      "guaranteed capacity",
      "guaranteed pricing or service levels",
    ],
  },
  {
    id: "classic_luxury_vehicle",
    label: "Classic and luxury vehicle transport",
    requiredEvidence: [
      "general vehicle type and condition",
      "open/enclosed preference",
      "clearance, dimensions, loose parts, or special-loading conditions",
      "verified equipment suitability before implying a match",
    ],
    allowedScope: [
      "qualify specialized transport requirements",
      "review enclosed or special-equipment fit",
      "coordinate information for qualified carrier review",
    ],
    prohibitedClaims: [
      "automatic suitability of any enclosed carrier",
      "white-glove service without approved scope",
      "guaranteed specialized capacity",
    ],
  },
  {
    id: "port_storage_pickup",
    label: "Port, terminal, yard, or storage pickup",
    requiredEvidence: [
      "third-party facility and city/state",
      "release, identification, and appointment requirements",
      "pickup hours, deadline, condition, and access constraints",
      "final destination and equipment requirement",
    ],
    allowedScope: [
      "coordinate transport information involving a third-party facility",
      "review access and release requirements",
      "identify carrier-equipment fit after manual review",
    ],
    prohibitedClaims: [
      "Hermes owns or operates the port, terminal, yard, or storage facility",
      "Hermes provides warehousing or storage",
      "Hermes controls facility fees, rules, release, or availability",
    ],
  },
  {
    id: "private_customer",
    label: "Private-customer qualification",
    requiredEvidence: [
      "pickup and delivery city/state",
      "general vehicle description and operable status",
      "open/enclosed preference and ready window",
      "facility type, access constraints, and contact consent through private intake",
    ],
    allowedScope: [
      "prepare a transport request",
      "review route and equipment requirements",
      "coordinate a manual carrier-fit review",
    ],
    prohibitedClaims: [
      "submission creates a booking",
      "guaranteed carrier or rate",
      "confirmed pickup or delivery timing",
    ],
  },
  {
    id: "broker_opportunity",
    label: "Broker opportunity qualification",
    requiredEvidence: [
      "approved broker-verification path",
      "pickup, delivery, vehicle/commodity, count, and equipment",
      "operable status, timing, documents, and unusual conditions",
      "payment terms reviewed through an approved private workflow",
    ],
    allowedScope: [
      "hold incomplete opportunities for review",
      "compare equipment and route fit",
      "prepare available terms for carrier decision",
    ],
    prohibitedClaims: [
      "broker authority is verified when it is not",
      "payment guarantee",
      "automatic carrier acceptance",
    ],
  },
  {
    id: "recurring_volume_shipper",
    label: "Recurring-volume shipper qualification",
    requiredEvidence: [
      "reviewed business identity through an approved private workflow",
      "commodity or vehicle type and estimated frequency",
      "common markets and operating requirements",
      "evidence before classification as a verified recurring pattern",
    ],
    allowedScope: [
      "classify one-time, unverified repeat interest, or verified recurring pattern",
      "research equipment and corridor fit",
      "prepare a manual commercial qualification review",
    ],
    prohibitedClaims: [
      "customer-provided estimates are guaranteed volume",
      "guaranteed capacity or rates",
      "public exposure of business or shipment details",
    ],
  },
];

const intentIds = new Set(vehicleTransportDemandIntents.map((intent) => intent.id));

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoCalendarDate(value: unknown): value is string {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validEndpoint(city: unknown, state: unknown): boolean {
  return hasText(city) && hasText(state) && STATE_CODE.test(state.trim().toUpperCase());
}

export function evaluateVehicleTransportDemand(
  record: VehicleTransportDemandRecord,
): DemandResearchEvaluation {
  const blockers: string[] = [];

  if (!hasText(record.recordId)) blockers.push("recordId is required");
  if (!Array.isArray(record.sourceIds) || !record.sourceIds.some((sourceId) => hasText(sourceId))) {
    blockers.push("demand provenance is required");
  }
  if (!isIsoCalendarDate(record.reviewedAt)) blockers.push("reviewedAt must use a valid YYYY-MM-DD date");
  if (!intentIds.has(record.intent)) blockers.push("supported demand intent is required");
  if (!hasText(record.laneCandidateId)) blockers.push("sanitized lane candidate reference is required");
  if (record.carrierLaneEvidenceStatus !== "verified") {
    blockers.push("demand may link only to verified carrier-lane evidence");
  }
  if (!validEndpoint(record.originCity, record.originState)) blockers.push("normalized origin city/state is required");
  if (!validEndpoint(record.destinationCity, record.destinationState)) blockers.push("normalized destination city/state is required");
  if (!record.demandEvidenceReviewed) blockers.push("dated demand evidence review is required");
  if (!record.privacyReviewed) blockers.push("privacy review is required");

  if (blockers.length > 0) {
    return { status: "blocked_missing_evidence", blockers, limitations };
  }

  if (record.evidenceMode === "synthetic") {
    return {
      status: "research_only",
      blockers: ["synthetic demand records cannot support public publication"],
      limitations,
    };
  }

  return {
    status: "eligible_for_editorial_review",
    blockers: [],
    limitations,
  };
}
