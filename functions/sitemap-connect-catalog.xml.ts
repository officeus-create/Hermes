import { repairCatalogPublication, REPAIR_CATALOG_CACHE_CONTROL } from "./api/_lib/repair-catalog-publication.mjs";
import { ensureRepairShopProfileSchema } from "./api/_lib/repair-shop-schema.mjs";
import { ensureAcademyBusinessProfilesSchema } from "./api/_lib/academy-business-profiles.mjs";
import { ensureHermesCompanyProfilesSchema } from "./api/_lib/hermes-company-profiles.mjs";
import { ensureHomeServiceCrmSchema } from "./api/_lib/home-service-crm.mjs";
import { homeServiceCatalogPublication } from "./api/_lib/home-service-catalog-publication.mjs";

type Env = { DB?: any };
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
}[char] || char));

export async function onRequestGet({ env }: { env: Env }) {
  const empty = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  if (!env.DB) return new Response(empty, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": REPAIR_CATALOG_CACHE_CONTROL } });
  await ensureRepairShopProfileSchema(env.DB);
  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureAcademyBusinessProfilesSchema(env.DB);
  await ensureHomeServiceCrmSchema(env.DB);
  const result = await env.DB.prepare(`
    SELECT id,name,slug,catalog_opt_in,updated_at
    FROM repair_shops
    WHERE catalog_opt_in=1
    ORDER BY updated_at DESC
    LIMIT 5000
  `).all();
  const repairUrls = (result?.results || []).filter((row: any) => repairCatalogPublication(row).eligible).map((row: any) => {
    const path = repairCatalogPublication(row).path;
    const lastmod = String(row.updated_at || "").slice(0, 10);
    return `<url><loc>https://hermeslogisticsus.com${esc(path)}</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.72</priority></url>`;
  }).join("");
  const academyResult = await env.DB.prepare(`
    SELECT c.slug,c.updated_at
    FROM hermes_company_profiles c
    JOIN hermes_academy_business_profiles a ON a.company_id=c.id
    WHERE c.catalog_opt_in=1
      AND c.catalog_status IN ('self_submitted','verified_public')
    ORDER BY c.updated_at DESC
    LIMIT 5000
  `).all();
  const academyUrls = (academyResult?.results || []).map((row: any) => {
    const slug = encodeURIComponent(String(row.slug || ""));
    const lastmod = String(row.updated_at || "").slice(0, 10);
    return `<url><loc>https://hermeslogisticsus.com/businesses/connect/academy/${esc(slug)}/</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.68</priority></url>`;
  }).join("");
  const homeServiceResult = await env.DB.prepare(`
    SELECT c.slug,c.catalog_opt_in,c.catalog_status,c.management_mode,c.catalog_publication_basis,c.updated_at
    FROM hermes_company_profiles c
    JOIN hermes_home_service_profiles h ON h.company_id=c.id
    WHERE c.company_type='home_service'
      AND c.catalog_status IN ('self_submitted','verified_public')
      AND (c.catalog_opt_in=1 OR c.management_mode='hermes_managed')
    ORDER BY c.updated_at DESC
    LIMIT 5000
  `).all();
  const homeServiceUrls = (homeServiceResult?.results || [])
    .filter((row: any) => homeServiceCatalogPublication(row).eligible)
    .map((row: any) => {
      const publication = homeServiceCatalogPublication(row);
      const path = String(publication.path || "");
      const lastmod = String(row.updated_at || "").slice(0, 10);
      return `<url><loc>https://hermeslogisticsus.com${esc(path)}</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.70</priority></url>`;
    }).join("");
  const urls = repairUrls + academyUrls + homeServiceUrls;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": REPAIR_CATALOG_CACHE_CONTROL },
  });
}
