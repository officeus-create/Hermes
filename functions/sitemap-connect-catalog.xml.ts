import { ensureRepairShopProfileSchema } from "./api/_lib/repair-shop-schema.mjs";
import { ensureAcademyBusinessProfilesSchema } from "./api/_lib/academy-business-profiles.mjs";

type Env = { DB?: any };
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
}[char] || char));

export async function onRequestGet({ env }: { env: Env }) {
  const empty = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  if (!env.DB) return new Response(empty, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=60" } });
  await ensureRepairShopProfileSchema(env.DB);
  await ensureAcademyBusinessProfilesSchema(env.DB);
  const result = await env.DB.prepare(`
    SELECT slug,updated_at
    FROM repair_shops
    WHERE catalog_opt_in=1
    ORDER BY updated_at DESC
    LIMIT 5000
  `).all();
  const repairUrls = (result?.results || []).map((row: any) => {
    const slug = encodeURIComponent(String(row.slug || ""));
    const lastmod = String(row.updated_at || "").slice(0, 10);
    return `<url><loc>https://hermeslogisticsus.com/businesses/connect/repair-shop/${esc(slug)}/</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.72</priority></url>`;
  }).join("");
  const academyResult = await env.DB.prepare(`
    SELECT slug,updated_at
    FROM hermes_academy_business_profiles
    WHERE catalog_opt_in=1
    ORDER BY updated_at DESC
    LIMIT 5000
  `).all();
  const academyUrls = (academyResult?.results || []).map((row: any) => {
    const slug = encodeURIComponent(String(row.slug || ""));
    const lastmod = String(row.updated_at || "").slice(0, 10);
    return `<url><loc>https://hermeslogisticsus.com/businesses/connect/academy/${esc(slug)}/</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.68</priority></url>`;
  }).join("");
  const urls = repairUrls + academyUrls;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=900" },
  });
}
