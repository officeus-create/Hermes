import assert from "node:assert/strict";
import { previewActiveOffersCsv } from "../src/lib/active-offer-preview.ts";

const csv = [
  "offer_id,source_name,source_record_id,observed_at,expires_at,pickup_date,origin_city,origin_state,destination_city,destination_state,equipment_class,posted_rate,negotiated_rate,booked_rate,loaded_miles,deadhead_miles",
  "SYN-FRESH,synthetic,SRC-FRESH,2026-08-01T12:00:00Z,2026-08-01T20:00:00Z,2026-08-02,Test,WI,Test,IL,car_hauler,1000,,,400,10",
  "SYN-STALE,synthetic,SRC-STALE,2026-07-31T12:00:00Z,2026-08-01T12:30:00Z,2026-08-02,Test,WI,Test,IL,car_hauler,999,,,400,10",
].join("\n");

const preview = previewActiveOffersCsv(csv, new Date("2026-08-01T13:00:00Z"));

assert.equal(preview.mode, "preview_only");
assert.equal(preview.writePerformed, false);
assert.equal(preview.publicExportEnabled, false);
assert.equal(preview.summary.totalRows, 2);
assert.equal(preview.summary.acceptedRows, 1);
assert.equal(preview.summary.quarantinedRows, 1);
assert.equal(preview.accepted[0].offerId, "SYN-FRESH");
assert.equal(preview.quarantined[0].rowNumber, 3);
assert.equal(preview.quarantined[0].reason, "stale_observation");
assert.match(preview.quarantined[0].message, /not a confirmed route or public capacity fact/i);
assert.equal(preview.quarantined[0].message.includes("SYN-STALE"), false);
assert.equal(preview.quarantined[0].message.includes("SRC-STALE"), false);
assert.equal(preview.quarantined[0].message.includes("999"), false);
assert.equal("rawRecord" in preview.quarantined[0], false);
assert.equal(Object.isFrozen(preview), true);
assert.equal(Object.isFrozen(preview.accepted), true);
assert.equal(Object.isFrozen(preview.quarantined), true);

const quotedCsv = [
  "offer_id,source_name,source_record_id,observed_at,expires_at,pickup_date,origin_city,origin_state,destination_city,destination_state,equipment_class,posted_rate,negotiated_rate,booked_rate,loaded_miles,deadhead_miles",
  '" SYN-QUOTED ",synthetic,SRC-QUOTED,2026-07-31T12:00:00Z,2026-08-01T12:30:00Z,2026-08-02,"Test, City",WI,Test,IL,car_hauler,998,,,400,10',
].join("\n");
const quotedPreview = previewActiveOffersCsv(quotedCsv, new Date("2026-08-01T13:00:00Z"));
assert.equal(quotedPreview.summary.acceptedRows, 0);
assert.equal(quotedPreview.summary.quarantinedRows, 1);
assert.equal(quotedPreview.quarantined[0].rowNumber, 2);
assert.equal(quotedPreview.quarantined[0].message.includes("SYN-QUOTED"), false);
assert.equal(quotedPreview.quarantined[0].message.includes("998"), false);

console.log("Strict active-offer preview quarantines stale private observations with source-row provenance and no identifiers or rates.");
