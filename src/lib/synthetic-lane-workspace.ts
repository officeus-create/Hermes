import {
  validateSanitizedLaneRecord,
  type LaneAccessRole,
  type SanitizedLaneRecord,
} from "./lane-intelligence-access.ts";

export type SyntheticWorkspaceRole = Extract<LaneAccessRole, "dispatcher" | "carrier">;

export type SyntheticWorkspaceRequest = Readonly<{
  role: SyntheticWorkspaceRole;
  records: readonly unknown[];
  carrierLaneScope?: readonly string[];
}>;

export type SyntheticWorkspaceRow = Readonly<{
  laneId: string;
  originRegion: string;
  destinationRegion: string;
  equipmentClass: string;
  periodStart: string;
  periodEnd: string;
  completedShipmentCount: number;
  medianLoadedMiles: number;
  medianDeadheadMiles: number;
  publicationStatus: SanitizedLaneRecord["publicationStatus"];
  provenance: SanitizedLaneRecord["provenance"];
}>;

export type SyntheticWorkspaceView = Readonly<{
  surface: "private_synthetic_workspace";
  role: SyntheticWorkspaceRole;
  mode: "read_only";
  datasetClass: "synthetic";
  externalActionPerformed: false;
  writeEnabled: false;
  bookingEnabled: false;
  providerConnectionsEnabled: false;
  publicExportEnabled: false;
  rows: readonly SyntheticWorkspaceRow[];
  rejectedRecordCount: number;
}>;

function normalizeLaneId(value: string): string {
  return value.trim().toLowerCase();
}

function toWorkspaceRow(record: SanitizedLaneRecord): SyntheticWorkspaceRow {
  return Object.freeze({
    laneId: record.laneId,
    originRegion: record.originRegion,
    destinationRegion: record.destinationRegion,
    equipmentClass: record.equipmentClass,
    periodStart: record.periodStart,
    periodEnd: record.periodEnd,
    completedShipmentCount: record.completedShipmentCount,
    medianLoadedMiles: record.medianLoadedMiles,
    medianDeadheadMiles: record.medianDeadheadMiles,
    publicationStatus: record.publicationStatus,
    provenance: Object.freeze({ ...record.provenance }),
  });
}

export function createSyntheticLaneWorkspace(request: SyntheticWorkspaceRequest): SyntheticWorkspaceView {
  const validated = request.records.map(validateSanitizedLaneRecord);
  const syntheticRecords = validated
    .filter((result): result is typeof result & { value: SanitizedLaneRecord } => (
      result.valid
      && result.value?.provenance.sourceType === "synthetic"
    ))
    .map((result) => result.value);

  const carrierScope = new Set((request.carrierLaneScope ?? []).map(normalizeLaneId));
  const visibleRecords = request.role === "carrier"
    ? syntheticRecords.filter((record) => carrierScope.has(normalizeLaneId(record.laneId)))
    : syntheticRecords;

  return Object.freeze({
    surface: "private_synthetic_workspace",
    role: request.role,
    mode: "read_only",
    datasetClass: "synthetic",
    externalActionPerformed: false,
    writeEnabled: false,
    bookingEnabled: false,
    providerConnectionsEnabled: false,
    publicExportEnabled: false,
    rows: Object.freeze(visibleRecords.map(toWorkspaceRow)),
    rejectedRecordCount: request.records.length - syntheticRecords.length,
  });
}
