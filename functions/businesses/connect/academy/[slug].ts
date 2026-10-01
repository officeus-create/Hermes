import { ensureAcademyBusinessProfilesSchema } from "../../../api/_lib/academy-business-profiles.mjs";

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
  await ensureAcademyBusinessProfilesSchema(env.DB);
  const slug = String(params.slug || "").trim().slice(0, 100);
  if (!/^[a-z0-9\u0400-\u04ff-]+$/i.test(slug)) return new Response("Not found", { status: 404 });

  const row = await env.DB.prepare(`
    SELECT id,business_name,slug,academy_type,city,region,country_code,website,phone,catalog_status,updated_at
    FROM hermes_academy_business_profiles
    WHERE slug=? AND catalog_opt_in=1
    LIMIT 1
  `).bind(slug).first();
  if (!row) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });

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
  const requestHref = `/businesses/request/?type=catalog-business-request&business=${encodeURIComponent(String(row.business_name))}&business_id=${encodeURIComponent(`academy-business:${String(row.id)}`)}&profile=${encodeURIComponent(canonical)}&city=${encodeURIComponent(String(row.city || ""))}&state=${encodeURIComponent(String(row.region || ""))}&country=${encodeURIComponent(String(row.country_code || ""))}&source_ref=academy_business_crm`;

  const websiteAction = website ? `<a class="button" href="${esc(website)}" target="_blank" rel="nofollow noopener" data-i18n="website">Відкрити сайт ↗</a>` : "";
  const phoneAction = phoneDial ? `<a class="button" href="tel:${esc(phoneDial)}" data-i18n="call">Подзвонити</a>` : "";

  const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(row.business_name)} | ${esc(labels.uk)} | Hermes Catalog</title>
<meta name="description" content="${esc(row.business_name)} — ${esc(labels.uk)} у Hermes Catalog. Публічний бізнес-профіль, пов’язаний з Hermes Connect Academy CRM.">
<link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow">
<script type="application/ld+json">${jsonLd(schema)}</script>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#172033;background:#f5f7fb}*{box-sizing:border-box}body{margin:0}a{color:inherit}.shell{width:min(1100px,calc(100% - 34px));margin:auto}.top{border-bottom:1px solid #e1e7ef;background:#fff}.top .shell{display:flex;min-height:70px;align-items:center;justify-content:space-between;gap:16px}.brand{font-weight:900;text-decoration:none}.lang{display:flex;gap:4px;padding:3px;border:1px solid #d9e1eb;border-radius:999px}.lang button{border:0;background:transparent;padding:7px 10px;border-radius:999px;font-weight:900;cursor:pointer}.lang button.active{background:#172033;color:#fff}.main{padding:38px 0 76px}.crumb{margin:0 0 22px;color:#64748b;font-size:13px}.hero{padding:clamp(28px,6vw,62px);border:1px solid #dfe6ef;border-radius:28px;background:radial-gradient(circle at 88% 15%,rgba(122,88,180,.15),transparent 26rem),#fff;box-shadow:0 18px 55px rgba(31,48,71,.08)}.eyebrow{color:#6a548f;text-transform:uppercase;letter-spacing:.11em;font-size:11px;font-weight:900}.status{display:inline-flex;margin-top:14px;padding:7px 11px;border-radius:999px;background:#fff3cd;color:#73590d;font-size:12px;font-weight:800}h1{max-width:900px;margin:16px 0 12px;font-size:clamp(42px,7vw,82px);line-height:.98;letter-spacing:-.045em}.lead{max-width:760px;color:#596a7e;font-size:18px;line-height:1.65}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.button{display:inline-flex;min-height:46px;align-items:center;padding:10px 15px;border:1px solid #ccd9e7;border-radius:11px;background:#fff;text-decoration:none;font-weight:800}.button.primary{background:#172033;color:#fff}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:18px}.card{padding:24px;border:1px solid #dfe6ef;border-radius:20px;background:#fff}.card h2{margin:4px 0 12px;font-size:22px}.card p,.card li{color:#607086;line-height:1.65}.card ul{padding-left:19px}.notice{margin-top:18px;padding:16px 18px;border-radius:16px;background:#fff7ed;color:#7c2d12;line-height:1.6;font-size:13px}@media(max-width:780px){.grid{grid-template-columns:1fr}.top .shell{min-height:62px}.hero{padding:28px 22px}}
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
<p class="notice" data-i18n="boundary">Статус Self-submitted означає, що профіль доданий власником через Hermes Connect і ще може очікувати окремої публічної перевірки.</p>
</main>
<script>
const d={uk:{catalog:"Hermes Catalog",location:"Навчальний бізнес",public:"Це публічний бізнес-профіль. Приватні учні, заявки, платежі та CRM-дані тут не показуються.",owner:"Вхід власника в CRM",website:"Відкрити сайт ↗",call:"Подзвонити",request:"Запит через Hermes",education:"Навчальний бізнес",programs:"Програми та курси",cohorts:"Потоки / cohorts",assignments:"Завдання та review",retention:"Retention та наступні програми",crm:"CRM під vertical",crmCopy:"Academy CRM використовує іншу структуру, ніж Repair Shop CRM: ліди, консультації, учасники, навчання, marketing KPI та HR.",discovery:"Публічна видимість",discoveryCopy:"Власник може підтримувати публічні бізнес-дані в Catalog, не публікуючи приватну операційну інформацію.",boundary:"Статус Self-submitted означає, що профіль доданий власником через Hermes Connect і ще може очікувати окремої публічної перевірки."},en:{catalog:"Hermes Catalog",location:"Education business",public:"This is a public business profile. Private learners, leads, payments, and CRM records are not shown here.",owner:"Owner CRM login",website:"Open website ↗",call:"Call",request:"Request via Hermes",education:"Education business",programs:"Programs and courses",cohorts:"Cohorts",assignments:"Assignments and review",retention:"Retention and next programs",crm:"Vertical-specific CRM",crmCopy:"Academy CRM uses a different structure from Repair Shop CRM: leads, consultations, learners, delivery, marketing KPI, and HR.",discovery:"Public discovery",discoveryCopy:"The owner can maintain public business facts in Catalog without publishing private operating data.",boundary:"Self-submitted means the profile was added by the owner through Hermes Connect and may still await separate public verification."}};
let lang="uk";try{const s=localStorage.getItem("hermes-connect-language");if(s==="en")lang="en"}catch{};function apply(next){lang=next;document.documentElement.lang=next;try{localStorage.setItem("hermes-connect-language",next)}catch{};document.querySelectorAll("[data-i18n]").forEach(n=>{const v=d[next][n.dataset.i18n];if(v)n.textContent=v});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===next))}document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>apply(b.dataset.lang==="en"?"en":"uk")));apply(lang);
</script></body></html>`;

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
