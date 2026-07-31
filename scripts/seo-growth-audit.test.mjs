import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const siteOrigin = "https://hermeslogisticsus.com";
const canonicalHost = "hermeslogisticsus.com";
const errors = [];
const warnings = [];

const addError = (route, message) => errors.push(`${route}: ${message}`);
const addWarning = (route, message) => warnings.push(`${route}: ${message}`);

async function collectHtmlFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextRelative = join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(join(directory, entry.name), nextRelative));
    else if (entry.name.endsWith(".html")) files.push(nextRelative.replaceAll("\\", "/"));
  }
  return files;
}

const routeFromHtmlPath = (path) => {
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -"index.html".length)}`;
  return `/${path}`;
};

const htmlPathFromUrl = (url) => {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return "index.html";
  if (pathname.endsWith("/")) return `${pathname.slice(1)}index.html`;
  if (pathname.endsWith(".html")) return pathname.slice(1);
  return `${pathname.slice(1)}/index.html`;
};

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/\s+/g, " ")
  .trim();

const stripTags = (html) => decode(html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));

const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};

const tags = (html, tagName) => [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
const elements = (html, tagName) => [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))];

const metaByName = (html, name) => tags(html, "meta").filter((tag) => getAttr(tag, "name").toLowerCase() === name.toLowerCase());
const metaByProperty = (html, property) => tags(html, "meta").filter((tag) => getAttr(tag, "property").toLowerCase() === property.toLowerCase());
const linksByRel = (html, rel) => tags(html, "link").filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes(rel.toLowerCase()));

const parseJsonLd = (html, route) => {
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const parsed = [];
  for (const [index, block] of blocks.entries()) {
    try {
      parsed.push(JSON.parse(block[1]));
    } catch (error) {
      addError(route, `JSON-LD block ${index + 1} is invalid: ${error.message}`);
    }
  }
  return parsed;
};

const walkSchema = (value, visit, path = "schema") => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkSchema(item, visit, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  visit(value, path);
  for (const [key, child] of Object.entries(value)) walkSchema(child, visit, `${path}.${key}`);
};

const allHtmlFiles = await collectHtmlFiles(dist);
const htmlByPath = new Map(await Promise.all(allHtmlFiles.map(async (path) => [path, await readFile(join(dist, path), "utf8")])));
const sitemapXml = await readFile(join(dist, "sitemap.xml"), "utf8");
const robotsTxt = await readFile(join(dist, "robots.txt"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => decode(match[1]));
const sitemapSet = new Set(sitemapUrls);

if (!robotsTxt.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) {
  addError("/robots.txt", "canonical sitemap declaration is missing");
}
if (sitemapUrls.length !== sitemapSet.size) {
  addError("/sitemap.xml", "duplicate <loc> entries found");
}

for (const url of sitemapUrls) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    addError("/sitemap.xml", `invalid absolute URL: ${url}`);
    continue;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== canonicalHost) addError("/sitemap.xml", `non-canonical host or protocol: ${url}`);
  if (parsed.search || parsed.hash) addError("/sitemap.xml", `query string or fragment is not allowed: ${url}`);
  const htmlPath = htmlPathFromUrl(url);
  if (!htmlByPath.has(htmlPath)) addError("/sitemap.xml", `URL has no generated HTML page: ${url}`);
}

const titleOwners = new Map();
const descriptionOwners = new Map();
const h1Owners = new Map();
const canonicalOwners = new Map();
const indexableRoutes = [];

for (const [path, html] of htmlByPath) {
  const route = routeFromHtmlPath(path);
  const visibleText = stripTags(html).toLowerCase();
  const robotsTags = metaByName(html, "robots");
  const robotsContent = robotsTags.map((tag) => getAttr(tag, "content").toLowerCase()).join(",");
  const indexable = path !== "404.html" && !robotsContent.includes("noindex");

  if (robotsTags.length > 1) addError(route, `multiple robots meta tags (${robotsTags.length})`);
  if (path === "404.html" && !robotsContent.includes("noindex")) addWarning(route, "404 page should be noindex");
  if (!indexable) continue;
  indexableRoutes.push(route);

  const titleElements = elements(html, "title");
  if (titleElements.length !== 1) addError(route, `expected exactly one title, found ${titleElements.length}`);
  const title = decode(titleElements[0]?.[1] ?? "");
  if (!title) addError(route, "title is empty");
  if (title.length < 20 || title.length > 70) addWarning(route, `title length is ${title.length}; review SERP readability`);
  if (title) titleOwners.set(title.toLowerCase(), [...(titleOwners.get(title.toLowerCase()) ?? []), route]);

  const descriptions = metaByName(html, "description");
  if (descriptions.length !== 1) addError(route, `expected exactly one meta description, found ${descriptions.length}`);
  const description = getAttr(descriptions[0] ?? "", "content");
  if (!description) addError(route, "meta description is empty");
  if (description.length < 70 || description.length > 170) addWarning(route, `meta description length is ${description.length}; review snippet quality`);
  if (description) descriptionOwners.set(description.toLowerCase(), [...(descriptionOwners.get(description.toLowerCase()) ?? []), route]);

  const h1Elements = elements(html, "h1");
  if (h1Elements.length !== 1) addError(route, `expected exactly one H1, found ${h1Elements.length}`);
  const h1 = stripTags(h1Elements[0]?.[1] ?? "");
  if (!h1) addError(route, "H1 is empty");
  if (h1) h1Owners.set(h1.toLowerCase(), [...(h1Owners.get(h1.toLowerCase()) ?? []), route]);

  const canonicalLinks = linksByRel(html, "canonical");
  if (canonicalLinks.length !== 1) addError(route, `expected exactly one canonical, found ${canonicalLinks.length}`);
  const canonicalValue = getAttr(canonicalLinks[0] ?? "", "href");
  let canonical;
  try {
    canonical = new URL(canonicalValue);
  } catch {
    addError(route, `canonical is not an absolute URL: ${canonicalValue || "missing"}`);
  }
  if (canonical) {
    if (canonical.protocol !== "https:" || canonical.hostname !== canonicalHost) addError(route, `canonical uses the wrong host or protocol: ${canonical.href}`);
    if (canonical.search || canonical.hash) addError(route, `canonical contains a query string or fragment: ${canonical.href}`);
    const expected = new URL(route, siteOrigin).href;
    if (canonical.href !== expected) addError(route, `self-canonical mismatch; expected ${expected}, received ${canonical.href}`);
    canonicalOwners.set(canonical.href, [...(canonicalOwners.get(canonical.href) ?? []), route]);
    if (!sitemapSet.has(canonical.href)) addWarning(route, `indexable canonical is not listed in sitemap: ${canonical.href}`);
  }

  const ogTitles = metaByProperty(html, "og:title");
  const ogDescriptions = metaByProperty(html, "og:description");
  const ogUrls = metaByProperty(html, "og:url");
  if (ogTitles.length !== 1) addError(route, `expected one og:title, found ${ogTitles.length}`);
  if (ogDescriptions.length !== 1) addError(route, `expected one og:description, found ${ogDescriptions.length}`);
  if (ogUrls.length !== 1) addError(route, `expected one og:url, found ${ogUrls.length}`);
  if (canonical && getAttr(ogUrls[0] ?? "", "content") !== canonical.href) addError(route, "og:url does not match canonical");

  const schemaBlocks = parseJsonLd(html, route);
  for (const schemaBlock of schemaBlocks) {
    walkSchema(schemaBlock, (node, schemaPath) => {
      for (const key of ["@id", "url", "item", "logo", "image"]) {
        const candidate = node[key];
        if (typeof candidate !== "string" || !candidate.startsWith("http")) continue;
        try {
          const schemaUrl = new URL(candidate);
          if (schemaUrl.protocol !== "https:") addError(route, `${schemaPath}.${key} must use HTTPS: ${candidate}`);
        } catch {
          addError(route, `${schemaPath}.${key} is not a valid URL: ${candidate}`);
        }
      }
      const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
      if (types.includes("FAQPage") && Array.isArray(node.mainEntity)) {
        for (const question of node.mainEntity) {
          const name = typeof question?.name === "string" ? decode(question.name).toLowerCase() : "";
          if (name && !visibleText.includes(name)) addError(route, `FAQ schema question is not visible on the page: ${question.name}`);
        }
      }
    });
  }

  if (route.startsWith("/demos/") && !robotsContent.includes("noindex")) {
    addWarning(route, "demo/prototype page is indexable but absent from the primary commercial sitemap policy");
  }
}

for (const url of sitemapUrls) {
  const htmlPath = htmlPathFromUrl(url);
  const html = htmlByPath.get(htmlPath);
  if (!html) continue;
  const route = new URL(url).pathname;
  const robotsContent = metaByName(html, "robots").map((tag) => getAttr(tag, "content").toLowerCase()).join(",");
  if (robotsContent.includes("noindex")) addError(route, "noindex URL is included in sitemap");
  const canonical = getAttr(linksByRel(html, "canonical")[0] ?? "", "href");
  if (canonical !== url) addError(route, `sitemap URL and rendered canonical differ: ${url} vs ${canonical || "missing"}`);
}

const addDuplicateWarnings = (map, label) => {
  for (const [value, routes] of map) {
    if (routes.length > 1) addWarning(routes.join(", "), `duplicate ${label}: ${value}`);
  }
};
addDuplicateWarnings(titleOwners, "title");
addDuplicateWarnings(descriptionOwners, "meta description");
addDuplicateWarnings(h1Owners, "H1");

for (const [canonical, routes] of canonicalOwners) {
  if (routes.length > 1) addError(routes.join(", "), `multiple pages claim the same canonical: ${canonical}`);
}

for (const warning of warnings) console.warn(`SEO warning — ${warning}`);
if (errors.length) {
  throw new Error(`SEO growth audit failed with ${errors.length} error(s):\n${errors.map((item) => `- ${item}`).join("\n")}`);
}

console.log(`SEO growth audit passed: ${indexableRoutes.length} indexable pages, ${sitemapUrls.length} sitemap URLs, ${warnings.length} review warning(s).`);
