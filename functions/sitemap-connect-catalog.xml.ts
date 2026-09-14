import { listPublicCatalogEntries } from "./api/_lib/catalog-public.mjs";
type Env = { DB?: any };
const x = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c] || c));
export async function onRequestGet({ env }: { env: Env }) {
  if (!env.DB) return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=60"} });
  const entries = await listPublicCatalogEntries(env.DB, 1000);
  const urls = entries.map((entry: any) => `<url><loc>https://hermeslogisticsus.com${x(entry.profileUrl)}</loc><lastmod>${x(String(entry.updatedAt || entry.createdAt || '').slice(0,10))}</lastmod><changefreq>monthly</changefreq><priority>0.72</priority></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=300, s-maxage=900"} });
}
