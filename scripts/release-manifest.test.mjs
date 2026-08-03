import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const manifestPath = join(root, "docs/release-manifest-2026-08-01.json");
const publicDir = join(root, "public");
const expectedFields = [
  "route",
  "indexability",
  "sitemap_owner",
  "source_file",
  "production_presence",
  "current_presence",
  "status",
  "reason_code",
];
const expectedSitemaps = [
  "sitemap.xml",
  "sitemap-local.xml",
  "sitemap-services.xml",
  "sitemap-digital-services.xml",
  "sitemap-academy.xml",
  "sitemap-cases.xml",
  "sitemap-trust.xml",
];
const expectedStatusCounts = { STALE: 82, MISSING: 19, COMPLETE: 3 };
const expectedReasonCodes = new Set([
  "STALE_ROUTE_AND_SHARED",
  "STALE_SHARED_RENDER",
  "MISSING_INDEXABLE",
  "MISSING_NOINDEX",
  "UNCHANGED_STATIC_NOINDEX",
]);

const fail = (message) => {
  throw new Error(`Release manifest contract failed: ${message}`);
};

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.schema_version !== 1) fail("schema_version must be 1");
if (manifest.repository !== "officeus-create/Hermes") fail("repository identifier changed");
if (manifest.decision !== "FULL_CURRENT_MAIN_DEPLOY_REQUIRED") fail("release decision changed without manifest review");
if (JSON.stringify(manifest.field_order) !== JSON.stringify(expectedFields)) fail("field order changed");
if (!Array.isArray(manifest.records) || manifest.records.length !== 104) fail(`expected 104 route records, found ${manifest.records?.length ?? 0}`);
if (manifest.production.commit !== "79ab8a477042802881bc308ce69ebf8b9c9e979d") fail("production baseline commit changed");
if (manifest.production.generated_html !== 85 || manifest.production.indexable_routes !== 80 || manifest.production.sitemap_files !== 5) fail("production baseline counts changed");
if (manifest.current_main.generated_html !== 104 || manifest.current_main.indexable_routes !== 95 || manifest.current_main.sitemap_files !== 7) fail("current-main counts changed");

const records = manifest.records.map((values, index) => {
  if (!Array.isArray(values) || values.length !== expectedFields.length) fail(`record ${index + 1} has the wrong field count`);
  return Object.fromEntries(expectedFields.map((field, fieldIndex) => [field, values[fieldIndex]]));
});

const routes = records.map((record) => record.route);
if (new Set(routes).size !== routes.length) fail("duplicate route records found");

const statusCounts = records.reduce((counts, record) => {
  counts[record.status] = (counts[record.status] ?? 0) + 1;
  return counts;
}, {});
if (JSON.stringify(statusCounts) !== JSON.stringify(expectedStatusCounts)) fail(`status counts changed: ${JSON.stringify(statusCounts)}`);
if (JSON.stringify(manifest.status_counts) !== JSON.stringify(expectedStatusCounts)) fail("declared status_counts do not match the contract");

const indexabilityCounts = records.reduce((counts, record) => {
  counts[record.indexability] = (counts[record.indexability] ?? 0) + 1;
  return counts;
}, {});
if (indexabilityCounts.indexable !== 95 || indexabilityCounts.noindex !== 8 || indexabilityCounts["system-noindex"] !== 1) fail(`indexability counts changed: ${JSON.stringify(indexabilityCounts)}`);

for (const [index, record] of records.entries()) {
  if (!record.route.startsWith("/")) fail(`record ${index + 1} route is not absolute`);
  if (record.current_presence !== "present") fail(`${record.route} is not marked present in current main`);
  if (!expectedReasonCodes.has(record.reason_code)) fail(`${record.route} has unknown reason code ${record.reason_code}`);
  if (record.status === "MISSING" && record.production_presence !== "absent") fail(`${record.route} is MISSING but production_presence is not absent`);
  if (record.status !== "MISSING" && record.production_presence !== "present") fail(`${record.route} is ${record.status} but production_presence is not present`);
  if (record.indexability === "indexable" && !record.sitemap_owner) fail(`${record.route} is indexable without a sitemap owner`);
  if (record.indexability !== "indexable" && record.sitemap_owner !== null) fail(`${record.route} is noindex but has a sitemap owner`);
  await access(join(root, record.source_file));
}

const robots = await readFile(join(publicDir, "robots.txt"), "utf8");
const sitemapDeclarationPattern = /^Sitemap:\s+https:\/\/hermeslogisticsus\.com\/(sitemap(?:-[^\s]+)?\.xml)$/gim;
const declaredSitemaps = [...robots.matchAll(sitemapDeclarationPattern)].map((match) => match[1]);
if (JSON.stringify(declaredSitemaps) !== JSON.stringify(expectedSitemaps)) fail(`robots.txt sitemap declarations changed: ${JSON.stringify(declaredSitemaps)}`);

const ownerByRoute = new Map();
for (const sitemapFile of expectedSitemaps) {
  const xml = await readFile(join(publicDir, sitemapFile), "utf8");
  const urls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => new URL(match[1].trim()).pathname);
  if (new Set(urls).size !== urls.length) fail(`${sitemapFile} contains duplicate URLs`);
  for (const route of urls) {
    if (ownerByRoute.has(route)) fail(`${route} appears in both ${ownerByRoute.get(route)} and ${sitemapFile}`);
    ownerByRoute.set(route, sitemapFile);
  }
}

if (ownerByRoute.size !== 95) fail(`expected 95 unique sitemap URLs, found ${ownerByRoute.size}`);
const indexableRecords = records.filter((record) => record.indexability === "indexable");
for (const record of indexableRecords) {
  if (ownerByRoute.get(record.route) !== record.sitemap_owner) fail(`${record.route} sitemap owner mismatch: manifest=${record.sitemap_owner}, files=${ownerByRoute.get(record.route) ?? "missing"}`);
}
for (const [route, owner] of ownerByRoute) {
  const record = records.find((candidate) => candidate.route === route);
  if (!record) fail(`${route} exists in ${owner} without a manifest record`);
  if (record.indexability !== "indexable") fail(`${route} exists in ${owner} but is not marked indexable`);
}

const missingIndexable = records.filter((record) => record.reason_code === "MISSING_INDEXABLE");
const missingNoindex = records.filter((record) => record.reason_code === "MISSING_NOINDEX");
if (missingIndexable.length !== 15 || missingNoindex.length !== 4) fail(`missing-route split changed: indexable=${missingIndexable.length}, noindex=${missingNoindex.length}`);

console.log("Release manifest contract passed: 104 routes, 95 indexable URLs, 7 sitemap owners, 19 missing, 82 stale, and 3 complete records.");
