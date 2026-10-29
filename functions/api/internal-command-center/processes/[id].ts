import { jsonResponse } from "../../_lib/session.mjs";
import { requireInternalOwner } from "../../_lib/internal-ai.mjs";
import {
  ensureHaeProcessSchema,
  haeProcessEventStatement,
  publicHaeProcess,
} from "../../../../src/lib/hae-process-control.mjs";

type Env = { DB?: any };
const SCOPE = "hermes_internal";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site"
  && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

async function getProcess(db: any, id: string) {
  return db.prepare("SELECT * FROM hermes_automation_processes WHERE process_id=? AND organization_scope=? LIMIT 1")
    .bind(id, SCOPE).first();
}

export async function onRequestPatch({ request, env, params }: { request: Request; env: Env; params: any }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" }, headers);
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  await ensureHaeProcessSchema(env.DB);
  const id = String(params.id || "");
  let row = await getProcess(env.DB, id);
  if (!row) return jsonResponse(404, { success: false, error: "process_not_found" }, headers);
  let payload: any; try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }
  const action = String(payload?.action || "").trim();
  const now = new Date().toISOString();
  const actor = String(owner.specialist.id);
  let nextStatus = String(row.status);
  let eventType = "";
  let update: any;

  if (action === "activate") {
    if (row.lease_until && Date.parse(String(row.lease_until)) > Date.parse(now)) {
      return jsonResponse(409, { success: false, error: "process_run_in_flight", process: publicHaeProcess(row) }, headers);
    }
    nextStatus = "active"; eventType = "process.activated";
    update = env.DB.prepare(`UPDATE hermes_automation_processes
      SET status='active',next_run_at=?,lease_until=NULL,last_error_class=NULL,updated_at=?
      WHERE process_id=? AND organization_scope=? AND (lease_until IS NULL OR lease_until<=?)`).bind(now, now, id, SCOPE, now);
  } else if (action === "pause") {
    if (row.lease_until && Date.parse(String(row.lease_until)) > Date.parse(now)) {
      return jsonResponse(409, { success: false, error: "process_run_in_flight", process: publicHaeProcess(row) }, headers);
    }
    nextStatus = "paused"; eventType = "process.paused";
    update = env.DB.prepare(`UPDATE hermes_automation_processes
      SET status='paused',lease_until=NULL,updated_at=?
      WHERE process_id=? AND organization_scope=? AND (lease_until IS NULL OR lease_until<=?)`).bind(now, id, SCOPE, now);
  } else if (action === "run_next_tick") {
    if (String(row.status) !== "active") {
      return jsonResponse(409, { success: false, error: "process_not_active", process: publicHaeProcess(row) }, headers);
    }
    if (row.lease_until && Date.parse(String(row.lease_until)) > Date.parse(now)) {
      return jsonResponse(409, { success: false, error: "process_run_in_flight", process: publicHaeProcess(row) }, headers);
    }
    eventType = "process.run_requested";
    update = env.DB.prepare(`UPDATE hermes_automation_processes
      SET next_run_at=?,last_error_class=NULL,updated_at=?
      WHERE process_id=? AND organization_scope=? AND status='active'
        AND (lease_until IS NULL OR lease_until<=?)`).bind(now, now, id, SCOPE, now);
  } else {
    return jsonResponse(400, { success: false, error: "invalid_action" }, headers);
  }

  const [changed] = await env.DB.batch([
    update,
    haeProcessEventStatement(env.DB, {
      processId: id,
      eventType,
      actorSpecialistId: actor,
      fromStatus: String(row.status),
      toStatus: nextStatus,
      createdAt: now,
      onlyIfPreviousStatementChanged: true,
    }),
  ]);
  if (Number(changed?.meta?.changes || 0) !== 1) {
    row = await getProcess(env.DB, id);
    return jsonResponse(409, { success: false, error: "process_state_conflict", process: publicHaeProcess(row) }, headers);
  }
  row = await getProcess(env.DB, id);
  return jsonResponse(200, { success: true, process: publicHaeProcess(row) }, headers);
}
