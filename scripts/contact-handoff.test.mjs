import assert from "node:assert/strict";
import {
  buildAttributedSourcePath,
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

const attributedPath = buildAttributedSourcePath(
  "/academy/apply/",
  "?utm_source=london&utm_medium=organic&utm_campaign=london-academy&utm_content=carrier-sales-training&service=academy&track=carrier-sales-training&program=us-logistics-operations&language=ru&email=private@example.com&ref=secret",
);
assert.equal(
  attributedPath,
  "/academy/apply/?utm_source=london&utm_medium=organic&utm_campaign=london-academy&utm_content=carrier-sales-training&service=academy&track=carrier-sales-training&program=us-logistics-operations&language=ru",
);
assert.doesNotMatch(attributedPath, /private@example|ref=|secret/);

const logisticsRoute = getContactHandoffRoute("Hermes Logistics");
assert.ok(logisticsRoute);
assert.match(logisticsRoute.href, /^tel:/);

const marketingRoute = getContactHandoffRoute("ProgressoPro");
assert.ok(marketingRoute);
assert.ok(isEmailOnlyRoute(marketingRoute));
assert.match(marketingRoute.href, /^mailto:officeus@hermeslogisticsus.com/);

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
marketingForm.set("phone", "+1 (should-be-ignored)");

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

const academyForm = new FormData();
academyForm.set("name", "Academy Applicant");
academyForm.set("email", "academy@example.com");
academyForm.set("path", "Hermes Business Academy");
academyForm.set("message", "I want structured training for the U.S. logistics market.");
academyForm.set("consent", "on");
academyForm.set("academy_program", "us-logistics-operations");
academyForm.set("academy_country_city", "London, United Kingdom");
academyForm.set("academy_languages_levels", "Ukrainian C2, English B2");
academyForm.set("academy_english_level", "B2");
academyForm.set("academy_recent_experience", "Customer communication and operations practice.");
academyForm.set("academy_objective", "Career development");
academyForm.set("academy_us_timezone_availability", "Available 14:00-22:00 London time");
academyForm.set("academy_preferred_contact_route", "Email");
academyForm.set("hermes_attribution_utm_source", "london");
academyForm.set("hermes_attribution_utm_campaign", "london-academy");
academyForm.set("hermes_attribution_utm_content", "carrier-sales-training");
academyForm.set("hermes_attribution_service", "academy");
academyForm.set("hermes_attribution_track", "carrier-sales-training");
academyForm.set("hermes_attribution_program", "us-logistics-operations");
academyForm.set("hermes_attribution_language", "ru");
academyForm.set("hermes_attribution_email", "must-not-pass@example.com");

const academyPayload = buildContactPayload(academyForm, "/academy/apply/", "academy-request-id");
assert.equal(academyPayload.interest, "Hermes Business Academy");
assert.equal(
  academyPayload.source_path,
  "/academy/apply/?utm_source=london&utm_campaign=london-academy&utm_content=carrier-sales-training&service=academy&track=carrier-sales-training&program=us-logistics-operations&language=ru",
);
assert.doesNotMatch(academyPayload.source_path, /email|must-not-pass/);
assert.match(academyPayload.message, /Academy qualification:/);
assert.match(academyPayload.message, /Program: us-logistics-operations/);
assert.match(academyPayload.message, /Country and city: London, United Kingdom/);
assert.match(academyPayload.message, /Languages and levels: Ukrainian C2, English B2/);
assert.match(academyPayload.message, /Spoken English: B2/);
assert.match(academyPayload.message, /Recent experience: Customer communication and operations practice\./);
assert.match(academyPayload.message, /Objective: Career development/);
assert.match(academyPayload.message, /U\.S\. time-zone availability: Available 14:00-22:00 London time/);
assert.match(academyPayload.message, /Preferred contact route: Email/);

for (const category of ["ProgressoPro", "Hermes Business Academy", "IT Development"]) {
  const route = getContactHandoffRoute(category);
  assert.ok(route, `missing route for ${category}`);
  assert.ok(isEmailOnlyRoute(route), `${category} must be email-only`);
}

assert.equal(contactHandoffRoutes.length, 4);

console.log("Contact handoff unit checks passed.");
