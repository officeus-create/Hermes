import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";
const localePrefixes = new Map([
  ["ua", "uk"],
  ["ru", "ru"],
  ["es", "es"],
  ["fr", "fr"],
  ["it", "it"],
]);
const errors = [];

const decode = (value = "") => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").trim();
const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};
const linkTags = (html) => [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
const metaTags = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
const tagText = (html, name) => decode(html.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ") ?? "");
const visibleText = (html) => decode(html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<!--([\s\S]*?)-->/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
const isValidHreflang = (lang) => lang === "x-default" || /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(lang);

async function collectFiles(directory, predicate, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(absolute, predicate, files);
    else if (predicate(absolute)) files.push(absolute);
  }
  return files;
}

const toPosix = (value) => value.split(sep).join("/");
const htmlPathToRoute = (absolute) => {
  const rel = toPosix(relative(dist, absolute));
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  if (rel.endsWith(".html")) return `/${rel.slice(0, -".html".length)}/`;
  return `/${rel}`;
};
const routeParts = (route) => route.split("/").filter(Boolean);
const semanticParts = (route) => {
  const parts = routeParts(route);
  if (localePrefixes.has(parts[0])) parts.shift();
  return parts;
};
const localeForRoute = (route) => localePrefixes.get(routeParts(route)[0] ?? "") ?? (route === "/" ? "en" : null);
const robotsValue = (html) => metaTags(html).filter((tag) => getAttr(tag, "name").toLowerCase() === "robots").map((tag) => getAttr(tag, "content").toLowerCase()).join(",");
const canonicalUrls = (html) => linkTags(html).filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")).map((tag) => getAttr(tag, "href"));
const alternates = (html) => new Map(linkTags(html).filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && getAttr(tag, "hreflang")).map((tag) => [getAttr(tag, "hreflang").toLowerCase(), getAttr(tag, "href")]));

const htmlFiles = await collectFiles(dist, (file) => file.endsWith(".html"));
const localizedFiles = htmlFiles.filter((file) => {
  const route = htmlPathToRoute(file);
  return localeForRoute(route) && route !== "/";
});
const htmlByRoute = new Map();
for (const file of htmlFiles) htmlByRoute.set(htmlPathToRoute(file), await readFile(file, "utf8"));

const sitemapFiles = await collectFiles(dist, (file) => /(?:^|[\\/])sitemap[^\\/]*\.xml$/i.test(file));
const sitemapXml = (await Promise.all(sitemapFiles.map((file) => readFile(file, "utf8")))).join("\n");
const sitemapLocs = new Set([...sitemapXml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => decode(match[1])));
const titles = new Map();
const descriptions = new Map();

for (const file of localizedFiles) {
  const route = htmlPathToRoute(file);
  const locale = localeForRoute(route);
  const html = htmlByRoute.get(route);
  const canonical = `${origin}${route}`;
  const lang = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
  if (!(lang === locale || lang.startsWith(`${locale}-`))) errors.push(`${route}: expected html lang=${locale} or ${locale}-*, received ${lang || "missing"}`);

  const canonicals = canonicalUrls(html);
  if (canonicals.length !== 1 || canonicals[0] !== canonical) errors.push(`${route}: self-canonical expected ${canonical}, received ${canonicals.join(", ") || "missing"}`);

  const noindex = robotsValue(html).includes("noindex");
  const title = tagText(html, "title");
  const descriptionTag = metaTags(html).find((tag) => getAttr(tag, "name").toLowerCase() === "description") ?? "";
  const description = getAttr(descriptionTag, "content");
  const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
  if (!title) errors.push(`${route}: localized title is missing`);
  if (!description) errors.push(`${route}: localized meta description is missing`);
  if (!noindex && h1Count !== 1) errors.push(`${route}: indexable localized page must render exactly one H1, received ${h1Count}`);
  if (!noindex && visibleText(html).length < 300) errors.push(`${route}: indexable localized page is unexpectedly thin (<300 visible characters)`);

  if (title) {
    const prior = titles.get(title);
    if (prior && prior !== route) errors.push(`${route}: duplicate localized title also used by ${prior}: ${title}`);
    else titles.set(title, route);
  }
  if (description) {
    const prior = descriptions.get(description);
    if (prior && prior !== route) errors.push(`${route}: duplicate localized description also used by ${prior}`);
    else descriptions.set(description, route);
  }

  if (!noindex && !sitemapLocs.has(canonical)) errors.push(`${route}: indexable localized canonical is missing from controlled sitemap inventory`);
  if (noindex && sitemapLocs.has(canonical)) errors.push(`${route}: noindex localized URL must not appear in sitemap inventory`);

  const pageAlternates = alternates(html);
  for (const [alternateLang, href] of pageAlternates) {
    if (!isValidHreflang(alternateLang)) errors.push(`${route}: invalid hreflang=${alternateLang}`);
    if (alternateLang === "ua") errors.push(`${route}: hreflang must use uk, never ua`);

    let target;
    try { target = new URL(href, origin); }
    catch { errors.push(`${route}: invalid hreflang URL for ${alternateLang}: ${href}`); continue; }
    if (target.origin !== origin) continue;
    if (target.search || target.hash) errors.push(`${route}: hreflang ${alternateLang} must not contain query/hash: ${target.href}`);
    if (alternateLang === "x-default") continue;

    const targetRoute = target.pathname.endsWith("/") ? target.pathname : `${target.pathname}/`;
    const targetHtml = htmlByRoute.get(targetRoute);
    if (!targetHtml) { errors.push(`${route}: hreflang ${alternateLang} points to missing built page ${targetRoute}`); continue; }
    const targetCanonical = canonicalUrls(targetHtml);
    if (targetCanonical.length !== 1 || targetCanonical[0] !== `${origin}${targetRoute}`) errors.push(`${route}: hreflang target ${targetRoute} is not self-canonical`);
    const reciprocal = alternates(targetHtml).get(locale);
    if (reciprocal !== canonical) errors.push(`${route}: hreflang ${alternateLang} target ${targetRoute} does not reciprocate ${locale} -> ${canonical}`);

    const sourceParts = semanticParts(route);
    const targetParts = semanticParts(targetRoute);
    const targetIsAncestor = targetParts.length < sourceParts.length && targetParts.every((part, index) => sourceParts[index] === part);
    if (targetIsAncestor) errors.push(`${route}: localized child must not use an ancestor as hreflang ${alternateLang} -> ${targetRoute}`);
  }

  if (pageAlternates.size > 0 && pageAlternates.get(locale) !== canonical) errors.push(`${route}: page with hreflang cluster must include self-reference ${locale} -> ${canonical}`);
}

for (const [route, html] of htmlByRoute) {
  const pageAlternates = alternates(html);
  if (pageAlternates.has("ua")) errors.push(`${route}: obsolete hreflang=ua found; Ukrainian language code is uk`);
  for (const [lang, href] of pageAlternates) {
    if (!isValidHreflang(lang)) errors.push(`${route}: invalid hreflang=${lang}`);
    if (!href) errors.push(`${route}: empty hreflang href for ${lang}`);
  }
}

if (errors.length) throw new Error(`Multilingual SEO contract failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
console.log(`Multilingual SEO contract passed: ${localizedFiles.length} localized HTML pages audited across RU/UK/ES/FR/IT for lang, self-canonical, indexability/sitemap ownership, metadata, H1, thin-content floor and reciprocal hreflang integrity.`);
