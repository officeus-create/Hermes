import assert from "node:assert/strict";
import { createSyntheticLaneWorkspace } from "../src/lib/synthetic-lane-workspace.ts";

const syntheticLane = Object.freeze({
  laneId: "SYN-LANE-01",
  originRegion: "Synthetic North",
  destinationRegion: "Synthetic South",
  equipmentClass: "car_hauler",
  periodStart: "2026-06-01",
  periodEnd: "2026-06-30",
  completedShipmentCount: 3,
  medianLoadedMiles: 500,
  medianDeadheadMiles: 20,
  publicationStatus: "research_only",
  provenance: Object.freeze({
    sourceType: "synthetic",
    sourceDate: "2026-07-01",
    reviewDate: "2026-07-02",
  }),
});

const nonSyntheticLane = Object.freeze({
  ...syntheticLane,
  laneId: "SANITIZED-LANE-01",
  provenance: Object.freeze({
    sourceType: "owner_approved_sanitized_export",
    sourceDate: "2026-07-01",
    reviewDate: "2026-07-02",
  }),
});

const privateFieldRecord = Object.freeze({
  ...syntheticLane,
  laneId: "SYN-PRIVATE-01",
  carrier_name: "Forbidden synthetic placeholder",
});

const dispatcherView = createSyntheticLaneWorkspace({
  role: "dispatcher",
  records: [syntheticLane, nonSyntheticLane, privateFieldRecord],
});

assert.equal(dispatcherView.surface, "private_synthetic_workspace");
assert.equal(dispatcherView.mode, "read_only");
assert.equal(dispatcherView.datasetClass, "synthetic");
assert.equal(dispatcherView.externalActionPerformed, false);
assert.equal(dispatcherView.writeEnabled, false);
assert.equal(dispatcherView.bookingEnabled, false);
assert.equal(dispatcherView.providerConnectionsEnabled, false);
assert.equal(dispatcherView.publicExportEnabled, false);
assert.equal(dispatcherView.rows.length, 1);
assert.equal(dispatcherView.rows[0].laneId, "SYN-LANE-01");
assert.equal(dispatcherView.rejectedRecordCount, 2);
assert.equal("carrier_name" in dispatcherView.rows[0], false);
assert.equal(Object.isFrozen(dispatcherView), true);
assert.equal(Object.isFrozen(dispatcherView.rows), true);
assert.equal(Object.isFrozen(dispatcherView.rows[0]), true);

const carrierView = createSyntheticLaneWorkspace({
  role: "carrier",
  records: [syntheticLane],
  carrierLaneScope: ["  syn-lane-01  "],
});
assert.equal(carrierView.rows.length, 1);
assert.equal(carrierView.rows[0].laneId, "SYN-LANE-01");

const outOfScopeCarrierView = createSyntheticLaneWorkspace({
  role: "carrier",
  records: [syntheticLane],
  carrierLaneScope: ["SYN-LANE-OTHER"],
});
assert.equal(outOfScopeCarrierView.rows.length, 0);
assert.equal(outOfScopeCarrierView.publicExportEnabled, false);

console.log("Private synthetic dispatcher/carrier workspace checks passed.");
