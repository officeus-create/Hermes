import { ACCOUNT_REMINDER_EMAIL_PATH } from "../../_lib/account-engagement.mjs";
import { bearerToken, verifyGitHubCatalogReportOidcToken } from "../../_lib/github-oidc.mjs";
import { ensureRepairShopProfileSchema } from "../../_lib/repair-shop-schema.mjs";
import { jsonResponse } from "../../_lib/session.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = { DB?: any; LEAD_EMAIL_SERVICE?: ServiceFetcher; LEAD_SERVICE_TOKEN?: string };
type ReportRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  region?: string | null;
  state?: string | null;
  country_code?: string | null;
  website?: string | null;
  catalog_published_at?: string | null;
  seo_geo_started_at?: string | null;
  next_seo_report_at?: string | null;
  email: string;
  owner_name?: string | null;
};

const addThirtyDays = (date: Date) => new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
const profileUrl = (slug: string) => `https://hermeslogisticsus.com/businesses/connect/repair-shop/${encodeURIComponent(slug)}/`;
const settingsUrl = "https://hermeslogisticsus.com/services/hermes-connect/repair-shops/settings/";
async function deliverReport(env: Env, row: ReportRow, now: Date) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  const location = [row.city, row.region || row.state, row.country_code].filter(Boolean).join(", ");
  const subject = `Hermes Catalog monthly SEO/GEO status — ${row.name}`;
  const text = [
    `Hello ${row.owner_name || row.name},`,
    "",
    `This is your monthly Hermes Catalog SEO/GEO status report for ${row.name}.`,
    `Public profile: ${profileUrl(row.slug)}`,
    `Location: ${location}`,
    `Website on profile: ${row.website || "not provided"}`,
    `Catalog published: ${row.catalog_published_at || "published"}`,
    `SEO/GEO preparation started: ${row.seo_geo_started_at || row.catalog_published_at || "after publication"}`,
    "",
    "Current free visibility work: crawlable business profile, structured business facts, service/location discovery and sitemap inclusion.",
    "Search engines and AI systems decide when and how to surface a page. Hermes does not guarantee rankings, traffic, leads or revenue.",
    "Performance metrics are reported only when a verified analytics/search-data source exists for the business.",
    "Organic/local/AI-search progress should usually be evaluated over a 6+ month horizon.",
    "",
    `Review or update your company data: ${settingsUrl}`,
    "Turning off Catalog publication in Company settings stops future Catalog reports.",
  ].join("\n");
  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(ACCOUNT_REMINDER_EMAIL_PATH, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: `catalog_monthly_${row.id}_${now.toISOString().slice(0, 10)}`,
        subject,
        text,
        recipient_email: row.email,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!(await verifyGitHubCatalogReportOidcToken(bearerToken(request)))) {
    return jsonResponse(401, { success: false, error: "not_authorized" });
  }
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) {
    return jsonResponse(503, { success: false, error: "email_service_not_configured" });
  }
  await ensureRepairShopProfileSchema(env.DB);
  const now = new Date();
  const result = await env.DB.prepare(`
    SELECT r.id,r.name,r.slug,r.city,r.region,r.state,r.country_code,r.website,
           r.catalog_published_at,r.seo_geo_started_at,r.next_seo_report_at,
           s.email,s.name AS owner_name
    FROM repair_shops r
    JOIN specialists s ON s.id = r.owner_specialist_id
    WHERE r.catalog_opt_in = 1
      AND r.next_seo_report_at IS NOT NULL
      AND r.next_seo_report_at <= ?
      AND s.email IS NOT NULL
      AND TRIM(s.email) <> ''
    ORDER BY r.next_seo_report_at ASC
    LIMIT 100
  `).bind(now.toISOString()).all();
  const rows = (result?.results || []) as ReportRow[];
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const delivered = await deliverReport(env, row, now);
    if (!delivered) {
      failed += 1;
      continue;
    }
    await env.DB.prepare(`
      UPDATE repair_shops
      SET next_seo_report_at = ?, updated_at = ?
      WHERE id = ? AND catalog_opt_in = 1
    `).bind(addThirtyDays(now), now.toISOString(), row.id).run();
    sent += 1;
  }

  return jsonResponse(200, {
    success: true,
    due: rows.length,
    sent,
    failed,
    next_check: "daily",
  }, { "Cache-Control": "no-store" });
}
