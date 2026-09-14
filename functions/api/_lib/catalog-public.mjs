import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";
import { ensureRepairShopProfileSchema } from "./repair-shop-schema.mjs";
import { ensureServiceContextSchema } from "./service-context.mjs";

const clean = (value, max = 240) => String(value ?? "").trim().slice(0, max);
const splitServices = (value) => clean(value, 2400).split(" · ").map((item) => item.trim()).filter(Boolean).slice(0, 20);

async function servicesTableExists(db) {
  const row = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='services' LIMIT 1").first();
  return Boolean(row);
}

async function repairServiceMap(db, shopIds = []) {
  const map = new Map();
  if (!shopIds.length || !(await servicesTableExists(db))) return map;
  await ensureServiceContextSchema(db);
  const placeholders = shopIds.map(() => "?").join(",");
  const result = await db.prepare(`
    SELECT bc.business_id AS shop_id, s.name
    FROM hermes_business_contexts bc
    JOIN hermes_service_contexts sc ON sc.context_id = bc.id
    JOIN services s ON s.id = sc.service_id
    WHERE bc.vertical_key = 'repair_shop' AND bc.business_id IN (${placeholders})
    ORDER BY bc.business_id, s.name COLLATE NOCASE
  `).bind(...shopIds).all();  for (const row of result?.results ?? []) {
    const key = clean(row.shop_id, 120);
    const name = clean(row.name, 120);
    if (!key || !name) continue;
    const values = map.get(key) ?? [];
    if (values.length < 20 && !values.includes(name)) values.push(name);
    map.set(key, values);
  }
  return map;
}

function companyEntry(row) {
  return {
    id: clean(row.id, 120),
    kind: "company",
    companyName: clean(row.company_name, 140),
    slug: clean(row.slug, 120),
    companyType: clean(row.company_type, 60) || "other",
    city: clean(row.city, 100),
    state: clean(row.state, 100),
    countryCode: "US",
    website: row.website ? clean(row.website, 240) : null,
    services: splitServices(row.service_summary),
    status: clean(row.catalog_status, 40) || "self_submitted",
    verificationLabel: row.catalog_status === "verified_public" ? "Verified" : "Self-submitted · verification pending",
    profileUrl: `/businesses/connect/company/${encodeURIComponent(clean(row.slug, 120))}/`,
    seoGeo: null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}function repairEntry(row, services = []) {
  const region = clean(row.region || row.state || row.country_code, 100);
  return {
    id: clean(row.id, 120),
    kind: "repair_shop",
    companyName: clean(row.name, 140),
    slug: clean(row.slug, 120),
    companyType: "repair_shop",
    city: clean(row.city, 100),
    state: region,
    countryCode: clean(row.country_code, 2).toUpperCase() || "US",
    website: row.website ? clean(row.website, 240) : null,
    services,
    status: "owner_published",
    verificationLabel: "Owner-published · Hermes verification pending",
    profileUrl: `/businesses/connect/repair-shop/${encodeURIComponent(clean(row.slug, 120))}/`,
    seoGeo: {
      startedAt: row.seo_geo_started_at || row.catalog_published_at || null,
      reportingCadence: "monthly",
      nextReportAt: row.next_seo_report_at || null,
      evaluationHorizon: "6 months+",
      guarantee: false,
    },
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

async function ensureCatalogSources(db) {
  await ensureHermesCompanyProfilesSchema(db);
  await ensureRepairShopProfileSchema(db);
}export async function listPublicCatalogEntries(db, limit = 500) {
  await ensureCatalogSources(db);
  const bounded = Math.max(1, Math.min(Number(limit) || 500, 1000));
  const [companyResult, repairResult] = await Promise.all([
    db.prepare(`
      SELECT id,company_name,slug,company_type,city,state,website,catalog_status,created_at,updated_at
      FROM hermes_company_profiles
      WHERE catalog_opt_in=1 AND catalog_status IN ('self_submitted','verified_public')
      ORDER BY updated_at DESC LIMIT ?
    `).bind(bounded).all(),
    db.prepare(`
      SELECT id,owner_specialist_id,name,slug,city,state,region,country_code,website,
             catalog_published_at,seo_geo_started_at,next_seo_report_at,created_at,updated_at
      FROM repair_shops
      WHERE catalog_opt_in=1
      ORDER BY updated_at DESC LIMIT ?
    `).bind(bounded).all(),
  ]);
  const repairRows = repairResult?.results ?? [];
  const services = await repairServiceMap(db, repairRows.map((row) => clean(row.id, 120)).filter(Boolean));
  const entries = [
    ...(companyResult?.results ?? []).map(companyEntry),
    ...repairRows.map((row) => repairEntry(row, services.get(clean(row.id, 120)) ?? [])),
  ];
  return entries.sort((a, b) => {
    const verifiedDelta = Number(b.status === "verified_public") - Number(a.status === "verified_public");
    if (verifiedDelta) return verifiedDelta;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  }).slice(0, bounded);
}export async function getPublicCatalogEntry(db, kind, slug) {
  await ensureCatalogSources(db);
  const safeSlug = clean(slug, 120);
  if (!safeSlug) return null;
  if (kind === "company") {
    const row = await db.prepare(`
      SELECT id,company_name,slug,company_type,city,state,website,catalog_status,created_at,updated_at
      FROM hermes_company_profiles
      WHERE slug=? AND catalog_opt_in=1 AND catalog_status IN ('self_submitted','verified_public')
      LIMIT 1
    `).bind(safeSlug).first();
    return row ? companyEntry(row) : null;
  }
  if (kind !== "repair-shop") return null;
  const row = await db.prepare(`
    SELECT id,owner_specialist_id,name,slug,city,state,region,country_code,website,
           catalog_published_at,seo_geo_started_at,next_seo_report_at,created_at,updated_at
    FROM repair_shops
    WHERE slug=? AND catalog_opt_in=1
    LIMIT 1
  `).bind(safeSlug).first();
  if (!row) return null;
  const services = await repairServiceMap(db, [clean(row.id, 120)]);
  return repairEntry(row, services.get(clean(row.id, 120)) ?? []);
}