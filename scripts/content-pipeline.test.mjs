import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildPilotAssetSlots,
  contentEntityRegistry,
  createContentFingerprint,
  normalizeSourceUrl,
  pilotQuota,
  summarizePilotSlots,
} from "../src/lib/content-pipeline.ts";
import { reviewContentForPublication } from "../src/lib/content-publication-gate.ts";

const directCarrierIntake = "/logistics/start-car-hauling-dispatch/";
const legacyCarrierDemoCtas = [
  "/load-board/?role=carrier#carrier-access",
  "/load-board/?role=carrier&equipment=car_hauler#carrier-access",
];

const slots = buildPilotAssetSlots();
const summary = summarizePilotSlots(slots);

assert.equal(slots.length, 30, "Pilot must reserve exactly 30 owner-fill source slots.");
assert.equal(summary.total, 30);
assert.equal(summary.sourceAdded, 0, "Generated placeholder slots must not be counted as inventoried sources.");
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
assert.equal(
  normalizeSourceUrl("https://www.instagram.com/reel/Dacx1vBuJB7/?igsh=MTVtc3prbDJmZWdsag==#comments"),
  "https://www.instagram.com/reel/Dacx1vBuJB7",
  "Instagram share parameters must not create duplicate sources.",
);

const pilotRegister = readFileSync(new URL("../docs/content-pipeline-pilot-register.csv", import.meta.url), "utf8")
  .trim()
  .split("\n");
const registerHeader = pilotRegister[0].split(",");
const registerRows = pilotRegister.slice(1).map((line) => {
  const values = line.split(",");
  return Object.fromEntries(registerHeader.map((key, index) => [key, values[index] ?? ""]));
});
const registeredSources = registerRows.filter((row) => row.source_url);

assert.equal(registerRows.length, 30, "Pilot register must retain exactly 30 quota rows.");
assert.equal(registeredSources.length, 2, "Only the two owner-supplied public Instagram URLs may be registered.");
assert.deepEqual(
  registeredSources.map((row) => row.slot_id).sort(),
  ["hermes_academy-01", "hermes_logistics-01"],
);
assert.ok(registeredSources.every((row) => row.platform === "instagram"));
assert.ok(registeredSources.every((row) => row.permission_status === "owner_confirmed"));
assert.ok(registeredSources.every((row) => row.evidence_status === "owner_claim"));
assert.ok(registeredSources.every((row) => row.decision === "hold"));
assert.ok(registeredSources.every((row) => !/[?#]/.test(row.source_url)));
assert.equal(registerRows.filter((row) => row.decision === "awaiting_source").length, 28);
assert.equal(
  registerRows.find((row) => row.slot_id === "hermes_logistics-01")?.intended_cta,
  directCarrierIntake,
);
assert.equal(
  registerRows.find((row) => row.slot_id === "hermes_academy-01")?.intended_cta,
  "/academy/apply/",
);

const pilotSource = readFileSync(new URL("../src/data/content-pipeline-pilot.ts", import.meta.url), "utf8");
const publishStart = pilotSource.indexOf('id: "synthetic-logistics-publish"');
const nextFixtureStart = pilotSource.indexOf('id: "synthetic-marketing-publish"');
assert.ok(publishStart >= 0 && nextFixtureStart > publishStart, "Synthetic logistics publish fixture block must exist.");
const logisticsPublishBlock = pilotSource.slice(publishStart, nextFixtureStart);
assert.ok(
  logisticsPublishBlock.includes(`intendedCta: "${directCarrierIntake}"`),
  "Synthetic logistics publish candidate must use the direct carrier intake.",
);
for (const legacyCta of legacyCarrierDemoCtas) {
  assert.ok(
    !logisticsPublishBlock.includes(`intendedCta: "${legacyCta}"`),
    "Publishable logistics fixture must not route carrier traffic to the fictional Load Board intake.",
  );
}

const substantialText = [
  "A useful source explains the full operating question rather than only repeating a promotional claim.",
  "It defines the audience, the problem, the decision steps, the evidence boundary, the privacy boundary, and the next useful action.",
  "It contains enough detail to expand into a standalone answer with takeaways, FAQ, internal links, source attribution, and a controlled CTA.",
  "It does not guarantee ranking, traffic, loads, rates, revenue, employment, clients, or other external outcomes.",
].join(" ");

const makeAsset = (overrides = {}) => ({
  id: "unit-publish",
  direction: "hermes_logistics",
  platform: "instagram",
  sourceUrl: "https://social.example.invalid/hermes/useful-post",
  originalPublishedAt: "2026-07-20",
  mediaType: "video",
  sourceText: substantialText,
  transcript: substantialText,
  proposedTopic: "Structured carrier-controlled review",
  proposedQuery: "what should a carrier review before booking",
  canonicalOwner: "/logistics/car-hauling-dispatch/",
  intendedCta: directCarrierIntake,
  audience: "Carriers",
  permissionStatus: "owner_confirmed",
  evidenceStatus: "first_party_verified",
  privacyClass: "public",
  containsCurrentMarketClaim: false,
  containsPrivateOperationalData: false,
  materiallySimilarTo: null,
  reviewer: "unit-test",
  reviewState: "reviewed",
  ...overrides,
});

const publishAsset = makeAsset();
const publishReview = reviewContentForPublication(publishAsset);
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

const decisionFixtures = [
  [makeAsset(), "publish_candidate"],
  [makeAsset({ id: "unit-publish-two", direction: "progressopro_marketing", canonicalOwner: "/resources/search-to-inquiry-conversion-checklist/", intendedCta: "/paths/marketing/" }), "publish_candidate"],
  [makeAsset({ id: "unit-merge", materiallySimilarTo: "/logistics/resources/dispatch-service-vs-self-dispatch/" }), "merge_or_expand"],
  [makeAsset({ id: "unit-hold-rights", permissionStatus: "unverified" }), "hold"],
  [makeAsset({ id: "unit-hold-market", containsCurrentMarketClaim: true, evidenceStatus: "owner_claim" }), "hold"],
  [makeAsset({ id: "unit-reject-private", privacyClass: "restricted", containsPrivateOperationalData: true }), "reject"],
  [makeAsset({ id: "unit-reject-thin", mediaType: "text", sourceText: "Keep posting and believe in your business.", transcript: null }), "reject"],
  [makeAsset({ id: "unit-awaiting-source", sourceUrl: null, permissionStatus: "unverified", evidenceStatus: "missing" }), "awaiting_source"],
];

for (const [asset, expectedDecision] of decisionFixtures) {
  const review = reviewContentForPublication(asset);
  assert.equal(review.decision, expectedDecision, `Unexpected decision for ${asset.id}`);
  assert.match(review.fingerprint, new RegExp(`^${asset.direction}:${asset.platform}:`));
}

const marketClaim = makeAsset({
  id: "unit-market-evidence",
  containsCurrentMarketClaim: true,
  evidenceStatus: "owner_claim",
});
assert.ok(
  reviewContentForPublication(marketClaim).blockers.some((blocker) => blocker.includes("Current market")),
  "Current route/rate claims require approved current evidence.",
);

const privateAsset = makeAsset({
  id: "unit-private",
  privacyClass: "restricted",
  containsPrivateOperationalData: true,
});
assert.equal(reviewContentForPublication(privateAsset).decision, "reject");

const thinAsset = makeAsset({
  id: "unit-thin",
  mediaType: "text",
  sourceText: "Keep posting and believe in your business.",
  transcript: null,
});
const thinReview = reviewContentForPublication(thinAsset);
assert.equal(thinReview.decision, "reject");
assert.ok(thinReview.blockers.some((blocker) => blocker.includes("too thin")));

const thinClusterNote = makeAsset({
  id: "unit-thin-cluster",
  mediaType: "text",
  sourceText: "Keep carrier approval explicit.",
  transcript: null,
  materiallySimilarTo: "/logistics/resources/dispatch-service-vs-self-dispatch/",
});
assert.equal(reviewContentForPublication(thinClusterNote).decision, "merge_or_expand");

const progressoproEntity = contentEntityRegistry.find((entity) => entity.id === "progressopro_marketing");
assert.ok(progressoproEntity);
assert.equal(progressoproEntity.relationshipStatus, "relationship_resolution_required");
assert.equal(progressoproEntity.publishingStatus, "blocked");
assert.ok(contentEntityRegistry.every((entity) => entity.publishingStatus !== "approved"));

console.log(
  `Content pipeline checks passed: ${slots.length} quota slots, ${registeredSources.length} real held sources, ${decisionFixtures.length} decision paths, direct carrier CTA for publishable content, strict thin-content and entity/privacy gates active.`,
);
