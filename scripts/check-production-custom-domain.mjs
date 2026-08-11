import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://hermeslogisticsus.com";
const outputDir = path.resolve("artifacts");

const canonicalPages = [
  "/",
  "/logistics/car-hauling-dispatch/",
  "/logistics/dealer-vehicle-transportation/",
  "/logistics/auction-vehicle-pickup/",
  "/logistics/appleton-wi-vehicle-transport/",
  "/load-board/",
  "/services/seo/",
  "/services/website-development/",
  "/academy/us-logistics-operations/",
];

const noindexPages = [
  "/logistics/start-car-hauling-dispatch/",
  "/logistics/request-vehicle-transport/",
  "/business-growth/",
];

const childSitemapPaths = [
  "/sitemap.xml",
  "/sitemap-local.xml",
  "/sitemap-services.xml",
  "/sitemap-digital-services.xml",
  "/sitemap-academy.xml",
  "/sitemap-cases.xml",
  "/sitemap-trust.xml",
];
const sitemapIndexPath = "/sitemapindex.xml";
const sitemapPaths = [sitemapIndexPath, ...childSitemapPaths];

const expectedCurrentMarkers = [
  "Website inquiries are delivered securely by email",
  "Direct contact available now",
  "U.S. logistics · International email coordination",
];

const staleMarkers = [
  "Contact mode: Preview",
  "Contact submission pending connection",
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

async function fetchPublic(pathname) {
  const url = new URL(pathname, baseUrl).toString();
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesProductionVerifier/1.1 (+public read-only release check)",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    return {
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      durationMs: Date.now() - startedAt,
      contentType: response.headers.get("content-type"),
      cacheStatus: response.headers.get("cf-cache-status"),
      age: response.headers.get("age"),
      body,
      error: null,
    };
  } catch (error) {
    return {
      requestedUrl: url,
      finalUrl: null,
      status: null,
      ok: false,
      durationMs: Date.now() - startedAt,
      contentType: null,
      cacheStatus: null,
      age: null,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function inspectCanonicalPage(pathname, fetched) {
  const expectedCanonical = new URL(pathname, baseUrl).toString();
  const canonical = extractAttribute(fetched.body, "link", "rel", "canonical", "href");
  const robots = extractAttribute(fetched.body, "meta", "name", "robots", "content");
  return {
    path: pathname,
    status: fetched.status,
    finalUrl: fetched.finalUrl,
    finalUrlMatches: fetched.finalUrl === expectedCanonical,
    unexpectedRedirect: Boolean(fetched.finalUrl && fetched.finalUrl !== expectedCanonical),
    canonical,
    expectedCanonical,
    canonicalMatches: canonical === expectedCanonical,
    robots,
    indexableByMeta: !robots?.toLowerCase().includes("noindex"),
    cacheStatus: fetched.cacheStatus,
    age: fetched.age,
    durationMs: fetched.durationMs,
    error: fetched.error,
  };
}

function inspectNoindexPage(pathname, fetched) {
  const expectedUrl = new URL(pathname, baseUrl).toString();
  const canonical = extractAttribute(fetched.body, "link", "rel", "canonical", "href");
  const robots = extractAttribute(fetched.body, "meta", "name", "robots", "content");
  return {
    path: pathname,
    status: fetched.status,
    finalUrl: fetched.finalUrl,
    finalUrlMatches: fetched.finalUrl === expectedUrl,
    unexpectedRedirect: Boolean(fetched.finalUrl && fetched.finalUrl !== expectedUrl),
    canonical,
    robots,
    hasNoindex: Boolean(robots?.toLowerCase().includes("noindex")),
    allowsFollow: !robots || robots.toLowerCase().includes("follow"),
    cacheStatus: fetched.cacheStatus,
    age: fetched.age,
    durationMs: fetched.durationMs,
    error: fetched.error,
  };
}

await fs.mkdir(outputDir, { recursive: true });

const homepage = await fetchPublic("/");
const currentMarkerChecks = Object.fromEntries(
  expectedCurrentMarkers.map((marker) => [marker, homepage.body.includes(marker)]),
);
const staleMarkerChecks = Object.fromEntries(
  staleMarkers.map((marker) => [marker, homepage.body.includes(marker)]),
);

const canonicalResults = [];
for (const pathname of canonicalPages) {
  canonicalResults.push(inspectCanonicalPage(pathname, pathname === "/" ? homepage : await fetchPublic(pathname)));
}

const noindexResults = [];
for (const pathname of noindexPages) {
  noindexResults.push(inspectNoindexPage(pathname, await fetchPublic(pathname)));
}

const robotsFetch = await fetchPublic("/robots.txt");
const robotsResult = {
  status: robotsFetch.status,
  finalUrl: robotsFetch.finalUrl,
  finalUrlMatches: robotsFetch.finalUrl === new URL("/robots.txt", baseUrl).toString(),
  includesAllSitemaps: sitemapPaths.every((pathname) =>
    robotsFetch.body.includes(new URL(pathname, baseUrl).toString()),
  ),
  sitemapDeclarations: sitemapPaths.map((pathname) => ({
    url: new URL(pathname, baseUrl).toString(),
    declared: robotsFetch.body.includes(new URL(pathname, baseUrl).toString()),
  })),
  error: robotsFetch.error,
};

const sitemapResults = [];
let sitemapIndexLocs = [];
for (const pathname of sitemapPaths) {
  const fetched = await fetchPublic(pathname);
  if (pathname === sitemapIndexPath) {
    sitemapIndexLocs = [...fetched.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
  }
  sitemapResults.push({
    path: pathname,
    status: fetched.status,
    finalUrl: fetched.finalUrl,
    finalUrlMatches: fetched.finalUrl === new URL(pathname, baseUrl).toString(),
    contentType: fetched.contentType,
    looksLikeSitemap: /<(urlset|sitemapindex)\b/i.test(fetched.body),
    durationMs: fetched.durationMs,
    error: fetched.error,
  });
}

const expectedChildSitemapUrls = childSitemapPaths.map((pathname) => new URL(pathname, baseUrl).toString());
const sitemapIndexMissingChildren = expectedChildSitemapUrls.filter((url) => !sitemapIndexLocs.includes(url));
const sitemapIndexUnexpectedChildren = sitemapIndexLocs.filter((url) => !expectedChildSitemapUrls.includes(url));
const sitemapIndexResult = {
  path: sitemapIndexPath,
  expectedChildren: expectedChildSitemapUrls.length,
  discoveredChildren: sitemapIndexLocs.length,
  referencesAllChildren: sitemapIndexMissingChildren.length === 0,
  exactControlledChildren: sitemapIndexMissingChildren.length === 0 && sitemapIndexUnexpectedChildren.length === 0,
  missingChildren: sitemapIndexMissingChildren,
  unexpectedChildren: sitemapIndexUnexpectedChildren,
};

const llmsFetch = await fetchPublic("/llms.txt");
const llmsExpectedUrl = new URL("/llms.txt", baseUrl).toString();
const llmsResult = {
  status: llmsFetch.status,
  finalUrl: llmsFetch.finalUrl,
  finalUrlMatches: llmsFetch.finalUrl === llmsExpectedUrl,
  contentType: llmsFetch.contentType,
  hasMarkdownH1: /^#\s+\S.+$/m.test(llmsFetch.body),
  markdownLinkCount: (llmsFetch.body.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) ?? []).length,
  hasMarkdownLinks: /\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(llmsFetch.body),
  durationMs: llmsFetch.durationMs,
  error: llmsFetch.error,
};

const notFoundPath = "/__hermes-seo-healthcheck-nonexistent__/";
const notFoundFetch = await fetchPublic(notFoundPath);
const notFoundResult = {
  path: notFoundPath,
  status: notFoundFetch.status,
  finalUrl: notFoundFetch.finalUrl,
  expectedUrl: new URL(notFoundPath, baseUrl).toString(),
  finalUrlMatches: notFoundFetch.finalUrl === new URL(notFoundPath, baseUrl).toString(),
  isReal404: notFoundFetch.status === 404,
  durationMs: notFoundFetch.durationMs,
  error: notFoundFetch.error,
};

const networkFailure = [
  ...canonicalResults,
  ...noindexResults,
  robotsResult,
  ...sitemapResults,
  llmsResult,
  notFoundResult,
].some((result) => result.error || !result.status);

const missingCurrentMarkers = Object.entries(currentMarkerChecks)
  .filter(([, found]) => !found)
  .map(([marker]) => marker);
const presentStaleMarkers = Object.entries(staleMarkerChecks)
  .filter(([, found]) => found)
  .map(([marker]) => marker);
const allCurrentMarkersFound = missingCurrentMarkers.length === 0;
const staleMarkerFound = presentStaleMarkers.length > 0;
const routeContractHealthy =
  canonicalResults.every((result) => result.status === 200 && result.finalUrlMatches && result.canonicalMatches && result.indexableByMeta) &&
  noindexResults.every((result) => result.status === 200 && result.finalUrlMatches && result.hasNoindex && result.allowsFollow) &&
  robotsResult.status === 200 &&
  robotsResult.finalUrlMatches &&
  robotsResult.includesAllSitemaps &&
  sitemapResults.every((result) => result.status === 200 && result.finalUrlMatches && result.looksLikeSitemap) &&
  sitemapIndexResult.exactControlledChildren &&
  llmsResult.status === 200 &&
  llmsResult.finalUrlMatches &&
  llmsResult.hasMarkdownH1 &&
  llmsResult.hasMarkdownLinks &&
  notFoundResult.isReal404 &&
  notFoundResult.finalUrlMatches;

let classification = "MIXED_EDGE_OR_CACHE_STATE";
const classificationReasons = [];
if (networkFailure) {
  classification = "UNRESOLVED_NETWORK_ACCESS";
  classificationReasons.push("At least one required public request failed or returned no status.");
} else if (staleMarkerFound || !allCurrentMarkersFound) {
  classification = "LIVE_STALE_DEPLOYMENT";
  if (presentStaleMarkers.length) {
    classificationReasons.push(`Stale homepage markers are present: ${presentStaleMarkers.join(" | ")}`);
  }
  if (missingCurrentMarkers.length) {
    classificationReasons.push(`Required current homepage markers are missing: ${missingCurrentMarkers.join(" | ")}`);
  }
} else if (routeContractHealthy) {
  classification = "LIVE_CURRENT";
  classificationReasons.push("Required current markers and the public route/discovery/index-hygiene contract are present.");
} else {
  classificationReasons.push("Homepage markers are current, but one or more route, discovery, redirect, llms.txt, sitemap-index, or 404 contracts are inconsistent.");
}

const result = {
  checkedAt: new Date().toISOString(),
  baseUrl,
  classification,
  classificationReasons,
  boundaries: {
    publicReadOnly: true,
    noFormsSubmitted: true,
    noCredentialsUsed: true,
    noPrivateDataCollected: true,
    noThirdPartyLinkCrawl: true,
    note: "This verifies the public custom-domain response from a GitHub-hosted runner. It does not replace authenticated Search Console/Bing index reasons, Google-selected canonical evidence, or search-engine soft-404 classification.",
  },
  homepage: {
    status: homepage.status,
    finalUrl: homepage.finalUrl,
    cacheStatus: homepage.cacheStatus,
    age: homepage.age,
    durationMs: homepage.durationMs,
    currentMarkerChecks,
    staleMarkerChecks,
    missingCurrentMarkers,
    presentStaleMarkers,
    error: homepage.error,
  },
  canonicalPages: canonicalResults,
  noindexPages: noindexResults,
  robots: robotsResult,
  sitemaps: sitemapResults,
  sitemapIndex: sitemapIndexResult,
  llms: llmsResult,
  notFound: notFoundResult,
  routeContractHealthy,
};

const markdown = [
  "# Production custom-domain check",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Domain: ${baseUrl}`,
  `- Classification: **${classification}**`,
  `- Route/index-hygiene contract healthy: **${routeContractHealthy ? "yes" : "no"}**`,
  `- Homepage status: ${homepage.status ?? "unavailable"}`,
  `- Homepage final URL: ${homepage.finalUrl ?? "unavailable"}`,
  `- Cloudflare cache status: ${homepage.cacheStatus ?? "not exposed"}`,
  `- Age header: ${homepage.age ?? "not exposed"}`,
  "",
  "## Classification reasons",
  "",
  ...classificationReasons.map((reason) => `- ${reason}`),
  "",
  "## Homepage markers",
  "",
  ...Object.entries(currentMarkerChecks).map(([marker, found]) => `- Current marker ${found ? "✅" : "❌"}: \`${marker}\``),
  ...Object.entries(staleMarkerChecks).map(([marker, found]) => `- Stale marker ${found ? "⚠️ present" : "✅ absent"}: \`${marker}\``),
  "",
  "## Canonical pages",
  "",
  "| Path | Status | Final URL matches | Canonical matches | Indexable by meta | Cache |",
  "| --- | ---: | --- | --- | --- | --- |",
  ...canonicalResults.map((item) => `| ${item.path} | ${item.status ?? "—"} | ${item.finalUrlMatches ? "yes" : "no"} | ${item.canonicalMatches ? "yes" : "no"} | ${item.indexableByMeta ? "yes" : "no"} | ${item.cacheStatus ?? "—"} |`),
  "",
  "## Noindex workspaces",
  "",
  "| Path | Status | Final URL matches | noindex | follow allowed |",
  "| --- | ---: | --- | --- | --- |",
  ...noindexResults.map((item) => `| ${item.path} | ${item.status ?? "—"} | ${item.finalUrlMatches ? "yes" : "no"} | ${item.hasNoindex ? "yes" : "no"} | ${item.allowsFollow ? "yes" : "no"} |`),
  "",
  "## Discovery files",
  "",
  `- robots.txt status: ${robotsResult.status ?? "—"}`,
  `- robots.txt declares sitemap index + all seven controlled child sitemaps: ${robotsResult.includesAllSitemaps ? "yes" : "no"}`,
  ...sitemapResults.map((item) => `- ${item.path}: status ${item.status ?? "—"}; final URL ${item.finalUrlMatches ? "matches" : "drifted"}; sitemap XML ${item.looksLikeSitemap ? "recognized" : "not recognized"}`),
  `- sitemap index controlled children: ${sitemapIndexResult.discoveredChildren}/${sitemapIndexResult.expectedChildren}; exact set ${sitemapIndexResult.exactControlledChildren ? "yes" : "no"}`,
  `- llms.txt: status ${llmsResult.status ?? "—"}; H1 ${llmsResult.hasMarkdownH1 ? "yes" : "no"}; Markdown links ${llmsResult.markdownLinkCount}`,
  `- synthetic nonexistent path: status ${notFoundResult.status ?? "—"}; real HTTP 404 ${notFoundResult.isReal404 ? "yes" : "no"}; final URL ${notFoundResult.finalUrlMatches ? "matches" : "drifted"}`,
  "",
  "> Read-only verification only. No form was submitted, no lead was created, no credentials or private infrastructure identifiers were collected. A real HTTP 404 check is only a basic server contract and does not substitute for Google/Bing soft-404 or index-reason evidence.",
  "",
].join("\n");

await fs.writeFile(path.join(outputDir, "production-custom-domain-check.json"), `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, "production-custom-domain-check.md"), markdown);

console.log(markdown);
