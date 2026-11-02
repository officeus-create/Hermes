import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const snapshot = JSON.parse(await readFile(new URL("data/seo/gsc-discovered-owner-snapshot-2026-11-02.json", root), "utf8"));
assert.equal(snapshot.schemaVersion, 1);
assert.equal(snapshot.observedExcludedUrls, 130);
assert.equal(snapshot.gscLastChartDate, "2026-10-23");
assert.equal(snapshot.originalArchive.originalSourceRows, 130);
assert.equal(snapshot.reviewPolicy.defaultDisposition, "PENDING_EVIDENCE");

const groups = Object.fromEntries(snapshot.groups.map((g) => [g.id, g]));
const expected = { london_localized: 39, car_hauler_markets: 24, business_catalog: 25, academy_countries: 12, logistics_resources: 8, insights: 6, other: 16 };
assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([id, group]) => [id, group.urls.length])), expected);

const urls = snapshot.groups.flatMap((group) => group.urls);
assert.equal(urls.length, 130);
assert.equal(new Set(urls).size, 130);
for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.protocol, "https:");
  assert.equal(parsed.hostname, "hermeslogisticsus.com");
  assert.equal(parsed.search, "", `Unexpected query variant: ${url}`);
  assert.equal(parsed.hash, "", `Unexpected URL fragment: ${url}`);
}

const directory = new URL("public/", root);
const sitemapNames = (await readdir(directory)).filter((name) => /^sitemap(?:-[a-z0-9-]+)?\.xml$/.test(name));
const staticOwners = new Set();
for (const name of sitemapNames) {
  const xml = await readFile(new URL(name, directory), "utf8");
  for (const match of xml.matchAll(/<loc>\s*(https:\/\/[^<]+)\s*<\/loc>/gi)) {
    staticOwners.add(match[1].replaceAll("&amp;", "&"));
  }
}
const nonStatic = urls.filter((url) => !staticOwners.has(url));
assert.deepEqual(nonStatic, [snapshot.sitemapEvidence.dynamicOwner], "New GSC owner without recorded static/dynamic sitemap route");
assert.equal(snapshot.sitemapEvidence.staticOwnersOnMain, 129);
assert.equal(snapshot.sitemapEvidence.liveDynamicOwners, 1);
assert.equal(snapshot.sitemapEvidence.totalOwnerPaths, 130);
assert.equal(snapshot.crawledNotIndexed.length, 3);
assert.equal(snapshot.crawledNotIndexed.filter((x) => x.disposition === "PENDING_GOOGLE_URL_INSPECTION").length, 2);
assert.equal(snapshot.crawledNotIndexed.filter((x) => x.disposition === "EXPECTED_NOINDEX").length, 1);
assert(snapshot.reviewPolicy.prohibitedAutomaticActions.includes("NOINDEX"));
assert(snapshot.reviewPolicy.prohibitedAutomaticActions.includes("DELETE"));
assert(snapshot.reviewPolicy.prohibitedAutomaticActions.includes("BULK_INDEXING_REQUEST"));
console.log("GSC Nov 2026 snapshot: 130 unique historical URLs, 129 static plus 1 recorded runtime sitemap owner, no auto-deindex actions.");
