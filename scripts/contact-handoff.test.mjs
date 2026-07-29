import assert from "node:assert/strict";
import {
  buildContactPayload,
  buildRequestSummary,
  contactHandoffRoutes,
  getContactHandoffRoute,
  isEmailOnlyRoute,
  sanitizeContactField,
} from "../src/lib/contact.ts";

const logisticsForm = new FormData();
logisticsForm.set("name", "Test User");
logisticsForm.set("email", "test@example.com");
logisticsForm.set("path", "Hermes Logistics");
logisticsForm.set("message", "I would like to discuss a logistics workflow.");
logisticsForm.set("consent", "on");
logisticsForm.set("phone", "+1 (312) 555-0182");
logisticsForm.set("mc_dot", "MC 12345 / DOT 88888");
logisticsForm.set("equipment_type", "Dry Van");
logisticsForm.set("fleet_size", "5");
logisticsForm.set("preferred_lanes", "Midwest to Northeast");
logisticsForm.set("service_needed", "Dispatch + document coordination.");

const logisticsPayload = buildContactPayload(logisticsForm, "/", "test-request-id");
assert.equal(logisticsPayload.name, "Test User");
assert.equal(logisticsPayload.interest, "Hermes Logistics");
assert.equal(logisticsPayload.request_id, "test-request-id");
assert.ok(logisticsPayload.direction_fields, "missing logistics direction_fields");

const logisticsSummary = buildRequestSummary(logisticsPayload);
assert.match(logisticsSummary, /Hermes Contact Request \(Preview\)/);
assert.match(logisticsSummary, /Direction: Hermes Logistics/);
assert.match(logisticsSummary, /Name: Test User/);
assert.match(logisticsSummary, /Email: test@example.com/);
assert.match(logisticsSummary, /I would like to discuss a logistics workflow\./);
assert.match(logisticsSummary, /Submitted from: \//);
assert.match(logisticsSummary, /Request ID: test-request-id/);
assert.match(logisticsSummary, /Phone: \+1/);
assert.match(logisticsSummary, /MC\/DOT: MC 12345 \/ DOT 88888/);
assert.match(logisticsSummary, /Equipment type: Dry Van/);
assert.match(logisticsSummary, /Fleet size: 5/);
assert.match(logisticsSummary, /Preferred lanes\/area: Midwest to Northeast/);
assert.match(logisticsSummary, /Service needed: Dispatch \+ document coordination\./);
assert.doesNotMatch(logisticsSummary, /<script/i);

const sanitized = sanitizeContactField("  hello\u0007world  ", 20);
assert.equal(sanitized, "helloworld");

const logisticsRoute = getContactHandoffRoute("Hermes Logistics");
assert.ok(logisticsRoute);
assert.match(logisticsRoute.href, /^tel:/);

const marketingRoute = getContactHandoffRoute("ProgressoPro");
assert.ok(marketingRoute);
assert.ok(isEmailOnlyRoute(marketingRoute));
assert.match(marketingRoute.href, /^mailto:officeus@hermeslogisticsus.com/);

// Marketing direction fields include multiple platforms + planning horizon.
const marketingForm = new FormData();
marketingForm.set("name", "Marketing Lead");
marketingForm.set("email", "lead@example.com");
marketingForm.set("path", "ProgressoPro");
marketingForm.set("message", "We need a clearer growth system for our service business.");
marketingForm.set("consent", "on");
marketingForm.append("platforms", "Google");
marketingForm.append("platforms", "YouTube");
marketingForm.set("planning_horizon", "6 months");
marketingForm.set("primary_goal", "<script>alert(1)</script>");
marketingForm.set("target_audience", "Service businesses");
marketingForm.set("current_channels_results", "LinkedIn experiments currently only");
marketingForm.set("monthly_budget_range", "$2k-$5k");
marketingForm.set("phone", "+1 (should-be-ignored)"); // must not be exposed on non-logistics

const marketingPayload = buildContactPayload(marketingForm, "/paths/marketing/", "mkt-request-id");
assert.equal(marketingPayload.interest, "ProgressoPro");
assert.equal(marketingPayload.direction_fields?.direction, "ProgressoPro");

const marketingSummary = buildRequestSummary(marketingPayload);
assert.match(marketingSummary, /Platforms: Google, YouTube/);
assert.match(marketingSummary, /Planning horizon: 6 months/);
assert.match(marketingSummary, /Primary goal:/);
assert.doesNotMatch(marketingSummary, /Phone:/);
assert.doesNotMatch(marketingSummary, /<script/i);
assert.doesNotMatch(marketingSummary, /</);

for (const category of ["ProgressoPro", "Hermes Business Academy", "IT Development"]) {
  const route = getContactHandoffRoute(category);
  assert.ok(route, `missing route for ${category}`);
  assert.ok(isEmailOnlyRoute(route), `${category} must be email-only`);
}

assert.equal(contactHandoffRoutes.length, 4);

console.log("Contact handoff unit checks passed.");
