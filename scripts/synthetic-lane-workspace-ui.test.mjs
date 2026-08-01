import assert from "node:assert/strict";
import { createSyntheticLaneWorkspace } from "../src/lib/synthetic-lane-workspace.ts";
import { createSyntheticWorkspaceUi } from "../src/lib/synthetic-lane-workspace-ui.ts";

const syntheticRecord = Object.freeze({
  laneId: "SYN-LANE-UI-1",
  originRegion: "Appleton, WI region",
  destinationRegion: "Chicago, IL region",
  equipmentClass: "car_hauler",
  periodStart: "2026-07-01",
  periodEnd: "2026-07-31",
  completedShipmentCount: 3,
  medianLoadedMiles: 190,
  medianDeadheadMiles: 12,
  publicationStatus: "research_only",
  provenance: Object.freeze({
    sourceType: "synthetic",
    sourceDate: "2026-08-01",
    reviewDate: "2026-08-01",
  }),
});

const workspace = createSyntheticLaneWorkspace({ role: "dispatcher", records: [syntheticRecord] });
const ui = createSyntheticWorkspaceUi(workspace);

assert.equal(ui.surface, "private_synthetic_workspace_ui");
assert.equal(ui.modeLabel, "Read-only");
assert.equal(ui.dataLabel, "Synthetic test data only");
assert.equal(ui.publicCapacityClaim, false);
assert.equal(ui.confirmedRouteClaim, false);
assert.equal(ui.controls.length, 0);
assert.equal(ui.rows.length, 1);
assert.equal(ui.rows[0].provenanceLabel, "Synthetic test data");
assert.match(ui.rows[0].statusLabel, /Research only/);
assert.match(ui.privacyNotice, /No identities/);
assert.match(ui.privacyNotice, /public exports/);

const serialized = JSON.stringify(ui);
for (const forbidden of [
  "customerName",
  "carrierName",
  "brokerName",
  "mcNumber",
  "dotNumber",
  "exactAddress",
  "bookedRate",
  "commission",
  "livePosition",
  "credential",
  "bookingEnabled",
]) {
  assert.equal(serialized.includes(forbidden), false, `UI projection must exclude ${forbidden}`);
}

assert.throws(
  () => createSyntheticWorkspaceUi({ ...workspace, publicExportEnabled: true }),
  /cannot render connected or export-enabled data/,
);
assert.throws(
  () => createSyntheticWorkspaceUi({ ...workspace, providerConnectionsEnabled: true }),
  /cannot render connected or export-enabled data/,
);

console.log("Private synthetic workspace UI contract checks passed.");
