import { repairShopDirectory } from "../../../../src/data/repair-shop-directory.ts";
import { ensureCatalogBusinessInquirySchema } from "../../_lib/catalog-business-inquiries.mjs";
import { ensureRepairShopBookingsSchema } from "../../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopProfileSchema } from "../../_lib/repair-shop-schema.mjs";
import { ensureAccountEngagementSchema, normalizeEngagementLocale } from "../../_lib/account-engagement.mjs";
import { bearerToken, verifyGitHubReminderOidcToken } from "../../_lib/github-oidc.mjs";
import { jsonResponse } from "../../_lib/session.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = { DB?: any; LEAD_EMAIL_SERVICE?: ServiceFetcher; LEAD_SERVICE_TOKEN?: string };

const ACCOUNT_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
const REPORT_SUBJECT = "[HERMES ACCOUNT] [CATALOG WEEKLY REPORT]";
const DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 60 * 60 * 1000;

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

function staticIdsForShop(row: any) {
  return repairShopDirectory
    .filter((entry) =>
      entry.businessName.trim().toLowerCase() === String(row.name || "").trim().toLowerCase() &&
      entry.city.trim().toLowerCase() === String(row.city || "").trim().toLowerCase() &&
      entry.state.trim().toUpperCase() === String(row.state || "").trim().toUpperCase()
    )
    .map((entry) => `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`);
}

function reportText(row: any, metrics: Record<string, number>, startDay: string, endDay: string) {
  const locale = normalizeEngagementLocale(row.locale);
  const dashboard = new URL("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/dashboard/");
  if (locale !== "en") dashboard.searchParams.set("lang", locale);
  const profile = `https://hermeslogisticsus.com/businesses/connect/repair-shop/${encodeURIComponent(String(row.slug || ""))}/`;
  return [
    `Hermes Catalog weekly report — ${String(row.name || "Repair Shop")}`,
    `Period: ${startDay} through ${endDay} (UTC)`,
    "",
    `Profile views: ${metrics.profile_view || 0}`,
    `Call button clicks: ${metrics.call_click || 0}`,
    `Google Maps clicks: ${metrics.maps_click || 0}`,
    `Website clicks: ${metrics.website_click || 0}`,
    `Booking button clicks: ${metrics.booking_click || 0}`,
    `Real inquiries received: ${metrics.inquiries_received || 0}`,
    `Bookings created: ${metrics.bookings_created || 0}`,
    "",
    "Clicks show user activity and are not presented as confirmed customers.",
    "Open your Hermes Connect dashboard:",
    dashboard.toString(),
    "Public Catalog profile:",
    profile,
    "",
    "Hermes Connect",
  ].join("\n");
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const oidcToken = bearerToken(request);
  if (!(await verifyGitHubReminderOidcToken(oidcToken))) {
    return jsonResponse(401, { success: false, error: "not_authorized" });
  }
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) {
    return jsonResponse(503, { success: false, error: "email_service_not_configured" });
  }

  await Promise.all([
    ensureRepairShopProfileSchema(env.DB),
    ensureCatalogBusinessInquirySchema(env.DB),
    ensureRepairShopBookingsSchema(env.DB),
    ensureAccountEngagementSchema(env.DB),
    ensureActivitySchema(env.DB),
  ]);

  const result = await env.DB.prepare(`
    SELECT
      r.id, r.name, r.slug, r.city, r.state, r.catalog_published_at,
      r.next_catalog_report_at, r.last_catalog_report_sent_at,
      s.email, s.role, e.email_enabled, e.locale
    FROM repair_shops r
    JOIN specialists s ON s.id = r.owner_specialist_id
    LEFT JOIN account_engagement e ON e.specialist_id = s.id
    WHERE r.catalog_opt_in = 1
      AND s.role = 'Shop Owner'
      AND COALESCE(e.email_enabled, 1) = 1
    ORDER BY r.id ASC
  `).all();

  const rows = result?.results || [];
  const now = new Date();
  const nowIso = now.toISOString();
  const firstDueIso = new Date(now.getTime() + 7 * DAY_MS).toISOString();
  const retryIso = new Date(now.getTime() + RETRY_MS).toISOString();
  const startDay = new Date(now.getTime() - 6 * DAY_MS).toISOString().slice(0, 10);
  const startIso = `${startDay}T00:00:00.000Z`;
  const endDay = nowIso.slice(0, 10);
  let initialized = 0, due = 0, sent = 0, failed = 0;

  for (const row of rows) {
    const recipient = String(row.email || "").trim().toLowerCase();
    if (!recipient || !recipient.includes("@")) continue;

    if (!row.next_catalog_report_at) {
      await env.DB.prepare(
        "UPDATE repair_shops SET next_catalog_report_at = ?, updated_at = ? WHERE id = ? AND next_catalog_report_at IS NULL"
      ).bind(firstDueIso, nowIso, row.id).run();
      initialized += 1;
      continue;
    }

    const nextDue = new Date(String(row.next_catalog_report_at));
    if (!Number.isFinite(nextDue.getTime()) || nextDue.getTime() > now.getTime()) continue;
    due += 1;

    const businessIds = [`repair-shop-crm:${String(row.id)}`, ...staticIdsForShop(row)];
    const placeholders = businessIds.map(() => "?").join(",");
    const [activityResult, inquiryResult, bookingResult] = await Promise.all([
      env.DB.prepare(`
        SELECT action, COALESCE(SUM(event_count),0) AS event_count
        FROM catalog_business_activity_daily
        WHERE day >= ? AND business_id IN (${placeholders})
        GROUP BY action
      `).bind(startDay, ...businessIds).all(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count FROM catalog_business_inquiries WHERE shop_id = ? AND created_at >= ?"
      ).bind(String(row.id), startIso).first(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count FROM repair_shop_bookings WHERE shop_id = ? AND created_at >= ?"
      ).bind(String(row.id), startIso).first(),
    ]);
    const metrics = Object.fromEntries(
      (activityResult?.results || []).map((item: any) => [String(item.action || ""), Number(item.event_count || 0)])
    ) as Record<string, number>;
    metrics.inquiries_received = Number(inquiryResult?.count || 0);
    metrics.bookings_created = Number(bookingResult?.count || 0);

    const nextWeekIso = new Date(now.getTime() + 7 * DAY_MS).toISOString();
    await env.DB.prepare(
      "UPDATE repair_shops SET next_catalog_report_at = ?, updated_at = ? WHERE id = ?"
    ).bind(nextWeekIso, nowIso, row.id).run();

    let delivered = false;
    try {
      const response = await env.LEAD_EMAIL_SERVICE.fetch(ACCOUNT_EMAIL_PATH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: `catalog_weekly_${String(row.id).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)}_${endDay.replace(/-/g, "")}`,
          subject: REPORT_SUBJECT,
          text: reportText(row, metrics, startDay, endDay),
          recipient_email: recipient,
        }),
      });
      delivered = response.ok;
    } catch {
      delivered = false;
    }

    if (delivered) {
      await env.DB.prepare(
        "UPDATE repair_shops SET last_catalog_report_sent_at = ?, updated_at = ? WHERE id = ?"
      ).bind(nowIso, nowIso, row.id).run();
      sent += 1;
    } else {
      await env.DB.prepare(
        "UPDATE repair_shops SET next_catalog_report_at = ?, updated_at = ? WHERE id = ?"
      ).bind(retryIso, nowIso, row.id).run();
      failed += 1;
    }
  }

  return jsonResponse(200, {
    success: true,
    scanned: rows.length,
    initialized,
    due,
    sent,
    failed,
  }, { "Cache-Control": "no-store" });
}
