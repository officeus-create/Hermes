import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

function cleanId(value: unknown) {
  return String(value ?? "").trim().replace(/[^a-zA-Z0-9_:-]/g, "").slice(0, 160);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "cross_site_mutation_blocked" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });

  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureLoadBoardSchema(env.DB);

  const company = await env.DB.prepare(`
    SELECT id, load_board_access
    FROM hermes_company_profiles
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(specialist.id).first();
  if (!company || Number(company.load_board_access) !== 1) {
    return jsonResponse(403, { success: false, error: "company_load_board_access_required" });
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const loadId = cleanId(body.load_id ?? body.loadId);
  if (!loadId) return jsonResponse(400, { success: false, error: "load_id_required" });

  const now = new Date().toISOString();
  const load = await env.DB.prepare(`
    SELECT id, source_id, source_name, equipment, origin, destination, expires_at, visibility
    FROM hermes_load_records
    WHERE id = ?
      AND record_type = 'load'
      AND status = 'active'
      AND expires_at > ?
      AND visibility IN ('public', 'carrier_only')
    LIMIT 1
  `).bind(loadId, now).first();
  if (!load) return jsonResponse(404, { success: false, error: "load_not_available" });

  const requestId = `lbi_${crypto.randomUUID()}`;
  await env.DB.prepare(`
    INSERT INTO hermes_load_interest_requests (
      id, load_record_id, specialist_id, company_id, action_type, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'request_details', 'requested', ?, ?)
    ON CONFLICT(load_record_id, company_id, action_type) DO UPDATE SET
      specialist_id = excluded.specialist_id,
      updated_at = excluded.updated_at
  `).bind(requestId, load.id, specialist.id, company.id, now, now).run();

  const saved = await env.DB.prepare(`
    SELECT id, load_record_id, action_type, status, created_at, updated_at
    FROM hermes_load_interest_requests
    WHERE load_record_id = ? AND company_id = ? AND action_type = 'request_details'
    LIMIT 1
  `).bind(load.id, company.id).first();

  return jsonResponse(202, {
    success: true,
    request: {
      id: saved?.id,
      load_id: saved?.load_record_id,
      action_type: saved?.action_type || "request_details",
      status: saved?.status || "requested",
      created_at: saved?.created_at || now,
      updated_at: saved?.updated_at || now,
    },
    next_state: "hermes_review",
    provider_contacted: false,
    provider_write_performed: false,
    booking_performed: false,
    contact_details_exposed: false,
  }, {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
