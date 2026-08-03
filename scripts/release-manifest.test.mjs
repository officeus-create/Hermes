import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const publicDir = join(root, "public");
const manifestPath = join(root, "docs", "release-manifest-2026-08-01.json");
const markdownPath = join(root, "docs", "RELEASE_MANIFEST_2026-08-01.md");
const canonicalOrigin = "https://hermeslogisticsus.com";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

function normalizeRoute(value) {
  const url = new URL(value, canonicalOrigin);
  let route = url.pathname || "/";
  if (!route.endsWith("/") && !route.includes(".")) route += "/";
  return route;
}

function routeFromHtmlPath(absolutePath) {
  const outputPath = relative(dist, absolutePath).split(sep).join("/");
  if (outputPath === "index.html") return "/";
  if (outputPath === "404.html") return "/404.html";
  if (outputPath.endsWith("/index.html")) return "/" + outputPath.slice(0, -"index.html".length);
  return "/" + outputPath;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else files.push(absolute);
  }
  return files;
}

function parseRobots(html) {
  return html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i)?.[1]
    ?? "index,follow";
}

function parseCanonical(html, fallbackUrl) {
  const href = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1]
    ?? fallbackUrl;
  return new URL(href, fallbackUrl).toString();
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const markdown = await readFile(markdownPath, "utf8");
assert(manifest.schema_version === 1, "Release manifest schema_version must be 1.");
assert(manifest.issue === 87 && manifest.phase === 1, "Release manifest must represent Issue #87 Phase 1.");
assert(manifest.phase_2?.included_in_this_release === false, "Casablanca Phase 2 must remain excluded.");
assert(manifest.phase_2?.status === "BLOCKED_PENDING_REVIEW_AND_OWNER_FACTS", "Casablanca Phase 2 must remain blocked.");

const sitemapFiles = (await readdir(publicDir))
  .filter((name) => /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(name))
  .sort();
const owners = new Map();
for (const filename of sitemapFiles) {
  const xml = await readFile(join(publicDir, filename), "utf8");
  for (const route of extractLocs(xml).map(normalizeRoute)) {
    const list = owners.get(route) ?? [];
    list.push("public/" + filename);
    owners.set(route, list);
  }
}

const htmlFiles = (await collectFiles(dist)).filter((path) => path.endsWith(".html"));
const currentRows = manifest.routes.filter((row) => row.source_state === "current_main");
const manifestByRoute = new Map(currentRows.map((row) => [row.route, row]));
assert(currentRows.length === htmlFiles.length, `Manifest has ${currentRows.length} current-main routes; build has ${htmlFiles.length}.`);
assert(sitemapFiles.length === 7, `Expected 7 sitemap files, found ${sitemapFiles.length}.`);

let indexableCount = 0;
for (const htmlFile of htmlFiles) {
  const route = routeFromHtmlPath(htmlFile);
  const html = await readFile(htmlFile, "utf8");
  const robots = parseRobots(html);
  const indexable = !/\bnoindex\b/i.test(robots) && route !== "/404.html";
  const routeOwners = owners.get(route) ?? [];
  const row = manifestByRoute.get(route);
  assert(row, `Build route is absent from the manifest: ${route}`);
  assert(row.status === "COMPLETE", `Current-main manifest row is not COMPLETE: ${route}`);
  assert(row.indexability === (indexable ? "indexable" : "noindex"), `Indexability mismatch for ${route}`);
  assert(row.canonical === parseCanonical(html, canonicalOrigin + route), `Canonical mismatch for ${route}`);
  if (indexable) {
    indexableCount += 1;
    assert(routeOwners.length === 1, `Indexable route must belong to exactly one sitemap: ${route}`);
    assert(row.sitemap_owner === routeOwners[0], `Sitemap owner mismatch for ${route}`);
    assert(row.comparison?.production === "present", `Indexable current-main route is absent from production snapshot: ${route}`);
  } else {
    assert(routeOwners.length === 0, `Noindex/404 route must not belong to a sitemap: ${route}`);
  }
}
assert(indexableCount === 95, `Expected 95 indexable routes, found ${indexableCount}.`);
assert(!owners.has("/paths/academy/casablanca/"), "Casablanca must not be present in a sitemap during Phase 1.");
assert(!manifestByRoute.has("/paths/academy/casablanca/"), "Casablanca must not be present in the current-main manifest during Phase 1.");

const currentSource = manifest.sources.find((source) => source.id === "current_main");
const pr83 = manifest.sources.find((source) => source.id === "pr_83");
const pr85 = manifest.sources.find((source) => source.id === "pr_85");
const pr86 = manifest.sources.find((source) => source.id === "merged_pr_86");
const production = manifest.external_snapshots.find((source) => source.source === "production");
const immutable = manifest.external_snapshots.find((source) => source.source === "immutable_release");
assert(currentSource?.route_count === 104 && currentSource?.indexable_route_count === 95, "Current-main source counts are incorrect.");
assert(pr83?.state === "open_draft_stale" && pr83?.public_route_count === 1, "PR #83 reconciliation is incorrect.");
assert(pr85?.state === "open_draft_stale" && pr85?.public_route_count === 0, "PR #85 reconciliation is incorrect.");
assert(pr86?.state === "merged_into_current_main" && pr86?.public_route_count === 5, "PR #86 reconciliation is incorrect.");
assert(production?.availability === "AVAILABLE" && production?.route_count === 95, "Production snapshot contract is incorrect.");
assert(immutable?.availability === "AVAILABLE" && immutable?.route_count === 46, "Immutable release snapshot contract is incorrect.");
assert(markdown.includes("Production comparison: 95 present, 9 absent"), "Markdown production comparison is missing.");
assert(markdown.includes("Immutable comparison: 46 present, 58 absent"), "Markdown immutable comparison is missing.");
assert(markdown.includes("| pr_83 | open_draft_stale | 1 |"), "Markdown PR #83 route count is missing.");
assert(markdown.includes("| pr_85 | open_draft_stale | 0 |"), "Markdown PR #85 route count is missing.");
assert(markdown.includes("| merged_pr_86 | merged_into_current_main | 5 |"), "Markdown PR #86 route count is missing.");

console.log(
  `Release manifest checks passed: ${currentRows.length} HTML routes, ${indexableCount} indexable routes, ${sitemapFiles.length} sitemap files, production 95, immutable release 46.`,
);
