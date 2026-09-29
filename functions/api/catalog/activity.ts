import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const ACTIONS = new Set(["profile_view", "call_click", "maps_click", "website_click", "booking_click"]);
const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9:_/.\-]{2,179}$/;

async function ensureCatalogActivitySchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS catalog_business_activity_daily (
      day TEXT NOT NULL,
      business_id TEXT NOT NULL,
      action TEXT NOT NULL,
      event_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(day, business_id, action)
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_business_activity_business_day ON catalog_business_activity_daily(business_id, day)"
  ).run();
}

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

  const businessId = String(body.business_id ?? "").trim();
  const action = String(body.action ?? "").trim();
  if (!ID_PATTERN.test(businessId) || !ACTIONS.has(action)) {
    return jsonResponse(400, { success: false, error: "invalid_activity" });
  }

  await ensureCatalogActivitySchema(env.DB);
  const now = new Date();
  const nowIso = now.toISOString();
  const day = nowIso.slice(0, 10);
  await env.DB.prepare(`
    INSERT INTO catalog_business_activity_daily (day, business_id, action, event_count, updated_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(day, business_id, action) DO UPDATE SET
      event_count = catalog_business_activity_daily.event_count + 1,
      updated_at = excluded.updated_at
  `).bind(day, businessId, action, nowIso).run();

  return jsonResponse(202, { success: true }, { "Cache-Control": "no-store" });
}
