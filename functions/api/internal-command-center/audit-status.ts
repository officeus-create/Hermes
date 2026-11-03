import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { HAE_AUDIT_JOB_TYPES, summarizeHaeAudits } from "../../../src/lib/hae-audit-summary.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  const table = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='hermes_automation_jobs' LIMIT 1",
  ).first();
  if (!table) {
    return jsonResponse(200, { success: true, audit: summarizeHaeAudits([], new Date().toISOString()) }, headers);
  }
  const placeholders = HAE_AUDIT_JOB_TYPES.map(() => "?").join(",");
  const result = await env.DB.prepare(
    `SELECT job_type,state,result_json,updated_at,completed_at
     FROM hermes_automation_jobs
     WHERE job_type IN (${placeholders})
     ORDER BY updated_at DESC
     LIMIT 100`,
  ).bind(...HAE_AUDIT_JOB_TYPES).all();
  return jsonResponse(200, {
    success: true,
    audit: summarizeHaeAudits(result.results || [], new Date().toISOString()),
  }, headers);
}
