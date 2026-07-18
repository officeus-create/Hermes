import { access, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
const routes = [
  {
    path: "paths/logistics/index.html",
    required: ["Hermes Logistics", "Dispatch operations", "Dry Van", "Power Only", "Freight Department", "freight_301@hermeslogisticsus.com", "+1 (351) 777-5337"],
  },
  { path: "paths/marketing/index.html", required: ["ProgressoPro", "Strategy and positioning", "Sales operations", "Growth operating system", "Qualified lead", "Reach ProgressoPro directly.", "https://www.instagram.com/progressopro/", "https://www.threads.com/@progressopro", "https://t.me/SMMProgressoPro"] },
  { path: "paths/academy/index.html", required: ["Hermes Business Academy", "COO / Operational Director", "Operating Career System", "Executive", "Three programs. Different responsibilities.", "Practice environment", "Program dates, scope, and prices are published before enrollment", "Ask about the right Academy path.", "do not guarantee employment"] },
  { path: "paths/technology/index.html", required: ["IT Development", "CRM and business systems", "Automation and integration", "One connected business flow", "A company-building partnership", "One partner that can keep building as your company grows.", "Technology", "Marketing", "Academy", "Logistics", "Live product", "Working prototype", "Build-ready capability", "WhatsApp", "Google Chat", "Our first public product", "Hermes IT Development", "Quality assurance", "AI assistants", "Operations AI Assistant", "SEO and Content AI Assistant", "Setup & training", "4-8 weeks", "A concrete first step", "Fitness and wellness", "Beauty and salon", "Logistics operations", "Professional services", "Discuss the system you want to build.", "Company Digital Operating System", "Built in stages", "Continuous Improvement Partnership", "Digital Presence System", "CRM and Operations Control", "AI Assistant and Workflow", "Connected Business Platform", "The capabilities behind a connected company system.", "Build your project brief", "Tell us what should work better next.", "Up to three projects", "What have you seen that feels right?", "Budget approach", "Where does the business operate", "Your project brief is ready."] },
  { path: "case/it-development/index.html", required: ["One digital front door for four businesses.", "Build your brief", "Start your project brief"] },
  { path: "privacy/index.html", required: ["Privacy notice", "preview mode"] },
  { path: "ua/index.html", required: ["Чотири напрями. Одна екосистема для зростання.", "Hermes Logistics", "Hermes Marketing", "Hermes Business Academy", "Hermes IT Development", "Партнерство для розвитку компанії", "AI та messaging-асистенти", "mailto:officeus@hermeslogisticsus.com"] },
  { path: "ru/index.html", required: ["Четыре направления. Одна экосистема для роста.", "Hermes Logistics", "Hermes Marketing", "Hermes Business Academy", "Hermes IT Development", "Партнёрство для развития компании", "AI и messaging-ассистенты", "mailto:officeus@hermeslogisticsus.com"] },
  { path: "es/index.html", required: ["Cuatro áreas. Un ecosistema para crecer.", "Hermes Logistics", "Hermes Marketing", "Hermes Business Academy", "Hermes IT Development", "Una alianza para desarrollar su empresa", "mailto:officeus@hermeslogisticsus.com"] },
  { path: "it/index.html", required: ["Quattro aree. Un ecosistema per crescere.", "Hermes Logistics", "Hermes Marketing", "Hermes Business Academy", "Hermes IT Development", "Una partnership per sviluppare", "mailto:officeus@hermeslogisticsus.com"] },
  { path: "fr/index.html", required: ["Quatre pôles. Un écosystème pour grandir.", "Hermes Logistics", "Hermes Marketing", "Hermes Business Academy", "Hermes IT Development", "Un partenariat pour développer", "mailto:officeus@hermeslogisticsus.com"] },
  {
    path: "contacts/index.html",
    required: [
      "Contact Hermes",
      "Wisconsin, USA",
      "+1 (717) 696-6829",
      "+1 (262) 302-3626",
      "Shippers and dealers",
      "Carriers and owner-operators",
      "https://t.me/SMMProgressoPro",
      "https://t.me/+GL3L-WkP55NmYzVi",
      "Logistics school",
    ],
  },
  {
    path: "load-board/index.html",
    required: [
      "Car Hauling Load Board Preview",
      "Describe a car-hauling load.",
      "Dry-run only",
      "Who is posting?",
      "Private party",
      "Truck tractor",
      "data-load-board-form",
      "data-load-result",
    ],
  },
  { path: "logistics/shipper-dealer/index.html", required: ["Shipper or dealer", "Post a load", "Automatic review"] },
  { path: "logistics/broker/index.html", required: ["Broker", "Post a broker load", "Carrier capacity"] },
  { path: "logistics/carrier/index.html", required: ["Carrier or owner-operator", "Find loads", "Call carriers team"] },
  { path: "logistics/agency/index.html", required: ["Open an agency", "Start agency application", "remote logistics agency"] },
  { path: "logistics/careers/index.html", required: ["Work with us", "Start job application", "Explore training first"] },
  { path: "logistics/apply/index.html", required: ["Logistics Application", "Application type", "data-logistics-application", "Your information was not sent or stored"] },
];
const emailOnlyRoutes = [
  "paths/marketing/index.html",
  "paths/academy/index.html",
  "paths/technology/index.html",
];
const assets = [
  "images/hermes-ecosystem-hero.jpg",
  "images/path-logistics-system.jpg",
  "images/path-marketing-system.jpg",
  "images/path-academy-system.jpg",
  "images/path-technology-portal.jpg",
];

await access(indexPath);
await access(join(dist, "404.html"));
await access(join(dist, "robots.txt"));
await access(join(dist, "sitemap.xml"));
await access(join(dist, "llms.txt"));
const html = await readFile(indexPath, "utf8");
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");

function validateStructuredData(pageHtml, pageName) {
  const matches = [...pageHtml.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (matches.length === 0) throw new Error(`Structured data missing in ${pageName}`);
  for (const match of matches) JSON.parse(match[1]);
}

const required = [
  "Four businesses. One place to move forward.",
  "Four paths. One ecosystem.",
  "Move freight",
  "Grow demand",
  "Build capability",
  "Build systems",
  "Hermes Logistics",
  "ProgressoPro",
  "Hermes Business Academy",
  "IT Development",
  "Car Hauling",
  "COO / Operational Director Program",
  "https://www.instagram.com/hermes.logistics/",
  "https://www.threads.com/@hermes.logistics",
  "Hermes IT Development",
  "Human-led, AI-assisted",
  "Why this matters",
  "Trust architecture",
];

for (const text of required) {
  if (!html.includes(text)) throw new Error(`Missing required content: ${text}`);
}

if (!html.includes('data-preview-status="Your information was not sent or stored."')) {
  throw new Error("Preview honesty message is missing from contact form");
}

for (const route of routes) {
  const routeHtml = await readFile(join(dist, route.path), "utf8");
  for (const text of route.required) {
    if (!routeHtml.includes(text)) throw new Error(`Missing ${text} in ${route.path}`);
  }
  if (!routeHtml.includes('<link rel="canonical"')) throw new Error(`Canonical URL missing in ${route.path}`);
  if (route.path.startsWith("paths/")) validateStructuredData(routeHtml, route.path);
  if (["ua/index.html", "ru/index.html", "es/index.html", "it/index.html", "fr/index.html"].includes(route.path)) validateStructuredData(routeHtml, route.path);
  if (route.path.startsWith("paths/") && !routeHtml.includes("Wisconsin first")) throw new Error(`Wisconsin service-area signal missing in ${route.path}`);
  if (!routeHtml.includes('name="robots" content="index,follow,max-image-preview:large"')) throw new Error(`Robots metadata missing in ${route.path}`);
  if (/<form[^>]+action=/i.test(routeHtml)) throw new Error(`Form action found in ${route.path}`);
  if (route.path === "paths/technology/index.html" && /digital employee/i.test(routeHtml)) throw new Error("Legacy digital employee wording found on the IT page");
}

const localizedRouteChecks = [
  { path: "ua/index.html", lang: "uk" },
  { path: "ru/index.html", lang: "ru" },
  { path: "es/index.html", lang: "es" },
  { path: "it/index.html", lang: "it" },
  { path: "fr/index.html", lang: "fr" },
];
for (const localized of localizedRouteChecks) {
  const localizedHtml = await readFile(join(dist, localized.path), "utf8");
  if (!localizedHtml.includes(`<html lang="${localized.lang}">`)) throw new Error(`Language metadata missing in ${localized.path}`);
  if (!localizedHtml.includes(`hreflang="en"`)) throw new Error(`English hreflang missing in ${localized.path}`);
  for (const localePath of ["/ua/", "/ru/", "/es/", "/it/", "/fr/"]) {
    if (!localizedHtml.includes(`https://hermeslogisticsus.com${localePath}`)) throw new Error(`Localized counterpart ${localePath} missing in ${localized.path}`);
  }
}

for (const path of emailOnlyRoutes) {
  const routeHtml = await readFile(join(dist, path), "utf8");
  if (!routeHtml.includes("mailto:officeus@hermeslogisticsus.com")) throw new Error(`Email contact missing in ${path}`);
  if (routeHtml.includes('href="tel:')) throw new Error(`Phone contact must be logistics-only: ${path}`);
}

for (const slug of ["logistics", "marketing", "academy", "technology"]) {
  if (!html.includes(`/paths/${slug}/`)) throw new Error(`Homepage link missing for ${slug}`);
  if (!sitemap.includes(`/paths/${slug}/`)) throw new Error(`Sitemap entry missing for ${slug}`);
}
for (const localePath of ["/ua/", "/ru/", "/es/", "/it/", "/fr/"]) {
  if (!html.includes(localePath)) throw new Error(`Homepage language link missing for ${localePath}`);
  if (!sitemap.includes(localePath)) throw new Error(`Sitemap entry missing for ${localePath}`);
}
if (!html.includes("/contacts/") && !html.includes("contacts/")) throw new Error("Homepage/footer contacts link missing");
if (!sitemap.includes("/contacts/")) throw new Error("Sitemap entry missing for contacts");
if (!sitemap.includes("/load-board/")) throw new Error("Sitemap entry missing for Load Board");
for (const path of ["shipper-dealer", "broker", "carrier", "agency", "careers"]) {
  if (!sitemap.includes(`/logistics/${path}/`)) throw new Error(`Sitemap entry missing for logistics audience: ${path}`);
}
if (!sitemap.includes("/logistics/apply/")) throw new Error("Sitemap entry missing for logistics application");

const forbidden = [
  "guaranteed income",
  "guaranteed employment",
  "10,000+ students",
  "4,400+ trucks",
  "operating in all 48 states",
  "1m+ loads moved",
  "800+ students trained",
  "300%+ average growth",
  "job opportunity after completion",
  "anastasia, logistics student",
];

const publicForbiddenInternalTerms = [
  "ChatGPT / Digital CEO",
  "Codex",
  "Claude",
  "AI Command Center",
  "Carrier Operations Database",
  "Database Carrier",
  "DCA-",
];

const publicPages = [["homepage", html]];
for (const route of routes) {
  publicPages.push([route.path, await readFile(join(dist, route.path), "utf8")]);
}

for (const claim of forbidden) {
  for (const [pageName, pageHtml] of publicPages) {
    if (pageHtml.toLowerCase().includes(claim)) throw new Error(`Unsupported claim found in ${pageName}: ${claim}`);
  }
}

for (const term of publicForbiddenInternalTerms) {
  if (html.includes(term)) throw new Error(`Internal term found on homepage: ${term}`);
  for (const route of routes) {
    const routeHtml = await readFile(join(dist, route.path), "utf8");
    if (routeHtml.includes(term)) throw new Error(`Internal term found in ${route.path}: ${term}`);
  }
}

if (/<form[^>]+action=/i.test(html)) throw new Error("Prototype form must not have an action endpoint");
if (!html.includes('data-contact-mode="preview"')) throw new Error("Safe preview contact mode is not active by default");
if (!html.includes("data-contact-handoff")) throw new Error("Preview contact handoff panel is missing");
if (!html.includes("data-copy-request")) throw new Error("Copy request control is missing");
if (!html.includes('name="consent"')) throw new Error("Contact consent field is missing");
if (!html.includes('id="main-content"')) throw new Error("Skip-link target is missing");
validateStructuredData(html, "homepage");
if (!html.includes("Hermes Wisconsin")) throw new Error("Wisconsin homepage title is missing");
const cssFiles = (await readdir(join(dist, "_astro"))).filter((file) => file.endsWith(".css"));
const css = (await Promise.all(cssFiles.map((file) => readFile(join(dist, "_astro", file), "utf8")))).join("\n");
if (!css.includes("prefers-reduced-motion")) throw new Error("Reduced-motion stylesheet was not emitted");

for (const asset of assets) {
  const path = join(dist, asset);
  await access(path);
  const info = await stat(path);
  if (info.size === 0) throw new Error(`Empty image asset: ${asset}`);
  if (info.size > 1_500_000) throw new Error(`Image exceeds prototype budget: ${asset}`);
}

await access(join(dist, "_headers"));

console.log(`Validated static website: ${routes.length + 1} routes, ${required.length} homepage checks, ${assets.length} image assets, no external form action.`);
