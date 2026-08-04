import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://hermeslogisticsus.com";
const outputDir = path.resolve("artifacts");

const canonicalPages = [
  "/",
  "/logistics/car-hauling-dispatch/",
  "/logistics/dealer-vehicle-transportation/",
  "/load-board/",
  "/services/seo/",
];

const noindexPages = [
  "/logistics/start-car-hauling-dispatch/",
  "/logistics/request-vehicle-transport/",
];

const sitemapPaths = [
  "/sitemap.xml",
  "/sitemap-local.xml",
  "/sitemap-services.xml",
  "/sitemap-digital-services.xml",
  "/sitemap-academy.xml",
  "/sitemap-cases.xml",
  "/sitemap-trust.xml",
];

const expectedCurrentMarkers = [
  "Website inquiries are delivered securely by email",
  "Direct contact available now",
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
        "user-agent": "HermesProductionVerifier/1.0 (+public read-only release check)",
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
  const canonical = extractAttribute(fetched.body, "link", "rel", "canonical", "href");
  const robots = extractAttribute(fetched.body, "meta", "name", "robots", "content");
  return {
    path: pathname,
    status: fetched.status,
    finalUrl: fetched.finalUrl,
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
for (const pathname of sitemapPaths) {
  const fetched = await fetchPublic(pathname);
  sitemapResults.push({
    path: pathname,
    status: fetched.status,
    finalUrl: fetched.finalUrl,
    contentType: fetched.contentType,
    looksLikeSitemap: /<(urlset|sitemapindex)\b/i.test(fetched.body),
    durationMs: fetched.durationMs,
    error: fetched.error,
  });
}

const networkFailure = [
  ...canonicalResults,
  ...noindexResults,
  robotsResult,
  ...sitemapResults,
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
  canonicalResults.every((result) => result.status === 200 && result.canonicalMatches && result.indexableByMeta) &&
  noindexResults.every((result) => result.status === 200 && result.hasNoindex && result.allowsFollow) &&
  robotsResult.status === 200 &&
  robotsResult.includesAllSitemaps &&
  sitemapResults.every((result) => result.status === 200 && result.looksLikeSitemap);

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
  classificationReasons.push("Required current markers and the public route contract are present.");
} else {
  classificationReasons.push("Homepage markers are current, but one or more route/discovery contracts are inconsistent.");
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
    note: "This verifies the public custom-domain response from a GitHub-hosted runner. It does not identify private Cloudflare resource IDs or replace Search Console/Bing crawl evidence.",
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
  routeContractHealthy,
};

const markdown = [
  "# Production custom-domain check",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Domain: ${baseUrl}`,
  `- Classification: **${classification}**`,
  `- Route contract healthy: **${routeContractHealthy ? "yes" : "no"}**`,
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
  "| Path | Status | Canonical matches | Indexable by meta | Cache |",
  "| --- | ---: | --- | --- | --- |",
  ...canonicalResults.map((item) => `| ${item.path} | ${item.status ?? "—"} | ${item.canonicalMatches ? "yes" : "no"} | ${item.indexableByMeta ? "yes" : "no"} | ${item.cacheStatus ?? "—"} |`),
  "",
  "## Noindex workspaces",
  "",
  "| Path | Status | noindex | follow allowed |",
  "| --- | ---: | --- | --- |",
  ...noindexResults.map((item) => `| ${item.path} | ${item.status ?? "—"} | ${item.hasNoindex ? "yes" : "no"} | ${item.allowsFollow ? "yes" : "no"} |`),
  "",
  "## Discovery files",
  "",
  `- robots.txt status: ${robotsResult.status ?? "—"}`,
  `- robots.txt declares all seven controlled sitemaps: ${robotsResult.includesAllSitemaps ? "yes" : "no"}`,
  ...sitemapResults.map((item) => `- ${item.path}: status ${item.status ?? "—"}; sitemap XML ${item.looksLikeSitemap ? "recognized" : "not recognized"}`),
  "",
  "> Read-only verification only. No form was submitted, no lead was created, and no credentials or private infrastructure identifiers were collected.",
  "",
].join("\n");

await fs.writeFile(path.join(outputDir, "production-custom-domain-check.json"), `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, "production-custom-domain-check.md"), markdown);

console.log(markdown);
