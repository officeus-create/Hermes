import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const publicDir = join(root, "public");
const manifestPath = join(root, "docs", "release-manifest-2026-08-01.json");
const markdownPath = join(root, "docs", "RELEASE_MANIFEST_2026-08-01.md");
const deltaDir = join(root, "docs", "release-manifest-deltas");
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

const deltaFiles = (await readdir(deltaDir))
  .filter((name) => name.endsWith(".json"))
  .sort();
const deltas = await Promise.all(
  deltaFiles.map(async (filename) => ({
    filename,
    data: JSON.parse(await readFile(join(deltaDir, filename), "utf8")),
  })),
);
const deltaRows = [];
const deltaRemovals = [];
for (const { filename, data } of deltas) {
  assert(data.schema_version === 1, `${filename}: schema_version must be 1.`);
  assert(data.base_manifest === "docs/release-manifest-2026-08-01.json", `${filename}: base manifest is incorrect.`);
  assert(typeof data.release_delta === "string" && data.release_delta.length > 0, `${filename}: release_delta is missing.`);
  assert(Array.isArray(data.additions) && data.additions.length > 0, `${filename}: additions must not be empty.`);
  assert(data.acceptance?.route_count_added === data.additions.length, `${filename}: route-count acceptance is incorrect.`);
  const removals = Array.isArray(data.removals) ? data.removals : [];
  if (removals.length > 0) {
    assert(data.acceptance?.route_count_removed === removals.length, `${filename}: removed-route acceptance is incorrect.`);
    for (const removal of removals) {
      assert(typeof removal?.route === "string" && removal.route.length > 0, `${filename}: removal route is missing.`);
      assert(typeof removal?.reason === "string" && removal.reason.length > 0, `${filename}: removal reason is missing for ${removal.route}.`);
      deltaRemovals.push({ ...removal, release_delta: data.release_delta });
    }
  }
  const indexableAdditions = data.additions.filter((row) => row.indexability === "indexable").length;
  assert(data.acceptance?.indexable_route_count_added === indexableAdditions, `${filename}: indexable-count acceptance is incorrect.`);
  assert(data.acceptance?.requires_green_current_head_ci === true, `${filename}: green CI gate is required.`);
  assert(
    data.acceptance?.requires_production_snapshot_reconciliation_after_deploy === true,
    `${filename}: production reconciliation gate is required.`,
  );
  for (const row of data.additions) {
    assert(row.source_state === "current_main", `${filename}: additions must be current-main rows.`);
    assert(row.status === "COMPLETE", `${filename}: route is not COMPLETE: ${row.route}`);
    assert(
      row.comparison?.production === "pending_deployment" || row.comparison?.production === "present",
      `${filename}: production state must be pending_deployment or present: ${row.route}`,
    );
    deltaRows.push({ ...row, release_delta: data.release_delta });
  }
}

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
const baselineRows = manifest.routes.filter((row) => row.source_state === "current_main");
const manifestByRoute = new Map();
for (const row of [...baselineRows, ...deltaRows]) {
  assert(!manifestByRoute.has(row.route), `Release manifest route is declared more than once: ${row.route}`);
  manifestByRoute.set(row.route, row);
}
const removedRows = [];
for (const removal of deltaRemovals) {
  const existing = manifestByRoute.get(removal.route);
  assert(existing, `Release manifest removal targets an unknown route: ${removal.route}`);
  removedRows.push(existing);
  manifestByRoute.delete(removal.route);
}
const currentRows = [...manifestByRoute.values()];
assert(currentRows.length === htmlFiles.length, `Manifest plus deltas after removals has ${currentRows.length} current-main routes; build has ${htmlFiles.length}.`);
assert(sitemapFiles.length === 8, `Expected 8 sitemap files including the London market sitemap, found ${sitemapFiles.length}.`);

let indexableCount = 0;
for (const htmlFile of htmlFiles) {
  const route = routeFromHtmlPath(htmlFile);
  const html = await readFile(htmlFile, "utf8");
  const robots = parseRobots(html);
  const indexable = !/\bnoindex\b/i.test(robots) && route !== "/404.html";
  const routeOwners = owners.get(route) ?? [];
  const row = manifestByRoute.get(route);
  assert(row, `Build route is absent from the manifest and declared deltas: ${route}`);
  assert(row.status === "COMPLETE", `Current-main manifest row is not COMPLETE: ${route}`);
  assert(row.indexability === (indexable ? "indexable" : "noindex"), `Indexability mismatch for ${route}`);
  assert(row.canonical === parseCanonical(html, canonicalOrigin + route), `Canonical mismatch for ${route}`);
  if (indexable) {
    indexableCount += 1;
    assert(routeOwners.length === 1, `Indexable route must belong to exactly one sitemap: ${route}`);
    assert(row.sitemap_owner === routeOwners[0], `Sitemap owner mismatch for ${route}`);
    if (row.release_delta) {
      assert(
        row.comparison?.production === "pending_deployment" || row.comparison?.production === "present",
        `Release-delta route needs an explicit production state: ${route}`,
      );
    } else {
      assert(row.comparison?.production === "present", `Baseline indexable route is absent from production snapshot: ${route}`);
    }
  } else {
    assert(routeOwners.length === 0, `Noindex/404 route must not belong to a sitemap: ${route}`);
  }
}

const deltaIndexableCount = deltaRows.filter((row) => row.indexability === "indexable").length;
const removedIndexableCount = removedRows.filter((row) => row.indexability === "indexable").length;
const currentSource = manifest.sources.find((source) => source.id === "current_main");
const expectedIndexableCount = currentSource.indexable_route_count + deltaIndexableCount - removedIndexableCount;
assert(indexableCount === expectedIndexableCount, `Expected ${expectedIndexableCount} indexable routes, found ${indexableCount}.`);
assert(!owners.has("/paths/academy/casablanca/"), "Casablanca must not be present in a sitemap during Phase 1.");
assert(!manifestByRoute.has("/paths/academy/casablanca/"), "Casablanca must not be present in the current-main manifest during Phase 1.");

const pr83 = manifest.sources.find((source) => source.id === "pr_83");
const pr85 = manifest.sources.find((source) => source.id === "pr_85");
const pr86 = manifest.sources.find((source) => source.id === "merged_pr_86");
const production = manifest.external_snapshots.find((source) => source.source === "production");
const immutable = manifest.external_snapshots.find((source) => source.source === "immutable_release");
assert(currentSource?.route_count === 104 && currentSource?.indexable_route_count === 86, "Current Phase 1 baseline counts are incorrect.");
assert(currentRows.length === htmlFiles.length, "Baseline, release deltas, and retired-route removals do not reconcile.");
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
  `Release manifest checks passed: ${baselineRows.length} baseline routes + ${deltaRows.length} declared delta route(s), ${indexableCount} indexable routes, ${sitemapFiles.length} sitemap files, production baseline 95, immutable release 46.`,
);
