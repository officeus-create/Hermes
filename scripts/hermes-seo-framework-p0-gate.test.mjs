import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const canonicalOrigin = "https://hermeslogisticsus.com";
const errors = [];
const warnings = [];

const commercialPages = [
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/dealer-vehicle-transportation/",
  "/logistics/car-hauling-dispatch/",
  "/logistics/auction-vehicle-pickup/",
  "/services/seo-for-logistics-companies/",
  "/services/seo-for-independent-auto-dealers/",
  "/services/seo/",
  "/services/local-seo/",
  "/services/website-development/",
  "/services/website-redesign/",
];

const hardMinimumWords = 70;
const reviewMinimumWords = 140;
const commercialMinimumWords = 220;
const routeMinimumWords = new Map([
  ["/", 50], // Approved four-direction homepage is intentionally concise and separately protected by homepage contracts.
]);

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&apos;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

const stripNonContent = (html) => html
  .replace(/<!--([\s\S]*?)-->/g, " ")
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
  .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");

const visibleText = (html) => decode(stripNonContent(html).replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ")
  .trim();

const mainHtml = (html) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
const wordCount = (text) => text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu)?.length ?? 0;
const normalizeForFingerprint = (text) => text
  .toLocaleLowerCase("en-US")
  .replace(/\b(?:august|july|june|may|april|march|february|january|september|october|november|december)\s+\d{1,2},?\s+20\d{2}\b/gi, " ")
  .replace(/\b20\d{2}\b/g, " ")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

const fingerprint = (text) => createHash("sha256").update(normalizeForFingerprint(text)).digest("hex");
const tagCount = (html, tagName) => (html.match(new RegExp(`<${tagName}\\b`, "gi")) ?? []).length;
const hasJsonLd = (html) => /<script\b[^>]*type=["']application\/ld\+json["']/i.test(html);
const hasForm = (html) => /<form\b/i.test(html);

const hasCommercialCta = (html) => {
  if (hasForm(html)) return true;

  const actionableHref = /href=["'](?:\/[^"']*(?:contact|quote|estimate|request|apply|audit|consult|book|schedule)|mailto:|tel:)/i;
  if (actionableHref.test(html)) return true;

  const controls = [...html.matchAll(/<(?:a|button)\b[^>]*>([\s\S]*?)<\/(?:a|button)>/gi)]
    .map((match) => visibleText(match[1]).toLocaleLowerCase("en-US"));
  return controls.some((text) => /\b(?:get started|request|quote|estimate|contact|book|schedule|apply|audit|consult|talk|start)\b/i.test(text));
};

const htmlPathFromUrl = (url) => {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return "index.html";
  if (pathname.endsWith("/")) return `${pathname.slice(1)}index.html`;
  if (pathname.endsWith(".html")) return pathname.slice(1);
  return `${pathname.slice(1)}/index.html`;
};

const sitemapEntries = (await readdir(dist, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort();

if (!sitemapEntries.length) {
  throw new Error("Hermes SEO Framework P0 gate cannot run: no sitemap XML files were generated.");
}

const sitemapUrls = [];
for (const sitemapFile of sitemapEntries) {
  const xml = await readFile(join(dist, sitemapFile), "utf8");
  for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
    sitemapUrls.push(decode(match[1]).trim());
  }
}

const canonicalUrls = [...new Set(sitemapUrls)];
const pages = [];
const fingerprints = new Map();

for (const url of canonicalUrls) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    errors.push(`${url}: sitemap entry is not a valid absolute URL`);
    continue;
  }

  if (parsed.origin !== canonicalOrigin) {
    errors.push(`${parsed.pathname}: sitemap owner is not ${canonicalOrigin}`);
    continue;
  }

  const route = parsed.pathname;
  const path = htmlPathFromUrl(url);
  let html;
  try {
    html = await readFile(join(dist, path), "utf8");
  } catch {
    errors.push(`${route}: sitemap URL has no generated HTML at ${path}`);
    continue;
  }

  const contentHtml = mainHtml(html);
  const text = visibleText(contentHtml);
  const words = wordCount(text);
  const h1s = tagCount(contentHtml, "h1");
  const h2s = tagCount(contentHtml, "h2");
  const normalized = normalizeForFingerprint(text);
  const routeHardMinimumWords = routeMinimumWords.get(route) ?? hardMinimumWords;

  if (words < routeHardMinimumWords) {
    errors.push(`${route}: only ${words} visible main-content words; this route requires at least ${routeHardMinimumWords}`);
  } else if (route !== "/" && words < reviewMinimumWords) {
    warnings.push(`${route}: ${words} visible main-content words; review for thin or low-value content before expanding this cluster`);
  }

  if (h1s !== 1) {
    errors.push(`${route}: expected exactly one H1 inside the primary content, found ${h1s}`);
  }

  if (words >= 220 && h2s === 0) {
    warnings.push(`${route}: ${words} words but no H2 in the primary content; review scannability and intent coverage`);
  }

  if (normalized.length >= 240) {
    const hash = fingerprint(text);
    const owners = fingerprints.get(hash) ?? [];
    owners.push(route);
    fingerprints.set(hash, owners);
  }

  pages.push({ route, html, words, h2s });
}

for (const [hash, owners] of fingerprints) {
  if (owners.length > 1) {
    errors.push(`${owners.join(", ")}: duplicate normalized main content fingerprint ${hash.slice(0, 12)}; consolidate or make the pages materially distinct`);
  }
}

const pageByRoute = new Map(pages.map((page) => [page.route, page]));
for (const route of commercialPages) {
  const page = pageByRoute.get(route);
  if (!page) {
    errors.push(`${route}: priority commercial URL is missing from the canonical sitemap set`);
    continue;
  }

  if (page.words < commercialMinimumWords) {
    errors.push(`${route}: priority commercial page has ${page.words} visible words; expected at least ${commercialMinimumWords}`);
  }

  if (page.h2s < 2) {
    errors.push(`${route}: priority commercial page needs at least two H2 sections to cover decision intent; found ${page.h2s}`);
  }

  if (!hasCommercialCta(page.html)) {
    errors.push(`${route}: priority commercial page has no detectable inquiry/action path`);
  }

  if (!hasJsonLd(page.html)) {
    errors.push(`${route}: priority commercial page has no JSON-LD structured data`);
  }
}

for (const warning of warnings) console.warn(`Hermes SEO Framework warning — ${warning}`);

if (errors.length) {
  throw new Error(
    `Hermes SEO Framework P0 gate failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`,
  );
}

console.log(
  `Hermes SEO Framework P0 gate passed: ${canonicalUrls.length} canonical sitemap URL(s), ${commercialPages.length} priority commercial page(s), ${warnings.length} review warning(s).`,
);
