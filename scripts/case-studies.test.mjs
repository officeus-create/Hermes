import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");

const readBuilt = (path) => readFile(join(dist, path), "utf8");

const [hub, appletonCase, sitemap, robots] = await Promise.all([
  readBuilt("case/index.html"),
  readBuilt("case/appleton-vehicle-transport-seo/index.html"),
  readBuilt("sitemap-cases.xml"),
  readBuilt("robots.txt"),
]);

const canonicalFrom = (html) =>
  html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ??
  html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1] ??
  "";

const titleFrom = (html) => html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
const descriptionFrom = (html) =>
  html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1] ??
  html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)?.[1] ??
  "";
const h1Count = (html) => [...html.matchAll(/<h1\b/gi)].length;

assert.equal(canonicalFrom(hub), "https://hermeslogisticsus.com/case/", "case hub canonical must be self-referencing");
assert.equal(
  canonicalFrom(appletonCase),
  "https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/",
  "Appleton case canonical must be self-referencing",
);

assert.match(titleFrom(hub), /Hermes Case Studies/i, "case hub needs a focused title");
assert.match(titleFrom(appletonCase), /Appleton Vehicle Transport SEO Case Study/i, "Appleton case needs a focused title");
assert.ok(descriptionFrom(hub).length >= 70, "case hub needs a substantive meta description");
assert.ok(descriptionFrom(appletonCase).length >= 70, "Appleton case needs a substantive meta description");
assert.equal(h1Count(hub), 1, "case hub must render exactly one H1");
assert.equal(h1Count(appletonCase), 1, "Appleton case must render exactly one H1");

for (const required of [
  '"@type":"CollectionPage"',
  '"@type":"BreadcrumbList"',
  "/case/it-development/",
  "/case/appleton-vehicle-transport-seo/",
  "Case studies built from released work, not promises.",
]) {
  assert.ok(hub.includes(required), `case hub is missing required output: ${required}`);
}

for (const required of [
  '"@type":"CreativeWork"',
  '"@type":"BreadcrumbList"',
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/resources/auction-vehicle-pickup-checklist/",
  "/logistics/resources/car-hauler-capacity-checklist/",
  "Measurement in progress",
  "No public metric yet",
]) {
  assert.ok(appletonCase.includes(required), `Appleton case is missing required output: ${required}`);
}

for (const prohibited of [
  "guaranteed rankings",
  "guaranteed leads",
  "ranks #1",
  "capacity is available now",
]) {
  assert.ok(!appletonCase.toLowerCase().includes(prohibited), `Appleton case contains prohibited claim: ${prohibited}`);
}

for (const url of [
  "https://hermeslogisticsus.com/case/",
  "https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/",
]) {
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `case sitemap is missing ${url}`);
}

assert.ok(
  robots.includes("Sitemap: https://hermeslogisticsus.com/sitemap-cases.xml"),
  "robots.txt must expose the case studies sitemap",
);

console.log("Case studies release checks passed: hub, Appleton case, schema, links, claims, sitemap, and robots discovery.");
