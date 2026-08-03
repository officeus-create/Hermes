import assert from "node:assert/strict";
import {
  buildPilotAssetSlots,
  contentEntityRegistry,
  createContentFingerprint,
  normalizeSourceUrl,
  pilotQuota,
  reviewContentAsset,
  summarizePilotSlots,
} from "../src/lib/content-pipeline.ts";
import { syntheticContentAssets } from "../src/data/content-pipeline-pilot.ts";

const slots = buildPilotAssetSlots();
const summary = summarizePilotSlots(slots);

assert.equal(slots.length, 30, "Pilot must reserve exactly 30 owner-fill source slots.");
assert.equal(summary.total, 30);
assert.equal(summary.sourceAdded, 0, "Placeholder slots must not be counted as real inventoried assets.");
assert.equal(summary.awaitingOwnerSource, 30);
assert.deepEqual(
  summary.byDirection.map((item) => [item.direction, item.required]),
  [
    ["hermes_logistics", 10],
    ["progressopro_marketing", 10],
    ["hermes_academy", 5],
    ["hermes_it", 5],
  ],
);
assert.deepEqual(pilotQuota, {
  hermes_logistics: 10,
  progressopro_marketing: 10,
  hermes_academy: 5,
  hermes_it: 5,
});
assert.ok(slots.every((slot) => slot.sourceUrl === null && slot.status === "awaiting_owner_source"));

assert.equal(
  normalizeSourceUrl("https://Example.com/post/123/?utm_source=threads&utm_medium=social#comments"),
  "https://example.com/post/123",
  "Tracking parameters and fragments must not create duplicate sources.",
);

const publishAsset = syntheticContentAssets.find((asset) => asset.id === "synthetic-logistics-publish");
assert.ok(publishAsset);
const publishReview = reviewContentAsset(publishAsset);
assert.equal(publishReview.decision, "publish_candidate");
assert.ok(publishReview.score.total >= 14);
assert.equal(publishReview.blockers.length, 0);

const fingerprintWithTracking = createContentFingerprint({
  ...publishAsset,
  sourceUrl: `${publishAsset.sourceUrl}?utm_source=facebook#reply`,
});
assert.equal(
  fingerprintWithTracking,
  createContentFingerprint(publishAsset),
  "UTM and fragment changes must not create a new duplicate fingerprint.",
);

const expectedDecisions = new Map([
  ["synthetic-logistics-publish", "publish_candidate"],
  ["synthetic-marketing-publish", "publish_candidate"],
  ["synthetic-academy-merge", "merge_or_expand"],
  ["synthetic-it-hold-rights", "hold"],
  ["synthetic-logistics-hold-market-claim", "hold"],
  ["synthetic-private-reject", "reject"],
  ["synthetic-thin-reject", "reject"],
  ["synthetic-awaiting-source", "awaiting_source"],
]);

for (const asset of syntheticContentAssets) {
  const review = reviewContentAsset(asset);
  assert.equal(review.decision, expectedDecisions.get(asset.id), `Unexpected decision for ${asset.id}`);
  assert.match(review.fingerprint, new RegExp(`^${asset.direction}:${asset.platform}:`));
}

const marketClaim = syntheticContentAssets.find((asset) => asset.id === "synthetic-logistics-hold-market-claim");
assert.ok(marketClaim);
assert.ok(
  reviewContentAsset(marketClaim).blockers.some((blocker) => blocker.includes("Current market")),
  "Current route/rate claims require approved current evidence.",
);

const privateAsset = syntheticContentAssets.find((asset) => asset.id === "synthetic-private-reject");
assert.ok(privateAsset);
assert.equal(reviewContentAsset(privateAsset).decision, "reject");

const progressoproEntity = contentEntityRegistry.find((entity) => entity.id === "progressopro_marketing");
assert.ok(progressoproEntity);
assert.equal(progressoproEntity.relationshipStatus, "relationship_resolution_required");
assert.equal(progressoproEntity.publishingStatus, "blocked");
assert.ok(contentEntityRegistry.every((entity) => entity.publishingStatus !== "approved"));

console.log(
  `Content pipeline checks passed: ${slots.length} quota slots, ${syntheticContentAssets.length} synthetic decisions, entity and privacy gates active.`,
);
