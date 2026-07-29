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

console.log("Load operations P0 synthetic vertical-slice checks passed.");
