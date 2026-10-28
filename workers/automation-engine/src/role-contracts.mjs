import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";
import {
  normalizeWorkPortfolioSnapshot,
  reconcileWorkPortfolioSnapshot,
} from "./work-portfolio.mjs";
import {
  isZeroTokenPluginTask,
  runZeroTokenPluginTask,
  validateZeroTokenPluginTaskInput,
  ZERO_TOKEN_PLUGIN_TASK_CONTRACTS,
} from "./zero-token-plugin-tasks.mjs";

const MAX_ITEMS = 1000;

export const ROLE_CONTRACTS = Object.freeze([
  Object.freeze({
    role_id: "hermes-search-growth",
    plugin_version: pluginRuntimeVersion("hermes-search-growth"),
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
    runtime_config: {
      target_urls: [
        "https://hermeslogisticsus.com/",
        "https://hermeslogisticsus.com/load-board/",
        "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/",
        "https://hermeslogisticsus.com/services/seo/",
      ],
      cadence_hours: 6,
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
    plugin_version: pluginRuntimeVersion("hermes-marketing-growth"),
    contract_version: "marketing-content-dedupe-v1",
    job_type: "marketing.content.dedupe.audit",
    business_lane: "marketing",
    permission_class: "READ_ONLY",
    semantic_required: false,
    free_ai_policy: "not_required",
    trigger: "before_scheduling_or_batch_review",
    input_schema: {
      items: "array<{content_id,slot_key,body_fingerprint}>",
    },
    runtime_config: {
      lookback_limit: 200,
      cadence_hours: 6,
    },
    preconditions: ["payload contains content identifiers, slot keys and non-reversible body fingerprints only"],
    deterministic_steps: [
      "compare content fingerprints without copying raw body into the job payload",
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
    plugin_version: pluginRuntimeVersion("hermes-dispatch-os"),
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
    runtime_config: {
      max_age_minutes: 1440,
      cadence_hours: 6,
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
  Object.freeze({
    role_id: "hermes-search-growth",
    plugin_version: pluginRuntimeVersion("hermes-search-growth"),
    contract_version: "search-defect-prioritize-v1",
    job_type: "search.defect.prioritize",
    business_lane: "search",
    permission_class: "READ_ONLY",
    semantic_required: true,
    free_ai_policy: "free_only_wait_if_unavailable",
    trigger: "downstream_from_search_snapshot",
    input_schema: {
      defects: "array<{defect_type,url}> max 20",
      parent_job_id: "string",
    },
    runtime_config: {
      max_items: 20,
      max_output_tokens: 600,
      max_cost_usd: 0,
      retry_seconds: 900,
    },
    preconditions: [
      "defects come only from the deterministic Search snapshot contract",
      "URLs are public hermeslogisticsus.com URLs",
      "no customer, credential or private payload is allowed",
    ],
    deterministic_steps: [
      "bound and validate public defect metadata",
      "route only to explicitly zero-cost eligible semantic provider",
      "require structured JSON result",
      "validate every recommendation against the original defect set",
    ],
    output_schema: "priorities: array<{url,defect_type,priority,reason,next_action}>",
    kpi: ["prioritized_defect_count", "free_ai_wait_count", "paid_inference_cost_usd"],
    owner_gate: "none_read_only_advisory",
    readback: "structured result_json receipt with provider id and cost_usd=0",
    failure: "WAITING_FREE_AI when free capacity unavailable; fail closed on invalid model output",
    retention: "business_runtime_evidence",
  }),
  Object.freeze({
    role_id: "hermes-automatic-engineer",
    plugin_version: pluginRuntimeVersion("hermes-automatic-engineer"),
    contract_version: "hae-self-patch-propose-v1",
    job_type: "hae.self.patch.propose",
    business_lane: "automation",
    permission_class: "READ_ONLY",
    semantic_required: true,
    free_ai_policy: "free_only_wait_if_unavailable",
    trigger: "authenticated_single_test_repair_packet",
    input_schema: {
      work_id: "HAE-SELF:*",
      finding_id: "verified finding id",
      repair_job_id: "persisted hae.self.repair.packet job id",
      artifact_key: "exact allowlisted scripts/(automation-engine|hae)-*.test.mjs path",
      base_sha: "exact 40-char git SHA",
      observed_base_sha: "must equal base_sha",
      defect_evidence_ref: "HAE-EVIDENCE:*",
      source_status: "HOLD_REPAIR",
      source_coverage_complete: "true",
      finding_verified: "true",
      writer_state_verified: "true",
      writer_active: "false",
      source_excerpt: "bounded exact-file source excerpt from authenticated adapter",
      source_excerpt_sha256: "sha256:*",
      failure_summary: "bounded minimized deterministic failure evidence"
    },
    runtime_config: {
      scheduled: false,
      max_source_chars: 6000,
      max_failure_chars: 800,
      max_output_tokens: 1200,
      max_cost_usd: 0,
      retry_seconds: 900
    },
    preconditions: [
      "parent repair packet is persisted and source-authenticated",
      "artifact is one exact allowlisted deterministic JS test file",
      "base SHA is current and independently observed",
      "source excerpt contains no credential material",
      "semantic provider is explicitly zero-cost eligible or job waits in WAITING_FREE_AI"
    ],
    deterministic_steps: [
      "validate immutable repair identity and bounded repository source evidence",
      "ask free-only semantic specialist for one unified-diff proposal",
      "validate exact file headers, hunk and changed-line bounds, and unsafe added-code patterns",
      "return proposal only; separate Node preflight and independent QA are required before any git write"
    ],
    output_schema: "HOLD_BOUNDED_REPAIR_PREFLIGHT + one bounded unified diff + rationale",
    kpi: ["work_id", "proposal_status", "changed_line_count", "hunk_count", "paid_inference_cost_usd"],
    owner_gate: "authenticated_source_adapter_required_no_git_write",
    readback: "structured result_json receipt with provider id, usage id and cost_usd=0",
    failure: "WAITING_FREE_AI when free capacity unavailable; fail closed on stale evidence or invalid diff",
    retention: "technical_runtime_evidence"
  }),
  Object.freeze({
    role_id: "hermes-agent-coordinator",
    plugin_version: pluginRuntimeVersion("hermes-agent-coordinator"),
    contract_version: "work-portfolio-reconcile-v1",
    job_type: "work.portfolio.reconcile",
    business_lane: "automation",
    permission_class: "READ_ONLY",
    semantic_required: false,
    free_ai_policy: "not_required",
    trigger: "authorized_source_snapshot",
    input_schema: {
      source_kind: "ONE_BRAIN | GITHUB | CHATGPT_SELECTED",
      snapshot_id: "non-secret stable snapshot identifier",
      observed_at: "ISO-8601 timestamp",
      coverage_complete: "boolean",
      tasks: "minimized task metadata only",
    },
    runtime_config: {
      max_items: 500,
      scheduled: false,
    },
    preconditions: [
      "source access is explicitly authorized",
      "CHATGPT_SELECTED contains user-selected task metadata, never full account history",
      "payload contains no titles, prompts, chat bodies, PII, credentials or customer data",
    ],
    deterministic_steps: [
      "validate and deduplicate work ids",
      "classify dependencies and writer conflicts",
      "preserve UNKNOWN and incomplete coverage",
      "identify bounded READ_ONLY routing candidates without executing them",
    ],
    output_schema: "coverage + ready/blocked/stale/conflict/routing candidate ids",
    kpi: ["unfinished_count", "ready_count", "blocked_count", "writer_conflict_count", "unknown_count"],
    owner_gate: "authorized_source_adapter_required",
    readback: "result_json bound to source_kind and snapshot_id",
    failure: "fail_closed_on_invalid_or_sensitive_payload",
    retention: "business_runtime_evidence",
  }),
  ...ZERO_TOKEN_PLUGIN_TASK_CONTRACTS,
]);

export const ROLE_CONTRACT_JOB_TYPES = Object.freeze(ROLE_CONTRACTS.map((contract) => contract.job_type));

const DORMANT_GRAPH_JOB_TYPES = new Set(["hae.self.patch.propose", "hae.self.release.verify"]);
export const CAPABILITY_GRAPH_ROLE_CONTRACT_JOB_TYPES = Object.freeze(
  ROLE_CONTRACT_JOB_TYPES.filter((jobType) => !DORMANT_GRAPH_JOB_TYPES.has(jobType)),
);

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
    if (!/^[0-9a-f]{64}$/.test(cleanText(item.body_fingerprint, 80))) throw new Error("marketing_body_fingerprint_required");
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

const SEARCH_DEFECT_TYPES = new Set([
  "http_error",
  "missing_canonical",
  "canonical_mismatch",
  "sitemap_indexability_conflict",
]);

function validateSearchDefectPayload(payload) {
  const defects = boundedArray(payload?.defects, "defects");
  const contract = roleContractForJobType("search.defect.prioritize");
  const maxItems = Number(contract?.runtime_config?.max_items || 20);
  if (defects.length < 1) throw new Error("search_defects_required");
  if (defects.length > maxItems) throw new Error("search_defects_too_large");
  const normalized = [];
  const seen = new Set();
  for (const defect of defects) {
    if (!defect || typeof defect !== "object") throw new Error("search_defect_invalid");
    const defectType = cleanText(defect.defect_type, 80);
    const url = normalizedUrl(defect.url);
    if (!SEARCH_DEFECT_TYPES.has(defectType)) throw new Error("search_defect_type_invalid");
    if (!url || new URL(url).hostname !== "hermeslogisticsus.com") throw new Error("search_defect_url_invalid");
    const key = `${defectType}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ defect_type: defectType, url });
  }
  if (!normalized.length) throw new Error("search_defects_required");
  const parentJobId = cleanText(payload?.parent_job_id, 160);
  return { defects: normalized, parentJobId: parentJobId || null };
}

const HAE_PATCH_SHA=/^[a-f0-9]{40}$/;
const HAE_PATCH_DIGEST=/^sha256:[a-f0-9]{64}$/;
const HAE_PATCH_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const HAE_PATCH_EVIDENCE=/^HAE-EVIDENCE:[A-Za-z0-9._-]{6,90}$/;
const HAE_PATCH_JOB=/^job:[A-Za-z0-9._:-]{6,180}$/;
const HAE_PATCH_FIELDS=new Set([
  "work_id","finding_id","repair_job_id","artifact_key","base_sha","observed_base_sha",
  "defect_evidence_ref","source_status","source_coverage_complete","finding_verified",
  "writer_state_verified","writer_active","source_excerpt","source_excerpt_sha256","failure_summary"
]);

function validateHaeSelfPatchPayload(payload) {
  if (!payload || Array.isArray(payload) || typeof payload !== "object" ||
      Object.keys(payload).length !== HAE_PATCH_FIELDS.size ||
      Object.keys(payload).some((key) => !HAE_PATCH_FIELDS.has(key))) {
    throw new Error("hae_patch_payload_contract_invalid");
  }
  const findingId=cleanText(payload.finding_id, 96);
  const workId=cleanText(payload.work_id, 120);
  const artifactKey=cleanText(payload.artifact_key, 160);
  const repairJobId=cleanText(payload.repair_job_id, 200);
  const defectEvidenceRef=cleanText(payload.defect_evidence_ref, 120);
  const failureSummary=cleanText(payload.failure_summary, 800);
  const sourceExcerpt=typeof payload.source_excerpt==="string" ? payload.source_excerpt : "";
  if (!findingId || workId!=="HAE-SELF:"+findingId) throw new Error("hae_patch_work_identity_invalid");
  if (!HAE_PATCH_JOB.test(repairJobId)) throw new Error("hae_patch_repair_job_invalid");
  if (!HAE_PATCH_PATH.test(artifactKey) || artifactKey.includes("..") || artifactKey.includes("\\")) {
    throw new Error("hae_patch_artifact_invalid");
  }
  if (!HAE_PATCH_SHA.test(payload.base_sha||"") || payload.base_sha!==payload.observed_base_sha) {
    throw new Error("hae_patch_base_sha_invalid");
  }
  if (!HAE_PATCH_EVIDENCE.test(defectEvidenceRef)) throw new Error("hae_patch_evidence_ref_invalid");
  if (payload.source_status!=="HOLD_REPAIR" || payload.source_coverage_complete!==true ||
      payload.finding_verified!==true || payload.writer_state_verified!==true || payload.writer_active!==false) {
    throw new Error("hae_patch_source_not_eligible");
  }
  if (!sourceExcerpt || new TextEncoder().encode(sourceExcerpt).byteLength>6000 ||
      /[\0\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(sourceExcerpt)) {
    throw new Error("hae_patch_source_excerpt_invalid");
  }
  if (/(?:sk-proj-|ghp_[A-Za-z0-9]{12,}|BEGIN [A-Z ]*PRIVATE KEY|Authorization:\s*Bearer\s+[A-Za-z0-9._-]{12,})/i.test(sourceExcerpt)) {
    throw new Error("hae_patch_source_excerpt_secret_like");
  }
  if (!HAE_PATCH_DIGEST.test(payload.source_excerpt_sha256||"")) throw new Error("hae_patch_source_digest_invalid");
  if (!failureSummary || failureSummary.length<8) throw new Error("hae_patch_failure_summary_invalid");
  return {
    work_id: workId,
    finding_id: findingId,
    repair_job_id: repairJobId,
    artifact_key: artifactKey,
    base_sha: payload.base_sha,
    observed_base_sha: payload.observed_base_sha,
    defect_evidence_ref: defectEvidenceRef,
    source_status: payload.source_status,
    source_coverage_complete: true,
    finding_verified: true,
    writer_state_verified: true,
    writer_active: false,
    source_excerpt: sourceExcerpt,
    source_excerpt_sha256: payload.source_excerpt_sha256,
    failure_summary: failureSummary
  };
}

function validateHaePatchDiff(diff, artifactKey) {
  if (typeof diff!=="string" || !diff.endsWith("\n") ||
      new TextEncoder().encode(diff).byteLength>8192 ||
      /[\r\0\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(diff)) throw new Error("hae_patch_diff_invalid");
  const lines=diff.trimEnd().split("\n");
  if (lines.some((line)=>line.length>480)) throw new Error("hae_patch_diff_line_too_long");
  if (lines[0]!=="diff --git a/"+artifactKey+" b/"+artifactKey ||
      lines.filter((line)=>line.startsWith("diff --git ")).length!==1) throw new Error("hae_patch_diff_file_invalid");
  const from=lines.indexOf("--- a/"+artifactKey);
  const to=lines.indexOf("+++ b/"+artifactKey);
  if (from<1 || to!==from+1) throw new Error("hae_patch_diff_headers_invalid");
  const metadata=lines.slice(1,from);
  if (metadata.length>1 || metadata.some((line)=>!/^index [a-f0-9]{7,64}\.\.[a-f0-9]{7,64}(?: 100644)?$/.test(line))) {
    throw new Error("hae_patch_diff_metadata_invalid");
  }
  let hunks=0,changed=0,oldCount=null,newCount=null,added=0,removed=0;
  const finish=()=>{ if(oldCount!==null && (oldCount!==0||newCount!==0)) throw new Error("hae_patch_diff_unbalanced_hunk"); };
  for (const line of lines.slice(to+1)) {
    if (line.startsWith("@@ ")) {
      finish();
      const match=line.match(/^@@ -([1-9]\d*)(?:,(\d+))? \+([1-9]\d*)(?:,(\d+))? @@(?: [^\r\n]{0,80})?$/);
      if(!match) throw new Error("hae_patch_diff_hunk_header_invalid");
      hunks+=1;
      if(hunks>2) throw new Error("hae_patch_diff_too_many_hunks");
      oldCount=match[2]===undefined?1:Number(match[2]);
      newCount=match[4]===undefined?1:Number(match[4]);
      if(oldCount>150||newCount>150) throw new Error("hae_patch_diff_hunk_too_large");
      continue;
    }
    if(oldCount===null) throw new Error("hae_patch_diff_line_outside_hunk");
    const ch=line.slice(0,1);
    if(![" ","+","-"].includes(ch)) throw new Error("hae_patch_diff_line_invalid");
    if(ch===" "){oldCount-=1;newCount-=1;}
    if(ch==="-"){oldCount-=1;changed+=1;removed+=1;}
    if(ch==="+"){
      newCount-=1;changed+=1;added+=1;
      if (/(?:child_process|execSync|spawnSync|(?:process|globalThis)\s*(?:\.|\[)|fetch\s*\(|WebSocket\b|https?:\/\/|eval\s*\(|Function\s*\(|import\s*\(|\brequire\s*\(|from\s+["']node:|import\s+.*["']node:|sk-proj-|ghp_|BEGIN [A-Z ]*PRIVATE KEY)/i.test(line)) {
        throw new Error("hae_patch_diff_unsafe_added_code");
      }
    }
    if(oldCount<0||newCount<0) throw new Error("hae_patch_diff_hunk_count_mismatch");
  }
  finish();
  if(!hunks || !changed || changed>50 || !added || !removed) throw new Error("hae_patch_diff_bounds_invalid");
  return {changed_line_count:changed,hunk_count:hunks};
}

export function buildRoleContractSemanticRequest(jobType, payload) {
  if (jobType === "hae.self.patch.propose") {
    const input=validateHaeSelfPatchPayload(payload);
    return {
      system_prompt: [
        "You are the Hermes Automatic Engineer in PATCH_PROPOSAL_ONLY mode.",
        "Use only the supplied exact test-file excerpt and minimized failure summary.",
        "Return JSON only with exactly two keys: diff and rationale.",
        "The diff must modify only artifact_key, use unified diff format, contain at most two hunks and at most 50 changed lines.",
        "Do not add network, filesystem, process, dynamic-import, credential, provider, migration, deployment, merge, publication or destructive behavior.",
        "Do not claim that the patch was applied, tested, merged or deployed.",
        "If evidence is insufficient, return an empty diff; invalid output will fail closed."
      ].join(" "),
      user_prompt: JSON.stringify({
        work_id:input.work_id,
        finding_id:input.finding_id,
        artifact_key:input.artifact_key,
        base_sha:input.base_sha,
        defect_evidence_ref:input.defect_evidence_ref,
        failure_summary:input.failure_summary,
        source_excerpt_sha256:input.source_excerpt_sha256,
        source_excerpt:input.source_excerpt
      }),
      max_output_tokens: Number(roleContractForJobType(jobType)?.runtime_config?.max_output_tokens || 1200)
    };
  }
  if (jobType !== "search.defect.prioritize") throw new Error("semantic_role_contract_not_supported");
  const { defects } = validateSearchDefectPayload(payload);
  return {
    system_prompt: [
      "You are the Hermes Search Growth specialist.",
      "Prioritize only the supplied verified technical defects.",
      "Do not invent traffic, rankings, causes, facts, fixes already performed, or external evidence.",
      "Return JSON only with key priorities.",
      "Each item must use an input url and defect_type, integer priority 1-100, concise reason, and next_action.",
      "Higher priority means larger immediate risk to crawlability/indexability or a money-page owner.",
      "This is read-only advisory output; do not claim that any fix was applied.",
    ].join(" "),
    user_prompt: JSON.stringify({ defects }),
    max_output_tokens: Number(roleContractForJobType(jobType)?.runtime_config?.max_output_tokens || 600),
  };
}

export function validateRoleContractSemanticResult(jobType, payload, value) {
  if (jobType === "hae.self.patch.propose") {
    const input=validateHaeSelfPatchPayload(payload);
    if (!value || Array.isArray(value) || typeof value!=="object" ||
        Object.keys(value).length!==2 || !Object.hasOwn(value,"diff") || !Object.hasOwn(value,"rationale")) {
      throw new Error("hae_patch_semantic_result_contract_invalid");
    }
    const rationale=cleanText(value.rationale, 600);
    if(!rationale || rationale.length<8) throw new Error("hae_patch_semantic_rationale_invalid");
    const metrics=validateHaePatchDiff(value.diff,input.artifact_key);
    return {
      work_id:input.work_id,
      finding_id:input.finding_id,
      repair_job_id:input.repair_job_id,
      artifact_key:input.artifact_key,
      base_sha:input.base_sha,
      defect_evidence_ref:input.defect_evidence_ref,
      diff:value.diff,
      rationale,
      ...metrics,
      proposal_status:"HOLD_BOUNDED_REPAIR_PREFLIGHT",
      required_next_gate:"hae-bounded-repair-preflight-v1",
      automatic_git_write:false,
      automatic_branch_creation:false,
      automatic_merge:false,
      automatic_deploy:false,
      knowledge_auto_promotion:false,
      paid_inference_cost_usd:0
    };
  }
  if (jobType !== "search.defect.prioritize") throw new Error("semantic_role_contract_not_supported");
  const { defects } = validateSearchDefectPayload(payload);
  if (!value || typeof value !== "object" || !Array.isArray(value.priorities)) {
    throw new Error("semantic_result_priorities_required");
  }
  if (value.priorities.length > defects.length) throw new Error("semantic_result_too_many_items");
  const allowed = new Set(defects.map((item) => `${item.defect_type}|${item.url}`));
  const priorities = [];
  const seen = new Set();
  for (const item of value.priorities) {
    if (!item || typeof item !== "object") throw new Error("semantic_result_item_invalid");
    const defectType = cleanText(item.defect_type, 80);
    const url = normalizedUrl(item.url);
    const key = `${defectType}|${url || ""}`;
    if (!allowed.has(key) || seen.has(key)) throw new Error("semantic_result_item_not_in_input");
    const priority = Number(item.priority);
    if (!Number.isInteger(priority) || priority < 1 || priority > 100) throw new Error("semantic_result_priority_invalid");
    const reason = cleanText(item.reason, 500);
    const nextAction = cleanText(item.next_action, 500);
    if (!reason || !nextAction) throw new Error("semantic_result_text_required");
    seen.add(key);
    priorities.push({
      url,
      defect_type: defectType,
      priority,
      reason,
      next_action: nextAction,
    });
  }
  priorities.sort((left, right) => right.priority - left.priority || left.url.localeCompare(right.url));
  return {
    prioritized_defect_count: priorities.length,
    priorities,
  };
}

export function validateRoleContractInput(jobType, payload) {
  if (jobType === "search.snapshot.evaluate") return validateSearchPayload(payload);
  if (jobType === "marketing.content.dedupe.audit") return validateMarketingPayload(payload);
  if (jobType === "logistics.source.freshness.audit") return validateLogisticsPayload(payload);
  if (jobType === "search.defect.prioritize") return validateSearchDefectPayload(payload);
  if (jobType === "hae.self.patch.propose") return validateHaeSelfPatchPayload(payload);
  if (jobType === "work.portfolio.reconcile") return normalizeWorkPortfolioSnapshot(payload);
  if (isZeroTokenPluginTask(jobType)) return validateZeroTokenPluginTaskInput(jobType, payload);
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
    const bodyKey = cleanText(item.body_fingerprint, 80);
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
    fingerprint_only: true,
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
  if (jobType === "search.defect.prioritize" || jobType === "hae.self.patch.propose") throw new Error("semantic_job_requires_free_ai");
  if (jobType === "work.portfolio.reconcile") {
    return reconcileWorkPortfolioSnapshot(payload, ROLE_CONTRACT_JOB_TYPES);
  }
  if (isZeroTokenPluginTask(jobType)) return runZeroTokenPluginTask(jobType, payload);
  throw new Error("role_contract_job_type_not_allowed");
}
