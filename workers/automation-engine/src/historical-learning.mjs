const SOURCE_STATUS = new Set(["CURRENT", "SUPERSEDED", "UNKNOWN"]);
const COVERAGE_STATUS = new Set(["COMPLETE", "PARTIAL", "BLOCKED", "UNKNOWN"]);
const SOCIAL_KINDS = new Set(["ROOT", "REPOST", "DIRECT_OUTREACH", "OWN_REPLY", "INBOUND_REPLY"]);
const PROXY_ONLY_METRICS = new Set(["views", "view", "reach", "impressions", "likes", "engagement"]);

export const HISTORICAL_READ_ONLY_JOB_TYPES = Object.freeze([
  "history.source.normalize",
  "history.coverage.evaluate",
  "history.social.normalize",
  "history.experiment.evaluate",
]);

function requiredText(value, field, max = 500) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`historical_${field}_required`);
  return text.slice(0, max);
}

function optionalText(value, max = 1000) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function nullableNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function nullableNonNegativeNumber(value) {
  const number = nullableNumber(value);
  return number === null || number < 0 ? null : number;
}

function nullableNonNegativeInteger(value) {
  const number = nullableNonNegativeNumber(value);
  return number === null || !Number.isInteger(number) ? null : number;
}

function nullableInteger(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  const number = nullableNumber(value);
  if (number === null || !Number.isInteger(number) || number < min || number > max) return null;
  return number;
}

function timestampOrNull(value) {
  if (!value) return null;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function timestampFieldOrNull(value, field) {
  if (value === null || value === undefined || value === "") return null;
  const timestamp = timestampOrNull(value);
  if (!timestamp) throw new Error(`historical_${field}_invalid`);
  return timestamp;
}

function normalizeBody(value) {
  return typeof value === "string"
    ? value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/@[a-z0-9_.]+/gi, " ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
    : "";
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function normalizedBodyHash(body) {
  const normalized = normalizeBody(body);
  return normalized ? `fnv1a:${fnv1a(normalized)}` : null;
}

export function normalizeHistoricalSource(input = {}) {
  const currentStatus = SOURCE_STATUS.has(input.current_status) ? input.current_status : "UNKNOWN";
  const observedStart = timestampFieldOrNull(input.coverage_start, "coverage_start");
  const observedEnd = timestampFieldOrNull(input.coverage_end, "coverage_end");

  if (observedStart && observedEnd && observedStart > observedEnd) {
    throw new Error("historical_coverage_range_invalid");
  }

  return {
    source_id: requiredText(input.source_id, "source_id", 240),
    source_family: requiredText(input.source_family, "source_family", 120),
    source_class: requiredText(input.source_class, "source_class", 120),
    source_uri_or_ref: optionalText(input.source_uri_or_ref, 1000),
    source_owner: optionalText(input.source_owner, 240),
    source_created_at: timestampFieldOrNull(input.source_created_at, "source_created_at"),
    source_modified_at: timestampFieldOrNull(input.source_modified_at, "source_modified_at"),
    ingested_at: input.ingested_at === null || input.ingested_at === undefined || input.ingested_at === ""
      ? new Date().toISOString()
      : timestampFieldOrNull(input.ingested_at, "ingested_at"),
    content_hash: optionalText(input.content_hash, 240),
    trust_tier: requiredText(input.trust_tier, "trust_tier", 80),
    freshness_class: optionalText(input.freshness_class, 80),
    current_status: currentStatus,
    coverage_start: observedStart,
    coverage_end: observedEnd,
    coverage_limit_reason: optionalText(input.coverage_limit_reason, 500),
    parent_source_id: optionalText(input.parent_source_id, 240),
  };
}

export function buildCoverageRecord(input = {}) {
  const gaps = Array.isArray(input.known_gaps)
    ? input.known_gaps.map((gap) => ({
      start: timestampFieldOrNull(gap?.start, "gap_start"),
      end: timestampFieldOrNull(gap?.end, "gap_end"),
      reason: optionalText(gap?.reason, 500),
      status: optionalText(gap?.status, 80),
    }))
    : [];

  const itemsSeen = nullableInteger(input.items_seen, 0) ?? 0;
  const itemsClassified = nullableInteger(input.items_classified, 0) ?? 0;
  const unclassifiedRelevant = nullableInteger(input.items_unclassified_relevant, 0);
  const observedStart = timestampFieldOrNull(input.observed_start, "observed_start");
  const observedEnd = timestampFieldOrNull(input.observed_end, "observed_end");
  const explicitLastScanAt = timestampFieldOrNull(input.last_scan_at, "last_scan_at");
  const everyGapAccounted = gaps.every((gap) => Boolean(gap.reason && gap.status));
  const hasCoverageEvidence = Boolean(
    explicitLastScanAt || observedStart || observedEnd || itemsSeen > 0 || itemsClassified > 0 || gaps.length > 0
  );

  if (observedStart && observedEnd && observedStart > observedEnd) {
    throw new Error("historical_coverage_range_invalid");
  }
  if (itemsClassified > itemsSeen || (unclassifiedRelevant !== null && unclassifiedRelevant > itemsSeen)) {
    throw new Error("historical_coverage_counts_invalid");
  }

  let status = "UNKNOWN";
  if (input.blocked === true) status = "BLOCKED";
  else if (hasCoverageEvidence && unclassifiedRelevant === 0 && everyGapAccounted) status = "COMPLETE";
  else if (hasCoverageEvidence || unclassifiedRelevant !== null) status = "PARTIAL";

  if (!COVERAGE_STATUS.has(status)) status = "UNKNOWN";

  return {
    coverage_id: requiredText(input.coverage_id, "coverage_id", 240),
    source_family: requiredText(input.source_family, "source_family", 120),
    business_lane: requiredText(input.business_lane, "business_lane", 120),
    expected_start: timestampFieldOrNull(input.expected_start, "expected_start"),
    observed_start: observedStart,
    observed_end: observedEnd,
    items_seen: itemsSeen,
    items_classified: itemsClassified,
    items_unclassified_relevant: unclassifiedRelevant,
    known_gaps: gaps,
    last_scan_at: explicitLastScanAt,
    status,
  };
}

export function classifySocialObservation(input = {}) {
  const ownReply = input.is_own_reply === true;
  const inboundReply = input.is_inbound_reply === true;
  if (ownReply && inboundReply) throw new Error("historical_reply_identity_conflict");
  if (ownReply) return "OWN_REPLY";
  if (inboundReply) return "INBOUND_REPLY";
  if (String(input.media_type || "").toUpperCase() === "REPOST_FACADE" || input.is_repost === true) {
    return "REPOST";
  }
  if (String(input.body || input.post_text || "").trim().startsWith("@")) return "DIRECT_OUTREACH";
  return "ROOT";
}

export function normalizeSocialObservation(input = {}) {
  const kind = classifySocialObservation(input);
  if (!SOCIAL_KINDS.has(kind)) throw new Error("historical_social_kind_invalid");

  const body = typeof input.body === "string" ? input.body : (typeof input.post_text === "string" ? input.post_text : "");
  const marketLocalHour = nullableInteger(input.market_local_hour, 0, 23);

  return {
    observation_id: requiredText(input.observation_id, "observation_id", 240),
    source_id: requiredText(input.source_id, "source_id", 240),
    account_key: requiredText(input.account_key, "account_key", 120),
    platform: requiredText(input.platform, "platform", 80),
    provider_post_id: optionalText(input.provider_post_id, 240),
    permalink: optionalText(input.permalink, 1000),
    published_at_utc: timestampFieldOrNull(input.published_at_utc, "published_at_utc"),
    target_market: optionalText(input.target_market, 120),
    locale: optionalText(input.locale, 80),
    market_local_hour: marketLocalHour,
    weekday: optionalText(input.weekday, 32),
    media_type: optionalText(input.media_type, 80),
    observation_kind: kind,
    normalized_body_hash: normalizedBodyHash(body),
    duplicate_family: optionalText(input.duplicate_family, 240) || normalizedBodyHash(body),
    topic_cluster: optionalText(input.topic_cluster, 120),
    cta_class: optionalText(input.cta_class, 120),
    link_state: optionalText(input.link_state, 80),
    link_domain: optionalText(input.link_domain, 240),
    campaign_phase: optionalText(input.campaign_phase, 120),
    prior_1h_count: nullableInteger(input.prior_1h_count, 0),
    prior_6h_count: nullableInteger(input.prior_6h_count, 0),
    prior_24h_count: nullableInteger(input.prior_24h_count, 0),
    account_regime: optionalText(input.account_regime, 120),
    views: nullableNonNegativeInteger(input.views),
    likes: nullableNonNegativeInteger(input.likes),
    inbound_replies: nullableNonNegativeInteger(input.inbound_replies),
    own_replies: nullableNonNegativeInteger(input.own_replies),
    reposts: nullableNonNegativeInteger(input.reposts),
    shares: nullableNonNegativeInteger(input.shares),
    quotes: nullableNonNegativeInteger(input.quotes),
    qualified_actions: nullableNonNegativeInteger(input.qualified_actions),
    revenue_evidence: nullableNumber(input.revenue_evidence),
    metrics_observed_at: timestampFieldOrNull(input.metrics_observed_at, "metrics_observed_at"),
  };
}

export function evaluateExperimentPromotion(experiment = {}, evidence = {}) {
  const reasons = [];
  const policyVersion = optionalText(experiment.policy_version, 120);
  const hypothesis = optionalText(experiment.hypothesis, 1000);
  const primaryMetric = optionalText(experiment.primary_metric, 120)?.toLowerCase() || null;
  const minimumSample = nullableInteger(experiment.minimum_sample, 0);
  const minimumDurationHours = nullableNumber(experiment.minimum_duration_hours);
  const observedSample = nullableInteger(evidence.observed_sample, 0) ?? 0;
  const observedDurationHours = nullableNumber(evidence.observed_duration_hours) ?? 0;
  const rollbackPolicy = optionalText(experiment.rollback_policy_version, 120);
  const experimentAccountKey = optionalText(experiment.account_key, 120);
  const guardrails = Array.isArray(experiment.guardrails)
    ? experiment.guardrails.map((value) => optionalText(value, 160)).filter(Boolean)
    : [];
  const decisionEvidenceRefs = Array.isArray(evidence.decision_evidence_refs)
    ? evidence.decision_evidence_refs.map((value) => optionalText(value, 500)).filter(Boolean)
    : [];

  if (!policyVersion) reasons.push("policy_version_missing");
  if (!experimentAccountKey) reasons.push("account_scope_missing");
  if (!hypothesis) reasons.push("hypothesis_missing");
  if (!primaryMetric) reasons.push("primary_metric_missing");
  if (minimumSample === null || minimumSample < 2) reasons.push("minimum_sample_too_small");
  else if (observedSample < minimumSample) reasons.push("minimum_sample_not_met");
  if (minimumDurationHours === null || minimumDurationHours <= 0) reasons.push("minimum_duration_missing");
  else if (observedDurationHours < minimumDurationHours) reasons.push("minimum_duration_not_met");
  if (!rollbackPolicy) reasons.push("rollback_policy_missing");
  else if (policyVersion && rollbackPolicy === policyVersion) reasons.push("rollback_policy_same_as_candidate");
  if (guardrails.length === 0) reasons.push("guardrails_missing");
  if (evidence.single_outlier_only === true) reasons.push("single_outlier_only");
  if (evidence.primary_metric_passed !== true) {
    reasons.push(evidence.primary_metric_passed === false ? "primary_metric_failed" : "primary_metric_result_not_proven");
  }
  if (decisionEvidenceRefs.length === 0) reasons.push("decision_evidence_missing");
  if (evidence.history_spans_material_regime_change === true && evidence.regime_normalization_applied !== true) {
    reasons.push("regime_normalization_missing");
  }
  if (evidence.downstream_evidence_available === true && primaryMetric && PROXY_ONLY_METRICS.has(primaryMetric)) {
    reasons.push("proxy_metric_used_despite_downstream_evidence");
  }
  if (evidence.account_key && experimentAccountKey && evidence.account_key !== experimentAccountKey) {
    reasons.push("account_scope_mismatch");
  }
  if (experiment.requires_external_write === true && evidence.current_policy_allows_external_write !== true) {
    reasons.push(
      evidence.current_policy_allows_external_write === false
        ? "current_policy_blocks_external_write"
        : "current_policy_external_write_not_proven"
    );
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    policy_version: policyVersion,
    rollback_policy_version: rollbackPolicy,
    observed_sample: observedSample,
    observed_duration_hours: observedDurationHours,
    decision_evidence_refs: decisionEvidenceRefs,
  };
}

export function runHistoricalLearningPrimitive(jobType, payload = {}) {
  if (!HISTORICAL_READ_ONLY_JOB_TYPES.includes(jobType)) {
    throw new Error("historical_job_type_not_allowed");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("historical_payload_object_required");
  }
  if (jobType === "history.source.normalize") {
    return { capability: jobType, normalized_source: normalizeHistoricalSource(payload) };
  }
  if (jobType === "history.coverage.evaluate") {
    return { capability: jobType, coverage: buildCoverageRecord(payload) };
  }
  if (jobType === "history.social.normalize") {
    return { capability: jobType, observation: normalizeSocialObservation(payload) };
  }
  if (jobType === "history.experiment.evaluate") {
    return {
      capability: jobType,
      evaluation: evaluateExperimentPromotion(payload.experiment || {}, payload.evidence || {}),
    };
  }
  throw new Error("historical_job_type_not_allowed");
}
