import assert from "node:assert/strict";
import {
  pendingLogisticsLocationSignals,
  publishedLogisticsLocations,
} from "../src/data/logistics-locations.ts";

assert.equal(
  publishedLogisticsLocations.length,
  14,
  "The approved public set must contain Appleton plus the 13 reviewed market signals",
);

const slugs = new Set(publishedLogisticsLocations.map((location) => location.slug));
assert.equal(slugs.size, publishedLogisticsLocations.length, "Location slugs must be unique");
assert.ok(
  publishedLogisticsLocations.every((location) => location.slug.endsWith("-vehicle-transport")),
  "Location routes must use the established vehicle-transport pattern",
);
assert.ok(
  publishedLogisticsLocations.every((location) => location.planningNotes.length >= 3),
  "Every location needs substantive planning context",
);
assert.ok(
  publishedLogisticsLocations.every((location) => location.faqs.length >= 5),
  "Every location needs a useful FAQ",
);
assert.ok(
  publishedLogisticsLocations.every((location) => location.metaDescription.length <= 160),
  "Location meta descriptions must remain within the intended search-result length",
);
assert.ok(
  publishedLogisticsLocations.every((location) => location.targetAudiences.includes("SHIPPER")),
  "Every location must provide a commercial shipper path",
);
assert.ok(
  publishedLogisticsLocations.every((location) => (
    !location.publicLocationDetail ||
    location.publicLocationDetail.verificationStatus === "HERMES_VERIFIED"
  )),
  "Public address or ZIP data must require explicit Hermes verification",
);

const publicPayload = JSON.stringify(publishedLogisticsLocations).toLowerCase();
for (const unsupported of [
  "6%-11%",
  "6% to 11%",
  "$10k",
  "$12k",
  "weekly gross",
  "high-paying",
  "guaranteed volume",
  "24/7",
  "[cite:",
  "midnight recovery",
  "5280 asset",
]) {
  assert.equal(publicPayload.includes(unsupported), false, `Unsupported location claim leaked: ${unsupported}`);
}

const pendingKeys = new Set(
  pendingLogisticsLocationSignals.map((location) => `${location.city},${location.state}`),
);
assert.equal(pendingKeys.size, pendingLogisticsLocationSignals.length, "Pending location signals must be unique");
for (const pending of pendingLogisticsLocationSignals) {
  assert.equal(
    publishedLogisticsLocations.some((location) => location.city === pending.city && location.state === pending.state),
    false,
    `${pending.city}, ${pending.state} must remain unpublished until evidence is approved`,
  );
}

console.log("Logistics location data checks passed.");
