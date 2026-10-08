import { ensureAcademyBusinessProfilesSchema } from "../../../api/_lib/academy-business-profiles.mjs";
import { ensureHermesCompanyProfilesSchema } from "../../../api/_lib/hermes-company-profiles.mjs";
import { resolveCuratedCatalogProjection } from "../../../api/_lib/catalog-public-projection.mjs";

type Env = { DB?: any };

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] || char));
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\u003c");
const safeHttpUrl = (value: unknown) => {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
};

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

const typeLabels: Record<string, { uk: string; en: string }> = {
  business_academy: { uk: "Бізнес-академія", en: "Business academy" },
  online_school: { uk: "Онлайн-школа", en: "Online school" },
  courses: { uk: "Курси", en: "Courses" },
  business_club: { uk: "Бізнес-клуб", en: "Business club" },
  coaching: { uk: "Коучинг / менторство", en: "Coaching / mentoring" },
  corporate_academy: { uk: "Корпоративна академія", en: "Corporate academy" },
};

export async function onRequestGet({ env, params }: { env: Env; params: { slug?: string } }) {
  if (!env.DB) return new Response("Service unavailable", { status: 503 });
  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureAcademyBusinessProfilesSchema(env.DB);
  const slug = String(params.slug || "").trim().slice(0, 100);
  if (!/^[a-z0-9\u0400-\u04ff-]+$/i.test(slug)) return new Response("Not found", { status: 404 });

  const row = await env.DB.prepare(`
    SELECT
      c.id AS company_id,
      c.company_name AS business_name,
      c.slug,
      a.academy_type,
      c.city,
      c.state AS region,
      c.country_code,
      c.website,
      c.phone,
      c.catalog_status,
      c.updated_at
    FROM hermes_company_profiles c
    JOIN hermes_academy_business_profiles a ON a.company_id=c.id
    WHERE c.slug=? AND c.catalog_opt_in=1
      AND c.catalog_status IN ('self_submitted','verified_public')
    LIMIT 1
  `).bind(slug).first();
  if (!row) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });

  const curatedPath = resolveCuratedCatalogProjection({
    vertical: "academy_business",
    website: row.website,
  });
  if (curatedPath) {
    return Response.redirect(new URL(curatedPath, "https://hermeslogisticsus.com").toString(), 308);
  }

  const canonical = `https://hermeslogisticsus.com/businesses/connect/academy/${encodeURIComponent(String(row.slug))}/`;
  const location = [row.city, row.region, row.country_code].filter(Boolean).join(", ");
  const website = safeHttpUrl(row.website);
  const phone = String(row.phone || "").trim();
  const phoneDial = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const labels = typeLabels[String(row.academy_type)] || { uk: "Академія / курси", en: "Academy / Courses" };
  const verification = row.catalog_status === "verified_public" ? "Verified" : "Self-submitted · verification pending";
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": canonical + "#business",
    name: row.business_name,
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: row.city,
      addressRegion: row.region || undefined,
      addressCountry: row.country_code || undefined,
    },
    ...(phone ? { telephone: phone } : {}),
    ...(website ? { sameAs: [website] } : {}),
    knowsAbout: ["Courses", "Education", "Learning programs", "Business training"],
  };
  const requestHref = `/businesses/request/?type=catalog-business-request&business=${encodeURIComponent(String(row.business_name))}&business_id=${encodeURIComponent(String(row.company_id))}&profile=${encodeURIComponent(canonical)}&city=${encodeURIComponent(String(row.city || ""))}&state=${encodeURIComponent(String(row.region || ""))}&country=${encodeURIComponent(String(row.country_code || ""))}&source_ref=academy_business_crm`;
  const growthHref = `/businesses/request/?type=marketing-package&business=${encodeURIComponent(String(row.business_name))}&business_id=${encodeURIComponent(String(row.company_id))}&profile=${encodeURIComponent(canonical)}&city=${encodeURIComponent(String(row.city || ""))}&country=${encodeURIComponent(String(row.country_code || ""))}&source_ref=academy_business_crm`;
  const auditPlatforms = ["website","google","instagram","facebook","threads","tiktok","youtube","telegram"] as const;
  const auditLabels: Record<(typeof auditPlatforms)[number],string> = {website:"Website",google:"Google",instagram:"Instagram",facebook:"Facebook",threads:"Threads",tiktok:"TikTok",youtube:"YouTube",telegram:"Telegram"};
  const auditNav = auditPlatforms.map((key)=>`<a href="#audit-${key}"><span class="audit-icon">${auditIcons[key]}</span><b>${auditLabels[key]}</b></a>`).join("");
  const auditCards = auditPlatforms.map((key)=>{
    const hasWebsite = key==="website" && Boolean(website);
    const stateKey = hasWebsite ? "auditSourceListed" : "auditOwnerConfirm";
    const stateUk = hasWebsite ? "Публічний source вказано" : "Потрібне підтвердження";
    const headlineKey = hasWebsite ? "auditWebsiteHeadline" : "auditUnknownHeadline";
    const bodyKey = hasWebsite ? "auditWebsiteBody" : "auditUnknownBody";
    const nextKey = hasWebsite ? "auditWebsiteNext" : "auditUnknownNext";
    const source = hasWebsite ? `<a class="audit-source" href="${esc(website)}" target="_blank" rel="nofollow noopener">Public source ↗</a>` : "";
    return `<details id="audit-${key}"><summary><span class="audit-icon">${auditIcons[key]}</span><span><b>${auditLabels[key]}</b><small data-i18n="${stateKey}">${stateUk}</small></span><i aria-hidden="true">+</i></summary><div class="audit-body"><h3 data-i18n="${headlineKey}">${hasWebsite?"Публічний сайт вказано; його наявність не доводить ефективність або конверсію.":"Офіційний канал не підтверджений у поточному public profile."}</h3><p data-i18n="${bodyKey}">${hasWebsite?"Публічний огляд може перевірити структуру, факти, CTA та search surface. Для performance-висновків потрібні analytics і CRM.":"Це не означає, що каналу немає. Непідтверджений URL — це unknown, а не zero."}</p><p><strong data-i18n="auditNextLabel">Наступний крок:</strong> <span data-i18n="${nextKey}">${hasWebsite?"Підключити дозволену аналітику, зафіксувати baseline і тільки тоді давати tactical recommendation.":"Підтвердити офіційний URL із власником або надійним public source до будь-якої tactical recommendation."}</span></p>${source}</div></details>`;
  }).join("");

  const websiteAction = website ? `<a class="button" href="${esc(website)}" target="_blank" rel="nofollow noopener" data-i18n="website">Відкрити сайт ↗</a>` : "";
  const phoneAction = phoneDial ? `<a class="button" href="tel:${esc(phoneDial)}" data-i18n="call">Подзвонити</a>` : "";

  const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(row.business_name)} | ${esc(labels.uk)} | Hermes Catalog</title>
<meta name="description" content="${esc(row.business_name)} — ${esc(labels.uk)} у Hermes Catalog. Публічний бізнес-профіль, пов’язаний з Hermes Connect Academy CRM.">
<link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow">
<script type="application/ld+json">${jsonLd(schema)}</script>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#172033;background:#f5f7fb}*{box-sizing:border-box}body{margin:0}a{color:inherit}.shell{width:min(1100px,calc(100% - 34px));margin:auto}.top{border-bottom:1px solid #e1e7ef;background:#fff}.top .shell{display:flex;min-height:70px;align-items:center;justify-content:space-between;gap:16px}.brand{font-weight:900;text-decoration:none}.lang{display:flex;gap:4px;padding:3px;border:1px solid #d9e1eb;border-radius:999px}.lang button{border:0;background:transparent;padding:7px 10px;border-radius:999px;font-weight:900;cursor:pointer}.lang button.active{background:#172033;color:#fff}.main{padding:38px 0 76px}.crumb{margin:0 0 22px;color:#64748b;font-size:13px}.hero{padding:clamp(28px,6vw,62px);border:1px solid #dfe6ef;border-radius:28px;background:radial-gradient(circle at 88% 15%,rgba(122,88,180,.15),transparent 26rem),#fff;box-shadow:0 18px 55px rgba(31,48,71,.08)}.eyebrow{color:#6a548f;text-transform:uppercase;letter-spacing:.11em;font-size:11px;font-weight:900}.status{display:inline-flex;margin-top:14px;padding:7px 11px;border-radius:999px;background:#fff3cd;color:#73590d;font-size:12px;font-weight:800}h1{max-width:900px;margin:16px 0 12px;font-size:clamp(42px,7vw,82px);line-height:.98;letter-spacing:-.045em}.lead{max-width:760px;color:#596a7e;font-size:18px;line-height:1.65}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.button{display:inline-flex;min-height:46px;align-items:center;padding:10px 15px;border:1px solid #ccd9e7;border-radius:11px;background:#fff;text-decoration:none;font-weight:800}.button.primary{background:#172033;color:#fff}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:18px}.card{padding:24px;border:1px solid #dfe6ef;border-radius:20px;background:#fff}.card h2{margin:4px 0 12px;font-size:22px}.card p,.card li{color:#607086;line-height:1.65}.card ul{padding-left:19px}.digital-audit{margin-top:18px;padding:clamp(22px,4vw,34px);border:1px solid #dfe6ef;border-radius:20px;background:#fff}.audit-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.audit-head h2{margin:5px 0 8px;font-size:clamp(28px,4vw,42px);letter-spacing:-.035em}.audit-head p{max-width:760px;margin:0;color:#607086;line-height:1.65}.audit-gate{white-space:nowrap;padding:7px 10px;border-radius:999px;background:#fff2d2;color:#775508;font-size:10px;font-weight:900}.audit-sequence,.audit-nav,.audit-actions{display:flex;gap:8px;flex-wrap:wrap}.audit-sequence{margin-top:16px}.audit-sequence span{padding:7px 9px;border-radius:9px;background:#eef5f2;color:#355b50;font-size:10px;font-weight:800}.audit-nav{margin-top:12px}.audit-nav a{display:flex;align-items:center;gap:7px;min-height:40px;padding:0 11px;border:1px solid #d9e1dd;border-radius:999px;background:#fbfcfb;color:#24322e;text-decoration:none;font-size:11px}.audit-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#172033;color:#fff}.audit-icon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.audit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}.audit-grid details{border:1px solid #dfe5e2;border-radius:14px;background:#fbfcfb;overflow:hidden}.audit-grid summary{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:14px;cursor:pointer;list-style:none}.audit-grid summary::-webkit-details-marker{display:none}.audit-grid summary span:nth-child(2){display:grid;gap:2px}.audit-grid small{color:#7a8681;font-size:9px;text-transform:uppercase;font-weight:850}.audit-grid i{font-style:normal}.audit-body{padding:0 14px 15px;border-top:1px solid #e6ebe8}.audit-body h3{margin:14px 0 7px;font-size:15px}.audit-body p{margin:8px 0;color:#607086;font-size:12px;line-height:1.6}.audit-source{color:#235f9b;font-size:11px;font-weight:800;text-decoration:none}.audit-actions{margin-top:16px}.audit-actions a{display:inline-flex;align-items:center;min-height:42px;padding:0 12px;border:1px solid #ccd9e7;border-radius:10px;background:#fff;color:#235f9b;text-decoration:none;font-size:11px;font-weight:850}.audit-actions .primary{background:#172033;color:#fff;border-color:#172033}.notice{margin-top:18px;padding:16px 18px;border-radius:16px;background:#fff7ed;color:#7c2d12;line-height:1.6;font-size:13px}@media(max-width:780px){.grid,.audit-grid{grid-template-columns:1fr}.top .shell{min-height:62px}.hero{padding:28px 22px}.audit-head{display:grid}.audit-gate{justify-self:start}}
</style></head><body>
<header class="top"><div class="shell"><a class="brand" href="/businesses/">Hermes Catalog</a><div class="lang" aria-label="Language"><button type="button" class="active" data-lang="uk">UA</button><button type="button" data-lang="en">EN</button></div></div></header>
<main class="shell main"><nav class="crumb"><a href="/businesses/" data-i18n="catalog">Hermes Catalog</a> / ${esc(row.business_name)}</nav>
<section class="hero"><p class="eyebrow">${esc(labels.uk)} · Hermes Connect Academy CRM</p><span class="status">${esc(verification)}</span><h1>${esc(row.business_name)}</h1><p class="lead"><span data-i18n="location">Навчальний бізнес</span> · ${esc(location)}. <span data-i18n="public">Це публічний бізнес-профіль. Приватні учні, заявки, платежі та CRM-дані тут не показуються.</span></p>
<div class="actions"><a class="button primary" href="/services/hermes-connect/academy/business/auth/?mode=login" data-i18n="owner">Вхід власника в CRM</a>${websiteAction}${phoneAction}<a class="button" href="${esc(requestHref)}" data-i18n="request">Запит через Hermes</a></div></section>
<div class="grid">
<article class="card"><p class="eyebrow">ACADEMY</p><h2 data-i18n="education">Навчальний бізнес</h2><ul><li data-i18n="programs">Програми та курси</li><li data-i18n="cohorts">Потоки / cohorts</li><li data-i18n="assignments">Завдання та review</li><li data-i18n="retention">Retention та наступні програми</li></ul></article>
<article class="card"><p class="eyebrow">HERMES CONNECT</p><h2 data-i18n="crm">CRM під vertical</h2><p data-i18n="crmCopy">Academy CRM використовує іншу структуру, ніж Repair Shop CRM: ліди, консультації, учасники, навчання, marketing KPI та HR.</p></article>
<article class="card"><p class="eyebrow">CATALOG</p><h2 data-i18n="discovery">Публічна видимість</h2><p data-i18n="discoveryCopy">Власник може підтримувати публічні бізнес-дані в Catalog, не публікуючи приватну операційну інформацію.</p></article>
</div>
<section class="digital-audit" id="digital-audit"><div class="audit-head"><div><p class="eyebrow">HERMES DIGITAL AUDIT</p><h2 data-i18n="auditTitle">Digital health: що підтверджено і яких даних бракує</h2><p data-i18n="auditLead">Публічний профіль може показати identity та channel presence, але не може підтвердити Reach, retention, CAC, conversion або робочу sales funnel без дозволеної аналітики та CRM evidence.</p></div><span class="audit-gate">Audit ≠ Funnel</span></div>
<div class="audit-sequence"><span>1 · Public + internal audit</span><span>2 · Organic programming + stable baseline</span><span>3 · Controlled paid learning</span><span>4 · Offer + funnel after signal gate</span><span>5 · CRM attribution → outcome</span></div>
<nav class="audit-nav" aria-label="Digital audit channels">${auditNav}</nav><div class="audit-grid">${auditCards}</div>
<div class="audit-actions"><a href="/businesses/marketing-growth-audit-example/" data-i18n="auditMethod">Метод Hermes: organic → paid learning → offer</a><a class="primary" href="${esc(growthHref)}" data-i18n="auditRequest">Запросити повний аудит</a></div></section>
<p class="notice" data-i18n="boundary">Статус Self-submitted означає, що профіль доданий власником через Hermes Connect і ще може очікувати окремої публічної перевірки.</p>
</main>
<script>
const d={uk:{catalog:"Hermes Catalog",location:"Навчальний бізнес",public:"Це публічний бізнес-профіль. Приватні учні, заявки, платежі та CRM-дані тут не показуються.",owner:"Вхід власника в CRM",website:"Відкрити сайт ↗",call:"Подзвонити",request:"Запит через Hermes",education:"Навчальний бізнес",programs:"Програми та курси",cohorts:"Потоки / cohorts",assignments:"Завдання та review",retention:"Retention та наступні програми",crm:"CRM під vertical",crmCopy:"Academy CRM використовує іншу структуру, ніж Repair Shop CRM: ліди, консультації, учасники, навчання, marketing KPI та HR.",discovery:"Публічна видимість",discoveryCopy:"Власник може підтримувати публічні бізнес-дані в Catalog, не публікуючи приватну операційну інформацію.",auditTitle:"Digital health: що підтверджено і яких даних бракує",auditLead:"Публічний профіль може показати identity та channel presence, але не може підтвердити Reach, retention, CAC, conversion або робочу sales funnel без дозволеної аналітики та CRM evidence.",auditSourceListed:"Публічний source вказано",auditOwnerConfirm:"Потрібне підтвердження",auditWebsiteHeadline:"Публічний сайт вказано; його наявність не доводить ефективність або конверсію.",auditUnknownHeadline:"Офіційний канал не підтверджений у поточному public profile.",auditWebsiteBody:"Публічний огляд може перевірити структуру, факти, CTA та search surface. Для performance-висновків потрібні analytics і CRM.",auditUnknownBody:"Це не означає, що каналу немає. Непідтверджений URL — це unknown, а не zero.",auditNextLabel:"Наступний крок:",auditWebsiteNext:"Підключити дозволену аналітику, зафіксувати baseline і тільки тоді давати tactical recommendation.",auditUnknownNext:"Підтвердити офіційний URL із власником або надійним public source до будь-якої tactical recommendation.",auditMethod:"Метод Hermes: organic → paid learning → offer",auditRequest:"Запросити повний аудит",boundary:"Статус Self-submitted означає, що профіль доданий власником через Hermes Connect і ще може очікувати окремої публічної перевірки."},en:{catalog:"Hermes Catalog",location:"Education business",public:"This is a public business profile. Private learners, leads, payments, and CRM records are not shown here.",owner:"Owner CRM login",website:"Open website ↗",call:"Call",request:"Request via Hermes",education:"Education business",programs:"Programs and courses",cohorts:"Cohorts",assignments:"Assignments and review",retention:"Retention and next programs",crm:"Vertical-specific CRM",crmCopy:"Academy CRM uses a different structure from Repair Shop CRM: leads, consultations, learners, delivery, marketing KPI, and HR.",discovery:"Public discovery",discoveryCopy:"The owner can maintain public business facts in Catalog without publishing private operating data.",auditTitle:"Digital health: what is verified and what data is missing",auditLead:"A public profile can show identity and channel presence, but it cannot validate Reach, retention, CAC, conversion, or a working sales funnel without authorized analytics and CRM evidence.",auditSourceListed:"Public source listed",auditOwnerConfirm:"Owner confirmation required",auditWebsiteHeadline:"A public website is listed; its existence does not prove performance or conversion.",auditUnknownHeadline:"The official channel is not confirmed in the current public profile.",auditWebsiteBody:"Public review can inspect structure, facts, CTA, and search surfaces. Analytics and CRM are still required for performance conclusions.",auditUnknownBody:"This does not mean the channel is absent. An unverified URL is unknown, not zero.",auditNextLabel:"Next step:",auditWebsiteNext:"Connect permitted analytics, establish a baseline, and only then make a tactical recommendation.",auditUnknownNext:"Verify the official URL with the owner or a reliable public source before making a tactical recommendation.",auditMethod:"Hermes method: organic → paid learning → offer",auditRequest:"Request a full audit",boundary:"Self-submitted means the profile was added by the owner through Hermes Connect and may still await separate public verification."}};
let lang="uk";try{const s=localStorage.getItem("hermes-connect-language");if(s==="en")lang="en"}catch{};function apply(next){lang=next;document.documentElement.lang=next;try{localStorage.setItem("hermes-connect-language",next)}catch{};document.querySelectorAll("[data-i18n]").forEach(n=>{const v=d[next][n.dataset.i18n];if(v)n.textContent=v});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===next))}document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>apply(b.dataset.lang==="en"?"en":"uk")));apply(lang);
</script><script src="/catalog-business-telemetry.js" data-catalog-business-id="${esc(String(row.company_id))}" defer></script>
<script src="/catalog-traffic-stats.js" data-catalog-traffic-loader defer></script></body></html>`;

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
