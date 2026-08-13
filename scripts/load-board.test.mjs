import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  buildLoadBoardPayload,
  buildLoadBoardPreview,
  buildCarrierSalesLead,
  buildLogisticsSalesMailto,
  buildPostedLoadSalesLead,
  buildVehicleAvailabilityPayload,
  buildVehicleAvailabilityPreview,
  reviewLoadBoardPayload,
  reviewVehicleAvailabilityPayload,
} from "../src/lib/load-board.ts";
import {
  buildQualifiedCarrierLead,
  buildQualifiedCarrierMailto,
  buildQualifiedCarrierPayload,
  buildQualifiedCarrierPreview,
  reviewQualifiedCarrierPayload,
} from "../src/lib/carrier-qualification.ts";

const TEST_NOW = new Date();
TEST_NOW.setUTCHours(12, 0, 0, 0);

function futureDate(days) {
  const date = new Date(TEST_NOW);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const standard = new FormData();
standard.set("submitter_type", "private_party");
standard.set("contact_name", "Test Customer");
standard.set("email", "TEST@example.com");
standard.set("phone", "+1 (312) 555-0182");
standard.set("pickup_location", "Madison, WI");
standard.set("delivery_location", "Chicago, IL");
standard.set("ready_date", futureDate(14));
standard.set("commodity_type", "passenger_vehicle");
standard.set("year_make_model", "2021 Toyota Camry");
standard.set("quantity", "1");
standard.set("condition", "operable");
standard.set("consent", "on");

const payload = buildLoadBoardPayload(standard);
assert.equal(payload.email, "test@example.com");
const approved = reviewLoadBoardPayload(payload, TEST_NOW);
assert.equal(approved.decision, "approved");
assert.ok(approved.routing.includes("Dispatch Assist dry-run queue"));
const preview = buildLoadBoardPreview(payload, approved);
assert.match(preview, /Decision: approved/);
assert.match(preview, /POSTED LOAD \/ CUSTOMER/i);
assert.match(preview, /no email, CRM write, load publication, or carrier notification was sent/i);
const postedLead = buildPostedLoadSalesLead(payload, approved);
assert.match(postedLead.email_subject, /^\[HERMES SALES\] \[POSTED LOAD\] \[CUSTOMER\]/);
assert.match(buildLogisticsSalesMailto(postedLead), /^mailto:officeus@hermeslogisticsus.com\?/);

const carHauler = new FormData();
carHauler.set("carrier_role", "owner_operator");
carHauler.set("carrier_contact_name", "Test Driver");
carHauler.set("carrier_company_name", "Test Carrier LLC");
carHauler.set("authority_number", "MC 123456");
carHauler.set("carrier_email", "DRIVER@example.com");
carHauler.set("carrier_phone", "+1 (312) 555-0182");
carHauler.set("equipment_class", "car_hauler");
carHauler.set("capacity_units", "3");
carHauler.set("available_from", futureDate(16));
carHauler.set("origin_location", "Chicago, IL");
carHauler.set("origin_radius", "150");
carHauler.set("anywhere", "on");
carHauler.set("interested_load", "hlb-1042");
carHauler.set("carrier_consent", "on");
const vehiclePayload = buildVehicleAvailabilityPayload(carHauler);
assert.equal(vehiclePayload.email, "driver@example.com");
const vehicleReview = reviewVehicleAvailabilityPayload(vehiclePayload, TEST_NOW);
assert.equal(vehicleReview.decision, "dispatcher_review");
assert.equal(vehicleReview.vehicle_state, "submitted_for_review");
const vehiclePreview = buildVehicleAvailabilityPreview(vehiclePayload, vehicleReview);
assert.match(vehiclePreview, /LOAD BOARD ACCESS \/ CARRIER/i);
assert.match(vehiclePreview, /Interested load: HLB-1042/i);
assert.match(vehiclePreview, /no email, account, call, CRM write, or dispatcher assignment was created/i);
const carrierLead = buildCarrierSalesLead(vehiclePayload, vehicleReview);
assert.match(carrierLead.email_subject, /^\[HERMES SALES\] \[LOAD BOARD ACCESS\] \[CARRIER\] \[HLB-1042\]/);

const qualifiedCarrier = new FormData();
for (const [key, value] of carHauler.entries()) qualifiedCarrier.set(key, value);
qualifiedCarrier.set("authority_status", "active");
qualifiedCarrier.set("authority_age", "over_one_year");
qualifiedCarrier.set("insurance_status", "active");
qualifiedCarrier.set("fleet_size", "two_to_three");
qualifiedCarrier.set("dispatch_status", "needs_dispatcher");
const qualifiedPayload = buildQualifiedCarrierPayload(qualifiedCarrier);
assert.equal(qualifiedPayload.authority_status, "active");
assert.equal(qualifiedPayload.fleet_size, "two_to_three");
const qualifiedReview = reviewQualifiedCarrierPayload(qualifiedPayload, TEST_NOW);
assert.equal(qualifiedReview.decision, "dispatcher_review");
assert.match(qualifiedReview.required_actions.join(" "), /dispatch-service qualification/i);
const qualifiedPreview = buildQualifiedCarrierPreview(qualifiedPayload, qualifiedReview);
assert.match(qualifiedPreview, /Authority status: Active/);
assert.match(qualifiedPreview, /Insurance status: Active policy/);
assert.match(qualifiedPreview, /Fleet size: 2–3 units/);
assert.match(qualifiedPreview, /Current dispatch status: Needs dispatch service/);
const qualifiedLead = buildQualifiedCarrierLead(qualifiedPayload, qualifiedReview);
assert.match(qualifiedLead.email_subject, /\[DISPATCH SERVICE\]/);
assert.match(buildQualifiedCarrierMailto(qualifiedLead), /^mailto:officeus@hermeslogisticsus.com\?/);

qualifiedCarrier.set("authority_status", "pending");
qualifiedCarrier.set("authority_age", "under_90_days");
qualifiedCarrier.set("insurance_status", "quote_in_progress");
const readinessReview = reviewQualifiedCarrierPayload(buildQualifiedCarrierPayload(qualifiedCarrier), TEST_NOW);
assert.equal(readinessReview.decision, "readiness_review");
assert.ok(readinessReview.routing.includes("Carrier readiness review queue"));

qualifiedCarrier.set("authority_status", "active");
qualifiedCarrier.set("authority_age", "over_one_year");
qualifiedCarrier.set("insurance_status", "inactive");
const inactiveInsuranceReview = reviewQualifiedCarrierPayload(buildQualifiedCarrierPayload(qualifiedCarrier), TEST_NOW);
assert.equal(inactiveInsuranceReview.decision, "needs_more_information");
assert.match(inactiveInsuranceReview.required_actions.join(" "), /insurance/i);

carHauler.set("equipment_class", "box_truck");
const boxTruckReview = reviewVehicleAvailabilityPayload(buildVehicleAvailabilityPayload(carHauler), TEST_NOW);
assert.equal(boxTruckReview.decision, "scope_review");
assert.match(boxTruckReview.required_actions.join(" "), /dimensions/i);

const tractor = new FormData();
for (const [key, value] of standard.entries()) tractor.set(key, value);
tractor.set("submitter_type", "dealer");
tractor.set("commodity_type", "tractor");
tractor.set("condition", "inoperable_non_rolling");
const held = reviewLoadBoardPayload(buildLoadBoardPayload(tractor), TEST_NOW);
assert.equal(held.decision, "quarantine");
assert.ok(held.routing.includes("Dealer and shipper sales queue"));
assert.match(held.required_actions.join(" "), /dimensions/i);

const incomplete = new FormData();
incomplete.set("submitter_type", "broker");
const needsInfo = reviewLoadBoardPayload(buildLoadBoardPayload(incomplete), TEST_NOW);
assert.equal(needsInfo.decision, "needs_more_information");

const bot = new FormData();
for (const [key, value] of standard.entries()) bot.set(key, value);
bot.set("website", "https://spam.example");
const rejected = reviewLoadBoardPayload(buildLoadBoardPayload(bot), TEST_NOW);
assert.equal(rejected.decision, "rejected");
assert.deepEqual(rejected.routing, []);

// Search-owner contract: role/query states are conversion state only. The rendered
// page must always expose one canonical organic owner: /load-board/.
const root = new URL("../", import.meta.url).pathname;
const loadBoardHtml = await readFile(join(root, "dist/load-board/index.html"), "utf8");
assert.match(
  loadBoardHtml,
  /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/hermeslogisticsus\.com\/load-board\/["']/i,
  "Load Board must expose /load-board/ as the single canonical search owner",
);
assert.match(loadBoardHtml, /fictional demo/i, "Load Board must keep its demo boundary visible");
assert.doesNotMatch(loadBoardHtml, /live freight available now/i, "Load Board must not imply live freight availability");

console.log("Load Board unit and canonical search-owner checks passed.");
