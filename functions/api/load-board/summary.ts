import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { specialistHasLoadBoardAccess } from "../_lib/hermes-company-profiles.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureLoadBoardSchema(env.DB);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  const carrierAccess = await specialistHasLoadBoardAccess(env.DB, specialist);
  // The public board must not reveal aggregate counts of restricted carrier-only
  // freight or capacity. Broker and guest access cannot infer restricted supply.
  const audiencePredicate = carrierAccess
    ? "r.visibility IN ('public', 'carrier_only')"
    : "r.visibility = 'public' AND r.record_type = 'capacity'";
  const now = new Date().toISOString();
  const result = await env.DB.prepare(`
    SELECT
      record_type,
      COUNT(DISTINCT CASE
        WHEN r.dedupe_key IS NOT NULL AND r.dedupe_key <> '' THEN r.record_type || '|' || r.dedupe_key
        ELSE r.record_type || '|' || r.id
      END) AS record_count,
      MAX(r.observed_at) AS latest_observed_at
    FROM hermes_load_records r
    JOIN hermes_load_sources s ON s.id = r.source_id
    WHERE r.status = 'active' AND r.expires_at > ?
      AND ${audiencePredicate}
      AND r.record_type IN ('load', 'capacity')
      AND s.status = 'active' AND s.read_enabled = 1
      AND ((r.visibility='public' AND s.redistribution_permission='public')
        OR (r.visibility='carrier_only' AND s.redistribution_permission IN ('public','carrier_only')))
    GROUP BY r.record_type
  `).bind(now).all();
  const summary = { load: 0, capacity: 0, latestObservedAt: null as string | null };
  for (const row of (result?.results || []) as any[]) {
    if (row.record_type === 'load') summary.load = Number(row.record_count) || 0;
    if (row.record_type === 'capacity') summary.capacity = Number(row.record_count) || 0;
    const observed = String(row.latest_observed_at || '');
    if (observed && (!summary.latestObservedAt || observed > summary.latestObservedAt)) summary.latestObservedAt = observed;
  }
  return jsonResponse(200, {
    success: true,
    audience: carrierAccess ? "verified_carrier" : "public",
    load_board_access: carrierAccess,
    available_loads: summary.load,
    available_trucks: summary.capacity,
    latest_observed_at: summary.latestObservedAt,
    definition: carrierAccess
      ? "Active, unexpired permissioned LOAD/CAPACITY records for approved carriers; demo excluded."
      : "Active, unexpired PUBLIC CAPACITY only. Private carrier freight and all LOAD counts are excluded; demo excluded.",
  }, {
    "Cache-Control": "private, no-store",
    "Vary": "Cookie",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
