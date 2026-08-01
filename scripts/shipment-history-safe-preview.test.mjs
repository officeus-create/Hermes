import assert from "node:assert/strict";
import { previewSafeShipmentHistoryCsv } from "../src/lib/shipment-history-safe-preview.ts";

const now = new Date("2026-07-31T12:00:00Z");
const compoundPrivateCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed,driver_phone,customer_email,carrier_mc_number,order_number,negotiated_rate_usd",
  "SYN-PRIVATE-ALIAS,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false,000-000-0000,synthetic@example.invalid,000000,SYN-ORDER,0",
].join("\n");

const preview = previewSafeShipmentHistoryCsv(compoundPrivateCsv, now);
assert.equal(preview.mode, "preview_only");
assert.equal(preview.publicExportEnabled, false);
assert.equal(preview.rows.length, 1);
assert.equal(preview.rows[0].proposedAction, "reject");
assert.ok(preview.rows[0].quarantineReasons.includes("prohibited_private_data"));
assert.deepEqual(
  preview.rows[0].privacyFlags.sort(),
  ["carrier_mc_number", "customer_email", "driver_phone", "negotiated_rate_usd", "order_number"],
);
assert.equal(preview.summary.rejected, 1);
assert.equal(preview.summary.quarantined, 1);

const camelCasePrivateCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed,driverPhone,customerEmail,carrierMcNumber,orderNumber,negotiatedRateUsd",
  "SYN-CAMEL-PRIVATE,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false,000-000-0000,synthetic@example.invalid,000000,SYN-ORDER,0",
].join("\n");

const camelCasePreview = previewSafeShipmentHistoryCsv(camelCasePrivateCsv, now);
assert.equal(camelCasePreview.mode, "preview_only");
assert.equal(camelCasePreview.publicExportEnabled, false);
assert.equal(camelCasePreview.rows.length, 1);
assert.equal(camelCasePreview.rows[0].proposedAction, "reject");
assert.ok(camelCasePreview.rows[0].quarantineReasons.includes("prohibited_private_data"));
assert.deepEqual(
  camelCasePreview.rows[0].privacyFlags.sort(),
  ["carriermcnumber", "customeremail", "driverphone", "negotiatedrateusd", "ordernumber"],
);
assert.equal(camelCasePreview.summary.rejected, 1);
assert.equal(camelCasePreview.summary.quarantined, 1);

const approvedCsv = [
  "source_record_id,origin_city,origin_state,destination_city,destination_state,equipment_class,event_date,lifecycle_status,reviewed",
  "SYN-SAFE,Appleton,WI,Chicago,IL,car_hauler,2026-07-25,booked,false",
].join("\n");
const approvedPreview = previewSafeShipmentHistoryCsv(approvedCsv, now);
assert.equal(approvedPreview.rows[0].proposedAction, "accept");
assert.deepEqual(approvedPreview.rows[0].privacyFlags, []);

console.log("Shipment History compound and camelCase private-header quarantine checks passed.");
