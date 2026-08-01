export const LANE_INTELLIGENCE_AUTHENTICATION_IMPLEMENTED = false;
export const LANE_INTELLIGENCE_PRODUCTION_DATA_ENABLED = false;
export const LANE_INTELLIGENCE_REAL_CONNECTORS_ENABLED = false;

export type LaneIntelligenceSurface = "public_demo" | "internal_workspace";
export type LaneDatasetClass = "synthetic" | "owner_approved_sanitized" | "restricted_operational";
export type LaneAccessRole = "anonymous" | "dispatcher" | "carrier" | "reviewer";
export type LaneCapability = "read_only" | "import_preview" | "publish_review" | "write";

export type LaneAccessRequest = Readonly<{
  surface: LaneIntelligenceSurface;
  datasetClass: LaneDatasetClass;
  role: LaneAccessRole;
  capability: LaneCapability;
  authenticated?: boolean;
  sourceApproved?: boolean;
  subjectScopeMatched?: boolean;
}>;

export type LaneAccessDecision = Readonly<{
  allowed: boolean;
  reason: string;
  externalActionPerformed: false;
}>;

export type SanitizedLanePublicationStatus = "research_only" | "reviewed" | "approved_for_publication";

export type SanitizedLaneRecord = Readonly<{
  laneId: string;
  originRegion: string;
  destinationRegion: string;
  equipmentClass: string;
  periodStart: string;
  periodEnd: string;
  completedShipmentCount: number;
  medianLoadedMiles: number;
  medianDeadheadMiles: number;
  publicationStatus: SanitizedLanePublicationStatus;
  provenance: Readonly<{
    sourceType: "synthetic" | "owner_approved_sanitized_export";
    sourceDate: string;
    reviewDate: string;
  }>;
}>;

export type SanitizedLaneValidation = Readonly<{
  valid: boolean;
  errors: readonly string[];
  value?: SanitizedLaneRecord;
}>;

const forbiddenLaneFields = new Set([
  "carrier",
  "carrier_name",
  "customer",
  "customer_name",
  "broker",
  "broker_name",
  "shipper",
  "shipper_name",
  "contact",
  "contact_name",
  "email",
  "phone",
  "mc",
  "dot",
  "vin",
  "pickup_address",
  "delivery_address",
  "exact_address",
  "order_id",
  "invoice",
  "invoice_id",
  "bol",
  "pod",
  "notes",
  "comments",
  "posted_rate",
  "negotiated_rate",
  "booked_rate",
  "commission",
  "live_position",
]);

function deny(reason: string): LaneAccessDecision {
  return Object.freeze({ allowed: false, reason, externalActionPerformed: false });
}

function allow(reason: string): LaneAccessDecision {
  return Object.freeze({ allowed: true, reason, externalActionPerformed: false });
}

export function evaluateLaneIntelligenceAccess(request: LaneAccessRequest): LaneAccessDecision {
  if (request.capability === "write") return deny("Lane Intelligence writes are disabled");
  if (request.datasetClass === "restricted_operational") {
    return deny("Restricted operational data is outside the current prototype boundary");
  }

  if (request.surface === "public_demo") {
    if (request.datasetClass !== "synthetic") return deny("The public demo accepts synthetic data only");
    if (request.capability !== "read_only") return deny("The public demo is read-only");
    return allow("Synthetic read-only demo access is allowed without an operational data connection");
  }

  if (!LANE_INTELLIGENCE_AUTHENTICATION_IMPLEMENTED) {
    return deny("Internal workspace access remains disabled until authentication is implemented and reviewed");
  }
  if (!request.authenticated) return deny("Authentication is required for the internal workspace");
  if (!request.sourceApproved) return deny("The dataset source requires owner approval");

  if (request.role === "carrier" && !request.subjectScopeMatched) {
    return deny("Carrier access requires an explicit subject-scope match");
  }
  if (request.role === "anonymous") return deny("Anonymous access is not allowed in the internal workspace");
  if (request.capability === "publish_review" && request.role !== "reviewer") {
    return deny("Publication review is restricted to the reviewer role");
  }

  return allow("Request satisfies the documented internal access boundary");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPublicationStatus(value: unknown): value is SanitizedLanePublicationStatus {
  return value === "research_only" || value === "reviewed" || value === "approved_for_publication";
}

export function validateSanitizedLaneRecord(input: unknown): SanitizedLaneValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return Object.freeze({ valid: false, errors: Object.freeze(["record must be an object"]) });
  }

  const record = input as Record<string, unknown>;
  const errors: string[] = [];
  const forbidden = Object.keys(record).filter((key) => forbiddenLaneFields.has(key.toLowerCase()));
  if (forbidden.length) errors.push(`forbidden fields: ${forbidden.sort().join(", ")}`);

  for (const field of ["laneId", "originRegion", "destinationRegion", "equipmentClass", "periodStart", "periodEnd"] as const) {
    if (!isNonEmptyString(record[field])) errors.push(`${field} is required`);
  }
  for (const field of ["completedShipmentCount", "medianLoadedMiles", "medianDeadheadMiles"] as const) {
    if (!isNonNegativeFiniteNumber(record[field])) errors.push(`${field} must be a non-negative finite number`);
  }
  if (!isPublicationStatus(record.publicationStatus)) errors.push("publicationStatus is invalid");

  const provenance = record.provenance;
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    errors.push("provenance is required");
  } else {
    const source = provenance as Record<string, unknown>;
    if (source.sourceType !== "synthetic" && source.sourceType !== "owner_approved_sanitized_export") {
      errors.push("provenance.sourceType is invalid");
    }
    if (!isNonEmptyString(source.sourceDate)) errors.push("provenance.sourceDate is required");
    if (!isNonEmptyString(source.reviewDate)) errors.push("provenance.reviewDate is required");
  }

  if (errors.length) return Object.freeze({ valid: false, errors: Object.freeze(errors) });

  const validRecord: SanitizedLaneRecord = Object.freeze({
    laneId: record.laneId as string,
    originRegion: record.originRegion as string,
    destinationRegion: record.destinationRegion as string,
    equipmentClass: record.equipmentClass as string,
    periodStart: record.periodStart as string,
    periodEnd: record.periodEnd as string,
    completedShipmentCount: record.completedShipmentCount as number,
    medianLoadedMiles: record.medianLoadedMiles as number,
    medianDeadheadMiles: record.medianDeadheadMiles as number,
    publicationStatus: record.publicationStatus as SanitizedLanePublicationStatus,
    provenance: Object.freeze({
      sourceType: (record.provenance as Record<string, unknown>).sourceType as SanitizedLaneRecord["provenance"]["sourceType"],
      sourceDate: (record.provenance as Record<string, unknown>).sourceDate as string,
      reviewDate: (record.provenance as Record<string, unknown>).reviewDate as string,
    }),
  });

  return Object.freeze({ valid: true, errors: Object.freeze([]), value: validRecord });
}
