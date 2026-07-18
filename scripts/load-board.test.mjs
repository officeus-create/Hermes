import assert from "node:assert/strict";
import { buildLoadBoardPayload, buildLoadBoardPreview, reviewLoadBoardPayload } from "../src/lib/load-board.ts";

const standard = new FormData();
standard.set("submitter_type", "private_party");
standard.set("contact_name", "Test Customer");
standard.set("email", "TEST@example.com");
standard.set("pickup_location", "Madison, WI");
standard.set("delivery_location", "Chicago, IL");
standard.set("ready_date", "2026-08-01");
standard.set("commodity_type", "passenger_vehicle");
standard.set("year_make_model", "2021 Toyota Camry");
standard.set("quantity", "1");
standard.set("condition", "operable");
standard.set("consent", "on");

const payload = buildLoadBoardPayload(standard);
assert.equal(payload.email, "test@example.com");
const approved = reviewLoadBoardPayload(payload, new Date("2026-07-18T00:00:00Z"));
assert.equal(approved.decision, "approved");
assert.ok(approved.routing.includes("Dispatch Assist dry-run queue"));
const preview = buildLoadBoardPreview(payload, approved);
assert.match(preview, /Decision: approved/);
assert.match(preview, /no email, CRM write, or carrier notification was sent/i);

const tractor = new FormData();
for (const [key, value] of standard.entries()) tractor.set(key, value);
tractor.set("submitter_type", "dealer");
tractor.set("commodity_type", "tractor");
tractor.set("condition", "inoperable_non_rolling");
const held = reviewLoadBoardPayload(buildLoadBoardPayload(tractor), new Date("2026-07-18T00:00:00Z"));
assert.equal(held.decision, "quarantine");
assert.ok(held.routing.includes("Dealer and shipper sales queue"));
assert.match(held.required_actions.join(" "), /dimensions/i);

const incomplete = new FormData();
incomplete.set("submitter_type", "broker");
const needsInfo = reviewLoadBoardPayload(buildLoadBoardPayload(incomplete), new Date("2026-07-18T00:00:00Z"));
assert.equal(needsInfo.decision, "needs_more_information");

const bot = new FormData();
for (const [key, value] of standard.entries()) bot.set(key, value);
bot.set("website", "https://spam.example");
const rejected = reviewLoadBoardPayload(buildLoadBoardPayload(bot), new Date("2026-07-18T00:00:00Z"));
assert.equal(rejected.decision, "rejected");
assert.deepEqual(rejected.routing, []);

console.log("Load Board unit checks passed.");

