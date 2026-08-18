import type { GeoOutcomeAggregate, GeoWindowDays } from "./geo-measurement-layer.ts";
import {
  adaptExactSearchCheckpoint,
  type CanonicalCommercialAnalyticsEvent,
  type GeoAnalyticsEventAggregate,
  type GeoExactSearchCheckpoint,
  type GeoFunnelFamily,
  type GeoSearchEvidenceClass,
} from "./geo-measurement-adapters.ts";

const searchFields = new Set([
  "source",
  "page_path",
  "discovery_type",
  "start_date",
  "end_date",
  "impressions",
  "clicks",
  "evidence_class",
]);
const analyticsFields = new Set([
  "family",
  "window_days",
  "journey_path",
  "event_page_path",
  "event_name",
  "count",
  "evidence_class",
  "observed_at",
]);
const outcomeFields = new Set([
  "window_days",
  "page_path",
  "reviewed_inquiries",
  "qualified_leads",
  "opportunities",
  "wins",
  "losses",
  "revenue_reconciled_wins",
  "evidence_class",
  "observed_at",
]);

const searchSources = new Set(["google", "bing"] as const);
const discoveryTypes = new Set(["branded", "non_branded"] as const);
const standardWindows = new Set([7, 28, 90] as const);
const searchEvidenceClasses = new Set<GeoSearchEvidenceClass>([
  "platform_verified",
  "owner_provided_handoff",
  "unverified",
]);
const outcomeEvidenceClasses = new Set([
  "private_operations_verified",
  "owner_provided_handoff",
  "unverified",
] as const);
const funnelFamilies = new Set<GeoFunnelFamily>([
  "carrier",
  "vehicle_transport",
  "seo",
  "website_project",
]);
const analyticsEvents = new Set<CanonicalCommercialAnalyticsEvent>([
  "commercial_cta_click",
  "carrier_intake_start",
  "carrier_intake_preview_ready",
  "carrier_handoff_ready",
  "carrier_delivery_confirmed",
  "vehicle_transport_intake_start",
  "vehicle_transport_preview_ready",
  "vehicle_transport_handoff_ready",
  "vehicle_transport_delivery_confirmed",
  "seo_intake_start",
  "seo_intake_preview_ready",
  "seo_handoff_ready",
  "website_project_intake_start",
  "website_project_intake_preview_ready",
  "website_handoff_ready",
]);
const familyEvents: Record<GeoFunnelFamily, Set<CanonicalCommercialAnalyticsEvent>> = {
  carrier: new Set([
    "commercial_cta_click",
    "carrier_intake_start",
    "carrier_intake_preview_ready",
    "carrier_handoff_ready",
    "carrier_delivery_confirmed",
  ]),
  vehicle_transport: new Set([
    "commercial_cta_click",
    "vehicle_transport_intake_start",
    "vehicle_transport_preview_ready",
    "vehicle_transport_handoff_ready",
    "vehicle_transport_delivery_confirmed",
  ]),
  seo: new Set([
    "commercial_cta_click",
    "seo_intake_start",
    "seo_intake_preview_ready",
    "seo_handoff_ready",
  ]),
  website_project: new Set([
    "commercial_cta_click",
    "website_project_intake_start",
    "website_project_intake_preview_ready",
    "website_handoff_ready",
  ]),
};

export interface GeoImportedAnalyticsEvent {
  family: GeoFunnelFamily;
  aggregate: GeoAnalyticsEventAggregate;
  observedAt: string;
}

export type GeoImportedOutcome = GeoOutcomeAggregate & { observedAt: string };

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const assertExactFields = (row: Record<string, unknown>, allowed: Set<string>, label: string) => {
  for (const key of Object.keys(row)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  }
  for (const field of allowed) {
    if (!(field in row)) throw new Error(`${label} is missing field: ${field}`);
  }
};

const text = (row: Record<string, unknown>, field: string, maxLength = 300) => {
  if (typeof row[field] !== "string") throw new Error(`${field} must be a string`);
  const value = (row[field] as string).trim();
  if (!value) throw new Error(`${field} must not be empty`);
  if (value.length > maxLength) throw new Error(`${field} exceeds ${maxLength} characters`);
  return value;
};

const timestamp = (row: Record<string, unknown>, field: string) => {
  const value = text(row, field, 40);
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be a valid ISO date/time`);
  return new Date(parsed).toISOString();
};

const integer = (row: Record<string, unknown>, field: string) => {
  const value = row[field];
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
  return value as number;
};

const enumValue = <T extends string | number>(
  row: Record<string, unknown>,
  field: string,
  allowed: Set<T>,
): T => {
  const value = row[field] as T;
  if (!allowed.has(value)) throw new Error(`${field} has unsupported value: ${String(value)}`);
  return value;
};

const sitePath = (row: Record<string, unknown>, field: string) => {
  const value = text(row, field);
  if (!value.startsWith("/") || value.startsWith("//")) {
    throw new Error(`${field} must be a site-relative path`);
  }
  if (/[?#]/.test(value)) throw new Error(`${field} must not contain query parameters or fragments`);
  return value;
};

export const importGeoSearchCheckpointRow = (input: unknown): GeoExactSearchCheckpoint => {
  const row = asRecord(input, "GEO search row");
  assertExactFields(row, searchFields, "GEO search row");

  const checkpoint: GeoExactSearchCheckpoint = {
    source: enumValue(row, "source", searchSources),
    pagePath: sitePath(row, "page_path"),
    discoveryType: enumValue(row, "discovery_type", discoveryTypes),
    startDate: text(row, "start_date", 10),
    endDate: text(row, "end_date", 10),
    impressions: integer(row, "impressions"),
    clicks: integer(row, "clicks"),
    evidenceClass: enumValue(row, "evidence_class", searchEvidenceClasses),
  };

  adaptExactSearchCheckpoint(checkpoint);
  return checkpoint;
};

export const importGeoAnalyticsEventRow = (input: unknown): GeoImportedAnalyticsEvent => {
  const row = asRecord(input, "GEO analytics row");
  assertExactFields(row, analyticsFields, "GEO analytics row");

  const family = enumValue(row, "family", funnelFamilies);
  const eventName = enumValue(row, "event_name", analyticsEvents);
  if (!familyEvents[family].has(eventName)) {
    throw new Error(`event_name ${eventName} does not belong to funnel family ${family}`);
  }

  const aggregate: GeoAnalyticsEventAggregate = {
    windowDays: enumValue(row, "window_days", standardWindows) as GeoWindowDays,
    journeyPath: sitePath(row, "journey_path"),
    eventPagePath: sitePath(row, "event_page_path"),
    eventName,
    count: integer(row, "count"),
    evidenceClass: enumValue(row, "evidence_class", searchEvidenceClasses),
  };

  return { family, aggregate, observedAt: timestamp(row, "observed_at") };
};

export const importGeoOutcomeRow = (input: unknown): GeoImportedOutcome => {
  const row = asRecord(input, "GEO outcome row");
  assertExactFields(row, outcomeFields, "GEO outcome row");

  const outcome: GeoImportedOutcome = {
    windowDays: enumValue(row, "window_days", standardWindows) as GeoWindowDays,
    pagePath: sitePath(row, "page_path"),
    reviewedInquiries: integer(row, "reviewed_inquiries"),
    qualifiedLeads: integer(row, "qualified_leads"),
    opportunities: integer(row, "opportunities"),
    wins: integer(row, "wins"),
    losses: integer(row, "losses"),
    revenueReconciledWins: integer(row, "revenue_reconciled_wins"),
    evidenceClass: enumValue(row, "evidence_class", outcomeEvidenceClasses),
    observedAt: timestamp(row, "observed_at"),
  };

  if (outcome.qualifiedLeads > outcome.reviewedInquiries) {
    throw new Error("qualified_leads cannot exceed reviewed_inquiries");
  }
  if (outcome.opportunities > outcome.qualifiedLeads) {
    throw new Error("opportunities cannot exceed qualified_leads");
  }
  if (outcome.wins + outcome.losses > outcome.opportunities) {
    throw new Error("wins + losses cannot exceed opportunities");
  }
  if (outcome.revenueReconciledWins > outcome.wins) {
    throw new Error("revenue_reconciled_wins cannot exceed wins");
  }

  return outcome;
};

const importBatch = <T>(
  inputs: unknown[],
  importer: (input: unknown) => T,
  label: string,
): T[] => {
  if (!Array.isArray(inputs)) throw new Error(`${label} batch must be an array`);
  if (inputs.length > 5000) throw new Error(`${label} batch must contain at most 5000 rows`);
  return inputs.map((input, index) => {
    try {
      return importer(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${label} row ${index + 1}: ${message}`);
    }
  });
};

export const importGeoSearchCheckpointBatch = (inputs: unknown[]) =>
  importBatch(inputs, importGeoSearchCheckpointRow, "GEO search");
export const importGeoAnalyticsEventBatch = (inputs: unknown[]) =>
  importBatch(inputs, importGeoAnalyticsEventRow, "GEO analytics");
export const importGeoOutcomeBatch = (inputs: unknown[]) =>
  importBatch(inputs, importGeoOutcomeRow, "GEO outcome");
