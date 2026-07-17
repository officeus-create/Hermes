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
  { path: "paths/technology/index.html", required: ["IT Development", "CRM and business systems", "Automation and integration", "One connected business flow", "Our first public product", "Hermes IT Development", "Quality assurance", "Digital workforce", "Digital Operations Director", "SEO &amp; Content Intelligence Specialist", "Setup & training", "4-8 weeks", "A concrete first step", "Fitness and wellness", "Beauty and salon", "Logistics operations", "Professional services", "Discuss the system you want to build.", "Company Digital Operating System", "$25-$45 per hour", "From $12k", "staged delivery", "Continuous Improvement Partnership", "From $3k / month", "Digital Presence System", "From $3k", "CRM and Operations Control", "From $5k", "AI Assistant and Workflow", "Connected Business Platform", "From $8k", "The capabilities behind a connected company system."] },
  { path: "privacy/index.html", required: ["Privacy notice", "preview mode"] },
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
  "$25-$45/hr",
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
  if (route.path.startsWith("paths/") && !routeHtml.includes("Wisconsin first")) throw new Error(`Wisconsin service-area signal missing in ${route.path}`);
  if (!routeHtml.includes('name="robots" content="index,follow,max-image-preview:large"')) throw new Error(`Robots metadata missing in ${route.path}`);
  if (/<form[^>]+action=/i.test(routeHtml)) throw new Error(`Form action found in ${route.path}`);
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
if (!html.includes("/contacts/") && !html.includes("contacts/")) throw new Error("Homepage/footer contacts link missing");
if (!sitemap.includes("/contacts/")) throw new Error("Sitemap entry missing for contacts");

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
