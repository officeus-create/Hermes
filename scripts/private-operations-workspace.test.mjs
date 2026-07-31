import assert from "node:assert/strict";
import { buildPrivateOperationsWorkspace } from "../src/lib/private-operations-workspace.ts";
import { previewShipmentHistoryCsv } from "../src/lib/shipment-history-preview.ts";

const csv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  "SYN-UI-001,Chicago,IL,Nashville,TN,car_hauler,2026-07-30,observed,false",
  "SYN-UI-002,Chicago,IL,Nashville,TN,car_hauler,2026-07-30,observed,false",
  "SYN-UI-003,Milwaukee,WI,Detroit,MI,hotshot,2026-07-28,verified,true",
].join("\n");

const preview = previewShipmentHistoryCsv(csv, new Date("2026-07-31T12:00:00Z"));
const dispatcher = buildPrivateOperationsWorkspace(preview, "dispatcher");
const carrier = buildPrivateOperationsWorkspace(preview, "carrier");

assert.equal(dispatcher.mode, "private_read_only_synthetic");
assert.equal(dispatcher.publicExportEnabled, false);
assert.equal(dispatcher.externalActionsEnabled, false);
assert.equal(dispatcher.rows.length, 3);
assert.equal(dispatcher.summary.duplicates, 2);
assert.equal(Object.isFrozen(dispatcher), true);
assert.equal(Object.isFrozen(dispatcher.rows), true);
assert.equal(Object.isFrozen(dispatcher.rows[0]), true);

const serializedDispatcher = JSON.stringify(dispatcher);
for (const forbidden of [
  "postedRate", "negotiatedRate", "bookedRate", "commission", "company", "carrierName", "brokerName",
  "customerName", "mc", "dot", "address", "invoice", "bol", "pod", "phone", "email", "livePosition", "credential",
]) {
  assert.equal(serializedDispatcher.includes(forbidden), false, `Workspace must not expose ${forbidden}`);
}

assert.equal(carrier.rows.every((row) => row.quarantineReasons.every((reason) => reason === "internal_review_required")), true);
assert.equal(JSON.stringify(carrier).includes("duplicate_candidate"), false, "Carrier view must hide internal quarantine detail");

const filtered = buildPrivateOperationsWorkspace(preview, "dispatcher", {
  status: "verified",
  equipmentClass: "hotshot",
  origin: "Milwaukee",
  freshness: "fresh",
});
assert.equal(filtered.rows.length, 1);
assert.equal(filtered.rows[0].recordRef, "SYN-UI-003");
assert.equal(filtered.rows[0].lifecycleStatus, "verified");

const missingFieldsCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  "SYN-UI-HOLD,,IL,Nashville,TN,car_hauler,2026-07-30,observed,false",
].join("\n");
const incompletePreview = previewShipmentHistoryCsv(missingFieldsCsv, new Date("2026-07-31T12:00:00Z"));
const incompleteWorkspace = buildPrivateOperationsWorkspace(incompletePreview, "dispatcher");
assert.equal(incompleteWorkspace.rows.length, 0, "Rows lacking the approved city/state boundary must not enter the UI");

console.log("Private synthetic operations workspace checks passed.");
