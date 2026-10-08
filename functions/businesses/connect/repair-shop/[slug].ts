import { repairCatalogPublication, REPAIR_CATALOG_CACHE_CONTROL } from "../../../api/_lib/repair-catalog-publication.mjs";
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
const auditIcons: Record<string,string> = {
  website:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.2 2.2 3.3 4.9 3.3 8S14.2 17.8 12 20c-2.2-2.2-3.3-4.9-3.3-8S9.8 6.2 12 4Z"/></svg>',
  google:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12.2h-7.7v3h4.4c-.6 2.1-2.4 3.4-4.7 3.4A6.6 6.6 0 1 1 12 5.4c1.7 0 3 .6 4 1.6l2.1-2.1A8.9 8.9 0 0 0 12 2.5 9.5 9.5 0 1 0 21.2 12c0-.6-.1-1.1-.2-1.6Z"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.4" cy="6.8" r="1"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.8 20v-7h2.5l.4-3h-2.9V8.1c0-.9.3-1.5 1.5-1.5H17V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1v2H8v3h2.6v7Z"/></svg>',
  threads:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.2c4.7 0 7.4 2.9 7.4 7.3 0 4.7-2.8 8.3-7.3 8.3-3.8 0-6.6-2.1-7.3-5.4"/><path d="M8.6 9.2c.9-1.3 2.1-2 3.7-2 2.4 0 4 1.3 4.2 3.6.3 3.3-1.6 5.5-4.3 5.5-2 0-3.3-1-3.3-2.5 0-1.7 1.5-2.8 3.7-2.8 2.7 0 4.7 1.1 6 3.2"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v10.1a4 4 0 1 1-3.2-3.9"/><path d="M14 4c.6 2.5 2.1 3.9 4.5 4.2"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.2" width="18" height="11.6" rx="3"/><path d="m10 9 5 3-5 3Z"/></svg>',
  telegram:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 11.5 16.8-6.4-3.1 14-5.1-4-2.7 2.4.5-4.2 7.4-5.7-9.1 4.8Z"/></svg>',
};

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
  if (!env.DB) return new Response("Service unavailable", { status: 503, headers: { "Cache-Control": REPAIR_CATALOG_CACHE_CONTROL } });
  await ensureRepairShopProfileSchema(env.DB);
  const slug = String(params.slug || "");
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 80) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow", "Cache-Control": REPAIR_CATALOG_CACHE_CONTROL } });

  const row = await env.DB.prepare(`
    SELECT id,owner_specialist_id,name,slug,catalog_opt_in,address_line1,city,state,region,country_code,postal_code,phone,website,
           instagram_url,facebook_url,threads_url,catalog_published_at,seo_geo_started_at,next_seo_report_at,updated_at
    FROM repair_shops
    WHERE slug=? AND catalog_opt_in=1
    LIMIT 1
  `).bind(slug).first();
  const publication = repairCatalogPublication(row);
  if (!publication.eligible) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow", "Cache-Control": REPAIR_CATALOG_CACHE_CONTROL } });

  const services = await servicesForShop(env.DB, String(row.owner_specialist_id || ""), String(row.id || ""));
  const hours = await hoursForShop(env.DB, String(row.id || ""));
  const canonical = `https://hermeslogisticsus.com${publication.path}`;
  const catalogBusinessId = `repair-shop-crm:${String(row.id)}`;
  const location = [row.city, row.region || row.state].filter(Boolean).join(", ");
  const addressText = [row.address_line1, row.city, row.region || row.state, row.postal_code].filter(Boolean).join(", ");
  const phoneText = String(row.phone || "").trim();
  const phoneDial = phoneText.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const websiteUrl = safeHttpUrl(row.website);
  const instagramUrl = safeHttpUrl(row.instagram_url);
  const facebookUrl = safeHttpUrl(row.facebook_url);
  const threadsUrl = safeHttpUrl(row.threads_url);
  const socialUrls = [websiteUrl, instagramUrl, facebookUrl, threadsUrl].filter(Boolean);
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
    ...(mapsHref ? { hasMap: mapsHref } : {}),
    ...(socialUrls.length ? { sameAs: socialUrls } : {}),
  };
  const serviceList = services.length
    ? `<ul>${services.map((service: string) => `<li>${esc(service)}</li>`).join("")}</ul>`
    : '<p class="muted">Services will appear here after the business saves them in Hermes Connect.</p>';
  const hoursList = hours.length
    ? `<ul>${hours.map((item: any) => `<li>${esc(dayNames[item.day])}: ${item.isOpen && item.opens && item.closes ? `${esc(item.opens)}–${esc(item.closes)}` : "Closed"}</li>`).join("")}</ul>`
    : '<p class="muted">Hours will appear here after the business saves them in Hermes Connect.</p>';
  const booking = bookingReady
    ? `<a class="button primary" data-catalog-event="booking_start" href="${esc(bookingHref)}">Book an appointment</a>`
    : "";
  const phone = phoneDial
    ? `<a class="button" data-catalog-event="call_click" href="tel:${esc(phoneDial)}">Call ${esc(phoneText)}</a>`
    : "";
  const maps = mapsHref
    ? `<a class="button" data-catalog-event="maps_click" href="${esc(mapsHref)}" rel="noopener" target="_blank">Directions on Google Maps <span aria-hidden="true">↗</span></a>`
    : "";
  const website = websiteUrl
    ? `<a class="button" data-catalog-event="website_click" href="${esc(websiteUrl)}" rel="nofollow noopener" target="_blank">Open listed website <span aria-hidden="true">↗</span></a>`
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
  const growthHref = `/businesses/request/?type=marketing-package&business=${encodeURIComponent(String(row.name))}&profile=${encodeURIComponent(canonical)}`;
  const auditChannels = [
    { key:"website", label:"Website", url:websiteUrl, listed:Boolean(websiteUrl), state:websiteUrl ? "Public source listed" : "Owner confirmation required" },
    { key:"google", label:"Google", url:mapsHref, listed:false, state:"Owner confirmation required" },
    { key:"instagram", label:"Instagram", url:instagramUrl, listed:Boolean(instagramUrl), state:instagramUrl ? "Internal analytics required" : "Owner confirmation required" },
    { key:"facebook", label:"Facebook", url:facebookUrl, listed:Boolean(facebookUrl), state:facebookUrl ? "Internal analytics required" : "Owner confirmation required" },
    { key:"threads", label:"Threads", url:threadsUrl, listed:Boolean(threadsUrl), state:threadsUrl ? "Internal analytics required" : "Owner confirmation required" },
    { key:"tiktok", label:"TikTok", url:"", listed:false, state:"Owner confirmation required" },
    { key:"youtube", label:"YouTube", url:"", listed:false, state:"Owner confirmation required" },
    { key:"telegram", label:"Telegram", url:"", listed:false, state:"Owner confirmation required" },
  ];
  const auditNav = auditChannels.map((item)=>`<a href="#audit-${item.key}"><span class="audit-icon">${auditIcons[item.key]}</span><b>${item.label}</b></a>`).join("");
  const auditCards = auditChannels.map((item)=>{
    const isGoogle=item.key==="google";
    const isWebsite=item.key==="website";
    const headline=isGoogle
      ? "Canonical Google Business Profile and owner access are not confirmed yet."
      : item.listed
        ? (isWebsite ? "A public website is listed; performance and conversion are not inferred from its existence." : "A public social URL is listed; internal performance cannot be validated from the public profile.")
        : `Official ${item.label} presence is not confirmed in this public Catalog record.`;
    const finding=isGoogle
      ? (mapsHref ? "Hermes can generate a Maps search from the listed address, but that is not proof of a claimed or canonical Google Business Profile." : "The current public record does not contain enough location evidence to identify a canonical Google Business Profile.")
      : item.listed
        ? (isWebsite ? "Public review can inspect structure, facts, CTA and discovery surfaces. Analytics and CRM are still required for conversion conclusions." : "Public visibility is not Reach, retention, audience quality, paid/organic split, CAC or conversion evidence.")
        : "This does not mean the channel is absent. A missing verified URL is treated as unknown, not zero.";
    const next=isGoogle
      ? "Verify the canonical Google Business Profile / Maps URL and owner access, then connect local-search actions to the website and CRM source."
      : item.listed
        ? "Connect authorized analytics, establish the account baseline, identify repeatable organic winners and only then decide whether a controlled paid-learning test is justified."
        : `Verify the official ${item.label} URL with the owner or a reliable public source before making a tactical recommendation.`;
    const source=item.url ? `<a class="audit-source" href="${esc(item.url)}" target="_blank" rel="nofollow noopener">Public source ↗</a>` : "";
    return `<details id="audit-${item.key}"><summary><span class="audit-icon">${auditIcons[item.key]}</span><span><b>${item.label}</b><small>${item.state}</small></span><i aria-hidden="true">+</i></summary><div class="audit-body"><h3>${headline}</h3><p>${finding}</p><p><strong>Next step:</strong> ${next}</p>${source}</div></details>`;
  }).join("");

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
    .digital-audit{margin-top:18px;padding:clamp(20px,3vw,30px);border:1px solid #dce5ef;border-radius:20px;background:#fff}.audit-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.audit-head h2{margin:6px 0 8px;font-size:clamp(26px,3.4vw,40px);letter-spacing:-.035em}.audit-head p{max-width:760px;margin:0;color:#61748a;line-height:1.65}.audit-gate{white-space:nowrap;padding:7px 10px;border-radius:999px;background:#fff2d2;color:#775508;font-size:10px;font-weight:850}.audit-sequence,.audit-nav,.audit-actions{display:flex;gap:8px;flex-wrap:wrap}.audit-sequence{margin-top:16px}.audit-sequence span{padding:7px 9px;border-radius:9px;background:#eef5f2;color:#355b50;font-size:10px;font-weight:800}.audit-nav{margin-top:12px}.audit-nav a{display:flex;align-items:center;gap:7px;min-height:40px;padding:0 11px;border:1px solid #d9e1dd;border-radius:999px;background:#fbfcfb;color:#24322e;text-decoration:none;font-size:11px}.audit-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#17211e;color:#fff}.audit-icon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.audit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}.audit-grid details{scroll-margin-top:80px;border:1px solid #dfe5e2;border-radius:14px;background:#fbfcfb;overflow:hidden}.audit-grid summary{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:14px;cursor:pointer;list-style:none}.audit-grid summary::-webkit-details-marker{display:none}.audit-grid summary span:nth-child(2){display:grid;gap:2px}.audit-grid small{color:#7a8681;font-size:9px;text-transform:uppercase;font-weight:850}.audit-grid i{font-style:normal}.audit-body{padding:0 14px 15px;border-top:1px solid #e6ebe8}.audit-body h3{margin:14px 0 7px;font-size:15px}.audit-body p{margin:8px 0;color:#61748a;font-size:12px;line-height:1.6}.audit-source{display:inline-flex;margin-top:4px;color:#235f9b;font-size:11px;font-weight:800;text-decoration:none}.audit-actions{margin-top:16px}.audit-actions a{display:inline-flex;align-items:center;min-height:42px;padding:0 12px;border:1px solid #cdddec;border-radius:10px;background:#fff;color:#1767ad;text-decoration:none;font-size:11px;font-weight:850}.audit-actions .primary{background:#172033;color:#fff;border-color:#172033}.notice{margin:18px 0 0;padding:15px 18px;border-left:3px solid #7da8d0;border-radius:4px;background:#eaf2fa;color:#52677c;font-size:13px;line-height:1.65}
    @media(max-width:760px){.site-top-inner{min-height:62px}.brand{font-size:16px}.content,.audit-grid{grid-template-columns:1fr}.services{grid-row:auto}.hero:after{right:-210px}.services ul{grid-template-columns:1fr}.audit-head{display:grid}.audit-gate{justify-self:start}}
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
<article><header class="hero"><p class="eyebrow">Auto repair · ${esc(location)}</p><span class="status">Profile details awaiting owner review</span>
<h1>${esc(row.name)}</h1><p class="location">${esc(addressText || location)}</p>
<p class="intro">Explore the services and hours listed for this business. Please confirm current details with the shop before visiting or requesting service. This listing does not indicate a Hermes customer relationship.</p>
<div class="actions">${booking}${phone}${maps}${website}<a class="button" data-catalog-event="request_start" href="${esc(contactRequestHref)}">Request contact via Hermes</a><a class="button" data-catalog-event="claim_start" href="${claimHref}">Claim or correct this profile</a><a class="button" data-catalog-event="growth_start" href="${growthHref}">Discuss online growth</a></div></header>
<div class="content"><section class="panel services" aria-labelledby="services-heading"><p class="eyebrow">What the shop offers</p><h2 id="services-heading">Services</h2>${serviceList}</section>
<section class="panel hours" aria-labelledby="hours-heading"><p class="eyebrow">Plan a visit</p><h2 id="hours-heading">Business hours</h2>${hoursList}</section>
<aside class="panel review" aria-label="Profile status"><strong>About this listing</strong><p>Published in Hermes Catalog from business profile information. The business can request corrections or verify its ownership. Public availability does not establish search engine indexing, rankings, or customer inquiries.</p><a class="button" data-catalog-event="claim_start" href="${claimHref}">Request verification</a></aside></div>
<section class="digital-audit" id="digital-audit"><div class="audit-head"><div><p class="eyebrow">HERMES DIGITAL AUDIT · OWNER-SUBMITTED PUBLIC PROFILE</p><h2>Digital health: what is verified and what needs data</h2><p>A public profile can reveal identity and channel presence, but it cannot validate Reach, retention, audience quality, CAC, conversion or a sales funnel without authorized analytics and CRM evidence.</p></div><span class="audit-gate">Audit ≠ Funnel</span></div>
<div class="audit-sequence"><span>1 · Public + internal audit</span><span>2 · Organic programming + stable baseline</span><span>3 · Controlled paid learning on organic winners</span><span>4 · Offer + funnel only after signal gate</span><span>5 · CRM attribution → verified outcome</span></div>
<nav class="audit-nav" aria-label="Digital audit channels">${auditNav}</nav><div class="audit-grid">${auditCards}</div>
<div class="audit-actions"><a href="/businesses/marketing-growth-audit-example/">Hermes method: organic → paid learning → offer</a><a class="primary" data-catalog-event="growth_start" href="${growthHref}">Request a full audit</a></div></section>
<p class="notice">Services, hours and address are subject to business confirmation. No private customer records, appointments or account details appear on this page.</p>
</article></main><script src="/catalog-business-telemetry.js" data-catalog-business-id="${esc(catalogBusinessId)}" defer></script></body></html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": REPAIR_CATALOG_CACHE_CONTROL,
    },
  });
}
