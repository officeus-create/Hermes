import {
  previewOffersCsv,
  previewShipmentHistoryCsv,
  type ImportPreview,
} from "./load-import-preview.ts";
import type { NormalizedOffer, ShipmentHistoryRecord } from "./load-operations.ts";

export type SanitizedCsvImportKind = "offers" | "shipment_history";

export type SanitizedCsvAdapterRequest = Readonly<{
  importKind: SanitizedCsvImportKind;
  csv: string;
  ownerApproved: boolean;
  sourceApproved: boolean;
  privacyReviewPassed: boolean;
  dataRightsReviewPassed: boolean;
  now?: Date;
}>;

export type SanitizedCsvAdapterDenied = Readonly<{
  status: "denied";
  reason: string;
  importKind: SanitizedCsvImportKind;
  externalActionPerformed: false;
  writePerformed: false;
  publicExportPerformed: false;
}>;

export type SanitizedCsvAdapterAccepted<T> = Readonly<{
  status: "preview_complete";
  importKind: SanitizedCsvImportKind;
  preview: ImportPreview<T>;
  externalActionPerformed: false;
  writePerformed: false;
  publicExportPerformed: false;
}>;

export type SanitizedCsvAdapterResult =
  | SanitizedCsvAdapterDenied
  | SanitizedCsvAdapterAccepted<NormalizedOffer>
  | SanitizedCsvAdapterAccepted<ShipmentHistoryRecord>;

export const SANITIZED_CSV_ADAPTER_MODE = "preview_only" as const;
export const SANITIZED_CSV_MAX_BYTES = 2_000_000;
export const SANITIZED_CSV_MAX_ROWS = 5_000;

function deny(request: SanitizedCsvAdapterRequest, reason: string): SanitizedCsvAdapterDenied {
  return Object.freeze({
    status: "denied",
    reason,
    importKind: request.importKind,
    externalActionPerformed: false,
    writePerformed: false,
    publicExportPerformed: false,
  });
}

function csvByteLength(csv: string): number {
  return new TextEncoder().encode(csv).byteLength;
}

function countDataRows(csv: string): number {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  return Math.max(0, lines.length - 1);
}

export function runSanitizedCsvPreview(request: SanitizedCsvAdapterRequest): SanitizedCsvAdapterResult {
  if (!request.ownerApproved) return deny(request, "Owner approval is required");
  if (!request.sourceApproved) return deny(request, "The sanitized export source is not approved");
  if (!request.privacyReviewPassed) return deny(request, "A field-level privacy review is required");
  if (!request.dataRightsReviewPassed) return deny(request, "Data ownership and permitted-use review is required");
  if (!request.csv.trim()) return deny(request, "CSV content is empty");
  if (csvByteLength(request.csv) > SANITIZED_CSV_MAX_BYTES) {
    return deny(request, `CSV exceeds the ${SANITIZED_CSV_MAX_BYTES}-byte preview limit`);
  }
  if (countDataRows(request.csv) > SANITIZED_CSV_MAX_ROWS) {
    return deny(request, `CSV exceeds the ${SANITIZED_CSV_MAX_ROWS}-row preview limit`);
  }

  if (request.importKind === "offers") {
    return Object.freeze({
      status: "preview_complete",
      importKind: request.importKind,
      preview: previewOffersCsv(request.csv, request.now),
      externalActionPerformed: false,
      writePerformed: false,
      publicExportPerformed: false,
    });
  }

  return Object.freeze({
    status: "preview_complete",
    importKind: request.importKind,
    preview: previewShipmentHistoryCsv(request.csv),
    externalActionPerformed: false,
    writePerformed: false,
    publicExportPerformed: false,
  });
}
