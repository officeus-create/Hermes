import {
  buildGeoSearchDiagnostics,
  type GeoSearchCountryBucket,
  type GeoSearchDeviceBucket,
  type GeoSearchDiscoveryReviewState,
  type GeoSearchPageIntent,
  type GeoSearchQueryIntent,
  type GeoSearchQueryPageAggregate,
} from "./geo-search-diagnostics.ts";
import { importGeoSearchQueryPageBatch } from "./geo-search-diagnostics-import.ts";
import {
  type GeoAuthenticatedIndexState,
  type GeoAuthenticatedIndexStateRecord,
  type GeoIndexNowReceiptRecord,
} from "./geo-index-evidence.ts";
import type { GeoDiscoveryType, GeoSearchSource, GeoWindowDays } from "./geo-measurement-layer.ts";

export const geoSearchPlatformReceiptVersion = "geo_search_platform_receipt_v1" as const;

export type GeoSearchPlatformEvidenceClass = "platform_verified" | "owner_provided_handoff";
export type GeoSelectedCanonicalState = "MATCHES_DECLARED" | "DIFFERS" | "NOT_AVAILABLE";
export type GeoJobPostingEnhancementState = "VALID" | "WARNING" | "ERROR" | "NOT_DETECTED" | "UNKNOWN";
export type GeoSearchReceiptStatus = "diagnostic_ready" | "held_non_standard_window";
export type GeoIndexFreshnessState = "current" | "stale";

export interface GeoSearchPlatformReceiptInput {
  schema_version: typeof geoSearchPlatformReceiptVersion;
  reference_id: string;
  source: GeoSearchSource;
  start_date: string;
  end_date: string;
  observed_at: string;
  evidence_class: GeoSearchPlatformEvidenceClass;
  rows: unknown[];
}

export interface GeoSearchReceiptRow {
  query_key: string;
  intent_group_key: string;
  page_path: string;
  canonical_owner: string;
  discovery_type: GeoDiscoveryType;
  discovery_review_state: GeoSearchDiscoveryReviewState;
  query_intent: GeoSearchQueryIntent;
  page_intent: GeoSearchPageIntent;
  country_bucket: GeoSearchCountryBucket;
  device_bucket: GeoSearchDeviceBucket;
  impressions: number;
  clicks: number;
  average_position: number;
}

export interface GeoHeldLowVolumeSearchRow {
  source: GeoSearchSource;
  canonicalOwner: string;
  pagePath: string;
  countryBucket: GeoSearchCountryBucket;
  deviceBucket: GeoSearchDeviceBucket;
  impressions: number;
  clicks: number;
  reason: "below_query_group_anonymity_threshold";
}

export interface GeoSearchPlatformReceiptReport {
  schemaVersion: typeof geoSearchPlatformReceiptVersion;
  referenceId: string;
  source: GeoSearchSource;
  startDate: string;
  endDate: string;
  observedAt: string;
  evidenceClass: GeoSearchPlatformEvidenceClass;
  exactWindowDays: number;
  standardWindowDays: GeoWindowDays | null;
  status: GeoSearchReceiptStatus;
  anonymityThreshold: number;
  totals: { rows: number; impressions: number; clicks: number };
  diagnosticRows: GeoSearchQueryPageAggregate[];
  heldLowVolumeRows: GeoHeldLowVolumeSearchRow[];
  diagnostics: ReturnType<typeof buildGeoSearchDiagnostics> | null;
}

export interface GeoSelectedCanonicalEvidenceInput {
  page_path: string;
  checked_at: string;
  selected_canonical_state: GeoSelectedCanonicalState;
  selected_canonical_path: string | null;
  evidence_class: "platform_verified";
}

export interface GeoSelectedCanonicalEvidence {
  pagePath: string;
  checkedAt: string;
  selectedCanonicalState: GeoSelectedCanonicalState;
  selectedCanonicalPath: string | null;
  evidenceClass: "platform_verified";
}

export interface GeoJobInspectionEvidenceInput extends GeoSelectedCanonicalEvidenceInput {
  index_state: GeoAuthenticatedIndexState;
  jobposting_enhancement_state: GeoJobPostingEnhancementState;
}

export interface GeoJobInspectionEvidence extends GeoSelectedCanonicalEvidence {
  indexState: GeoAuthenticatedIndexState;
  jobPostingEnhancementState: GeoJobPostingEnhancementState;
}

export const geoPrioritySearchOwners = [
  "/",
  "/logistics/car-hauling-dispatch/",
  "/logistics/dealer-vehicle-transportation/",
  "/logistics/auction-vehicle-pickup/",
  "/logistics/appleton-wi-vehicle-transport/",
  "/services/seo/",
  "/services/seo-for-logistics-companies/",
  "/services/website-development/",
  "/academy/us-logistics-operations/",
  "/careers/car-hauling-dispatcher/",
] as const;

const receiptFields = new Set([
  "schema_version",
  "reference_id",
  "source",
  "start_date",
  "end_date",
  "observed_at",
  "evidence_class",
  "rows",
]);
const rowFields = new Set([
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
]);
const canonicalFields = new Set([
  "page_path",
  "checked_at",
  "selected_canonical_state",
  "selected_canonical_path",
  "evidence_class",
]);
const jobFields = new Set([...canonicalFields, "index_state", "jobposting_enhancement_state"]);
const sources = new Set<GeoSearchSource>(["google", "bing"]);
const evidenceClasses = new Set<GeoSearchPlatformEvidenceClass>(["platform_verified", "owner_provided_handoff"]);
const discoveryTypes = new Set<GeoDiscoveryType>(["branded", "non_branded"]);
const discoveryReviewStates = new Set<GeoSearchDiscoveryReviewState>(["reviewed", "pending_review"]);
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
const countryBuckets = new Set<GeoSearchCountryBucket>(["US", "WORLDWIDE", "OTHER"]);
const deviceBuckets = new Set<GeoSearchDeviceBucket>(["DESKTOP", "MOBILE", "TABLET", "OTHER"]);
const selectedCanonicalStates = new Set<GeoSelectedCanonicalState>(["MATCHES_DECLARED", "DIFFERS", "NOT_AVAILABLE"]);
const indexStates = new Set<GeoAuthenticatedIndexState>(["DISCOVERED", "CRAWLED", "INDEXED", "NOT_FOUND"]);
const enhancementStates = new Set<GeoJobPostingEnhancementState>(["VALID", "WARNING", "ERROR", "NOT_DETECTED", "UNKNOWN"]);
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const timezoneIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const opaqueId = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};

const exactFields = (row: Record<string, unknown>, allowed: Set<string>, label: string) => {
  for (const key of Object.keys(row)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  }
  for (const key of allowed) {
    if (!(key in row)) throw new Error(`${label} is missing field: ${key}`);
  }
};

const enumValue = <T extends string>(value: unknown, allowed: Set<T>, label: string): T => {
  if (typeof value !== "string" || !allowed.has(value as T)) throw new Error(`${label} has unsupported value`);
  return value as T;
};

const text = (value: unknown, label: string, max = 300) => {
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) throw new Error(`${label} must be 1-${max} characters`);
  return trimmed;
};

const cleanPath = (value: unknown, label: string) => {
  const result = text(value, label);
  if (!result.startsWith("/") || result.startsWith("//") || /[?#]/.test(result)) {
    throw new Error(`${label} must be a clean site-relative path`);
  }
  return result;
};

const opaque = (value: unknown, label: string) => {
  const result = text(value, label, 160);
  if (!opaqueId.test(result)) throw new Error(`${label} must be an opaque safe identifier`);
  return result;
};

const integer = (value: unknown, label: string) => {
  if (!Number.isInteger(value) || (value as number) < 0) throw new Error(`${label} must be a non-negative integer`);
  return value as number;
};

const nonNegativeNumber = (value: unknown, label: string) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
  return value;
};

const isoTimestamp = (value: unknown, label: string) => {
  if (typeof value !== "string" || !timezoneIso.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be an ISO timestamp with explicit timezone`);
  }
  return new Date(Date.parse(value)).toISOString();
};

const isoDate = (value: unknown, label: string) => {
  if (typeof value !== "string" || !dateOnly.test(value)) throw new Error(`${label} must be YYYY-MM-DD`);
  const parsed = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid calendar date`);
  }
  return value;
};

const inclusiveDays = (startDate: string, endDate: string) => {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (end < start) throw new Error("end_date cannot be before start_date");
  return Math.floor((end - start) / 86_400_000) + 1;
};

const parseRow = (input: unknown): GeoSearchReceiptRow => {
  const row = asRecord(input, "Search platform row");
  exactFields(row, rowFields, "Search platform row");
  const impressions = integer(row.impressions, "impressions");
  const clicks = integer(row.clicks, "clicks");
  if (clicks > impressions) throw new Error("clicks cannot exceed impressions");
  return {
    query_key: opaque(row.query_key, "query_key"),
    intent_group_key: opaque(row.intent_group_key, "intent_group_key"),
    page_path: cleanPath(row.page_path, "page_path"),
    canonical_owner: cleanPath(row.canonical_owner, "canonical_owner"),
    discovery_type: enumValue(row.discovery_type, discoveryTypes, "discovery_type"),
    discovery_review_state: enumValue(row.discovery_review_state, discoveryReviewStates, "discovery_review_state"),
    query_intent: enumValue(row.query_intent, queryIntents, "query_intent"),
    page_intent: enumValue(row.page_intent, pageIntents, "page_intent"),
    country_bucket: enumValue(row.country_bucket, countryBuckets, "country_bucket"),
    device_bucket: enumValue(row.device_bucket, deviceBuckets, "device_bucket"),
    impressions,
    clicks,
    average_position: nonNegativeNumber(row.average_position, "average_position"),
  };
};

const parseReceipt = (input: unknown): { receipt: Omit<GeoSearchPlatformReceiptInput, "rows">; rows: GeoSearchReceiptRow[] } => {
  const row = asRecord(input, "Search platform receipt");
  exactFields(row, receiptFields, "Search platform receipt");
  if (row.schema_version !== geoSearchPlatformReceiptVersion) {
    throw new Error(`schema_version must be ${geoSearchPlatformReceiptVersion}`);
  }
  if (!Array.isArray(row.rows) || row.rows.length > 5000) throw new Error("rows must be an array of at most 5000 items");
  const startDate = isoDate(row.start_date, "start_date");
  const endDate = isoDate(row.end_date, "end_date");
  inclusiveDays(startDate, endDate);
  const rows = row.rows.map((item, index) => {
    try {
      return parseRow(item);
    } catch (error) {
      throw new Error(`Search platform row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  const seen = new Set<string>();
  for (const item of rows) {
    const key = `${item.query_key}|${item.page_path}|${item.country_bucket}|${item.device_bucket}`;
    if (seen.has(key)) throw new Error(`Duplicate search platform row: ${key}`);
    seen.add(key);
  }
  return {
    receipt: {
      schema_version: geoSearchPlatformReceiptVersion,
      reference_id: opaque(row.reference_id, "reference_id"),
      source: enumValue(row.source, sources, "source"),
      start_date: startDate,
      end_date: endDate,
      observed_at: isoTimestamp(row.observed_at, "observed_at"),
      evidence_class: enumValue(row.evidence_class, evidenceClasses, "evidence_class"),
    },
    rows,
  };
};

const standardWindow = (days: number): GeoWindowDays | null =>
  days === 7 || days === 28 || days === 90 ? days : null;

export const buildGeoSearchPlatformReceiptReport = (
  input: unknown,
  { anonymityThreshold = 3, commercialCtaOwners = [] }: { anonymityThreshold?: number; commercialCtaOwners?: string[] } = {},
): GeoSearchPlatformReceiptReport => {
  if (!Number.isInteger(anonymityThreshold) || anonymityThreshold < 1 || anonymityThreshold > 100) {
    throw new Error("anonymityThreshold must be an integer between 1 and 100");
  }
  const { receipt, rows } = parseReceipt(input);
  const exactWindowDays = inclusiveDays(receipt.start_date, receipt.end_date);
  const windowDays = standardWindow(exactWindowDays);
  const heldLowVolumeRows: GeoHeldLowVolumeSearchRow[] = rows
    .filter((item) => item.impressions < anonymityThreshold)
    .map((item) => ({
      source: receipt.source,
      canonicalOwner: item.canonical_owner,
      pagePath: item.page_path,
      countryBucket: item.country_bucket,
      deviceBucket: item.device_bucket,
      impressions: item.impressions,
      clicks: item.clicks,
      reason: "below_query_group_anonymity_threshold",
    }))
    .sort((left, right) => left.canonicalOwner.localeCompare(right.canonicalOwner) || left.pagePath.localeCompare(right.pagePath));

  const safeRows = rows.filter((item) => item.impressions >= anonymityThreshold);
  const diagnosticRows = windowDays === null
    ? []
    : importGeoSearchQueryPageBatch(safeRows.map((item) => ({
        window_days: windowDays,
        source: receipt.source,
        query_key: item.query_key,
        intent_group_key: item.intent_group_key,
        page_path: item.page_path,
        canonical_owner: item.canonical_owner,
        discovery_type: item.discovery_type,
        discovery_review_state: item.discovery_review_state,
        query_intent: item.query_intent,
        page_intent: item.page_intent,
        country_bucket: item.country_bucket,
        device_bucket: item.device_bucket,
        impressions: item.impressions,
        clicks: item.clicks,
        average_position: item.average_position,
        evidence_class: receipt.evidence_class,
      })));

  return {
    schemaVersion: geoSearchPlatformReceiptVersion,
    referenceId: receipt.reference_id,
    source: receipt.source,
    startDate: receipt.start_date,
    endDate: receipt.end_date,
    observedAt: receipt.observed_at,
    evidenceClass: receipt.evidence_class,
    exactWindowDays,
    standardWindowDays: windowDays,
    status: windowDays === null ? "held_non_standard_window" : "diagnostic_ready",
    anonymityThreshold,
    totals: {
      rows: rows.length,
      impressions: rows.reduce((total, item) => total + item.impressions, 0),
      clicks: rows.reduce((total, item) => total + item.clicks, 0),
    },
    diagnosticRows,
    heldLowVolumeRows,
    diagnostics: windowDays === null
      ? null
      : buildGeoSearchDiagnostics(diagnosticRows, windowDays, { commercialCtaOwners }),
  };
};

const dayBefore = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

export const compareGeoSearchPlatformReceipts = (
  current: GeoSearchPlatformReceiptReport,
  previous: GeoSearchPlatformReceiptReport,
) => {
  if (current.source !== previous.source) throw new Error("Comparable search receipts must use the same source");
  if (current.standardWindowDays !== 7 && current.standardWindowDays !== 28) {
    throw new Error("Current search receipt must be an exact 7-day or 28-day window");
  }
  if (previous.standardWindowDays !== current.standardWindowDays) {
    throw new Error("Comparable search receipts must use the same exact window length");
  }
  if (previous.endDate !== dayBefore(current.startDate)) {
    throw new Error("Comparable search receipts must be adjacent, non-overlapping windows");
  }
  const ctr = (clicks: number, impressions: number) => impressions === 0 ? 0 : Number(((clicks / impressions) * 100).toFixed(2));
  return {
    source: current.source,
    windowDays: current.standardWindowDays,
    currentReferenceId: current.referenceId,
    previousReferenceId: previous.referenceId,
    impressionsDelta: current.totals.impressions - previous.totals.impressions,
    clicksDelta: current.totals.clicks - previous.totals.clicks,
    ctrDeltaPoints: Number((
      ctr(current.totals.clicks, current.totals.impressions) - ctr(previous.totals.clicks, previous.totals.impressions)
    ).toFixed(2)),
  };
};

export const buildGeoPrioritySearchEvidenceMatrix = (receipts: GeoSearchPlatformReceiptReport[]) =>
  geoPrioritySearchOwners.map((canonicalOwner) => {
    const cells = (["google", "bing"] as const).flatMap((source) =>
      ([7, 28] as const).map((windowDays) => ({
        source,
        windowDays,
        present: receipts.some((receipt) =>
          receipt.source === source &&
          receipt.standardWindowDays === windowDays &&
          receipt.diagnosticRows.some((row) => row.canonicalOwner === canonicalOwner),
        ),
      })),
    );
    return {
      canonicalOwner,
      cells,
      complete: cells.every((cell) => cell.present),
      missing: cells.filter((cell) => !cell.present).map((cell) => `${cell.source}:${cell.windowDays}d`),
    };
  });

const parseCanonicalEvidence = (input: unknown, allowed: Set<string>): GeoSelectedCanonicalEvidence => {
  const row = asRecord(input, "Selected canonical evidence");
  exactFields(row, allowed, "Selected canonical evidence");
  if (row.evidence_class !== "platform_verified") throw new Error("Selected canonical evidence must be platform_verified");
  const state = enumValue(row.selected_canonical_state, selectedCanonicalStates, "selected_canonical_state");
  const selectedPath = row.selected_canonical_path === null ? null : cleanPath(row.selected_canonical_path, "selected_canonical_path");
  if (state === "MATCHES_DECLARED" && selectedPath === null) throw new Error("MATCHES_DECLARED requires selected_canonical_path");
  return {
    pagePath: cleanPath(row.page_path, "page_path"),
    checkedAt: isoTimestamp(row.checked_at, "checked_at"),
    selectedCanonicalState: state,
    selectedCanonicalPath: selectedPath,
    evidenceClass: "platform_verified",
  };
};

export const importGeoSelectedCanonicalEvidence = (input: unknown) => parseCanonicalEvidence(input, canonicalFields);

export const importGeoJobInspectionEvidence = (input: unknown): GeoJobInspectionEvidence => {
  const row = asRecord(input, "Job inspection evidence");
  exactFields(row, jobFields, "Job inspection evidence");
  const base = parseCanonicalEvidence(row, jobFields);
  return {
    ...base,
    indexState: enumValue(row.index_state, indexStates, "index_state"),
    jobPostingEnhancementState: enumValue(row.jobposting_enhancement_state, enhancementStates, "jobposting_enhancement_state"),
  };
};

export const buildGeoIndexFreshness = (
  records: GeoAuthenticatedIndexStateRecord[],
  asOf: string,
  freshnessDays: number,
) => {
  const asOfMs = Date.parse(isoTimestamp(asOf, "asOf"));
  if (!Number.isInteger(freshnessDays) || freshnessDays < 1 || freshnessDays > 90) {
    throw new Error("freshnessDays must be an integer between 1 and 90");
  }
  return records.map((record) => {
    const ageDays = Math.floor((asOfMs - Date.parse(record.checkedAt)) / 86_400_000);
    if (ageDays < 0) throw new Error(`Index evidence for ${record.pagePath} occurs after asOf`);
    const state: GeoIndexFreshnessState = ageDays <= freshnessDays ? "current" : "stale";
    return { ...record, ageDays, freshnessDays, freshnessState: state };
  });
};

const latestByPageSource = (records: GeoAuthenticatedIndexStateRecord[]) => {
  const latest = new Map<string, GeoAuthenticatedIndexStateRecord>();
  for (const record of records) {
    const key = `${record.pagePath}|${record.source}`;
    const current = latest.get(key);
    if (!current || Date.parse(record.checkedAt) > Date.parse(current.checkedAt)) latest.set(key, record);
  }
  return latest;
};

export const reconcileGeoIndexNowWithBing = (
  indexStates: GeoAuthenticatedIndexStateRecord[],
  indexNowReceipts: GeoIndexNowReceiptRecord[],
) => {
  const latest = latestByPageSource(indexStates);
  const pages = [...new Set([
    ...indexStates.filter((item) => item.source === "bing").map((item) => item.pagePath),
    ...indexNowReceipts.map((item) => item.pagePath),
  ])].sort();
  return pages.map((pagePath) => {
    const bing = latest.get(`${pagePath}|bing`);
    const accepted = indexNowReceipts.some((item) => item.pagePath === pagePath && item.acceptance === "ACCEPTED");
    const status = accepted
      ? bing?.state === "INDEXED"
        ? "accepted_and_indexed"
        : "accepted_not_indexed"
      : "no_accepted_notification";
    return {
      pagePath,
      indexNowAccepted: accepted,
      bingState: bing?.state ?? null,
      status,
      indexNowIsNotIndexProof: true as const,
    };
  });
};

export const buildGeoGoogleBingIndexDisagreements = (records: GeoAuthenticatedIndexStateRecord[]) => {
  const latest = latestByPageSource(records);
  const pages = [...new Set(records.map((item) => item.pagePath))].sort();
  return pages.flatMap((pagePath) => {
    const google = latest.get(`${pagePath}|google`);
    const bing = latest.get(`${pagePath}|bing`);
    if (!google || !bing || google.state === bing.state) return [];
    return [{
      pagePath,
      googleState: google.state,
      bingState: bing.state,
      resolution: "review_platform_evidence_no_automatic_winner" as const,
    }];
  });
};
