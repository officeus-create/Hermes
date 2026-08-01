import {
  previewOffersCsv,
  type ImportPreview,
  type QuarantinedImportRow,
} from "./load-import-preview.ts";
import type { NormalizedOffer } from "./load-operations.ts";

export type StrictOfferQuarantineReason =
  | QuarantinedImportRow["reason"]
  | "stale_observation";

export type StrictOfferQuarantineRow = Readonly<{
  rowNumber: number;
  reason: StrictOfferQuarantineReason;
  message: string;
}>;

export type StrictOfferPreview = Readonly<{
  mode: "preview_only";
  writePerformed: false;
  publicExportEnabled: false;
  accepted: readonly NormalizedOffer[];
  quarantined: readonly StrictOfferQuarantineRow[];
  summary: Readonly<{
    totalRows: number;
    acceptedRows: number;
    quarantinedRows: number;
  }>;
}>;

/**
 * Applies the operational freshness policy on top of the generic CSV preview.
 * Expired load-board observations remain private evidence candidates only and
 * cannot enter the active offer feed, publication pipeline, or capacity claims.
 */
export function previewActiveOffersCsv(csv: string, now = new Date()): StrictOfferPreview {
  const base: ImportPreview<NormalizedOffer> = previewOffersCsv(csv, now);
  const accepted = base.accepted.filter((offer) => offer.freshness === "fresh");
  const staleCount = base.accepted.length - accepted.length;
  const staleRows: StrictOfferQuarantineRow[] = Array.from({ length: staleCount }, (_, index) => Object.freeze({
    rowNumber: 0,
    reason: "stale_observation" as const,
    message: `Expired private offer observation ${index + 1} held for review; it is not a confirmed route or public capacity fact`,
  }));
  const quarantined: StrictOfferQuarantineRow[] = [
    ...base.quarantined,
    ...staleRows,
  ];

  return Object.freeze({
    mode: "preview_only",
    writePerformed: false,
    publicExportEnabled: false,
    accepted: Object.freeze(accepted),
    quarantined: Object.freeze(quarantined),
    summary: Object.freeze({
      totalRows: base.summary.totalRows,
      acceptedRows: accepted.length,
      quarantinedRows: quarantined.length,
    }),
  });
}
