import { readFile, readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";

async function collectHtmlFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextRelative = join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(join(directory, entry.name), nextRelative));
    else if (entry.name.endsWith(".html")) files.push(nextRelative);
  }
  return files;
}

const routeFromHtmlPath = (path) => {
  if (path === "index.html") return "/";
  if (path === "404.html") return "/404.html";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -"index.html".length)}`;
  return `/${path}`;
};

const normalizeInternalRoute = (href, sourceRoute) => {
  try {
    const target = new URL(href, new URL(sourceRoute, origin));
    if (target.origin !== origin) return null;
    if (target.pathname === "/404.html") return "/404.html";
    if (/\.[a-z0-9]{2,8}$/i.test(target.pathname) && !target.pathname.endsWith(".html")) return null;
    if (target.pathname.endsWith("/index.html")) return target.pathname.slice(0, -"index.html".length);
    if (target.pathname.endsWith(".html")) return target.pathname;
    return target.pathname.endsWith("/") ? target.pathname : `${target.pathname}/`;
  } catch {
    return null;
  }
};

const getMetaRobots = (html) => {
  const tag = html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0] ?? "";
  return tag.match(/content=["']([^"']*)["']/i)?.[1]?.toLowerCase() ?? "";
};

const normalizeAnchorText = (html) => html
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const genericAnchorText = new Set([
  "click here",
  "learn more",
  "read more",
  "more",
  "details",
  "continue",
  "open",
  "view",
]);

const htmlFiles = await collectHtmlFiles(dist);
const pages = new Map();
for (const htmlPath of htmlFiles) {
  const route = routeFromHtmlPath(htmlPath);
  const html = await readFile(join(dist, htmlPath), "utf8");
  pages.set(route, { route, htmlPath, html, indexable: !getMetaRobots(html).includes("noindex") });
}

// Classify only exact redirect rules and GET handlers declared by Pages Functions.
const redirects = new Map();
try {
  for (const line of (await readFile(join(root, "public/_redirects"), "utf8")).split("\n")) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (from?.startsWith("/") && !from.includes("*") && !from.includes(":") && /^30[1278]$/.test(status ?? "")) redirects.set(from, to);
  }
} catch (error) { if (error.code !== "ENOENT") throw error; }
const dynamicRoutes = [];
async function collectGetRoutes(directory, relative = "") {
  let entries;
  try { entries = await readdir(directory, {withFileTypes: true}); }
  catch (error) { if (error.code === "ENOENT") return; throw error; }
  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;
    const path = join(relative, entry.name);
    if (entry.isDirectory()) { await collectGetRoutes(join(directory, entry.name), path); continue; }
    if (!/\.(?:js|ts)$/.test(path)) continue;
    const source = await readFile(join(directory, entry.name), "utf8");
    if (!/export\s+(?:(?:const|let|var)\s+onRequestGet\b|(?:async\s+)?function\s+onRequestGet\b)/.test(source)) continue;
    const segments = path.replace(/\.(?:js|ts)$/, "").split("/");
    if (segments.at(-1) === "index") segments.pop();
    const pattern = segments.map(segment => /^\[\[.*\]\]$/.test(segment) ? ".*" : /^\[.*\]$/.test(segment) ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("/");
    dynamicRoutes.push(new RegExp(`^/${pattern}/?$`));
  }
}
await collectGetRoutes(join(root, "functions"));
function classifyTarget(href, sourceRoute, visited = new Set()) {
  const target = new URL(href, new URL(sourceRoute, origin));
  if (target.origin !== origin) return {kind: "external"};
  if (visited.has(target.pathname)) return {kind: "missing"};
  visited.add(target.pathname);
  if (redirects.has(target.pathname)) return classifyTarget(redirects.get(target.pathname), sourceRoute, visited);
  const route = normalizeInternalRoute(target.href, sourceRoute);
  if (route && pages.has(route)) return {kind: "page", route};
  try { if (statSync(join(dist, decodeURIComponent(target.pathname))).isFile()) return {kind: "asset"}; }
  catch (error) { if (error.code !== "ENOENT" && error.code !== "ENOTDIR" && !(error instanceof URIError)) throw error; }
  if (dynamicRoutes.some(pattern => pattern.test(target.pathname))) return {kind: "dynamic"};
  return {kind: "missing"};
}
const missingTargets = new Set();

const graph = new Map([...pages.keys()].map((route) => [route, new Set()]));
const inbound = new Map([...pages.keys()].map((route) => [route, new Set()]));
const inboundAnchorTexts = new Map([...pages.keys()].map((route) => [route, new Set()]));

for (const page of pages.values()) {
  for (const match of page.html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) continue;
    let target;
    try { target = classifyTarget(href, page.route); }
    catch { missingTargets.add(`${page.route}: invalid internal page target ${href}`); continue; }
    if (target.kind === "missing") missingTargets.add(`${page.route}: missing internal page target ${href}`);
    if (target.kind !== "page" || target.route === page.route) continue;
    const targetRoute = target.route;
    graph.get(page.route).add(targetRoute);
    inbound.get(targetRoute).add(page.route);
    const anchorText = normalizeAnchorText(match[2]);
    if (anchorText) inboundAnchorTexts.get(targetRoute).add(anchorText);
  }
}

const distEntries = await readdir(dist, { withFileTypes: true });
const sitemapFiles = distEntries
  .filter((entry) => entry.isFile() && /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const sitemapRoutes = new Set();
for (const sitemapFile of sitemapFiles) {
  const sitemap = await readFile(join(dist, sitemapFile), "utf8");
  for (const match of sitemap.matchAll(/<loc>\s*(https:\/\/hermeslogisticsus\.com[^<]*)<\/loc>/gi)) {
    const route = normalizeInternalRoute(match[1].trim(), "/");
    if (route) sitemapRoutes.add(route);
  }
}

const warnings = [];
for (const route of sitemapRoutes) {
  const page = pages.get(route);
  if (!page) {
    warnings.push(`${route}: sitemap URL has no generated HTML page`);
    continue;
  }
  if (!page.indexable || route === "/") continue;
  if ((inbound.get(route)?.size ?? 0) === 0) warnings.push(`${route}: indexable sitemap page has no internal inbound links`);

  const anchorTexts = [...(inboundAnchorTexts.get(route) ?? [])];
  if (anchorTexts.length > 0 && anchorTexts.every((text) => genericAnchorText.has(text))) {
    warnings.push(`${route}: all inbound anchor text is generic (${anchorTexts.join(", ")})`);
  }

  if (route.startsWith("/logistics/") && route.split("/").filter(Boolean).length >= 2) {
    const hasBreadcrumb = /<nav\b[^>]*(?:aria-label=["']Breadcrumb["']|class=["'][^"']*breadcrumb[^"']*["'])/i.test(page.html);
    if (!hasBreadcrumb) warnings.push(`${route}: deep logistics page has no visible breadcrumb navigation`);
  }
}

const depth = new Map([["/", 0]]);
const queue = ["/"];
while (queue.length) {
  const current = queue.shift();
  const currentDepth = depth.get(current);
  for (const target of graph.get(current) ?? []) {
    if (!depth.has(target)) {
      depth.set(target, currentDepth + 1);
      queue.push(target);
    }
  }
}

for (const route of sitemapRoutes) {
  const page = pages.get(route);
  if (!page || !page.indexable || route === "/") continue;
  if (!depth.has(route)) warnings.push(`${route}: indexable sitemap page is unreachable from the homepage link graph`);
  else if (depth.get(route) > 4) warnings.push(`${route}: internal click depth is ${depth.get(route)}; review hub and contextual links`);
}

for (const warning of warnings) console.warn(`SEO link warning — ${warning}`);
console.log(
  `Internal-link audit completed: ${pages.size} HTML pages, ${sitemapFiles.length} sitemap file(s), ${sitemapRoutes.size} sitemap routes, ${warnings.length} review warning(s).`,
);

for (const missing of missingTargets) console.error(`Internal-link error — ${missing}`);
if (missingTargets.size) process.exitCode = 1;
