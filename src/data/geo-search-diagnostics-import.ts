import {
  validateGeoSearchQueryPageRows,
  type GeoSearchPageIntent,
  type GeoSearchQueryIntent,
  type GeoSearchQueryPageAggregate,
} from "./geo-search-diagnostics.ts";
import type { GeoDiscoveryType, GeoSearchSource, GeoWindowDays } from "./geo-measurement-layer.ts";

const allowedFields = new Set([
  "window_days",
  "source",
  "query_key",
  "page_path",
  "discovery_type",
  "query_intent",
  "page_intent",
  "country_code",
  "impressions",
  "clicks",
  "evidence_class",
]);

const windows = new Set<GeoWindowDays>([7, 28, 90]);
const sources = new Set<GeoSearchSource>(["google", "bing"]);
const discoveryTypes = new Set<GeoDiscoveryType>(["branded", "non_branded"]);
const queryIntents = new Set<GeoSearchQueryIntent>([
  "commercial_service",
  "comparison",
  "pricing",
  "local_service",
  "informational",
  "brand_navigation",
  "career",
  "academy",
  "product",
  "other_reviewed",
]);
const pageIntents = new Set<GeoSearchPageIntent>([
  "commercial_owner",
  "local_service",
  "resource",
  "brand_hub",
  "academy",
  "career",
  "product",
  "other_reviewed",
]);
const evidenceClasses = new Set<GeoSearchQueryPageAggregate["evidenceClass"]>([
  "platform_verified",
  "owner_provided_handoff",
  "unverified",
]);

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("GEO query-page row must be an object");
  }
  return value as Record<string, unknown>;
};

const assertExactFields = (row: Record<string, unknown>) => {
  for (const key of Object.keys(row)) {
    if (!allowedFields.has(key)) throw new Error(`Unsupported GEO query-page field: ${key}`);
  }
  for (const field of allowedFields) {
    if (!(field in row)) throw new Error(`Missing GEO query-page field: ${field}`);
  }
};

const text = (row: Record<string, unknown>, field: string, maxLength: number) => {
  if (typeof row[field] !== "string") throw new Error(`${field} must be a string`);
  const value = (row[field] as string).trim();
  if (!value) throw new Error(`${field} must not be empty`);
  if (value.length > maxLength) throw new Error(`${field} exceeds ${maxLength} characters`);
  return value;
};

const integer = (row: Record<string, unknown>, field: string) => {
  const value = row[field];
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
  return value as number;
};

const enumValue = <T extends string | number>(row: Record<string, unknown>, field: string, values: Set<T>): T => {
  const value = row[field] as T;
  if (!values.has(value)) throw new Error(`${field} has unsupported value: ${String(value)}`);
  return value;
};

export const importGeoSearchQueryPageRow = (input: unknown): GeoSearchQueryPageAggregate => {
  const row = asRecord(input);
  assertExactFields(row);

  const result: GeoSearchQueryPageAggregate = {
    windowDays: enumValue(row, "window_days", windows),
    source: enumValue(row, "source", sources),
    queryKey: text(row, "query_key", 80),
    pagePath: text(row, "page_path", 300),
    discoveryType: enumValue(row, "discovery_type", discoveryTypes),
    queryIntent: enumValue(row, "query_intent", queryIntents),
    pageIntent: enumValue(row, "page_intent", pageIntents),
    countryCode: text(row, "country_code", 3),
    impressions: integer(row, "impressions"),
    clicks: integer(row, "clicks"),
    evidenceClass: enumValue(row, "evidence_class", evidenceClasses),
  };

  validateGeoSearchQueryPageRows([result]);
  return result;
};

export const importGeoSearchQueryPageBatch = (inputs: unknown[]) => {
  if (!Array.isArray(inputs)) throw new Error("GEO query-page batch must be an array");
  if (inputs.length > 5000) throw new Error("GEO query-page batch must contain at most 5000 rows");
  return inputs.map((input, index) => {
    try {
      return importGeoSearchQueryPageRow(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`GEO query-page row ${index + 1}: ${message}`);
    }
  });
};
