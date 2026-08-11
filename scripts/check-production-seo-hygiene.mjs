import fs from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("artifacts");
const sourceJsonPath = path.join(outputDir, "production-custom-domain-check.json");
const sourceMarkdownPath = path.join(outputDir, "production-custom-domain-check.md");
const jsonPath = path.join(outputDir, "production-seo-hygiene-check.json");
const markdownPath = path.join(outputDir, "production-seo-hygiene-check.md");

await import("./check-production-custom-domain.mjs");

const result = JSON.parse(await fs.readFile(sourceJsonPath, "utf8"));
const sourceMarkdown = await fs.readFile(sourceMarkdownPath, "utf8");
const passed = result.classification === "LIVE_CURRENT" && result.routeContractHealthy === true;

const seoResult = {
  checkedAt: result.checkedAt,
  baseUrl: result.baseUrl,
  classification: passed ? "PRODUCTION_SEO_HYGIENE_PASS" : "PRODUCTION_SEO_HYGIENE_REVIEW_REQUIRED",
  sourceClassification: result.classification,
  routeContractHealthy: result.routeContractHealthy,
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
  "## SEO 11 production-hygiene decision",
  "",
  `- Result: **${seoResult.classification}**`,
  `- Source classification: **${result.classification}**`,
  `- Route/index-hygiene contract healthy: **${result.routeContractHealthy ? "yes" : "no"}**`,
  "- Authenticated GSC/Bing index reasons remain tracked separately in Issue #206.",
  "",
].join("\n");

await fs.writeFile(jsonPath, `${JSON.stringify(seoResult, null, 2)}\n`);
await fs.writeFile(markdownPath, markdown);
console.log(markdown);

if (!passed) process.exitCode = result.classification === "UNRESOLVED_NETWORK_ACCESS" ? 3 : 4;
