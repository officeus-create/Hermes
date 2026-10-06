import { jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureAcademyBusinessProfilesSchema } from "../_lib/academy-business-profiles.mjs";
import { ensureHomeServiceCrmSchema } from "../_lib/home-service-crm.mjs";
import { catalogProjectionPath } from "../_lib/catalog-public-projection.mjs";
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

const academyTypeLabels: Record<string, string> = {
  business_academy: "Business academy",
  online_school: "Online school",
  courses: "Courses",
  business_club: "Business club",
  coaching: "Coaching / mentoring",
  corporate_academy: "Corporate academy",
};

export async function onRequestGet({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureRepairShopProfileSchema(env.DB);
  await ensureAcademyBusinessProfilesSchema(env.DB);
  await ensureHomeServiceCrmSchema(env.DB);

  const [companyResult, repairResult] = await Promise.all([
    env.DB.prepare(`
      SELECT
        c.id,c.company_name,c.slug,c.company_type,c.city,c.state,c.country_code,c.website,
        c.catalog_status,c.created_at,c.updated_at,
        a.academy_type,h.service_subtype,h.services_json
      FROM hermes_company_profiles c
      LEFT JOIN hermes_academy_business_profiles a ON a.company_id=c.id
      LEFT JOIN hermes_home_service_profiles h ON h.company_id=c.id
      WHERE c.catalog_opt_in = 1
        AND c.catalog_status IN ('self_submitted', 'verified_public')
      ORDER BY CASE WHEN c.catalog_status = 'verified_public' THEN 0 ELSE 1 END, c.updated_at DESC
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

  const companies = (companyResult?.results || []).map((row: any) => {
    const academySubtype = String(row.academy_type || "");
    const isAcademy = Boolean(academySubtype);
    const isHomeService = !isAcademy && String(row.company_type || "") === "home_service";
    let homeServices: string[] = [];
    if (isHomeService) {
      try {
        const parsed = JSON.parse(String(row.services_json || "[]"));
        homeServices = Array.isArray(parsed) ? parsed.map(String).filter(Boolean).slice(0, 20) : [];
      } catch {}
    }
    const homeSubtype = String(row.service_subtype || "home_service");
    const homeTypeLabel = homeSubtype === "junk_removal"
      ? "Junk Removal & Hauling"
      : homeSubtype.replaceAll("_", " ").replace(/\\b\\w/g, (letter: string) => letter.toUpperCase());
    return {
      id: String(row.id),
      companyName: String(row.company_name || ""),
      slug: String(row.slug || ""),
      companyType: isAcademy ? "academy_business" : String(row.company_type || "other"),
      ...(isAcademy ? {
        subtype: academySubtype,
        typeLabel: academyTypeLabels[academySubtype] || "Academy / Courses",
      } : isHomeService ? {
        subtype: homeSubtype,
        typeLabel: homeTypeLabel,
      } : {}),
      city: String(row.city || ""),
      state: String(row.state || ""),
      countryCode: String(row.country_code || "US"),
      status: String(row.catalog_status || "self_submitted"),
      source: isAcademy ? "academy_business_crm" : isHomeService ? "home_service_crm" : "hermes_connect_company",
      profileUrl: isAcademy ? catalogProjectionPath({ vertical:"academy_business", website:row.website, slug:String(row.slug || "") }) : isHomeService ? `/businesses/connect/company/${encodeURIComponent(String(row.slug || ""))}/` : null,
      services: isAcademy ? ["Programs", "Courses", "Learning", "Business education"] : isHomeService ? homeServices : [],
      verificationLabel: row.catalog_status === "verified_public" ? "Verified" : "Self-submitted · verification pending",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  for (const row of repairResult?.results || []) {
    const services = await repairShopServices(env.DB, String(row.owner_specialist_id || ""), String(row.id || ""));
    companies.push({
      id: `repair-shop-crm:${row.id}`,
      companyName: row.name,
      slug: row.slug,
      companyType: "repair_shop",
      city: row.city,
      state: row.region || row.state || row.country_code,
      countryCode: row.country_code || "US",
      status: "self_submitted",
      source: "repair_shop_crm",
      profileUrl: `/businesses/connect/repair-shop/${encodeURIComponent(String(row.slug || ""))}/`,
      services,
      verificationLabel: "Self-submitted · verification pending",
      seoGeo: {
        startedAt: row.seo_geo_started_at || row.catalog_published_at || null,
        reportingCadence: "weekly",
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
