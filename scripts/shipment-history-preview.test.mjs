import assert from "node:assert/strict";
import { previewShipmentHistoryCsv } from "../src/lib/shipment-history-preview.ts";

const now = new Date("2026-07-31T12:00:00Z");
const safeCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  "SYN-001,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false",
  "SYN-002,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,completed,true",
  "SYN-003,Milwaukee,WI,Nashville,TN,car_hauler,2026-05-01,observed,false",
  "SYN-004,Madison,WI,Detroit,MI,unknown_trailer,2026-07-20,verified,true",
].join("\n");

const preview = previewShipmentHistoryCsv(safeCsv, now);
assert.equal(preview.mode, "preview_only");
assert.equal(preview.publicExportEnabled, false);
assert.equal(preview.rows.length, 4);
assert.equal(preview.rows[0].lifecycleStatus, "booked");
assert.equal(preview.rows[0].proposedAction, "update");
assert.deepEqual(preview.rows[0].duplicateOf, ["SYN-002"]);
assert.equal(preview.rows[1].proposedAction, "update");
assert.equal(preview.rows[2].freshness, "stale");
assert.ok(preview.rows[2].quarantineReasons.includes("stale_observed_record"));
assert.equal(preview.rows[2].proposedAction, "needs_review");
assert.ok(preview.rows[3].quarantineReasons.includes("unknown_equipment_class"));
assert.equal(preview.rows[3].proposedAction, "needs_review");

const privacyCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed,email,mc,booked_rate",
  "SYN-PII,Test,WI,Test,IL,car_hauler,2026-07-20,booked,false,private@example.com,123456,1500",
].join("\n");
const privacyPreview = previewShipmentHistoryCsv(privacyCsv, now);
assert.equal(privacyPreview.rows[0].proposedAction, "reject");
assert.deepEqual(privacyPreview.rows[0].privacyFlags.sort(), ["booked_rate", "email", "mc"]);
assert.ok(privacyPreview.rows[0].quarantineReasons.includes("prohibited_private_columns"));

const publicationCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  "SYN-PUB,Test,WI,Test,IL,car_hauler,2026-07-20,published,true",
].join("\n");
const publicationPreview = previewShipmentHistoryCsv(publicationCsv, now);
assert.equal(publicationPreview.rows[0].proposedAction, "reject");
assert.ok(publicationPreview.rows[0].quarantineReasons.includes("unsupported_publication_flag"));

const incompleteCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  ",Appleton,WI,,IL,car_hauler,not-a-date,completed,false",
].join("\n");
const incompletePreview = previewShipmentHistoryCsv(incompleteCsv, now);
assert.equal(incompletePreview.rows[0].proposedAction, "hold");
assert.ok(incompletePreview.rows[0].missingFields.includes("source_record_id"));
assert.ok(incompletePreview.rows[0].missingFields.includes("destination_city"));
assert.ok(incompletePreview.rows[0].quarantineReasons.includes("missing_provenance"));
assert.ok(incompletePreview.rows[0].quarantineReasons.includes("invalid_event_date"));
assert.ok(incompletePreview.rows[0].quarantineReasons.includes("completion_requires_review"));

console.log("Shipment History import-preview privacy, lifecycle, dedupe, freshness and quarantine checks passed.");
