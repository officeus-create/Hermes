import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://hermeslogisticsus.com";
const jobPath = "/careers/car-hauling-dispatcher/";
const careersPath = "/logistics/careers/";
const sitemapPath = "/sitemap.xml";
const outputDir = path.resolve("artifacts");
const jsonPath = path.join(outputDir, "production-job-posting-check.json");
const markdownPath = path.join(outputDir, "production-job-posting-check.md");

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

async function fetchPublic(pathname, accept = "text/html,*/*;q=0.8") {
  const expectedUrl = new URL(pathname, baseUrl).toString();
  try {
    const response = await fetch(`${expectedUrl}${expectedUrl.includes("?") ? "&" : "?"}seo-job-smoke=${Date.now()}`, {
      redirect: "follow",
      headers: {
        "user-agent": "HermesJobPostingProductionVerifier/1.0 (+public read-only SEO check)",
        accept,
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    return {
      expectedUrl,
      status: response.status,
      finalUrl: response.url.replace(/[?&]seo-job-smoke=\d+$/, ""),
      contentType: response.headers.get("content-type"),
      body,
      error: null,
    };
  } catch (error) {
    return {
      expectedUrl,
      status: null,
      finalUrl: null,
      contentType: null,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractJsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

await fs.mkdir(outputDir, { recursive: true });

const job = await fetchPublic(jobPath);
const careers = await fetchPublic(careersPath);
const sitemap = await fetchPublic(sitemapPath, "application/xml,text/xml,text/plain;q=0.9,*/*;q=0.8");

const jobUrl = new URL(jobPath, baseUrl).toString();
const careersUrl = new URL(careersPath, baseUrl).toString();
const canonical = extractAttribute(job.body, "link", "rel", "canonical", "href");
const robots = extractAttribute(job.body, "meta", "name", "robots", "content");
const jsonLdBlocks = extractJsonLd(job.body);
const jobPostingCount = jsonLdBlocks.reduce(
  (count, block) => count + (block.match(/"@type"\s*:\s*"JobPosting"/g) ?? []).length,
  0,
);
const combinedJsonLd = jsonLdBlocks.join("\n");

const checks = {
  jobStatus200: job.status === 200,
  jobFinalUrlMatches: job.finalUrl === jobUrl,
  jobCanonicalMatches: canonical === jobUrl,
  jobIndexableByMeta: !robots?.toLowerCase().includes("noindex"),
  exactlyOneJobPosting: jobPostingCount === 1,
  jobPostingUrlPresent: combinedJsonLd.includes(jobUrl),
  jobPostingEmploymentTypePresent: combinedJsonLd.includes('"employmentType":"FULL_TIME"') || combinedJsonLd.includes('"employmentType": "FULL_TIME"'),
  jobPostingTelecommutePresent: combinedJsonLd.includes('"jobLocationType":"TELECOMMUTE"') || combinedJsonLd.includes('"jobLocationType": "TELECOMMUTE"'),
  jobPostingDatePostedPresent: /"datePosted"\s*:\s*"\d{4}-\d{2}-\d{2}"/.test(combinedJsonLd),
  jobPostingValidThroughPresent: /"validThrough"\s*:\s*"[^"\n]+"/.test(combinedJsonLd),
  careersStatus200: careers.status === 200,
  careersFinalUrlMatches: careers.finalUrl === careersUrl,
  careersLinksToJob: careers.body.includes(`href="${jobPath}"`) || careers.body.includes(`href='${jobPath}'`),
  careersDoesNotDuplicateJobPosting: !/"@type"\s*:\s*"JobPosting"/.test(extractJsonLd(careers.body).join("\n")),
  sitemapStatus200: sitemap.status === 200,
  sitemapContainsJob: sitemap.body.includes(`<loc>${jobUrl}</loc>`) || sitemap.body.includes(jobUrl),
};

const passed = Object.values(checks).every(Boolean) && !job.error && !careers.error && !sitemap.error;
const classification = passed ? "PRODUCTION_JOB_POSTING_PASS" : "PRODUCTION_JOB_POSTING_REVIEW_REQUIRED";

const result = {
  checkedAt: new Date().toISOString(),
  classification,
  boundaries: {
    publicReadOnly: true,
    noFormsSubmitted: true,
    noCredentialsUsed: true,
    noCandidateDataCollected: true,
    note: "This verifies public production route/schema/discovery contracts only. Google/Bing indexing, rich-result eligibility and ranking remain separate authenticated/platform evidence.",
  },
  job: {
    path: jobPath,
    status: job.status,
    finalUrlMatches: checks.jobFinalUrlMatches,
    canonical,
    canonicalMatches: checks.jobCanonicalMatches,
    robots,
    indexableByMeta: checks.jobIndexableByMeta,
    jobPostingCount,
    error: job.error,
  },
  careers: {
    path: careersPath,
    status: careers.status,
    finalUrlMatches: checks.careersFinalUrlMatches,
    linksToJob: checks.careersLinksToJob,
    duplicatesJobPosting: !checks.careersDoesNotDuplicateJobPosting,
    error: careers.error,
  },
  sitemap: {
    path: sitemapPath,
    status: sitemap.status,
    containsJob: checks.sitemapContainsJob,
    error: sitemap.error,
  },
  checks,
};

const markdown = [
  "# Production JobPosting SEO check",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Result: **${classification}**`,
  `- Job route: \`${jobPath}\``,
  `- Job HTTP 200: **${checks.jobStatus200 ? "yes" : "no"}**`,
  `- Final URL matches: **${checks.jobFinalUrlMatches ? "yes" : "no"}**`,
  `- Canonical matches: **${checks.jobCanonicalMatches ? "yes" : "no"}**`,
  `- Indexable by meta: **${checks.jobIndexableByMeta ? "yes" : "no"}**`,
  `- Exactly one JobPosting: **${checks.exactlyOneJobPosting ? "yes" : "no"}**`,
  `- JobPosting remote/full-time/date fields present: **${checks.jobPostingTelecommutePresent && checks.jobPostingEmploymentTypePresent && checks.jobPostingDatePostedPresent && checks.jobPostingValidThroughPresent ? "yes" : "no"}**`,
  `- Careers hub links to job: **${checks.careersLinksToJob ? "yes" : "no"}**`,
  `- Careers hub duplicates JobPosting: **${checks.careersDoesNotDuplicateJobPosting ? "no" : "yes"}**`,
  `- Primary sitemap contains job URL: **${checks.sitemapContainsJob ? "yes" : "no"}**`,
  "",
  "Boundary: this is public production SEO evidence only. Search-engine indexing, rich-result selection, impressions, clicks and ranking remain separate Google/Bing evidence.",
  "",
].join("\n");

await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(markdownPath, markdown);
console.log(markdown);

if (!passed) process.exitCode = job.error || careers.error || sitemap.error ? 3 : 4;
