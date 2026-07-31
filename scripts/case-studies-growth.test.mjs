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
      "/case/appleton-vehicle-transport-seo/",
      "CollectionPage",
      "BreadcrumbList",
    ],
  },
  {
    route: "/case/appleton-vehicle-transport-seo/",
    file: "case/appleton-vehicle-transport-seo/index.html",
    required: [
      "Appleton Vehicle Transport SEO Case Study",
      "/logistics/appleton-wi-vehicle-transport/",
      "/logistics/resources/auction-vehicle-pickup-checklist/",
      "/logistics/resources/car-hauler-capacity-checklist/",
      "Measurement in progress",
      "CreativeWork",
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

const sitemap = await readFile(join(dist, "sitemap-cases.xml"), "utf8");
for (const page of routes) {
  assert.ok(sitemap.includes(`https://hermeslogisticsus.com${page.route}`), `${page.route} must be in sitemap-cases.xml`);
}

console.log("Case studies growth checks passed.");
