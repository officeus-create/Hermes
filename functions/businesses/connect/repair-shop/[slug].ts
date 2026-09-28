import { ensureRepairShopProfileSchema } from "../../../api/_lib/repair-shop-schema.mjs";
import { ensureRepairShopAvailabilitySchema } from "../../../api/_lib/repair-shop-availability-schema.mjs";
import { ensureServiceContextSchema, listServicesForContext } from "../../../api/_lib/service-context.mjs";

type Env = { DB?: any };

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] || char));
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const safeHttpUrl = (value: unknown) => {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function hoursForShop(db: any, shopId: string) {
  await ensureRepairShopAvailabilitySchema(db);
  const result = await db.prepare(
    "SELECT day_of_week,is_open,start_time,end_time FROM repair_shop_availability WHERE shop_id=? ORDER BY day_of_week ASC"
  ).bind(shopId).all();
  return (result?.results ?? [])
    .map((item: any) => ({
      day: Number(item.day_of_week),
      isOpen: Number(item.is_open || 0) === 1,
      opens: String(item.start_time || "").trim(),
      closes: String(item.end_time || "").trim(),
    }))
    .filter((item: any) => Number.isInteger(item.day) && item.day >= 0 && item.day <= 6);
}

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
    SELECT id,owner_specialist_id,name,slug,address_line1,city,state,region,country_code,postal_code,phone,website,
           instagram_url,facebook_url,threads_url,catalog_published_at,seo_geo_started_at,next_seo_report_at,updated_at
    FROM repair_shops
    WHERE slug=? AND catalog_opt_in=1
    LIMIT 1
  `).bind(slug).first();
  if (!row) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });

  const services = await servicesForShop(env.DB, String(row.owner_specialist_id || ""), String(row.id || ""));
  const hours = await hoursForShop(env.DB, String(row.id || ""));
  const canonical = `https://hermeslogisticsus.com/businesses/connect/repair-shop/${encodeURIComponent(String(row.slug))}/`;
  const location = [row.city, row.region || row.state].filter(Boolean).join(", ");
  const addressText = [row.address_line1, row.city, row.region || row.state, row.postal_code].filter(Boolean).join(", ");
  const phoneText = String(row.phone || "").trim();
  const phoneDial = phoneText.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const websiteUrl = safeHttpUrl(row.website);
  const socialUrls = [websiteUrl, safeHttpUrl(row.instagram_url), safeHttpUrl(row.facebook_url), safeHttpUrl(row.threads_url)].filter(Boolean);
  const hasOpenHours = hours.some((item: any) => item.isOpen && item.opens && item.closes);
  const bookingReady = services.length > 0 && hasOpenHours;
  const bookingHref = `/services/hermes-connect/repair-shops/booking/?shop=${encodeURIComponent(String(row.slug))}`;
  const mapsHref = addressText
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`
    : "";
  const serviceSummary = services.slice(0, 3).join(", ");
  const description = [
    `${row.name} in ${location}.`,
    serviceSummary ? `Services include ${serviceSummary}.` : "",
    "Hermes Catalog business profile; services and hours await owner review.",
  ].filter(Boolean).join(" ");
  const openingHoursSpecification = hours
    .filter((item: any) => item.isOpen && item.opens && item.closes)
    .map((item: any) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${dayNames[item.day]}`,
      opens: item.opens,
      closes: item.closes,
    }));
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
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
    ...(phoneText ? { telephone: phoneText } : {}),
    ...(socialUrls.length ? { sameAs: socialUrls } : {}),
  };
  const serviceList = services.length
    ? `<ul>${services.map((service: string) => `<li>${esc(service)}</li>`).join("")}</ul>`
    : '<p class="muted">Services will appear here after the business saves them in Hermes Connect.</p>';
  const hoursList = hours.length
    ? `<ul>${hours.map((item: any) => `<li>${esc(dayNames[item.day])}: ${item.isOpen && item.opens && item.closes ? `${esc(item.opens)}–${esc(item.closes)}` : "Closed"}</li>`).join("")}</ul>`
    : '<p class="muted">Hours will appear here after the business saves them in Hermes Connect.</p>';
  const booking = bookingReady
    ? `<a class="button primary" href="${esc(bookingHref)}">Book an appointment</a>`
    : "";
  const phone = phoneDial
    ? `<a class="button" data-catalog-action="call_click" href="tel:${esc(phoneDial)}">Call ${esc(phoneText)}</a>`
    : "";
  const maps = mapsHref
    ? `<a class="button" data-catalog-action="maps_click" href="${esc(mapsHref)}" rel="noopener" target="_blank">Directions on Google Maps <span aria-hidden="true">↗</span></a>`
    : "";
  const website = websiteUrl
    ? `<a class="button" data-catalog-action="website_click" href="${esc(websiteUrl)}" rel="nofollow noopener" target="_blank">Open listed website <span aria-hidden="true">↗</span></a>`
    : "";
  const requestParams = new URLSearchParams({
    type: "catalog-business-request",
    business: String(row.name),
    business_id: `repair-shop-crm:${String(row.id)}`,
    profile: canonical,
    city: String(row.city || ""),
    state: String(row.region || row.state || ""),
    country: String(row.country_code || "US"),
    source_ref: "repair_shop_crm",
  });
  const contactRequestHref = `/businesses/request/?${requestParams.toString()}`;
  const claimHref = `/businesses/request/?type=claim&business=${encodeURIComponent(String(row.name))}&profile=${encodeURIComponent(canonical)}`;
  const growthHref = `/businesses/request/?type=catalog-growth&business=${encodeURIComponent(String(row.name))}&profile=${encodeURIComponent(canonical)}`;

  const css = `
    :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#172033;background:#f4f7fa}
    *{box-sizing:border-box}body{margin:0}a{color:inherit}a:focus-visible{outline:3px solid #2474c7;outline-offset:3px}
    .skip{position:absolute;left:16px;top:-60px;padding:10px 14px;background:#fff;z-index:2}.skip:focus{top:10px}
    .site-top{border-bottom:1px solid #dfe6ee;background:#fff}.site-top-inner,.shell{width:min(1100px,calc(100% - 36px));margin:auto}
    .site-top-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:72px}
    .brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-size:18px;font-weight:850;letter-spacing:-.03em}
    .brand em{font-size:12px;font-style:normal;font-weight:750;color:#5e7188;letter-spacing:0}
    .mark{display:inline-grid;place-items:center;width:34px;height:34px;border:1px solid #ced9e5;border-radius:9px;color:#1763a8}
    .top-link{font-size:13px;font-weight:750;color:#235f9b;text-underline-offset:3px}
    .shell{padding:26px 0 72px}.crumb{margin:0 0 24px;color:#61748a;font-size:13px}.crumb a{color:#235f9b;text-decoration:none;font-weight:750}
    .hero{position:relative;overflow:hidden;padding:clamp(26px,5vw,58px);border:1px solid #dce7f1;border-radius:24px;background:linear-gradient(125deg,#fff 55%,#eef6ff);box-shadow:0 18px 48px rgba(24,62,107,.07)}
    .hero:after{position:absolute;right:-110px;top:-145px;width:370px;height:370px;content:"";border:1px solid #c9ddf2;border-radius:50%;pointer-events:none}
    .hero>*{position:relative;z-index:1}.eyebrow{margin:0;color:#2672b1;font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}
    .status{display:inline-flex;margin:18px 0 0;padding:7px 11px;border:1px solid #ecd89b;border-radius:999px;background:#fff6da;color:#765718;font-size:12px;font-weight:750}
    h1{max-width:880px;margin:15px 0;font-size:clamp(38px,6vw,68px);line-height:1.08;letter-spacing:-.045em;overflow-wrap:anywhere}
    .location{margin:0;color:#425c77;font-size:17px;font-weight:700;line-height:1.5}.intro{max-width:680px;margin:20px 0 0;color:#536780;line-height:1.7}
    .actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:27px}
    .button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:10px 15px;border:1px solid #bfd6ec;border-radius:11px;background:#fff;color:#205e98;text-decoration:none;font-size:14px;font-weight:780;line-height:1.3}
    .button.primary{border-color:#175fa8;background:#1767b5;color:#fff}.button:hover{border-color:#1767b5;box-shadow:0 4px 16px rgba(24,99,177,.12)}
    .content{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);gap:18px;margin-top:18px}
    .panel{padding:clamp(20px,3vw,30px);border:1px solid #dce5ef;border-radius:20px;background:#fff}
    .panel h2{margin:0 0 16px;font-size:25px;letter-spacing:-.025em}.panel p{margin:0;color:#61748a;line-height:1.65}
    .services{grid-row:span 2}.services ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px;margin:0;padding:0;list-style:none}
    .services li{padding:10px 0;border-bottom:1px solid #edf1f5;font-size:14px;font-weight:680;line-height:1.45;overflow-wrap:anywhere}
    .hours ul{display:grid;gap:8px;margin:0;padding:0;list-style:none}.hours li{font-size:14px;line-height:1.5}
    .review{display:grid;gap:13px;align-content:start;background:#f8fbff}.review strong{font-size:15px}.review p{font-size:13px}
    .notice{margin:18px 0 0;padding:15px 18px;border-left:3px solid #7da8d0;border-radius:4px;background:#eaf2fa;color:#52677c;font-size:13px;line-height:1.65}
    @media(max-width:760px){.site-top-inner{min-height:62px}.brand{font-size:16px}.content{grid-template-columns:1fr}.services{grid-row:auto}.hero:after{right:-210px}.services ul{grid-template-columns:1fr}}
    @media(max-width:400px){.site-top-inner,.shell{width:calc(100% - 28px)}.brand em{display:none}.hero{padding:25px 20px}.actions .button{width:100%}}
  `;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(row.name)} | Auto Repair in ${esc(location)} | Hermes Catalog</title>
<meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}">
<meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:title" content="${esc(row.name)} | Auto Repair in ${esc(location)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(row.name)} | Auto Repair in ${esc(location)}"><meta name="twitter:description" content="${esc(description)}"><script type="application/ld+json">${jsonLd(schema)}</script><style>${css}</style></head>
<body><a class="skip" href="#main-content">Skip to content</a>
<header class="site-top"><div class="site-top-inner"><a class="brand" href="/businesses/"><span class="mark" aria-hidden="true">H</span>Hermes <em>Catalog</em></a><a class="top-link" href="/businesses/">Browse businesses</a></div></header>
<main class="shell" id="main-content"><nav class="crumb" aria-label="Breadcrumb"><a href="/businesses/">Hermes Catalog</a> / ${esc(location)} / ${esc(row.name)}</nav>
<article data-catalog-business-id="${esc(`repair-shop-crm:${String(row.id)}`)}"><header class="hero"><p class="eyebrow">Auto repair · ${esc(location)}</p><span class="status">Profile details awaiting owner review</span>
<h1>${esc(row.name)}</h1><p class="location">${esc(addressText || location)}</p>
<p class="intro">Explore the services and hours listed for this business. Please confirm current details with the shop before visiting or requesting service. This listing does not indicate a Hermes customer relationship.</p>
<div class="actions">${booking}${phone}${maps}${website}<a class="button" href="${esc(contactRequestHref)}">Request contact via Hermes</a><a class="button" href="${claimHref}">Claim or correct this profile</a><a class="button" href="${growthHref}">Discuss online growth</a></div></header>
<div class="content"><section class="panel services" aria-labelledby="services-heading"><p class="eyebrow">What the shop offers</p><h2 id="services-heading">Services</h2>${serviceList}</section>
<section class="panel hours" aria-labelledby="hours-heading"><p class="eyebrow">Plan a visit</p><h2 id="hours-heading">Business hours</h2>${hoursList}</section>
<aside class="panel review" aria-label="Profile status"><strong>About this listing</strong><p>Published in Hermes Catalog from business profile information. The business can request corrections or verify its ownership. Public availability does not establish search engine indexing, rankings, or customer inquiries.</p><a class="button" href="${claimHref}">Request verification</a></aside></div>
<p class="notice">Services, hours and address are subject to business confirmation. No private customer records, appointments or account details appear on this page.</p>
</article></main><script src="/catalog-business-activity.js" defer></script></body></html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
