import {
  importOffersCsv,
  importShipmentHistoryCsv,
  type NormalizedOffer,
  type ShipmentHistoryRecord,
} from "./load-operations.ts";

export type ShipmentLifecycleStatus = "observed" | "booked" | "completed" | "verified" | "published";

export type ImportQuarantineReason =
  | "private_columns"
  | "missing_required_field"
  | "invalid_value"
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

function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Unknown import validation error";
  return raw
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .slice(0, 240);
}

function classifyReason(message: string): ImportQuarantineReason {
  if (message.includes("Private columns are not allowed")) return "private_columns";
  if (message.includes("Missing required CSV field")) return "missing_required_field";
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

function createPreview<T>(
  csv: string,
  importer: CsvImporter<T>,
  identities: IdentitySelector<T>,
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

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    try {
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
    (record) => [`shipment:${record.shipmentId}`, `source:${record.sourceRecordId}`],
  );
}

export function previewOffersCsv(csv: string, now = new Date()): ImportPreview<NormalizedOffer> {
  return createPreview(
    csv,
    (singleRowCsv) => importOffersCsv(singleRowCsv, now),
    (record) => [`offer:${record.offerId}`, `source:${record.sourceRecordId}`],
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
