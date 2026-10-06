import { ensureHomeServiceCrmSchema } from "../../../api/_lib/home-service-crm.mjs";

type Env = { DB?: any };
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] || char));
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const safeHttpUrl = (value: unknown) => {
  try { const url = new URL(String(value ?? "").trim()); return /^https?:$/.test(url.protocol) ? url.toString() : ""; }
  catch { return ""; }
};
const readArray = (value: unknown) => { try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } };

export async function onRequestGet({ env, params }: { env: Env; params: { slug?: string } }) {
  if (!env.DB) return new Response("Service unavailable", { status: 503 });
  await ensureHomeServiceCrmSchema(env.DB);
  const slug = String(params.slug || "").trim().slice(0, 120);
  if (!/^[a-z0-9-]+$/i.test(slug)) return new Response("Not found", { status: 404 });

  const row = await env.DB.prepare(`
    SELECT c.id,c.company_name,c.slug,c.company_type,c.city,c.state,c.country_code,c.website,c.phone,c.address_line1,c.postal_code,
           c.catalog_status,c.updated_at,h.service_subtype,h.services_json,h.service_areas_json,h.public_summary
    FROM hermes_company_profiles c
    JOIN hermes_home_service_profiles h ON h.company_id=c.id
    WHERE c.slug=? AND c.company_type='home_service' AND c.catalog_opt_in=1
      AND c.catalog_status IN ('self_submitted','verified_public')
    LIMIT 1
  `).bind(slug).first();
  if (!row) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });

  const canonical = `https://hermeslogisticsus.com/businesses/connect/company/${encodeURIComponent(String(row.slug))}/`;
  const services = readArray(row.services_json);
  const serviceAreas = readArray(row.service_areas_json);
  const website = safeHttpUrl(row.website);
  const phone = String(row.phone || "").trim();
  const phoneDial = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const summary = String(row.public_summary || `${row.company_name} provides local home and property services in ${row.city}, ${row.state} and nearby communities.`);
  const verification = row.catalog_status === "verified_public" ? "Verified public profile" : "Client profile · public facts pending independent verification";
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": canonical + "#business",
    name: row.company_name,
    url: website || canonical,
    ...(phone ? { telephone: phone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: row.address_line1 || undefined,
      addressLocality: row.city,
      addressRegion: row.state,
      postalCode: row.postal_code || undefined,
      addressCountry: row.country_code || "US",
    },
    areaServed: serviceAreas.map((name) => ({ "@type": "City", name })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${row.company_name} services`,
      itemListElement: services.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    },
  };
  const serviceList = services.map((service) => `<li>${esc(service)}</li>`).join("");
  const areaList = serviceAreas.map((area) => `<li>${esc(area)}</li>`).join("");
  const websiteAction = website ? `<a class="btn" href="${esc(website)}" target="_blank" rel="nofollow noopener">Official website ↗</a>` : "";
  const phoneAction = phoneDial ? `<a class="btn" href="tel:${esc(phoneDial)}">Call ${esc(phone)}</a>` : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(row.company_name)} | ${esc(row.city)}, ${esc(row.state)} | Hermes Catalog</title>
<meta name="description" content="${esc(summary)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow">
<script type="application/ld+json">${jsonLd(schema)}</script>
<style>:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#172033;background:#f5f7fa}*{box-sizing:border-box}body{margin:0}a{color:inherit}.shell{width:min(1120px,calc(100% - 32px));margin:auto}.top{background:#fff;border-bottom:1px solid #e0e7ef}.top .shell{min-height:68px;display:flex;align-items:center;justify-content:space-between}.brand{font-weight:900;text-decoration:none}.main{padding:42px 0 74px}.crumb{color:#64748b;font-size:13px;margin-bottom:20px}.hero{padding:clamp(26px,6vw,60px);border:1px solid #dce5ee;border-radius:28px;background:radial-gradient(circle at 88% 10%,rgba(44,133,183,.13),transparent 28rem),#fff;box-shadow:0 20px 58px rgba(27,45,70,.07)}.eyebrow{margin:0;color:#226d99;font-size:11px;font-weight:900;letter-spacing:.11em;text-transform:uppercase}.status{display:inline-flex;margin-top:15px;padding:7px 10px;border-radius:999px;background:#eef5fb;color:#315f7f;font-size:11px;font-weight:850}h1{margin:15px 0 10px;font-size:clamp(42px,7vw,78px);line-height:.98;letter-spacing:-.05em}.lead{max-width:820px;color:#5d6c7d;font-size:18px;line-height:1.65}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:24px}.btn{min-height:44px;display:inline-flex;align-items:center;padding:9px 14px;border:1px solid #cdd9e4;border-radius:10px;background:#fff;text-decoration:none;font-weight:800}.btn.primary{background:#172033;color:#fff}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}.card{padding:23px;border:1px solid #dfe6ee;border-radius:19px;background:#fff}.card h2{margin:7px 0 12px}.card ul{columns:2;padding-left:19px}.card li{margin:0 0 7px;color:#607087}.note{margin-top:16px;padding:15px 17px;border-radius:14px;background:#fff8e8;color:#74581d;font-size:12px;line-height:1.6}@media(max-width:760px){.grid{grid-template-columns:1fr}.card ul{columns:1}.hero{padding:28px 22px}}</style></head><body>
<header class="top"><div class="shell"><a class="brand" href="/businesses/">Hermes Catalog</a><a href="/services/hermes-connect/">Hermes Connect</a></div></header>
<main class="shell main"><nav class="crumb"><a href="/businesses/">Catalog</a> / ${esc(row.company_name)}</nav>
<section class="hero"><p class="eyebrow">${esc(String(row.service_subtype || "home service").replaceAll("_"," "))} · ${esc(row.city)}, ${esc(row.state)}</p>
<span class="status">${esc(verification)}</span><h1>${esc(row.company_name)}</h1><p class="lead">${esc(summary)}</p>
<div class="actions"><a class="btn primary" href="/services/hermes-connect/access/?lang=en">Owner CRM login</a>${websiteAction}${phoneAction}</div></section>
<section class="grid"><article class="card"><p class="eyebrow">Services</p><h2>What the business handles</h2><ul>${serviceList}</ul></article>
<article class="card"><p class="eyebrow">Service area</p><h2>Where the team operates</h2><ul>${areaList}</ul></article></section>
<p class="note">This public Catalog page contains business-level facts only. Customer names, phone numbers, addresses, job photos, quotes, costs, payments and private CRM records are not published here.</p>
</main></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
