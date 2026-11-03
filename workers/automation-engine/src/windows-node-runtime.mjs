import {
  buildRoleContractSemanticRequest,
  roleContractForJobType,
  roleContractSha256,
  validateRoleContractSemanticResult,
} from "./role-contracts.mjs";
import { ensureAiUsageLedgerSchema } from "./ai-usage-ledger.mjs";

export const WINDOWS_NODE_ID = "VIKTOR-WINDOWS";
export const WINDOWS_NODE_CONTRACT_VERSION = "windows-node-v1";
const WINDOWS_NODE_PROVIDER_ID = "viktor-windows-ollama";
const LEASE_SECONDS = 5 * 60;
const ELIGIBLE_JOB_TYPES = new Set(["search.defect.prioritize", "hae.self.patch.propose"]);

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}
function enabled(value) { return String(value || "").trim().toLowerCase() === "enabled"; }
function addSecondsIso(iso, seconds) { return new Date(Date.parse(iso) + seconds * 1000).toISOString(); }
function timingSafeEqualText(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) mismatch |= (a[i] || 0) ^ (b[i] || 0);
  return mismatch === 0;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}
async function sha256Json(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(canonical(value)));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function finiteNonnegativeInteger(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.trunc(numeric) : null;
}
function parsePayload(row) {
  try { return JSON.parse(String(row?.payload_json || "{}")); }
  catch { throw new Error("windows_node_job_payload_invalid"); }
}
function nodeEnabled(env) { return enabled(env?.HERMES_WINDOWS_NODE_ENABLED); }

export function windowsNodeAuthorized(request, env) {
  if (!nodeEnabled(env)) return { ok: false, status: 503, error: "windows_node_disabled" };
  const expected = String(env?.HERMES_WINDOWS_NODE_TOKEN || "");
  if (expected.length < 32) return { ok: false, status: 503, error: "windows_node_token_not_configured" };
  const authorization = request?.headers?.get?.("Authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!supplied || !timingSafeEqualText(supplied, expected)) return { ok: false, status: 401, error: "windows_node_auth_required" };
  return { ok: true };
}

export async function ensureWindowsNodeSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_automation_nodes (
    node_id TEXT PRIMARY KEY,
    contract_version TEXT NOT NULL,
    capability TEXT NOT NULL,
    model TEXT,
    status TEXT NOT NULL,
    current_job_id TEXT,
    last_seen_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_automation_node_leases (
    job_id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,
    lease_id TEXT NOT NULL,
    fence INTEGER NOT NULL,
    lease_until TEXT NOT NULL,
    contract_sha256 TEXT NOT NULL,
    state TEXT NOT NULL,
    output_sha256 TEXT,
    claimed_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_hae_node_active_lease ON hermes_automation_node_leases(node_id) WHERE state='ACTIVE'").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_hae_node_inflight_lease ON hermes_automation_node_leases(node_id) WHERE state IN ('ACTIVE','COMPLETING')").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_node_lease_expiry ON hermes_automation_node_leases(state,lease_until)").run();
}

async function appendEvent(db, { jobId, eventType, fromState, toState, step, errorClass = null, createdAt = new Date().toISOString() }) {
  await db.prepare(`INSERT INTO hermes_automation_job_events
    (event_id,job_id,event_type,from_state,to_state,step,error_class,created_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind(
      `evt:${jobId}:${eventType}:${crypto.randomUUID()}`,
      jobId, eventType, fromState, toState, step, errorClass, createdAt,
    ).run();
}

async function frozenSemanticJob(row) {
  if (!row || !ELIGIBLE_JOB_TYPES.has(String(row.job_type || ""))) return null;
  const contract = roleContractForJobType(String(row.job_type));
  if (!contract || contract.semantic_required !== true || contract.permission_class !== "READ_ONLY") return null;
  if (String(row.business_lane || "") !== String(contract.business_lane || "")) return null;
  const budget = Number(contract?.runtime_config?.max_cost_usd);
  if (!Number.isFinite(budget) || budget !== 0) return null;
  const payload = parsePayload(row);
  const bound = payload?._role_contract;
  const contractSha = await roleContractSha256(contract);
  if (!bound || bound.role_id !== contract.role_id || bound.plugin_version !== contract.plugin_version ||
      bound.contract_version !== contract.contract_version || bound.sha256 !== contractSha) return null;
  const executionPayload = { ...payload };
  delete executionPayload._role_contract;
  return { contract, contractSha, executionPayload };
}

async function claimResponse(db, row, lease) {
  const frozen = await frozenSemanticJob(row);
  if (!frozen) throw new Error("windows_node_frozen_contract_invalid");
  const request = buildRoleContractSemanticRequest(row.job_type, frozen.executionPayload);
  return {
    job_id: row.job_id,
    work_id: clean(frozen.executionPayload?.work_id, 160) || `HAE-JOB:${row.job_id}`,
    job_type: row.job_type,
    business_lane: row.business_lane,
    lease_id: lease.lease_id,
    fence: Number(lease.fence),
    lease_until: lease.lease_until,
    node_id: WINDOWS_NODE_ID,
    node_contract_version: WINDOWS_NODE_CONTRACT_VERSION,
    role_contract: {
      role_id: frozen.contract.role_id,
      plugin_version: frozen.contract.plugin_version,
      contract_version: frozen.contract.contract_version,
      sha256: frozen.contractSha,
      permission_class: frozen.contract.permission_class,
      semantic_required: true,
      max_cost_usd: 0,
    },
    semantic_request: request,
  };
}

export async function recoverExpiredWindowsNodeLeases(db, now = new Date().toISOString()) {
  await ensureWindowsNodeSchema(db);
  const rows = await db.prepare(`SELECT job_id,node_id,lease_id,fence,state FROM hermes_automation_node_leases
    WHERE state IN ('ACTIVE','COMPLETING') AND lease_until<=? ORDER BY lease_until ASC LIMIT 50`).bind(now).all();
  let recovered = 0;
  for (const lease of rows?.results || []) {
    const jobStatement = db.prepare(`UPDATE hermes_automation_jobs
      SET state='WAITING_FREE_AI',current_step='free_ai',available_at=?,last_error_class='windows_node_lease_expired',updated_at=?
      WHERE job_id=? AND state='RUNNING' AND current_step='windows_free_ai'`).bind(now, now, lease.job_id);
    const leaseStatement = db.prepare("UPDATE hermes_automation_node_leases SET state='EXPIRED',updated_at=? WHERE job_id=? AND state IN ('ACTIVE','COMPLETING') AND fence=? AND lease_until<=?")
      .bind(now, lease.job_id, lease.fence, now);
    const results = typeof db.batch === "function"
      ? await db.batch([jobStatement, leaseStatement])
      : [await jobStatement.run(), await leaseStatement.run()];
    const jobChanged = Number(results?.[0]?.meta?.changes || 0) === 1;
    const leaseChanged = Number(results?.[1]?.meta?.changes || 0) === 1;
    if (!leaseChanged) continue;
    if (jobChanged) {
      await appendEvent(db, { jobId: lease.job_id, eventType: "job.windows_node_lease_expired", fromState: "RUNNING", toState: "WAITING_FREE_AI", step: "free_ai", errorClass: "windows_node_lease_expired", createdAt: now });
    }
    recovered += 1;
  }
  return recovered;
}

export async function heartbeatWindowsNode(env, payload = {}, now = new Date().toISOString()) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureWindowsNodeSchema(env.DB);
  await recoverExpiredWindowsNodeLeases(env.DB, now);
  const nodeId = clean(payload.node_id, 80);
  if (nodeId !== WINDOWS_NODE_ID) throw new Error("windows_node_id_invalid");
  const contractVersion = clean(payload.contract_version, 80);
  if (contractVersion !== WINDOWS_NODE_CONTRACT_VERSION) throw new Error("windows_node_contract_version_invalid");
  const model = clean(payload.model, 160) || null;
  const status = ["IDLE","BUSY","DEGRADED"].includes(clean(payload.status, 40)) ? clean(payload.status, 40) : "IDLE";
  const currentJobId = clean(payload.current_job_id, 160) || null;
  await env.DB.prepare(`INSERT INTO hermes_automation_nodes
    (node_id,contract_version,capability,model,status,current_job_id,last_seen_at,updated_at)
    VALUES (?,?, 'READ_ONLY_SEMANTIC',?,?,?,?,?)
    ON CONFLICT(node_id) DO UPDATE SET contract_version=excluded.contract_version,capability=excluded.capability,
      model=excluded.model,status=excluded.status,current_job_id=excluded.current_job_id,last_seen_at=excluded.last_seen_at,updated_at=excluded.updated_at`)
    .bind(WINDOWS_NODE_ID, WINDOWS_NODE_CONTRACT_VERSION, model, status, currentJobId, now, now).run();
  return { status: "HEARTBEAT_ACCEPTED", node_id: WINDOWS_NODE_ID, observed_at: now, production_write_authorized: false };
}

export async function claimWindowsNodeJob(env, payload = {}, now = new Date().toISOString()) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureWindowsNodeSchema(env.DB);
  await recoverExpiredWindowsNodeLeases(env.DB, now);
  if (clean(payload.node_id, 80) !== WINDOWS_NODE_ID) throw new Error("windows_node_id_invalid");
  if (clean(payload.contract_version, 80) !== WINDOWS_NODE_CONTRACT_VERSION) throw new Error("windows_node_contract_version_invalid");

  const active = await env.DB.prepare(`SELECT l.*,l.state AS lease_state,j.job_type,j.business_lane,j.payload_json,j.state AS job_state,j.current_step
    FROM hermes_automation_node_leases l JOIN hermes_automation_jobs j ON j.job_id=l.job_id
    WHERE l.node_id=? AND l.state IN ('ACTIVE','COMPLETING') AND l.lease_until>? LIMIT 1`).bind(WINDOWS_NODE_ID, now).first();
  if (active?.lease_state === "COMPLETING") return { status: "LEASE_COMPLETING", lease: null };
  if (active) return { status: "LEASE_REPLAY", lease: await claimResponse(env.DB, active, active) };

  const rows = await env.DB.prepare(`SELECT job_id,job_type,business_lane,payload_json,state,current_step,priority,available_at
    FROM hermes_automation_jobs
    WHERE state='WAITING_FREE_AI' AND (available_at IS NULL OR available_at<=?)
    ORDER BY priority DESC,created_at ASC LIMIT 20`).bind(now).all();

  for (const row of rows?.results || []) {
    const frozen = await frozenSemanticJob(row);
    if (!frozen) continue;
    const claimed = await env.DB.prepare(`UPDATE hermes_automation_jobs
      SET state='RUNNING',current_step='windows_free_ai',last_error_class=NULL,updated_at=?
      WHERE job_id=? AND state='WAITING_FREE_AI' AND (available_at IS NULL OR available_at<=?)`).bind(now, row.job_id, now).run();
    if (Number(claimed?.meta?.changes || 0) !== 1) continue;

    const previous = await env.DB.prepare("SELECT fence FROM hermes_automation_node_leases WHERE job_id=? LIMIT 1").bind(row.job_id).first();
    const fence = Math.max(1, Number(previous?.fence || 0) + 1);
    const leaseId = `lease:${crypto.randomUUID()}`;
    const leaseUntil = addSecondsIso(now, LEASE_SECONDS);
    try {
      await env.DB.prepare(`INSERT INTO hermes_automation_node_leases
        (job_id,node_id,lease_id,fence,lease_until,contract_sha256,state,output_sha256,claimed_at,updated_at)
        VALUES (?,?,?,?,?,?,'ACTIVE',NULL,?,?)
        ON CONFLICT(job_id) DO UPDATE SET node_id=excluded.node_id,lease_id=excluded.lease_id,fence=excluded.fence,
          lease_until=excluded.lease_until,contract_sha256=excluded.contract_sha256,state='ACTIVE',output_sha256=NULL,
          claimed_at=excluded.claimed_at,updated_at=excluded.updated_at
        WHERE hermes_automation_node_leases.state!='ACTIVE' OR hermes_automation_node_leases.lease_until<=?`)
        .bind(row.job_id, WINDOWS_NODE_ID, leaseId, fence, leaseUntil, frozen.contractSha, now, now, now).run();
    } catch (error) {
      await env.DB.prepare("UPDATE hermes_automation_jobs SET state='WAITING_FREE_AI',current_step='free_ai',available_at=?,last_error_class='windows_node_lease_conflict',updated_at=? WHERE job_id=? AND state='RUNNING' AND current_step='windows_free_ai'")
        .bind(now, now, row.job_id).run();
      continue;
    }
    const lease = await env.DB.prepare("SELECT * FROM hermes_automation_node_leases WHERE job_id=? AND state='ACTIVE' AND node_id=?").bind(row.job_id, WINDOWS_NODE_ID).first();
    if (!lease || lease.lease_id !== leaseId) {
      await env.DB.prepare("UPDATE hermes_automation_jobs SET state='WAITING_FREE_AI',current_step='free_ai',available_at=?,last_error_class='windows_node_lease_conflict',updated_at=? WHERE job_id=? AND state='RUNNING' AND current_step='windows_free_ai'")
        .bind(now, now, row.job_id).run();
      continue;
    }
    await appendEvent(env.DB, { jobId: row.job_id, eventType: "job.windows_node_leased", fromState: "WAITING_FREE_AI", toState: "RUNNING", step: "windows_free_ai", createdAt: now });
    await heartbeatWindowsNode(env, { node_id: WINDOWS_NODE_ID, contract_version: WINDOWS_NODE_CONTRACT_VERSION, model: payload.model, status: "BUSY", current_job_id: row.job_id }, now);
    return { status: "LEASE_ACCEPTED", lease: await claimResponse(env.DB, { ...row, state: "RUNNING", current_step: "windows_free_ai" }, lease) };
  }
  await heartbeatWindowsNode(env, { node_id: WINDOWS_NODE_ID, contract_version: WINDOWS_NODE_CONTRACT_VERSION, model: payload.model, status: "IDLE", current_job_id: null }, now);
  return { status: "NO_ELIGIBLE_WORK", lease: null };
}

export async function completeWindowsNodeJob(env, payload = {}, now = new Date().toISOString()) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureWindowsNodeSchema(env.DB);
  await ensureAiUsageLedgerSchema(env.DB);
  await recoverExpiredWindowsNodeLeases(env.DB, now);
  if (clean(payload.node_id, 80) !== WINDOWS_NODE_ID) throw new Error("windows_node_id_invalid");
  if (clean(payload.contract_version, 80) !== WINDOWS_NODE_CONTRACT_VERSION) throw new Error("windows_node_contract_version_invalid");
  const jobId = clean(payload.job_id, 160);
  const leaseId = clean(payload.lease_id, 160);
  const fence = Number(payload.fence);
  if (!jobId || !leaseId || !Number.isSafeInteger(fence) || fence < 1) throw new Error("windows_node_lease_identity_invalid");
  const model = clean(payload.model, 200);
  if (!model) throw new Error("windows_node_model_required");
  if (Number(payload.cost_usd) !== 0) throw new Error("windows_node_paid_inference_forbidden");
  if (!payload.semantic_result || typeof payload.semantic_result !== "object" || Array.isArray(payload.semantic_result)) throw new Error("windows_node_semantic_result_required");

  const outputSha = await sha256Json(payload.semantic_result);
  const suppliedSha = clean(payload.output_sha256, 80);
  if (suppliedSha && suppliedSha !== outputSha) throw new Error("windows_node_output_sha_mismatch");
  const existingLease = await env.DB.prepare("SELECT * FROM hermes_automation_node_leases WHERE job_id=? LIMIT 1").bind(jobId).first();
  if (!existingLease) throw new Error("windows_node_lease_missing");
  if (existingLease.node_id !== WINDOWS_NODE_ID || existingLease.lease_id !== leaseId) throw new Error("windows_node_lease_owner_mismatch");
  if (Number(existingLease.fence) !== fence) throw new Error("windows_node_stale_fence");
  if (existingLease.state === "COMPLETED") {
    if (existingLease.output_sha256 !== outputSha) throw new Error("windows_node_output_replay_mismatch");
    const job = await env.DB.prepare("SELECT state,result_json FROM hermes_automation_jobs WHERE job_id=? LIMIT 1").bind(jobId).first();
    return { status: "IDEMPOTENT_REPLAY", job_id: jobId, state: job?.state || null, result: job?.result_json ? JSON.parse(job.result_json) : null };
  }
  if (existingLease.state !== "ACTIVE") throw new Error("windows_node_lease_not_active");
  if (Date.parse(existingLease.lease_until) <= Date.parse(now)) throw new Error("windows_node_lease_expired");

  const completing = await env.DB.prepare("UPDATE hermes_automation_node_leases SET state='COMPLETING',updated_at=? WHERE job_id=? AND node_id=? AND lease_id=? AND fence=? AND state='ACTIVE' AND lease_until>?")
    .bind(now, jobId, WINDOWS_NODE_ID, leaseId, fence, now).run();
  if (Number(completing?.meta?.changes || 0) !== 1) throw new Error("windows_node_completion_conflict");

  try {
    const job = await env.DB.prepare("SELECT * FROM hermes_automation_jobs WHERE job_id=? AND state='RUNNING' AND current_step='windows_free_ai' LIMIT 1").bind(jobId).first();
    if (!job) throw new Error("windows_node_job_not_running");
    const frozen = await frozenSemanticJob(job);
    if (!frozen || frozen.contractSha !== existingLease.contract_sha256) throw new Error("windows_node_role_contract_drift");
    const validated = validateRoleContractSemanticResult(job.job_type, frozen.executionPayload, payload.semantic_result);
    const usage = payload.usage && typeof payload.usage === "object" ? payload.usage : {};
    const inputChars = finiteNonnegativeInteger(usage.input_chars);
    const outputChars = finiteNonnegativeInteger(usage.output_chars);
    if (inputChars === null || outputChars === null) throw new Error("windows_node_usage_chars_required");
    const inputTokens = finiteNonnegativeInteger(usage.input_tokens);
    const outputTokens = finiteNonnegativeInteger(usage.output_tokens);
    const usageId = `ai:${jobId}:windows:${fence}`;
    const finalResult = {
      capability: job.job_type,
      observed_at: now,
      external_write: false,
      role_contract: {
        role_id: frozen.contract.role_id,
        plugin_version: frozen.contract.plugin_version,
        contract_version: frozen.contract.contract_version,
        sha256: frozen.contractSha,
        semantic_required: true,
        free_ai_policy: frozen.contract.free_ai_policy,
      },
      semantic_execution: {
        provider_id: WINDOWS_NODE_PROVIDER_ID,
        model,
        budget_usd: 0,
        cost_usd: 0,
        usage_id: usageId,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        input_chars: inputChars,
        output_chars: outputChars,
      },
      result: validated,
    };
    const completedAt = now;
    const eventId = `evt:${jobId}:job.windows_node_succeeded:${fence}`;
    const canonicalSuccessEventId = `evt:${jobId}:job.succeeded:windows:${fence}`;
    const batch = [
      env.DB.prepare(`INSERT OR IGNORE INTO hermes_automation_ai_usage
        (usage_id,job_id,role_id,contract_version,contract_sha256,provider_id,model,budget_usd,cost_usd,input_tokens,output_tokens,input_chars,output_chars,status,created_at)
        VALUES (?,?,?,?,?,?,?,0,0,?,?,?,?, 'PROVIDER_RETURNED', ?)`)
        .bind(usageId, jobId, frozen.contract.role_id, frozen.contract.contract_version, frozen.contractSha, WINDOWS_NODE_PROVIDER_ID, model, inputTokens, outputTokens, inputChars, outputChars, completedAt),
      env.DB.prepare("UPDATE hermes_automation_jobs SET state='SUCCEEDED',current_step='complete',available_at=NULL,result_json=?,last_error_class=NULL,updated_at=?,completed_at=? WHERE job_id=? AND state='RUNNING' AND current_step='windows_free_ai'")
        .bind(JSON.stringify(finalResult), completedAt, completedAt, jobId),
      env.DB.prepare("INSERT OR IGNORE INTO hermes_automation_job_events (event_id,job_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at) VALUES (?,?,'job.windows_node_succeeded','RUNNING','SUCCEEDED','complete',?,?,NULL,?)")
        .bind(eventId, jobId, `sha256:${outputSha}`, WINDOWS_NODE_PROVIDER_ID, completedAt),
      env.DB.prepare("INSERT OR IGNORE INTO hermes_automation_job_events (event_id,job_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at) VALUES (?,?,'job.succeeded','RUNNING','SUCCEEDED','complete',?,?,NULL,?)")
        .bind(canonicalSuccessEventId, jobId, `sha256:${outputSha}`, WINDOWS_NODE_PROVIDER_ID, completedAt),
      env.DB.prepare("UPDATE hermes_automation_node_leases SET state='COMPLETED',output_sha256=?,updated_at=? WHERE job_id=? AND node_id=? AND lease_id=? AND fence=? AND state='COMPLETING'")
        .bind(outputSha, completedAt, jobId, WINDOWS_NODE_ID, leaseId, fence),
    ];
    if (typeof env.DB.batch === "function") await env.DB.batch(batch);
    else for (const statement of batch) await statement.run();
    await heartbeatWindowsNode(env, { node_id: WINDOWS_NODE_ID, contract_version: WINDOWS_NODE_CONTRACT_VERSION, model, status: "IDLE", current_job_id: null }, now);
    return { status: "SUCCEEDED", job_id: jobId, result: finalResult, output_sha256: outputSha };
  } catch (error) {
    await env.DB.prepare("UPDATE hermes_automation_node_leases SET state='ACTIVE',updated_at=? WHERE job_id=? AND node_id=? AND lease_id=? AND fence=? AND state='COMPLETING'")
      .bind(now, jobId, WINDOWS_NODE_ID, leaseId, fence).run();
    throw error;
  }
}

export async function windowsNodeSnapshot(env) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureWindowsNodeSchema(env.DB);
  const node = await env.DB.prepare("SELECT * FROM hermes_automation_nodes WHERE node_id=? LIMIT 1").bind(WINDOWS_NODE_ID).first();
  const activeLease = await env.DB.prepare("SELECT job_id,lease_id,fence,lease_until,state FROM hermes_automation_node_leases WHERE node_id=? AND state='ACTIVE' LIMIT 1").bind(WINDOWS_NODE_ID).first();
  const lastSeen = node?.last_seen_at ? Date.parse(node.last_seen_at) : 0;
  return {
    configured: nodeEnabled(env),
    node_id: WINDOWS_NODE_ID,
    online: Boolean(lastSeen && Date.now() - lastSeen <= 90000),
    last_seen_at: node?.last_seen_at || null,
    model: node?.model || null,
    status: node?.status || "UNKNOWN",
    current_job_id: node?.current_job_id || null,
    active_lease: activeLease || null,
    inbound_exposure_required: false,
    production_write_authorized: false,
  };
}
