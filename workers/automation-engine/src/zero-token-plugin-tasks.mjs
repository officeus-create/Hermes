import { evaluateHaeSelfImprovementSnapshot } from "./hae-self-improvement.mjs";
import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const MAX_ITEMS = 500;

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function array(value, field, max = MAX_ITEMS) {
  if (!Array.isArray(value)) throw new Error(`${field}_array_required`);
  if (value.length > max) throw new Error(`${field}_too_large`);
  return value;
}

function iso(value, field) {
  const raw = clean(value, 80);
  const parsed = Date.parse(raw);
  if (!raw || !Number.isFinite(parsed)) throw new Error(`${field}_invalid`);
  return new Date(parsed).toISOString();
}

function integer(value, field, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field}_invalid`);
  }
  return value;
}

function numberOrNull(value, field, min = 0) {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min) throw new Error(`${field}_invalid`);
  return value;
}

function boolean(value, field) {
  if (typeof value !== "boolean") throw new Error(`${field}_required`);
  return value;
}

function bounded(values, limit = 100) {
  return values.slice(0, limit);
}

function contract({ roleId, contractVersion, jobType, lane, trigger, input, steps, output, kpi, cadenceHours = null }) {
  return Object.freeze({
    role_id: roleId,
    plugin_version: pluginRuntimeVersion(roleId),
    contract_version: contractVersion,
    job_type: jobType,
    business_lane: lane,
    permission_class: "READ_ONLY",
    semantic_required: false,
    free_ai_policy: "not_required",
    trigger,
    input_schema: input,
    runtime_config: cadenceHours == null
      ? { scheduled: false, max_cost_usd: 0 }
      : { scheduled: true, cadence_hours: cadenceHours, max_cost_usd: 0 },
    preconditions: [
      "authorized adapter supplies bounded current metadata",
      "payload contains no credentials, raw messages, customer PII or unbounded content",
    ],
    deterministic_steps: steps,
    output_schema: output,
    kpi,
    owner_gate: "authorized_source_adapter_required",
    readback: "structured result_json receipt with cost_usd=0",
    failure: "fail_closed_on_invalid_or_incomplete_evidence",
    retention: "business_runtime_evidence",
  });
}

export const ZERO_TOKEN_PLUGIN_TASK_CONTRACTS = Object.freeze([
  contract({
    roleId: "hermes-dispatch-os",
    contractVersion: "dispatch-daily-closeout-v1",
    jobType: "dispatch.daily.closeout.audit",
    lane: "logistics",
    trigger: "daily_authorized_operations_snapshot",
    input: { business_date: "YYYY-MM-DD", coverage_complete: "boolean", orders: "bounded minimized order metadata" },
    steps: ["deduplicate order ids", "sum declared cents", "classify missing pickup/delivery evidence"],
    output: "coverage + order/value/commission counts + exception ids",
    kpi: ["unique_order_count", "missing_date_count", "declared_value_cents", "commission_cents"],
  }),
  contract({
    roleId: "hermes-knowledge-curator",
    contractVersion: "knowledge-evidence-audit-v1",
    jobType: "knowledge.evidence.audit",
    lane: "knowledge",
    trigger: "authorized_minimized_evidence_snapshot",
    input: { observed_at: "ISO-8601", evidence: "bounded fingerprints and source references; no message bodies" },
    steps: ["deduplicate evidence fingerprints", "classify stale and unknown evidence", "preserve source references"],
    output: "unique/duplicate/stale/unknown evidence ids",
    kpi: ["unique_evidence_count", "duplicate_count", "stale_count", "unknown_count"],
  }),
  contract({
    roleId: "hermes-automatic-engineer",
    contractVersion: "technology-release-radar-v1",
    jobType: "technology.release.radar",
    lane: "technology",
    trigger: "verified_release_metadata_snapshot",
    input: { observed_at: "ISO-8601", components: "current/candidate version metadata from allowlisted sources" },
    steps: ["compare numeric versions", "separate security candidates", "preserve UNKNOWN when versions are incomparable"],
    output: "upgrade/security/unknown component ids",
    kpi: ["upgrade_candidate_count", "security_candidate_count", "unknown_count"],
  }),
  contract({
    roleId: "hermes-automatic-engineer",
    contractVersion: "ai-gateway-readiness-v1",
    jobType: "ai.gateway.readiness.audit",
    lane: "automation",
    trigger: "runtime_configuration_snapshot",
    input: { binding_ready: "boolean", gateway_id_present: "boolean", free_provider_ready: "boolean", paid_fallback_enabled: "boolean", budget_usd: "number" },
    steps: ["verify binding and gateway identity", "verify zero-cost route", "reject automatic paid fallback"],
    output: "READY | BLOCKED with bounded reasons",
    kpi: ["ready", "blocker_count", "max_cost_usd"],
    cadenceHours: 24,
  }),
  contract({
    roleId: "hermes-marketing-growth",
    contractVersion: "growth-error-closure-v1",
    jobType: "growth.error.closure.audit",
    lane: "growth",
    trigger: "verified_error_registry_snapshot",
    input: { observed_at: "ISO-8601", errors: "bounded status/owner/evidence metadata" },
    steps: ["classify unresolved and stale errors", "reject closure without evidence", "identify one bounded next candidate"],
    output: "open/stale/unowned/closure-candidate ids",
    kpi: ["open_count", "stale_count", "unowned_count", "closure_candidate_count"],
  }),
  contract({
    roleId: "hermes-dispatch-os",
    contractVersion: "car-hauling-market-snapshot-v1",
    jobType: "market.car-hauling.snapshot.evaluate",
    lane: "logistics",
    trigger: "weekly_verified_market_snapshot",
    input: { current: "bounded numeric market observations", previous: "optional comparable observations" },
    steps: ["validate source timestamps", "calculate deltas only for comparable metrics", "preserve missing metrics as UNKNOWN"],
    output: "current values + deltas + unknown metric names",
    kpi: ["comparable_metric_count", "unknown_metric_count"],
  }),
  contract({
    roleId: "hermes-marketing-growth",
    contractVersion: "internet-mentions-audit-v1",
    jobType: "marketing.mentions.audit",
    lane: "marketing",
    trigger: "verified_public_mention_snapshot",
    input: { observed_at: "ISO-8601", mentions: "bounded public URL/fingerprint/classification metadata" },
    steps: ["deduplicate fingerprints", "separate new and unknown classifications", "store no page body"],
    output: "new/duplicate/unknown mention ids",
    kpi: ["unique_mention_count", "duplicate_count", "unknown_count"],
  }),
  contract({
    roleId: "hermes-academy",
    contractVersion: "work-english-practice-v1",
    jobType: "academy.english.practice.build",
    lane: "academy",
    trigger: "daily_owner_learning_schedule",
    input: { lesson_date: "YYYY-MM-DD", track: "LOGISTICS | SALES | OPERATIONS" },
    steps: ["select deterministic lesson rotation", "return bounded phrases and practice prompts", "make no external call"],
    output: "lesson id + phrases + practice prompts",
    kpi: ["phrase_count", "practice_prompt_count", "cost_usd"],
    cadenceHours: 24,
  }),
  contract({
    roleId: "hermes-automatic-engineer",
    contractVersion: "hae-self-improvement-audit-v1",
    jobType: "hae.self.improvement.audit",
    lane: "automation",
    trigger: "verified_hae_evidence_snapshot",
    input: { observed_at: "ISO-8601", coverage_complete: "boolean", findings: "bounded verified GitHub/CI metadata only" },
    steps: ["require complete evidence coverage before routing", "prioritize verified open defects", "respect active writer locks", "route repair ownership to Automatic Engineer and independent review to QA"],
    output: "repair candidates + next WORK_ID + HOLD_REPAIR or NO_ACTION",
    kpi: ["repair_candidate_count", "next_work_id", "cost_usd"],
    cadenceHours: 6,
  }),
  contract({
    roleId: "hermes-automatic-engineer",
    contractVersion: "hae-self-repair-packet-v1",
    jobType: "hae.self.repair.packet",
    lane: "automation",
    trigger: "downstream_from_hae_self_improvement_audit",
    input: { work_id: "HAE-SELF:*", finding_id: "verified finding id", artifact_key: "bounded repository path" },
    steps: ["freeze repair WORK_ID and artifact", "bind current repair and independent-review plugin versions", "emit required verification gates", "hold before source mutation"],
    output: "HOLD_REPAIR packet with owner/version/checklist",
    kpi: ["work_id", "repair_state", "cost_usd"],
  }),
]);

const JOB_TYPES = new Set(ZERO_TOKEN_PLUGIN_TASK_CONTRACTS.map((item) => item.job_type));

function normalizeDispatch(payload) {
  const businessDate = clean(payload?.business_date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(businessDate)) throw new Error("dispatch_business_date_invalid");
  const coverageComplete = boolean(payload?.coverage_complete, "dispatch_coverage_complete");
  const orders = array(payload?.orders, "dispatch_orders").map((item) => {
    const orderId = clean(item?.order_id, 120);
    if (!orderId) throw new Error("dispatch_order_id_required");
    return {
      order_id: orderId,
      value_cents: integer(item?.value_cents, "dispatch_value_cents"),
      commission_cents: integer(item?.commission_cents, "dispatch_commission_cents"),
      pickup_at: item?.pickup_at == null ? null : iso(item.pickup_at, "dispatch_pickup_at"),
      delivery_at: item?.delivery_at == null ? null : iso(item.delivery_at, "dispatch_delivery_at"),
      cancelled: boolean(item?.cancelled, "dispatch_cancelled"),
    };
  });
  return { business_date: businessDate, coverage_complete: coverageComplete, orders };
}

function runDispatch(payload) {
  const input = normalizeDispatch(payload);
  const byId = new Map();
  const duplicates = new Set();
  for (const item of input.orders) {
    if (byId.has(item.order_id)) duplicates.add(item.order_id);
    else byId.set(item.order_id, item);
  }
  const active = [...byId.values()].filter((item) => !item.cancelled);
  const missing = active.filter((item) => !item.pickup_at || !item.delivery_at).map((item) => item.order_id);
  return {
    business_date: input.business_date,
    coverage_status: input.coverage_complete ? "COMPLETE" : "PARTIAL",
    unique_order_count: byId.size,
    active_order_count: active.length,
    duplicate_order_count: duplicates.size,
    declared_value_cents: active.reduce((sum, item) => sum + item.value_cents, 0),
    commission_cents: active.reduce((sum, item) => sum + item.commission_cents, 0),
    missing_date_count: missing.length,
    missing_date_order_ids: bounded(missing),
    confirmed_bank_revenue_cents: null,
    cost_usd: 0,
  };
}

function normalizeEvidence(payload) {
  const observedAt = iso(payload?.observed_at, "knowledge_observed_at");
  const evidence = array(payload?.evidence, "knowledge_evidence").map((item) => {
    const evidenceId = clean(item?.evidence_id, 120);
    const fingerprint = clean(item?.fingerprint, 80);
    const sourceRef = clean(item?.source_ref, 500);
    const status = clean(item?.status, 40).toUpperCase();
    if (!evidenceId || !/^[0-9a-f]{64}$/.test(fingerprint)) throw new Error("knowledge_evidence_invalid");
    if (!/^(?:drive|github|gmail-metadata):\/\//.test(sourceRef)) throw new Error("knowledge_source_ref_invalid");
    if (!new Set(["VERIFIED", "HOLD", "UNKNOWN"]).has(status)) throw new Error("knowledge_status_invalid");
    return { evidence_id: evidenceId, fingerprint, source_ref: sourceRef, status, observed_at: iso(item?.observed_at, "knowledge_item_observed_at") };
  });
  return { observed_at: observedAt, evidence };
}

function runEvidence(payload) {
  const input = normalizeEvidence(payload);
  const cutoff = Date.parse(input.observed_at) - 30 * 24 * 60 * 60 * 1000;
  const byFingerprint = new Map();
  const duplicates = [];
  for (const item of input.evidence) {
    if (byFingerprint.has(item.fingerprint)) duplicates.push(item.evidence_id);
    else byFingerprint.set(item.fingerprint, item);
  }
  const unique = [...byFingerprint.values()];
  const stale = unique.filter((item) => Date.parse(item.observed_at) < cutoff).map((item) => item.evidence_id);
  const unknown = unique.filter((item) => item.status === "UNKNOWN").map((item) => item.evidence_id);
  return { unique_evidence_count: unique.length, duplicate_count: duplicates.length, stale_count: stale.length, unknown_count: unknown.length, duplicate_evidence_ids: bounded(duplicates), stale_evidence_ids: bounded(stale), unknown_evidence_ids: bounded(unknown), raw_message_content_stored: false, cost_usd: 0 };
}

function versionParts(value) {
  const raw = clean(value, 80).replace(/^v/i, "").split("-")[0];
  if (!/^\d+(?:\.\d+){0,3}$/.test(raw)) return null;
  return raw.split(".").map(Number);
}

function compareVersion(left, right) {
  const a = versionParts(left); const b = versionParts(right);
  if (!a || !b) return null;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const delta = (a[index] || 0) - (b[index] || 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

function normalizeTechnology(payload) {
  const observedAt = iso(payload?.observed_at, "technology_observed_at");
  const components = array(payload?.components, "technology_components", 100).map((item) => {
    const componentId = clean(item?.component_id, 120);
    const currentVersion = clean(item?.current_version, 80);
    const candidateVersion = clean(item?.candidate_version, 80);
    const sourceRef = clean(item?.source_ref, 500);
    if (!componentId || !currentVersion || !candidateVersion || !/^https:\/\//.test(sourceRef)) throw new Error("technology_component_invalid");
    return { component_id: componentId, current_version: currentVersion, candidate_version: candidateVersion, security_update: boolean(item?.security_update, "technology_security_update"), source_ref: sourceRef };
  });
  return { observed_at: observedAt, components };
}

function runTechnology(payload) {
  const input = normalizeTechnology(payload);
  const upgrades = []; const security = []; const unknown = [];
  for (const item of input.components) {
    const comparison = compareVersion(item.candidate_version, item.current_version);
    if (comparison == null) unknown.push(item.component_id);
    else if (comparison > 0) {
      upgrades.push(item.component_id);
      if (item.security_update) security.push(item.component_id);
    }
  }
  return { evaluated_count: input.components.length, upgrade_candidate_count: upgrades.length, security_candidate_count: security.length, unknown_count: unknown.length, upgrade_component_ids: bounded(upgrades), security_component_ids: bounded(security), unknown_component_ids: bounded(unknown), automatic_upgrade_performed: false, cost_usd: 0 };
}

function normalizeGateway(payload) {
  return {
    binding_ready: boolean(payload?.binding_ready, "gateway_binding_ready"),
    gateway_id_present: boolean(payload?.gateway_id_present, "gateway_id_present"),
    free_provider_ready: boolean(payload?.free_provider_ready, "gateway_free_provider_ready"),
    paid_fallback_enabled: boolean(payload?.paid_fallback_enabled, "gateway_paid_fallback_enabled"),
    budget_usd: numberOrNull(payload?.budget_usd, "gateway_budget_usd"),
  };
}

function runGateway(payload) {
  const input = normalizeGateway(payload);
  const blockers = [];
  if (!input.binding_ready) blockers.push("AI_BINDING_MISSING");
  if (!input.gateway_id_present) blockers.push("GATEWAY_ID_MISSING");
  if (!input.free_provider_ready) blockers.push("FREE_PROVIDER_UNAVAILABLE");
  if (input.paid_fallback_enabled) blockers.push("PAID_FALLBACK_ENABLED");
  if (input.budget_usd !== 0) blockers.push("NONZERO_BUDGET");
  return { readiness: blockers.length ? "BLOCKED" : "READY", ready: blockers.length === 0, blocker_count: blockers.length, blockers, max_cost_usd: 0, cost_usd: 0 };
}

function normalizeErrors(payload) {
  const observedAt = iso(payload?.observed_at, "growth_observed_at");
  const errors = array(payload?.errors, "growth_errors").map((item) => {
    const errorId = clean(item?.error_id, 120);
    const status = clean(item?.status, 40).toUpperCase();
    if (!errorId || !new Set(["OPEN", "BLOCKED", "FIXED", "CLOSED", "UNKNOWN"]).has(status)) throw new Error("growth_error_invalid");
    return { error_id: errorId, status, owner: clean(item?.owner, 120) || null, updated_at: iso(item?.updated_at, "growth_error_updated_at"), evidence_ref: clean(item?.evidence_ref, 500) || null, production_verified: boolean(item?.production_verified, "growth_production_verified") };
  });
  return { observed_at: observedAt, errors };
}

function runErrors(payload) {
  const input = normalizeErrors(payload);
  const cutoff = Date.parse(input.observed_at) - 7 * 24 * 60 * 60 * 1000;
  const open = input.errors.filter((item) => !["CLOSED"].includes(item.status));
  const stale = open.filter((item) => Date.parse(item.updated_at) < cutoff).map((item) => item.error_id);
  const unowned = open.filter((item) => !item.owner).map((item) => item.error_id);
  const candidates = input.errors.filter((item) => item.status === "FIXED" && item.production_verified && item.evidence_ref).map((item) => item.error_id);
  return { open_count: open.length, stale_count: stale.length, unowned_count: unowned.length, closure_candidate_count: candidates.length, stale_error_ids: bounded(stale), unowned_error_ids: bounded(unowned), closure_candidate_ids: bounded(candidates), automatic_closure_performed: false, cost_usd: 0 };
}

const MARKET_METRICS = ["dealer_demand_index", "shipper_demand_index", "carrier_availability_index", "rate_cents_per_mile"];

function normalizeMarketSnapshot(value, prefix) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${prefix}_snapshot_required`);
  const result = { observed_at: iso(value.observed_at, `${prefix}_observed_at`) };
  for (const key of MARKET_METRICS) result[key] = numberOrNull(value[key], `${prefix}_${key}`);
  return result;
}

function runMarket(payload) {
  const current = normalizeMarketSnapshot(payload?.current, "market_current");
  const previous = payload?.previous == null ? null : normalizeMarketSnapshot(payload.previous, "market_previous");
  const deltas = {}; const unknown = [];
  for (const key of MARKET_METRICS) {
    if (!previous || current[key] == null || previous[key] == null) unknown.push(key);
    else deltas[key] = current[key] - previous[key];
  }
  return { observed_at: current.observed_at, current: Object.fromEntries(MARKET_METRICS.map((key) => [key, current[key]])), deltas, comparable_metric_count: Object.keys(deltas).length, unknown_metric_count: unknown.length, unknown_metrics: unknown, recommendations_generated: false, cost_usd: 0 };
}

function normalizeMentions(payload) {
  const observedAt = iso(payload?.observed_at, "mentions_observed_at");
  const mentions = array(payload?.mentions, "mentions_items").map((item) => {
    const mentionId = clean(item?.mention_id, 120); const fingerprint = clean(item?.fingerprint, 80); const sourceUrl = clean(item?.source_url, 1000); const classification = clean(item?.classification, 40).toUpperCase();
    if (!mentionId || !/^[0-9a-f]{64}$/.test(fingerprint) || !/^https:\/\//.test(sourceUrl)) throw new Error("mention_invalid");
    if (!new Set(["PUBLICATION", "REVIEW", "SOCIAL", "UNKNOWN"]).has(classification)) throw new Error("mention_classification_invalid");
    return { mention_id: mentionId, fingerprint, source_url: sourceUrl, classification, first_seen_at: iso(item?.first_seen_at, "mention_first_seen_at") };
  });
  return { observed_at: observedAt, mentions };
}

function runMentions(payload) {
  const input = normalizeMentions(payload); const seen = new Set(); const duplicates = []; const unique = [];
  for (const item of input.mentions) { if (seen.has(item.fingerprint)) duplicates.push(item.mention_id); else { seen.add(item.fingerprint); unique.push(item); } }
  const unknown = unique.filter((item) => item.classification === "UNKNOWN").map((item) => item.mention_id);
  return { unique_mention_count: unique.length, duplicate_count: duplicates.length, unknown_count: unknown.length, new_mention_ids: bounded(unique.map((item) => item.mention_id)), duplicate_mention_ids: bounded(duplicates), unknown_mention_ids: bounded(unknown), raw_page_content_stored: false, cost_usd: 0 };
}

const ENGLISH_LESSONS = Object.freeze({
  LOGISTICS: Object.freeze([
    ["pickup window", "delivery appointment", "proof of delivery"],
    ["available capacity", "rate confirmation", "estimated arrival"],
  ]),
  SALES: Object.freeze([
    ["qualification call", "next step", "follow-up date"],
    ["business need", "decision maker", "written proposal"],
  ]),
  OPERATIONS: Object.freeze([
    ["current blocker", "responsible owner", "completion evidence"],
    ["priority queue", "service level", "verified outcome"],
  ]),
});

function runEnglish(payload) {
  const lessonDate = clean(payload?.lesson_date, 10); const track = clean(payload?.track, 20).toUpperCase();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lessonDate)) throw new Error("academy_lesson_date_invalid");
  if (!ENGLISH_LESSONS[track]) throw new Error("academy_track_invalid");
  const day = Math.floor(Date.parse(`${lessonDate}T00:00:00Z`) / 86400000);
  const phrases = ENGLISH_LESSONS[track][day % ENGLISH_LESSONS[track].length];
  return { lesson_id: `${track.toLowerCase()}:${lessonDate}`, track, phrases, practice_prompts: phrases.map((phrase) => `Use “${phrase}” in one work sentence.`), phrase_count: phrases.length, practice_prompt_count: phrases.length, cost_usd: 0 };
}

function normalizeSelfRepairPacket(payload) {
  const workId = clean(payload?.work_id, 180);
  const findingId = clean(payload?.finding_id, 160);
  const artifactKey = clean(payload?.artifact_key, 240);
  if (!/^HAE-SELF:/.test(workId)) throw new Error("hae_repair_work_id_invalid");
  if (!findingId) throw new Error("hae_repair_finding_id_required");
  if (!artifactKey || artifactKey.includes("..") || artifactKey.startsWith("/")) throw new Error("hae_repair_artifact_key_invalid");
  return { work_id: workId, finding_id: findingId, artifact_key: artifactKey };
}

function runSelfRepairPacket(payload) {
  const input = normalizeSelfRepairPacket(payload);
  return {
    ...input,
    repair_state: "HOLD_REPAIR",
    repair_owner: {
      role_id: "hermes-automatic-engineer",
      plugin_version: pluginRuntimeVersion("hermes-automatic-engineer"),
    },
    independent_review_owner: {
      role_id: "hermes-qa-evidence-auditor",
      plugin_version: pluginRuntimeVersion("hermes-qa-evidence-auditor"),
    },
    required_checks: [
      "bounded source diff on one active-writer branch",
      "exact-head HAE contract tests",
      "repository-required CI",
      "independent QA evidence before release",
    ],
    source_change_performed: false,
    automatic_merge_performed: false,
    automatic_deploy_performed: false,
    cost_usd: 0,
  };
}

export function validateZeroTokenPluginTaskInput(jobType, payload) {
  if (jobType === "dispatch.daily.closeout.audit") return normalizeDispatch(payload);
  if (jobType === "knowledge.evidence.audit") return normalizeEvidence(payload);
  if (jobType === "technology.release.radar") return normalizeTechnology(payload);
  if (jobType === "ai.gateway.readiness.audit") return normalizeGateway(payload);
  if (jobType === "growth.error.closure.audit") return normalizeErrors(payload);
  if (jobType === "market.car-hauling.snapshot.evaluate") return { current: normalizeMarketSnapshot(payload?.current, "market_current"), previous: payload?.previous == null ? null : normalizeMarketSnapshot(payload.previous, "market_previous") };
  if (jobType === "marketing.mentions.audit") return normalizeMentions(payload);
  if (jobType === "academy.english.practice.build") return runEnglish(payload);
  if (jobType === "hae.self.improvement.audit") return evaluateHaeSelfImprovementSnapshot(payload);
  if (jobType === "hae.self.repair.packet") return normalizeSelfRepairPacket(payload);
  throw new Error("zero_token_plugin_job_type_not_allowed");
}

export function runZeroTokenPluginTask(jobType, payload) {
  if (jobType === "dispatch.daily.closeout.audit") return runDispatch(payload);
  if (jobType === "knowledge.evidence.audit") return runEvidence(payload);
  if (jobType === "technology.release.radar") return runTechnology(payload);
  if (jobType === "ai.gateway.readiness.audit") return runGateway(payload);
  if (jobType === "growth.error.closure.audit") return runErrors(payload);
  if (jobType === "market.car-hauling.snapshot.evaluate") return runMarket(payload);
  if (jobType === "marketing.mentions.audit") return runMentions(payload);
  if (jobType === "academy.english.practice.build") return runEnglish(payload);
  if (jobType === "hae.self.improvement.audit") return evaluateHaeSelfImprovementSnapshot(payload);
  if (jobType === "hae.self.repair.packet") return runSelfRepairPacket(payload);
  throw new Error("zero_token_plugin_job_type_not_allowed");
}

export function isZeroTokenPluginTask(jobType) {
  return JOB_TYPES.has(jobType);
}
