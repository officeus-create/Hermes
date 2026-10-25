// Preflight-only, metadata-only source coverage contract for the existing HAE.
// No connectors, source content, persistence, scheduling or autonomous writes.
export const ECOSYSTEM_SOURCE_FAMILIES = Object.freeze([
  "chatgpt_history",
  "existing_chatgpt_evidence_lake",
  "claude_archive",
  "google_drive_one_brain",
  "authorized_gmail",
  "github_ci",
  "plugin_creator",
  "cloudflare_runtime",
  "employee_communications",
]);

const FAMILIES = new Set(ECOSYSTEM_SOURCE_FAMILIES);
const ACCESS = new Set(["READ_ONLY_READY", "INDEX_ONLY", "EXPORT_REQUIRED", "BLOCKED_AUTH", "UNKNOWN"]);
const SCAN = new Set(["NOT_STARTED", "PARTIAL_SCAN", "VERIFIED_SCAN", "BLOCKED"]);
const FIELDS = new Set([
  "source_family", "source_id", "access_state", "scan_state",
  "expected_count", "seen_count", "classified_count", "gap_count",
  "coverage_complete", "redaction_verified", "source_verified",
  "scanned_at", "evidence_hash",
]);
const ID = /^[a-z0-9][a-z0-9._:-]{0,119}$/;
const HASH = /^sha256:[a-f0-9]{64}$/;

function counter(value, field) {
  if (value === null || value === undefined) return null;
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`ecosystem_${field}_invalid`);
  return value;
}

export function normalizeEcosystemLearningSource(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("ecosystem_source_object_required");
  // Reject content, addresses, provider URLs and arbitrary fields rather than trying
  // to redact them after they reach a public repository or durable job receipt.
  for (const key of Object.keys(input)) if (!FIELDS.has(key)) throw new Error("ecosystem_unexpected_field");
  const family = input.source_family;
  const id = input.source_id;
  if (!FAMILIES.has(family)) throw new Error("ecosystem_source_family_invalid");
  if (typeof id !== "string" || !ID.test(id)) throw new Error("ecosystem_source_id_invalid");
  if (!ACCESS.has(input.access_state)) throw new Error("ecosystem_access_state_invalid");
  if (!SCAN.has(input.scan_state)) throw new Error("ecosystem_scan_state_invalid");
  for (const key of ["coverage_complete", "redaction_verified", "source_verified"]) {
    if (typeof input[key] !== "boolean") throw new Error(`ecosystem_${key}_required`);
  }
  const expected = counter(input.expected_count, "expected_count");
  const seen = counter(input.seen_count, "seen_count");
  const classified = counter(input.classified_count, "classified_count");
  const gaps = counter(input.gap_count, "gap_count");
  if (seen !== null && classified !== null && classified > seen) throw new Error("ecosystem_classification_overflow");
  if (expected !== null && seen !== null && seen > expected) throw new Error("ecosystem_observed_overflow");
  const scannedAt = input.scanned_at === null || input.scanned_at === undefined ? null : input.scanned_at;
  if (scannedAt !== null && (typeof scannedAt !== "string" || !/^\d{4}-\d\d-\d\dT/.test(scannedAt) || !Number.isFinite(Date.parse(scannedAt)))) {
    throw new Error("ecosystem_scanned_at_invalid");
  }
  const evidence = input.evidence_hash === null || input.evidence_hash === undefined ? null : input.evidence_hash;
  if (evidence !== null && (typeof evidence !== "string" || !HASH.test(evidence))) throw new Error("ecosystem_evidence_hash_invalid");
  const complete = input.access_state === "READ_ONLY_READY"
    && input.scan_state === "VERIFIED_SCAN"
    && input.coverage_complete
    && input.redaction_verified
    && input.source_verified
    && expected !== null && seen === expected
    && classified === seen && gaps === 0
    && scannedAt !== null && evidence !== null;
  return Object.freeze({
    source_family: family, source_id: id, access_state: input.access_state,
    scan_state: input.scan_state, expected_count: expected,
    seen_count: seen, classified_count: classified, gap_count: gaps,
    coverage_complete: complete,
    redaction_verified: input.redaction_verified,
    source_verified: input.source_verified,
    scanned_at: scannedAt, evidence_hash: evidence,
    status: complete ? "COMPLETE" : (
      input.access_state === "BLOCKED_AUTH" || input.scan_state === "BLOCKED" ? "BLOCKED" : "PARTIAL"
    ),
  });
}

export function evaluateEcosystemLearningCoverage(inputs = []) {
  if (!Array.isArray(inputs) || inputs.length > 100) throw new Error("ecosystem_sources_invalid");
  const sources = inputs.map(normalizeEcosystemLearningSource);
  const unique = new Set();
  for (const source of sources) {
    if (unique.has(source.source_id)) throw new Error("ecosystem_duplicate_source_id");
    unique.add(source.source_id);
  }
  const families = ECOSYSTEM_SOURCE_FAMILIES.map((family) => {
    const matching = sources.filter((source) => source.source_family === family);
    return {
      source_family: family,
      source_count: matching.length,
      status: matching.length === 0 ? "UNKNOWN" :
        matching.every((source) => source.status === "COMPLETE") ? "COMPLETE" :
        matching.some((source) => source.status === "BLOCKED") ? "BLOCKED" : "PARTIAL",
    };
  });
  const globalComplete = families.every((family) => family.status === "COMPLETE");
  return Object.freeze({
    status: globalComplete ? "COMPLETE" : "PARTIAL_COVERAGE",
    expected_source_families: ECOSYSTEM_SOURCE_FAMILIES.length,
    known_source_count: sources.length,
    missing_families: families.filter((family) => family.status === "UNKNOWN").map((family) => family.source_family),
    blocked_families: families.filter((family) => family.status === "BLOCKED").map((family) => family.source_family),
    complete_families: families.filter((family) => family.status === "COMPLETE").map((family) => family.source_family),
    families,
    automatic_knowledge_promotion_allowed: false,
    automatic_plugin_update_allowed: false,
    automatic_source_write_performed: false,
    paid_ai_cost_usd: 0,
  });
}

/**
 * Build bounded SOURCE_ONLY proposals for the *existing* history.source.normalize
 * primitive. Neither a trusted adapter nor HAE Queue is available in this pure
 * preflight: no job submission or CURRENT/COMPLETE status may be inferred here.
 */
export function proposeHistoricalLearningSourceJobs(inputs = []) {
  const coverage = evaluateEcosystemLearningCoverage(inputs);
  const normalized = inputs.map(normalizeEcosystemLearningSource);
  const eligible = normalized
    .filter((source) => source.access_state === "READ_ONLY_READY"
      && source.scan_state === "VERIFIED_SCAN"
      && source.source_verified && source.redaction_verified
      && source.scanned_at && source.evidence_hash);
  const limit = 10;
  const proposals = eligible.slice(0, limit).map((source) => Object.freeze({
    work_id: `HAE-LEARN:${source.source_family}:${source.source_id}:${source.evidence_hash.slice(7, 19)}`,
    job_type: "history.source.normalize",
    role_owner: "hermes-knowledge-curator",
    independent_qa_role: "hermes-qa-evidence-auditor",
    permission_class: "READ_ONLY",
    next_action: "HOLD_AUTHENTICATED_SOURCE_ADAPTER",
    automatic_submit_allowed: false,
    knowledge_promotion_allowed: false,
    plugin_update_allowed: false,
    paid_ai_cost_usd: 0,
    payload: Object.freeze({
      source_id: `${source.source_family}:${source.source_id}`,
      source_family: source.source_family,
      source_class: "ECOSYSTEM_METADATA_PREFLIGHT",
      source_uri_or_ref: null,
      source_owner: null,
      source_created_at: null,
      source_modified_at: null,
      ingested_at: source.scanned_at,
      content_hash: source.evidence_hash,
      trust_tier: "SOURCE_METADATA_NOT_INDEPENDENTLY_ADMITTED",
      freshness_class: "UNKNOWN",
      current_status: "UNKNOWN",
      coverage_start: null,
      coverage_end: null,
      coverage_limit_reason: "AWAITING_AUTHENTICATED_SOURCE_ADAPTER_AND_QA",
      parent_source_id: null,
    }),
  }));
  return Object.freeze({
    coverage_status: coverage.status,
    source_candidates_found: eligible.length,
    proposals,
    unmaterialized_count: eligible.length - proposals.length,
    automatic_submit_allowed: false,
    automatic_promotion_allowed: false,
    paid_ai_cost_usd: 0,
  });
}
