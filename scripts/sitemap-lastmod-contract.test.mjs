import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Dated release evidence, not the build clock: Company #1260 and Repair #1259.
// Index lastmod describes the child XML revision, not a page or a deployment.
const knownUpdates = [
  ["sitemap.xml", "company-information/", "2026-09-12", "url"],
  ["sitemap-digital-services.xml", "services/hermes-connect/repair-shops/", "2026-09-12", "url"],
  ["sitemap-digital-services.xml", "services/seo-for-auto-repair-shops/", "2026-09-13", "url"],
  ["sitemap-digital-services.xml", "services/auto-repair-website-design/", "2026-09-13", "url"],
  ["sitemapindex.xml", "sitemap.xml", "2026-09-13", "sitemap"],
  ["sitemapindex.xml", "sitemap-digital-services.xml", "2026-09-13", "sitemap"],
  // b5016ed0 published the existing Carrier GEO entries on September 8.
  ["sitemapindex.xml", "sitemap-services.xml", "2026-09-08", "sitemap"],
  ["sitemap-insights.xml", "insights/logistics/dry-van-spot-rates-september-2026/", "2026-09-14", "url"],
  ["sitemapindex.xml", "sitemap-insights.xml", "2026-09-14", "sitemap"],
];
for (const [file, path, minimum, tag] of knownUpdates) {
  const xml = await readFile(new URL(`../public/${file}`, import.meta.url), "utf8");
  const entries = [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))];
  const loc = `https://hermeslogisticsus.com/${path}`;
  const matches = entries.filter((entry) => entry[1].includes(`<loc>${loc}</loc>`));
  assert.equal(matches.length, 1, `${file}: exactly one canonical entry required for ${loc}`);
  const dates = [...matches[0][1].matchAll(/<lastmod>([^<]+)<\/lastmod>/g)];
  assert.equal(dates.length, 1, `${loc}: exactly one lastmod required`);
  const lastmod = dates[0][1];
  assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/);
  const parsed = new Date(`${lastmod}T00:00:00Z`);
  assert.ok(Number.isFinite(parsed.getTime()), `${loc}: invalid lastmod`);
  assert.equal(parsed.toISOString().slice(0, 10), lastmod, `${loc}: invalid calendar date`);
  assert.ok(lastmod >= minimum, `${loc}: lastmod predates verified update ${minimum}`);
}
console.log(`Sitemap lastmod contract passed: ${knownUpdates.length} evidence-backed freshness boundaries.`);
