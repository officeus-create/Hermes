import { requireInternalOwner } from "./_lib/internal-ai.mjs";
import { jsonResponse } from "./_lib/session.mjs";

type Env = { DB?: any };

const DAY_MS = 24 * 60 * 60 * 1000;
const BLOCKED_PREFIXES = [
  "/internal/",
  "/api/",
  "/sign",
  "/privacy-choices",
  "/logistics/apply",
  "/logistics/carrier-onboarding",
  "/services/hermes-connect/repair-shops/auth",
  "/services/hermes-connect/repair-shops/dashboard",
  "/services/hermes-connect/repair-shops/password",
  "/services/hermes-connect/repair-shops/profile",
];

const normalizePath = (value: unknown) => {
  const path = String(value ?? "").trim();
  if (!path.startsWith("/") || path.length > 300) return "";
  return path.replace(/\/{2,}/g, "/").split("?")[0].split("#")[0];
};

export function siteTrafficRouteGroup(value: unknown) {
  const path = normalizePath(value);
  if (!path) return null;
  if (BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix))) return null;
  if (path === "/") return "home";
  if (path.startsWith("/businesses/connect/repair-shop/")) return "catalog_crm_profile";
  if (path.startsWith("/businesses/ukraine/")) return "catalog_international";
  if (path.startsWith("/businesses/")) return "catalog";
  if (path.startsWith("/services/hermes-connect/repair-shops/booking")) return "repair_shop_booking";
  if (path.startsWith("/services/hermes-connect/repair-shops/")) return "repair_shop_public";
  if (path.startsWith("/services/hermes-connect/")) return "hermes_connect";
  if (path.startsWith("/paths/logistics/") || path.startsWith("/logistics/")) return "logistics";
  if (path.startsWith("/paths/marketing/") || path.startsWith("/marketing/")) return "marketing";
  if (path.startsWith("/paths/academy/") || path.startsWith("/academy/")) return "academy";
  if (path.startsWith("/paths/technology/") || path.startsWith("/technology/")) return "technology";
  if (path.startsWith("/insights/")) return "insights";
  if (path.startsWith("/services/")) return "services";
  return "other_public";
}

async function ensureSiteTrafficSchema(db: any) {
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
  const columns = await db.prepare("PRAGMA table_info(hermes_site_traffic_daily)").all();
  const hasSessions = (columns?.results || []).some((column: any) => String(column?.name || "") === "sessions");
  if (!hasSessions) {
    await db.prepare("ALTER TABLE hermes_site_traffic_daily ADD COLUMN sessions INTEGER NOT NULL DEFAULT 0").run();
  }
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_hermes_site_traffic_day ON hermes_site_traffic_daily(day)"
  ).run();
}

const utcDay = (date = new Date()) => date.toISOString().slice(0, 10);
const daysAgo = (days: number, now = new Date()) =>
  utcDay(new Date(now.getTime() - Math.max(0, days) * DAY_MS));

const sameOriginRequest = (request: Request) => {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return false;
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
};

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!sameOriginRequest(request)) return jsonResponse(403, { success: false, error: "origin_not_allowed" });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  if (body.analytics_consent !== true) {
    return jsonResponse(400, { success: false, error: "analytics_consent_required" });
  }

  const routeGroup = siteTrafficRouteGroup(body.path);
  if (!routeGroup) return new Response(null, { status: 204 });

  await ensureSiteTrafficSchema(env.DB);
  const now = new Date().toISOString();
  const sessionStart = body.session_start === true ? 1 : 0;
  await env.DB.prepare(`
    INSERT INTO hermes_site_traffic_daily (day, route_group, page_views, sessions, updated_at)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(day, route_group) DO UPDATE SET
      page_views = hermes_site_traffic_daily.page_views + 1,
      sessions = hermes_site_traffic_daily.sessions + excluded.sessions,
      updated_at = excluded.updated_at
  `).bind(utcDay(), routeGroup, sessionStart, now).run();

  return jsonResponse(202, { success: true }, { "Cache-Control": "no-store" });
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureSiteTrafficSchema(env.DB);

  const start7 = daysAgo(6);
  const start28 = daysAgo(27);
  const today = utcDay();

  const [summary, groups, daily] = await Promise.all([
    env.DB.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN day = ? THEN page_views ELSE 0 END), 0) AS today,
        COALESCE(SUM(CASE WHEN day >= ? THEN page_views ELSE 0 END), 0) AS last_7d,
        COALESCE(SUM(CASE WHEN day >= ? THEN page_views ELSE 0 END), 0) AS last_28d,
        COALESCE(SUM(page_views), 0) AS all_time,
        COALESCE(SUM(CASE WHEN day = ? THEN sessions ELSE 0 END), 0) AS sessions_today,
        COALESCE(SUM(CASE WHEN day >= ? THEN sessions ELSE 0 END), 0) AS sessions_7d,
        COALESCE(SUM(CASE WHEN day >= ? THEN sessions ELSE 0 END), 0) AS sessions_28d,
        COALESCE(SUM(sessions), 0) AS sessions_all_time
      FROM hermes_site_traffic_daily
    `).bind(today, start7, start28, today, start7, start28).first(),
    env.DB.prepare(`
      SELECT route_group, SUM(page_views) AS page_views, SUM(sessions) AS sessions
      FROM hermes_site_traffic_daily
      WHERE day >= ?
      GROUP BY route_group
      ORDER BY page_views DESC, route_group ASC
    `).bind(start28).all(),
    env.DB.prepare(`
      SELECT day, SUM(page_views) AS page_views, SUM(sessions) AS sessions
      FROM hermes_site_traffic_daily
      WHERE day >= ?
      GROUP BY day
      ORDER BY day ASC
    `).bind(start28).all(),
  ]);

  return jsonResponse(200, {
    success: true,
    metric: "consented_first_party_traffic",
    timezone: "UTC",
    summary: {
      today: Number(summary?.today || 0),
      last_7d: Number(summary?.last_7d || 0),
      last_28d: Number(summary?.last_28d || 0),
      all_time: Number(summary?.all_time || 0),
      sessions_today: Number(summary?.sessions_today || 0),
      sessions_7d: Number(summary?.sessions_7d || 0),
      sessions_28d: Number(summary?.sessions_28d || 0),
      sessions_all_time: Number(summary?.sessions_all_time || 0),
    },
    groups: (groups?.results || []).map((row: any) => ({
      route_group: String(row.route_group || ""),
      page_views: Number(row.page_views || 0),
      sessions: Number(row.sessions || 0),
    })),
    daily: (daily?.results || []).map((row: any) => ({
      day: String(row.day || ""),
      page_views: Number(row.page_views || 0),
      sessions: Number(row.sessions || 0),
    })),
  }, { "Cache-Control": "no-store" });
}
