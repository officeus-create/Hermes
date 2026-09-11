import assert from "node:assert/strict";
import { classifyUrl, extractUrls, readLocalSitemapUrls } from "./gsc-indexing-triage.mjs";

const sitemaps = await readLocalSitemapUrls();
assert.ok(sitemaps.has("https://hermeslogisticsus.com/es/"), "Spanish public owner must be in current sitemaps");
assert.ok(sitemaps.has("https://hermeslogisticsus.com/gb/london/marketing/"), "London marketing owner must be in current sitemaps");
assert.ok(sitemaps.has("https://hermeslogisticsus.com/gb/london/academy/us-logistics-course/"), "Current London Academy course must be in sitemap");

const current = classifyUrl("https://hermeslogisticsus.com/es/", sitemaps);
assert.equal(current.category, "CURRENT_CANONICAL_REVIEW");

const utm = classifyUrl("https://hermeslogisticsus.com/gb/london/marketing/?utm_source=test&utm_medium=qa", sitemaps);
assert.equal(utm.category, "EXPECTED_EXCLUSION_TRACKING");
assert.equal(utm.normalized, "https://hermeslogisticsus.com/gb/london/marketing/");

const dashboard = classifyUrl("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/dashboard/", sitemaps);
assert.equal(dashboard.category, "EXPECTED_EXCLUSION_PRIVATE");

const legacy = classifyUrl("https://hermeslogisticsus.com/uk/london/", sitemaps);
assert.equal(legacy.category, "REDIRECT_OR_REMOVE_LEGACY");
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
