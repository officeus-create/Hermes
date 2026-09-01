import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  cleanWebsiteFactoryText,
  ensureWebsiteFactorySchema,
  normalizeWebsiteFactoryPayload,
  parseWebsiteFactoryDraft,
  websiteFactoryReadiness,
} from "../../_lib/website-factory.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env; params: { id?: string } };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);
const cleanId = (value: unknown) => String(value || "").trim().slice(0, 180);

async function ownDraft(db: any, specialistId: string, id: string) {
  return db.prepare(`
    SELECT id, title, current_step, state, payload_json, created_at, updated_at, submitted_at
    FROM website_factory_drafts
    WHERE id = ? AND specialist_id = ?
    LIMIT 1
  `).bind(id, specialistId).first();
}

async function authContext(request: Request, env: Env, idValue: unknown) {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  const id = cleanId(idValue);
  if (!id) return { response: jsonResponse(400, { success: false, error: "draft_id_invalid" }) };
  await ensureWebsiteFactorySchema(env.DB);
  const row = await ownDraft(env.DB, specialist.id, id);
  if (!row) return { response: jsonResponse(404, { success: false, error: "draft_not_found" }) };
  return { specialist, id, row };
}

export async function onRequestGet({ request, env, params }: Context) {
  const context = await authContext(request, env, params.id);
  if (context.response) return context.response;
  return jsonResponse(200, { success: true, draft: parseWebsiteFactoryDraft(context.row) }, { "Cache-Control": "no-store" });
}

export async function onRequestPut({ request, env, params }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const context = await authContext(request, env, params.id);
  if (context.response) return context.response;
  if (context.row.state === "submitted") return jsonResponse(409, { success: false, error: "submitted_draft_is_immutable" });

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const forbidden = ["specialist_id", "owner_id", "submitted_at", "state", "created_at"];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "protected_draft_fields_not_editable" });
  }

  let payload;
  try { payload = normalizeWebsiteFactoryPayload(body.payload); }
  catch (error) { return jsonResponse(400, { success: false, error: error instanceof Error ? error.message : "invalid_payload" }); }

  const currentStep = Math.max(1, Math.min(9, Number(body.current_step || context.row.current_step || 1)));
  const title = cleanWebsiteFactoryText(body.title, 120) || context.row.title || "Untitled website brief";
  const readiness = websiteFactoryReadiness(payload);
  const state = readiness.ready ? "brief_ready" : "draft";
  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE website_factory_drafts
    SET title = ?, current_step = ?, state = ?, payload_json = ?, updated_at = ?
    WHERE id = ? AND specialist_id = ?
  `).bind(title, currentStep, state, JSON.stringify(payload), now, context.id, context.specialist.id).run();

  const row = await ownDraft(env.DB, context.specialist.id, context.id);
  return jsonResponse(200, { success: true, draft: parseWebsiteFactoryDraft(row), readiness }, { "Cache-Control": "no-store" });
}

export async function onRequestPost({ request, env, params }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const context = await authContext(request, env, params.id);
  if (context.response) return context.response;
  if (context.row.state === "submitted") return jsonResponse(200, { success: true, draft: parseWebsiteFactoryDraft(context.row), already_submitted: true }, { "Cache-Control": "no-store" });

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  if (body.action !== "submit") return jsonResponse(400, { success: false, error: "action_invalid" });

  let payload;
  try { payload = normalizeWebsiteFactoryPayload(JSON.parse(context.row.payload_json || "{}")); }
  catch { return jsonResponse(409, { success: false, error: "stored_draft_invalid" }); }
  const readiness = websiteFactoryReadiness(payload);
  if (!readiness.ready) return jsonResponse(409, { success: false, error: "brief_not_ready", reasons: readiness.reasons });

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE website_factory_drafts
    SET state = 'submitted', current_step = 9, updated_at = ?, submitted_at = ?
    WHERE id = ? AND specialist_id = ?
  `).bind(now, now, context.id, context.specialist.id).run();
  const row = await ownDraft(env.DB, context.specialist.id, context.id);
  return jsonResponse(200, {
    success: true,
    draft: parseWebsiteFactoryDraft(row),
    handoff: {
      state: "brief_created",
      build_started: false,
      message: "Your website brief is saved for Hermes review. No automated production build has been started.",
    },
  }, { "Cache-Control": "no-store" });
}

export async function onRequestDelete({ request, env, params }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const context = await authContext(request, env, params.id);
  if (context.response) return context.response;
  if (context.row.state === "submitted") return jsonResponse(409, { success: false, error: "submitted_draft_cannot_be_deleted" });
  await env.DB.prepare("DELETE FROM website_factory_drafts WHERE id = ? AND specialist_id = ?").bind(context.id, context.specialist.id).run();
  return jsonResponse(200, { success: true, deleted: true }, { "Cache-Control": "no-store" });
}
