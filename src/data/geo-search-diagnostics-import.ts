import {
  validateGeoSearchQueryPageRows,
  type GeoSearchCountryBucket,
  type GeoSearchDeviceBucket,
  type GeoSearchDiscoveryReviewState,
  type GeoSearchPageIntent,
  type GeoSearchQueryIntent,
  type GeoSearchQueryPageAggregate,
} from "./geo-search-diagnostics.ts";
import type { GeoDiscoveryType, GeoSearchSource, GeoWindowDays } from "./geo-measurement-layer.ts";

const allowedFields = new Set([
  "window_days",
  "source",
  "query_key",
  "intent_group_key",
  "page_path",
  "canonical_owner",
  "discovery_type",
  "discovery_review_state",
  "query_intent",
  "page_intent",
  "country_bucket",
  "device_bucket",
  "impressions",
  "clicks",
  "average_position",
  "evidence_class",
]);

const windows = new Set<GeoWindowDays>([7, 28, 90]);
const sources = new Set<GeoSearchSource>(["google", "bing"]);
const discoveryTypes = new Set<GeoDiscoveryType>(["branded", "non_branded"]);
const discoveryReviewStates = new Set<GeoSearchDiscoveryReviewState>(["reviewed", "pending_review"]);
const countryBuckets = new Set<GeoSearchCountryBucket>(["US", "WORLDWIDE", "OTHER"]);
const deviceBuckets = new Set<GeoSearchDeviceBucket>(["DESKTOP", "MOBILE", "TABLET", "OTHER"]);
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

const forbiddenKeys = /(query_text|raw_query|search_term|keyword_text|email|phone|name|company|mc|usdot|vin|account|property|stream|token|cookie|credential)/i;

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("GEO query-page row must be an object");
  }
  return value as Record<string, unknown>;
};

const assertExactFields = (row: Record<string, unknown>) => {
  for (const key of Object.keys(row)) {
    if (forbiddenKeys.test(key)) throw new Error(`Forbidden GEO query-page field: ${key}`);
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

const nonNegativeNumber = (row: Record<string, unknown>, field: string) => {
  const value = row[field];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number`);
  }
  return value;
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
    intentGroupKey: text(row, "intent_group_key", 80),
    pagePath: text(row, "page_path", 300),
    canonicalOwner: text(row, "canonical_owner", 300),
    discoveryType: enumValue(row, "discovery_type", discoveryTypes),
    discoveryReviewState: enumValue(row, "discovery_review_state", discoveryReviewStates),
    queryIntent: enumValue(row, "query_intent", queryIntents),
    pageIntent: enumValue(row, "page_intent", pageIntents),
    countryBucket: enumValue(row, "country_bucket", countryBuckets),
    deviceBucket: enumValue(row, "device_bucket", deviceBuckets),
    impressions: integer(row, "impressions"),
    clicks: integer(row, "clicks"),
    averagePosition: nonNegativeNumber(row, "average_position"),
    evidenceClass: enumValue(row, "evidence_class", evidenceClasses),
  };

  validateGeoSearchQueryPageRows([result]);
  return result;
};

export const importGeoSearchQueryPageBatch = (inputs: unknown[]) => {
  if (!Array.isArray(inputs)) throw new Error("GEO query-page batch must be an array");
  if (inputs.length > 5000) throw new Error("GEO query-page batch must contain at most 5000 rows");
  const rows = inputs.map((input, index) => {
    try {
      return importGeoSearchQueryPageRow(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`GEO query-page row ${index + 1}: ${message}`);
    }
  });

  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.windowDays}|${row.source}|${row.queryKey}|${row.pagePath}|${row.countryBucket}|${row.deviceBucket}`;
    if (seen.has(key)) throw new Error(`Duplicate GEO query-page aggregate: ${key}`);
    seen.add(key);
  }
  return rows;
};
