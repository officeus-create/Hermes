import {
  previewShipmentHistoryCsv,
  type ShipmentHistoryImportPreview,
  type ShipmentHistoryPreviewRow,
} from "./shipment-history-preview";

function withRepeatedSourceIdQuarantine(
  row: ShipmentHistoryPreviewRow,
  repeatedSourceIds: Set<string>,
): ShipmentHistoryPreviewRow {
  if (!row.sourceRecordId || !repeatedSourceIds.has(row.sourceRecordId)) return row;

  return {
    ...row,
    quarantineReasons: [...new Set([...row.quarantineReasons, "duplicate_source_record_id"])],
    proposedAction: row.proposedAction === "reject" ? "reject" : "needs_review",
  };
}

/**
 * Preview-only guard for repeated provenance identifiers.
 *
 * Raw records are never removed or merged. Every row sharing a repeated
 * sourceRecordId remains visible and is routed to manual review.
 */
export function previewShipmentHistoryCsvWithProvenanceGuard(
  csv: string,
  now = new Date(),
): ShipmentHistoryImportPreview {
  const preview = previewShipmentHistoryCsv(csv, now);
  const sourceIdCounts = new Map<string, number>();

  for (const row of preview.rows) {
    if (!row.sourceRecordId) continue;
    sourceIdCounts.set(row.sourceRecordId, (sourceIdCounts.get(row.sourceRecordId) ?? 0) + 1);
  }

  const repeatedSourceIds = new Set(
    [...sourceIdCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([sourceRecordId]) => sourceRecordId),
  );

  if (repeatedSourceIds.size === 0) return preview;

  const rows = preview.rows.map((row) => withRepeatedSourceIdQuarantine(row, repeatedSourceIds));

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
