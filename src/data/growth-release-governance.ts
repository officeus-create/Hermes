export type ReleaseWorkflowStatus =
  | "branch_ready"
  | "owner_merge_required"
  | "merged"
  | "deployed"
  | "verified_live";

export type SearchConsoleInspectionStatus =
  | "not_requested"
  | "requested"
  | "discovered"
  | "indexed"
  | "excluded"
  | "needs_review";

export interface GrowthReleaseWatchItem {
  url: string;
  cluster: "digital_service" | "niche_service" | "academy" | "careers";
  releaseStatus: ReleaseWorkflowStatus;
  searchConsoleStatus: SearchConsoleInspectionStatus;
  sitemap: string;
  pullRequest: number;
  latestGreenCiRequired: true;
  deploymentVerifiedAt: string | null;
  inspectionRequestedAt: string | null;
  indexedAt: string | null;
  impressions7d: number | null;
  clicks7d: number | null;
  averagePosition7d: number | null;
  qualifiedInquiries7d: number | null;
  nextAction: string;
}

const pendingRelease = (
  url: string,
  cluster: GrowthReleaseWatchItem["cluster"],
  sitemap: string,
  pullRequest: number,
): GrowthReleaseWatchItem => ({
  url,
  cluster,
  releaseStatus: "owner_merge_required",
  searchConsoleStatus: "not_requested",
  sitemap,
  pullRequest,
  latestGreenCiRequired: true,
  deploymentVerifiedAt: null,
  inspectionRequestedAt: null,
  indexedAt: null,
  impressions7d: null,
  clicks7d: null,
  averagePosition7d: null,
  qualifiedInquiries7d: null,
  nextAction: "Wait for separate owner merge approval, deployment, live verification, then request Search Console inspection.",
});

export const growthReleaseWatchlist: GrowthReleaseWatchItem[] = [
  pendingRelease("/services/website-development/", "digital_service", "sitemap-digital-services.xml", 66),
  pendingRelease("/services/website-redesign/", "digital_service", "sitemap-digital-services.xml", 66),
  pendingRelease("/services/seo/", "digital_service", "sitemap-digital-services.xml", 66),
  pendingRelease("/services/local-seo/", "digital_service", "sitemap-digital-services.xml", 66),
  pendingRelease("/services/seo-for-logistics-companies/", "niche_service", "sitemap-digital-services.xml", 67),
  pendingRelease("/services/seo-for-independent-auto-dealers/", "niche_service", "sitemap-digital-services.xml", 67),
  pendingRelease("/paths/academy/", "academy", "sitemap.xml", 68),
  pendingRelease("/logistics/careers/", "careers", "sitemap.xml", 68),
];

export const weeklyGrowthScorecard = {
  cadence: "weekly",
  requiredMetrics: [
    "release status and latest green CI",
    "live HTTP and canonical verification after deployment",
    "Search Console discovery and indexing status",
    "impressions, clicks, CTR, and average position by page and query family",
    "privacy-safe CTA and contact clicks",
    "approved aggregate qualified inquiries",
    "page cannibalization and technical defects",
  ],
  decisionRules: [
    "Do not populate Search Console or inquiry values before a dated source is retrieved.",
    "Do not request inspection before the URL is deployed and live canonical verification passes.",
    "Do not rewrite a new page only because it has no impressions during the first seven days.",
    "Prioritize broken indexability, canonical, sitemap, contact, or privacy issues before content expansion.",
    "Record one next action and one accountable owner for every page needing work.",
  ],
} as const;

export const monthlyGrowthScorecard = {
  cadence: "monthly",
  requiredMetrics: [
    "indexed URLs versus released URLs",
    "non-branded query growth by service cluster",
    "impressions, clicks, CTR, and position trends",
    "qualified carrier and customer inquiries from approved aggregates",
    "digital-service and Academy/Careers inquiry quality",
    "content freshness, claims evidence, and broken crawl paths",
    "pages competing for the same primary query",
  ],
  decisionRules: [
    "Expand only clusters with verified service relevance, useful search signals, response capacity, and a clear conversion path.",
    "Improve titles and descriptions when impressions exist but CTR is weak.",
    "Strengthen internal links and content when discovery or query fit is weak.",
    "Keep research-only markets blocked until evidence and proof requirements pass.",
    "Do not delete, redirect, merge, deploy, or change infrastructure without the applicable approval gate.",
  ],
} as const;

export const finalGrowthReadinessChecklist = [
  "Current main, open PR stack, and latest handoff are reconciled.",
  "No private operational data, credentials, live positions, real shipment rows, or OFFICE 374 content is present.",
  "Public claims have approved evidence, maturity labels, dates, and privacy review.",
  "Academy exposes only U.S. Logistics Operations and Marketing as public programs.",
  "Paid cohort and free practice models are separate; no unapproved price or result guarantee is published.",
  "Careers lists only verified owner-approved vacancies; JobPosting is absent when none are verified open.",
  "Every new indexable page has unique metadata, canonical, H1, visible breadcrumb, supported schema, sitemap, internal links, and a useful contact path.",
  "Contact remains preview-first and uses the approved direction-specific channel.",
  "Build, static/unit/registry, and Playwright checks pass on the latest PR head.",
  "Owner separately approves merge and production deployment.",
  "Live verification passes before Search Console inspection is requested.",
  "Weekly and monthly scorecards use retrieved dated data; no metric is invented.",
] as const;

export function isReleaseReadyForInspection(item: GrowthReleaseWatchItem): boolean {
  return item.releaseStatus === "verified_live"
    && Boolean(item.deploymentVerifiedAt)
    && item.searchConsoleStatus === "not_requested";
}
