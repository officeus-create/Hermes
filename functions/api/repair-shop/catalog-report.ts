import { repairShopDirectory } from "../../../src/data/repair-shop-directory.ts";
import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureCatalogBusinessInquirySchema } from "../_lib/catalog-business-inquiries.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";

type Env = { DB?: any };

const DAY_MS = 24 * 60 * 60 * 1000;
const sevenDayStart = (now = new Date()) => {
  const start = new Date(now.getTime() - 6 * DAY_MS);
  return start.toISOString().slice(0, 10);
};

async function ensureActivitySchema(db: any) {
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
}

const staticIdsForShop = (shop: any) =>
  repairShopDirectory
    .filter((entry) =>
      entry.businessName.trim().toLowerCase() === String(shop.name || "").trim().toLowerCase() &&
      entry.city.trim().toLowerCase() === String(shop.city || "").trim().toLowerCase() &&
      entry.state.trim().toUpperCase() === String(shop.state || "").trim().toUpperCase()
    )
    .map((entry) => `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await Promise.all([
    ensureRepairShopProfileSchema(env.DB),
    ensureCatalogBusinessInquirySchema(env.DB),
    ensureRepairShopBookingsSchema(env.DB),
    ensureActivitySchema(env.DB),
  ]);

  const shopsResult = await env.DB.prepare(`
    SELECT id, name, slug, city, state
    FROM repair_shops
    WHERE owner_specialist_id = ?
    ORDER BY updated_at DESC, id ASC
  `).bind(specialist.id).all();
  const shops = shopsResult?.results || [];
  const startDay = sevenDayStart();
  const startIso = `${startDay}T00:00:00.000Z`;
  const endDay = new Date().toISOString().slice(0, 10);

  const reports = [];
  for (const shop of shops) {
    const businessIds = [`repair-shop-crm:${String(shop.id || "")}`, ...staticIdsForShop(shop)];
    const placeholders = businessIds.map(() => "?").join(",");
    const [activityResult, inquiryResult, bookingResult] = await Promise.all([
      env.DB.prepare(`
        SELECT action, COALESCE(SUM(event_count), 0) AS event_count
        FROM catalog_business_activity_daily
        WHERE day >= ? AND business_id IN (${placeholders})
        GROUP BY action
      `).bind(startDay, ...businessIds).all(),
      env.DB.prepare(`
        SELECT COUNT(*) AS inquiry_count
        FROM catalog_business_inquiries
        WHERE shop_id = ? AND created_at >= ?
      `).bind(String(shop.id || ""), startIso).first(),
      env.DB.prepare(`
        SELECT COUNT(*) AS booking_count
        FROM repair_shop_bookings
        WHERE shop_id = ? AND created_at >= ?
      `).bind(String(shop.id || ""), startIso).first(),
    ]);

    const activity = Object.fromEntries(
      (activityResult?.results || []).map((row: any) => [String(row.action || ""), Number(row.event_count || 0)])
    );

    reports.push({
      shop_id: String(shop.id || ""),
      shop_name: String(shop.name || ""),
      catalog_profile: `/businesses/connect/repair-shop/${encodeURIComponent(String(shop.slug || ""))}/`,
      business_ids: businessIds,
      period: { start: startDay, end: endDay, timezone: "UTC" },
      metrics: {
        profile_views: Number(activity.profile_view || 0),
        call_clicks: Number(activity.call_click || 0),
        maps_clicks: Number(activity.maps_click || 0),
        website_clicks: Number(activity.website_click || 0),
        booking_clicks: Number(activity.booking_click || 0),
        inquiries_received: Number(inquiryResult?.inquiry_count || 0),
        bookings_created: Number(bookingResult?.booking_count || 0),
      },
    });
  }

  return jsonResponse(200, {
    success: true,
    cadence: "rolling_7_days",
    reports,
  }, { "Cache-Control": "no-store" });
}
