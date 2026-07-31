export type ShipmentLifecycleStatus = "observed" | "booked" | "completed" | "verified" | "published";
export type ImportDecision = "accept" | "update" | "hold" | "reject" | "needs_review";
export type FreshnessStatus = "fresh" | "stale" | "invalid";

export type ShipmentHistoryPreviewRow = {
  rowNumber: number;
  sourceRecordId: string | null;
  origin: string | null;
  destination: string | null;
  equipmentClass: string | null;
  eventDate: string | null;
  freshness: FreshnessStatus;
  lifecycleStatus: ShipmentLifecycleStatus | null;
  duplicateOf: string[];
  missingFields: string[];
  privacyFlags: string[];
  quarantineReasons: string[];
  proposedAction: ImportDecision;
};

export type ShipmentHistoryImportPreview = {
  mode: "preview_only";
  publicExportEnabled: false;
  rows: ShipmentHistoryPreviewRow[];
  summary: {
    total: number;
    accepted: number;
    held: number;
    rejected: number;
    needsReview: number;
    quarantined: number;
  };
};

const allowedEquipment = new Set(["car_hauler", "hotshot", "flatbed", "step_deck", "reefer", "dry_van", "power_only", "box_truck", "sprinter_van"]);
const lifecycleStatuses = new Set<ShipmentLifecycleStatus>(["observed", "booked", "completed", "verified", "published"]);
const forbiddenHeaders = new Set([
  "name", "contact_name", "phone", "email", "company", "carrier_name", "broker_name", "customer_name", "dealer_name", "shipper_name",
  "mc", "dot", "address", "pickup_address", "delivery_address", "exact_address", "order_id", "invoice", "invoice_id", "bol", "pod",
  "notes", "comments", "posted_rate", "negotiated_rate", "booked_rate", "commission", "live_position", "latitude", "longitude", "credential", "token",
]);
const requiredFields = ["source_record_id", "origin_city", "origin_state", "destination_city", "destination_state", "equipment_class", "event_date", "lifecycle_status"] as const;

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

function normalizeLocation(city?: string, state?: string): string | null {
  const safeCity = city?.trim().replace(/\s+/g, " ");
  const safeState = state?.trim().toUpperCase();
  return safeCity && safeState ? `${safeCity}, ${safeState}` : null;
}

function validDate(value?: string): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function lifecycle(value?: string): ShipmentLifecycleStatus | null {
  return value && lifecycleStatuses.has(value as ShipmentLifecycleStatus) ? value as ShipmentLifecycleStatus : null;
}

function canonicalKey(row: Record<string, string>): string | null {
  const values = [row.origin_city, row.origin_state, row.destination_city, row.destination_state, row.equipment_class, row.event_date]
    .map((value) => value?.trim().toLowerCase());
  return values.every(Boolean) ? values.join("|") : null;
}

export function previewShipmentHistoryCsv(csv: string, now = new Date()): ShipmentHistoryImportPreview {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return { mode: "preview_only", publicExportEnabled: false, rows: [], summary: { total: 0, accepted: 0, held: 0, rejected: 0, needsReview: 0, quarantined: 0 } };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const prohibited = headers.filter((header) => forbiddenHeaders.has(header));
  const parsedRows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
    return { row, rowNumber: index + 2, malformedColumnCount: values.length !== headers.length };
  });

  const duplicateMap = new Map<string, string[]>();
  for (const { row } of parsedRows) {
    const key = canonicalKey(row);
    const id = row.source_record_id?.trim();
    if (key && id) duplicateMap.set(key, [...(duplicateMap.get(key) ?? []), id]);
  }

  const rows = parsedRows.map(({ row, rowNumber, malformedColumnCount }) => {
    const missingFields = requiredFields.filter((field) => !row[field]?.trim());
    const privacyFlags = [...prohibited];
    const quarantineReasons: string[] = [];
    if (malformedColumnCount) quarantineReasons.push("malformed_column_count");
    if (missingFields.length) quarantineReasons.push("missing_required_fields");
    if (!validDate(row.event_date)) quarantineReasons.push("invalid_event_date");
    if (row.equipment_class && !allowedEquipment.has(row.equipment_class.trim().toLowerCase())) quarantineReasons.push("unknown_equipment_class");
    if (privacyFlags.length) quarantineReasons.push("prohibited_private_columns");
    if (!row.source_record_id?.trim()) quarantineReasons.push("missing_provenance");

    const status = lifecycle(row.lifecycle_status?.trim().toLowerCase());
    if (!status && row.lifecycle_status?.trim()) quarantineReasons.push("invalid_lifecycle_status");
    if (status === "published") quarantineReasons.push("unsupported_publication_flag");
    if ((status === "completed" || status === "verified") && row.reviewed !== "true") quarantineReasons.push("completion_requires_review");

    let freshness: FreshnessStatus = "invalid";
    if (validDate(row.event_date)) {
      const ageDays = Math.floor((now.getTime() - new Date(`${row.event_date}T00:00:00Z`).getTime()) / 86_400_000);
      freshness = ageDays > 30 && status === "observed" ? "stale" : "fresh";
      if (freshness === "stale") quarantineReasons.push("stale_observed_record");
    }

    const key = canonicalKey(row);
    const duplicateOf = key ? (duplicateMap.get(key) ?? []).filter((id) => id !== row.source_record_id?.trim()) : [];
    if (duplicateOf.length) quarantineReasons.push("duplicate_candidate");

    let proposedAction: ImportDecision = "accept";
    if (privacyFlags.length || malformedColumnCount || !status || quarantineReasons.includes("unsupported_publication_flag")) proposedAction = "reject";
    else if (quarantineReasons.includes("missing_required_fields") || quarantineReasons.includes("invalid_event_date") || quarantineReasons.includes("missing_provenance")) proposedAction = "hold";
    else if (duplicateOf.length) proposedAction = "update";
    else if (quarantineReasons.length) proposedAction = "needs_review";

    return {
      rowNumber,
      sourceRecordId: row.source_record_id?.trim() || null,
      origin: normalizeLocation(row.origin_city, row.origin_state),
      destination: normalizeLocation(row.destination_city, row.destination_state),
      equipmentClass: row.equipment_class?.trim().toLowerCase() || null,
      eventDate: validDate(row.event_date) ? row.event_date : null,
      freshness,
      lifecycleStatus: status,
      duplicateOf,
      missingFields: [...missingFields],
      privacyFlags,
      quarantineReasons: [...new Set(quarantineReasons)],
      proposedAction,
    } satisfies ShipmentHistoryPreviewRow;
  });

  return {
    mode: "preview_only",
    publicExportEnabled: false,
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
