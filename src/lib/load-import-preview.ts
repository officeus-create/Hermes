import {
  importOffersCsv,
  importShipmentHistoryCsv,
  type NormalizedOffer,
  type ShipmentHistoryRecord,
} from "./load-operations.ts";
import { createProvenanceIdentityKey } from "./provenance-identity.ts";

export type ShipmentLifecycleStatus = "observed" | "booked" | "completed" | "verified" | "published";

export type ImportQuarantineReason =
  | "private_columns"
  | "missing_required_field"
  | "invalid_value"
  | "invalid_date"
  | "invalid_lifecycle_evidence"
  | "duplicate_record"
  | "malformed_csv";

export type QuarantinedImportRow = Readonly<{
  rowNumber: number;
  reason: ImportQuarantineReason;
  message: string;
}>;

export type ImportPreview<T> = Readonly<{
  mode: "preview_only";
  writePerformed: false;
  accepted: readonly T[];
  quarantined: readonly QuarantinedImportRow[];
  summary: Readonly<{
    totalRows: number;
    acceptedRows: number;
    quarantinedRows: number;
  }>;
}>;

export type LifecycleTransitionPreview = Readonly<{
  from: ShipmentLifecycleStatus;
  to: ShipmentLifecycleStatus;
  allowed: boolean;
  requiresPublicationApproval: boolean;
  writePerformed: false;
  reason: string;
}>;

type CsvImporter<T> = (csv: string) => T[];
type IdentitySelector<T> = (record: T) => readonly string[];

const lifecycleOrder: readonly ShipmentLifecycleStatus[] = [
  "observed",
  "booked",
  "completed",
  "verified",
  "published",
];

const shipmentHistoryHeaders = new Set([
  "shipment_id",
  "proof_status",
  "origin_city",
  "origin_state",
  "destination_city",
  "destination_state",
  "equipment_class",
  "pickup_date",
  "delivery_date",
  "booked_rate",
  "loaded_miles",
  "deadhead_miles",
  "source_record_id",
  "delivery_confirmed",
  "bol_or_pod_confirmed",
  "manual_operational_confirmed",
  "cancellations_and_claims_reviewed",
]);

const offerHeaders = new Set([
  "offer_id",
  "source_name",
  "source_record_id",
  "observed_at",
  "expires_at",
  "pickup_date",
  "origin_city",
  "origin_state",
  "destination_city",
  "destination_state",
  "equipment_class",
  "posted_rate",
  "negotiated_rate",
  "booked_rate",
  "loaded_miles",
  "deadhead_miles",
]);

const privateHeaderTokens = new Set([
  "name",
  "phone",
  "email",
  "company",
  "carrier",
  "broker",
  "customer",
  "dealer",
  "shipper",
  "driver",
  "contact",
  "person",
  "mc",
  "dot",
  "vin",
  "ssn",
  "ein",
  "tax",
  "license",
  "plate",
  "address",
  "order",
  "invoice",
  "bol",
  "pod",
  "note",
  "notes",
  "comment",
  "comments",
  "rate",
  "commission",
  "position",
  "latitude",
  "longitude",
  "credential",
  "token",
]);

const compactPrivateFragments = [
  "name",
  "phone",
  "email",
  "company",
  "carrier",
  "broker",
  "customer",
  "dealer",
  "shipper",
  "driver",
  "contact",
  "person",
  "vin",
  "ssn",
  "ein",
  "taxid",
  "license",
  "plate",
  "address",
  "order",
  "invoice",
  "note",
  "comment",
  "rate",
  "commission",
  "position",
  "latitude",
  "longitude",
  "credential",
  "token",
] as const;

function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Unknown import validation error";
  return raw
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .replace(/\bShipment\s+\S+(?=\s+cannot\b)/gi, "Shipment [redacted-id]")
    .slice(0, 240);
}

function classifyReason(message: string): ImportQuarantineReason {
  if (message.includes("Private columns are not allowed")) return "private_columns";
  if (message.includes("Missing required CSV field")) return "missing_required_field";
  if (message.includes("Invalid ISO date") || message.includes("date order is invalid")) return "invalid_date";
  if (message.includes("cannot be") && message.includes("without delivery evidence")) {
    return "invalid_lifecycle_evidence";
  }
  if (
    message.includes("Invalid non-negative number")
    || message.includes("Invalid proof_status")
    || message.includes("Invalid boolean")
  ) {
    return "invalid_value";
  }
  return "malformed_csv";
}

function splitCsvDocument(csv: string): { header: string; rows: string[] } {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  return {
    header: lines[0] ?? "",
    rows: lines.slice(1),
  };
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizedHeader(header: string): string {
  return header.trim().toLowerCase();
}

function headerTokens(header: string): string[] {
  return header
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function compactHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function hasPrivateHeaderAlias(header: string, approvedHeaders: ReadonlySet<string>): boolean {
  const normalized = normalizedHeader(header);
  if (!normalized || approvedHeaders.has(normalized)) return false;

  if (headerTokens(header).some((token) => privateHeaderTokens.has(token))) return true;

  const compact = compactHeader(header);
  if (compactPrivateFragments.some((fragment) => compact.includes(fragment))) return true;

  return /(?:^|(?:carrier|broker|company))(?:mc|dot)(?:id|number|no)?(?:$|[a-z0-9])/.test(compact)
    || /(?:^|order)(?:bol|pod)(?:id|url|file|document|number|no)?(?:$|[a-z0-9])/.test(compact);
}

function privateHeaderAliases(header: string, approvedHeaders: ReadonlySet<string>): string[] {
  if (!header) return [];
  return parseCsvLine(header)
    .filter((candidate) => hasPrivateHeaderAlias(candidate, approvedHeaders))
    .map(normalizedHeader)
    .filter((candidate, index, aliases) => aliases.indexOf(candidate) === index)
    .sort();
}

function parseDateOnly(value: string, field: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid ISO date in CSV field: ${field}`);
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ISO date in CSV field: ${field}`);
  }
  return timestamp;
}

function parseDateTime(value: string, field: string): number {
  const timestamp = Date.parse(value);
  if (!value || !Number.isFinite(timestamp) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new Error(`Invalid ISO date in CSV field: ${field}`);
  }
  return timestamp;
}

function validateTemporalFields(header: string, row: string): void {
  const headers = parseCsvLine(header).map(normalizedHeader);
  const values = parseCsvLine(row);
  if (values.length !== headers.length) return;
  const record = Object.fromEntries(headers.map((name, index) => [name, values[index] ?? ""]));

  const pickup = record.pickup_date ? parseDateOnly(record.pickup_date, "pickup_date") : null;
  const delivery = record.delivery_date ? parseDateOnly(record.delivery_date, "delivery_date") : null;
  const observed = record.observed_at ? parseDateTime(record.observed_at, "observed_at") : null;
  const expires = record.expires_at ? parseDateTime(record.expires_at, "expires_at") : null;

  if (pickup !== null && delivery !== null && delivery < pickup) {
    throw new Error("Shipment date order is invalid: delivery_date precedes pickup_date");
  }
  if (observed !== null && expires !== null && expires <= observed) {
    throw new Error("Offer date order is invalid: expires_at must be after observed_at");
  }
}

function createPreview<T>(
  csv: string,
  importer: CsvImporter<T>,
  identities: IdentitySelector<T>,
  approvedHeaders: ReadonlySet<string>,
): ImportPreview<T> {
  const { header, rows } = splitCsvDocument(csv);
  const accepted: T[] = [];
  const quarantined: QuarantinedImportRow[] = [];
  const seen = new Set<string>();

  if (!header) {
    quarantined.push(Object.freeze({
      rowNumber: 1,
      reason: "malformed_csv",
      message: "CSV header is required",
    }));
  }

  const privateAliases = privateHeaderAliases(header, approvedHeaders);
  if (privateAliases.length) {
    const message = `Private columns are not allowed in the preview adapter: ${privateAliases.join(", ")}`;
    const affectedRows = rows.length ? rows : [""];
    affectedRows.forEach((_, index) => {
      quarantined.push(Object.freeze({
        rowNumber: rows.length ? index + 2 : 1,
        reason: "private_columns",
        message,
      }));
    });
  } else {
    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        validateTemporalFields(header, row);
        const imported = importer(`${header}\n${row}`);
        if (imported.length !== 1) throw new Error("CSV row did not produce exactly one preview record");
        const record = imported[0];
        const recordIdentities = identities(record).filter(Boolean);
        const duplicate = recordIdentities.some((identity) => seen.has(identity));
        if (duplicate) {
          quarantined.push(Object.freeze({
            rowNumber,
            reason: "duplicate_record",
            message: "Duplicate shipment, offer, or source-record identity in the preview file",
          }));
          return;
        }
        recordIdentities.forEach((identity) => seen.add(identity));
        accepted.push(Object.freeze(record));
      } catch (error) {
        const message = safeMessage(error);
        quarantined.push(Object.freeze({
          rowNumber,
          reason: classifyReason(message),
          message,
        }));
      }
    });
  }

  return Object.freeze({
    mode: "preview_only",
    writePerformed: false,
    accepted: Object.freeze(accepted),
    quarantined: Object.freeze(quarantined),
    summary: Object.freeze({
      totalRows: rows.length,
      acceptedRows: accepted.length,
      quarantinedRows: quarantined.length,
    }),
  });
}

export function previewShipmentHistoryCsv(csv: string): ImportPreview<ShipmentHistoryRecord> {
  return createPreview(
    csv,
    importShipmentHistoryCsv,
    (record) => [
      createProvenanceIdentityKey("shipment", record.shipmentId),
      createProvenanceIdentityKey("source", record.sourceRecordId),
    ],
    shipmentHistoryHeaders,
  );
}

export function previewOffersCsv(csv: string, now = new Date()): ImportPreview<NormalizedOffer> {
  return createPreview(
    csv,
    (singleRowCsv) => importOffersCsv(singleRowCsv, now),
    (record) => [
      createProvenanceIdentityKey("offer", record.offerId),
      createProvenanceIdentityKey("source", record.sourceRecordId),
    ],
    offerHeaders,
  );
}

export function previewLifecycleTransition(
  from: ShipmentLifecycleStatus,
  to: ShipmentLifecycleStatus,
  options: Readonly<{ publicationApproved?: boolean }> = {},
): LifecycleTransitionPreview {
  const fromIndex = lifecycleOrder.indexOf(from);
  const toIndex = lifecycleOrder.indexOf(to);
  const sequential = fromIndex >= 0 && toIndex === fromIndex + 1;
  const requiresPublicationApproval = from === "verified" && to === "published";
  const approvalSatisfied = !requiresPublicationApproval || options.publicationApproved === true;
  const allowed = sequential && approvalSatisfied;

  let reason = "Transition follows the approved lifecycle sequence";
  if (!sequential) reason = "Only the next lifecycle state can be previewed";
  else if (!approvalSatisfied) reason = "Publishing requires explicit publication approval";

  return Object.freeze({
    from,
    to,
    allowed,
    requiresPublicationApproval,
    writePerformed: false,
    reason,
  });
}
