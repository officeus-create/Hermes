import assert from "node:assert/strict";
import {
  normalizedBodyHash,
  normalizeHistoricalSource,
  buildCoverageRecord,
  classifySocialObservation,
  normalizeSocialObservation,
  evaluateExperimentPromotion,
  HISTORICAL_READ_ONLY_JOB_TYPES,
  runHistoricalLearningPrimitive,
} from "../workers/automation-engine/src/historical-learning.mjs";

const now = "2026-10-13T09:00:00Z";

const source = normalizeHistoricalSource({
  source_id: "threads:hermes:2026",
  source_family: "threads_provider_history",
  source_class: "provider_api",
  source_uri_or_ref: "provider:threads:28419597014385166",
  source_owner: "Hermes Logistics",
  source_modified_at: now,
  ingested_at: now,
  content_hash: "sha256:test",
  trust_tier: "PROVIDER_AUTHENTICATED",
  freshness_class: "CURRENT_READBACK",
  current_status: "CURRENT",
  coverage_start: "2025-06-14T00:00:00Z",
  coverage_end: now,
  coverage_limit_reason: "Provider API returned no older post rows",
});
assert.equal(source.current_status, "CURRENT");
assert.equal(source.coverage_limit_reason, "Provider API returned no older post rows");

assert.throws(
  () => normalizeHistoricalSource({
    source_id: "bad",
    source_family: "threads",
    source_class: "provider_api",
    trust_tier: "PROVIDER_AUTHENTICATED",
    coverage_start: "2026-10-13T00:00:00Z",
    coverage_end: "2025-01-01T00:00:00Z",
  }),
  /historical_coverage_range_invalid/,
);
assert.throws(
  () => normalizeHistoricalSource({
    source_id: "bad-time",
    source_family: "threads",
    source_class: "provider_api",
    trust_tier: "PROVIDER_AUTHENTICATED",
    ingested_at: "not-a-time",
  }),
  /historical_ingested_at_invalid/,
);

const completeCoverage = buildCoverageRecord({
  coverage_id: "coverage:threads:hermes",
  source_family: "threads_provider_history",
  business_lane: "LOGISTICS",
  expected_start: "2023-07-05T00:00:00Z",
  observed_start: "2025-06-14T00:00:00Z",
  observed_end: now,
  items_seen: 571,
  items_classified: 571,
  items_unclassified_relevant: 0,
  known_gaps: [{
    start: "2023-07-05T00:00:00Z",
    end: "2025-06-13T23:59:59Z",
    reason: "Provider/API coverage boundary; recover from other authorized historical sources",
    status: "ACCOUNTED_GAP",
  }],
  last_scan_at: now,
});
assert.equal(completeCoverage.status, "COMPLETE");
assert.equal(completeCoverage.items_seen, 571);
assert.equal(completeCoverage.known_gaps.length, 1);

const emptyCoverage = buildCoverageRecord({
  coverage_id: "coverage:empty",
  source_family: "empty_source",
  business_lane: "LOGISTICS",
  items_unclassified_relevant: 0,
});
assert.equal(emptyCoverage.status, "PARTIAL", "Zero unclassified items without scan/observed evidence must not prove COMPLETE");
assert.equal(emptyCoverage.last_scan_at, null, "Missing scan evidence must remain UNKNOWN/null");

assert.throws(
  () => buildCoverageRecord({
    coverage_id: "coverage:bad-counts",
    source_family: "bad_counts",
    business_lane: "LOGISTICS",
    items_seen: 1,
    items_classified: 2,
    items_unclassified_relevant: 0,
    last_scan_at: now,
  }),
  /historical_coverage_counts_invalid/,
);

const partialCoverage = buildCoverageRecord({
  coverage_id: "coverage:claude:wave2",
  source_family: "claude_semantic_extraction",
  business_lane: "CEO_AI_INFRASTRUCTURE",
  items_seen: 38,
  items_classified: 38,
  items_unclassified_relevant: 1,
  known_gaps: [{ reason: null, status: null }],
  last_scan_at: now,
});
assert.equal(partialCoverage.status, "PARTIAL");

const blockedCoverage = buildCoverageRecord({
  coverage_id: "coverage:local:retired-mac",
  source_family: "legacy_local_batches",
  business_lane: "CEO_AI_INFRASTRUCTURE",
  blocked: true,
});
assert.equal(blockedCoverage.status, "BLOCKED");

assert.equal(classifySocialObservation({ media_type: "REPOST_FACADE", post_text: "anything" }), "REPOST");
assert.equal(classifySocialObservation({ post_text: "@person follow-up" }), "DIRECT_OUTREACH");
assert.equal(classifySocialObservation({ is_own_reply: true, post_text: "@person answer" }), "OWN_REPLY");
assert.equal(classifySocialObservation({ is_inbound_reply: true, post_text: "Interested" }), "INBOUND_REPLY");
assert.equal(classifySocialObservation({ post_text: "Car haulers: what are you seeing?" }), "ROOT");
assert.throws(
  () => classifySocialObservation({ is_own_reply: true, is_inbound_reply: true, post_text: "@person contradiction" }),
  /historical_reply_identity_conflict/,
);

const bodyA = "VIỆT NAM! Free logistics training https://example.com/a @someone";
const bodyB = "việt nam free logistics training https://example.org/b @other";
assert.equal(normalizedBodyHash(bodyA), normalizedBodyHash(bodyB), "Link/mention variance should not split a near-duplicate body family");

const observation = normalizeSocialObservation({
  observation_id: "obs:1",
  source_id: "threads:hermes:2026",
  account_key: "hermes_logistics",
  platform: "threads",
  provider_post_id: "post-1",
  published_at_utc: "2026-03-19T09:05:16Z",
  target_market: "VN",
  locale: "vi-VN",
  market_local_hour: 16,
  post_text: "Xin chào Việt Nam",
  media_type: "TEXT_POST",
  prior_24h_count: 5,
  views: 3457,
  likes: 37,
  inbound_replies: 24,
  own_replies: 0,
  qualified_actions: null,
  revenue_evidence: null,
  metrics_observed_at: now,
});
assert.equal(observation.observation_kind, "ROOT");
assert.equal(observation.account_key, "hermes_logistics");
assert.equal(observation.market_local_hour, 16);
assert.equal(observation.views, 3457);
assert.equal(observation.qualified_actions, null, "UNKNOWN downstream outcome must remain null, not zero");
const invalidMetricObservation = normalizeSocialObservation({
  observation_id: "obs:negative",
  source_id: "threads:hermes:2026",
  account_key: "hermes_logistics",
  platform: "threads",
  post_text: "Carrier test",
  views: -1,
  inbound_replies: -2,
});
assert.equal(invalidMetricObservation.views, null, "Negative view counts must not become valid evidence");
assert.equal(invalidMetricObservation.inbound_replies, null, "Negative reply counts must not become valid evidence");
const malformedMetricObservation = normalizeSocialObservation({
  observation_id: "obs:malformed-metrics",
  source_id: "threads:hermes:2026",
  account_key: "hermes_logistics",
  platform: "threads",
  post_text: "Carrier test",
  views: "   ",
  likes: true,
  shares: 1.5,
});
assert.equal(malformedMetricObservation.views, null, "Blank metric text must remain UNKNOWN");
assert.equal(malformedMetricObservation.likes, null, "Boolean metrics must not coerce to counts");
assert.equal(malformedMetricObservation.shares, null, "Fractional count metrics must not become valid evidence");
assert.throws(
  () => normalizeSocialObservation({
    observation_id: "obs:bad-time",
    source_id: "threads:hermes:2026",
    account_key: "hermes_logistics",
    platform: "threads",
    post_text: "Carrier test",
    metrics_observed_at: "not-a-time",
  }),
  /historical_metrics_observed_at_invalid/,
);

const progressoproObservation = normalizeSocialObservation({
  observation_id: "obs:2",
  source_id: "threads:progressopro:2026",
  account_key: "progressopro",
  platform: "threads",
  post_text: "Example",
});
assert.notEqual(observation.account_key, progressoproObservation.account_key, "Brand/account history must remain isolated");

const blockedProxyPromotion = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v2",
  account_key: "hermes_logistics",
  hypothesis: "Localized carrier question increases qualified carrier CTA rate",
  primary_metric: "views",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["no_duplicate_publish", "carrier_only"],
  requires_external_write: true,
}, {
  account_key: "hermes_logistics",
  observed_sample: 50,
  observed_duration_hours: 240,
  downstream_evidence_available: true,
  current_policy_allows_external_write: false,
});
assert.equal(blockedProxyPromotion.eligible, false);
assert.ok(blockedProxyPromotion.reasons.includes("proxy_metric_used_despite_downstream_evidence"));
assert.ok(blockedProxyPromotion.reasons.includes("current_policy_blocks_external_write"));

const unknownWriteAuthorization = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v3",
  account_key: "hermes_logistics",
  hypothesis: "External write requires explicit current authorization",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
  requires_external_write: true,
}, {
  account_key: "hermes_logistics",
  observed_sample: 50,
  observed_duration_hours: 240,
});
assert.equal(unknownWriteAuthorization.eligible, false);
assert.ok(unknownWriteAuthorization.reasons.includes("current_policy_external_write_not_proven"));

const singleOutlier = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v2",
  account_key: "hermes_logistics",
  hypothesis: "One viral post is enough",
  primary_metric: "qualified_actions",
  minimum_sample: 2,
  minimum_duration_hours: 24,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
}, {
  account_key: "hermes_logistics",
  observed_sample: 2,
  observed_duration_hours: 24,
  single_outlier_only: true,
});
assert.equal(singleOutlier.eligible, false);
assert.ok(singleOutlier.reasons.includes("single_outlier_only"));

const accountMismatch = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v2",
  account_key: "hermes_logistics",
  hypothesis: "ProgressPro result transfers directly",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
}, {
  account_key: "progressopro",
  observed_sample: 100,
  observed_duration_hours: 300,
});
assert.equal(accountMismatch.eligible, false);
assert.ok(accountMismatch.reasons.includes("account_scope_mismatch"));

const missingAccountScope = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v2",
  hypothesis: "Unscoped policy must not be promotable",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
}, {
  account_key: "hermes_logistics",
  observed_sample: 30,
  observed_duration_hours: 200,
});
assert.equal(missingAccountScope.eligible, false);
assert.ok(missingAccountScope.reasons.includes("account_scope_missing"));

const emptyGuardrails = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v2",
  account_key: "hermes_logistics",
  hypothesis: "Blank guardrails are not real guardrails",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["", "   "],
}, {
  account_key: "hermes_logistics",
  observed_sample: 30,
  observed_duration_hours: 200,
});
assert.equal(emptyGuardrails.eligible, false);
assert.ok(emptyGuardrails.reasons.includes("guardrails_missing"));

const eligible = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v2",
  account_key: "hermes_logistics",
  hypothesis: "A tested local-time window improves attributed carrier CTA rate without duplicate publishing",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only", "no_duplicate_publish", "no_email_send"],
  requires_external_write: false,
}, {
  account_key: "hermes_logistics",
  observed_sample: 24,
  observed_duration_hours: 192,
  downstream_evidence_available: true,
  current_policy_allows_external_write: false,
  primary_metric_passed: true,
  decision_evidence_refs: ["d1:experiment:threads-carrier-v2"],
});
assert.equal(eligible.eligible, true);
assert.deepEqual(eligible.reasons, []);

const unprovenMetric = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v4",
  account_key: "hermes_logistics",
  hypothesis: "Sample completion alone must not authorize promotion",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
}, {
  account_key: "hermes_logistics",
  observed_sample: 30,
  observed_duration_hours: 200,
  decision_evidence_refs: ["d1:experiment:threads-carrier-v4"],
});
assert.equal(unprovenMetric.eligible, false);
assert.ok(unprovenMetric.reasons.includes("primary_metric_result_not_proven"));

const noDecisionEvidence = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v4",
  account_key: "hermes_logistics",
  hypothesis: "Promotion requires evidence refs",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
}, {
  account_key: "hermes_logistics",
  observed_sample: 30,
  observed_duration_hours: 200,
  primary_metric_passed: true,
});
assert.equal(noDecisionEvidence.eligible, false);
assert.ok(noDecisionEvidence.reasons.includes("decision_evidence_missing"));

const unnormalizedRegime = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v4",
  account_key: "hermes_logistics",
  hypothesis: "Cross-regime evidence requires normalization",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v1",
  guardrails: ["carrier_only"],
}, {
  account_key: "hermes_logistics",
  observed_sample: 30,
  observed_duration_hours: 200,
  primary_metric_passed: true,
  decision_evidence_refs: ["d1:experiment:threads-carrier-v4"],
  history_spans_material_regime_change: true,
});
assert.equal(unnormalizedRegime.eligible, false);
assert.ok(unnormalizedRegime.reasons.includes("regime_normalization_missing"));

const sameRollback = evaluateExperimentPromotion({
  policy_version: "threads-carrier-v4",
  account_key: "hermes_logistics",
  hypothesis: "Rollback must point to a different known policy",
  primary_metric: "qualified_actions",
  minimum_sample: 20,
  minimum_duration_hours: 168,
  rollback_policy_version: "threads-carrier-v4",
  guardrails: ["carrier_only"],
}, {
  account_key: "hermes_logistics",
  observed_sample: 30,
  observed_duration_hours: 200,
  primary_metric_passed: true,
  decision_evidence_refs: ["d1:experiment:threads-carrier-v4"],
});
assert.equal(sameRollback.eligible, false);
assert.ok(sameRollback.reasons.includes("rollback_policy_same_as_candidate"));

assert.ok(HISTORICAL_READ_ONLY_JOB_TYPES.includes("history.source.normalize"));
assert.ok(HISTORICAL_READ_ONLY_JOB_TYPES.includes("history.coverage.evaluate"));
assert.ok(HISTORICAL_READ_ONLY_JOB_TYPES.includes("history.social.normalize"));
assert.ok(HISTORICAL_READ_ONLY_JOB_TYPES.includes("history.experiment.evaluate"));
const primitiveSource = runHistoricalLearningPrimitive("history.source.normalize", {
  source_id: "source:primitive",
  source_family: "unit",
  source_class: "test",
  trust_tier: "VERIFIED_TEST",
});
assert.equal(primitiveSource.capability, "history.source.normalize");
assert.equal(primitiveSource.normalized_source.source_id, "source:primitive");
assert.throws(
  () => runHistoricalLearningPrimitive("history.source.normalize", "not-an-object"),
  /historical_payload_object_required/,
);

console.log("Hermes Automation Engine historical-learning primitives: ok");
