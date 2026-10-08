import { catalogTrafficPeriod, publicCatalogTrafficSummary, catalogCountryCode } from "./_lib/catalog-traffic-summary.mjs";
import { resolveCuratedCatalogProjection } from "./_lib/catalog-public-projection.mjs";
import { repairCatalogPublication } from "./_lib/repair-catalog-publication.mjs";
import { repairShopDirectory } from "../../src/data/repair-shop-directory.ts";
import { catalogBusinessConcepts } from "../../src/data/catalog-business-concepts.ts";
import { CATALOG_EVENT_TYPES, recordCatalogBusinessEvent } from "./_lib/catalog-business-events.mjs";
import { ensureRepairShopProfileSchema } from "./_lib/repair-shop-schema.mjs";
import { jsonResponse } from "./_lib/session.mjs";

type Env = { DB?: any };
const MAX_BODY_BYTES = 2_000;

const sameOriginRequest = (request: Request) => {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return false;
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const staticBusinessIds = new Set([
  ...repairShopDirectory.map((entry) => `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`),
  ...catalogBusinessConcepts.map((entry) => entry.id),
]);


const academyCompanyId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Academy's existing public template emits its raw canonical company UUID.
// Reuse its joined publication gates without schema initialization or a second owner.
async function publicAcademyOwner(db: any, value: string, bySlug = false) {
  const row = await db.prepare(`SELECT c.id,c.slug,c.website FROM hermes_company_profiles c JOIN hermes_academy_business_profiles a ON a.company_id=c.id WHERE c.${bySlug ? "slug" : "id"}=? AND c.catalog_opt_in=1 AND c.catalog_status IN ('self_submitted','verified_public') LIMIT 1`).bind(value).first();
  if (!row || !academyCompanyId.test(String(row.id)) || !/^[a-z0-9-]{1,100}$/.test(String(row.slug))) return null;
  if ((bySlug ? row.slug : row.id) !== value) return null;
  // A redirected Academy has a curated static owner; never split its counters.
  if (resolveCuratedCatalogProjection({ vertical: "academy_business", website: row.website })) return null;
  return row;
}

async function validCatalogBusinessId(db: any, value: string) {
  if (staticBusinessIds.has(value)) return true;
  if (academyCompanyId.test(value)) return Boolean(await publicAcademyOwner(db, value));
  const company = value.match(/^company-crm:([a-zA-Z0-9_-]{6,160})$/);
  if (company) {
    const row = await db.prepare("SELECT c.id FROM hermes_company_profiles c JOIN hermes_home_service_profiles h ON h.company_id=c.id WHERE c.id=? AND c.company_type='home_service' AND c.catalog_opt_in=1 AND c.catalog_status IN ('self_submitted','verified_public') LIMIT 1").bind(company[1]).first();
    return Boolean(row?.id);
  }
  const match = value.match(/^repair-shop-crm:([a-zA-Z0-9_-]{6,160})$/);
  if (!match) return false;
  await ensureRepairShopProfileSchema(db);
  const row = await db.prepare(
    "SELECT id FROM repair_shops WHERE id = ? AND catalog_opt_in = 1 LIMIT 1"
  ).bind(match[1]).first();
  return Boolean(row?.id);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!sameOriginRequest(request)) return jsonResponse(403, { success: false, error: "origin_not_allowed" });

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) return jsonResponse(413, { success: false, error: "request_too_large" });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  if (body.analytics_consent !== true) {
    return jsonResponse(400, { success: false, error: "analytics_consent_required" });
  }

  const catalogBusinessId = clean(body.catalog_business_id, 220);
  const eventType = clean(body.event_type, 40);
  if (!CATALOG_EVENT_TYPES.has(eventType)) {
    return jsonResponse(400, { success: false, error: "invalid_event_type" });
  }
  if (!await validCatalogBusinessId(env.DB, catalogBusinessId)) {
    return jsonResponse(400, { success: false, error: "invalid_catalog_business" });
  }

  const now = new Date();
  await recordCatalogBusinessEvent(env.DB, {
    day: now.toISOString().slice(0, 10),
    catalogBusinessId,
    eventType,
    now: now.toISOString(),
    country: catalogCountryCode((request as Request & { cf?: { country?: string } }).cf?.country),
  });

  return jsonResponse(202, { success: true }, { "Cache-Control": "no-store" });
}

const staticTrafficPaths = new Map<string, string>([
  ...repairShopDirectory.map((entry) => [`/businesses/${entry.stateSlug}/${entry.citySlug}/${entry.slug}/`, `repair-shop:${entry.stateSlug}/${entry.citySlug}/${entry.slug}`] as const),
  ...catalogBusinessConcepts.map((entry) => [`/businesses/${entry.countrySlug}/${entry.localitySlug}/${entry.slug}/`, entry.id] as const),
]);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const paths = [...new Set(new URL(request.url).searchParams.getAll("path"))];
  if (!paths.length || paths.length > 12 || paths.some((path) => path.length > 240 || !/^\/businesses\/[a-z0-9/-]+\/$/.test(path) || path.includes("//"))) {
    return jsonResponse(400, { success: false, error: "invalid_catalog_paths" });
  }
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const period = catalogTrafficPeriod();
  try {
    const profiles = [];
    for (const path of paths) {
      let id = staticTrafficPaths.get(path);
      const repair = path.match(/^\/businesses\/connect\/repair-shop\/([a-z0-9-]+)\/$/);
      if (!id && repair) {
        const row = await env.DB.prepare("SELECT id,name,slug,catalog_opt_in FROM repair_shops WHERE slug = ? LIMIT 1").bind(repair[1]).first();
        const publication = repairCatalogPublication(row);
        if (publication.eligible && publication.path === path && publication.entityId) id = publication.entityId;
      }
      const company = path.match(/^\/businesses\/connect\/company\/([a-z0-9-]+)\/$/);
      if (!id && company) {
        const row = await env.DB.prepare("SELECT c.id,c.slug FROM hermes_company_profiles c JOIN hermes_home_service_profiles h ON h.company_id=c.id WHERE c.slug=? AND c.company_type='home_service' AND c.catalog_opt_in=1 AND c.catalog_status IN ('self_submitted','verified_public') LIMIT 1").bind(company[1]).first();
        if (row?.id && row.slug === company[1]) id = `company-crm:${row.id}`;
      }
      const academy = path.match(/^\/businesses\/connect\/academy\/([a-z0-9-]+)\/$/);
      if (!id && academy) {
        const row = await publicAcademyOwner(env.DB, academy[1], true);
        if (row) id = row.id;
      }
      // Unknown/withdrawn/uninstrumented profiles never inherit site totals or another tenant's data.
      if (!id) {
        profiles.push({ path, state: "unavailable", viewsToday: null, views7d: null, views28d: null, countries: [], countriesState: "unavailable" });
        continue;
      }
      const rows = await env.DB.prepare("SELECT day,event_count,updated_at FROM catalog_business_events_daily WHERE catalog_business_id = ? AND event_type = 'profile_view' AND day >= ? AND day <= ?").bind(id, period.start, period.end).all();
      let countries = null;
      try {
        const result = await env.DB.prepare("SELECT country,SUM(view_count) AS views FROM catalog_business_country_views_daily WHERE catalog_business_id = ? AND day >= ? AND day <= ? GROUP BY country").bind(id, period.start, period.end).all();
        countries = result.results || [];
      } catch { /* Country collection starts prospectively; a missing table is not zero history. */ }
      profiles.push({ path, ...publicCatalogTrafficSummary(rows.results || [], countries, period) });
    }
    return jsonResponse(200, { success: true, metric: "consented_catalog_profile_views", timezone: "UTC", period, profiles,
      disclosure: "Consented profile views, not unique people. Countries are prospective aggregates; groups below five views are not shown."
    }, { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" });
  } catch {
    return jsonResponse(503, { success: false, error: "catalog_traffic_unavailable" }, { "Cache-Control": "no-store" });
  }
}
