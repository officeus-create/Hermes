import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const sitemapFiles = (await readdir(dist, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort();
const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(join(dist, file), "utf8")))).join("\n");
const homepage = await readFile(join(dist, "index.html"), "utf8");
const logisticsHub = await readFile(join(dist, "paths", "logistics", "index.html"), "utf8");

const pages = [
  {
    route: "/logistics/car-hauling-dispatch/",
    file: join(dist, "logistics", "car-hauling-dispatch", "index.html"),
    title: "Car Hauling Dispatch Services for Owner-Operators | Hermes Logistics",
    h1: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets",
    required: [
      "carrier reviews and approves every load before booking",
      "The carrier makes the final operating decision",
      "MC, DOT, operating authority, insurance status",
      "Does Hermes guarantee loads, rates, or revenue?",
      "/logistics/dealer-vehicle-transportation/",
      "/contacts/",
    ],
  },
  {
    route: "/logistics/dealer-vehicle-transportation/",
    file: join(dist, "logistics", "dealer-vehicle-transportation", "index.html"),
    title: "Dealer Vehicle Transportation Services | Hermes Logistics",
    h1: "Dealer Vehicle Transportation Services",
    required: [
      "Qualified carrier review",
      "Qualified capacity is evaluated",
      "Availability is never guaranteed before confirmation",
      "Carrier authority, insurance, equipment",
      "Does Hermes own the transporting fleet?",
      "/logistics/car-hauling-dispatch/",
      "/contacts/",
    ],
  },
];

const homepagePriorityRoutes = [
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/resources/auction-vehicle-pickup-checklist/",
  "/logistics/resources/car-hauler-capacity-checklist/",
];

const wisconsinHubRoutes = [
  "/logistics/wisconsin-vehicle-transport/",
  "/logistics/wisconsin-dealer-vehicle-transport/",
  "/logistics/wisconsin-auction-vehicle-pickup/",
  "/logistics/wisconsin-enclosed-vehicle-transport/",
  "/logistics/wisconsin-multi-vehicle-dealer-transport/",
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/milwaukee-wi-vehicle-transport/",
  "/logistics/madison-wi-vehicle-transport/",
  "/logistics/green-bay-wi-vehicle-transport/",
  "/logistics/oshkosh-wi-vehicle-transport/",
  "/logistics/fond-du-lac-wi-vehicle-transport/",
  "/logistics/eau-claire-wi-vehicle-transport/",
  "/logistics/la-crosse-wi-vehicle-transport/",
  "/logistics/kenosha-wi-vehicle-transport/",
  "/logistics/racine-wi-vehicle-transport/",
  "/logistics/waukesha-wi-vehicle-transport/",
  "/logistics/sheboygan-wi-vehicle-transport/",
];

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();
const getTagText = (html, tagName) => decode(html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1] ?? "");
const getLinkHref = (html, rel) => [...html.matchAll(/<link\b[^>]*>/gi)]
  .map((match) => match[0])
  .find((tag) => new RegExp(`\\brel=["'][^"']*\\b${rel}\\b[^"']*["']`, "i").test(tag))
  ?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
const parseJsonLd = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });

for (const page of pages) {
  const html = await readFile(page.file, "utf8");
  assert.equal(getTagText(html, "title"), page.title, `${page.route} title is incorrect`);
  assert.equal(getTagText(html, "h1"), page.h1, `${page.route} H1 is missing or incorrect`);
  assert.equal(getLinkHref(html, "canonical"), `https://hermeslogisticsus.com${page.route}`, `${page.route} canonical is missing`);
  assert.ok(/<meta\b[^>]*name=["']robots["'][^>]*content=["']index,follow,max-image-preview:large["'][^>]*>/i.test(html), `${page.route} must remain indexable`);
  assert.ok(/aria-label=["']Breadcrumb["']/i.test(html), `${page.route} visible breadcrumb is missing`);
  assert.ok(html.includes('href="mailto:freight_301@hermeslogisticsus.com"'), `${page.route} logistics email fallback is missing`);
  assert.ok(html.includes('href="tel:+12623023626"'), `${page.route} approved phone fallback is missing`);
  assert.ok(!/<form\b[^>]*action=/i.test(html), `${page.route} contains an unreviewed form action`);

  for (const text of page.required) assert.ok(html.includes(text), `${page.route} missing required scope text: ${text}`);

  const entities = parseJsonLd(html);
  const service = entities.find((entity) => entity?.["@type"] === "Service");
  const breadcrumbs = entities.find((entity) => entity?.["@type"] === "BreadcrumbList");
  const faq = entities.find((entity) => entity?.["@type"] === "FAQPage");
  assert.ok(service, `${page.route} Service schema is missing`);
  assert.equal(service.provider?.["@id"], "https://hermeslogisticsus.com/#organization");
  assert.equal(service.url, `https://hermeslogisticsus.com${page.route}`);
  assert.ok(breadcrumbs, `${page.route} BreadcrumbList schema is missing`);
  assert.equal(breadcrumbs.itemListElement?.at(-1)?.item, `https://hermeslogisticsus.com${page.route}`);
  assert.ok(faq?.mainEntity?.length >= 5, `${page.route} visible FAQ schema is incomplete`);
  for (const question of faq.mainEntity) assert.ok(html.includes(question.name), `${page.route} FAQ question is not visible: ${question.name}`);

  assert.ok(sitemap.includes(`https://hermeslogisticsus.com${page.route}`), `${page.route} is missing from declared sitemap union`);
  assert.ok(logisticsHub.includes(`href="${page.route}"`), `${page.route} is not linked from the logistics hub`);
}

for (const route of homepagePriorityRoutes) {
  assert.ok(homepage.includes(`href="${route}"`), `${route} is not linked from the homepage discovery block`);
  assert.ok(sitemap.includes(`https://hermeslogisticsus.com${route}`), `${route} is missing from declared sitemap union`);
}

for (const route of wisconsinHubRoutes) {
  assert.ok(logisticsHub.includes(`href="${route}"`), `${route} is not linked from the Wisconsin logistics directory`);
  assert.ok(sitemap.includes(`https://hermeslogisticsus.com${route}`), `${route} is missing from declared sitemap union`);
}

assert.ok(logisticsHub.includes('id="logistics-resources"'), "Logistics resources fragment target is missing");

console.log(`Commercial logistics page checks passed: ${pages.length} indexable commercial pages, ${homepagePriorityRoutes.length} homepage discovery links, and ${wisconsinHubRoutes.length} Wisconsin hub links.`);
