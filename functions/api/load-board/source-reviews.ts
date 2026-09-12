import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };
const REVIEW_STATES = new Set(["approved", "rejected", "needs_information", "pending_review"]);

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

function clean(value: unknown, max = 800) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, max);
}

function publicReview(row: any) {
  return {
    id: row.id,
    company_id: row.company_id,
    company_name: row.company_name,
    company_type: row.company_type,
    source_name: row.source_name,
    source_type: row.source_type,
    provider_name: row.provider_name || null,
    feed_reference: row.feed_reference || null,
    requested_redistribution_permission: row.requested_redistribution_permission,
    requested_contact_reveal_permission: row.requested_contact_reveal_permission,
    notes: row.notes || null,
    status: row.status,
    review_note: row.review_note || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    source_activated: false,
    credentials_present: false,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureLoadBoardSchema(env.DB);

  const url = new URL(request.url);
  const requestedStatus = clean(url.searchParams.get("status"), 40) || "pending_review";
  const status = REVIEW_STATES.has(requestedStatus) ? requestedStatus : "pending_review";
  const rows = await env.DB.prepare(`
    SELECT r.*, c.company_name, c.company_type
    FROM hermes_load_source_requests r
    LEFT JOIN hermes_company_profiles c ON c.id = r.company_id
    WHERE r.status = ?
    ORDER BY r.updated_at DESC
    LIMIT 200
  `).bind(status).all();

  return jsonResponse(200, {
    success: true,
    status,
    requests: (rows?.results || []).map(publicReview),
    boundary: "Review status never activates ingestion, credentials, redistribution or provider contact. Activation remains a separate owner/commercial/data-rights gate.",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "cross_site_mutation_blocked" });
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureLoadBoardSchema(env.DB);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const requestId = clean(body.request_id ?? body.requestId, 160).replace(/[^a-zA-Z0-9_:-]/g, "");
  const status = clean(body.status, 40).toLowerCase();
  const reviewNote = clean(body.review_note ?? body.reviewNote, 800);
  if (!requestId) return jsonResponse(400, { success: false, error: "request_id_required" });
  if (!REVIEW_STATES.has(status) || status === "pending_review") {
    return jsonResponse(400, { success: false, error: "review_status_invalid" });
  }
  if ((status === "rejected" || status === "needs_information") && reviewNote.length < 3) {
    return jsonResponse(400, { success: false, error: "review_note_required" });
  }

  const existing = await env.DB.prepare(`
    SELECT id FROM hermes_load_source_requests WHERE id = ? LIMIT 1
  `).bind(requestId).first();
  if (!existing) return jsonResponse(404, { success: false, error: "source_request_not_found" });

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hermes_load_source_requests
    SET status = ?, review_note = ?, updated_at = ?
    WHERE id = ?
  `).bind(status, reviewNote || null, now, requestId).run();

  const saved = await env.DB.prepare(`
    SELECT r.*, c.company_name, c.company_type
    FROM hermes_load_source_requests r
    LEFT JOIN hermes_company_profiles c ON c.id = r.company_id
    WHERE r.id = ?
    LIMIT 1
  `).bind(requestId).first();

  return jsonResponse(200, {
    success: true,
    request: publicReview(saved),
    source_activated: false,
    ingestion_enabled: false,
    redistribution_enabled: false,
    provider_contacted: false,
    next_gate: status === "approved" ? "separate_connection_and_data_rights_activation" : "company_follow_up_or_revision",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
