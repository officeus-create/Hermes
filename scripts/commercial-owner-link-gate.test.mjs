import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";
const errors = [];

const commercialOwners = [
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

const genericAnchorText = new Set([
  "click here",
  "learn more",
  "read more",
  "more",
  "details",
  "continue",
  "open",
  "view",
  "go",
  "visit",
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

const anchorText = (html) => decode(html.replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ")
  .trim()
  .toLocaleLowerCase("en-US");

const getRobots = (html) => {
  const tag = html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0] ?? "";
  return tag.match(/content=["']([^"']*)["']/i)?.[1]?.toLowerCase() ?? "";
};

const routeFromHtmlPath = (path) => {
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -"index.html".length)}`;
  return `/${path}`;
};

const normalizeRoute = (href, sourceRoute) => {
  try {
    const url = new URL(href, new URL(sourceRoute, origin));
    if (url.origin !== origin) return null;
    if (/\.[a-z0-9]{2,8}$/i.test(url.pathname) && !url.pathname.endsWith(".html")) return null;
    if (url.pathname.endsWith(".html")) return url.pathname;
    return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  } catch {
    return null;
  }
};

async function collectHtmlFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextRelative = join(relative, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(join(directory, entry.name), nextRelative));
    else if (entry.name.endsWith(".html")) files.push(nextRelative);
  }
  return files;
}

const sitemapFiles = (await readdir(dist, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(entry.name))
  .map((entry) => entry.name);

const sitemapRoutes = new Set();
for (const sitemapFile of sitemapFiles) {
  const xml = await readFile(join(dist, sitemapFile), "utf8");
  for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
    const route = normalizeRoute(decode(match[1]).trim(), "/");
    if (route) sitemapRoutes.add(route);
  }
}

const pages = new Map();
for (const path of await collectHtmlFiles(dist)) {
  const route = routeFromHtmlPath(path);
  const html = await readFile(join(dist, path), "utf8");
  pages.set(route, {
    route,
    html,
    indexable: !getRobots(html).includes("noindex"),
  });
}

const graph = new Map();
const inbound = new Map();
const descriptiveInbound = new Map();

for (const route of sitemapRoutes) {
  graph.set(route, new Set());
  inbound.set(route, new Set());
  descriptiveInbound.set(route, []);
}

for (const sourceRoute of sitemapRoutes) {
  const source = pages.get(sourceRoute);
  if (!source?.indexable) continue;

  for (const match of source.html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || /^(?:mailto:|tel:|sms:|javascript:)/i.test(href)) continue;
    const targetRoute = normalizeRoute(href, sourceRoute);
    if (!targetRoute || targetRoute === sourceRoute || !sitemapRoutes.has(targetRoute)) continue;

    graph.get(sourceRoute)?.add(targetRoute);
    inbound.get(targetRoute)?.add(sourceRoute);

    const text = anchorText(match[2]);
    if (text && text.length >= 3 && !genericAnchorText.has(text)) {
      descriptiveInbound.get(targetRoute)?.push({ sourceRoute, text });
    }
  }
}

const depth = new Map();
if (sitemapRoutes.has("/")) {
  depth.set("/", 0);
  const queue = ["/"];
  while (queue.length) {
    const current = queue.shift();
    const nextDepth = depth.get(current) + 1;
    for (const target of graph.get(current) ?? []) {
      if (depth.has(target)) continue;
      depth.set(target, nextDepth);
      queue.push(target);
    }
  }
}

for (const route of commercialOwners) {
  const page = pages.get(route);
  if (!page) {
    errors.push(`${route}: commercial owner has no generated page`);
    continue;
  }
  if (!sitemapRoutes.has(route)) {
    errors.push(`${route}: commercial owner is missing from canonical sitemap inventory`);
    continue;
  }
  if (!page.indexable) errors.push(`${route}: commercial owner unexpectedly renders noindex`);

  const inboundSources = [...(inbound.get(route) ?? [])];
  if (inboundSources.length === 0) {
    errors.push(`${route}: commercial owner has no inbound link from another indexable sitemap page`);
  }

  const descriptive = descriptiveInbound.get(route) ?? [];
  if (descriptive.length === 0) {
    errors.push(`${route}: commercial owner has no descriptive inbound anchor from another indexable sitemap page`);
  }

  const routeDepth = depth.get(route);
  if (routeDepth === undefined) {
    errors.push(`${route}: commercial owner is unreachable from the homepage through indexable sitemap pages`);
  } else if (routeDepth > 4) {
    errors.push(`${route}: commercial owner click depth is ${routeDepth}; maximum allowed is 4`);
  }
}

if (errors.length) {
  throw new Error(`Commercial owner internal-link gate failed with ${errors.length} error(s):\n${errors.map((item) => `- ${item}`).join("\n")}`);
}

console.log(`Commercial owner internal-link gate passed: ${commercialOwners.length} money-page owners have indexable, descriptive inbound paths within four clicks.`);
