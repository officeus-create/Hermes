import assert from "node:assert/strict";
import { previewShipmentHistoryCsvWithProvenanceGuard } from "../src/lib/shipment-history-provenance.ts";

const now = new Date("2026-07-31T12:00:00Z");
const csv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  "SYN-REPEAT,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false",
  "SYN-REPEAT,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false",
  "SYN-UNIQUE,Milwaukee,WI,Detroit,MI,car_hauler,2026-07-24,booked,false",
].join("\n");

const preview = previewShipmentHistoryCsvWithProvenanceGuard(csv, now);

assert.equal(preview.mode, "preview_only");
assert.equal(preview.publicExportEnabled, false);
assert.equal(preview.rows.length, 3);
assert.equal(preview.summary.total, 3);
assert.equal(preview.summary.accepted, 1);
assert.equal(preview.summary.needsReview, 2);
assert.equal(preview.summary.quarantined, 2);

const repeated = preview.rows.filter((row) => row.sourceRecordId === "SYN-REPEAT");
assert.equal(repeated.length, 2);
assert.ok(repeated.every((row) => row.proposedAction === "needs_review"));
assert.ok(repeated.every((row) => row.quarantineReasons.includes("duplicate_source_record_id")));
assert.equal(preview.rows.find((row) => row.sourceRecordId === "SYN-UNIQUE")?.proposedAction, "accept");

const privacyCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed,email",
  "SYN-PRIVATE,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false,private@example.com",
  "SYN-PRIVATE,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false,private@example.com",
].join("\n");
const privacyPreview = previewShipmentHistoryCsvWithProvenanceGuard(privacyCsv, now);
assert.ok(privacyPreview.rows.every((row) => row.proposedAction === "reject"));
assert.ok(privacyPreview.rows.every((row) => row.quarantineReasons.includes("duplicate_source_record_id")));
assert.ok(privacyPreview.rows.every((row) => row.quarantineReasons.includes("prohibited_private_data")));

console.log("Shipment History repeated-provenance quarantine checks passed.");
