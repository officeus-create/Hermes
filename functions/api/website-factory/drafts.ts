import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  cleanWebsiteFactoryText,
  ensureWebsiteFactorySchema,
  normalizeWebsiteFactoryPayload,
  parseWebsiteFactoryDraft,
} from "../_lib/website-factory.mjs";

type Env = { DB?: any };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  await ensureWebsiteFactorySchema(env.DB);
  const result = await env.DB.prepare(`
    SELECT id, title, current_step, state, payload_json, created_at, updated_at, submitted_at
    FROM website_factory_drafts
    WHERE specialist_id = ?
    ORDER BY updated_at DESC
    LIMIT 20
  `).bind(specialist.id).all();
  const drafts = Array.isArray(result?.results) ? result.results.map(parseWebsiteFactoryDraft) : [];
  return jsonResponse(200, {
    success: true,
    identity: { id: specialist.id, email: specialist.email, name: specialist.name, role: specialist.role },
    drafts,
  }, { "Cache-Control": "no-store" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: Record<string, unknown> = {};
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  let payload;
  try { payload = normalizeWebsiteFactoryPayload({ starting_from_zero: Boolean(body.starting_from_zero) }); }
  catch (error) { return jsonResponse(400, { success: false, error: error instanceof Error ? error.message : "invalid_payload" }); }

  await ensureWebsiteFactorySchema(env.DB);
  const id = `website-draft-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const title = cleanWebsiteFactoryText(body.title, 120) || "Untitled website brief";
  await env.DB.prepare(`
    INSERT INTO website_factory_drafts
      (id, specialist_id, title, current_step, state, payload_json, created_at, updated_at, submitted_at)
    VALUES (?, ?, ?, 1, 'draft', ?, ?, ?, NULL)
  `).bind(id, specialist.id, title, JSON.stringify(payload), now, now).run();

  const row = await env.DB.prepare(`
    SELECT id, title, current_step, state, payload_json, created_at, updated_at, submitted_at
    FROM website_factory_drafts WHERE id = ? AND specialist_id = ? LIMIT 1
  `).bind(id, specialist.id).first();
  return jsonResponse(201, { success: true, draft: parseWebsiteFactoryDraft(row) }, { "Cache-Control": "no-store" });
}
