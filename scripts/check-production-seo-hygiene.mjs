import fs from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("artifacts");
const sourceJsonPath = path.join(outputDir, "production-custom-domain-check.json");
const sourceMarkdownPath = path.join(outputDir, "production-custom-domain-check.md");
const jsonPath = path.join(outputDir, "production-seo-hygiene-check.json");
const markdownPath = path.join(outputDir, "production-seo-hygiene-check.md");
const baseUrl = "https://hermeslogisticsus.com";
const calculatorPaths = [
  "/logistics/resources/rpm-calculator/",
  "/logistics/resources/factoring-vs-direct-payment-calculator/",
];

function extractAttribute(html, tagName, identifyingAttribute, identifyingValue, targetAttribute) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
  for (const tag of tags) {
    const identifier = tag.match(new RegExp(`${identifyingAttribute}=["']([^"']+)["']`, "i"))?.[1];
    if (!identifier) continue;
    const tokens = identifier.toLowerCase().split(/\s+/);
    if (!tokens.includes(identifyingValue.toLowerCase())) continue;
    const target = tag.match(new RegExp(`${targetAttribute}=["']([^"']+)["']`, "i"))?.[1];
    if (target) return target;
  }
  return null;
}

async function inspectProductionCalculator(pathname) {
  const expectedUrl = new URL(pathname, baseUrl).toString();
  try {
    const response = await fetch(expectedUrl, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesProductionVerifier/1.1 (+public read-only release check)",
        accept: "text/html,*/*;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(20_000),
    });
    const html = await response.text();
    const canonical = extractAttribute(html, "link", "rel", "canonical", "href");
    const robots = extractAttribute(html, "meta", "name", "robots", "content");
    const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
    return {
      path: pathname,
      status: response.status,
      finalUrl: response.url,
      finalUrlMatches: response.url === expectedUrl,
      canonical,
      canonicalMatches: canonical === expectedUrl,
      robots,
      indexableByMeta: !robots?.toLowerCase().includes("noindex"),
      hasWebApplicationSchema: schemaTypes.includes("WebApplication"),
      cacheStatus: response.headers.get("cf-cache-status"),
      age: response.headers.get("age"),
      error: null,
    };
  } catch (error) {
    return {
      path: pathname,
      status: null,
      finalUrl: null,
      finalUrlMatches: false,
      canonical: null,
      canonicalMatches: false,
      robots: null,
      indexableByMeta: false,
      hasWebApplicationSchema: false,
      cacheStatus: null,
      age: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

await import("./check-production-custom-domain.mjs");

const result = JSON.parse(await fs.readFile(sourceJsonPath, "utf8"));
const sourceMarkdown = await fs.readFile(sourceMarkdownPath, "utf8");
const calculators = [];
for (const pathname of calculatorPaths) calculators.push(await inspectProductionCalculator(pathname));

const calculatorRoutesHealthy = calculators.every((item) =>
  item.status === 200 &&
  item.finalUrlMatches &&
  item.canonicalMatches &&
  item.indexableByMeta &&
  item.hasWebApplicationSchema,
);

const passed =
  result.classification === "LIVE_CURRENT" &&
  result.routeContractHealthy === true &&
  calculatorRoutesHealthy;

const seoResult = {
  checkedAt: result.checkedAt,
  baseUrl: result.baseUrl,
  classification: passed ? "PRODUCTION_SEO_HYGIENE_PASS" : "PRODUCTION_SEO_HYGIENE_REVIEW_REQUIRED",
  sourceClassification: result.classification,
  routeContractHealthy: result.routeContractHealthy,
  calculatorRoutesHealthy,
  calculators,
  canonicalPages: result.canonicalPages,
  noindexPages: result.noindexPages,
  robots: result.robots,
  sitemaps: result.sitemaps,
  sitemapIndex: result.sitemapIndex,
  llms: result.llms,
  notFound: result.notFound,
  boundaries: result.boundaries,
};

const markdown = [
  sourceMarkdown.trimEnd(),
  "",
  "## Carrier calculator production routes",
  "",
  "| Path | Status | Final URL | Canonical | Indexable | WebApplication | Cache |",
  "| --- | ---: | --- | --- | --- | --- | --- |",
  ...calculators.map((item) => `| ${item.path} | ${item.status ?? "—"} | ${item.finalUrlMatches ? "yes" : "no"} | ${item.canonicalMatches ? "yes" : "no"} | ${item.indexableByMeta ? "yes" : "no"} | ${item.hasWebApplicationSchema ? "yes" : "no"} | ${item.cacheStatus ?? "—"} |`),
  "",
  `- Calculator route contract healthy: **${calculatorRoutesHealthy ? "yes" : "no"}**`,
  "",
  "## SEO 11 production-hygiene decision",
  "",
  `- Result: **${seoResult.classification}**`,
  `- Source classification: **${result.classification}**`,
  `- Route/index-hygiene contract healthy: **${result.routeContractHealthy ? "yes" : "no"}**`,
  `- Calculator route contract healthy: **${calculatorRoutesHealthy ? "yes" : "no"}**`,
  "- Authenticated GSC/Bing index reasons remain tracked separately in Issue #206.",
  "",
].join("\n");

await fs.writeFile(jsonPath, `${JSON.stringify(seoResult, null, 2)}\n`);
await fs.writeFile(markdownPath, markdown);
console.log(markdown);

if (!passed) process.exitCode = result.classification === "UNRESOLVED_NETWORK_ACCESS" ? 3 : 4;
