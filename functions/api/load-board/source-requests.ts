import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };

const SOURCE_TYPES = new Set(["api", "email", "webhook", "manual", "csv"]);
const REDISTRIBUTION = new Set(["internal_only", "carrier_only", "public"]);
const CONTACT_MODES = new Set(["hidden", "hermes_review", "source_direct"]);
const SOURCE_COMPANY_TYPES = new Set(["broker", "shipper", "dealer"]);

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

function clean(value: unknown, max = 240) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, max);
}

function safeRequest(row: any) {
  return {
    id: row.id,
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
    activates_ingestion: false,
  };
}

async function getSourceCompany(db: any, specialistId: string) {
  await ensureHermesCompanyProfilesSchema(db);
  return db.prepare(`
    SELECT id, company_name, company_type, load_board_access
    FROM hermes_company_profiles
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(specialistId).first();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  const company = await getSourceCompany(env.DB, specialist.id);
  if (!company || Number(company.load_board_access) !== 1) {
    return jsonResponse(403, { success: false, error: "company_load_board_access_required" });
  }

  await ensureLoadBoardSchema(env.DB);
  const result = await env.DB.prepare(`
    SELECT * FROM hermes_load_source_requests
    WHERE company_id = ?
    ORDER BY updated_at DESC
    LIMIT 100
  `).bind(company.id).all();

  return jsonResponse(200, {
    success: true,
    eligible_to_propose_source: SOURCE_COMPANY_TYPES.has(String(company.company_type || "")),
    company: { id: company.id, name: company.company_name, type: company.company_type },
    requests: (result?.results || []).map(safeRequest),
    boundary: "A source request is a review application only. It never activates ingestion, redistribution, provider contact or credentials.",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "cross_site_mutation_blocked" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });

  const company = await getSourceCompany(env.DB, specialist.id);
  if (!company || Number(company.load_board_access) !== 1) {
    return jsonResponse(403, { success: false, error: "company_load_board_access_required" });
  }
  if (!SOURCE_COMPANY_TYPES.has(String(company.company_type || ""))) {
    return jsonResponse(403, { success: false, error: "source_company_type_required" });
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const sourceName = clean(body.source_name ?? body.sourceName, 140);
  const sourceType = clean(body.source_type ?? body.sourceType, 20).toLowerCase();
  const providerName = clean(body.provider_name ?? body.providerName, 120);
  const feedReference = clean(body.feed_reference ?? body.feedReference, 240);
  const redistribution = clean(body.requested_redistribution_permission ?? body.redistributionPermission, 30).toLowerCase() || "internal_only";
  const contactMode = clean(body.requested_contact_reveal_permission ?? body.contactRevealPermission, 30).toLowerCase() || "hidden";
  const notes = clean(body.notes, 600);

  const errors: string[] = [];
  if (sourceName.length < 2) errors.push("source_name_required");
  if (!SOURCE_TYPES.has(sourceType)) errors.push("source_type_invalid");
  if (!REDISTRIBUTION.has(redistribution)) errors.push("redistribution_permission_invalid");
  if (!CONTACT_MODES.has(contactMode)) errors.push("contact_mode_invalid");
  const secretText = `${feedReference} ${notes}`;
  if (/(bearer\s+|api[_ -]?key\s*[:=]|password\s*[:=]|secret\s*[:=]|token\s*[:=])/i.test(secretText)) errors.push("credentials_not_allowed");
  if (errors.length) return jsonResponse(400, { success: false, errors });

  await ensureLoadBoardSchema(env.DB);
  const now = new Date().toISOString();
  const requestId = `lbsr_${crypto.randomUUID()}`;
  await env.DB.prepare(`
    INSERT INTO hermes_load_source_requests (
      id, company_id, specialist_id, source_name, source_type, provider_name, feed_reference,
      requested_redistribution_permission, requested_contact_reveal_permission,
      notes, status, review_note, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', NULL, ?, ?)
    ON CONFLICT(company_id, source_name) DO UPDATE SET
      specialist_id = excluded.specialist_id,
      source_type = excluded.source_type,
      provider_name = excluded.provider_name,
      feed_reference = excluded.feed_reference,
      requested_redistribution_permission = excluded.requested_redistribution_permission,
      requested_contact_reveal_permission = excluded.requested_contact_reveal_permission,
      notes = excluded.notes,
      status = 'pending_review',
      review_note = NULL,
      updated_at = excluded.updated_at
  `).bind(
    requestId,
    company.id,
    specialist.id,
    sourceName,
    sourceType,
    providerName || null,
    feedReference || null,
    redistribution,
    contactMode,
    notes || null,
    now,
    now,
  ).run();

  const saved = await env.DB.prepare(`
    SELECT * FROM hermes_load_source_requests
    WHERE company_id = ? AND source_name = ?
    LIMIT 1
  `).bind(company.id, sourceName).first();

  return jsonResponse(202, {
    success: true,
    request: safeRequest(saved),
    next_state: "pending_hermes_review",
    source_activated: false,
    ingestion_enabled: false,
    redistribution_enabled: false,
    provider_contacted: false,
    credentials_accepted: false,
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
