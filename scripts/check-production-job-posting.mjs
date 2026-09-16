import fs from "node:fs/promises";
import path from "node:path";
import { fetchExternalJobLifecycle } from "./lib/external-job-lifecycle.mjs";

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
        "user-agent": "HermesJobPostingProductionVerifier/2.0 (+public read-only SEO check)",
        accept,
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      signal: AbortSignal.timeout(20_000),
    });
    return {
      expectedUrl,
      status: response.status,
      finalUrl: response.url.replace(/[?&]seo-job-smoke=\d+$/, ""),
      body: await response.text(),
      error: null,
    };
  } catch (error) {
    return {
      expectedUrl,
      status: null,
      finalUrl: null,
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseJsonLdEntities(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      try {
        const parsed = JSON.parse(match[1].trim());
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    });
}

await fs.mkdir(outputDir, { recursive: true });

const checkedAt = new Date();
const [job, careers, sitemap, externalSubmission] = await Promise.all([
  fetchPublic(jobPath),
  fetchPublic(careersPath),
  fetchPublic(sitemapPath, "application/xml,text/xml,text/plain;q=0.9,*/*;q=0.8"),
  fetchExternalJobLifecycle(workUaSubmissionUrl),
]);

const jobUrl = new URL(jobPath, baseUrl).toString();
const careersUrl = new URL(careersPath, baseUrl).toString();
const canonical = extractAttribute(job.body, "link", "rel", "canonical", "href");
const robots = extractAttribute(job.body, "meta", "name", "robots", "content");
const jobPostings = parseJsonLdEntities(job.body).filter((entity) => entity?.["@type"] === "JobPosting");
const jobPosting = jobPostings[0] ?? null;
const validThrough = typeof jobPosting?.validThrough === "string" ? jobPosting.validThrough : "";
const validThroughMs = Date.parse(validThrough);
const workUaLinkPresent = job.body.includes(`href="${workUaSubmissionUrl}"`) || job.body.includes(`href='${workUaSubmissionUrl}'`);
const sitemapContainsJob = sitemap.body.includes(`<loc>${jobUrl}</loc>`) || sitemap.body.includes(jobUrl);
const pausedCopyPresent = job.body.includes("Recruitment paused")
  && job.body.includes("No public application route is approved for this role")
  && job.body.includes("Do not submit through an unrelated Hermes form");
const activeCopyPresent = job.body.includes("Verified open") && workUaLinkPresent;
const publicMode = pausedCopyPresent ? "paused" : activeCopyPresent ? "active" : "unknown";

const sharedChecks = {
  jobStatus200: job.status === 200,
  jobFinalUrlMatches: job.finalUrl === jobUrl,
  jobCanonicalMatches: canonical === jobUrl,
  careersStatus200: careers.status === 200,
  careersFinalUrlMatches: careers.finalUrl === careersUrl,
  careersDoesNotDuplicateJobPosting: !parseJsonLdEntities(careers.body).some((entity) => entity?.["@type"] === "JobPosting"),
  sitemapStatus200: sitemap.status === 200,
};

const activeChecks = {
  exactlyOneJobPosting: jobPostings.length === 1,
  jobPostingUrlMatches: jobPosting?.url === jobUrl,
  jobPostingTitleClean: jobPosting?.title === "Car Hauling Dispatcher",
  jobPostingValidThroughActive: Number.isFinite(validThroughMs) && validThroughMs >= checkedAt.getTime(),
  workUaSubmissionLinkPresent: workUaLinkPresent,
  externalSubmissionVerifiedOpen: externalSubmission.classification === "verified_open",
  careersLinksToJob: careers.body.includes(`href="${jobPath}"`) || careers.body.includes(`href='${jobPath}'`),
  sitemapContainsJob,
};

const pausedChecks = {
  pausedStatusCopyPresent: pausedCopyPresent,
  jobPageNoindex: Boolean(robots?.toLowerCase().includes("noindex")),
  noJobPostingSchema: jobPostings.length === 0,
  noWorkUaSubmissionLink: !workUaLinkPresent,
  externalSubmissionReviewRequired: externalSubmission.classification === "review_required",
  careersDoesNotLinkPausedJob: !careers.body.includes(`href="${jobPath}"`) && !careers.body.includes(`href='${jobPath}'`),
  sitemapDoesNotContainPausedJob: !sitemapContainsJob,
};

const modeChecks = publicMode === "active" ? activeChecks : publicMode === "paused" ? pausedChecks : { recognizedPublicMode: false };
const checks = { ...sharedChecks, ...modeChecks };
const passed = Object.values(checks).every(Boolean) && !job.error && !careers.error && !sitemap.error;
const classification = passed
  ? publicMode === "paused" ? "PRODUCTION_JOB_POSTING_PAUSE_PASS" : "PRODUCTION_JOB_POSTING_ACTIVE_PASS"
  : "PRODUCTION_JOB_POSTING_REVIEW_REQUIRED";

const result = {
  checkedAt: checkedAt.toISOString(),
  classification,
  publicMode,
  boundaries: {
    publicReadOnly: true,
    noFormsSubmitted: true,
    noCredentialsUsed: true,
    noCandidateDataCollected: true,
    note: "External redirects, removed markers, non-2xx responses, and request failures classify the vacancy as review_required. A paused local page may pass only when JobPosting, CTA, hub link, and sitemap discovery are removed.",
  },
  job: {
    path: jobPath,
    status: job.status,
    canonical,
    robots,
    jobPostingCount: jobPostings.length,
    validThrough: validThrough || null,
    workUaSubmissionLinkPresent: workUaLinkPresent,
    pausedCopyPresent,
    error: job.error,
  },
  externalSubmission: {
    expectedUrl: externalSubmission.expectedUrl,
    status: externalSubmission.status,
    finalUrl: externalSubmission.finalUrl,
    classification: externalSubmission.classification,
    reason: externalSubmission.reason,
    error: externalSubmission.error,
  },
  careers: {
    path: careersPath,
    status: careers.status,
    linksToJob: !pausedChecks.careersDoesNotLinkPausedJob,
    error: careers.error,
  },
  sitemap: {
    path: sitemapPath,
    status: sitemap.status,
    containsJob: sitemapContainsJob,
    error: sitemap.error,
  },
  checks,
};

const markdown = [
  "# Production JobPosting lifecycle check",
  "",
  `- Checked: ${result.checkedAt}`,
  `- Result: **${classification}**`,
  `- Public mode: **${publicMode}**`,
  `- Job HTTP 200: **${sharedChecks.jobStatus200 ? "yes" : "no"}**`,
  `- JobPosting count: **${jobPostings.length}**`,
  `- Work.ua CTA present: **${workUaLinkPresent ? "yes" : "no"}**`,
  `- External lifecycle: **${externalSubmission.classification}** (${externalSubmission.reason})`,
  `- Careers hub links to role: **${pausedChecks.careersDoesNotLinkPausedJob ? "no" : "yes"}**`,
  `- Primary sitemap contains role: **${sitemapContainsJob ? "yes" : "no"}**`,
  "",
  "Boundary: public read-only verification only. This does not submit candidate data or prove reviewer SLA, retention, deletion, hiring, indexing, traffic, or revenue.",
  "",
].join("\n");

await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(markdownPath, markdown);
console.log(markdown);

if (!passed) process.exitCode = job.error || careers.error || sitemap.error ? 3 : 4;
