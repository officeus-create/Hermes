import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PUBLIC_ROUTE_EXPORT_ENABLED,
  buildCanonicalOpportunities,
  buildPublicRouteExport,
  calculateRateMetrics,
  createReadOnlyFeed,
  importOffersCsv,
  importShipmentHistoryCsv,
  previewOffersCsvImport,
  prepareManualBookingHandoff,
} from "../src/lib/load-operations.ts";

const offersCsv = await readFile(new URL("../fixtures/load-operations/offers.synthetic.csv", import.meta.url), "utf8");
const historyCsv = await readFile(new URL("../fixtures/load-operations/shipment-history.synthetic.csv", import.meta.url), "utf8");
const now = new Date("2026-07-29T13:00:00Z");

const offers = importOffersCsv(offersCsv, now);
const history = importShipmentHistoryCsv(historyCsv);
assert.equal(offers.length, 3);
assert.equal(history.length, 2);
assert.equal(history.every((record) => record.deliveryConfirmed), true);
assert.equal(history.every((record) => record.bolOrPodConfirmed || record.manualOperationalConfirmed), true);
assert.equal(history.every((record) => record.cancellationsAndClaimsReviewed), true);
assert.equal(offers.filter((offer) => offer.freshness === "fresh").length, 2);
assert.equal(offers.filter((offer) => offer.freshness === "expired").length, 1);

const opportunities = buildCanonicalOpportunities(offers);
assert.equal(opportunities.length, 2);
const chicagoNashville = opportunities.find((opportunity) => opportunity.origin === "Chicago, IL");
assert.ok(chicagoNashville);
assert.equal(chicagoNashville.sourceRecords.length, 2, "Deduplication must retain every source record");
assert.equal(chicagoNashville.freshness, "fresh");

const negotiatedMetrics = calculateRateMetrics(chicagoNashville.sourceRecords.find((offer) => offer.negotiatedRate === 1450));
assert.deepEqual(negotiatedMetrics, {
  gross: 1450,
  rateBasis: "negotiated",
  loadedMiles: 485,
  deadheadMiles: 35,
  totalMiles: 520,
  loadedRpm: 2.99,
  totalMileRpm: 2.79,
  deadheadPercent: 6.73,
});

const dispatcherFeed = createReadOnlyFeed(opportunities, "dispatcher");
const carrierFeed = createReadOnlyFeed(opportunities, "carrier");
assert.equal(dispatcherFeed.length, 1, "Expired opportunities must be excluded from the active feed");
assert.equal(carrierFeed.length, 1);
assert.equal(Object.isFrozen(dispatcherFeed), true);
assert.equal(Object.isFrozen(carrierFeed), true);
assert.equal("sourceRecords" in carrierFeed[0], false, "Carrier view must not expose raw source records");
assert.equal("negotiatedRate" in carrierFeed[0], false, "Carrier view must not expose negotiated rates");
assert.equal("bookedRate" in carrierFeed[0], false, "Carrier view must not expose booked rates");

const handoff = prepareManualBookingHandoff(chicagoNashville);
assert.equal(handoff.status, "requires_manual_review");
assert.equal(handoff.externalActionPerformed, false);

assert.equal(PUBLIC_ROUTE_EXPORT_ENABLED, false);
assert.deepEqual(buildPublicRouteExport(history), [], "Completed or verified history must not become public");

assert.throws(
  () => importOffersCsv("offer_id,email\nSYN-1,test@example.com", now),
  /Private columns are not allowed/,
);
assert.throws(
  () => importShipmentHistoryCsv(
    "shipment_id,proof_status,origin_city,origin_state,destination_city,destination_state,equipment_class,pickup_date,delivery_date,booked_rate,loaded_miles,deadhead_miles,source_record_id,delivery_confirmed,bol_or_pod_confirmed,manual_operational_confirmed,cancellations_and_claims_reviewed\n"
    + "SYN-SHIP-X,completed,Test,WI,Test,IL,car_hauler,2026-07-01,2026-07-02,1,1,0,MOCK-X,false,false,false,false",
  ),
  /cannot be completed without delivery evidence/,
);

const preview = previewOffersCsvImport(offersCsv, now);
assert.deepEqual(preview.summary, {
  accepted: 1,
  duplicate_candidate: 1,
  expired: 1,
  rejected: 0,
  needs_review: 0,
});
assert.equal(preview.mode, "synthetic_preview");
assert.equal(preview.externalWritePerformed, false);
assert.equal(preview.publicExportEnabled, false);
assert.equal(preview.acceptedOffers.length, 1);
assert.deepEqual(preview.quarantine, [
  { rowNumber: 3, status: "duplicate_candidate", reasons: ["DUPLICATE_CANONICAL_OPPORTUNITY"] },
  { rowNumber: 4, status: "expired", reasons: ["OFFER_EXPIRED"] },
]);
assert.equal(JSON.stringify(preview.quarantine).includes("Chicago"), false, "Quarantine must not retain row content");

const offerHeader = offersCsv.split("\n")[0];
assert.throws(
  () => previewOffersCsvImport("", now),
  /Invalid CSV schema/,
);
assert.throws(
  () => previewOffersCsvImport(`${offerHeader.replace(",deadhead_miles", "")}\nSYN-OFFER-X,Mock Board,MOCK-X,2026-07-29T12:00:00Z,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,1,,,1`, now),
  /Invalid CSV schema/,
);
assert.throws(
  () => previewOffersCsvImport(`${offerHeader},phone\nSYN-OFFER-X,Mock Board,MOCK-X,2026-07-29T12:00:00Z,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,1,,,1,0,5551234567`, now),
  /Private columns are not allowed/,
);
assert.throws(
  () => previewOffersCsvImport(`${offerHeader}\nREAL-123,Live Board,12345,2026-07-29T12:00:00Z,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,1,,,1,0`, now),
  /Only synthetic or cleaned mock identifiers/,
);

const rejectedPreview = previewOffersCsvImport(
  `${offerHeader}\nSYN-BAD-1,Mock Board,MOCK-BAD-1,not-a-date,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,not-a-rate,,,1,0`,
  now,
);
assert.deepEqual(rejectedPreview.summary, { accepted: 0, duplicate_candidate: 0, expired: 0, rejected: 1, needs_review: 0 });
assert.deepEqual(rejectedPreview.quarantine[0], { rowNumber: 2, status: "rejected", reasons: ["INVALID_ROW_VALUE"] });

const reviewPreview = previewOffersCsvImport(
  `${offerHeader}\nSYN-REVIEW-1,Mock Board,MOCK-REVIEW-1,2026-07-31T12:00:00Z,2026-07-30T12:00:00Z,2026-07-31,A,WI,B,IL,car_hauler,100,,,50,0`,
  now,
);
assert.deepEqual(reviewPreview.summary, { accepted: 0, duplicate_candidate: 0, expired: 0, rejected: 0, needs_review: 1 });
assert.deepEqual(reviewPreview.quarantine[0].reasons, ["OBSERVED_AFTER_EXPIRY", "OBSERVED_IN_FUTURE"]);

const happyPreview = previewOffersCsvImport(
  `${offerHeader}\nSYN-HAPPY-1,Synthetic Source,MOCK-HAPPY-1,2026-07-29T12:00:00Z,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,100,,,50,0`,
  now,
);
assert.deepEqual(happyPreview.summary, { accepted: 1, duplicate_candidate: 0, expired: 0, rejected: 0, needs_review: 0 });
assert.equal(happyPreview.quarantine.length, 0);

const cleanedPreview = previewOffersCsvImport(
  `${offerHeader}\nCLEAN-HAPPY-1,Cleaned Export,CLEAN-RECORD-1,2026-07-29T12:00:00Z,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,100,,,50,0`,
  now,
);
assert.equal(cleanedPreview.summary.accepted, 1);

assert.throws(
  () => previewOffersCsvImport(`${offerHeader},paid\nSYN-PAID-1,Mock Board,MOCK-PAID-1,2026-07-29T12:00:00Z,2026-07-30T12:00:00Z,2026-07-30,A,WI,B,IL,car_hauler,100,,,50,0,true`, now),
  /Private columns are not allowed/,
);

console.log("Load operations P0 synthetic vertical-slice checks passed.");
