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
  { path: "paths/marketing/index.html", required: ["ProgressoPro", "Strategy and positioning", "Sales operations", "https://www.instagram.com/progressopro/", "https://www.threads.com/@progressopro", "https://t.me/SMMProgressoPro"] },
  { path: "paths/academy/index.html", required: ["Hermes Business Academy", "COO / Operational Director", "Operating Career System", "Executive", "Three programs. Different responsibilities.", "Practice environment", "do not guarantee employment"] },
  { path: "paths/technology/index.html", required: ["IT Development", "CRM and business systems", "Automation and integration", "One connected business flow", "Booking", "Analytics"] },
  { path: "privacy/index.html", required: ["Privacy notice", "preview mode"] },
];
const assets = [
  "images/hermes-ecosystem-hero.jpg",
  "images/path-logistics.jpg",
  "images/path-marketing.jpg",
  "images/path-academy.jpg",
  "images/path-technology-portal.jpg",
];

await access(indexPath);
await access(join(dist, "404.html"));
await access(join(dist, "robots.txt"));
await access(join(dist, "sitemap.xml"));
const html = await readFile(indexPath, "utf8");
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");

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
  "Your information was not sent or stored.",
];

for (const text of required) {
  if (!html.includes(text)) throw new Error(`Missing required content: ${text}`);
}

for (const route of routes) {
  const routeHtml = await readFile(join(dist, route.path), "utf8");
  for (const text of route.required) {
    if (!routeHtml.includes(text)) throw new Error(`Missing ${text} in ${route.path}`);
  }
  if (!routeHtml.includes('<link rel="canonical"')) throw new Error(`Canonical URL missing in ${route.path}`);
  if (/<form[^>]+action=/i.test(routeHtml)) throw new Error(`Form action found in ${route.path}`);
}

for (const slug of ["logistics", "marketing", "academy", "technology"]) {
  if (!html.includes(`/paths/${slug}/`)) throw new Error(`Homepage link missing for ${slug}`);
  if (!sitemap.includes(`/paths/${slug}/`)) throw new Error(`Sitemap entry missing for ${slug}`);
}

const forbidden = [
  "guaranteed income",
  "guaranteed employment",
  "10,000+ students",
  "4,400+ trucks",
  "operating in all 48 states",
];

for (const claim of forbidden) {
  if (html.toLowerCase().includes(claim)) throw new Error(`Unsupported claim found: ${claim}`);
}

if (/<form[^>]+action=/i.test(html)) throw new Error("Prototype form must not have an action endpoint");
if (!html.includes('data-contact-mode="preview"')) throw new Error("Safe preview contact mode is not active by default");
if (!html.includes('name="consent"')) throw new Error("Contact consent field is missing");
if (!html.includes('id="main-content"')) throw new Error("Skip-link target is missing");
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
