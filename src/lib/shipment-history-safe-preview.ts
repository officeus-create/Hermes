import {
  previewShipmentHistoryCsv,
  type ShipmentHistoryImportPreview,
  type ShipmentHistoryPreviewRow,
} from "./shipment-history-preview";

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
  "mc",
  "dot",
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

const approvedOperationalHeaders = new Set([
  "source_record_id",
  "origin_city",
  "origin_state",
  "destination_city",
  "destination_state",
  "equipment_class",
  "event_date",
  "lifecycle_status",
  "reviewed",
]);

function parseHeaderLine(line: string): string[] {
  const headers: string[] = [];
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
      headers.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  headers.push(current.trim());
  return headers;
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

function compoundPrivateHeaders(csv: string): string[] {
  const firstLine = csv.trim().split(/\r?\n/, 1)[0] ?? "";
  if (!firstLine) return [];

  return parseHeaderLine(firstLine)
    .filter((header) => {
      const canonicalHeader = normalizedHeader(header);
      if (!canonicalHeader || approvedOperationalHeaders.has(canonicalHeader)) return false;
      return headerTokens(header).some((token) => privateHeaderTokens.has(token));
    })
    .map(normalizedHeader);
}

function rejectPrivateHeaders(
  row: ShipmentHistoryPreviewRow,
  privateHeaders: string[],
): ShipmentHistoryPreviewRow {
  if (privateHeaders.length === 0) return row;

  return {
    ...row,
    privacyFlags: [...new Set([...row.privacyFlags, ...privateHeaders])],
    quarantineReasons: [...new Set([...row.quarantineReasons, "prohibited_private_data"])],
    proposedAction: "reject",
  };
}

/**
 * Privacy-hardened, preview-only Shipment History adapter.
 *
 * The base parser blocks exact prohibited headers. This adapter also blocks
 * compound aliases in delimited or camelCase form, such as driver_phone,
 * customerEmail, company_id, orderNumber, negotiatedRateUsd, or
 * carrierMcNumber. It never removes raw preview rows and never enables public
 * export.
 */
export function previewSafeShipmentHistoryCsv(
  csv: string,
  now = new Date(),
): ShipmentHistoryImportPreview {
  const preview = previewShipmentHistoryCsv(csv, now);
  const privateHeaders = compoundPrivateHeaders(csv);
  if (privateHeaders.length === 0) return preview;

  const rows = preview.rows.map((row) => rejectPrivateHeaders(row, privateHeaders));

  return {
    ...preview,
    rows,
    summary: {
      total: rows.length,
      accepted: rows.filter((row) => row.proposedAction === "accept").length,
      held: rows.filter((row) => row.proposedAction === "hold").length,
      rejected: rows.filter((row) => row.proposedAction === "reject").length,
      needsReview: rows.filter((row) => row.proposedAction === "needs_review" || row.proposedAction === "update").length,
      quarantined: rows.filter((row) => row.quarantineReasons.length > 0).length,
    },
  };
}
