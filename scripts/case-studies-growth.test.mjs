import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");

const routes = [
  {
    route: "/case/",
    file: "case/index.html",
    required: [
      "Hermes Case Studies",
      "/case/it-development/",
      "/case/logistics-seo-foundation/",
      "CollectionPage",
      "BreadcrumbList",
    ],
  },
  {
    route: "/case/logistics-seo-foundation/",
    file: "case/logistics-seo-foundation/index.html",
    required: [
      "Logistics SEO Foundation",
      "/logistics/appleton-wi-vehicle-transport/",
      "/logistics/resources/auction-vehicle-pickup-checklist/",
      "/logistics/resources/car-hauler-capacity-checklist/",
      "Search Console",
      "Article",
      "BreadcrumbList",
    ],
  },
];

for (const page of routes) {
  const html = await readFile(join(dist, page.file), "utf8");
  for (const expected of page.required) {
    assert.ok(html.includes(expected), `${page.route} must include ${expected}`);
  }
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${page.route} must render one H1`);
  assert.ok(html.includes('rel="canonical"'), `${page.route} must render a canonical link`);
  assert.ok(!/MC\s*\d+|DOT\s*\d+|BOL|POD|commission|live truck position/i.test(html), `${page.route} must not expose protected operational details`);
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const page of routes) {
  assert.ok(sitemap.includes(`https://hermeslogisticsus.com${page.route}`), `${page.route} must be in sitemap.xml`);
}

console.log("Case studies growth checks passed.");
