import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";

async function collectHtmlFiles(dir, rel = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = join(rel, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(join(dir, entry.name), next));
    else if (entry.name.endsWith(".html")) files.push(next);
  }
  return files;
}

const routeFromPath = (p) => p === "index.html" ? "/" : p === "404.html" ? "/404.html" : p.endsWith("/index.html") ? `/${p.slice(0, -"index.html".length)}` : `/${p}`;
const decode = (value = "") => value.replaceAll("&amp;", "&").trim();
const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};
const linkTags = (html) => [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
const metaRobots = (html) => html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i)?.[1]?.toLowerCase() ?? "index,follow";
const normalizeLang = (value = "") => value.toLowerCase().split("-")[0];
const routeFromUrl = (url) => {
  const parsed = new URL(url, origin);
  if (parsed.origin !== origin) return null;
  if (parsed.pathname === "/") return "/";
  return parsed.pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(parsed.pathname) ? parsed.pathname : `${parsed.pathname}/`;
};

const pages = new Map();
for (const htmlPath of await collectHtmlFiles(dist)) {
  const route = routeFromPath(htmlPath);
  const html = await readFile(join(dist, htmlPath), "utf8");
  const htmlLang = normalizeLang(html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1] ?? "");
  const canonicals = linkTags(html).filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")).map((tag) => getAttr(tag, "href"));
  const alternates = linkTags(html)
    .filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && getAttr(tag, "hreflang"))
    .map((tag) => ({ lang: getAttr(tag, "hreflang").toLowerCase(), href: getAttr(tag, "href") }));
  pages.set(route, { route, html, htmlLang, canonicals, alternates, indexable: !metaRobots(html).includes("noindex") });
}

const errors = [];
let alternatePages = 0;
let alternateEdges = 0;
for (const page of pages.values()) {
  if (!page.indexable || page.route === "/404.html" || page.alternates.length === 0) continue;
  alternatePages += 1;
  const self = `${origin}${page.route}`;
  if (page.canonicals.length !== 1 || page.canonicals[0] !== self) errors.push(`${page.route}: expected one self-canonical ${self}, received ${page.canonicals.join(", ") || "missing"}`);
  if (!page.htmlLang) errors.push(`${page.route}: html lang is missing`);

  const seenLangs = new Set();
  for (const alt of page.alternates) {
    alternateEdges += 1;
    if (seenLangs.has(alt.lang)) errors.push(`${page.route}: duplicate hreflang ${alt.lang}`);
    seenLangs.add(alt.lang);
    const targetRoute = routeFromUrl(alt.href);
    if (!targetRoute) continue;
    const target = pages.get(targetRoute);
    if (!target) {
      errors.push(`${page.route}: hreflang ${alt.lang} target does not resolve to generated HTML: ${alt.href}`);
      continue;
    }
    if (!target.indexable) errors.push(`${page.route}: hreflang ${alt.lang} points to noindex target ${targetRoute}`);
    const targetCanonical = `${origin}${targetRoute}`;
    if (target.canonicals.length !== 1 || target.canonicals[0] !== targetCanonical) errors.push(`${page.route}: hreflang ${alt.lang} target ${targetRoute} is not self-canonical`);
    if (alt.lang !== "x-default" && normalizeLang(alt.lang) !== target.htmlLang) errors.push(`${page.route}: hreflang ${alt.lang} points to html lang=${target.htmlLang || "missing"} at ${targetRoute}`);
    if (alt.lang !== "x-default" && page.htmlLang) {
      const reciprocal = target.alternates.find((candidate) => normalizeLang(candidate.lang) === page.htmlLang && routeFromUrl(candidate.href) === page.route);
      if (!reciprocal) errors.push(`${page.route}: target ${targetRoute} does not reciprocate ${page.htmlLang} -> ${page.route}`);
    }
  }

  if (page.htmlLang && !page.alternates.some((alt) => normalizeLang(alt.lang) === page.htmlLang && routeFromUrl(alt.href) === page.route)) {
    errors.push(`${page.route}: localized cluster is missing self hreflang ${page.htmlLang}`);
  }
}

assert.equal(errors.length, 0, `Sitewide language-owner integrity failed with ${errors.length} error(s):\n${errors.map((e) => `- ${e}`).join("\n")}`);
console.log(`Sitewide language-owner integrity passed: ${alternatePages} indexable pages with hreflang, ${alternateEdges} internal alternate edges, reciprocal canonical language ownership verified.`);
