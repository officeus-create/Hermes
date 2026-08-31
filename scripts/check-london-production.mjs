const baseUrl = "https://hermeslogisticsus.com";

const representativePages = [
  "/gb/london/",
  "/gb/london/marketing/",
  "/gb/london/it-web-development/",
  "/gb/london/us-logistics-training/",
  "/gb/london/seo-services/",
  "/gb/london/academy/",
  "/ru/gb/london/",
  "/ua/gb/london/",
];

const londonSitemapPath = "/sitemap-london.xml";
const sitemapIndexPath = "/sitemapindex.xml";
const robotsPath = "/robots.txt";
const expectedLondonSitemapUrl = `${baseUrl}${londonSitemapPath}`;
const expectedLondonUrlCount = 52;
const maxAttempts = Number(process.env.LONDON_PRODUCTION_ATTEMPTS || 12);
const retryDelayMs = Number(process.env.LONDON_PRODUCTION_RETRY_MS || 10_000);

function extractCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1] ?? "";
    if (!rel.toLowerCase().split(/\s+/).includes("canonical")) continue;
    return tag.match(/href=["']([^"']+)["']/i)?.[1] ?? null;
  }
  return null;
}

function extractRobots(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = tag.match(/name=["']([^"']+)["']/i)?.[1] ?? "";
    if (name.toLowerCase() !== "robots") continue;
    return tag.match(/content=["']([^"']+)["']/i)?.[1] ?? null;
  }
  return null;
}

async function fetchPublic(pathname) {
  const url = new URL(pathname, baseUrl).toString();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesLondonProductionVerifier/1.0 (+public read-only release check)",
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(20_000),
    });
    return {
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      cacheStatus: response.headers.get("cf-cache-status"),
      body: await response.text(),
      error: null,
    };
  } catch (error) {
    return {
      requestedUrl: url,
      finalUrl: null,
      status: null,
      contentType: null,
      cacheStatus: null,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runAttempt() {
  const pages = [];
  for (const pathname of representativePages) {
    const fetched = await fetchPublic(pathname);
    const expectedUrl = new URL(pathname, baseUrl).toString();
    const canonical = extractCanonical(fetched.body);
    const robots = extractRobots(fetched.body);
    pages.push({
      path: pathname,
      status: fetched.status,
      finalUrl: fetched.finalUrl,
      finalUrlMatches: fetched.finalUrl === expectedUrl,
      canonical,
      canonicalMatches: canonical === expectedUrl,
      robots,
      indexable: !robots?.toLowerCase().includes("noindex"),
      cacheStatus: fetched.cacheStatus,
      error: fetched.error,
    });
  }

  const sitemap = await fetchPublic(londonSitemapPath);
  const sitemapLocs = [...sitemap.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
  const representativeUrls = representativePages.map((pathname) => new URL(pathname, baseUrl).toString());
  const sitemapHasRepresentatives = representativeUrls.every((url) => sitemapLocs.includes(url));

  const sitemapIndex = await fetchPublic(sitemapIndexPath);
  const sitemapIndexLocs = [...sitemapIndex.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
  const robots = await fetchPublic(robotsPath);

  const pageContractHealthy = pages.every((page) =>
    page.status === 200 &&
    page.finalUrlMatches &&
    page.canonicalMatches &&
    page.indexable &&
    !page.error
  );
  const sitemapContractHealthy =
    sitemap.status === 200 &&
    sitemap.finalUrl === new URL(londonSitemapPath, baseUrl).toString() &&
    /<urlset\b/i.test(sitemap.body) &&
    sitemapLocs.length === expectedLondonUrlCount &&
    sitemapHasRepresentatives;
  const discoveryContractHealthy =
    sitemapIndex.status === 200 &&
    sitemapIndexLocs.includes(expectedLondonSitemapUrl) &&
    robots.status === 200 &&
    robots.body.includes(expectedLondonSitemapUrl);

  const healthy = pageContractHealthy && sitemapContractHealthy && discoveryContractHealthy;
  return {
    healthy,
    checkedAt: new Date().toISOString(),
    pages,
    sitemap: {
      status: sitemap.status,
      finalUrl: sitemap.finalUrl,
      urlCount: sitemapLocs.length,
      expectedUrlCount: expectedLondonUrlCount,
      hasRepresentativeUrls: sitemapHasRepresentatives,
      cacheStatus: sitemap.cacheStatus,
      error: sitemap.error,
    },
    sitemapIndex: {
      status: sitemapIndex.status,
      includesLondonSitemap: sitemapIndexLocs.includes(expectedLondonSitemapUrl),
      error: sitemapIndex.error,
    },
    robots: {
      status: robots.status,
      declaresLondonSitemap: robots.body.includes(expectedLondonSitemapUrl),
      error: robots.error,
    },
  };
}

let result = null;
for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  result = await runAttempt();
  console.log(`London production verification attempt ${attempt}/${maxAttempts}: ${result.healthy ? "LIVE_CURRENT" : "NOT_READY"}`);
  if (result.healthy) break;
  if (attempt < maxAttempts) await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
}

console.log(JSON.stringify(result, null, 2));
if (!result?.healthy) process.exit(1);
