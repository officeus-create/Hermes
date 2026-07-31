import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const careersPath = join(root, "dist", "careers", "index.html");
const logisticsCareersPath = join(root, "dist", "logistics", "careers", "index.html");
const sitemapPath = join(root, "dist", "sitemap.xml");

const [careersHtml, logisticsCareersHtml, sitemap] = await Promise.all([
  readFile(careersPath, "utf8"),
  readFile(logisticsCareersPath, "utf8"),
  readFile(sitemapPath, "utf8"),
]);

const visibleText = careersHtml
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&#39;", "'")
  .replaceAll("&quot;", '"')
  .replace(/\s+/g, " ")
  .trim();

const requiredVisibleSignals = [
  "Careers at Hermes",
  "International Sales Manager — Websites & SEO for the U.S. market",
  "English, Russian, or Ukrainian",
  "does not guarantee an interview, training place, contract, or employment",
  "does not promise hiring, earnings, client volume, or a specific start date",
];

for (const signal of requiredVisibleSignals) {
  if (!visibleText.includes(signal)) throw new Error(`Careers page regression: missing visible text ${signal}`);
}

for (const signal of [
  "mailto:officeus@hermeslogisticsus.com",
  'name="robots" content="index,follow,max-image-preview:large"',
  '<link rel="canonical" href="https://hermeslogisticsus.com/careers/"',
  'type="application/ld+json"',
]) {
  if (!careersHtml.includes(signal)) throw new Error(`Careers page regression: missing markup ${signal}`);
}

if (!logisticsCareersHtml.includes('href="/careers/#international-sales-manager"')) {
  throw new Error("Logistics careers page does not link to the central priority vacancy");
}
if (!logisticsCareersHtml.includes("Start job application")) {
  throw new Error("Logistics careers page lost the established job-application label");
}
if (!sitemap.includes("https://hermeslogisticsus.com/careers/")) {
  throw new Error("Central Careers URL is missing from the generated sitemap");
}
if (/<form\b[^>]*action=/i.test(careersHtml)) {
  throw new Error("Careers page contains an unreviewed external form action");
}

const jsonLdBlocks = [...careersHtml.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
if (jsonLdBlocks.length === 0) throw new Error("Careers page structured data is missing");
for (const block of jsonLdBlocks) JSON.parse(block[1]);

console.log("Careers page regression checks passed: content, safety boundaries, canonical, schema, internal route, and sitemap coverage are present.");
