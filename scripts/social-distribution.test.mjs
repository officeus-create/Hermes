import assert from "node:assert/strict";
import {
  buildTrackedUrl,
  createDistributionFingerprint,
  createManualExport,
  findDuplicateDrafts,
  generatePlatformDraft,
  transitionDistributionDraft,
  validateDistributionEligibility,
} from "../src/lib/social-distribution.ts";
import {
  syntheticApprovedWebsiteAsset,
  syntheticDistributionDrafts,
  syntheticPreviewChannels,
} from "../src/data/social-distribution-preview.ts";

assert.equal(syntheticDistributionDrafts.length, 6);
assert.deepEqual(
  syntheticDistributionDrafts.map((draft) => draft.platform),
  ["linkedin", "facebook", "threads", "instagram", "x", "telegram"],
);
assert.equal(new Set(syntheticDistributionDrafts.map((draft) => draft.copy)).size, 6, "Platform copy must be materially distinct.");
assert.ok(syntheticDistributionDrafts.every((draft) => draft.channelMode === "synthetic_preview"));
assert.ok(syntheticDistributionDrafts.every((draft) => draft.objective === "authority"));
assert.ok(syntheticPreviewChannels.every((channel) => !channel.entityApproved && !channel.ownerVerified));
assert.ok(syntheticPreviewChannels.every((channel) => validateDistributionEligibility(syntheticApprovedWebsiteAsset, channel).eligible));

for (const draft of syntheticDistributionDrafts) {
  const url = new URL(draft.trackedUrl);
  assert.equal(url.hostname, "hermeslogisticsus.com");
  assert.equal(url.searchParams.get("utm_source"), draft.platform);
  assert.equal(url.searchParams.get("utm_medium"), "organic_social");
  assert.equal(url.searchParams.get("utm_campaign"), "logistics_insights");
  assert.ok(url.searchParams.get("utm_content"));
  assert.equal(url.searchParams.get("market"), "us");
  assert.ok(url.searchParams.get("placement"));
  assert.ok(url.searchParams.get("creative"));
  assert.doesNotMatch(draft.trackedUrl, /@|academy\.test|\+?\d[\d\s().-]{7,}|\b(?:mc|dot|usdot)\s*#?\s*\d+/i);
}

const linkedin = syntheticDistributionDrafts.find((draft) => draft.platform === "linkedin");
assert.ok(linkedin);
assert.match(linkedin.destinationStrategy, /Professional B2B\/talent draft/);
assert.match(linkedin.copy, /Read the complete comparison/);

const instagram = syntheticDistributionDrafts.find((draft) => draft.platform === "instagram");
assert.ok(instagram);
assert.match(instagram.destinationStrategy, /Do not assume a clickable caption link/);
assert.doesNotMatch(instagram.copy, /https:\/\//, "Instagram caption copy should not pretend the tracked URL is clickable.");

const xDraft = syntheticDistributionDrafts.find((draft) => draft.platform === "x");
assert.ok(xDraft);
assert.ok(xDraft.copy.length <= 280, `X draft must stay within 280 characters, got ${xDraft.copy.length}.`);

const telegram = syntheticDistributionDrafts.find((draft) => draft.platform === "telegram");
assert.ok(telegram);
assert.match(telegram.copy, /Hermes update/);
assert.match(telegram.copy, /utm_source=telegram/);
assert.match(telegram.destinationStrategy, /No bot send occurs in preview mode/);
assert.doesNotMatch(telegram.copy, /bot token|chat id|sendMessage|access_token|client_secret/i);

assert.throws(
  () => buildTrackedUrl(syntheticApprovedWebsiteAsset.canonicalUrl, "facebook", "logistics_insights", "john@example.com"),
  /privacy-safe identifier/,
);
assert.throws(
  () => buildTrackedUrl(syntheticApprovedWebsiteAsset.canonicalUrl, "threads", "logistics_insights", "mc-123456"),
  /privacy-safe identifier/,
);
assert.throws(
  () => buildTrackedUrl("https://example.com/page", "facebook", "logistics_insights", "safe-variant"),
  /approved Hermes domain/,
);
assert.throws(
  () => buildTrackedUrl(
    syntheticApprovedWebsiteAsset.canonicalUrl,
    "linkedin",
    "recruiting",
    "safe-variant",
    { vacancy: "candidate@example.com" },
  ),
  /privacy-safe identifier/,
);

const linkedinChannel = syntheticPreviewChannels.find((channel) => channel.platform === "linkedin");
assert.ok(linkedinChannel);
const recruitingAsset = {
  ...syntheticApprovedWebsiteAsset,
  id: "car-hauling-dispatcher-role",
  canonicalUrl: "https://hermeslogisticsus.com/careers/car-hauling-dispatcher/",
  campaign: "recruiting",
  objective: "recruit",
  audience: "International candidates for a real remote U.S.-market role",
  market: "pl",
  vacancyId: "car-hauling-dispatcher",
  ctaLabel: "Review the role and application path",
};
const recruitingDraft = generatePlatformDraft(recruitingAsset, linkedinChannel, "2026-09-02T10:00:00Z");
const recruitingUrl = new URL(recruitingDraft.trackedUrl);
assert.equal(recruitingDraft.objective, "recruit");
assert.equal(recruitingDraft.market, "pl");
assert.equal(recruitingDraft.vacancyId, "car-hauling-dispatcher");
assert.equal(recruitingUrl.searchParams.get("utm_source"), "linkedin");
assert.equal(recruitingUrl.searchParams.get("utm_campaign"), "recruiting");
assert.equal(recruitingUrl.searchParams.get("market"), "pl");
assert.equal(recruitingUrl.searchParams.get("vacancy"), "car-hauling-dispatcher");
assert.match(recruitingDraft.copy, /opening a real role/i);

for (const excludedMarket of ["ru", "by", "russia", "belarus"]) {
  const eligibility = validateDistributionEligibility(
    { ...syntheticApprovedWebsiteAsset, market: excludedMarket },
    linkedinChannel,
  );
  assert.equal(eligibility.eligible, false);
  assert.ok(eligibility.blockers.includes("Owner-excluded active acquisition market."));
}

const duplicateSet = findDuplicateDrafts([
  ...syntheticDistributionDrafts,
  { ...syntheticDistributionDrafts[0] },
]);
assert.deepEqual(duplicateSet, [syntheticDistributionDrafts[0].fingerprint]);

const nextVersionAsset = { ...syntheticApprovedWebsiteAsset, contentVersion: "v2" };
const nextVersionFingerprint = createDistributionFingerprint(nextVersionAsset, syntheticPreviewChannels[0]);
assert.notEqual(nextVersionFingerprint, syntheticDistributionDrafts[0].fingerprint);

assert.throws(
  () => generatePlatformDraft({ ...syntheticApprovedWebsiteAsset, status: "review_required" }, syntheticPreviewChannels[0]),
  /not distribution-approved/,
);
assert.throws(
  () => generatePlatformDraft({ ...syntheticApprovedWebsiteAsset, privacySafe: false }, syntheticPreviewChannels[0]),
  /Privacy review is incomplete/,
);
assert.throws(
  () => generatePlatformDraft(syntheticApprovedWebsiteAsset, {
    ...syntheticPreviewChannels[0],
    mode: "owner_verified",
    readiness: "live_gate_required",
    entityApproved: false,
    ownerVerified: false,
  }),
  /Channel entity ownership is unresolved.*Channel ownership is not verified/,
);
assert.throws(
  () => generatePlatformDraft(syntheticApprovedWebsiteAsset, {
    ...syntheticPreviewChannels[0],
    entityApproved: true,
  }),
  /must not claim real entity or account verification/,
);

const initial = syntheticDistributionDrafts.find((draft) => draft.platform === "facebook");
assert.ok(initial);
assert.throws(() => createManualExport(initial), /not approved for manual export/);
assert.throws(
  () => transitionDistributionDraft(initial, "approved", "Reviewer", "2026-09-02T10:01:00Z", "Skipped review"),
  /Invalid distribution transition/,
);
assert.throws(
  () => transitionDistributionDraft(initial, "rejected", "Reviewer", "2026-09-02T10:01:00Z", ""),
  /rejection reason is required/,
);

const reviewed = transitionDistributionDraft(
  initial,
  "reviewed",
  "Owner reviewer",
  "2026-09-02T10:01:00Z",
  "Platform copy and destination reviewed.",
);
assert.equal(reviewed.draft.state, "reviewed");
assert.equal(reviewed.audit.from, "generated");
assert.equal(reviewed.audit.to, "reviewed");

const approved = transitionDistributionDraft(
  reviewed.draft,
  "approved",
  "Owner reviewer",
  "2026-09-02T10:02:00Z",
  "Approved only for manual export preparation.",
);
assert.equal(approved.draft.state, "approved");

const exportReady = transitionDistributionDraft(
  approved.draft,
  "manual_export_ready",
  "Owner reviewer",
  "2026-09-02T10:03:00Z",
  "Prepared local manual export.",
);
const manualExport = createManualExport(exportReady.draft);
assert.match(manualExport, /Mode: synthetic_preview/);
assert.match(manualExport, /Platform: facebook/);
assert.match(manualExport, /Objective: authority/);
assert.match(manualExport, /Market: us/);
assert.match(manualExport, /utm_source=facebook/);
assert.doesNotMatch(manualExport, /access_token|client_secret|provider post id/i);

const rejected = transitionDistributionDraft(
  syntheticDistributionDrafts.find((draft) => draft.platform === "threads"),
  "rejected",
  "Owner reviewer",
  "2026-09-02T10:04:00Z",
  "Hook needs a different audience angle.",
);
assert.equal(rejected.draft.state, "rejected");
assert.equal(rejected.draft.rejectionReason, "Hook needs a different audience angle.");
assert.throws(
  () => transitionDistributionDraft(rejected.draft, "reviewed", "Owner reviewer", "2026-09-02T10:05:00Z", "Retry"),
  /Invalid distribution transition/,
);

console.log("Social distribution checks passed: LinkedIn + 5 existing channels, safe UTM/HR attribution, market exclusions, duplicate protection, human review, rejection, and manual export only.");