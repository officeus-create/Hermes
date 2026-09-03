import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  cleanWebsiteFactoryText,
  ensureWebsiteFactorySchema,
  normalizeWebsiteFactoryPayload,
  parseWebsiteFactoryDraft,
  websiteFactoryReadiness,
} from "../../_lib/website-factory.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = { DB?: any; LEAD_EMAIL_SERVICE?: ServiceFetcher; LEAD_SERVICE_TOKEN?: string };
type Context = { request: Request; env: Env; params: { id?: string } };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);
const cleanId = (value: unknown) => String(value || "").trim().slice(0, 180);
const EMAIL_SERVICE_URL = "https://lead-email.internal/v1/send";

async function ownDraft(db: any, specialistId: string, id: string) {
  return db.prepare(`
    SELECT id, title, current_step, state, payload_json, created_at, updated_at, submitted_at
    FROM website_factory_drafts
    WHERE id = ? AND specialist_id = ?
    LIMIT 1
  `).bind(id, specialistId).first();
}

async function ownHandoff(db: any, specialistId: string, draftId: string) {
  return db.prepare(`
    SELECT draft_id, notification_status, notification_error, last_attempt_at, created_at, updated_at
    FROM website_factory_handoffs
    WHERE draft_id = ? AND specialist_id = ?
    LIMIT 1
  `).bind(draftId, specialistId).first();
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

function handoffEmailText(draft: any, specialist: any, payload: any) {
  const facts = payload?.facts || {};
  const goals = payload?.goals || {};
  const references = Array.isArray(payload?.references) ? payload.references : [];
  const capabilities = Array.isArray(payload?.capabilities) ? payload.capabilities.filter((item: any) => item?.included).map((item: any) => item.id) : [];
  const sources = Array.isArray(payload?.sources) ? payload.sources.map((item: any) => item.url).filter(Boolean) : [];
  return [
    "Hermes Website Factory Brief",
    "----------------------------",
    `Brief ID: ${draft.id}`,
    `Owner: ${cleanWebsiteFactoryText(specialist?.name, 120) || "Hermes account owner"}`,
    `Owner email: ${cleanWebsiteFactoryText(specialist?.email, 180)}`,
    `Draft title: ${cleanWebsiteFactoryText(draft.title, 160)}`,
    `Business: ${cleanWebsiteFactoryText(facts.business_name, 180) || "Not provided"}`,
    `Category: ${cleanWebsiteFactoryText(facts.category, 160) || "Not provided"}`,
    `Primary goal: ${cleanWebsiteFactoryText(goals.primary, 160) || "Not provided"}`,
    `Target market: ${cleanWebsiteFactoryText(goals.geography, 300) || "Not provided"}`,
    `Primary action: ${cleanWebsiteFactoryText(goals.primary_action, 300) || "Not provided"}`,
    `Pages: ${Array.isArray(payload?.pages) ? payload.pages.join(", ") : "Not provided"}`,
    `Capabilities: ${capabilities.join(", ") || "None selected"}`,
    "",
    "Owner brief:",
    cleanWebsiteFactoryText(payload?.brief?.text, 5000) || "Not provided",
    "",
    "Public sources:",
    ...(sources.length ? sources.slice(0, 20).map((url: string) => `- ${url}`) : ["- Starting from zero / no source supplied"]),
    "",
    "Reference roles:",
    ...references.slice(0, 6).map((item: any) => `- ${cleanWebsiteFactoryText(item.role, 80)}: ${cleanWebsiteFactoryText(item.url, 2048)}`),
    "",
    `Submitted at: ${draft.submitted_at || new Date().toISOString()}`,
    "Source: Hermes Connect Website Factory",
  ].join("\n").slice(0, 12_000);
}

async function deliverHandoff(env: Env, specialist: any, draft: any, payload: any) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO website_factory_handoffs
      (draft_id, specialist_id, notification_status, notification_error, last_attempt_at, created_at, updated_at)
    VALUES (?, ?, 'pending', NULL, ?, ?, ?)
    ON CONFLICT(draft_id) DO UPDATE SET
      notification_status = 'pending',
      notification_error = NULL,
      last_attempt_at = excluded.last_attempt_at,
      updated_at = excluded.updated_at
  `).bind(draft.id, specialist.id, now, now, now).run();

  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) {
    await env.DB.prepare(`
      UPDATE website_factory_handoffs
      SET notification_status = 'pending', notification_error = 'delivery_not_configured', updated_at = ?
      WHERE draft_id = ? AND specialist_id = ?
    `).bind(now, draft.id, specialist.id).run();
    return { notification_status: "pending", notification_error: "delivery_not_configured" };
  }

  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(EMAIL_SERVICE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        request_id: `website_factory_${draft.id}`,
        subject: `[HERMES WEBSITE FACTORY] ${cleanWebsiteFactoryText(draft.title, 100)}`,
        text: handoffEmailText(draft, specialist, payload),
        reply_to: cleanWebsiteFactoryText(specialist.email, 180),
      }),
    });
    const status = response.ok ? "sent" : "failed";
    const error = response.ok ? null : `delivery_http_${response.status}`;
    await env.DB.prepare(`
      UPDATE website_factory_handoffs
      SET notification_status = ?, notification_error = ?, updated_at = ?
      WHERE draft_id = ? AND specialist_id = ?
    `).bind(status, error, new Date().toISOString(), draft.id, specialist.id).run();
    return { notification_status: status, notification_error: error };
  } catch {
    await env.DB.prepare(`
      UPDATE website_factory_handoffs
      SET notification_status = 'failed', notification_error = 'delivery_failed', updated_at = ?
      WHERE draft_id = ? AND specialist_id = ?
    `).bind(new Date().toISOString(), draft.id, specialist.id).run();
    return { notification_status: "failed", notification_error: "delivery_failed" };
  }
}

async function handoffState(env: Env, specialist: any, draft: any, payload: any, { retry = false } = {}) {
  const existing = await ownHandoff(env.DB, specialist.id, draft.id);
  if (existing?.notification_status === "sent") return { notification_status: "sent", notification_error: null };
  if (!retry && existing) return { notification_status: existing.notification_status, notification_error: existing.notification_error || null };
  return deliverHandoff(env, specialist, draft, payload);
}

export async function onRequestGet({ request, env, params }: Context) {
  const context = await authContext(request, env, params.id);
  if (context.response) return context.response;
  const handoff = context.row.state === "submitted" ? await ownHandoff(env.DB, context.specialist.id, context.id) : null;
  return jsonResponse(200, {
    success: true,
    draft: parseWebsiteFactoryDraft(context.row),
    handoff: handoff ? { notification_status: handoff.notification_status, notification_error: handoff.notification_error || null } : null,
  }, { "Cache-Control": "no-store" });
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

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  if (body.action !== "submit") return jsonResponse(400, { success: false, error: "action_invalid" });

  let payload;
  try { payload = normalizeWebsiteFactoryPayload(JSON.parse(context.row.payload_json || "{}")); }
  catch { return jsonResponse(409, { success: false, error: "stored_draft_invalid" }); }

  if (context.row.state === "submitted") {
    const notification = await handoffState(env, context.specialist, context.row, payload, { retry: true });
    return jsonResponse(200, {
      success: true,
      draft: parseWebsiteFactoryDraft(context.row),
      already_submitted: true,
      handoff: {
        state: "brief_created",
        build_started: false,
        ...notification,
        message: "Your website brief is saved for Hermes review. No automated production build has been started.",
      },
    }, { "Cache-Control": "no-store" });
  }

  const readiness = websiteFactoryReadiness(payload);
  if (!readiness.ready) return jsonResponse(409, { success: false, error: "brief_not_ready", reasons: readiness.reasons });

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE website_factory_drafts
    SET state = 'submitted', current_step = 9, updated_at = ?, submitted_at = ?
    WHERE id = ? AND specialist_id = ?
  `).bind(now, now, context.id, context.specialist.id).run();
  const row = await ownDraft(env.DB, context.specialist.id, context.id);
  const notification = await handoffState(env, context.specialist, row, payload, { retry: true });
  return jsonResponse(200, {
    success: true,
    draft: parseWebsiteFactoryDraft(row),
    handoff: {
      state: "brief_created",
      build_started: false,
      ...notification,
      message: "Your website brief is saved for Hermes review. No automated production build has been started.",
    },
  }, { "Cache-Control": "no-store" });
}

export async function onRequestDelete({ request, env, params }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const context = await authContext(request, env, params.id);
  if (context.response) return context.response;
  if (context.row.state === "submitted") return jsonResponse(409, { success: false, error: "submitted_draft_cannot_be_deleted" });
  await env.DB.prepare("DELETE FROM website_factory_handoffs WHERE draft_id = ? AND specialist_id = ?").bind(context.id, context.specialist.id).run();
  await env.DB.prepare("DELETE FROM website_factory_drafts WHERE id = ? AND specialist_id = ?").bind(context.id, context.specialist.id).run();
  return jsonResponse(200, { success: true, deleted: true }, { "Cache-Control": "no-store" });
}
