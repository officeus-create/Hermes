import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyUrl, extractUrls, readLocalSitemapUrls } from "./gsc-indexing-triage.mjs";
import { onRequest } from "../functions/_middleware.js";

const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");
const middleware = await readFile(new URL("../functions/_middleware.js", import.meta.url), "utf8");
const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
assert.match(redirects, /^\/academy\/ \/paths\/academy\/ 301$/m, "retired /academy/ hub must redirect to canonical Academy direction");
assert.match(redirects, /^\/logistics\/ \/paths\/logistics\/ 301$/m, "/logistics/ parent of every carrier page must reach the canonical Logistics direction, not 404");
for (const [legacy, canonical] of [
  ["/resources/rpm-calculator/", "/logistics/resources/rpm-calculator/"],
  ["/tools/load-analyzer/", "/services/hermes-connect/load-analyzer/"],
  ["/ai-command-center/", "/services/hermes-connect/command-center/"],
  ["/unified-inbox/", "/services/hermes-connect/unified-inbox/"],
]) {
  assert.ok(redirects.includes(`${legacy} ${canonical} 301`), `retired public owner must redirect: ${legacy}`);
}
for (const slug of ["logistics", "marketing", "technology", "academy"]) {
  assert.ok(redirects.includes(`/ru/paths/${slug}/ /ru/${slug}/ 301`), `removed RU direction hub must redirect: /ru/paths/${slug}/`);
}
for (const gone of ["/dashboard", "/month", "/месяц", "/ rel=nofollow", "/\\uFFFC"]) {
  assert.ok(middleware.includes(`"${gone}"`), `stale crawl artifact must be explicitly retired: ${gone}`);
}
assert.match(middleware, /status:\s*410/);
assert.match(middleware, /"X-Robots-Tag": "noindex, nofollow"/);
assert.match(robots, /^Disallow: \/cdn-cgi\/$/m, "Cloudflare-managed /cdn-cgi/ crawl artifacts must be blocked in robots.txt");

const malformedRootResponse = await onRequest[0]({
  request: new Request("https://hermeslogisticsus.com/%EF%BF%BC"),
  next: () => new Response("unexpected", { status: 200 }),
  env: {},
});
assert.equal(malformedRootResponse.status, 410, "historical malformed root URL must be permanently retired");
assert.equal(malformedRootResponse.headers.get("x-robots-tag"), "noindex, nofollow");


const sitemaps = await readLocalSitemapUrls();
assert.ok(sitemaps.has("https://hermeslogisticsus.com/es/"), "Spanish public owner must be in current sitemaps");
assert.ok(sitemaps.has("https://hermeslogisticsus.com/gb/london/marketing/"), "London marketing owner must be in current sitemaps");
assert.ok(sitemaps.has("https://hermeslogisticsus.com/gb/london/academy/us-logistics-course/"), "Current London Academy course must be in sitemap");
assert.ok(sitemaps.has("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/plan/"), "Public repair-shop pricing owner must be in current sitemaps");

const current = classifyUrl("https://hermeslogisticsus.com/es/", sitemaps);
assert.equal(current.category, "CURRENT_CANONICAL_REVIEW");

const utm = classifyUrl("https://hermeslogisticsus.com/gb/london/marketing/?utm_source=test&utm_medium=qa", sitemaps);
assert.equal(utm.category, "EXPECTED_EXCLUSION_TRACKING");
assert.equal(utm.normalized, "https://hermeslogisticsus.com/gb/london/marketing/");

const dashboard = classifyUrl("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/dashboard/", sitemaps);
assert.equal(dashboard.category, "EXPECTED_EXCLUSION_PRIVATE");

const repairShopPlan = classifyUrl("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/plan/", sitemaps);
assert.equal(repairShopPlan.category, "CURRENT_CANONICAL_REVIEW", "Public pricing page must not be mislabeled as a private route");

const legacy = classifyUrl("https://hermeslogisticsus.com/uk/london/", sitemaps);
assert.equal(legacy.category, "REDIRECT_OR_REMOVE_LEGACY");
const academyLegacyHub = classifyUrl("https://hermeslogisticsus.com/academy/", sitemaps);
assert.equal(academyLegacyHub.category, "REDIRECT_OR_REMOVE_LEGACY");
const slashVariant = classifyUrl("https://hermeslogisticsus.com/es", sitemaps);
assert.equal(slashVariant.category, "EXPECTED_EXCLUSION_CANONICAL_VARIANT");
assert.equal(slashVariant.normalized, "https://hermeslogisticsus.com/es/");

for (const tool of ["roi-calculator", "proposal-builder", "unified-inbox", "rate-negotiator"]) {
  const url = `https://hermeslogisticsus.com/services/hermes-connect/${tool}/?lang=es`;
  const classified = classifyUrl(url, sitemaps);
  assert.equal(classified.category, "EXPECTED_EXCLUSION_NOINDEX_REFERENCE", "Retired public reference tool remains noindex: " + url);
  assert.equal(sitemaps.has(classified.normalized), false, "Reference capability must not be added to search sitemap");
}

const unknown = classifyUrl("https://hermeslogisticsus.com/gb/london/academy/old-program/", sitemaps);
assert.equal(unknown.category, "MANUAL_REVIEW");

const extracted = extractUrls([
  "URL,Reason",
  '"https://hermeslogisticsus.com/es/","Discovered - currently not indexed"',
  "/gb/london/marketing/,Discovered - currently not indexed",
].join("\n"));
assert.deepEqual(extracted.sort(), [
  "https://hermeslogisticsus.com/es/",
  "https://hermeslogisticsus.com/gb/london/marketing/",
].sort());


/* 2026-11-02 owner GSC alternate-canonical drilldown export regression:
   the quoted first column can contain internal commas and embedded newlines.
   Preserve the entire URL; Google correctly excludes the query variants. */
const exported = [
  "URL,Последнее сканирование",
  '"https://hermeslogisticsus.com/load-board/?role=carrier&area=Green Bay, WI",2026-08-11',
  '"https://hermeslogisticsus.com/load-board/?role=private_party&origin=Eau \nClaire, WI",2026-08-10',
  '"https://hermeslogisticsus.com/academy/apply/?program=us-logistics-operations&utm_source=london&utm_medium=organic",2026-09-04',
  'https://hermeslogisticsus.com/paths/marketing/?service=seo,2026-10-16',
  'https://hermeslogisticsus.com/paths/marketing/?service=seo,2026-10-16',
].join("\r\n");
const exportedUrls = extractUrls("\uFEFF" + exported);
assert.equal(exportedUrls.length, 4, "Quoted, multiline and duplicate GSC CSV rows must be read exactly once");
assert.ok(exportedUrls.includes("https://hermeslogisticsus.com/load-board/?role=carrier&area=Green Bay, WI"));
assert.ok(exportedUrls.includes("https://hermeslogisticsus.com/load-board/?role=private_party&origin=Eau \nClaire, WI"));
for (const url of exportedUrls) {
  const result = classifyUrl(url, sitemaps);
  assert.equal(result.category, "EXPECTED_EXCLUSION_CANONICAL_VARIANT", "GSC query variants are not indexable owners: " + url);
  assert.ok(sitemaps.has(result.normalized), "GSC variant must resolve to a current canonical sitemap owner");
}
assert.equal(extractUrls("Дата,Затронутые страницы\n2026-10-23,61").length, 0, "GSC chart data is not a list of URLs");

console.log(`GSC indexing triage contract passed with ${sitemaps.size} current sitemap URL(s).`);

assert.match(redirects, /^\/paths\/logistics\/broker-capacity\/ \/paths\/logistics\/brokers\/carrier-capacity\/ 301$/m, "retired broker-capacity path must redirect to the current broker carrier-capacity owner");
