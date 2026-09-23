import { ensureRepairShopProfileSchema } from "../../../api/_lib/repair-shop-schema.mjs";
import { ensureServiceContextSchema, listServicesForContext } from "../../../api/_lib/service-context.mjs";

type Env = { DB?: any };

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] || char));
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

async function servicesForShop(db: any, ownerId: string, shopId: string) {
  await ensureServiceContextSchema(db);
  const context = await db.prepare(`
    SELECT id,is_default FROM hermes_business_contexts
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

export async function onRequestGet({ env, params }: { env: Env; params: { slug?: string } }) {
  if (!env.DB) return new Response("Service unavailable", { status: 503 });
  await ensureRepairShopProfileSchema(env.DB);
  const slug = String(params.slug || "").trim().slice(0, 80);
  if (!/^[a-z0-9-]+$/i.test(slug)) return new Response("Not found", { status: 404 });

  const row = await env.DB.prepare(`
    SELECT id,owner_specialist_id,name,slug,address_line1,city,state,region,country_code,postal_code,website,
           catalog_published_at,seo_geo_started_at,next_seo_report_at,updated_at
    FROM repair_shops
    WHERE slug=? AND catalog_opt_in=1
    LIMIT 1
  `).bind(slug).first();
  if (!row) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });

  const services = await servicesForShop(env.DB, String(row.owner_specialist_id || ""), String(row.id || ""));
  const canonical = `https://hermeslogisticsus.com/businesses/connect/repair-shop/${encodeURIComponent(String(row.slug))}/`;
  const location = [row.city, row.region || row.state].filter(Boolean).join(", ");
  const addressText = [row.address_line1, row.city, row.region || row.state, row.postal_code].filter(Boolean).join(", ");
  const serviceSummary = services.slice(0, 3).join(", ");
  const description = [
    `${row.name} in ${location}.`,
    serviceSummary ? `Services include ${serviceSummary}.` : "",
    "Owner-submitted business profile published from Hermes Connect.",
  ].filter(Boolean).join(" ");
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": canonical + "#business",
    name: row.name,
    url: canonical,
    mainEntityOfPage: canonical,
    address: {
      "@type": "PostalAddress",
      streetAddress: row.address_line1 || undefined,
      addressLocality: row.city,
      addressRegion: row.region || row.state || undefined,
      postalCode: row.postal_code || undefined,
      addressCountry: row.country_code || "US",
    },
    ...(location ? { areaServed: { "@type": "City", name: location } } : {}),
    ...(services.length ? { knowsAbout: services } : {}),
    ...(row.website ? { sameAs: [row.website] } : {}),
  };
  const serviceList = services.length
    ? `<ul>${services.map((service: string) => `<li>${esc(service)}</li>`).join("")}</ul>`
    : '<p class="muted">Services will appear here after the business saves them in Hermes Connect.</p>';
  const website = row.website
    ? `<a class="button secondary" href="${esc(row.website)}" rel="nofollow noopener" target="_blank">Visit business website</a>`
    : "";
  const nextReport = row.next_seo_report_at ? String(row.next_seo_report_at).slice(0, 10) : "scheduled after publication";

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(row.name)} | Hermes Catalog</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow"><script type="application/ld+json">${jsonLd(schema)}</script><style>body{margin:0;background:#f5f7fa;color:#172033;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}.shell{width:min(920px,calc(100% - 32px));margin:auto;padding:72px 0}.back{color:#2168a6;text-decoration:none;font-weight:800}.card{margin-top:24px;padding:clamp(24px,5vw,46px);border:1px solid #dbe4ed;border-radius:24px;background:#fff;box-shadow:0 20px 55px rgba(34,68,103,.08)}.eyebrow{color:#2168a6;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.status{display:inline-flex;margin-left:8px;padding:5px 8px;border-radius:999px;background:#fff3d8;color:#8a6200;font-size:11px;font-weight:850}h1{margin:.6rem 0;font-size:clamp(38px,7vw,66px);line-height:1;letter-spacing:-.045em}.location,.muted{color:#657286;line-height:1.65}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px}.panel{padding:20px;border:1px solid #e0e7ef;border-radius:16px;background:#fafcff}.panel h2{margin:0 0 10px;font-size:20px}.panel ul{padding-left:20px;line-height:1.7}.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px}.button{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:11px;background:#172033;color:#fff;text-decoration:none;font-weight:850}.button.secondary{border:1px solid #cfdbe7;background:#fff;color:#245f91}.notice{margin-top:24px;padding:15px;border-left:3px solid #6e91b4;background:#f5f8fb;color:#607186;line-height:1.6;font-size:13px}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style></head><body><main class="shell"><a class="back" href="/businesses/">← Hermes Catalog</a><article class="card"><p class="eyebrow">Hermes Catalog <span class="status">Self-submitted · verification pending</span></p><h1>${esc(row.name)}</h1><p class="location">${esc(addressText || location)}</p><div class="grid"><section class="panel"><h2>Services</h2>${serviceList}</section><section class="panel"><h2>Search visibility</h2><p class="muted">This public profile is generated from owner-approved Hermes Connect business facts. Initial SEO/GEO preparation begins with publication and crawlable structured data. The reporting schedule is monthly; the next scheduled checkpoint is ${esc(nextReport)}. Organic, local and AI-search performance should be evaluated over a longer horizon, commonly 6+ months. Rankings, traffic and leads are not guaranteed.</p></section></div><div class="actions">${website}<a class="button" href="/businesses/request/?type=catalog-growth&business=${encodeURIComponent(String(row.name))}&profile=${encodeURIComponent(canonical)}">Request growth review</a><a class="button secondary" href="/services/hermes-connect/repair-shops/catalog/">Manage Catalog listing</a></div><p class="notice">Public facts are owner-submitted through Hermes Connect. Customer records, appointments, private contacts and authentication data are never published in this profile.</p></article></main></body></html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
