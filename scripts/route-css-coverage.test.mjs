import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const featurePrefixes = [
  "technology-",
  "load-",
  "it-",
  "case-",
  "localized-",
  "appleton-",
  "crm-",
  "connect-",
  "resource-",
  "product-",
  "academy-",
];
const representativeRoutes = [
  "/",
  "/paths/logistics/",
  "/load-board/",
  "/logistics/appleton-wi-vehicle-transport/",
  "/logistics/car-hauling-dispatch/",
  "/services/website-development/",
  "/services/seo/",
  "/paths/academy/",
  "/demos/content-pipeline/",
  "/demos/social-distribution/",
];

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

function routeFromHtmlPath(absolutePath) {
  const outputPath = relative(dist, absolutePath).split(sep).join("/");
  if (outputPath === "index.html") return "/";
  if (outputPath.endsWith("/index.html")) return `/${outputPath.slice(0, -"index.html".length)}`;
  return `/${outputPath}`;
}

function percentile(sorted, value) {
  if (!sorted.length) return 0;
  const index = Math.max(0, Math.ceil(sorted.length * value) - 1);
  return sorted[index];
}

function parseStylesheetHrefs(html, route) {
  const hrefs = new Set();
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "";
    if (!rel.split(/\s+/).includes("stylesheet")) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const pathname = new URL(href, `https://hermeslogisticsus.com${route}`).pathname;
    hrefs.add(pathname);
  }
  return hrefs;
}

function parseInlineStyles(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
}

function parseClasses(html) {
  const classes = new Set();
  for (const match of html.matchAll(/\bclass=["']([^"']+)["']/gi)) {
    for (const token of match[1].split(/\s+/)) {
      if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(token)) classes.add(token);
    }
  }
  return classes;
}

function containsClass(css, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\.${escaped}(?![A-Za-z0-9_-])`).test(css);
}

const allFiles = await collectFiles(dist);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const cssFiles = allFiles.filter((file) => file.endsWith(".css"));
const cssAssets = new Map();
const cssHashes = new Map();

for (const absolutePath of cssFiles) {
  const pathname = `/${relative(dist, absolutePath).split(sep).join("/")}`;
  const content = await readFile(absolutePath, "utf8");
  const bytes = (await stat(absolutePath)).size;
  cssAssets.set(pathname, { absolutePath, content, bytes });
  const hash = createHash("sha256").update(content).digest("hex");
  const group = cssHashes.get(hash) ?? [];
  group.push(pathname);
  cssHashes.set(hash, group);
}

const allCss = [...cssAssets.values()].map((asset) => asset.content).join("\n");
const routeRows = [];
const errors = [];

for (const htmlFile of htmlFiles) {
  const route = routeFromHtmlPath(htmlFile);
  const html = await readFile(htmlFile, "utf8");
  const hrefs = parseStylesheetHrefs(html, route);
  const inlineStyles = parseInlineStyles(html);
  const loadedCssParts = [...inlineStyles];
  let cssBytes = inlineStyles.reduce((sum, css) => sum + Buffer.byteLength(css), 0);

  for (const href of hrefs) {
    const asset = cssAssets.get(href);
    if (!asset) {
      errors.push(`${route}: linked stylesheet ${href} is missing from dist`);
      continue;
    }
    cssBytes += asset.bytes;
    loadedCssParts.push(asset.content);
  }

  const loadedCss = loadedCssParts.join("\n");
  const classes = parseClasses(html);
  for (const className of classes) {
    if (!featurePrefixes.some((prefix) => className.startsWith(prefix))) continue;
    if (!containsClass(allCss, className)) continue;
    if (!containsClass(loadedCss, className)) {
      errors.push(`${route}: rendered feature class .${className} exists in generated CSS but is not loaded by this route`);
    }
  }

  const robots = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i)?.[1]
    ?? "index,follow";
  routeRows.push({ route, cssBytes, hrefs, indexable: !/\bnoindex\b/i.test(robots) });
}

const indexableRows = routeRows.filter((row) => row.indexable);
const cssByteValues = indexableRows.map((row) => row.cssBytes).sort((a, b) => a - b);
const average = cssByteValues.length
  ? Math.round(cssByteValues.reduce((sum, value) => sum + value, 0) / cssByteValues.length)
  : 0;
const sharedHrefs = indexableRows.length
  ? [...indexableRows[0].hrefs].filter((href) => indexableRows.every((row) => row.hrefs.has(href)))
  : [];
const sharedCssBytes = sharedHrefs.reduce((sum, href) => sum + (cssAssets.get(href)?.bytes ?? 0), 0);
const exactDuplicateGroups = [...cssHashes.values()].filter((paths) => paths.length > 1);

for (const route of representativeRoutes) {
  if (!routeRows.some((row) => row.route === route)) errors.push(`Representative route is missing from the build: ${route}`);
}

const report = {
  htmlRoutes: routeRows.length,
  indexableRoutes: indexableRows.length,
  generatedStylesheets: cssFiles.length,
  generatedCssBytes: [...cssAssets.values()].reduce((sum, asset) => sum + asset.bytes, 0),
  sharedRenderBlockingCssBytes: sharedCssBytes,
  averageCssBytes: average,
  p50CssBytes: percentile(cssByteValues, 0.5),
  p90CssBytes: percentile(cssByteValues, 0.9),
  minCssBytes: cssByteValues[0] ?? 0,
  maxCssBytes: cssByteValues.at(-1) ?? 0,
  exactDuplicateStylesheetGroups: exactDuplicateGroups,
  representativeRoutes: Object.fromEntries(
    representativeRoutes.map((route) => [route, routeRows.find((row) => row.route === route)?.cssBytes ?? null]),
  ),
};

console.log(`Route CSS report:\n${JSON.stringify(report, null, 2)}`);

if (errors.length) {
  throw new Error(`Route CSS coverage failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

console.log("Route CSS coverage passed: every generated feature class used by a route is present in that route's loaded CSS.");
