import assert from "node:assert/strict";
import {
  VIDEO_JOB_SCHEMA_VERSION,
  createVideoIdempotencyKey,
  routeScene,
  validateVideoJob,
  videoBusinessLanes,
  videoLaneUseCases,
} from "../src/contracts.mjs";
import {
  buildHeyGenAvatarPayload,
  buildHyperFramesRenderPayload,
  buildRemotionRenderRequest,
} from "../src/providers.mjs";

const baseJob = {
  schemaVersion: VIDEO_JOB_SCHEMA_VERSION,
  jobId: "video_2026_09_06_001",
  businessLane: "progressopro_marketing",
  purpose: "social_reel",
  brandId: "progressopro",
  templateId: "vertical-reel",
  templateVersion: "1.0.0",
  format: { width: 1080, height: 1920, fps: 30, durationSec: 30 },
  script: {
    hook: "Content should generate measurable demand.",
    body: ["Build the hook.", "Show the proof.", "Give one next action."],
    cta: "Book your media plan.",
  },
  scenes: [
    { id: "hook", type: "kinetic_text", durationSec: 4, template: "hook-v1" },
    { id: "presenter", type: "avatar", durationSec: 16, template: "avatar-v1", script: "Most businesses post. We build a measurable content pipeline." },
    { id: "proof", type: "metric_chart", durationSec: 6, template: "metric-v1" },
    { id: "cta", type: "cta", durationSec: 4, template: "cta-v1" },
  ],
  providers: { media: "heygen", render: "hyperframes" },
  governance: {
    privacyClass: "public",
    avatarConsentId: "consent_demo_001",
    containsCurrentClaim: false,
    containsPrivateOperationalData: false,
  },
  approval: { state: "approved", reviewer: "owner" },
  publishing: { publicDistribution: true, channels: ["instagram", "tiktok"] },
};

const validation = validateVideoJob(baseJob);
assert.equal(validation.ok, true, validation.errors.join("\n"));

assert.equal(videoBusinessLanes.length, 8);
assert.equal(videoLaneUseCases.length, 8);
assert.deepEqual(
  new Set(videoLaneUseCases.map((lane) => lane.businessLane)),
  new Set(videoBusinessLanes),
  "Every business lane must have an explicit video use-case mapping.",
);

assert.deepEqual(routeScene(baseJob.scenes[0]), { mediaProvider: "none", renderProvider: "hyperframes" });
assert.deepEqual(routeScene(baseJob.scenes[1]), { mediaProvider: "heygen", renderProvider: "hyperframes" });

const keyA = createVideoIdempotencyKey(baseJob, "hyperframes:render");
const keyB = createVideoIdempotencyKey(structuredClone(baseJob), "hyperframes:render");
assert.equal(keyA, keyB, "Equivalent jobs must have stable idempotency keys.");

const heygen = buildHeyGenAvatarPayload({
  job: baseJob,
  scene: baseJob.scenes[1],
  avatarId: "avatar_demo",
  voiceId: "voice_demo",
  callbackUrl: "https://example.com/webhooks/heygen",
});
assert.equal(heygen.type, "avatar");
assert.equal(heygen.aspect_ratio, "9:16");
assert.equal(heygen.resolution, "1080p");
assert.equal(heygen.caption.file_format, "srt");
assert.equal(heygen.callback_id, `${baseJob.jobId}:presenter`);

const hyperframes = buildHyperFramesRenderPayload({
  job: baseJob,
  templateAssetId: "asset_demo",
  callbackUrl: "https://example.com/webhooks/hyperframes",
});
assert.equal(hyperframes.project.asset_id, "asset_demo");
assert.equal(hyperframes.aspect_ratio, "9:16");
assert.equal(hyperframes.variables.template_version, "1.0.0");

const remotion = buildRemotionRenderRequest({ job: baseJob });
assert.equal(remotion.renderer, "remotion");
assert.equal(remotion.output.width, 1080);
assert.equal(remotion.output.height, 1920);
assert.equal(remotion.output.codec, "h264");

const noConsent = structuredClone(baseJob);
delete noConsent.governance.avatarConsentId;
assert.equal(validateVideoJob(noConsent).ok, false);
assert.match(validateVideoJob(noConsent).errors.join(" "), /avatar scenes require governance\.avatarConsentId/);

const privatePublic = structuredClone(baseJob);
privatePublic.governance.privacyClass = "internal";
assert.equal(validateVideoJob(privatePublic).ok, false);
assert.match(validateVideoJob(privatePublic).errors.join(" "), /cannot be marked for public distribution/);

const unapprovedPublic = structuredClone(baseJob);
unapprovedPublic.approval.state = "draft";
assert.equal(validateVideoJob(unapprovedPublic).ok, false);
assert.match(validateVideoJob(unapprovedPublic).errors.join(" "), /requires approval\.state=approved/);

const unevidencedClaim = structuredClone(baseJob);
unevidencedClaim.governance.containsCurrentClaim = true;
assert.equal(validateVideoJob(unevidencedClaim).ok, false);
assert.match(validateVideoJob(unevidencedClaim).errors.join(" "), /require governance\.evidenceRef/);

console.log("Video Factory contract: PASS");
