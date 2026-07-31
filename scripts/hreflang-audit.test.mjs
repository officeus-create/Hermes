import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const origin = "https://hermeslogisticsus.com";

const cluster = [
  { lang: "en", route: "/", htmlPath: "index.html" },
  { lang: "uk", route: "/ua/", htmlPath: "ua/index.html" },
  { lang: "ru", route: "/ru/", htmlPath: "ru/index.html" },
  { lang: "es", route: "/es/", htmlPath: "es/index.html" },
  { lang: "it", route: "/it/", htmlPath: "it/index.html" },
  { lang: "fr", route: "/fr/", htmlPath: "fr/index.html" },
];
const expectedAlternates = new Map(cluster.map((item) => [item.lang, `${origin}${item.route}`]));
expectedAlternates.set("x-default", `${origin}/`);
const errors = [];

const decode = (value = "") => value.replaceAll("&amp;", "&").trim();
const getAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};
const linkTags = (html) => [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);

for (const page of cluster) {
  const html = await readFile(join(dist, page.htmlPath), "utf8");
  const langMatch = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i);
  if (langMatch?.[1] !== page.lang) errors.push(`${page.route}: expected html lang=${page.lang}, received ${langMatch?.[1] || "missing"}`);

  const alternates = new Map(
    linkTags(html)
      .filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && getAttr(tag, "hreflang"))
      .map((tag) => [getAttr(tag, "hreflang").toLowerCase(), getAttr(tag, "href")]),
  );

  for (const [lang, expectedUrl] of expectedAlternates) {
    const actual = alternates.get(lang);
    if (actual !== expectedUrl) errors.push(`${page.route}: hreflang ${lang} expected ${expectedUrl}, received ${actual || "missing"}`);
  }

  const canonical = linkTags(html)
    .filter((tag) => getAttr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"))
    .map((tag) => getAttr(tag, "href"));
  const expectedCanonical = `${origin}${page.route}`;
  if (canonical.length !== 1 || canonical[0] !== expectedCanonical) {
    errors.push(`${page.route}: same-language canonical expected ${expectedCanonical}, received ${canonical.join(", ") || "missing"}`);
  }
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const page of cluster) {
  const escapedUrl = `${origin}${page.route}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const urlBlock = sitemap.match(new RegExp(`<url>\\s*<loc>${escapedUrl}<\\/loc>[\\s\\S]*?<\\/url>`, "i"))?.[0] ?? "";
  if (!urlBlock) {
    errors.push(`/sitemap.xml: localized URL block missing for ${page.route}`);
    continue;
  }
  for (const [lang, expectedUrl] of expectedAlternates) {
    const alternatePattern = new RegExp(`<xhtml:link\\b[^>]*hreflang=["']${lang}["'][^>]*href=["']${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*/?>`, "i");
    if (!alternatePattern.test(urlBlock)) errors.push(`/sitemap.xml: ${page.route} is missing alternate ${lang} -> ${expectedUrl}`);
  }
}

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

for (const htmlPath of await collectHtmlFiles(dist)) {
  const html = await readFile(join(dist, htmlPath), "utf8");
  if (/href=["'][^"']*\/uk\//i.test(html)) errors.push(`${htmlPath}: obsolete /uk/ public link found; Ukrainian public route is /ua/`);
}

if (errors.length) {
  throw new Error(`Hreflang audit failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

console.log(`Hreflang audit passed: ${cluster.length} reciprocal language pages plus x-default, with matching sitemap annotations.`);
