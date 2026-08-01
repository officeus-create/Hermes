import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { importShipmentHistoryCsv } from "../src/lib/load-operations.ts";
import { reviewShipmentLifecycleConflicts } from "../src/lib/shipment-history-conflicts.ts";

const historyCsv = await readFile(new URL("../fixtures/load-operations/shipment-history.synthetic.csv", import.meta.url), "utf8");
const records = importShipmentHistoryCsv(historyCsv);

const sameStatusDuplicate = {
  ...records[0],
  shipmentId: "SYN-SHIP-SAME-STATUS",
  sourceRecordId: "MOCK-HISTORY-SAME-STATUS",
};
const noConflictReview = reviewShipmentLifecycleConflicts([...records, sameStatusDuplicate]);
assert.equal(noConflictReview.mode, "preview_only");
assert.equal(noConflictReview.writePerformed, false);
assert.equal(noConflictReview.publicExportEnabled, false);
assert.equal(noConflictReview.rawRecordsDeleted, false);
assert.equal(noConflictReview.summary.conflictGroups, 0);
assert.equal(noConflictReview.summary.recordsNeedingReview, 0);

const conflictingStatusDuplicate = {
  ...records[0],
  shipmentId: "SYN-SHIP-CONFLICT",
  sourceRecordId: "MOCK-HISTORY-CONFLICT",
  proofStatus: "verified",
};
const conflictReview = reviewShipmentLifecycleConflicts([...records, conflictingStatusDuplicate]);
assert.equal(conflictReview.mode, "preview_only");
assert.equal(conflictReview.writePerformed, false);
assert.equal(conflictReview.publicExportEnabled, false);
assert.equal(conflictReview.rawRecordsDeleted, false);
assert.equal(conflictReview.summary.reviewedRecords, 3);
assert.equal(conflictReview.summary.conflictGroups, 1);
assert.equal(conflictReview.summary.recordsNeedingReview, 2);
assert.equal(conflictReview.conflictGroups[0].reason, "conflicting_lifecycle_status");
assert.equal(conflictReview.conflictGroups[0].proposedAction, "needs_review");
assert.deepEqual(conflictReview.conflictGroups[0].recordIndexes, [0, 2]);
assert.deepEqual(conflictReview.conflictGroups[0].statuses, ["completed", "verified"]);
assert.equal(Object.isFrozen(conflictReview), true);
assert.equal(Object.isFrozen(conflictReview.conflictGroups), true);

const serializedReview = JSON.stringify(conflictReview);
for (const prohibitedValue of [
  conflictingStatusDuplicate.shipmentId,
  conflictingStatusDuplicate.sourceRecordId,
  String(conflictingStatusDuplicate.bookedRate),
]) {
  assert.equal(serializedReview.includes(prohibitedValue), false);
}

console.log("Shipment History lifecycle conflict review checks passed.");
