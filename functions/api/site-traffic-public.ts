import { jsonResponse } from "./_lib/session.mjs";

type Env = { DB?: any };

async function ensurePublicTrafficSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_site_traffic_daily (
      day TEXT NOT NULL,
      route_group TEXT NOT NULL,
      page_views INTEGER NOT NULL DEFAULT 0,
      sessions INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(day, route_group)
    )
  `).run();
}

const utcDay = (date = new Date()) => date.toISOString().slice(0, 10);

export async function onRequestGet({ env }: { request: Request; env: Env }) {
  if (!env.DB) {
    return jsonResponse(503, { success: false, error: "database_not_configured" }, { "Cache-Control": "no-store" });
  }

  await ensurePublicTrafficSchema(env.DB);

  const today = utcDay();
  const monthStart = `${today.slice(0, 7)}-01`;
  const summary = await env.DB.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN day = ? THEN page_views ELSE 0 END), 0) AS page_views_today,
      COALESCE(SUM(CASE WHEN day >= ? THEN page_views ELSE 0 END), 0) AS page_views_month,
      COALESCE(SUM(CASE WHEN day = ? THEN sessions ELSE 0 END), 0) AS sessions_today,
      COALESCE(SUM(CASE WHEN day >= ? THEN sessions ELSE 0 END), 0) AS sessions_month
    FROM hermes_site_traffic_daily
  `).bind(today, monthStart, today, monthStart).first();

  return jsonResponse(200, {
    success: true,
    metric: "consented_first_party_traffic",
    timezone: "UTC",
    period: {
      today,
      month_start: monthStart,
    },
    summary: {
      page_views_today: Number(summary?.page_views_today || 0),
      page_views_month: Number(summary?.page_views_month || 0),
      sessions_today: Number(summary?.sessions_today || 0),
      sessions_month: Number(summary?.sessions_month || 0),
    },
    disclosure: "Visitor sessions are consented browser sessions, not unique people.",
  }, {
    "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
  });
}
