import type { ShipmentHistoryRecord } from "./load-operations.ts";

export type ShipmentLifecycleConflictReason = "conflicting_lifecycle_status";

export type ShipmentLifecycleConflictGroup = Readonly<{
  semanticKey: string;
  recordIndexes: readonly number[];
  statuses: readonly ShipmentHistoryRecord["proofStatus"][];
  reason: ShipmentLifecycleConflictReason;
  proposedAction: "needs_review";
}>;

export type ShipmentLifecycleConflictReview = Readonly<{
  mode: "preview_only";
  writePerformed: false;
  publicExportEnabled: false;
  rawRecordsDeleted: false;
  conflictGroups: readonly ShipmentLifecycleConflictGroup[];
  summary: Readonly<{
    reviewedRecords: number;
    conflictGroups: number;
    recordsNeedingReview: number;
  }>;
}>;

const normalizePart = (value: string): string => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

export function buildShipmentSemanticKey(record: ShipmentHistoryRecord): string {
  return [
    normalizePart(`${record.originCity}-${record.originState}`),
    normalizePart(`${record.destinationCity}-${record.destinationState}`),
    normalizePart(record.equipmentClass),
    record.pickupDate,
    record.deliveryDate,
  ].join("__");
}

export function reviewShipmentLifecycleConflicts(
  records: readonly ShipmentHistoryRecord[],
): ShipmentLifecycleConflictReview {
  const groups = new Map<string, { indexes: number[]; statuses: Set<ShipmentHistoryRecord["proofStatus"]> }>();

  records.forEach((record, index) => {
    const key = buildShipmentSemanticKey(record);
    const group = groups.get(key) ?? { indexes: [], statuses: new Set<ShipmentHistoryRecord["proofStatus"]>() };
    group.indexes.push(index);
    group.statuses.add(record.proofStatus);
    groups.set(key, group);
  });

  const conflictGroups = [...groups.entries()]
    .filter(([, group]) => group.indexes.length > 1 && group.statuses.size > 1)
    .map(([semanticKey, group]) => Object.freeze({
      semanticKey,
      recordIndexes: Object.freeze([...group.indexes]),
      statuses: Object.freeze([...group.statuses].sort()),
      reason: "conflicting_lifecycle_status" as const,
      proposedAction: "needs_review" as const,
    }));

  return Object.freeze({
    mode: "preview_only",
    writePerformed: false,
    publicExportEnabled: false,
    rawRecordsDeleted: false,
    conflictGroups: Object.freeze(conflictGroups),
    summary: Object.freeze({
      reviewedRecords: records.length,
      conflictGroups: conflictGroups.length,
      recordsNeedingReview: conflictGroups.reduce((total, group) => total + group.recordIndexes.length, 0),
    }),
  });
}
