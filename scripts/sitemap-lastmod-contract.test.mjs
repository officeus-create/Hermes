import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = "https://hermeslogisticsus.com/";

function assertDate(value, label) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, `${label}: YYYY-MM-DD lastmod required`);
  const parsed = new Date(`${value}T00:00:00Z`);
  assert.ok(Number.isFinite(parsed.getTime()), `${label}: invalid lastmod`);
  assert.equal(parsed.toISOString().slice(0, 10), value, `${label}: invalid calendar date`);
}

function findEntry(xml, tag, loc, file) {
  const entries = [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))];
  const matches = entries.filter((entry) => entry[1].includes(`<loc>${loc}</loc>`));
  assert.equal(matches.length, 1, `${file}: exactly one canonical entry required for ${loc}`);
  return matches[0][1];
}

function entryLastmod(entry, label) {
  const dates = [...entry.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)];
  assert.equal(dates.length, 1, `${label}: exactly one lastmod required`);
  assertDate(dates[0][1], label);
  return dates[0][1];
}

// Dated release evidence, never the build clock.
const knownUpdates = [
  ["sitemap.xml", "company-information/", "2026-09-22", "url"],
  ["sitemap-digital-services.xml", "services/hermes-connect/repair-shops/", "2026-09-12", "url"],
  ["sitemap-digital-services.xml", "services/seo-for-auto-repair-shops/", "2026-09-13", "url"],
  ["sitemap-digital-services.xml", "services/auto-repair-website-design/", "2026-09-13", "url"],
  ["sitemapindex.xml", "sitemap.xml", "2026-09-22", "sitemap"],
  ["sitemapindex.xml", "sitemap-services.xml", "2026-09-15", "sitemap"],
  ["sitemapindex.xml", "sitemap-digital-services.xml", "2026-09-13", "sitemap"],
  ["sitemapindex.xml", "sitemap-academy.xml", "2026-09-16", "sitemap"],
  ["sitemap-insights.xml", "insights/logistics/dry-van-spot-rates-september-2026/", "2026-09-14", "url"],
  ["sitemapindex.xml", "sitemap-insights.xml", "2026-09-14", "sitemap"],
  ["sitemapindex.xml", "sitemap-business-directory.xml", "2026-09-10", "sitemap"],
];

for (const [file, path, minimum, tag] of knownUpdates) {
  const xml = await readFile(new URL(`../public/${file}`, import.meta.url), "utf8");
  const loc = `${origin}${path}`;
  const lastmod = entryLastmod(findEntry(xml, tag, loc, file), loc);
  assert.ok(lastmod >= minimum, `${loc}: lastmod predates verified update ${minimum}`);
}

// Parent sitemap-index freshness must never lag the newest URL lastmod inside
// static sitemap children. sitemap-connect-catalog.xml remains excluded because
// it is generated dynamically at runtime.
const seoOwnedChildren = [
  "sitemap.xml",
  "sitemap-local.xml",
  "sitemap-services.xml",
  "sitemap-digital-services.xml",
  "sitemap-academy.xml",
  "sitemap-cases.xml",
  "sitemap-trust.xml",
  "sitemap-london.xml",
  "sitemap-business-directory.xml",
  "sitemap-insights.xml",
];

const sitemapIndex = await readFile(new URL("../public/sitemapindex.xml", import.meta.url), "utf8");
let parityChecks = 0;
for (const child of seoOwnedChildren) {
  const childXml = await readFile(new URL(`../public/${child}`, import.meta.url), "utf8");
  const childDates = [...childXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  if (childDates.length === 0) continue;
  childDates.forEach((date) => assertDate(date, `${child} child URL`));
  const newestChild = childDates.sort().at(-1);
  const childLoc = `${origin}${child}`;
  const parentLastmod = entryLastmod(findEntry(sitemapIndex, "sitemap", childLoc, "sitemapindex.xml"), childLoc);
  assert.ok(
    parentLastmod >= newestChild,
    `${childLoc}: sitemapindex lastmod ${parentLastmod} lags newest child URL lastmod ${newestChild}`,
  );
  parityChecks += 1;
}

console.log(`Sitemap lastmod contract passed: ${knownUpdates.length} evidence boundaries + ${parityChecks} parent/child freshness checks.`);
