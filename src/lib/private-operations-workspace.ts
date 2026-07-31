import type {
  FreshnessStatus,
  ImportDecision,
  ShipmentHistoryImportPreview,
  ShipmentLifecycleStatus,
} from "./shipment-history-preview";

export type OperationsWorkspaceRole = "dispatcher" | "carrier";

export type OperationsWorkspaceFilters = {
  status?: ShipmentLifecycleStatus;
  equipmentClass?: string;
  origin?: string;
  destination?: string;
  freshness?: FreshnessStatus;
  decision?: ImportDecision;
};

export type OperationsWorkspaceRow = Readonly<{
  recordRef: string;
  origin: string;
  destination: string;
  equipmentClass: string;
  eventDate: string;
  freshness: FreshnessStatus;
  lifecycleStatus: ShipmentLifecycleStatus;
  decision: ImportDecision;
  duplicateCount: number;
  quarantineReasons: readonly string[];
  requiresReview: boolean;
}>;

export type OperationsWorkspaceView = Readonly<{
  role: OperationsWorkspaceRole;
  mode: "private_read_only_synthetic";
  publicExportEnabled: false;
  externalActionsEnabled: false;
  rows: readonly OperationsWorkspaceRow[];
  summary: Readonly<{
    total: number;
    quarantined: number;
    duplicates: number;
    needsReview: number;
  }>;
}>;

const normalizeFilter = (value?: string) => value?.trim().toLowerCase() ?? "";

function matches(value: string, query?: string): boolean {
  const normalized = normalizeFilter(query);
  return !normalized || value.toLowerCase().includes(normalized);
}

export function buildPrivateOperationsWorkspace(
  preview: ShipmentHistoryImportPreview,
  role: OperationsWorkspaceRole,
  filters: OperationsWorkspaceFilters = {},
): OperationsWorkspaceView {
  const rows = preview.rows
    .filter((row) => row.sourceRecordId && row.origin && row.destination && row.equipmentClass && row.eventDate && row.lifecycleStatus)
    .filter((row) => !filters.status || row.lifecycleStatus === filters.status)
    .filter((row) => !filters.freshness || row.freshness === filters.freshness)
    .filter((row) => !filters.decision || row.proposedAction === filters.decision)
    .filter((row) => matches(row.equipmentClass ?? "", filters.equipmentClass))
    .filter((row) => matches(row.origin ?? "", filters.origin))
    .filter((row) => matches(row.destination ?? "", filters.destination))
    .map((row) => Object.freeze({
      recordRef: row.sourceRecordId as string,
      origin: row.origin as string,
      destination: row.destination as string,
      equipmentClass: row.equipmentClass as string,
      eventDate: row.eventDate as string,
      freshness: row.freshness,
      lifecycleStatus: row.lifecycleStatus as ShipmentLifecycleStatus,
      decision: row.proposedAction,
      duplicateCount: row.duplicateOf.length,
      quarantineReasons: Object.freeze([...row.quarantineReasons]),
      requiresReview: row.quarantineReasons.length > 0 || row.proposedAction !== "accept",
    } satisfies OperationsWorkspaceRow));

  const safeRows = role === "carrier"
    ? rows.map((row) => Object.freeze({
        ...row,
        quarantineReasons: Object.freeze(row.quarantineReasons.map(() => "internal_review_required")),
      }))
    : rows;

  return Object.freeze({
    role,
    mode: "private_read_only_synthetic",
    publicExportEnabled: false,
    externalActionsEnabled: false,
    rows: Object.freeze(safeRows),
    summary: Object.freeze({
      total: safeRows.length,
      quarantined: safeRows.filter((row) => row.quarantineReasons.length > 0).length,
      duplicates: safeRows.filter((row) => row.duplicateCount > 0).length,
      needsReview: safeRows.filter((row) => row.requiresReview).length,
    }),
  });
}
