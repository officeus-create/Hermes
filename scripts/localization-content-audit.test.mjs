import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const pages = [
  {
    route: "/ua/", path: "ua/index.html", lang: "uk",
    requiredLabels: ["Технології", "Маркетинг", "Академія", "Логістика"],
    requiredCtas: ["Обрати напрям", "Написати команді", "Надіслати опис електронною поштою"],
  },
  {
    route: "/ru/", path: "ru/index.html", lang: "ru",
    requiredLabels: ["Технологии", "Маркетинг", "Академия", "Логистика"],
    requiredCtas: ["Выбрать направление", "Написать команде", "Отправить описание по электронной почте"],
    requiredHrefs: ["/services/hermes-connect/repair-shops/?lang=ru", "/ru/privacy/"],
  },
  {
    route: "/es/", path: "es/index.html", lang: "es",
    requiredLabels: ["Tecnología", "Marketing", "Academia", "Logística"],
    requiredCtas: ["Elegir un área", "Escribir al equipo", "Enviar la descripción por email"],
  },
  {
    route: "/it/", path: "it/index.html", lang: "it",
    requiredLabels: ["Tecnologia", "Marketing", "Accademia", "Logistica"],
    requiredCtas: ["Scegli un'area", "Scrivi al team", "Invia la descrizione via email"],
  },
  {
    route: "/fr/", path: "fr/index.html", lang: "fr",
    requiredLabels: ["Technologie", "Marketing", "Académie", "Logistique"],
    requiredCtas: ["Choisir un pôle", "Écrire à l'équipe", "Envoyer la description par email"],
  },
  {
    route: "/ru/business-growth/", path: "ru/business-growth/index.html", lang: "ru",
    requiredLabels: ["Логистика", "Маркетинг", "Академия", "IT-разработка"],
    requiredCtas: ["Оставить заявку"],
    requiredHrefs: ["/services/hermes-connect/repair-shops/?lang=ru", "/ru/privacy/"],
  },
  ...["website", "seo", "advertising", "social-media", "ai-automation"].map((slug) => ({
    route: `/ru/business-growth/${slug}/`,
    path: `ru/business-growth/${slug}/index.html`,
    lang: "ru",
    requiredLabels: ["Логистика", "Маркетинг", "Академия", "IT-разработка"],
    requiredCtas: [],
    requiredHrefs: ["/services/hermes-connect/repair-shops/?lang=ru", "/ru/privacy/"],
  })),
  {
    route: "/ru/privacy/", path: "ru/privacy/index.html", lang: "ru",
    requiredLabels: ["Политика конфиденциальности", "Конфиденциальность", "Главная"],
    requiredCtas: ["Написать officeus@hermeslogisticsus.com"],
    requiredHrefs: ["/services/hermes-connect/?lang=ru", "/ru/privacy/"],
  },
];

const knownEnglishLeakage = [
  "Four directions. One way forward.",
  "Four paths. One ecosystem.",
  "Choose your direction.",
  "Start with a conversation",
  "The direction",
  "A practical starting point.",
  "What we build",
  "How it works",
  "Reach the right logistics team.",
  "Ask about the right Academy path.",
  "Discuss the system you want to build.",
  "Return to Hermes",
  "Page not found",
];
const russianOnlyEnglishLeakage = [
  "Repair Shops · current live pilot",
  "Open Hermes Connect Product Hub",
  "Current product",
];
const errors = [];
const titles = new Map();
const descriptions = new Map();

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();
const getTagText = (html, tagName) => decode(html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1] ?? "");
const getMetaDescription = (html) => {
  const tag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ?? "";
  return decode(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "");
};

for (const page of pages) {
  const html = await readFile(join(dist, page.path), "utf8");
  const visible = decode(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " "),
  );

  for (const phrase of knownEnglishLeakage) {
    if (page.lang !== "en" && visible.includes(phrase)) errors.push(`${page.route}: untranslated English phrase found: ${phrase}`);
  }
  if (page.lang === "ru") {
    for (const phrase of russianOnlyEnglishLeakage) {
      if (visible.includes(phrase)) errors.push(`${page.route}: untranslated Russian-shell English phrase found: ${phrase}`);
    }
  }
  for (const label of page.requiredLabels ?? []) {
    if (!visible.includes(label)) errors.push(`${page.route}: required localized label is missing: ${label}`);
  }
  for (const cta of page.requiredCtas ?? []) {
    if (!visible.includes(cta)) errors.push(`${page.route}: natural-language CTA is missing: ${cta}`);
  }
  for (const href of page.requiredHrefs ?? []) {
    if (!html.includes(`href="${href}"`)) errors.push(`${page.route}: required locale-safe href is missing: ${href}`);
  }

  const title = getTagText(html, "title");
  const description = getMetaDescription(html);
  if (!title) errors.push(`${page.route}: localized title is missing`);
  if (!description) errors.push(`${page.route}: localized meta description is missing`);
  if (titles.has(title)) errors.push(`${page.route}: localized title duplicates ${titles.get(title)}: ${title}`);
  else titles.set(title, page.route);
  if (descriptions.has(description)) errors.push(`${page.route}: localized meta description duplicates ${descriptions.get(description)}`);
  else descriptions.set(description, page.route);

  const htmlLang = html.match(/<html\b[^>]*lang=["']([^"']+)["']/i)?.[1] ?? "";
  if (htmlLang !== page.lang) errors.push(`${page.route}: expected html lang=${page.lang}, received ${htmlLang || "missing"}`);

  if (/<a\b[^>]*>\s*(Learn more|Read more|Contact us|Get started)\s*<\/a>/i.test(html)) {
    errors.push(`${page.route}: untranslated generic English CTA found`);
  }
}

// Repair Shop is query-localized inside one private product route tree. Translation
// ownership lives in the shared secondary i18n runtime; the demo bootstrap owns only
// synthetic-data isolation and demo/preview query propagation. Audit both owners so
// future polish cannot silently move translations back into the demo data layer.
const repairShopI18n = await readFile(join(root, "public/hermes-connect-repair-owner-secondary-i18n.js"), "utf8");
const repairOwnerCurrent = await readFile(join(root, "public/hermes-connect-repair-owner-p0-current.js"), "utf8");
const repairOwnerPolish = await readFile(join(root, "public/repair-owner-runtime-fixes.js"), "utf8");
const repairOwnerNav = await readFile(join(root, "src/components/RepairShopOwnerNavEnhancer.astro"), "utf8");
const repairShopDemo = await readFile(join(root, "public/repair-shop-local-demo.js"), "utf8");
const repairShopLocales = ["en", "ru", "uk", "es", "it", "fr"];
for (const locale of repairShopLocales) {
  if (!repairShopI18n.includes(`${locale}: {`) && !repairShopI18n.includes(`${locale}:{`) && !repairShopI18n.includes(`${locale}:[`)) {
    errors.push(`Repair Shop i18n runtime: canonical locale is missing: ${locale}`);
  }
}
const repairShopI18nMarkers = [
  'url.searchParams.set("lang",locale)',
  'Доступ владельца СТО',
  'Повторите пароль',
  'ПРЕДПРОСМОТР · синтетические данные',
  'Доступ власника СТО',
  'Acceso del propietario del taller',
  'Accesso proprietario officina',
  'Accès propriétaire d’atelier',
  'data-local-demo-badge',
];
for (const marker of repairShopI18nMarkers) {
  if (!repairShopI18n.includes(marker)) errors.push(`Repair Shop i18n runtime: localization parity marker is missing: ${marker}`);
}

// The private CRM picker is owned by RepairShopOwnerNavEnhancer. Preservation/polish
// runtimes may localize ordinary owner links, but must never rewrite a[lang] targets.
if (!repairOwnerNav.includes('root.querySelectorAll(".repair-crm-language a[lang]")') || !repairOwnerNav.includes('next.searchParams.set("lang", target)')) {
  errors.push("Repair Shop owner locale picker: canonical target-locale writer is missing");
}
if (!repairOwnerCurrent.includes(':not([lang])')) {
  errors.push("Repair Shop P0 runtime: owner-link preservation must exclude language-target anchors");
}
if (!repairShopI18n.includes(':not([lang])')) {
  errors.push("Repair Shop secondary i18n: generic link localization must exclude language-target anchors");
}
if (repairOwnerPolish.includes('.repair-crm-language a[lang]') || repairOwnerPolish.includes('setText(".repair-crm-language summary"')) {
  errors.push("Repair Shop owner polish: legacy runtime must not own the canonical CRM language picker");
}
const repairShopDemoMarkers = [
  'url.searchParams.set("demo", "1")',
  'url.searchParams.set("preview", "1")',
  'data-local-demo-badge',
  'publicPreview',
];
for (const marker of repairShopDemoMarkers) {
  if (!repairShopDemo.includes(marker)) errors.push(`Repair Shop demo bootstrap: safety/query marker is missing: ${marker}`);
}

if (errors.length) {
  throw new Error(`Localization content audit failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

console.log(`Localization content audit passed: ${pages.length} localized pages plus Repair Shop EN/RU/UK/ES/IT/FR query-localized auth/Preview parity have locale-safe content and links.`);