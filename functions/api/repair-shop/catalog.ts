import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";

type Env = { DB?: any };
const REPORT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return origin === new URL(request.url).origin; }
  catch { return false; }
}

async function getShop(db: any, ownerId: string) {
  return db.prepare(`
    SELECT id,name,slug,city,state,region,country_code,catalog_opt_in,catalog_opt_in_at,
           catalog_published_at,seo_geo_started_at,next_seo_report_at,created_at,updated_at
    FROM repair_shops
    WHERE owner_specialist_id=?
    LIMIT 1
  `).bind(ownerId).first();
}

function publicState(shop: any) {
  if (!shop) return null;
  const listed = Number(shop.catalog_opt_in || 0) === 1;
  return {
    company_name: shop.name,
    city: shop.city,
    region: shop.region || shop.state,
    country_code: shop.country_code || "US",
    listed,
    status: listed ? "self_submitted" : "opted_out",
    profile_url: listed ? `/businesses/connect/repair-shop/${encodeURIComponent(String(shop.slug || ""))}/` : null,
    catalog_opt_in_at: shop.catalog_opt_in_at || null,
    catalog_published_at: shop.catalog_published_at || null,
    seo_geo_started_at: shop.seo_geo_started_at || null,
    reporting_cadence: listed ? "monthly" : null,
    next_report_at: listed ? shop.next_seo_report_at || null : null,
    evaluation_horizon: listed ? "6 months+" : null,
    guarantee: false,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  await ensureRepairShopProfileSchema(env.DB);
  const shop = await getShop(env.DB, specialist.id);
  return jsonResponse(200, { success: true, catalog: publicState(shop) }, { "Cache-Control": "private, no-store" });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!sameOrigin(request)) return jsonResponse(403, { success: false, error: "origin_not_allowed" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  await ensureRepairShopProfileSchema(env.DB);
  const shop = await getShop(env.DB, specialist.id);
  if (!shop) return jsonResponse(409, { success: false, error: "company_profile_required", next_url: "/services/hermes-connect/repair-shops/settings/" });

  let body: { catalog_opt_in?: unknown };
  try { body = await request.json() as { catalog_opt_in?: unknown }; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  if (typeof body.catalog_opt_in !== "boolean") return jsonResponse(400, { success: false, error: "catalog_opt_in_required" });

  const now = new Date().toISOString();
  if (body.catalog_opt_in) {
    const nextReportAt = new Date(Date.now() + REPORT_INTERVAL_MS).toISOString();
    await env.DB.prepare(`
      UPDATE repair_shops SET
        catalog_opt_in=1,
        catalog_opt_in_at=COALESCE(catalog_opt_in_at,?),
        catalog_published_at=COALESCE(catalog_published_at,?),
        seo_geo_started_at=COALESCE(seo_geo_started_at,?),
        next_seo_report_at=COALESCE(next_seo_report_at,?),
        updated_at=?
      WHERE owner_specialist_id=?
    `).bind(now, now, now, nextReportAt, now, specialist.id).run();
  } else {
    await env.DB.prepare(`
      UPDATE repair_shops SET catalog_opt_in=0,next_seo_report_at=NULL,updated_at=?
      WHERE owner_specialist_id=?
    `).bind(now, specialist.id).run();
  }

  const updated = await getShop(env.DB, specialist.id);
  return jsonResponse(200, { success: true, catalog: publicState(updated) }, {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
