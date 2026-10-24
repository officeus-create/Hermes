const MAX_ITEMS = 1000;

export const ROLE_CONTRACTS = Object.freeze([
  Object.freeze({
    role_id: "hermes-search-growth",
    plugin_version: "0.1.6",
    contract_version: "search-snapshot-evaluate-v1",
    job_type: "search.snapshot.evaluate",
    business_lane: "search",
    permission_class: "READ_ONLY",
    semantic_required: false,
    free_ai_policy: "not_required",
    trigger: "scheduled_or_event",
    input_schema: {
      pages: "array<{url,status,canonical,indexable,in_sitemap}>",
    },
    preconditions: ["payload.pages is a bounded current snapshot"],
    deterministic_steps: [
      "validate page snapshot",
      "classify HTTP failures",
      "classify missing or mismatched canonicals",
      "classify sitemap/indexability conflicts",
    ],
    output_schema: "counts + bounded defect ids/urls",
    kpi: ["http_error_count", "canonical_defect_count", "sitemap_indexability_conflict_count"],
    owner_gate: "none",
    readback: "result_json receipt",
    failure: "fail_closed_on_invalid_payload",
    retention: "business_runtime_evidence",
  }),
  Object.freeze({
    role_id: "hermes-marketing-growth",
    plugin_version: "0.1.6",
    contract_version: "marketing-content-dedupe-v1",
    job_type: "marketing.content.dedupe.audit",
    business_lane: "marketing",
    permission_class: "READ_ONLY",
    semantic_required: false,
    free_ai_policy: "not_required",
    trigger: "before_scheduling_or_batch_review",
    input_schema: {
      items: "array<{content_id,slot_key,body}>",
    },
    preconditions: ["payload contains draft/approved-template candidates only"],
    deterministic_steps: [
      "normalize content without persisting raw body in result",
      "detect duplicate content",
      "detect duplicate slot ownership",
    ],
    output_schema: "counts + duplicate content_id groups",
    kpi: ["duplicate_content_groups", "duplicate_slot_groups"],
    owner_gate: "none",
    readback: "result_json receipt",
    failure: "fail_closed_on_invalid_payload",
    retention: "business_runtime_evidence",
  }),
  Object.freeze({
    role_id: "hermes-dispatch-os",
    plugin_version: "0.1.20",
    contract_version: "logistics-source-freshness-v1",
    job_type: "logistics.source.freshness.audit",
    business_lane: "logistics",
    permission_class: "READ_ONLY",
    semantic_required: false,
    free_ai_policy: "not_required",
    trigger: "scheduled_or_ingest_event",
    input_schema: {
      sources: "array<{source_id,last_seen_at,expires_at}>",
      max_age_minutes: "integer 1..10080 optional",
    },
    preconditions: ["source identifiers are non-secret and timestamps are bounded metadata"],
    deterministic_steps: [
      "validate source timestamps",
      "detect duplicate source ids",
      "classify stale observations",
      "classify expired observations",
    ],
    output_schema: "counts + bounded source_id groups",
    kpi: ["stale_source_count", "expired_source_count", "invalid_source_count"],
    owner_gate: "none",
    readback: "result_json receipt",
    failure: "fail_closed_on_invalid_payload",
    retention: "business_runtime_evidence",
  }),
]);

export const ROLE_CONTRACT_JOB_TYPES = Object.freeze(ROLE_CONTRACTS.map((contract) => contract.job_type));

function cleanText(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function boundedArray(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field}_array_required`);
  if (value.length > MAX_ITEMS) throw new Error(`${field}_too_large`);
  return value;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function stableRoleContractJson(contract) {
  return JSON.stringify(canonicalize(contract));
}

export async function roleContractSha256(contract) {
  const bytes = new TextEncoder().encode(stableRoleContractJson(contract));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function roleContractForJobType(jobType) {
  return ROLE_CONTRACTS.find((contract) => contract.job_type === jobType) || null;
}

function normalizedUrl(value) {
  const raw = cleanText(value, 2000);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function bounded(values, limit = 100) {
  return values.slice(0, limit);
}

function validateSearchPayload(payload) {
  const pages = boundedArray(payload?.pages, "pages");
  for (const page of pages) {
    if (!page || typeof page !== "object" || !normalizedUrl(page.url)) throw new Error("search_page_invalid");
    if (page.status != null && (!Number.isInteger(page.status) || page.status < 100 || page.status > 599)) {
      throw new Error("search_status_invalid");
    }
    if (page.canonical != null && page.canonical !== "" && !normalizedUrl(page.canonical)) throw new Error("search_canonical_invalid");
    if (page.indexable != null && typeof page.indexable !== "boolean") throw new Error("search_indexable_invalid");
    if (page.in_sitemap != null && typeof page.in_sitemap !== "boolean") throw new Error("search_in_sitemap_invalid");
  }
  return { pages };
}

function validateMarketingPayload(payload) {
  const items = boundedArray(payload?.items, "items");
  for (const item of items) {
    if (!item || typeof item !== "object") throw new Error("marketing_item_invalid");
    if (!cleanText(item.content_id, 200)) throw new Error("marketing_content_id_required");
    if (!cleanText(item.slot_key, 200)) throw new Error("marketing_slot_key_required");
    if (!cleanText(item.body, 4000)) throw new Error("marketing_body_required");
  }
  return { items };
}

function validateLogisticsPayload(payload) {
  const sources = boundedArray(payload?.sources, "sources");
  const requestedAge = payload?.max_age_minutes == null ? 60 : Number(payload.max_age_minutes);
  if (!Number.isInteger(requestedAge) || requestedAge < 1 || requestedAge > 10080) throw new Error("max_age_minutes_invalid");
  for (const source of sources) {
    if (!source || typeof source !== "object" || !cleanText(source.source_id, 200)) throw new Error("source_id_required");
  }
  return { sources, maxAgeMinutes: requestedAge };
}

export function validateRoleContractInput(jobType, payload) {
  if (jobType === "search.snapshot.evaluate") return validateSearchPayload(payload);
  if (jobType === "marketing.content.dedupe.audit") return validateMarketingPayload(payload);
  if (jobType === "logistics.source.freshness.audit") return validateLogisticsPayload(payload);
  throw new Error("role_contract_job_type_not_allowed");
}

function evaluateSearch(payload) {
  const { pages } = validateSearchPayload(payload);
  const httpErrors = [];
  const missingCanonical = [];
  const canonicalMismatch = [];
  const sitemapIndexabilityConflict = [];

  for (const page of pages) {
    const url = normalizedUrl(page.url);
    if (Number(page.status || 0) >= 400) httpErrors.push(url);
    const canonical = normalizedUrl(page.canonical);
    if (page.indexable === true && !canonical) missingCanonical.push(url);
    if (canonical && canonical !== url) canonicalMismatch.push(url);
    if (page.in_sitemap === true && page.indexable === false) sitemapIndexabilityConflict.push(url);
  }

  return {
    evaluated_count: pages.length,
    http_error_count: httpErrors.length,
    missing_canonical_count: missingCanonical.length,
    canonical_mismatch_count: canonicalMismatch.length,
    canonical_defect_count: new Set([...missingCanonical, ...canonicalMismatch]).size,
    sitemap_indexability_conflict_count: sitemapIndexabilityConflict.length,
    defects: {
      http_errors: bounded(httpErrors),
      missing_canonical: bounded(missingCanonical),
      canonical_mismatch: bounded(canonicalMismatch),
      sitemap_indexability_conflict: bounded(sitemapIndexabilityConflict),
    },
  };
}

function evaluateMarketing(payload) {
  const { items } = validateMarketingPayload(payload);
  const byBody = new Map();
  const bySlot = new Map();

  for (const item of items) {
    const id = cleanText(item.content_id, 200);
    const bodyKey = cleanText(item.body, 4000).toLowerCase();
    const slotKey = cleanText(item.slot_key, 200);
    if (!byBody.has(bodyKey)) byBody.set(bodyKey, []);
    if (!bySlot.has(slotKey)) bySlot.set(slotKey, []);
    byBody.get(bodyKey).push(id);
    bySlot.get(slotKey).push(id);
  }

  const duplicateContent = [...byBody.values()].filter((ids) => ids.length > 1).map((ids) => bounded(ids, 20));
  const duplicateSlots = [...bySlot.values()].filter((ids) => ids.length > 1).map((ids) => bounded(ids, 20));

  return {
    evaluated_count: items.length,
    duplicate_content_groups: duplicateContent.length,
    duplicate_slot_groups: duplicateSlots.length,
    duplicate_content_ids: bounded(duplicateContent, 50),
    duplicate_slot_ids: bounded(duplicateSlots, 50),
    raw_body_persisted: false,
  };
}

function evaluateLogistics(payload, observedAt) {
  const { sources, maxAgeMinutes } = validateLogisticsPayload(payload);
  const observedMs = Date.parse(observedAt);
  if (!Number.isFinite(observedMs)) throw new Error("observed_at_invalid");
  const cutoffMs = observedMs - maxAgeMinutes * 60 * 1000;

  const stale = [];
  const expired = [];
  const invalid = [];
  const seen = new Set();
  const duplicates = [];

  for (const source of sources) {
    const id = cleanText(source.source_id, 200);
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
    const lastSeenMs = Date.parse(String(source.last_seen_at || ""));
    const expiresMs = source.expires_at == null || source.expires_at === "" ? null : Date.parse(String(source.expires_at));
    if (!Number.isFinite(lastSeenMs) || (expiresMs !== null && !Number.isFinite(expiresMs))) {
      invalid.push(id);
      continue;
    }
    if (lastSeenMs < cutoffMs) stale.push(id);
    if (expiresMs !== null && expiresMs <= observedMs) expired.push(id);
  }

  return {
    evaluated_count: sources.length,
    max_age_minutes: maxAgeMinutes,
    stale_source_count: stale.length,
    expired_source_count: expired.length,
    invalid_source_count: invalid.length,
    duplicate_source_count: new Set(duplicates).size,
    stale_source_ids: bounded(stale),
    expired_source_ids: bounded(expired),
    invalid_source_ids: bounded(invalid),
    duplicate_source_ids: bounded([...new Set(duplicates)]),
  };
}

export function runRoleContractPrimitive(jobType, payload, observedAt = new Date().toISOString()) {
  if (jobType === "search.snapshot.evaluate") return evaluateSearch(payload);
  if (jobType === "marketing.content.dedupe.audit") return evaluateMarketing(payload);
  if (jobType === "logistics.source.freshness.audit") return evaluateLogistics(payload, observedAt);
  throw new Error("role_contract_job_type_not_allowed");
}
