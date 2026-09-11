import { jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };

export async function onRequestGet({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureLoadBoardSchema(env.DB);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(`
    SELECT
      record_type,
      COUNT(*) AS record_count,
      MAX(observed_at) AS latest_observed_at
    FROM hermes_load_records
    WHERE status = 'active'
      AND expires_at > ?
      AND visibility IN ('public', 'carrier_only')
      AND record_type IN ('load', 'capacity')
    GROUP BY record_type
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
    available_loads: summary.load,
    available_trucks: summary.capacity,
    latest_observed_at: summary.latestObservedAt,
    definition: "Active, unexpired public or carrier-access records. Demo rows and internal-only records are excluded.",
  }, {
    "Cache-Control": "public, max-age=15, s-maxage=30",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
