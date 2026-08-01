import type { SyntheticWorkspaceView } from "./synthetic-lane-workspace.ts";

export type SyntheticWorkspaceUiRow = Readonly<{
  laneLabel: string;
  routeLabel: string;
  equipmentLabel: string;
  periodLabel: string;
  shipmentCountLabel: string;
  distanceLabel: string;
  statusLabel: string;
  provenanceLabel: "Synthetic test data";
}>;

export type SyntheticWorkspaceUi = Readonly<{
  surface: "private_synthetic_workspace_ui";
  title: string;
  roleLabel: string;
  modeLabel: "Read-only";
  dataLabel: "Synthetic test data only";
  privacyNotice: string;
  publicCapacityClaim: false;
  confirmedRouteClaim: false;
  controls: readonly never[];
  rows: readonly SyntheticWorkspaceUiRow[];
}>;

function statusLabel(status: SyntheticWorkspaceView["rows"][number]["publicationStatus"]): string {
  if (status === "approved_for_publication") return "Synthetic approval state";
  if (status === "reviewed") return "Synthetic reviewed state";
  return "Research only";
}

export function createSyntheticWorkspaceUi(view: SyntheticWorkspaceView): SyntheticWorkspaceUi {
  if (view.surface !== "private_synthetic_workspace" || view.mode !== "read_only") {
    throw new Error("Private synthetic workspace UI requires a read-only synthetic workspace view");
  }
  if (view.datasetClass !== "synthetic" || view.publicExportEnabled || view.providerConnectionsEnabled) {
    throw new Error("Private synthetic workspace UI cannot render connected or export-enabled data");
  }

  return Object.freeze({
    surface: "private_synthetic_workspace_ui",
    title: view.role === "dispatcher" ? "Dispatcher lane preview" : "Carrier lane preview",
    roleLabel: view.role === "dispatcher" ? "Dispatcher" : "Carrier",
    modeLabel: "Read-only",
    dataLabel: "Synthetic test data only",
    privacyNotice: "No identities, exact addresses, rates, documents, live positions, credentials, booking actions, provider connections, or public exports are available on this screen.",
    publicCapacityClaim: false,
    confirmedRouteClaim: false,
    controls: Object.freeze([]),
    rows: Object.freeze(view.rows.map((row) => Object.freeze({
      laneLabel: row.laneId,
      routeLabel: `${row.originRegion} → ${row.destinationRegion}`,
      equipmentLabel: row.equipmentClass,
      periodLabel: `${row.periodStart} — ${row.periodEnd}`,
      shipmentCountLabel: `${row.completedShipmentCount} synthetic completed shipments`,
      distanceLabel: `${row.medianLoadedMiles} loaded mi / ${row.medianDeadheadMiles} deadhead mi`,
      statusLabel: statusLabel(row.publicationStatus),
      provenanceLabel: "Synthetic test data",
    }))),
  });
}
