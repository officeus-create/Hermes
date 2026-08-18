import assert from "node:assert/strict";
import {
  adaptCanonicalAnalyticsFunnel,
  adaptExactSearchCheckpoint,
  inclusiveWindowDays,
} from "../src/data/geo-measurement-adapters.ts";

assert.equal(inclusiveWindowDays("2026-08-12", "2026-08-18"), 7);
assert.equal(inclusiveWindowDays("2026-07-28", "2026-08-12"), 16);

const nonStandard = adaptExactSearchCheckpoint({
  source: "google",
  pagePath: "/services/seo-for-logistics-companies/",
  discoveryType: "non_branded",
  startDate: "2026-07-28",
  endDate: "2026-08-12",
  impressions: 119,
  clicks: 0,
  evidenceClass: "owner_provided_handoff",
});
assert.equal(nonStandard.status, "non_standard_window");
assert.equal(nonStandard.windowDays, 16);
assert.equal(nonStandard.aggregate, undefined);
assert.match(nonStandard.reason, /do not manufacture a 7\/28\/90-day row/);

const standard = adaptExactSearchCheckpoint({
  source: "google",
  pagePath: "/logistics/car-hauling-dispatch/",
  discoveryType: "non_branded",
  startDate: "2026-08-12",
  endDate: "2026-08-18",
  impressions: 70,
  clicks: 7,
  evidenceClass: "platform_verified",
});
assert.equal(standard.status, "ready");
assert.equal(standard.aggregate.windowDays, 7);
assert.equal(standard.aggregate.impressions, 70);
assert.equal(standard.aggregate.clicks, 7);

const carrierRows = [
  { eventName: "commercial_cta_click", count: 20, eventPagePath: "/logistics/car-hauling-dispatch/" },
  { eventName: "carrier_intake_start", count: 12, eventPagePath: "/logistics/start-car-hauling-dispatch/" },
  { eventName: "carrier_intake_preview_ready", count: 9, eventPagePath: "/logistics/start-car-hauling-dispatch/" },
  { eventName: "carrier_handoff_ready", count: 6, eventPagePath: "/logistics/start-car-hauling-dispatch/" },
  { eventName: "carrier_delivery_confirmed", count: 4, eventPagePath: "/logistics/start-car-hauling-dispatch/" },
].map((row) => ({
  windowDays: 7,
  journeyPath: "/logistics/car-hauling-dispatch/",
  ...row,
  evidenceClass: "platform_verified",
}));

const carrier = adaptCanonicalAnalyticsFunnel("carrier", carrierRows);
assert.equal(carrier.status, "ready");
assert.deepEqual(carrier.missingEvents, []);
assert.deepEqual(carrier.registryGaps, []);
assert.equal(carrier.aggregate.pagePath, "/logistics/car-hauling-dispatch/");
assert.equal(carrier.aggregate.ctaClicks, 20);
assert.equal(carrier.aggregate.intakeStarts, 12);
assert.equal(carrier.aggregate.previewReady, 9);
assert.equal(carrier.aggregate.handoffReady, 6);
assert.equal(carrier.aggregate.deliveryConfirmed, 4);

const seoRows = [
  ["commercial_cta_click", 11],
  ["seo_intake_start", 7],
  ["seo_intake_preview_ready", 5],
  ["seo_handoff_ready", 3],
].map(([eventName, count]) => ({
  windowDays: 7,
  journeyPath: "/services/seo/",
  eventPagePath: "/services/seo/",
  eventName,
  count,
  evidenceClass: "platform_verified",
}));

const seo = adaptCanonicalAnalyticsFunnel("seo", seoRows);
assert.equal(seo.status, "incomplete");
assert.deepEqual(seo.missingEvents, []);
assert.deepEqual(seo.registryGaps, ["delivery_confirmed_event_not_established"]);
assert.equal(seo.aggregate, undefined, "SEO handoff must never be promoted to delivery");

const incompleteCarrier = adaptCanonicalAnalyticsFunnel("carrier", carrierRows.slice(0, -1));
assert.equal(incompleteCarrier.status, "incomplete");
assert.deepEqual(incompleteCarrier.missingEvents, ["carrier_delivery_confirmed"]);
assert.equal(incompleteCarrier.aggregate, undefined);

assert.throws(
  () => adaptCanonicalAnalyticsFunnel("carrier", carrierRows.map((row, index) => index === 1 ? { ...row, count: 21 } : row)),
  /intake starts cannot exceed commercial CTA clicks/,
);

assert.throws(
  () => adaptCanonicalAnalyticsFunnel("carrier", carrierRows.map((row, index) => index === 1 ? { ...row, journeyPath: "/different-owner/" } : row)),
  /one canonical journeyPath/,
);

assert.throws(
  () => adaptExactSearchCheckpoint({
    source: "google",
    pagePath: "/",
    discoveryType: "branded",
    startDate: "2026-08-18",
    endDate: "2026-08-12",
    impressions: 10,
    clicks: 1,
    evidenceClass: "platform_verified",
  }),
  /endDate must not be before startDate/,
);

console.log("GEO measurement adapters passed");