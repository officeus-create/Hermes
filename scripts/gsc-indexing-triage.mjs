import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://hermeslogisticsus.com";
const TRACKING_KEY = /^(utm_.+|gclid|dclid|fbclid|msclkid|_gl|gbraid|wbraid)$/i;
const PRIVATE_PATHS = [
  /^\/demos\//,
  /^\/services\/hermes-connect\/repair-shops\/(auth|dashboard|appointments|availability|booking|customers|vehicles|services|settings|plan|forgot-password|reset-password)(\/|$)/,
  /^\/services\/hermes-connect\/academy\/(auth|dashboard|lesson|program|progression|reviewer|submissions|support)(\/|$)/,
  /^\/services\/hermes-connect\/internal\//,
];
const LEGACY_PATHS = [/^\/uk\/london(\/|$)/];

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function ensureTrailingSlash(pathname) {
  if (pathname === "/" || pathname.endsWith("/") || path.extname(pathname)) return pathname;
  return `${pathname}/`;
}

function normalizedPublicUrl(raw) {
  const url = new URL(raw, SITE_ORIGIN);
  const pathname = ensureTrailingSlash(url.pathname.replace(/\/{2,}/g, "/"));
  return `${SITE_ORIGIN}${pathname}`;
}
async function readLocalSitemapUrls() {
  const indexPath = path.join(repoRoot, "public", "sitemapindex.xml");
  const indexXml = await fs.readFile(indexPath, "utf8");
  const childUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  const sitemapUrls = new Set();

  for (const sitemapUrl of childUrls) {
    const filename = new URL(sitemapUrl).pathname.split("/").filter(Boolean).pop();
    if (!filename) continue;
    const localPath = path.join(repoRoot, "public", filename);
    let xml;
    try {
      xml = await fs.readFile(localPath, "utf8");
    } catch {
      continue;
    }
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      sitemapUrls.add(normalizedPublicUrl(match[1].trim()));
    }
  }
  return sitemapUrls;
}

function extractUrls(text) {
  const urls = new Set();
  for (const match of text.matchAll(/https?:\/\/hermeslogisticsus\.com[^\s,"'<>]*/gi)) {
    urls.add(match[0].replace(/[)\]}]+$/g, ""));
  }
  for (const line of text.split(/\r?\n/)) {
    const first = line.split(/[\t,;]/)[0]?.trim().replace(/^"|"$/g, "");
    if (first?.startsWith("/")) urls.add(`${SITE_ORIGIN}${first}`);
  }
  return [...urls];
}
export function classifyUrl(raw, sitemapUrls) {
  let url;
  try {
    url = new URL(raw, SITE_ORIGIN);
  } catch {
    return { raw, category: "MANUAL_REVIEW", reason: "invalid_url", normalized: null };
  }

  if (url.hostname !== "hermeslogisticsus.com") {
    return { raw, category: "MANUAL_REVIEW", reason: "off_domain", normalized: url.href };
  }

  const cleanUrl = normalizedPublicUrl(url.href);
  const pathName = new URL(cleanUrl).pathname;
  const queryKeys = [...url.searchParams.keys()];
  const hasOnlyTracking = queryKeys.length > 0 && queryKeys.every((key) => TRACKING_KEY.test(key));
  const exactCleanInput = url.protocol === "https:" && !url.search && !url.hash && url.href === cleanUrl;

  if (PRIVATE_PATHS.some((pattern) => pattern.test(pathName))) {
    return { raw, category: "EXPECTED_EXCLUSION_PRIVATE", reason: "private_or_conversion_route", normalized: cleanUrl };
  }
  if (LEGACY_PATHS.some((pattern) => pattern.test(pathName))) {
    return { raw, category: "REDIRECT_OR_REMOVE_LEGACY", reason: "retired_route_family", normalized: cleanUrl };
  }
  if (hasOnlyTracking && sitemapUrls.has(cleanUrl)) {
    return { raw, category: "EXPECTED_EXCLUSION_TRACKING", reason: "tracking_variant_of_current_owner", normalized: cleanUrl };
  }
  if (sitemapUrls.has(cleanUrl) && exactCleanInput) {
    return { raw, category: "CURRENT_CANONICAL_REVIEW", reason: "current_sitemap_owner", normalized: cleanUrl };
  }
  if (sitemapUrls.has(cleanUrl)) {
    return { raw, category: "EXPECTED_EXCLUSION_CANONICAL_VARIANT", reason: "noncanonical_variant_of_current_owner", normalized: cleanUrl };
  }
  return { raw, category: "MANUAL_REVIEW", reason: "not_in_current_sitemaps", normalized: cleanUrl };
}
function summarize(rows) {
  const counts = {};
  for (const row of rows) counts[row.category] = (counts[row.category] || 0) + 1;
  return counts;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  const header = ["raw_url", "category", "reason", "normalized_owner"];
  const body = rows.map((row) => [row.raw, row.category, row.reason, row.normalized].map(csvEscape).join(","));
  return [header.join(","), ...body].join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args.find((arg) => !arg.startsWith("--"));
  const jsonMode = args.includes("--json");
  if (!inputPath) {
    console.error("Usage: node scripts/gsc-indexing-triage.mjs <gsc-export-or-url-list> [--json]");
    process.exitCode = 2;
    return;
  }

  const text = await fs.readFile(path.resolve(inputPath), "utf8");
  const urls = extractUrls(text);
  const sitemapUrls = await readLocalSitemapUrls();
  const rows = urls.map((url) => classifyUrl(url, sitemapUrls));
  const summary = summarize(rows);

  if (jsonMode) console.log(JSON.stringify({ summary, rows }, null, 2));
  else console.log(toCsv(rows));
  console.error(`GSC triage: ${rows.length} URL(s); ${JSON.stringify(summary)}`);
}
const directPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (directPath && fileURLToPath(import.meta.url) === directPath) {
  main().catch((error) => {
    console.error(error?.stack || error);
    process.exitCode = 1;
  });
}

export { extractUrls, readLocalSitemapUrls, summarize };
