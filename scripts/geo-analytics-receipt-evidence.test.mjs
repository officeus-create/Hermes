import assert from "node:assert/strict";
import {
  buildGeoAnalyticsFreshness,
  buildGeoAnalyticsOwnerCompleteness,
  buildGeoAnalyticsReceiptHealth,
  geoAnalyticsReceiptVersion,
  geoAnalyticsRegistryContract,
  importGeoAnalyticsAttributionMap,
  importGeoAnalyticsOwnershipAttestation,
  importGeoAnalyticsReceipt,
  importGeoAnalyticsReceiptBatch,
  reconcileGeoAnalyticsHandoffDelivery,
} from "../src/data/geo-analytics-receipt-evidence.ts";

const carrierOwner = "/logistics/car-hauling-dispatch/";
const carrierJourney = "/logistics/start-car-hauling-dispatch/";
const map = importGeoAnalyticsAttributionMap({
  canonical_owner: carrierOwner,
  journey_path: carrierJourney,
  family: "carrier",
});

const receipt = (eventName, overrides = {}) => ({
  schema_version: geoAnalyticsReceiptVersion,
  reference_id: `receipt-${eventName}`,
  canonical_owner: carrierOwner,
  event_page_path: eventName === "commercial_cta_click" ? carrierOwner : carrierJourney,
  event_name: eventName,
  observed_at: "2026-08-18T18:00:00Z",
  receipt_state: "observed_once",
  synthetic: false,
  parameter_keys: geoAnalyticsRegistryContract[eventName].requiredParameterKeys,
  evidence_class: "platform_verified",
  supersedes_reference_id: null,
  ...overrides,
});

const ownership = importGeoAnalyticsOwnershipAttestation({
  checked_at: "2026-08-18T17:00:00Z",
  ownership_state: "existing_property_confirmed",
  duplicate_tag_state: "none_observed",
  evidence_class: "platform_verified",
});
assert.equal(ownership.ownershipState, "existing_property_confirmed");
assert.equal(ownership.duplicateTagState, "none_observed");
assert.ok(!JSON.stringify(ownership).match(/property_id|stream_id|container_id/i));

const carrierEvents = [
  "commercial_cta_click",
  "carrier_intake_start",
  "carrier_intake_preview_ready",
  "carrier_handoff_ready",
  "carrier_delivery_confirmed",
];
const carrierReceipts = importGeoAnalyticsReceiptBatch(carrierEvents.map((eventName) => receipt(eventName)));
assert.equal(carrierReceipts.length, 5);
assert.ok(carrierReceipts.every((item) => item.exactOnceVerified));
assert.equal(buildGeoAnalyticsOwnerCompleteness([map], carrierReceipts)[0].complete, true);
assert.equal(reconcileGeoAnalyticsHandoffDelivery(map, carrierReceipts).deliveryState, "delivery_exact_once_verified");

const missing = importGeoAnalyticsReceipt(receipt("carrier_intake_start", {
  reference_id: "receipt-missing-start",
  receipt_state: "not_observed",
}));
assert.equal(missing.exactOnceVerified, false);
const duplicate = importGeoAnalyticsReceipt(receipt("carrier_intake_start", {
  reference_id: "receipt-duplicate-start",
  receipt_state: "observed_multiple",
}));
assert.equal(duplicate.exactOnceVerified, false);

const unexpected = importGeoAnalyticsReceipt(receipt("commercial_cta_click", {
  reference_id: "receipt-cta-unexpected-key",
  parameter_keys: [...geoAnalyticsRegistryContract.commercial_cta_click.requiredParameterKeys, "email"],
}));
assert.deepEqual(unexpected.unexpectedParameterKeys, ["email"]);
assert.equal(unexpected.exactOnceVerified, false);

const incompleteParameters = importGeoAnalyticsReceipt(receipt("carrier_handoff_ready", {
  reference_id: "receipt-handoff-missing-param",
  parameter_keys: ["audience_type", "page_group", "service_group", "page_path", "preview_status"],
}));
assert.deepEqual(incompleteParameters.missingRequiredParameterKeys, ["handoff_method"]);
assert.equal(incompleteParameters.exactOnceVerified, false);

const synthetic = importGeoAnalyticsReceipt(receipt("carrier_intake_start", {
  reference_id: "receipt-synthetic-start",
  observed_at: "2026-08-18T19:00:00Z",
  synthetic: true,
}));
const healthWithSynthetic = buildGeoAnalyticsReceiptHealth([...carrierReceipts, synthetic, unexpected]);
assert.equal(healthWithSynthetic.syntheticExcludedCount, 1);
assert.ok(healthWithSynthetic.exactOnce.some((item) => item.eventName === "carrier_intake_start"), "Synthetic receipt must not hide real exact-once evidence");
assert.equal(healthWithSynthetic.parameterPrivacyIssues.length, 1);

const older = receipt("carrier_intake_start", {
  reference_id: "receipt-start-old",
  observed_at: "2026-08-17T18:00:00Z",
});
const newer = receipt("carrier_intake_start", {
  reference_id: "receipt-start-new",
  observed_at: "2026-08-18T18:00:00Z",
  supersedes_reference_id: "receipt-start-old",
});
const supersededBatch = importGeoAnalyticsReceiptBatch([older, newer]);
const supersededHealth = buildGeoAnalyticsReceiptHealth(supersededBatch);
assert.equal(supersededHealth.latestRealReceipts.length, 1);
assert.equal(supersededHealth.latestRealReceipts[0].referenceId, "receipt-start-new");

const freshness = buildGeoAnalyticsFreshness(carrierReceipts, "2026-08-18T22:00:00Z", 7);
assert.ok(freshness.every((item) => item.freshnessState === "current"));
assert.throws(() => buildGeoAnalyticsFreshness(carrierReceipts, "2026-08-17T22:00:00Z", 7), /occurs after asOf/);

const seoMap = importGeoAnalyticsAttributionMap({
  canonical_owner: "/services/seo/",
  journey_path: "/services/seo/",
  family: "seo",
});
const seoHandoff = importGeoAnalyticsReceipt({
  schema_version: geoAnalyticsReceiptVersion,
  reference_id: "receipt-seo-handoff",
  canonical_owner: "/services/seo/",
  event_page_path: "/services/seo/",
  event_name: "seo_handoff_ready",
  observed_at: "2026-08-18T18:00:00Z",
  receipt_state: "observed_once",
  synthetic: false,
  parameter_keys: geoAnalyticsRegistryContract.seo_handoff_ready.requiredParameterKeys,
  evidence_class: "platform_verified",
  supersedes_reference_id: null,
});
const seoDelivery = reconcileGeoAnalyticsHandoffDelivery(seoMap, [seoHandoff]);
assert.equal(seoDelivery.handoffExactOnce, true);
assert.equal(seoDelivery.deliveryEvent, null);
assert.equal(seoDelivery.deliveryState, "delivery_event_not_established_in_canonical_registry");

const ownerHandoffOnly = importGeoAnalyticsReceipt(receipt("carrier_intake_start", {
  reference_id: "receipt-owner-handoff-only",
  evidence_class: "owner_provided_handoff",
}));
assert.equal(ownerHandoffOnly.exactOnceVerified, false, "Owner handoff is evidence, but not authenticated platform exact-once proof");

assert.throws(() => importGeoAnalyticsReceipt({ ...receipt("carrier_intake_start"), property_id: "blocked" }), /unsupported field: property_id/i);
assert.throws(() => importGeoAnalyticsReceipt(receipt("carrier_intake_start", { event_name: "made_up_event" })), /event_name has unsupported value/);
assert.throws(() => importGeoAnalyticsReceiptBatch([older, { ...newer, canonical_owner: "/services/seo/" }]), /preserve owner\/event\/page/);

console.log("GEO analytics receipt evidence contract passed");
