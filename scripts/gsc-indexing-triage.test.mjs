import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyUrl, extractUrls, readLocalSitemapUrls } from "./gsc-indexing-triage.mjs";
import { onRequest } from "../functions/_middleware.js";

const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");
const middleware = await readFile(new URL("../functions/_middleware.js", import.meta.url), "utf8");
const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
assert.match(redirects, /^\/academy\/ \/paths\/academy\/ 301$/m, "retired /academy/ hub must redirect to canonical Academy direction");
for (const [legacy, canonical] of [
  ["/resources/rpm-calculator/", "/logistics/resources/rpm-calculator/"],
  ["/tools/load-analyzer/", "/services/hermes-connect/load-analyzer/"],
  ["/ai-command-center/", "/services/hermes-connect/ai-command-center/"],
  ["/unified-inbox/", "/services/hermes-connect/unified-inbox/"],
]) {
  assert.ok(redirects.includes(`${legacy} ${canonical} 301`), `retired public owner must redirect: ${legacy}`);
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

console.log(`GSC indexing triage contract passed with ${sitemaps.size} current sitemap URL(s).`);
