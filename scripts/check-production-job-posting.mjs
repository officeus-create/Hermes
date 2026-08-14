import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://hermeslogisticsus.com";
const jobPath = "/careers/car-hauling-dispatcher/";
const careersPath = "/logistics/careers/";
const sitemapPath = "/sitemap.xml";
const workUaSubmissionUrl = "https://www.work.ua/jobs/7362244/";
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
        "user-agent": "HermesJobPostingProductionVerifier/1.1 (+public read-only SEO check)",
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

function parseJsonLdEntities(html) {
  return extractJsonLd(html).flatMap((block) => {
    try {
      const parsed = JSON.parse(block);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
}

await fs.mkdir(outputDir, { recursive: true });

const job = await fetchPublic(jobPath);
const careers = await fetchPublic(careersPath);
const sitemap = await fetchPublic(sitemapPath, "application/xml,text/xml,text/plain;q=0.9,*/*;q=0.8");

const jobUrl = new URL(jobPath, baseUrl).toString();
const careersUrl = new URL(careersPath, baseUrl).toString();
const canonical = extractAttribute(job.body, "link", "rel", "canonical", "href");
const robots = extractAttribute(job.body, "meta", "name", "robots", "content");
const jobEntities = parseJsonLdEntities(job.body);
const jobPostings = jobEntities.filter((entity) => entity?.["@type"] === "JobPosting");
const jobPosting = jobPostings[0] ?? null;
const applicantCountries = Array.isArray(jobPosting?.applicantLocationRequirements)
  ? jobPosting.applicantLocationRequirements
      .filter((item) => item?.["@type"] === "Country" && typeof item.name === "string")
      .map((item) => item.name)
  : [];
const description = typeof jobPosting?.description === "string" ? jobPosting.description : "";

const checks = {
  jobStatus200: job.status === 200,
  jobFinalUrlMatches: job.finalUrl === jobUrl,
  jobCanonicalMatches: canonical === jobUrl,
  jobIndexableByMeta: !robots?.toLowerCase().includes("noindex"),
  exactlyOneJobPosting: jobPostings.length === 1,
  jobPostingUrlMatches: jobPosting?.url === jobUrl,
  jobPostingTitleClean: jobPosting?.title === "Car Hauling Dispatcher",
  jobPostingEmploymentTypePresent: jobPosting?.employmentType === "FULL_TIME",
  jobPostingTelecommutePresent: jobPosting?.jobLocationType === "TELECOMMUTE",
  jobPostingApplicantCountriesPresent: applicantCountries.includes("United States") && applicantCountries.includes("Ukraine"),
  jobPostingDirectApplyTruthful: jobPosting?.directApply === false,
  jobPostingDatePostedPresent: /^\d{4}-\d{2}-\d{2}$/.test(String(jobPosting?.datePosted ?? "")),
  jobPostingValidThroughPresent: /^\d{4}-\d{2}-\d{2}T/.test(String(jobPosting?.validThrough ?? "")),
  jobPostingDescriptionComplete: description.includes("Support car-hauling dispatch work for U.S.-market carrier operations.")
    && description.includes("Ability to work the applicable U.S. Central Time schedule.")
    && description.includes("The Hermes application page is a preparation preview only"),
  visibleWorkUaSubmissionLinkPresent: job.body.includes(`href="${workUaSubmissionUrl}"`) || job.body.includes(`href='${workUaSubmissionUrl}'`),
  visibleHermesPreviewBoundaryPresent: job.body.includes("does not yet send or store an application")
    && job.body.includes("Prepare Hermes application preview"),
  careersStatus200: careers.status === 200,
  careersFinalUrlMatches: careers.finalUrl === careersUrl,
  careersLinksToJob: careers.body.includes(`href="${jobPath}"`) || careers.body.includes(`href='${jobPath}'`),
  careersDoesNotDuplicateJobPosting: !parseJsonLdEntities(careers.body).some((entity) => entity?.["@type"] === "JobPosting"),
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
    note: "This verifies public production route/schema/application/discovery contracts only. Google/Bing indexing, rich-result eligibility and ranking remain separate authenticated/platform evidence.",
  },
  job: {
    path: jobPath,
    status: job.status,
    finalUrlMatches: checks.jobFinalUrlMatches,
    canonical,
    canonicalMatches: checks.jobCanonicalMatches,
    robots,
    indexableByMeta: checks.jobIndexableByMeta,
    jobPostingCount: jobPostings.length,
    title: jobPosting?.title ?? null,
    directApply: jobPosting?.directApply ?? null,
    applicantCountries,
    workUaSubmissionLinkPresent: checks.visibleWorkUaSubmissionLinkPresent,
    hermesPreviewBoundaryPresent: checks.visibleHermesPreviewBoundaryPresent,
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
  `- Clean schema title: **${checks.jobPostingTitleClean ? "yes" : "no"}**`,
  `- Remote/full-time/applicant-country fields: **${checks.jobPostingTelecommutePresent && checks.jobPostingEmploymentTypePresent && checks.jobPostingApplicantCountriesPresent ? "yes" : "no"}**`,
  `- directApply matches current flow: **${checks.jobPostingDirectApplyTruthful ? "yes" : "no"}**`,
  `- Complete visible-details description: **${checks.jobPostingDescriptionComplete ? "yes" : "no"}**`,
  `- Real Work.ua submission link visible: **${checks.visibleWorkUaSubmissionLinkPresent ? "yes" : "no"}**`,
  `- Hermes preview boundary visible: **${checks.visibleHermesPreviewBoundaryPresent ? "yes" : "no"}**`,
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
