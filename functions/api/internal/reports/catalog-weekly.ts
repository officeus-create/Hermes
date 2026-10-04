import { repairShopDirectory } from "../../../../src/data/repair-shop-directory.ts";
import { ensureCatalogBusinessEventSchema, CATALOG_EVENT_TYPES } from "../../_lib/catalog-business-events.mjs";
import { ensureCatalogBusinessInquirySchema } from "../../_lib/catalog-business-inquiries.mjs";
import { bearerToken, verifyGitHubReminderOidcToken } from "../../_lib/github-oidc.mjs";
import { ensureRepairShopBookingsSchema } from "../../_lib/repair-shop-bookings-schema.mjs";
import { ensureRepairShopProfileSchema } from "../../_lib/repair-shop-schema.mjs";
import { jsonResponse } from "../../_lib/session.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = {
  DB?: any;
  LEAD_EMAIL_SERVICE?: ServiceFetcher;
  LEAD_SERVICE_TOKEN?: string;
};
type ReportRow = {
  id: string;
  owner_specialist_id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  timezone?: string | null;
  next_seo_report_at: string;
  email: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const ACCOUNT_PATH = "https://lead-email.internal/v1/send-account";
const INTERNAL_PATH = "https://lead-email.internal/v1/send";
const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
const utcDay = (date: Date) => date.toISOString().slice(0, 10);

function staticCatalogBusinessId(shop: ReportRow) {
  const matches = repairShopDirectory.filter((entry) =>
    normalize(entry.businessName) === normalize(shop.name)
    && normalize(entry.city) === normalize(shop.city)
    && normalize(entry.state) === normalize(shop.state)
  );
  if (matches.length !== 1) return null;
  const entry = matches[0];
  return `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`;
}

async function ensureDeliveryLedger(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS catalog_weekly_report_deliveries (
      report_key TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      owner_status TEXT NOT NULL DEFAULT 'pending',
      internal_status TEXT NOT NULL DEFAULT 'pending',
      owner_delivered_at TEXT,
      internal_delivered_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_weekly_report_owner ON catalog_weekly_report_deliveries(owner_specialist_id, period_end DESC)"
  ).run();
}

async function readReport(db: any, shop: ReportRow, periodStart: string, periodEnd: string) {
  const ids = [`repair-shop-crm:${shop.id}`];
  const staticId = staticCatalogBusinessId(shop);
  if (staticId && !ids.includes(staticId)) ids.push(staticId);

  const totals: Record<string, number> = Object.fromEntries([...CATALOG_EVENT_TYPES].map((event) => [event, 0]));
  for (const businessId of ids) {
    const result = await db.prepare(`
      SELECT event_type, SUM(event_count) AS event_count
      FROM catalog_business_events_daily
      WHERE catalog_business_id = ? AND day >= ? AND day <= ?
      GROUP BY event_type
    `).bind(businessId, periodStart, periodEnd).all();
    for (const row of result?.results || []) {
      const eventType = String(row.event_type || "");
      if (eventType in totals) totals[eventType] += Number(row.event_count || 0);
    }
  }

  const startTimestamp = `${periodStart}T00:00:00.000Z`;
  const endTimestamp = `${periodEnd}T23:59:59.999Z`;
  const [inquiry, booking] = await Promise.all([
    db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
        SUM(CASE WHEN owner_delivery_status = 'delivered' THEN 1 ELSE 0 END) AS owner_notified_count
      FROM catalog_business_inquiries
      WHERE owner_specialist_id = ? AND created_at >= ? AND created_at <= ?
    `).bind(shop.owner_specialist_id, startTimestamp, endTimestamp).first(),
    db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count
      FROM repair_shop_bookings
      WHERE owner_specialist_id = ? AND created_at >= ? AND created_at <= ?
    `).bind(shop.owner_specialist_id, startTimestamp, endTimestamp).first(),
  ]);

  return {
    profileViews: totals.profile_view || 0,
    callClicks: totals.call_click || 0,
    mapsClicks: totals.maps_click || 0,
    websiteClicks: totals.website_click || 0,
    requestStarts: totals.request_start || 0,
    bookingStarts: totals.booking_start || 0,
    claimStarts: totals.claim_start || 0,
    growthStarts: totals.growth_start || 0,
    inquiries: Number(inquiry?.total || 0),
    newInquiries: Number(inquiry?.new_count || 0),
    ownerNotified: Number(inquiry?.owner_notified_count || 0),
    bookingsAllSources: Number(booking?.total || 0),
    completedBookingsAllSources: Number(booking?.completed_count || 0),
  };
}

function reportText(shop: ReportRow, periodStart: string, periodEnd: string, metrics: Awaited<ReturnType<typeof readReport>>) {
  return [
    `Hermes Catalog weekly report — ${shop.name}`,
    `Period: ${periodStart} → ${periodEnd} (UTC)`,
    "",
    `Consented profile views: ${metrics.profileViews}`,
    `Call button clicks: ${metrics.callClicks}`,
    `Google Maps clicks: ${metrics.mapsClicks}`,
    `Website clicks: ${metrics.websiteClicks}`,
    `Service-request starts: ${metrics.requestStarts}`,
    `CRM inquiries: ${metrics.inquiries}`,
    `New CRM inquiries: ${metrics.newInquiries}`,
    `Owner inquiry notifications delivered: ${metrics.ownerNotified}`,
    `Booking starts from Catalog: ${metrics.bookingStarts}`,
    `Profile claim starts: ${metrics.claimStarts}`,
    `Growth-service starts: ${metrics.growthStarts}`,
    `CRM bookings created — all sources: ${metrics.bookingsAllSources}`,
    `CRM bookings completed — all sources: ${metrics.completedBookingsAllSources}`,
    "",
    "Measurement notes:",
    "- Profile views and CTA clicks are aggregate first-party events counted only after analytics consent.",
    "- A call click proves a button click, not a completed phone conversation.",
    "- CRM bookings are shown as all workspace bookings because source attribution is not yet proven for every booking.",
    "- No visitor IP, email, phone, cookie identifier or device identifier is stored in Catalog event totals.",
    "",
    `Open CRM: https://hermeslogisticsus.com/services/hermes-connect/repair-shops/dashboard/`,
  ].join("\n");
}

async function send(env: Env, path: string, payload: Record<string, unknown>) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!(await verifyGitHubReminderOidcToken(bearerToken(request)))) {
    return jsonResponse(401, { success: false, error: "not_authorized" });
  }
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) {
    return jsonResponse(503, { success: false, error: "email_service_not_configured" });
  }

  await Promise.all([
    ensureRepairShopProfileSchema(env.DB),
    ensureCatalogBusinessEventSchema(env.DB),
    ensureCatalogBusinessInquirySchema(env.DB),
    ensureRepairShopBookingsSchema(env.DB),
    ensureDeliveryLedger(env.DB),
  ]);

  const now = new Date();
  const nowIso = now.toISOString();
  const due = await env.DB.prepare(`
    SELECT
      r.id, r.owner_specialist_id, r.name, r.slug, r.city, r.state, r.timezone, r.next_seo_report_at,
      s.email
    FROM repair_shops r
    JOIN specialists s ON s.id = r.owner_specialist_id
    WHERE r.catalog_opt_in = 1
      AND r.catalog_email_notifications_opt_in = 1
      AND r.next_seo_report_at IS NOT NULL
      AND r.next_seo_report_at <= ?
      AND s.role = 'Shop Owner'
      AND TRIM(s.email) <> ''
    ORDER BY r.next_seo_report_at ASC
    LIMIT 25
  `).bind(nowIso).all();

  let sent = 0;
  let partial = 0;
  let failed = 0;

  for (const raw of due?.results || []) {
    const shop = raw as ReportRow;
    const dueAt = new Date(String(shop.next_seo_report_at || ""));
    if (!Number.isFinite(dueAt.getTime())) {
      failed += 1;
      continue;
    }
    const periodEnd = utcDay(dueAt);
    const periodStart = utcDay(new Date(dueAt.getTime() - 6 * DAY_MS));
    const reportKey = `${shop.id}:${periodStart}:${periodEnd}`;
    const requestBase = `catalog_weekly_${await crypto.subtle.digest("SHA-256", new TextEncoder().encode(reportKey)).then((buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32))}`;

    await env.DB.prepare(`
      INSERT INTO catalog_weekly_report_deliveries
        (report_key, shop_id, owner_specialist_id, period_start, period_end, owner_status, internal_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)
      ON CONFLICT(report_key) DO NOTHING
    `).bind(reportKey, shop.id, shop.owner_specialist_id, periodStart, periodEnd, nowIso, nowIso).run();

    const ledger = await env.DB.prepare(`
      SELECT owner_status, internal_status
      FROM catalog_weekly_report_deliveries
      WHERE report_key = ?
      LIMIT 1
    `).bind(reportKey).first();
    const metrics = await readReport(env.DB, shop, periodStart, periodEnd);
    const text = reportText(shop, periodStart, periodEnd, metrics);

    let ownerStatus = String(ledger?.owner_status || "pending");
    let internalStatus = String(ledger?.internal_status || "pending");

    if (ownerStatus !== "delivered") {
      const ok = await send(env, ACCOUNT_PATH, {
        request_id: `${requestBase}_owner`,
        subject: "[HERMES CATALOG] [WEEKLY REPORT]",
        recipient_email: String(shop.email || "").trim().toLowerCase(),
        text,
      });
      ownerStatus = ok ? "delivered" : "failed";
      await env.DB.prepare(`
        UPDATE catalog_weekly_report_deliveries
        SET owner_status = ?, owner_delivered_at = CASE WHEN ? = 'delivered' THEN ? ELSE owner_delivered_at END, updated_at = ?
        WHERE report_key = ?
      `).bind(ownerStatus, ownerStatus, nowIso, nowIso, reportKey).run();
    }

    if (internalStatus !== "delivered") {
      const ok = await send(env, INTERNAL_PATH, {
        request_id: `${requestBase}_internal`,
        subject: "[HERMES CATALOG] [WEEKLY REPORT INTERNAL]",
        text: `${text}\n\nOwner account email: ${String(shop.email || "").trim().toLowerCase()}`,
      });
      internalStatus = ok ? "delivered" : "failed";
      await env.DB.prepare(`
        UPDATE catalog_weekly_report_deliveries
        SET internal_status = ?, internal_delivered_at = CASE WHEN ? = 'delivered' THEN ? ELSE internal_delivered_at END, updated_at = ?
        WHERE report_key = ?
      `).bind(internalStatus, internalStatus, nowIso, nowIso, reportKey).run();
    }

    if (ownerStatus === "delivered" && internalStatus === "delivered") {
      await env.DB.prepare(`
        UPDATE repair_shops
        SET next_seo_report_at = ?, updated_at = ?
        WHERE id = ? AND owner_specialist_id = ?
      `).bind(new Date(now.getTime() + 7 * DAY_MS).toISOString(), nowIso, shop.id, shop.owner_specialist_id).run();
      sent += 1;
    } else if (ownerStatus === "delivered" || internalStatus === "delivered") {
      partial += 1;
    } else {
      failed += 1;
    }
  }

  return jsonResponse(200, {
    success: true,
    scanned: Number(due?.results?.length || 0),
    sent,
    partial,
    failed,
  }, { "Cache-Control": "no-store" });
}
