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

function normalizedIdentity(value: string): string {
  return value.trim().toLowerCase();
}

function sourceRowNumbersByOfferId(csv: string): Map<string, number[]> {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0] ?? "").map((header) => header.trim().toLowerCase());
  const offerIdIndex = headers.indexOf("offer_id");
  const rowsByOfferId = new Map<string, number[]>();
  if (offerIdIndex < 0) return rowsByOfferId;

  lines.slice(1).forEach((line, index) => {
    const values = parseCsvLine(line);
    const identity = normalizedIdentity(values[offerIdIndex] ?? "");
    if (!identity) return;
    const rowNumbers = rowsByOfferId.get(identity) ?? [];
    rowNumbers.push(index + 2);
    rowsByOfferId.set(identity, rowNumbers);
  });

  return rowsByOfferId;
}

/**
 * Applies the operational freshness policy on top of the generic CSV preview.
 * Expired load-board observations remain private evidence candidates only and
 * cannot enter the active offer feed, publication pipeline, or capacity claims.
 */
export function previewActiveOffersCsv(csv: string, now = new Date()): StrictOfferPreview {
  const base: ImportPreview<NormalizedOffer> = previewOffersCsv(csv, now);
  const accepted = base.accepted.filter((offer) => offer.freshness === "fresh");
  const staleOffers = base.accepted.filter((offer) => offer.freshness !== "fresh");
  const rowNumbersByOfferId = sourceRowNumbersByOfferId(csv);
  const staleRows: StrictOfferQuarantineRow[] = staleOffers.map((offer) => {
    const identity = normalizedIdentity(offer.offerId);
    const matchingRows = rowNumbersByOfferId.get(identity) ?? [];
    const rowNumber = matchingRows.shift() ?? 0;

    return Object.freeze({
      rowNumber,
      reason: "stale_observation" as const,
      message: "Expired private offer observation held for review; it is not a confirmed route or public capacity fact",
    });
  });
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
