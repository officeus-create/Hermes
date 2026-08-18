import { importGeoOutcomeBatch, type GeoImportedOutcome } from "./geo-measurement-import.ts";

export const geoPrivateOutcomeAggregateVersion = "geo_private_outcome_aggregate_v1" as const;

const bundleFields = new Set(["schema_version", "observed_at", "rows"]);
const rowFields = new Set([
  "window_days",
  "page_path",
  "reviewed_inquiries",
  "qualified_leads",
  "opportunities",
  "wins",
  "losses",
  "revenue_reconciled_wins",
  "evidence_class",
]);

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};

const exactFields = (row: Record<string, unknown>, allowed: Set<string>, label: string) => {
  for (const key of Object.keys(row)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  }
  for (const field of allowed) {
    if (!(field in row)) throw new Error(`${label} is missing field: ${field}`);
  }
};

export const importGeoPrivateOutcomeAggregateBundle = (input: unknown): {
  schemaVersion: typeof geoPrivateOutcomeAggregateVersion;
  observedAt: string;
  rows: GeoImportedOutcome[];
} => {
  const bundle = asRecord(input, "GEO private outcome bundle");
  exactFields(bundle, bundleFields, "GEO private outcome bundle");
  if (bundle.schema_version !== geoPrivateOutcomeAggregateVersion) {
    throw new Error(`schema_version must be ${geoPrivateOutcomeAggregateVersion}`);
  }
  if (typeof bundle.observed_at !== "string" || !Number.isFinite(Date.parse(bundle.observed_at))) {
    throw new Error("observed_at must be a valid ISO date/time");
  }
  const observedAt = new Date(Date.parse(bundle.observed_at)).toISOString();
  if (!Array.isArray(bundle.rows)) throw new Error("rows must be an array");
  if (bundle.rows.length > 5000) throw new Error("rows must contain at most 5000 aggregates");

  const normalizedRows = bundle.rows.map((inputRow, index) => {
    const row = asRecord(inputRow, `GEO private outcome row ${index + 1}`);
    exactFields(row, rowFields, `GEO private outcome row ${index + 1}`);
    return { ...row, observed_at: observedAt };
  });

  const rows = importGeoOutcomeBatch(normalizedRows);
  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.windowDays}|${row.pagePath}`;
    if (seen.has(key)) throw new Error(`Duplicate private outcome owner/window aggregate: ${key}`);
    seen.add(key);
  }

  return { schemaVersion: geoPrivateOutcomeAggregateVersion, observedAt, rows };
};
