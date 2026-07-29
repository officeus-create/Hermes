import { access, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
const routes = [
  {
    path: "paths/logistics/index.html",
    required: ["Hermes Logistics", "Dispatch operations", "Dry Van", "Power Only", "Logistics Sales Department", "freight_301@hermeslogisticsus.com", "+1 (262) 302-3626"],
  },
  { path: "paths/marketing/index.html", required: ["ProgressoPro", "Website and SEO", "Social media marketing", "Four connected marketing pillars", "SEO Optimization", "Growth &amp; Sales System", "Growth operating system", "Qualified lead", "Reach ProgressoPro directly.", "https://www.instagram.com/progressopro/", "https://www.threads.com/@progressopro", "https://t.me/SMMProgressoPro"] },
  { path: "paths/academy/index.html", required: ["Hermes Business Academy", "COO / Operational Director", "Operating Career System", "Executive", "Three programs. Different responsibilities.", "Practice environment", "Program dates, scope, and prices are published before enrollment", "Ask about the right Academy path.", "do not guarantee employment"] },
  { path: "paths/technology/index.html", required: ["IT Development", "Digital presence and portals", "CRM and operations systems", "Automation and industry products", "One connected business flow", "A company-building partnership", "One partner that can keep building as your company grows.", "Technology", "Marketing", "Academy", "Logistics", "Live product", "Working prototype", "Build-ready capability", "Local preview", "Implemented capability", "Carrier and dispatcher workspace", "Multilingual website foundation", "Controlled intake and review", "WhatsApp", "Google Chat", "Our first public product", "Hermes IT Development", "Quality assurance", "AI assistants", "Operations AI Assistant", "SEO and Content AI Assistant", "Setup & training", "4-8 weeks", "A concrete first step", "Fitness and wellness", "Beauty and salon", "Logistics operations", "Professional services", "Discuss the system you want to build.", "Company Digital Operating System", "Built in stages", "Continuous Improvement Partnership", "Digital Presence System", "CRM and Operations Control", "AI Assistant and Workflow", "Connected Business Platform", "The capabilities behind a connected company system.", "Build your project brief", "Tell us what should work better next.", "Up to three projects", "What have you seen that feels right?", "Budget approach", "Where does the business operate", "Your project brief is ready."] },
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
      "Logistics contact · USA",
      "+1 (262) 302-3626",
      "Logistics Sales Department",
      "freight_301@hermeslogisticsus.com",
      "Email-only international coordination",
      "Milan · Berlin · Paris · Miami · California · New York · England",
      "https://t.me/SMMProgressoPro",
      "https://t.me/+GL3L-WkP55NmYzVi",
      "Logistics school",
    ],
  },
  {
    path: "load-board/index.html",
    required: [
      "Car Hauling Load Board Preview",
      "One board. The right workspace for your role.",
      "Dry-run only",
      "Available Loads · Demo data",
      "Try a demo city:",
      "Request dispatch",
      "Fictional examples",
      "Get free Load Board access or ask about a load.",
      "Request free access",
      "Sales tag: LOAD BOARD ACCESS / CARRIER",
      "Post a load request",
      "Sales tag: POSTED LOAD / CUSTOMER",
      "Who is posting?",
      "Customer / private party",
      "Truck tractor",
      "data-load-board-form",
      "data-load-result",
    ],
  },
  { path: "logistics/shipper-dealer/index.html", required: ["Shipper or dealer", "Post a load", "Automatic review", "Call Logistics Sales", "tel:+12623023626"] },
  { path: "logistics/broker/index.html", required: ["Broker", "Open broker Load Board", "Carrier capacity", "Call Logistics Sales", "tel:+12623023626"] },
  { path: "logistics/carrier/index.html", required: ["Carrier or owner-operator", "Open Load Board", "Call Logistics Sales", "tel:+12623023626"] },
  { path: "logistics/agency/index.html", required: ["Open an agency", "Start agency application", "remote logistics agency"] },
  { path: "logistics/careers/index.html", required: ["Work with us", "Start job application", "Explore training first"] },
  { path: "logistics/apply/index.html", required: ["Logistics Application", "Application type", "data-logistics-application", "Your information was not sent or stored"] },
  { path: "paths/academy/index.html", required: ["Learn AI automation by building one useful assistant.", "Fitness AI Telegram Assistant", "Learning preview only", "Ask about learning AI automation"] },
];
const emailOnlyRoutes = [
  "paths/marketing/index.html",
  "paths/academy/index.html",
  "paths/technology/index.html",
];
const assets = [
  "images/hermes-social-share-2026.jpg",
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
  "Four directions. One way forward.",
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
  "Products built by Hermes IT Development",
  "CRM & Operations Control",
  "Hermes Connect",
  "Working prototype",
  "Product discovery",
  "No account, booking, calendar, payment, or AI action is connected",
  "Hermes Load Board",
  "Box Truck 26 ft",
  "No load, truck, offer, dispatch, external-board sync, or scheduled update is live",
];

for (const text of required) {
  if (!html.includes(text)) throw new Error(`Missing required content: ${text}`);
}

if (!html.includes('data-preview-status="Your information was not sent or stored."')) {
  throw new Error("Preview honesty message is missing from contact form");
}

if (!html.includes("/images/hermes-social-share-2026.jpg")) throw new Error("Updated social preview image missing");
if (!html.includes('property="og:image:width" content="2048"')) throw new Error("Social image width metadata missing");
if (!html.includes('property="og:image:height" content="1152"')) throw new Error("Social image height metadata missing");

for (const route of routes) {
  const routeHtml = await readFile(join(dist, route.path), "utf8");
  for (const text of route.required) {
    if (!routeHtml.includes(text)) throw new Error(`Missing ${text} in ${route.path}`);
  }
  if (!routeHtml.includes('<link rel="canonical"')) throw new Error(`Canonical URL missing in ${route.path}`);
  if (route.path.startsWith("paths/")) validateStructuredData(routeHtml, route.path);
  if (["ua/index.html", "ru/index.html", "es/index.html", "it/index.html", "fr/index.html"].includes(route.path)) validateStructuredData(routeHtml, route.path);
  if (route.path === "paths/logistics/index.html" && !routeHtml.includes("Wisconsin first")) throw new Error(`U.S. Logistics service-area signal missing in ${route.path}`);
  if (emailOnlyRoutes.includes(route.path) && !routeHtml.includes("Email coordination only")) throw new Error(`International email-only signal missing in ${route.path}`);
  if (!routeHtml.includes('name="robots" content="index,follow,max-image-preview:large"')) throw new Error(`Robots metadata missing in ${route.path}`);
  if (/<form[^>]+action=/i.test(routeHtml)) throw new Error(`Form action found in ${route.path}`);
  if (route.path === "paths/technology/index.html" && /digital employee/i.test(routeHtml)) throw new Error("Legacy digital employee wording found on the IT page");
}

const locationRoutes = [
  ["appleton-wi-vehicle-transport", "Appleton, Wisconsin"],
  ["pueblo-co-vehicle-transport", "Pueblo, Colorado"],
  ["colorado-springs-co-vehicle-transport", "Colorado Springs, Colorado"],
  ["springfield-mo-vehicle-transport", "Springfield, Missouri"],
  ["puyallup-wa-vehicle-transport", "Puyallup, Washington"],
  ["university-park-il-vehicle-transport", "University Park, Illinois"],
  ["saint-paul-mn-vehicle-transport", "Saint Paul, Minnesota"],
  ["royal-oak-mi-vehicle-transport", "Royal Oak, Michigan"],
  ["evanston-il-vehicle-transport", "Evanston, Illinois"],
  ["englewood-co-vehicle-transport", "Englewood, Colorado"],
  ["chicago-il-vehicle-transport", "Chicago, Illinois"],
  ["austin-tx-vehicle-transport", "Austin, Texas"],
  ["milwaukee-wi-vehicle-transport", "Milwaukee, Wisconsin"],
  ["littleton-co-vehicle-transport", "Littleton, Colorado"],
];

for (const [slug, place] of locationRoutes) {
  const routePath = `logistics/${slug}/index.html`;
  const routeHtml = await readFile(join(dist, routePath), "utf8");
  for (const text of [
    `Vehicle transport requests to and from ${place}.`,
    "Prepare a transport request",
    "Carrier: share capacity",
    "Request review only.",
    "What can change the operating plan.",
    "Prepare the facts a carrier needs.",
    "From request to a qualified next step.",
    "Open or enclosed is a fit decision.",
    "Before you request transport.",
  ]) {
    if (!routeHtml.includes(text)) throw new Error(`Missing ${text} in ${routePath}`);
  }
  if (!routeHtml.includes(`<link rel="canonical" href="https://hermeslogisticsus.com/logistics/${slug}/">`)) {
    throw new Error(`Location canonical URL missing or incorrect in ${routePath}`);
  }
  if (!routeHtml.includes('name="robots" content="index,follow,max-image-preview:large"')) {
    throw new Error(`Location robots metadata missing in ${routePath}`);
  }
  if (!sitemap.includes(`/logistics/${slug}/`)) throw new Error(`Sitemap entry missing for location: ${slug}`);
  if (/Verified Hermes location detail/.test(routeHtml)) {
    throw new Error(`Unverified address or ZIP block was rendered in ${routePath}`);
  }
  if (/\[cite:\s*\d+\]|6%\s*(?:to|-)\s*11%|\$10k|\$12k|weekly gross|high-paying/i.test(routeHtml)) {
    throw new Error(`Unsupported Gemini draft claim found in ${routePath}`);
  }
  validateStructuredData(routeHtml, routePath);
}

const technologyHtml = await readFile(join(dist, "paths/technology/index.html"), "utf8");
for (const text of [
  "Hermes Connect · Prototype work started",
  "Product architecture",
  "Prototype brief",
  "Specialist booking flow",
  "First prototype target · Mobile-first PWA",
  "Personal booking link",
  "Defined prototype scope · Simulated data and test booking only",
  "No public Hermes Connect app, account, booking, payment, calendar, or integration is live yet",
  "Candidate Validation Pipeline",
  "Marketing and Content Systems",
  "Data and API Integrations",
  "Data Validation and Security",
  "Document Automation",
  "Maps and Location Systems",
  "Analytics and Executive Dashboards",
  "risk indicators",
  "Business Process Audit",
  "Cloud Deployment",
  "Working product previews",
  "Run sample validation",
  "Create test booking",
  "no calendar event, payment, account, or message is created",
  "Working v0.2",
  "Open full CRM dashboard",
  "Open profile & availability workspace",
  "AI Assistants and Business Bots",
  "CRM and Sales Automation",
  "Logistics Technology",
  "Carrier Profile Card",
  "AI Telegram Assistant",
  "Route Risk Panel",
  "Recruiting Pipeline",
  "Executive Dashboard",
  "Available for custom development",
]) {
  if (!technologyHtml.includes(text)) throw new Error(`Technology capability signal missing: ${text}`);
}

for (const demoPath of ["demos/crm-validation/index.html", "demos/hermes-connect/index.html", "demos/website-audit/index.html"]) {
  const demoHtml = await readFile(join(dist, demoPath), "utf8");
  if (!demoHtml.toLowerCase().includes("preview") && !demoHtml.toLowerCase().includes("prototype")) {
    throw new Error(`Product demo boundary missing in ${demoPath}`);
  }
}

const auditReport = JSON.parse(await readFile(join(dist, "demos/website-audit/report.json"), "utf8"));
if (auditReport.averageScore !== 99 || auditReport.needsReview !== 2) {
  throw new Error("Published Website Audit report does not match the reviewed local result.");
}
if (auditReport.externalCrawlPerformed !== false || auditReport.websiteWritePerformed !== false) {
  throw new Error("Published Website Audit report is missing its read-only boundaries.");
}

const homepageTechnologySignals = [
  "Digital systems we build",
  "AI Assistants",
  "CRM &amp; Automation",
  "Logistics Technology",
  "Hermes Connect",
];
for (const text of homepageTechnologySignals) {
  if (!html.includes(text)) throw new Error(`Homepage technology signal missing: ${text}`);
}

if (!technologyHtml.includes("Budget approach · optional")) throw new Error("IT brief still appears to require an initial budget.");
if (/name=\"budget_mode\" required/.test(technologyHtml)) throw new Error("IT brief budget mode must not be required.");

const departmentSystemChecks = [
  { path: "paths/logistics/index.html", texts: ["Carrier and load validation", "API and board connections", "Operations dashboard"] },
  { path: "paths/marketing/index.html", texts: ["Automated Website Audit", "Competitor Monitoring", "Marketing Dashboard", "Open the Hermes audit report", "/demos/website-audit/"] },
  { path: "paths/academy/index.html", texts: ["Candidate Validation", "Document and Knowledge Automation", "Learning Operations Dashboard"] },
];
for (const check of departmentSystemChecks) {
  const pageHtml = await readFile(join(dist, check.path), "utf8");
  for (const text of check.texts) {
    if (!pageHtml.includes(text)) throw new Error(`Department technology signal missing in ${check.path}: ${text}`);
  }
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
  "+17182234736",
  "+14754414301",
  "+13517775337",
  "+17176966829",
  "+1 (351) 777-5337",
  "+1 (717) 696-6829",
  "Box Truck Department",
  "Public contact listed by Hermes Logistics on Instagram",
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

async function collectHtmlFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextRelative = join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(join(directory, entry.name), nextRelative));
    else if (entry.name.endsWith(".html")) files.push(nextRelative);
  }
  return files;
}

const allHtmlFiles = await collectHtmlFiles(dist);
const publicPages = await Promise.all(allHtmlFiles.map(async (path) => [path, await readFile(join(dist, path), "utf8")]));

for (const [pageName, pageHtml] of publicPages) {
  if (pageHtml.includes("/cdn-cgi/l/email-protection")) {
    throw new Error(`Cloudflare email-protection link found in ${pageName}`);
  }

  const mailtoPositions = [...pageHtml.matchAll(/href="mailto:/g)].map((match) => match.index ?? -1);
  if (mailtoPositions.length === 0) continue;

  const protectionStart = pageHtml.indexOf("<!--email_off-->");
  const protectionEnd = pageHtml.indexOf("<!--/email_off-->");
  if (
    protectionStart === -1 ||
    protectionEnd === -1 ||
    protectionEnd <= protectionStart ||
    mailtoPositions.some((position) => position < protectionStart || position > protectionEnd)
  ) {
    throw new Error(`Static email link is not protected from Cloudflare obfuscation in ${pageName}`);
  }
}

const routeFromHtmlPath = (path) => {
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -"index.html".length)}`;
  return `/${path}`;
};
const htmlTargets = new Set(allHtmlFiles.map(routeFromHtmlPath));
const brokenInternalLinks = [];
for (const [pageName, pageHtml] of publicPages) {
  const pageUrl = new URL(routeFromHtmlPath(pageName), "https://hermeslogisticsus.com");
  for (const match of pageHtml.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1];
    if (!href || href.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) continue;
    const target = new URL(href, pageUrl);
    if (target.hostname !== "hermeslogisticsus.com") continue;
    const targetPath = target.pathname.endsWith("/") ? target.pathname : target.pathname.endsWith(".html") ? target.pathname : `${target.pathname}/`;
    if (!htmlTargets.has(targetPath)) brokenInternalLinks.push(`${pageName} -> ${href}`);
  }
}
if (brokenInternalLinks.length) {
  throw new Error(`Broken internal links:\n${brokenInternalLinks.slice(0, 30).join("\n")}`);
}

for (const claim of forbidden) {
  for (const [pageName, pageHtml] of publicPages) {
    if (pageHtml.toLowerCase().includes(claim)) throw new Error(`Unsupported claim found in ${pageName}: ${claim}`);
  }
}

const publicTelephoneTargets = new Set(
  publicPages.flatMap(([, pageHtml]) => [...pageHtml.matchAll(/href="tel:([^"]+)"/g)].map((match) => match[1])),
);
if (publicTelephoneTargets.size !== 1 || !publicTelephoneTargets.has("+12623023626")) {
  throw new Error(`Only the approved Logistics Sales telephone may be public: ${[...publicTelephoneTargets].join(", ")}`);
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
if (!html.includes("Hermes | Logistics, Marketing, Academy &amp; IT")) throw new Error("Hermes ecosystem homepage title is missing");
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

console.log(`Validated static website: ${allHtmlFiles.length} HTML pages, ${required.length} homepage checks, ${assets.length} image assets, 0 broken internal links.`);
