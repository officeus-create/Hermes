import type { GeoSearchSource } from "./geo-measurement-layer.ts";

export type GeoAuthenticatedIndexState = "DISCOVERED" | "CRAWLED" | "INDEXED" | "NOT_FOUND";
export type GeoIndexNowAcceptance = "ACCEPTED" | "REJECTED" | "UNKNOWN";

export interface GeoAuthenticatedIndexStateRecord {
  source: GeoSearchSource;
  pagePath: string;
  state: GeoAuthenticatedIndexState;
  checkedAt: string;
  evidenceClass: "platform_verified";
}

export interface GeoIndexNowReceiptRecord {
  pagePath: string;
  submittedAt: string;
  acceptance: GeoIndexNowAcceptance;
  evidenceClass: "platform_verified" | "owner_provided_handoff";
}

export interface GeoIndexEvidenceReport {
  indexStates: GeoAuthenticatedIndexStateRecord[];
  indexNowReceipts: GeoIndexNowReceiptRecord[];
  indexedPages: string[];
  notIndexedPages: string[];
  indexNowAcceptedPages: string[];
  /** Always true: IndexNow transport acceptance is never treated as an index-state claim. */
  indexNowSeparatedFromIndexState: true;
}

const indexFields = new Set(["source", "page_path", "state", "checked_at", "evidence_class"]);
const indexNowFields = new Set(["page_path", "submitted_at", "acceptance", "evidence_class"]);
const sources = new Set<GeoSearchSource>(["google", "bing"]);
const states = new Set<GeoAuthenticatedIndexState>(["DISCOVERED", "CRAWLED", "INDEXED", "NOT_FOUND"]);
const acceptances = new Set<GeoIndexNowAcceptance>(["ACCEPTED", "REJECTED", "UNKNOWN"]);
const indexNowEvidence = new Set<GeoIndexNowReceiptRecord["evidenceClass"]>([
  "platform_verified",
  "owner_provided_handoff",
]);

const record = (input: unknown, label: string): Record<string, unknown> => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error(`${label} must be an object`);
  return input as Record<string, unknown>;
};

const exactFields = (row: Record<string, unknown>, fields: Set<string>, label: string) => {
  for (const key of Object.keys(row)) {
    if (!fields.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  }
  for (const field of fields) {
    if (!(field in row)) throw new Error(`${label} is missing field: ${field}`);
  }
};

const text = (row: Record<string, unknown>, field: string) => {
  const value = row[field];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value.trim();
};

const path = (row: Record<string, unknown>, field: string) => {
  const value = text(row, field);
  if (!value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) {
    throw new Error(`${field} must be a clean site-relative path`);
  }
  return value;
};

const timestamp = (row: Record<string, unknown>, field: string) => {
  const value = text(row, field);
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be a valid ISO date/time`);
  return new Date(parsed).toISOString();
};

const enumValue = <T extends string>(row: Record<string, unknown>, field: string, allowed: Set<T>) => {
  const value = row[field] as T;
  if (!allowed.has(value)) throw new Error(`${field} has unsupported value: ${String(value)}`);
  return value;
};

export const importGeoAuthenticatedIndexStateRow = (input: unknown): GeoAuthenticatedIndexStateRecord => {
  const row = record(input, "GEO index-state row");
  exactFields(row, indexFields, "GEO index-state row");
  if (row.evidence_class !== "platform_verified") {
    throw new Error("Authenticated index-state evidence_class must be platform_verified");
  }
  return {
    source: enumValue(row, "source", sources),
    pagePath: path(row, "page_path"),
    state: enumValue(row, "state", states),
    checkedAt: timestamp(row, "checked_at"),
    evidenceClass: "platform_verified",
  };
};

export const importGeoIndexNowReceiptRow = (input: unknown): GeoIndexNowReceiptRecord => {
  const row = record(input, "IndexNow receipt row");
  exactFields(row, indexNowFields, "IndexNow receipt row");
  return {
    pagePath: path(row, "page_path"),
    submittedAt: timestamp(row, "submitted_at"),
    acceptance: enumValue(row, "acceptance", acceptances),
    evidenceClass: enumValue(row, "evidence_class", indexNowEvidence),
  };
};

const batch = <T>(inputs: unknown[], importer: (input: unknown) => T, label: string): T[] => {
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

export const importGeoAuthenticatedIndexStateBatch = (inputs: unknown[]) => {
  const rows = batch(inputs, importGeoAuthenticatedIndexStateRow, "GEO index-state");
  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.source}|${row.pagePath}|${row.checkedAt}`;
    if (seen.has(key)) throw new Error(`Duplicate GEO index-state evidence: ${key}`);
    seen.add(key);
  }
  return rows;
};

export const importGeoIndexNowReceiptBatch = (inputs: unknown[]) =>
  batch(inputs, importGeoIndexNowReceiptRow, "IndexNow receipt");

export const buildGeoIndexEvidenceReport = (
  indexStates: GeoAuthenticatedIndexStateRecord[],
  indexNowReceipts: GeoIndexNowReceiptRecord[],
): GeoIndexEvidenceReport => ({
  indexStates: [...indexStates].sort(
    (left, right) =>
      left.pagePath.localeCompare(right.pagePath) ||
      left.source.localeCompare(right.source) ||
      left.checkedAt.localeCompare(right.checkedAt),
  ),
  indexNowReceipts: [...indexNowReceipts].sort(
    (left, right) =>
      left.pagePath.localeCompare(right.pagePath) || left.submittedAt.localeCompare(right.submittedAt),
  ),
  indexedPages: [...new Set(indexStates.filter((row) => row.state === "INDEXED").map((row) => row.pagePath))].sort(),
  notIndexedPages: [
    ...new Set(indexStates.filter((row) => row.state !== "INDEXED").map((row) => row.pagePath)),
  ].sort(),
  indexNowAcceptedPages: [
    ...new Set(indexNowReceipts.filter((row) => row.acceptance === "ACCEPTED").map((row) => row.pagePath)),
  ].sort(),
  indexNowSeparatedFromIndexState: true,
});
