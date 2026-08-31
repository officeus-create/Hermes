import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";
const canonicalHost = "hermeslogisticsus.com";
const errors = [];
const warnings = [];

const decode = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/\s+/g, " ")
  .trim();

const stripTags = (html = "") => decode(
  html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "),
);
const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};
const tags = (html, tagName) => [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
const elements = (html, tagName) => [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))];
const linksByRel = (html, rel) => tags(html, "link").filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes(rel));
const metaByName = (html, name) => tags(html, "meta").filter((tag) => getAttr(tag, "name").toLowerCase() === name.toLowerCase());
const htmlPathFromUrl = (url) => {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return "index.html";
  if (pathname.endsWith("/")) return `${pathname.slice(1)}index.html`;
  if (pathname.endsWith(".html")) return pathname.slice(1);
  return `${pathname.slice(1)}/index.html`;
};
const parseJsonLd = (html, route) => {
  const parsed = [];
  for (const [index, block] of [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].entries()) {
    try { parsed.push(JSON.parse(block[1])); }
    catch (error) { errors.push(`${route}: JSON-LD block ${index + 1} is invalid: ${error.message}`); }
  }
  return parsed;
};
const collectSchemaTypes = (value, types = new Set()) => {
  if (Array.isArray(value)) { for (const item of value) collectSchemaTypes(item, types); return types; }
  if (!value || typeof value !== "object") return types;
  const type = value["@type"];
  if (Array.isArray(type)) type.forEach((item) => types.add(item));
  else if (typeof type === "string") types.add(type);
  for (const child of Object.values(value)) collectSchemaTypes(child, types);
  return types;
};

const entries = await readdir(dist, { withFileTypes: true });
const sitemapFiles = entries.filter((entry) => entry.isFile() && /^sitemap(?:-[a-z0-9-]+)?\.xml$/i.test(entry.name)).map((entry) => entry.name).sort();
if (!sitemapFiles.length) throw new Error("SEO cluster regression failed: no sitemap files found in dist");
const robots = await readFile(join(dist, "robots.txt"), "utf8");
const urlOwners = new Map();
const clusterUrls = new Set();
for (const sitemapFile of sitemapFiles) {
  const expectedDeclaration = `Sitemap: ${origin}/${sitemapFile}`;
  if (!robots.includes(expectedDeclaration)) errors.push(`/robots.txt: missing declaration for ${sitemapFile}`);
  const xml = await readFile(join(dist, sitemapFile), "utf8");
  const urls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => decode(match[1]));
  if (!urls.length) warnings.push(`/${sitemapFile}: contains no URL entries`);
  for (const url of urls) {
    let parsed;
    try { parsed = new URL(url); } catch { errors.push(`/${sitemapFile}: invalid absolute URL ${url}`); continue; }
    if (parsed.protocol !== "https:" || parsed.hostname !== canonicalHost) errors.push(`/${sitemapFile}: non-canonical host or protocol ${url}`);
    if (parsed.search || parsed.hash) errors.push(`/${sitemapFile}: query string or fragment is not allowed ${url}`);
    const owners = urlOwners.get(url) ?? [];
    owners.push(sitemapFile); urlOwners.set(url, owners);
    if (sitemapFile !== "sitemap.xml") clusterUrls.add(url);
  }
}
for (const [url, owners] of urlOwners) if (owners.length > 1) errors.push(`${url}: appears in multiple sitemaps (${owners.join(", ")})`);

const titleOwners = new Map();
const descriptionOwners = new Map();
for (const url of clusterUrls) {
  const route = new URL(url).pathname;
  const htmlPath = htmlPathFromUrl(url);
  const sitemapOwners = urlOwners.get(url) ?? [];
  const isCaseStudy = sitemapOwners.includes("sitemap-cases.xml");
  const isTrustPage = sitemapOwners.includes("sitemap-trust.xml");
  const isLondon = sitemapOwners.includes("sitemap-london.xml");
  let html;
  try { html = await readFile(join(dist, htmlPath), "utf8"); }
  catch { errors.push(`${route}: sitemap URL has no generated HTML page at ${htmlPath}`); continue; }

  const robotsContent = metaByName(html, "robots").map((tag) => getAttr(tag, "content").toLowerCase()).join(",");
  if (robotsContent.includes("noindex")) errors.push(`${route}: cluster sitemap URL is noindex`);
  const titleElements = elements(html, "title");
  if (titleElements.length !== 1) errors.push(`${route}: expected exactly one title, found ${titleElements.length}`);
  const title = decode(titleElements[0]?.[1] ?? "");
  if (!title) errors.push(`${route}: title is empty`);
  if (title) titleOwners.set(title.toLowerCase(), [...(titleOwners.get(title.toLowerCase()) ?? []), route]);
  const descriptions = metaByName(html, "description");
  if (descriptions.length !== 1) errors.push(`${route}: expected exactly one meta description, found ${descriptions.length}`);
  const description = getAttr(descriptions[0] ?? "", "content");
  if (!description) errors.push(`${route}: meta description is empty`);
  if (description) descriptionOwners.set(description.toLowerCase(), [...(descriptionOwners.get(description.toLowerCase()) ?? []), route]);
  const h1Elements = elements(html, "h1");
  if (h1Elements.length !== 1) errors.push(`${route}: expected exactly one H1, found ${h1Elements.length}`);
  if (!stripTags(h1Elements[0]?.[1] ?? "")) errors.push(`${route}: H1 is empty`);
  const canonicalLinks = linksByRel(html, "canonical");
  if (canonicalLinks.length !== 1) errors.push(`${route}: expected exactly one canonical, found ${canonicalLinks.length}`);
  const canonical = getAttr(canonicalLinks[0] ?? "", "href");
  if (canonical !== url) errors.push(`${route}: canonical mismatch; expected ${url}, received ${canonical || "missing"}`);

  const schemas = parseJsonLd(html, route);
  const schemaTypes = collectSchemaTypes(schemas);
  const isWebApplication = schemaTypes.has("WebApplication");
  const isService = schemaTypes.has("Service");
  const isCourse = schemaTypes.has("Course");
  const isArticle = schemaTypes.has("Article");
  const isCollection = schemaTypes.has("CollectionPage");
  const isFaqPage = schemaTypes.has("FAQPage") && !isService;
  const isWebPage = schemaTypes.has("WebPage");

  let requiredTypes;
  if (isTrustPage) requiredTypes = ["WebPage", "BreadcrumbList"];
  else if (isCaseStudy) requiredTypes = route === "/case/" ? ["CollectionPage", "BreadcrumbList"] : ["CreativeWork", "BreadcrumbList"];
  else if (isLondon) {
    const isLondonGuide = route.includes("/gb/london/guides/");
    const isLocalizedLondon = route.startsWith("/ru/gb/london/") || route.startsWith("/ua/gb/london/");
    const isLondonHub = ["/gb/london/", "/gb/london/marketing/", "/gb/london/it-web-development/", "/gb/london/us-logistics-training/", "/gb/london/academy/"].includes(route);
    const isAcademyUtility = ["/gb/london/academy/how-training-works/", "/gb/london/academy/apply/", "/gb/london/academy/faq/"].includes(route);
    if (isService) requiredTypes = ["Service", "BreadcrumbList", "FAQPage"];
    else if (isCourse) requiredTypes = ["Course", "BreadcrumbList"];
    else if (isArticle || isLondonGuide) requiredTypes = isArticle ? ["Article"] : [];
    else if (isCollection) requiredTypes = ["CollectionPage"];
    else if (isFaqPage) requiredTypes = ["FAQPage"];
    else if (isWebPage) requiredTypes = ["WebPage"];
    else if (isLocalizedLondon || isLondonHub || isAcademyUtility) requiredTypes = [];
    else requiredTypes = ["Service", "BreadcrumbList", "FAQPage"];
  } else if (isWebApplication) requiredTypes = ["WebApplication", "BreadcrumbList"];
  else if (isService) requiredTypes = ["Service", "BreadcrumbList", "FAQPage"];
  else if (isCourse) requiredTypes = ["Course", "BreadcrumbList"];
  else if (isArticle) requiredTypes = ["Article", "BreadcrumbList"];
  else if (isCollection) requiredTypes = ["CollectionPage", "BreadcrumbList"];
  else if (isFaqPage) requiredTypes = ["FAQPage", "BreadcrumbList"];
  else if (isWebPage) requiredTypes = ["WebPage", "BreadcrumbList"];
  else requiredTypes = ["Service", "BreadcrumbList", "FAQPage"];

  for (const requiredType of requiredTypes) if (!schemaTypes.has(requiredType)) errors.push(`${route}: required ${requiredType} schema is missing`);
  const visibleText = stripTags(html).toLowerCase();
  for (const schema of schemas) {
    const queue = Array.isArray(schema) ? [...schema] : [schema];
    while (queue.length) {
      const node = queue.shift();
      if (!node || typeof node !== "object") continue;
      if (node["@type"] === "FAQPage" && Array.isArray(node.mainEntity)) {
        for (const question of node.mainEntity) {
          const questionText = decode(question?.name ?? "").toLowerCase();
          const answerText = decode(question?.acceptedAnswer?.text ?? "").toLowerCase();
          if (questionText && !visibleText.includes(questionText)) errors.push(`${route}: FAQ schema question is not visible: ${question.name}`);
          if (answerText && !visibleText.includes(answerText)) errors.push(`${route}: FAQ schema answer is not visible for: ${question.name}`);
        }
      }
      for (const child of Object.values(node)) {
        if (Array.isArray(child)) queue.push(...child);
        else if (child && typeof child === "object") queue.push(child);
      }
    }
  }
}
for (const [title, routes] of titleOwners) if (routes.length > 1) errors.push(`${routes.join(", ")}: duplicate cluster title ${title}`);
for (const [description, routes] of descriptionOwners) if (routes.length > 1) errors.push(`${routes.join(", ")}: duplicate cluster meta description ${description}`);
for (const warning of warnings) console.warn(`SEO cluster warning — ${warning}`);
if (errors.length) throw new Error(`SEO cluster regression failed with ${errors.length} error(s):\n${errors.map((item) => `- ${item}`).join("\n")}`);
console.log(`SEO cluster regression passed: ${sitemapFiles.length} sitemap file(s), ${clusterUrls.size} cluster URL(s), ${warnings.length} warning(s).`);
