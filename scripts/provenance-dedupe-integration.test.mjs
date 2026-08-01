import assert from "node:assert/strict";
import {
  previewOffersCsv,
  previewShipmentHistoryCsv,
} from "../src/lib/load-import-preview.ts";

const now = new Date("2026-07-29T13:00:00Z");

const offerHeader = "offer_id,source_name,source_record_id,observed_at,expires_at,pickup_date,origin_city,origin_state,destination_city,destination_state,equipment_class,posted_rate,negotiated_rate,booked_rate,loaded_miles,deadhead_miles";
const offerRows = [
  "SYN-CASE-001,Synthetic Board,SYN-SOURCE-CASE,2026-07-29T12:00:00Z,2026-07-30T18:00:00Z,2026-07-31,Chicago,IL,Nashville,TN,car_hauler,1400,,,485,35",
  "SYN-CASE-002,Synthetic Board,syn-source-case,2026-07-29T12:15:00Z,2026-07-30T18:15:00Z,2026-07-31,Chicago,IL,Nashville,TN,car_hauler,1425,,,485,28",
];
const offerPreview = previewOffersCsv([offerHeader, ...offerRows].join("\n"), now);
assert.equal(offerPreview.mode, "preview_only");
assert.equal(offerPreview.writePerformed, false);
assert.equal(offerPreview.summary.totalRows, 2);
assert.equal(offerPreview.summary.acceptedRows, 1);
assert.equal(offerPreview.summary.quarantinedRows, 1);
assert.equal(offerPreview.quarantined[0].reason, "duplicate_record");
assert.equal("rawRecord" in offerPreview.quarantined[0], false);

const historyHeader = "shipment_id,proof_status,origin_city,origin_state,destination_city,destination_state,equipment_class,pickup_date,delivery_date,booked_rate,loaded_miles,deadhead_miles,source_record_id,delivery_confirmed,bol_or_pod_confirmed,manual_operational_confirmed,cancellations_and_claims_reviewed";
const historyRows = [
  "SYN-HISTORY-CASE,completed,Appleton,WI,Milwaukee,WI,car_hauler,2026-07-10,2026-07-10,650,106,18,SYN-HISTORY-SOURCE,true,true,false,true",
  " syn-history-case ,completed,Appleton,WI,Milwaukee,WI,car_hauler,2026-07-10,2026-07-10,650,106,18,SYN-HISTORY-SOURCE-2,true,true,false,true",
];
const historyPreview = previewShipmentHistoryCsv([historyHeader, ...historyRows].join("\n"));
assert.equal(historyPreview.mode, "preview_only");
assert.equal(historyPreview.writePerformed, false);
assert.equal(historyPreview.summary.totalRows, 2);
assert.equal(historyPreview.summary.acceptedRows, 1);
assert.equal(historyPreview.summary.quarantinedRows, 1);
assert.equal(historyPreview.quarantined[0].reason, "duplicate_record");
assert.equal("rawRecord" in historyPreview.quarantined[0], false);

assert.equal(offerPreview.quarantined[0].message.includes("SYN-SOURCE-CASE"), false);
assert.equal(historyPreview.quarantined[0].message.includes("SYN-HISTORY-CASE"), false);

console.log("Normalized provenance identities are enforced by preview dedupe without exposing raw identifiers.");
