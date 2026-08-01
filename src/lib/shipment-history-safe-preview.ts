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
      headers.push(current.trim().toLowerCase());
      current = "";
    } else {
      current += character;
    }
  }

  headers.push(current.trim().toLowerCase());
  return headers;
}

function compoundPrivateHeaders(csv: string): string[] {
  const firstLine = csv.trim().split(/\r?\n/, 1)[0] ?? "";
  if (!firstLine) return [];

  return parseHeaderLine(firstLine).filter((header) => {
    if (!header || approvedOperationalHeaders.has(header)) return false;
    const tokens = header.split(/[^a-z0-9]+/).filter(Boolean);
    return tokens.some((token) => privateHeaderTokens.has(token));
  });
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
 * compound aliases such as driver_phone, customer_email, company_id,
 * order_number, invoice_number, negotiated_rate_usd, or carrier_mc_number.
 * It never removes raw preview rows and never enables public export.
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
