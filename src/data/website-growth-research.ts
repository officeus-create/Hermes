export type WebsiteServiceClusterId =
  | "website_creation"
  | "website_redesign"
  | "multilingual_website"
  | "seo"
  | "local_seo"
  | "crm_automation";

export type ProofMaturity =
  | "live_product"
  | "working_prototype"
  | "product_discovery"
  | "build_ready_capability"
  | "verified_case_study";

export type WebsiteResearchEvidenceMode =
  | "synthetic"
  | "owner_approved_sanitized"
  | "verified_public";

export type WebsiteMarketStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export interface WebsiteServiceScope {
  id: WebsiteServiceClusterId;
  label: string;
  included: string[];
  optionalByAgreement: string[];
  excludedUnlessApproved: string[];
  controlBoundary: string;
}

export interface ProofRecord {
  id: string;
  label: string;
  maturity: ProofMaturity;
  evidencePath: string;
  requiredVisibleEvidence: string[];
  publicClaimBoundary: string;
}

export interface CaseStudyEvidenceStandard {
  requiredFields: string[];
  prohibitedWithoutEvidence: string[];
  allowedMaturityLabels: ProofMaturity[];
}

export interface WebsiteMarketScoreBreakdown {
  relevantBusinessDensity: 0 | 1 | 2;
  competitionGap: 0 | 1 | 2;
  demandAndServiceFit: 0 | 1 | 2;
  uniqueNicheLocalValue: 0 | 1 | 2;
  conversionPath: 0 | 1;
  evidenceAndReviewDate: 0 | 1;
}

export interface WebsiteMarketOpportunity {
  marketId: string;
  city: string;
  state: string;
  niche: string;
  serviceCluster: WebsiteServiceClusterId;
  queryFamilies: string[];
  sourceIds: string[];
  reviewedAt: string;
  evidenceMode: WebsiteResearchEvidenceMode;
  proofRecordIds: string[];
  uniqueContentAngles: string[];
  score: WebsiteMarketScoreBreakdown;
  responseCapacityConfirmed: boolean;
  privacyAndClaimsReviewed: boolean;
}

export interface WebsiteMarketEvaluation {
  score: number;
  threshold: 7;
  status: WebsiteMarketStatus;
  blockers: string[];
  limitations: string[];
}

export const websiteServiceScopes: WebsiteServiceScope[] = [
  {
    id: "website_creation",
    label: "National website creation",
    included: [
      "business discovery and information architecture",
      "custom responsive website design and development",
      "conversion-path and contact-workflow planning",
      "technical quality, accessibility, mobile, analytics-plan, and release QA",
    ],
    optionalByAgreement: [
      "content migration and redirect planning",
      "copy, brand, ecommerce, booking, payments, CRM, AI, and third-party integrations",
      "ongoing maintenance and controlled improvement releases",
    ],
    excludedUnlessApproved: [
      "automatic lead generation",
      "ranking, traffic, inquiry, revenue, completion-date, or ROI guarantees",
      "unreviewed live delivery, payment, booking, CRM, or external-service connections",
    ],
    controlBoundary: "Final scope, estimates, integrations, content, approvals, launch, and production changes require a reviewed project agreement.",
  },
  {
    id: "website_redesign",
    label: "Website redesign",
    included: [
      "current-site and conversion-path review",
      "information architecture and page-priority recommendations",
      "responsive interface and implementation planning",
      "migration, redirect, analytics, QA, and controlled-release planning where applicable",
    ],
    optionalByAgreement: [
      "content rewrite or migration",
      "brand-system expansion",
      "CRM, booking, payments, ecommerce, automation, or supported integrations",
    ],
    excludedUnlessApproved: [
      "preservation of every legacy feature without audit",
      "unverified traffic or ranking claims",
      "automatic production replacement or DNS changes",
    ],
    controlBoundary: "A redesign recommendation does not authorize production replacement; scope and migration risk require owner/client approval.",
  },
  {
    id: "multilingual_website",
    label: "Multilingual website foundations",
    included: [
      "separate indexable language URLs",
      "lang, canonical, reciprocal hreflang, and x-default planning",
      "language-specific customer journey and CTA planning",
      "consistent service facts and review boundaries across languages",
    ],
    optionalByAgreement: [
      "translation and localization for approved languages",
      "international or U.S. community-language market research",
      "language-specific content and conversion measurement",
    ],
    excludedUnlessApproved: [
      "bulk machine-translated thin pages",
      "automatic country or ethnicity targeting",
      "publication without a capable human reviewer and confirmed response capacity",
    ],
    controlBoundary: "Each public language requires natural-copy review, response capacity, unique value, canonical/hreflang QA, and owner-approved release evidence.",
  },
  {
    id: "seo",
    label: "SEO services",
    included: [
      "technical SEO audit and implementation planning",
      "crawlability, indexability, canonical, sitemap, robots, metadata, and schema QA",
      "search-intent, page-map, content-brief, and internal-link architecture",
      "Search Console and GA4 measurement, refresh, and cannibalization review",
    ],
    optionalByAgreement: [
      "approved content implementation",
      "performance and mobile-search quality work",
      "multilingual and international SEO planning",
    ],
    excludedUnlessApproved: [
      "ranking, rich-result, traffic, lead, revenue, timeline, or ROI guarantees",
      "unsupported customer-result claims",
      "doorway pages or pages generated from unverified demand",
    ],
    controlBoundary: "Search engines control crawling, indexing, rankings, rich results, and traffic; Hermes controls only the reviewed research and implementation scope.",
  },
  {
    id: "local_seo",
    label: "Local SEO services",
    included: [
      "real service-area and local-market research",
      "local intent and commercial-page architecture",
      "Google Business Profile support when eligibility and access are confirmed",
      "local content, internal linking, schema, and measurement planning",
    ],
    optionalByAgreement: [
      "GBP content and profile-workflow support",
      "review and reputation workflow planning",
      "niche/location pilot briefs after evidence scoring",
    ],
    excludedUnlessApproved: [
      "fake offices or unsupported service areas",
      "city pages created only from low keyword difficulty",
      "map-pack, ranking, call, appointment, or lead guarantees",
    ],
    controlBoundary: "Location work requires a real business/service relationship, dated demand and competition evidence, unique local value, and a useful honest CTA.",
  },
  {
    id: "crm_automation",
    label: "CRM and automation planning",
    included: [
      "workflow and data-model discovery",
      "roles, pipelines, statuses, approvals, and management-view planning",
      "preview-first automation and integration architecture",
      "logging, privacy, fallback, authorization, and human-control boundaries",
    ],
    optionalByAgreement: [
      "working prototype",
      "approved CRM or external-system integration",
      "AI-assisted research, summaries, routing, and draft actions with review gates",
    ],
    excludedUnlessApproved: [
      "autonomous production actions",
      "automatic payments, booking, negotiation, messaging, or publication",
      "live credentials, private data, or external connections in public fixtures",
    ],
    controlBoundary: "Every live integration, write action, role permission, retention rule, credential, and production release requires separate technical and owner approval.",
  },
];

export const websiteProofRegister: ProofRecord[] = [
  {
    id: "hermes-website-platform",
    label: "Hermes Website Platform",
    maturity: "live_product",
    evidencePath: "/case/it-development/",
    requiredVisibleEvidence: ["Live product", "One digital front door for four businesses"],
    publicClaimBoundary: "The site and release process may be demonstrated; no client ranking, revenue, or lead result is implied.",
  },
  {
    id: "hermes-crm-operations",
    label: "CRM and Operations Control",
    maturity: "working_prototype",
    evidencePath: "/paths/technology/",
    requiredVisibleEvidence: ["Working product previews", "CRM and Operations Control", "Working v0.2", "simulated records"],
    publicClaimBoundary: "The interface is a working preview with simulated records and must not be described as a connected production CRM.",
  },
  {
    id: "hermes-connect",
    label: "Hermes Connect",
    maturity: "working_prototype",
    evidencePath: "/paths/technology/",
    requiredVisibleEvidence: ["Working product previews", "Hermes Connect", "Working v0.2", "Simulated data"],
    publicClaimBoundary: "The interface is a working local preview; no live account, calendar event, payment, external message, or production integration is represented as connected.",
  },
  {
    id: "hermes-load-board",
    label: "Hermes Load Board",
    maturity: "working_prototype",
    evidencePath: "/load-board/",
    requiredVisibleEvidence: ["Preview", "demo"],
    publicClaimBoundary: "Demo loads and rates are synthetic; no external-board sync, live offer, truck, dispatch, or booking is claimed.",
  },
];

export const caseStudyEvidenceStandard: CaseStudyEvidenceStandard = {
  requiredFields: [
    "subject identification or approved anonymization",
    "date range",
    "baseline and measurement source",
    "work performed",
    "measured result",
    "factors outside Hermes control",
    "permission status",
    "reviewer and review date",
  ],
  prohibitedWithoutEvidence: [
    "rankings",
    "traffic growth",
    "leads or qualified inquiries",
    "revenue or ROI",
    "customer identity",
    "before-and-after percentages",
    "time-to-result",
  ],
  allowedMaturityLabels: [
    "live_product",
    "working_prototype",
    "product_discovery",
    "build_ready_capability",
    "verified_case_study",
  ],
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATE_CODE = /^[A-Z]{2}$/;
const serviceIds = new Set(websiteServiceScopes.map((scope) => scope.id));
const proofIds = new Set(websiteProofRegister.map((proof) => proof.id));

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validDate(value: unknown): value is string {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function evaluateWebsiteMarketOpportunity(
  opportunity: WebsiteMarketOpportunity,
): WebsiteMarketEvaluation {
  const blockers: string[] = [];

  if (!hasText(opportunity.marketId)) blockers.push("marketId is required");
  if (!hasText(opportunity.city)) blockers.push("city is required");
  if (!hasText(opportunity.state) || !STATE_CODE.test(opportunity.state.trim().toUpperCase())) {
    blockers.push("state must use a two-letter code");
  }
  if (!hasText(opportunity.niche)) blockers.push("niche is required");
  if (!serviceIds.has(opportunity.serviceCluster)) blockers.push("approved service cluster is required");
  if (!Array.isArray(opportunity.queryFamilies) || !opportunity.queryFamilies.some(hasText)) {
    blockers.push("query-family research is required");
  }
  if (!Array.isArray(opportunity.sourceIds) || !opportunity.sourceIds.some(hasText)) {
    blockers.push("dated research provenance is required");
  }
  if (!validDate(opportunity.reviewedAt)) blockers.push("reviewedAt must use a valid YYYY-MM-DD date");
  if (!Array.isArray(opportunity.proofRecordIds) || !opportunity.proofRecordIds.some((id) => proofIds.has(id))) {
    blockers.push("approved proof reference is required");
  }
  if (opportunity.proofRecordIds.some((id) => !proofIds.has(id))) blockers.push("unknown proof reference");
  if (!Array.isArray(opportunity.uniqueContentAngles) || opportunity.uniqueContentAngles.length < 3) {
    blockers.push("at least three unique niche or local content angles are required");
  }
  if (!opportunity.responseCapacityConfirmed) blockers.push("service response capacity must be confirmed");
  if (!opportunity.privacyAndClaimsReviewed) blockers.push("privacy and claims review is required");

  const values = Object.values(opportunity.score ?? {});
  const expectedMaximums = [2, 2, 2, 2, 1, 1];
  if (values.length !== expectedMaximums.length || values.some((value, index) => !Number.isInteger(value) || value < 0 || value > expectedMaximums[index])) {
    blockers.push("market score dimensions are invalid");
  }

  const score = blockers.includes("market score dimensions are invalid")
    ? 0
    : values.reduce<number>((total, value) => total + Number(value), 0);

  const limitations = [
    "A market score is an internal research decision, not proof of ranking, traffic, leads, revenue, or market demand.",
    "Editorial eligibility does not create a city page, national service page, sitemap entry, or public claim.",
    "National service hubs and proof review must precede any niche/location expansion.",
  ];

  if (blockers.length > 0) return { score, threshold: 7, status: "blocked_missing_evidence", blockers, limitations };

  const researchOnlyReasons: string[] = [];
  if (score < 7) researchOnlyReasons.push("market score is below 7/10");
  if (opportunity.evidenceMode === "synthetic") researchOnlyReasons.push("synthetic market evidence cannot support public publication");

  if (researchOnlyReasons.length > 0) {
    return { score, threshold: 7, status: "research_only", blockers: researchOnlyReasons, limitations };
  }

  return { score, threshold: 7, status: "eligible_for_editorial_review", blockers: [], limitations };
}
