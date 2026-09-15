import { jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureServiceContextSchema, listServicesForContext } from "../_lib/service-context.mjs";

type Env = { DB?: any };

async function repairShopServices(db: any, ownerId: string, shopId: string) {
  await ensureServiceContextSchema(db);
  const context = await db.prepare(`
    SELECT id,is_default
    FROM hermes_business_contexts
    WHERE owner_specialist_id=? AND vertical_key='repair_shop' AND business_id=?
    LIMIT 1
  `).bind(ownerId, shopId).first();
  if (!context?.id) return [];
  const services = await listServicesForContext(db, {
    ownerId,
    contextId: String(context.id),
    includeLegacyUnmapped: Number(context.is_default || 0) === 1,
  });
  return services.map((item: any) => String(item.name || "").trim()).filter(Boolean).slice(0, 20);
}

export async function onRequestGet({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureRepairShopProfileSchema(env.DB);

  const [companyResult, repairResult] = await Promise.all([
    env.DB.prepare(`
      SELECT id, company_name, slug, company_type, city, state, catalog_status, created_at, updated_at
      FROM hermes_company_profiles
      WHERE catalog_opt_in = 1
        AND catalog_status IN ('self_submitted', 'verified_public')
      ORDER BY CASE WHEN catalog_status = 'verified_public' THEN 0 ELSE 1 END, updated_at DESC
      LIMIT 500
    `).all(),
    env.DB.prepare(`
      SELECT id,owner_specialist_id,name,slug,city,state,region,country_code,website,
             catalog_published_at,seo_geo_started_at,next_seo_report_at,created_at,updated_at
      FROM repair_shops
      WHERE catalog_opt_in=1
      ORDER BY updated_at DESC
      LIMIT 100
    `).all(),
  ]);

  const companies = (companyResult?.results || []).map((row: any) => ({
    id: row.id,
    companyName: row.company_name,
    slug: row.slug,
    companyType: row.company_type,
    city: row.city,
    state: row.state,
    status: row.catalog_status,
    source: "hermes_connect_company",
    profileUrl: null,
    services: [],
    verificationLabel: row.catalog_status === "verified_public" ? "Verified" : "Self-submitted · verification pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  for (const row of repairResult?.results || []) {
    const services = await repairShopServices(env.DB, String(row.owner_specialist_id || ""), String(row.id || ""));
    companies.push({
      id: `repair-shop:${row.id}`,
      companyName: row.name,
      slug: row.slug,
      companyType: "repair_shop",
      city: row.city,
      state: row.region || row.state || row.country_code,
      status: "self_submitted",
      source: "repair_shop_crm",
      profileUrl: `/businesses/connect/repair-shop/${encodeURIComponent(String(row.slug || ""))}/`,
      services,
      verificationLabel: "Self-submitted · verification pending",
      seoGeo: {
        startedAt: row.seo_geo_started_at || row.catalog_published_at || null,
        reportingCadence: "monthly",
        nextReportAt: row.next_seo_report_at || null,
        evaluationHorizon: "6 months+",
        guarantee: false,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  companies.sort((a: any, b: any) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  return jsonResponse(200, { success: true, count: companies.length, companies }, {
    "Cache-Control": "public, max-age=30, s-maxage=60",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
