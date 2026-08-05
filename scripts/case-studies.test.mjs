import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const readBuilt = (path) => readFile(join(dist, path), "utf8");

const [hub, appletonCase, sitemap, primarySitemap, robots, homepage] = await Promise.all([
  readBuilt("case/index.html"),
  readBuilt("case/appleton-vehicle-transport-seo/index.html"),
  readBuilt("sitemap-cases.xml"),
  readBuilt("sitemap.xml"),
  readBuilt("robots.txt"),
  readBuilt("index.html"),
]);

const canonicalFrom = (html) =>
  html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
  ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1]
  ?? "";
const titleFrom = (html) => html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
const descriptionFrom = (html) =>
  html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]
  ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)?.[1]
  ?? "";
const h1Count = (html) => [...html.matchAll(/<h1\b/gi)].length;

assert.equal(canonicalFrom(hub), "https://hermeslogisticsus.com/case/");
assert.equal(canonicalFrom(appletonCase), "https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/");
assert.match(titleFrom(hub), /Hermes Case Studies/i);
assert.match(titleFrom(appletonCase), /Appleton Vehicle Transport SEO Case Study/i);
assert.ok(descriptionFrom(hub).length >= 70);
assert.ok(descriptionFrom(appletonCase).length >= 70);
assert.equal(h1Count(hub), 1);
assert.equal(h1Count(appletonCase), 1);

for (const required of [
  '"@type":"CollectionPage"',
  '"@type":"BreadcrumbList"',
  "/case/it-development/",
  "/case/appleton-vehicle-transport-seo/",
  "Case studies built from released work, not promises.",
]) assert.ok(hub.includes(required), `case hub is missing: ${required}`);

for (const required of [
  '"@type":"CreativeWork"',
  '"@type":"BreadcrumbList"',
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/resources/auction-vehicle-pickup-checklist/",
  "/logistics/resources/car-hauler-capacity-checklist/",
  "/paths/marketing/?service=logistics_seo#contact",
  'data-service-group="logistics_seo"',
  "Start a logistics SEO review",
  "Measurement in progress",
  "No public metric yet",
]) assert.ok(appletonCase.includes(required), `Appleton case is missing: ${required}`);

assert.match(
  appletonCase,
  /\bdata-seo-service-cta(?:="")?\b/,
  "Appleton case must expose the established SEO service CTA contract",
);
assert.ok(!appletonCase.includes('href="/contacts/">Discuss an SEO or logistics project'), "Appleton SEO case must not end in the generic contacts route");

for (const prohibited of ["guaranteed rankings", "guaranteed leads", "ranks #1", "capacity is available now"]) {
  assert.ok(!appletonCase.toLowerCase().includes(prohibited), `Appleton case contains prohibited claim: ${prohibited}`);
}

for (const url of [
  "https://hermeslogisticsus.com/case/",
  "https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/",
]) {
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `case sitemap is missing ${url}`);
  assert.ok(!primarySitemap.includes(`<loc>${url}</loc>`), `${url} has duplicate sitemap ownership`);
}
assert.ok(primarySitemap.includes("<loc>https://hermeslogisticsus.com/case/it-development/</loc>"));
assert.ok(robots.includes("Sitemap: https://hermeslogisticsus.com/sitemap-cases.xml"));
assert.ok(homepage.includes('href="/case/"'), "English footer must link to the case hub");

console.log("Case studies release checks passed: hub, Appleton case, direct SEO intake, schema, links, claims, unique sitemap ownership, and crawl path.");
