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

const compactPrivateHeaderFragments = [
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
];

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

function compactHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function hasCompactPrivateFragment(header: string): boolean {
  const compact = compactHeader(header);
  if (!compact) return false;

  if (compactPrivateHeaderFragments.some((fragment) => compact.includes(fragment))) {
    return true;
  }

  // Short identifiers are checked as identifier-like fragments to avoid broad
  // substring matches while still blocking aliases such as carrierMCNumber,
  // dotnumber, bolurl, or poddocument.
  return /(?:^|(?:carrier|broker|company))(?:mc|dot)(?:id|number|no)?(?:$|[a-z0-9])/.test(compact)
    || /(?:^|order)(?:bol|pod)(?:id|url|file|document|number|no)?(?:$|[a-z0-9])/.test(compact);
}

function compoundPrivateHeaders(csv: string): string[] {
  const firstLine = csv.trim().split(/\r?\n/, 1)[0] ?? "";
  if (!firstLine) return [];

  return parseHeaderLine(firstLine)
    .filter((header) => {
      const canonicalHeader = normalizedHeader(header);
      if (!canonicalHeader || approvedOperationalHeaders.has(canonicalHeader)) return false;
      return headerTokens(header).some((token) => privateHeaderTokens.has(token))
        || hasCompactPrivateFragment(header);
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
 * compound aliases in delimited, camelCase, or compact lowercase form, such
 * as driver_phone, customerEmail, customeremail, company_id, orderNumber,
 * negotiatedRateUsd, carrierMcNumber, vehicleVin, licensePlate, or taxId.
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
