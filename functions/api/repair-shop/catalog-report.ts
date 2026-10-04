import { repairShopDirectory } from "../../../src/data/repair-shop-directory.ts";
import { ensureCatalogBusinessEventSchema, CATALOG_EVENT_TYPES } from "../_lib/catalog-business-events.mjs";
import { ensureCatalogBusinessInquirySchema } from "../_lib/catalog-business-inquiries.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };
const DAY_MS = 24 * 60 * 60 * 1000;

const utcDay = (date: Date) => date.toISOString().slice(0, 10);
const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

function staticCatalogBusinessId(shop: any) {
  const matches = repairShopDirectory.filter((entry) =>
    normalize(entry.businessName) === normalize(shop.name) &&
    normalize(entry.city) === normalize(shop.city) &&
    normalize(entry.state) === normalize(shop.state)
  );
  if (matches.length !== 1) return null;
  const entry = matches[0];
  return {
    id: `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`,
    profile: `/businesses/${entry.stateSlug}/${entry.citySlug}/${entry.slug}/`,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await Promise.all([
    ensureRepairShopProfileSchema(env.DB),
    ensureCatalogBusinessEventSchema(env.DB),
    ensureCatalogBusinessInquirySchema(env.DB),
    ensureRepairShopBookingsSchema(env.DB),
  ]);

  const shop = await env.DB.prepare(`
    SELECT id, owner_specialist_id, name, slug, city, state, region, country_code, catalog_opt_in
    FROM repair_shops
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(specialist.id).first();

  if (!shop) return jsonResponse(404, { success: false, error: "repair_shop_not_found" });

  const now = new Date();
  const start = new Date(now.getTime() - 6 * DAY_MS);
  const startDay = utcDay(start);
  const endDay = utcDay(now);
  const startTimestamp = `${startDay}T00:00:00.000Z`;

  const ids: { id: string; profile: string }[] = [];
  if (Number(shop.catalog_opt_in || 0) === 1) {
    ids.push({
      id: `repair-shop-crm:${String(shop.id)}`,
      profile: `/businesses/connect/repair-shop/${encodeURIComponent(String(shop.slug || ""))}/`,
    });
  }
  const staticBinding = staticCatalogBusinessId(shop);
  if (staticBinding && !ids.some((item) => item.id === staticBinding.id)) ids.push(staticBinding);

  const totals: Record<string, number> = Object.fromEntries([...CATALOG_EVENT_TYPES].map((event) => [event, 0]));
  for (const business of ids) {
    const result = await env.DB.prepare(`
      SELECT event_type, SUM(event_count) AS event_count
      FROM catalog_business_events_daily
      WHERE catalog_business_id = ? AND day >= ? AND day <= ?
      GROUP BY event_type
    `).bind(business.id, startDay, endDay).all();
    for (const row of result?.results || []) {
      const eventType = String(row.event_type || "");
      if (eventType in totals) totals[eventType] += Number(row.event_count || 0);
    }
  }

  const [inquirySummary, bookingSummary] = await Promise.all([
    env.DB.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted_count,
        SUM(CASE WHEN internal_delivery_status = 'delivered' THEN 1 ELSE 0 END) AS internal_notified_count
      FROM catalog_business_inquiries
      WHERE owner_specialist_id = ? AND created_at >= ?
    `).bind(specialist.id, startTimestamp).first(),
    env.DB.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count
      FROM repair_shop_bookings
      WHERE owner_specialist_id = ? AND created_at >= ?
    `).bind(specialist.id, startTimestamp).first(),
  ]);

  return jsonResponse(200, {
    success: true,
    period: {
      days: 7,
      start_day: startDay,
      end_day: endDay,
      timezone: "UTC",
    },
    business: {
      shop_id: String(shop.id || ""),
      name: String(shop.name || ""),
      catalog_profiles: ids,
    },
    metrics: {
      consented_profile_views: totals.profile_view || 0,
      call_clicks: totals.call_click || 0,
      maps_clicks: totals.maps_click || 0,
      website_clicks: totals.website_click || 0,
      request_starts: totals.request_start || 0,
      booking_starts: totals.booking_start || 0,
      claim_starts: totals.claim_start || 0,
      growth_starts: totals.growth_start || 0,
      crm_inquiries: Number(inquirySummary?.total || 0),
      crm_inquiries_new: Number(inquirySummary?.new_count || 0),
      crm_inquiries_contacted: Number(inquirySummary?.contacted_count || 0),
      hermes_internal_notifications: Number(inquirySummary?.internal_notified_count || 0),
      crm_bookings_created_all_sources: Number(bookingSummary?.total || 0),
      crm_bookings_confirmed_all_sources: Number(bookingSummary?.confirmed_count || 0),
      crm_bookings_completed_all_sources: Number(bookingSummary?.completed_count || 0),
    },
    measurement_notes: [
      "Profile views and CTA clicks are first-party aggregate counts recorded only after analytics consent.",
      "No visitor IP, email, phone, cookie identifier or device identifier is stored in Catalog event totals.",
      "Catalog inquiries are counted only when the request is securely bound to this Repair Shop CRM owner.",
      "CRM bookings are all bookings created in this workspace during the period; the booking table does not yet prove every booking originated from Catalog.",
    ],
  }, { "Cache-Control": "no-store" });
}
