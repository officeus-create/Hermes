import { getPublicCatalogEntry } from "../../../api/_lib/catalog-public.mjs";

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] || char));
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
type Env = { DB?: any };

export async function onRequestGet({ env, params }: { env: Env; params: { kind?: string; slug?: string } }) {
  if (!env.DB) return new Response("Service unavailable", { status: 503 });
  const kind = String(params.kind || "").trim();
  const slug = String(params.slug || "").trim();
  const entry = await getPublicCatalogEntry(env.DB, kind, slug);
  if (!entry) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });

  const canonical = `https://hermeslogisticsus.com${entry.profileUrl}`;
  const schemaType = entry.kind === "repair_shop" ? "AutoRepair" : "Organization";
  const schema = {
    "@context": "https://schema.org", "@type": schemaType, name: entry.companyName, url: canonical,
    address: { "@type": "PostalAddress", addressLocality: entry.city, addressRegion: entry.state, addressCountry: entry.countryCode },
    ...(entry.website ? { sameAs: [entry.website] } : {}),
  };
  const serviceList = entry.services.length
    ? `<ul>${entry.services.map((service: string) => `<li>${esc(service)}</li>`).join("")}</ul>`
    : '<p class="muted">Services are managed by the business and may still be under review.</p>';
  const website = entry.website
    ? `<a class="button secondary" href="${esc(entry.website)}" rel="nofollow noopener" target="_blank">Visit website</a>`
    : "";
  const visibilityPanel = entry.seoGeo
    ? `<section class="panel"><h2>Search visibility program</h2><p class="muted">Initial SEO/GEO preparation begins with the published profile and structured business facts. Reporting cadence is monthly. Organic, local and AI-search progress should be evaluated over a longer horizon, commonly 6+ months; rankings, traffic and leads are not guaranteed.</p></section>`
    : `<section class="panel"><h2>Hermes Connect profile</h2><p class="muted">This public company profile is supplied through Hermes Connect. Verification status is shown above; private workspace data is never exposed here.</p></section>`;
  const growthHref = `/businesses/request/?type=catalog-growth&business=${encodeURIComponent(entry.companyName)}&profile=${encodeURIComponent(canonical)}`;
  const description = `${entry.companyName} in ${entry.city}, ${entry.state}. Public business profile supplied through Hermes Connect.`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(entry.companyName)} | Hermes Catalog</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow">
<script type="application/ld+json">${jsonLd(schema)}</script><style>
body{margin:0;background:#f5f7fa;color:#172033;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}.shell{width:min(920px,calc(100% - 32px));margin:auto;padding:72px 0}.back{color:#2168a6;text-decoration:none;font-weight:800}.card{margin-top:24px;padding:clamp(24px,5vw,46px);border:1px solid #dbe4ed;border-radius:24px;background:#fff;box-shadow:0 20px 55px rgba(34,68,103,.08)}.eyebrow{color:#2168a6;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.status{display:inline-flex;margin-left:8px;padding:5px 8px;border-radius:999px;background:#fff3d8;color:#8a6200;font-size:11px;font-weight:850}.verified{background:#e7f7ed;color:#247443}h1{margin:.6rem 0;font-size:clamp(38px,7vw,66px);line-height:1;letter-spacing:-.045em}.location,.muted{color:#657286;line-height:1.65}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px}.panel{padding:20px;border:1px solid #e0e7ef;border-radius:16px;background:#fafcff}.panel h2{margin:0 0 10px;font-size:20px}.panel ul{padding-left:20px;line-height:1.7}.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px}.button{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:11px;background:#172033;color:#fff;text-decoration:none;font-weight:850}.button.secondary{border:1px solid #cfdbe7;background:#fff;color:#245f91}.notice{margin-top:24px;padding:15px;border-left:3px solid #6e91b4;background:#f5f8fb;color:#607186;line-height:1.6;font-size:13px}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style></head><body>`;
  const verifiedClass = entry.status === "verified_public" ? " verified" : "";
  const body = `<main class="shell"><a class="back" href="/businesses/">← Hermes Catalog</a><article class="card">
<p class="eyebrow">Hermes Catalog <span class="status${verifiedClass}">${esc(entry.verificationLabel)}</span></p>
<h1>${esc(entry.companyName)}</h1><p class="location">${esc(entry.city)}, ${esc(entry.state)}</p>
<div class="grid"><section class="panel"><h2>Services</h2>${serviceList}</section>${visibilityPanel}</div>
<div class="actions">${website}<a class="button" href="${growthHref}">Request growth review</a></div>
<p class="notice">Only public business facts approved for Catalog are shown. Customer records, appointments, private contacts and other CRM data are never published here.</p>
</article></main></body></html>`;
  return new Response(html + body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
