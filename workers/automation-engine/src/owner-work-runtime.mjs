import {
  ensureCommandCenterSchema,
  readWorkItemPluginRoute,
  selectWorkItemPluginRoute,
} from "../../../functions/api/_lib/internal-command-center.mjs";

export const OWNER_WORK_PLAN_JOB_TYPE = "work.item.plan";
export const OWNER_WORK_DISPATCH_POLICY = "command-center-hae-autonomous-v1";

export const OWNER_WORK_EXECUTABLE_JOB_TYPES = Object.freeze([
  "search.snapshot.evaluate",
  "marketing.content.dedupe.audit",
  "logistics.source.freshness.audit",
  "ai.gateway.readiness.audit",
  "academy.english.practice.build",
  "hae.self.improvement.audit",
]);

const EXECUTABLE = new Set(OWNER_WORK_EXECUTABLE_JOB_TYPES);
const PRIORITY = Object.freeze({ p0: 100, p1: 85, p2: 60, p3: 40 });
const SECRET_LIKE = /(?:sk-(?:proj-)?[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9]{12,}|AIza[0-9A-Za-z_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|Authorization:\s*Bearer\s+[A-Za-z0-9._-]{12,}|BEGIN [A-Z ]*PRIVATE KEY)/i;

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function safeJson(value) {
  try { return JSON.parse(String(value || "{}")); }
  catch { return null; }
}

async function ensureColumns(db) {
  const columns = await db.prepare("PRAGMA table_info(hermes_owner_work_items)").all();
  const names = new Set((columns?.results || []).map((column) => String(column.name || "")));
  for (const [name, definition] of [
    ["hae_plan_job_id", "TEXT"],
    ["hae_execution_job_id", "TEXT"],
    ["hae_dispatch_state", "TEXT"],
    ["hae_dispatch_result_json", "TEXT"],
  ]) {
    if (names.has(name)) continue;
    try {
      await db.prepare(`ALTER TABLE hermes_owner_work_items ADD COLUMN ${name} ${definition}`).run();
    } catch (error) {
      const current = await db.prepare("PRAGMA table_info(hermes_owner_work_items)").all();
      if (!(current?.results || []).some((column) => String(column.name || "") === name)) throw error;
    }
  }
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_owner_work_items_hae_dispatch ON hermes_owner_work_items(organization_scope,hae_dispatch_state,status,priority,created_at)"
  ).run();
}

export async function ensureOwnerWorkRuntimeSchema(db) {
  await ensureCommandCenterSchema(db);
  await ensureColumns(db);
}

function minimizedWorkItemPayload(item, route) {
  const title = clean(item?.title, 160);
  const nextAction = clean(item?.next_action, 1200);
  const details = clean(item?.details, 1800);
  const sourceKind = clean(item?.source_kind, 80);
  const sourceLabel = clean(item?.source_label, 200);
  const raw = [title, nextAction, details, sourceLabel].join(" ");
  if (!title || SECRET_LIKE.test(raw)) throw new Error("owner_work_sensitive_or_invalid");
  return {
    work_id: clean(item?.id, 160),
    project_id: clean(item?.project_id, 160) || null,
    workstream: clean(item?.workstream, 40),
    priority: clean(item?.priority, 10),
    title,
    details: details || null,
    next_action: nextAction || null,
    source_kind: sourceKind || null,
    source_label: sourceLabel || null,
    selected_owner_role: clean(route?.owner?.role_id, 120),
    selected_owner_version: clean(route?.owner?.plugin_version, 80),
    route_basis: clean(route?.basis, 160),
    available_execution_job_types: OWNER_WORK_EXECUTABLE_JOB_TYPES,
  };
}

function itemPriority(value) {
  return PRIORITY[clean(value, 10).toLowerCase()] ?? 50;
}
function ownerPlanEnvelope(input, disposition, recommendedJobType, rationale, nextAction) {
  return {
    work_id: clean(input?.work_id, 160),
    disposition,
    recommended_job_type: recommendedJobType || null,
    rationale: clean(rationale, 900),
    next_action: clean(nextAction, 1200),
    selected_owner_role: clean(input?.selected_owner_role, 120),
    selected_owner_version: clean(input?.selected_owner_version, 80),
    route_basis: clean(input?.route_basis, 160),
    external_write: false,
    paid_inference_cost_usd: 0,
    planner: "hae-deterministic-zero-token-v1",
  };
}

export function deterministicOwnerWorkPlan(payload) {
  const workId=clean(payload?.work_id,160);
  const workstream=clean(payload?.workstream,40).toLowerCase();
  const title=clean(payload?.title,160);
  const details=clean(payload?.details,1800);
  const nextAction=clean(payload?.next_action,1200);
  const ownerRole=clean(payload?.selected_owner_role,120);
  const ownerVersion=clean(payload?.selected_owner_version,80);
  const routeBasis=clean(payload?.route_basis,160);
  const available=Array.isArray(payload?.available_execution_job_types)
    ? payload.available_execution_job_types.map((value)=>clean(value,120)).filter(Boolean)
    : [];
  if(!/^hcwi_[A-Za-z0-9._:-]{6,150}$/.test(workId)) throw new Error("owner_work_plan_work_id_invalid");
  if(!["marketing","logistics","sales","technology","academy","finance","operations"].includes(workstream)) throw new Error("owner_work_plan_workstream_invalid");
  if(!title||!ownerRole||!ownerVersion||!routeBasis||!available.length) throw new Error("owner_work_plan_identity_invalid");
  const text=[title,details,nextAction].filter(Boolean).join(" ").toLowerCase();
  if(SECRET_LIKE.test(text)) throw new Error("owner_work_sensitive_or_invalid");
  const input={...payload,work_id:workId,workstream,title,details,next_action:nextAction,selected_owner_role:ownerRole,selected_owner_version:ownerVersion,route_basis:routeBasis};
  if(/(?:\bmerge\b|\bdeploy\b|publish|send\b|email\b|call\b|credential|password|billing|payment|pay\b|hire\b|fire\b|legal|contract signature|delete\b|destructive|production write)/i.test(text)) {
    return ownerPlanEnvelope(input,"NEEDS_OWNER_GATE",null,
      "This work item contains an action protected by the existing owner gate.",
      "Execute only read-only preparation until the protected action is explicitly authorized.");
  }
  if(/(?:missing|not recovered|unknown|locate current|source truth|evidence gap|blocked reason)/i.test(text)) {
    return ownerPlanEnvelope(input,"BLOCKED_EVIDENCE",null,
      "The task explicitly indicates missing or unverified source truth.",
      "Recover the canonical source evidence first, then return the work item to ready.");
  }
  let jobType=null;
  if(workstream==="academy" && /english|practice|lesson|language/i.test(text)) jobType="academy.english.practice.build";
  else if(workstream==="marketing" && /duplicate|dedupe|content/i.test(text)) jobType="marketing.content.dedupe.audit";
  else if(workstream==="marketing" && /seo|index|canonical|sitemap|crawl|search/i.test(text)) jobType="search.snapshot.evaluate";
  else if(workstream==="logistics" && /fresh|stale|source|feed|load/i.test(text)) jobType="logistics.source.freshness.audit";
  else if(/ai gateway|free provider|provider readiness|gateway readiness/i.test(text)) jobType="ai.gateway.readiness.audit";
  else if(/hae|command center|autonom|runtime|pipeline|queue|receipt|\bci\b|self.improv/i.test(text)) jobType="hae.self.improvement.audit";
  if(jobType && available.includes(jobType)) {
    return ownerPlanEnvelope(input,"EXECUTE_EXISTING_CAPABILITY",jobType,
      "A bounded existing HAE read-only capability matches this work item.",
      "Run the selected HAE capability and persist its canonical D1 receipt before advancing the work item.");
  }
  return ownerPlanEnvelope(input,"NEEDS_CAPABILITY",null,
    "No current bounded HAE capability safely covers this work item.",
    "Create or map the smallest read-only capability for this task, then return the item to ready.");
}


async function reserveNextItem(db, now) {
  const candidate = await db.prepare(`
    SELECT *
    FROM hermes_owner_work_items
    WHERE organization_scope='hermes_internal'
      AND status IN ('ready','planned')
      AND (hae_plan_job_id IS NULL OR hae_plan_job_id='')
      AND (hae_execution_job_id IS NULL OR hae_execution_job_id='')
      AND (hae_dispatch_state IS NULL OR hae_dispatch_state IN ('','RETRY_READY'))
    ORDER BY
      CASE status WHEN 'ready' THEN 0 ELSE 1 END,
      CASE priority WHEN 'p0' THEN 0 WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 ELSE 3 END,
      created_at ASC
    LIMIT 1
  `).first();
  if (!candidate) return null;
  const reserved = await db.prepare(`
    UPDATE hermes_owner_work_items
    SET hae_dispatch_state='PLAN_RESERVING', updated_at=?
    WHERE id=? AND organization_scope='hermes_internal'
      AND status IN ('ready','planned')
      AND (hae_plan_job_id IS NULL OR hae_plan_job_id='')
      AND (hae_dispatch_state IS NULL OR hae_dispatch_state IN ('','RETRY_READY'))
  `).bind(now, candidate.id).run();
  return Number(reserved?.meta?.changes || 0) === 1 ? candidate : null;
}

export async function enqueueNextOwnerWorkPlan(env, scheduledAt, { createJob }) {
  if (!env?.DB || typeof createJob !== "function") throw new Error("owner_work_runtime_not_configured");
  await ensureOwnerWorkRuntimeSchema(env.DB);
  const now = new Date(scheduledAt || Date.now()).toISOString();
  const item = await reserveNextItem(env.DB, now);
  if (!item) return { status: "NO_READY_OWNER_WORK" };

  try {
    const route = readWorkItemPluginRoute(item) || selectWorkItemPluginRoute(item);
    const payload = minimizedWorkItemPayload(item, route);
    const stableVersion = clean(item.updated_at, 80).replace(/[^0-9A-Za-z._-]/g, "_").slice(0, 72) || "v1";
    const created = await createJob(env, {
      job_type: OWNER_WORK_PLAN_JOB_TYPE,
      business_lane: "automation",
      account_key: "hermes_logistics",
      project_key: "command-center-owner-work",
      priority: itemPriority(item.priority),
      max_attempts: 1,
      internal_submission: true,
      idempotency_key: `hae:owner-work-plan:${clean(item.id, 120)}:${stableVersion}`,
      policy_version: OWNER_WORK_DISPATCH_POLICY,
      payload,
    });
    const jobId = clean(created?.job?.job_id, 180);
    if (!jobId) throw new Error("owner_work_plan_job_missing");
    const changed = await env.DB.prepare(`
      UPDATE hermes_owner_work_items
      SET status='in_progress', plugin_route_json=?, hae_plan_job_id=?, hae_job_id=?,
          hae_dispatch_state='PLAN_QUEUED', blocked_reason=NULL, updated_at=?
      WHERE id=? AND organization_scope='hermes_internal' AND hae_dispatch_state='PLAN_RESERVING'
    `).bind(JSON.stringify(route), jobId, jobId, now, item.id).run();
    if (Number(changed?.meta?.changes || 0) !== 1) throw new Error("owner_work_plan_binding_conflict");
    return { status: "PLAN_QUEUED", work_id: String(item.id), job_id: jobId };
  } catch (error) {
    await env.DB.prepare(`
      UPDATE hermes_owner_work_items
      SET hae_dispatch_state='RETRY_READY', blocked_reason=?, updated_at=?
      WHERE id=? AND organization_scope='hermes_internal' AND hae_dispatch_state='PLAN_RESERVING'
    `).bind(clean(error?.message, 180) || "owner_work_plan_submit_failed", now, item.id).run();
    throw error;
  }
}

function normalizedPlanResult(job) {
  if (!job || String(job.state || "") !== "SUCCEEDED") return null;
  const parsed = safeJson(job.result_json);
  if (parsed?.capability !== OWNER_WORK_PLAN_JOB_TYPE || !parsed?.result) return null;
  const result = parsed.result;
  return {
    disposition: clean(result.disposition, 60),
    recommended_job_type: clean(result.recommended_job_type, 120) || null,
    rationale: clean(result.rationale, 900),
    next_action: clean(result.next_action, 1200),
  };
}

async function reconcilePlan(env, item, scheduledAt, deps) {
  const planJobId = clean(item?.hae_plan_job_id, 180);
  if (!planJobId || item.hae_execution_job_id) return 0;
  const job = await env.DB.prepare(
    "SELECT job_id,state,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
  ).bind(planJobId).first();
  if (!job) return 0;
  const now = new Date(scheduledAt || Date.now()).toISOString();
  const state = clean(job.state, 40).toUpperCase();

  if (state === "WAITING_FREE_AI" || state === "QUEUED" || state === "RUNNING" || state === "RETRY_SCHEDULED") {
    const dispatchState = state === "WAITING_FREE_AI" ? "PLAN_WAITING_FREE_AI" : "PLAN_RUNNING";
    await env.DB.prepare("UPDATE hermes_owner_work_items SET hae_dispatch_state=?,updated_at=? WHERE id=? AND organization_scope='hermes_internal'")
      .bind(dispatchState, now, item.id).run();
    return 0;
  }
  if (state === "FAILED" || state === "CANCELLED" || state === "DEAD_LETTER") {
    await env.DB.prepare(`
      UPDATE hermes_owner_work_items
      SET status='blocked',hae_dispatch_state='PLAN_FAILED',blocked_reason=?,updated_at=?
      WHERE id=? AND organization_scope='hermes_internal'
    `).bind(clean(job.last_error_class, 180) || "owner_work_plan_failed", now, item.id).run();
    return 1;
  }
  const plan = normalizedPlanResult(job);
  if (!plan) return 0;

  const resultJson = JSON.stringify(plan);
  if (plan.disposition === "EXECUTE_EXISTING_CAPABILITY" && plan.recommended_job_type && EXECUTABLE.has(plan.recommended_job_type)) {
    const contract = deps.contractForJobType(plan.recommended_job_type);
    if (!contract || contract.permission_class !== "READ_ONLY" || contract.semantic_required) {
      throw new Error("owner_work_execution_contract_not_safe");
    }
    const executionPayload = await deps.buildPayload(env, contract, new Date(now));
    const created = await deps.createJob(env, {
      job_type: contract.job_type,
      business_lane: contract.business_lane,
      account_key: "hermes_logistics",
      project_key: "command-center-owner-work-execution",
      priority: itemPriority(item.priority),
      max_attempts: 3,
      internal_submission: true,
      idempotency_key: `hae:owner-work-exec:${clean(item.id, 120)}:${planJobId}:${contract.job_type}`,
      policy_version: OWNER_WORK_DISPATCH_POLICY,
      payload: {
        ...executionPayload,
        owner_work_id: clean(item.id, 160),
        owner_plan_job_id: planJobId,
      },
    });
    const executionJobId = clean(created?.job?.job_id, 180);
    if (!executionJobId) throw new Error("owner_work_execution_job_missing");
    await env.DB.prepare(`
      UPDATE hermes_owner_work_items
      SET hae_execution_job_id=?,hae_job_id=?,hae_dispatch_state='EXECUTION_QUEUED',
          hae_dispatch_result_json=?,next_action=?,blocked_reason=NULL,updated_at=?
      WHERE id=? AND organization_scope='hermes_internal' AND hae_plan_job_id=?
    `).bind(executionJobId, executionJobId, resultJson, plan.next_action || null, now, item.id, planJobId).run();
    return 1;
  }

  const stateMap = {
    NEEDS_CAPABILITY: "NEEDS_CAPABILITY",
    NEEDS_OWNER_GATE: "NEEDS_OWNER_GATE",
    BLOCKED_EVIDENCE: "BLOCKED_EVIDENCE",
  };
  const dispatchState = stateMap[plan.disposition] || "PLAN_COMPLETE_NO_SAFE_EXECUTION";
  const blocked = dispatchState === "NEEDS_OWNER_GATE" || dispatchState === "BLOCKED_EVIDENCE";
  await env.DB.prepare(`
    UPDATE hermes_owner_work_items
    SET status=?,hae_dispatch_state=?,hae_dispatch_result_json=?,next_action=?,
        blocked_reason=?,updated_at=?
    WHERE id=? AND organization_scope='hermes_internal' AND hae_plan_job_id=?
  `).bind(
    blocked ? "blocked" : "in_progress",
    dispatchState,
    resultJson,
    plan.next_action || null,
    blocked ? (plan.rationale || "Owner work requires an external gate.") : null,
    now,
    item.id,
    planJobId,
  ).run();
  return 1;
}

async function reconcileExecution(env, item, scheduledAt) {
  const executionJobId = clean(item?.hae_execution_job_id, 180);
  if (!executionJobId) return 0;
  const job = await env.DB.prepare(
    "SELECT job_id,state,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
  ).bind(executionJobId).first();
  if (!job) return 0;
  const now = new Date(scheduledAt || Date.now()).toISOString();
  const state = clean(job.state, 40).toUpperCase();
  if (["QUEUED","RUNNING","RETRY_SCHEDULED","WAITING_FREE_AI"].includes(state)) {
    const stateMap = {
      QUEUED: "EXECUTION_QUEUED",
      RUNNING: "EXECUTION_RUNNING",
      RETRY_SCHEDULED: "EXECUTION_RETRY_SCHEDULED",
      WAITING_FREE_AI: "EXECUTION_WAITING_FREE_AI",
    };
    await env.DB.prepare("UPDATE hermes_owner_work_items SET hae_dispatch_state=?,updated_at=? WHERE id=? AND organization_scope='hermes_internal'")
      .bind(stateMap[state], now, item.id).run();
    return 0;
  }
  if (state === "SUCCEEDED") {
    await env.DB.prepare(`
      UPDATE hermes_owner_work_items
      SET status='in_progress',acceptance_status='awaiting',hae_dispatch_state='EXECUTION_SUCCEEDED',
          completed_at=NULL,blocked_reason=NULL,updated_at=?
      WHERE id=? AND organization_scope='hermes_internal' AND hae_execution_job_id=?
    `).bind(now, item.id, executionJobId).run();
    return 1;
  }
  if (["FAILED","CANCELLED","DEAD_LETTER"].includes(state)) {
    await env.DB.prepare(`
      UPDATE hermes_owner_work_items
      SET status='blocked',hae_dispatch_state='EXECUTION_FAILED',blocked_reason=?,updated_at=?
      WHERE id=? AND organization_scope='hermes_internal' AND hae_execution_job_id=?
    `).bind(clean(job.last_error_class, 180) || "owner_work_execution_failed", now, item.id, executionJobId).run();
    return 1;
  }
  return 0;
}

export async function reconcileOwnerWorkRuntime(env, scheduledAt, deps) {
  if (!env?.DB) throw new Error("owner_work_runtime_not_configured");
  await ensureOwnerWorkRuntimeSchema(env.DB);
  const rows = await env.DB.prepare(`
    SELECT id,priority,hae_plan_job_id,hae_execution_job_id,hae_dispatch_state
    FROM hermes_owner_work_items
    WHERE organization_scope='hermes_internal'
      AND (hae_plan_job_id IS NOT NULL OR hae_execution_job_id IS NOT NULL)
      AND COALESCE(hae_dispatch_state,'') NOT IN ('EXECUTION_SUCCEEDED','PLAN_FAILED','EXECUTION_FAILED','NEEDS_OWNER_GATE','BLOCKED_EVIDENCE')
    ORDER BY updated_at ASC
    LIMIT 50
  `).all();
  let changed = 0;
  for (const item of rows?.results || []) {
    changed += await reconcilePlan(env, item, scheduledAt, deps);
    const refreshed = await env.DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=? LIMIT 1").bind(item.id).first();
    changed += await reconcileExecution(env, refreshed || item, scheduledAt);
  }
  return changed;
}

export async function ownerWorkRuntimeSnapshot(db) {
  await ensureOwnerWorkRuntimeSchema(db);
  const counts = await db.prepare(`
    SELECT COALESCE(hae_dispatch_state,'UNCLAIMED') AS state,COUNT(*) AS count
    FROM hermes_owner_work_items
    WHERE organization_scope='hermes_internal'
    GROUP BY COALESCE(hae_dispatch_state,'UNCLAIMED')
    ORDER BY state
  `).all();
  const next = await db.prepare(`
    SELECT id,workstream,priority,title,status,hae_dispatch_state,hae_plan_job_id,hae_execution_job_id
    FROM hermes_owner_work_items
    WHERE organization_scope='hermes_internal' AND status IN ('ready','planned','in_progress')
    ORDER BY CASE priority WHEN 'p0' THEN 0 WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 ELSE 3 END,created_at ASC
    LIMIT 10
  `).all();
  return {
    policy_version: OWNER_WORK_DISPATCH_POLICY,
    chatgpt_runtime_required: false,
    codex_runtime_required: false,
    source_of_runtime_work: "hermes_owner_work_items",
    execution_owner: "HAE",
    semantic_node: "VIKTOR-WINDOWS",
    semantic_model_policy: "local_zero_cost_only",
    counts: counts?.results || [],
    next_items: next?.results || [],
  };
}
