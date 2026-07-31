import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  carrierCtaVariants,
  carrierMeasurementContract,
  carrierNoGuaranteeFaq,
  carrierProblemHubLinks,
  carrierQualificationFields,
  carrierRefreshPolicies,
} from "../src/data/carrier-content-operations.ts";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");

const routeToBuiltFile = (route) =>
  route === "/" ? join(dist, "index.html") : join(dist, route.slice(1), "index.html");

assert.equal(carrierCtaVariants.length, 8);
assert.equal(new Set(carrierCtaVariants.map((item) => item.id)).size, 8);
assert.equal(carrierCtaVariants.filter((item) => item.audienceType === "equipment").length, 4);
assert.equal(carrierCtaVariants.filter((item) => item.audienceType === "operating_stage").length, 4);

for (const cta of carrierCtaVariants) {
  assert.ok(cta.label.trim().length > 0);
  assert.ok(cta.destination.startsWith("/") && cta.destination.endsWith("/"));
  assert.match(cta.disclosure, /starts a review only/i);
  assert.match(cta.disclosure, /does not create an account/i);
  assert.match(cta.disclosure, /does not .*book a load|book a load/i);
  assert.match(cta.disclosure, /guarantee rates, revenue, mileage, capacity, or direct freight/i);
  await access(routeToBuiltFile(cta.destination));
}

assert.equal(carrierProblemHubLinks.length, 5);
assert.equal(new Set(carrierProblemHubLinks.map((item) => item.problemCluster)).size, 5);
for (const cluster of carrierProblemHubLinks) {
  assert.ok(cluster.links.length >= 2);
  for (const link of cluster.links) {
    assert.ok(link.label.trim().length > 0);
    assert.ok(link.href.startsWith("/") && link.href.endsWith("/"));
    await access(routeToBuiltFile(link.href));
  }
}

assert.equal(carrierNoGuaranteeFaq.length, 5);
for (const faq of carrierNoGuaranteeFaq) {
  assert.ok(faq.question.trim().length > 0);
  assert.ok(faq.answer.trim().length > 0);
  assert.ok(/\bno\b|not guaranteed|does not/i.test(faq.answer));
}
assert.ok(carrierNoGuaranteeFaq.some((item) => /loads, rates, mileage, or revenue/i.test(item.question)));
assert.ok(carrierNoGuaranteeFaq.some((item) => /final decision/i.test(item.question)));
assert.ok(carrierNoGuaranteeFaq.some((item) => /direct shipper or dealer freight/i.test(item.question)));

assert.equal(carrierQualificationFields.length, 7);
assert.equal(new Set(carrierQualificationFields.map((item) => item.id)).size, 7);
for (const field of carrierQualificationFields) {
  assert.equal(field.requiredForReview, true);
  assert.ok(field.guidance.trim().length > 0);
}
assert.ok(
  carrierQualificationFields.find((item) => item.id === "operating_area")?.guidance.includes("never expose live truck position"),
);
assert.ok(
  carrierQualificationFields.find((item) => item.id === "authority_stage")?.guidance.includes("do not publish MC or DOT"),
);
assert.ok(
  carrierQualificationFields.find((item) => item.id === "communication_workflow")?.guidance.includes("carrier approval is required before booking"),
);

assert.deepEqual(
  carrierRefreshPolicies.map((item) => item.cadence),
  ["monthly", "quarterly", "event_triggered"],
);
for (const policy of carrierRefreshPolicies) {
  assert.ok(policy.reviewItems.length >= 3);
  assert.ok(policy.triggers.length >= 3);
}

assert.deepEqual(
  carrierMeasurementContract.searchConsoleMetrics,
  [
    "impressions",
    "clicks",
    "CTR",
    "average position",
    "query family",
    "canonical page",
    "competing Hermes pages for the same query",
  ],
);
assert.equal(carrierMeasurementContract.inquiryMetric.status, "aggregate_only_when_approved");
assert.match(carrierMeasurementContract.inquiryMetric.definition, /never infer it from a click alone/i);

const analyticsSource = await readFile(join(root, "src/components/ContactLinkEnhancer.astro"), "utf8");
for (const event of carrierMeasurementContract.ga4Events) {
  assert.ok(analyticsSource.includes(`event: "${event.event}"`), `${event.event} must match the existing analytics implementation`);
  for (const parameter of event.allowedParameters) {
    assert.ok(analyticsSource.includes(`${parameter}:`), `${event.event} contract parameter ${parameter} must exist in implementation`);
  }
}

const allowedAnalyticsParameters = new Set(
  carrierMeasurementContract.ga4Events.flatMap((event) => event.allowedParameters),
);
for (const prohibited of [
  "name",
  "phone",
  "email",
  "company",
  "mc",
  "dot",
  "address",
  "message",
  "rate",
  "shipment",
  "customer",
]) {
  assert.ok(!allowedAnalyticsParameters.has(prohibited), `analytics contract must not allow ${prohibited}`);
}

for (const prohibited of ["name", "phone", "email", "company", "MC/DOT", "exact address", "free-form message", "rates"] ) {
  assert.ok(carrierMeasurementContract.inquiryMetric.prohibitedData.includes(prohibited));
}

const serialized = JSON.stringify({
  carrierCtaVariants,
  carrierNoGuaranteeFaq,
  carrierRefreshPolicies,
  carrierMeasurementContract,
});
assert.ok(!serialized.includes('"status":"published"'));
assert.ok(!serialized.includes('"status":"approved_carrier"'));

console.log("carrier-content operations tests passed: CTA, hubs, FAQ, qualification, refresh, Search Console, analytics, privacy, and cannibalization controls.");
