import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const baseUrl = "https://hermeslogisticsus.com";
const localePrefixes = new Map([["ua", "uk"], ["ru", "ru"], ["es", "es"], ["fr", "fr"], ["it", "it"]]);
const rootCluster = new Map([
  ["en", "/"],
  ["uk", "/ua/"],
  ["ru", "/ru/"],
  ["es", "/es/"],
  ["fr", "/fr/"],
  ["it", "/it/"],
  ["x-default", "/"],
]);

const decode = (value = "") => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").trim();
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find(Boolean) ?? "");
const canonicalOf = (html) => {
  const tag = tags(html, "link").find((item) => attr(item, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  return tag ? attr(tag, "href") : "";
};
const alternatesOf = (html) => new Map(tags(html, "link").filter((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && attr(tag, "hreflang")).map((tag) => [attr(tag, "hreflang").toLowerCase(), attr(tag, "href")]));
const robotsOf = (html) => tags(html, "meta").filter((tag) => attr(tag, "name").toLowerCase() === "robots").map((tag) => attr(tag, "content").toLowerCase()).join(",");
const descriptionOf = (html) => attr(tags(html, "meta").find((tag) => attr(tag, "name").toLowerCase() === "description") ?? "", "content");
const titleOf = (html) => decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ") ?? "");
const localeForPath = (pathname) => localePrefixes.get(pathname.split("/").filter(Boolean)[0] ?? "") ?? (pathname === "/" ? "en" : null);
const absolute = (href) => new URL(href, baseUrl).toString();

async function expectedLocalizedUrls() {
  const publicDir = path.resolve("public");
  const files = (await fs.readdir(publicDir)).filter((name) => /^sitemap.*\.xml$/i.test(name));
  const urls = new Set([...rootCluster.values()].map(absolute));
  for (const file of files) {
    const xml = await fs.readFile(path.join(publicDir, file), "utf8");
    for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
      const value = decode(match[1]);
      try {
        const url = new URL(value);
        if (url.origin !== baseUrl) continue;
        if (localeForPath(url.pathname)) urls.add(url.toString());
      } catch {}
    }
  }
  return [...urls].sort();
}

export async function runProductionMultilingualSeoCheck() {
  const expectedUrls = await expectedLocalizedUrls();
  const cache = new Map();
  const errors = [];

  async function fetchPage(url) {
    if (cache.has(url)) return cache.get(url);
    let record;
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "user-agent": "HermesMultilingualProductionVerifier/1.0 (+public read-only release check)",
          accept: "text/html,*/*;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
        },
        signal: AbortSignal.timeout(20_000),
      });
      const html = await response.text();
      record = {
        url,
        status: response.status,
        finalUrl: response.url,
        html,
        lang: html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "",
        canonical: canonicalOf(html),
        robots: robotsOf(html),
        title: titleOf(html),
        description: descriptionOf(html),
        h1Count: [...html.matchAll(/<h1\b[^>]*>/gi)].length,
        alternates: alternatesOf(html),
        error: null,
      };
    } catch (error) {
      record = { url, status: null, finalUrl: null, html: "", lang: "", canonical: "", robots: "", title: "", description: "", h1Count: 0, alternates: new Map(), error: error instanceof Error ? error.message : String(error) };
    }
    cache.set(url, record);
    return record;
  }

  for (const url of expectedUrls) {
    const page = await fetchPage(url);
    const parsed = new URL(url);
    const locale = localeForPath(parsed.pathname);
    if (page.status !== 200) errors.push(`${parsed.pathname}: expected HTTP 200, received ${page.status ?? page.error ?? "network error"}`);
    if (page.finalUrl !== url) errors.push(`${parsed.pathname}: final URL mismatch (${page.finalUrl ?? "missing"})`);
    if (page.canonical !== url) errors.push(`${parsed.pathname}: self-canonical expected ${url}, received ${page.canonical || "missing"}`);
    if (locale && !(page.lang === locale || page.lang.startsWith(`${locale}-`))) errors.push(`${parsed.pathname}: expected lang=${locale} or ${locale}-*, received ${page.lang || "missing"}`);
    if (page.robots.includes("noindex")) errors.push(`${parsed.pathname}: sitemap-owned localized URL is noindex in production`);
    if (!page.title) errors.push(`${parsed.pathname}: title missing in production`);
    if (!page.description) errors.push(`${parsed.pathname}: meta description missing in production`);
    if (page.h1Count !== 1) errors.push(`${parsed.pathname}: expected exactly one H1, received ${page.h1Count}`);
    if (page.alternates.has("ua")) errors.push(`${parsed.pathname}: obsolete hreflang=ua found in production; use uk`);

    for (const [language, href] of page.alternates) {
      if (language === "x-default") continue;
      let targetUrl;
      try { targetUrl = absolute(href); }
      catch { errors.push(`${parsed.pathname}: invalid hreflang ${language} URL ${href}`); continue; }
      if (new URL(targetUrl).origin !== baseUrl) continue;
      const target = await fetchPage(targetUrl);
      if (target.status !== 200) errors.push(`${parsed.pathname}: hreflang ${language} target is not HTTP 200: ${targetUrl}`);
      if (target.canonical !== targetUrl) errors.push(`${parsed.pathname}: hreflang ${language} target is not self-canonical: ${targetUrl}`);
      if (target.robots.includes("noindex")) errors.push(`${parsed.pathname}: hreflang ${language} target is noindex: ${targetUrl}`);
      if (locale) {
        const reciprocal = target.alternates.get(locale);
        if (!reciprocal) errors.push(`${parsed.pathname}: hreflang ${language} target omits reciprocal ${locale}: ${targetUrl}`);
        else if (absolute(reciprocal) !== url) errors.push(`${parsed.pathname}: hreflang ${language} target does not reciprocate ${locale}: ${targetUrl}`);
      }
    }
  }

  for (const [language, pathname] of rootCluster) {
    if (language === "x-default") continue;
    const page = await fetchPage(absolute(pathname));
    for (const [expectedLanguage, expectedPath] of rootCluster) {
      const actual = page.alternates.get(expectedLanguage);
      const expected = absolute(expectedPath);
      if (!actual || absolute(actual) !== expected) errors.push(`${pathname}: root hreflang ${expectedLanguage} expected ${expected}, received ${actual || "missing"}`);
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    baseUrl,
    passed: errors.length === 0,
    expectedLocalizedUrls,
    checkedPageCount: cache.size,
    pages: [...cache.values()].map(({ html, alternates, ...page }) => ({ ...page, alternates: Object.fromEntries(alternates) })),
    errors,
  };
}

async function writeStandaloneResult() {
  const result = await runProductionMultilingualSeoCheck();
  const outputDir = path.resolve("artifacts");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "production-multilingual-seo-check.json"), `${JSON.stringify(result, null, 2)}\n`);
  const markdown = [
    "# Production Multilingual SEO Check",
    "",
    `- Checked: ${result.checkedAt}`,
    `- Result: **${result.passed ? "PASS" : "REVIEW REQUIRED"}**`,
    `- Localized sitemap/root URLs: **${result.expectedLocalizedUrls.length}**`,
    `- Total fetched pages including hreflang targets: **${result.checkedPageCount}**`,
    "",
    ...(result.errors.length ? ["## Errors", "", ...result.errors.map((error) => `- ${error}`), ""] : ["No multilingual production SEO violations found.", ""]),
  ].join("\n");
  await fs.writeFile(path.join(outputDir, "production-multilingual-seo-check.md"), markdown);
  console.log(markdown);
  if (!result.passed) process.exitCode = 4;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await writeStandaloneResult();
