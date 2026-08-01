import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  previewLifecycleTransition,
  previewOffersCsv,
  previewShipmentHistoryCsv,
} from "../src/lib/load-import-preview.ts";

const offersCsv = await readFile(new URL("../fixtures/load-operations/offers.synthetic.csv", import.meta.url), "utf8");
const historyCsv = await readFile(new URL("../fixtures/load-operations/shipment-history.synthetic.csv", import.meta.url), "utf8");
const now = new Date("2026-07-29T13:00:00Z");

const offerPreview = previewOffersCsv(offersCsv, now);
assert.equal(offerPreview.mode, "preview_only");
assert.equal(offerPreview.writePerformed, false);
assert.equal(offerPreview.summary.totalRows, 3);
assert.equal(offerPreview.summary.acceptedRows, 3);
assert.equal(offerPreview.summary.quarantinedRows, 0);
assert.equal(Object.isFrozen(offerPreview), true);
assert.equal(Object.isFrozen(offerPreview.accepted), true);

const offerLines = offersCsv.trim().split(/\r?\n/);
const duplicateOfferPreview = previewOffersCsv(`${offersCsv.trim()}\n${offerLines[1]}`, now);
assert.equal(duplicateOfferPreview.summary.totalRows, 4);
assert.equal(duplicateOfferPreview.summary.acceptedRows, 3);
assert.equal(duplicateOfferPreview.summary.quarantinedRows, 1);
assert.equal(duplicateOfferPreview.quarantined[0].reason, "duplicate_record");
assert.equal("rawRecord" in duplicateOfferPreview.quarantined[0], false);

const privateColumnPreview = previewOffersCsv(
  "offer_id,email\nSYN-PRIVATE,test@example.com",
  now,
);
assert.equal(privateColumnPreview.summary.acceptedRows, 0);
assert.equal(privateColumnPreview.summary.quarantinedRows, 1);
assert.equal(privateColumnPreview.quarantined[0].reason, "private_columns");
assert.equal(privateColumnPreview.quarantined[0].message.includes("test@example.com"), false);

const historyPreview = previewShipmentHistoryCsv(historyCsv);
assert.equal(historyPreview.mode, "preview_only");
assert.equal(historyPreview.writePerformed, false);
assert.equal(historyPreview.summary.acceptedRows, 2);
assert.equal(historyPreview.summary.quarantinedRows, 0);

const [historyHeader, historyRow] = historyCsv.trim().split(/\r?\n/);
const privateAliasCases = [
  {
    headers: "driver_phone,customer_email,carrier_mc_number,order_number,negotiated_rate_usd",
    values: "000-000-0000,synthetic@example.invalid,000000,SYN-ORDER,0",
    aliases: ["driver_phone", "customer_email", "carrier_mc_number", "order_number", "negotiated_rate_usd"],
  },
  {
    headers: "driverPhone,customerEmail,carrierMcNumber,orderNumber,negotiatedRateUsd",
    values: "000-000-0000,synthetic@example.invalid,000000,SYN-ORDER,0",
    aliases: ["driverphone", "customeremail", "carriermcnumber", "ordernumber", "negotiatedrateusd"],
  },
  {
    headers: "driverphone,customeremail,carriermcnumber,ordernumber,negotiatedrateusd",
    values: "000-000-0000,synthetic@example.invalid,000000,SYN-ORDER,0",
    aliases: ["driverphone", "customeremail", "carriermcnumber", "ordernumber", "negotiatedrateusd"],
  },
  {
    headers: "driverName,contactPerson,vehicleVin,licensePlate,taxId,companyEin",
    values: "Synthetic Driver,Synthetic Contact,SYNVIN00000000000,SYN-PLATE,SYN-TAX,SYN-EIN",
    aliases: ["drivername", "contactperson", "vehiclevin", "licenseplate", "taxid", "companyein"],
  },
];

for (const aliasCase of privateAliasCases) {
  const preview = previewShipmentHistoryCsv(`${historyHeader},${aliasCase.headers}\n${historyRow},${aliasCase.values}`);
  assert.equal(preview.mode, "preview_only");
  assert.equal(preview.writePerformed, false);
  assert.equal(preview.summary.totalRows, 1);
  assert.equal(preview.summary.acceptedRows, 0);
  assert.equal(preview.summary.quarantinedRows, 1);
  assert.equal(preview.quarantined[0].reason, "private_columns");
  for (const alias of aliasCase.aliases) assert.ok(preview.quarantined[0].message.includes(alias));
  assert.equal(preview.quarantined[0].message.includes("synthetic@example.invalid"), false);
  assert.equal(preview.quarantined[0].message.includes("Synthetic Driver"), false);
  assert.equal("rawRecord" in preview.quarantined[0], false);
}

const invalidEvidenceCsv = [
  "shipment_id,proof_status,origin_city,origin_state,destination_city,destination_state,equipment_class,pickup_date,delivery_date,booked_rate,loaded_miles,deadhead_miles,source_record_id,delivery_confirmed,bol_or_pod_confirmed,manual_operational_confirmed,cancellations_and_claims_reviewed",
  "SYN-SHIP-X,completed,Test,WI,Test,IL,car_hauler,2026-07-01,2026-07-02,1000,400,10,MOCK-X,false,false,false,false",
].join("\n");
const invalidEvidencePreview = previewShipmentHistoryCsv(invalidEvidenceCsv);
assert.equal(invalidEvidencePreview.summary.acceptedRows, 0);
assert.equal(invalidEvidencePreview.summary.quarantinedRows, 1);
assert.equal(invalidEvidencePreview.quarantined[0].reason, "invalid_lifecycle_evidence");
assert.equal(invalidEvidencePreview.quarantined[0].message.includes("SYN-SHIP-X"), false);
assert.equal(invalidEvidencePreview.quarantined[0].message.includes("MOCK-X"), false);
assert.equal(invalidEvidencePreview.quarantined[0].message.includes("[redacted-id]"), true);
assert.equal("rawRecord" in invalidEvidencePreview.quarantined[0], false);

const observedToBooked = previewLifecycleTransition("observed", "booked");
assert.equal(observedToBooked.allowed, true);
assert.equal(observedToBooked.writePerformed, false);

const skippedTransition = previewLifecycleTransition("observed", "completed");
assert.equal(skippedTransition.allowed, false);
assert.match(skippedTransition.reason, /next lifecycle state/i);

const publishWithoutApproval = previewLifecycleTransition("verified", "published");
assert.equal(publishWithoutApproval.allowed, false);
assert.equal(publishWithoutApproval.requiresPublicationApproval, true);
assert.match(publishWithoutApproval.reason, /explicit publication approval/i);

const publishWithApproval = previewLifecycleTransition("verified", "published", { publicationApproved: true });
assert.equal(publishWithApproval.allowed, true);
assert.equal(publishWithApproval.writePerformed, false);

console.log("Load import preview, private-header quarantine, identifier redaction, duplicate, and lifecycle checks passed.");
