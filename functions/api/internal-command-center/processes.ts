import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import {
  HAE_OWNER_PROCESS_TEMPLATES,
  ensureHaeProcessSchema,
  haeProcessEventStatement,
  haeProcessTemplate,
  newHaeProcessId,
  normalizeHaeProcessCadence,
  normalizeHaeProcessName,
  publicHaeProcess,
} from "../../../src/lib/hae-process-control.mjs";

type Env = { DB?: any };
const SCOPE = "hermes_internal";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site"
  && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

async function processRows(db: any) {
  const jobsTable = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='hermes_automation_jobs' LIMIT 1",
  ).first();
  if (!jobsTable) {
    return db.prepare(`SELECT p.*, NULL AS last_job_state, NULL AS last_job_completed_at, NULL AS last_job_error_class
      FROM hermes_automation_processes p WHERE p.organization_scope=? ORDER BY p.created_at DESC`).bind(SCOPE).all();
  }
  return db.prepare(`SELECT p.*, j.state AS last_job_state, j.completed_at AS last_job_completed_at,
    j.last_error_class AS last_job_error_class
    FROM hermes_automation_processes p
    LEFT JOIN hermes_automation_jobs j ON j.job_id=p.last_job_id
    WHERE p.organization_scope=? ORDER BY
      CASE p.status WHEN 'active' THEN 0 WHEN 'blocked' THEN 1 ELSE 2 END,
      p.created_at DESC`).bind(SCOPE).all();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  await ensureHaeProcessSchema(env.DB);
  const result = await processRows(env.DB);
  return jsonResponse(200, {
    success: true,
    runtime_owner: "hermes-automation-engine",
    tick_interval: "hourly",
    normal_loop_requires_chat: false,
    automatic_paid_ai_cost_usd: 0,
    processes: (result.results || []).map(publicHaeProcess),
    templates: HAE_OWNER_PROCESS_TEMPLATES,
  }, headers);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" }, headers);
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  await ensureHaeProcessSchema(env.DB);
  let payload: any; try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }
  const template = haeProcessTemplate(payload?.job_type);
  if (!template) return jsonResponse(400, { success: false, error: "process_job_type_not_allowed" }, headers);
  const cadence = normalizeHaeProcessCadence(template.job_type, payload?.cadence_hours);
  if (!cadence) return jsonResponse(400, { success: false, error: "process_cadence_not_allowed" }, headers);
  const name = normalizeHaeProcessName(payload?.name, template.label);
  if (!name) return jsonResponse(400, { success: false, error: "process_name_invalid" }, headers);
  const id = newHaeProcessId(), now = new Date().toISOString();
  let inserted: any;
  try {
    [inserted] = await env.DB.batch([
      env.DB.prepare(`INSERT INTO hermes_automation_processes
        (process_id,organization_scope,name,job_type,business_lane,workstream,role_id,cadence_hours,timezone,status,max_cost_usd_cents,created_by,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,'UTC','paused',0,?,?,?)`).bind(
      id,
      SCOPE,
      name,
      template.job_type,
      template.business_lane,
      template.workstream,
      template.role_id,
      cadence,
      String(owner.specialist.id),
      now,
      now,
      ),
      haeProcessEventStatement(env.DB, {
        processId: id,
        eventType: "process.created",
        actorSpecialistId: String(owner.specialist.id),
        toStatus: "paused",
        createdAt: now,
      }),
    ]);
  } catch (error) {
    const existing = await env.DB.prepare(
      "SELECT process_id FROM hermes_automation_processes WHERE organization_scope=? AND job_type=? LIMIT 1",
    ).bind(SCOPE, template.job_type).first();
    if (existing) return jsonResponse(409, { success: false, error: "process_job_type_already_configured" }, headers);
    throw error;
  }
  if (Number(inserted?.meta?.changes || 0) !== 1) {
    return jsonResponse(409, { success: false, error: "process_job_type_already_configured" }, headers);
  }
  const row = await env.DB.prepare(
    "SELECT * FROM hermes_automation_processes WHERE process_id=? AND organization_scope=?",
  ).bind(id, SCOPE).first();
  return jsonResponse(201, { success: true, process: publicHaeProcess(row) }, headers);
}
