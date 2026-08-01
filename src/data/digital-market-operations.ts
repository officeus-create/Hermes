export type DigitalResearchNicheId =
  | "beauty_and_salon"
  | "education_and_training"
  | "professional_services"
  | "home_services";

export type DigitalResearchStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export interface DigitalNicheResearchRecord {
  id: DigitalResearchNicheId;
  label: string;
  priorityServiceClusters: Array<"website_creation" | "website_redesign" | "seo" | "local_seo" | "crm_automation">;
  researchQuestions: string[];
  requiredEvidence: string[];
  prohibitedAssumptions: string[];
  sourceIds: string[];
  reviewedAt?: string;
  measurableDemand: boolean;
  serviceResponseCapacityConfirmed: boolean;
  proofReviewed: boolean;
  uniqueContentPlan: boolean;
}

export interface DigitalGrowthCtaVariant {
  id: "website_audit" | "website_redesign" | "new_website_build" | "seo_review" | "local_seo_review";
  label: string;
  destination: string;
  requiredInputs: string[];
  disclosure: string;
}

const reviewDisclosure =
  "This action begins a manual project review. It does not create a contract, start production, connect an account, or guarantee completion time, rankings, traffic, inquiries, revenue, or ROI.";

export const digitalGrowthCtaVariants: DigitalGrowthCtaVariant[] = [
  {
    id: "website_audit",
    label: "Request a website and conversion-path review",
    destination: "/services/website-redesign/",
    requiredInputs: ["current website", "business goal", "priority pages", "known problems", "desired customer action"],
    disclosure: reviewDisclosure,
  },
  {
    id: "website_redesign",
    label: "Prepare a website redesign brief",
    destination: "/services/website-redesign/",
    requiredInputs: ["current website", "content and features to preserve", "migration constraints", "priority services", "desired integrations"],
    disclosure: reviewDisclosure,
  },
  {
    id: "new_website_build",
    label: "Prepare a new website project brief",
    destination: "/services/website-development/",
    requiredInputs: ["company and services", "target customers", "target U.S. market", "required languages", "desired customer action"],
    disclosure: reviewDisclosure,
  },
  {
    id: "seo_review",
    label: "Request an SEO architecture review",
    destination: "/services/seo/",
    requiredInputs: ["website", "priority services", "target markets", "Search Console status", "qualified inquiry definition"],
    disclosure: reviewDisclosure,
  },
  {
    id: "local_seo_review",
    label: "Request a Local SEO eligibility and market review",
    destination: "/services/local-seo/",
    requiredInputs: ["real location or service area", "business category", "services", "Google Business Profile status", "response capacity"],
    disclosure: reviewDisclosure,
  },
];

export const digitalNicheResearch: DigitalNicheResearchRecord[] = [
  {
    id: "beauty_and_salon",
    label: "Beauty, salon, and appointment-based services",
    priorityServiceClusters: ["website_creation", "website_redesign", "local_seo", "crm_automation"],
    researchQuestions: [
      "Which services and appointment journeys create the highest-value customer actions?",
      "Is the business eligible for a real-location or service-area Local SEO strategy?",
      "Which booking, deposit, consultation, no-show, repeat-visit, and review workflows are actually supported?",
      "Which city or niche page would provide unique guidance rather than copied service text?",
    ],
    requiredEvidence: [
      "dated market and query evidence",
      "real services and location/service-area evidence",
      "confirmed appointment-response capacity",
      "approved public proof and image rights",
      "natural terminology and privacy review",
    ],
    prohibitedAssumptions: [
      "medical or cosmetic outcome claims",
      "appointment availability without confirmation",
      "fake office or copied city pages",
      "unverified before-and-after results, prices, reviews, or practitioner credentials",
    ],
    sourceIds: [],
    measurableDemand: false,
    serviceResponseCapacityConfirmed: false,
    proofReviewed: false,
    uniqueContentPlan: false,
  },
  {
    id: "education_and_training",
    label: "Education and training services",
    priorityServiceClusters: ["website_creation", "website_redesign", "seo", "local_seo", "crm_automation"],
    researchQuestions: [
      "Which program facts, outcomes, schedule, delivery mode, admissions, and support are approved for publication?",
      "Is the organization offering education, coaching, practice, scholarship, or employment—and are those paths clearly separated?",
      "Which local, national, or multilingual queries show measurable demand?",
      "What evidence supports any course, cohort, student, or result claim?",
    ],
    requiredEvidence: [
      "written program facts and policies",
      "approved pricing and payment facts when pricing is public",
      "dated demand and competition evidence",
      "confirmed enrollment and response capacity",
      "case-study permission for any student or outcome result",
    ],
    prohibitedAssumptions: [
      "employment, income, client, ranking, view, lead, or certification guarantees",
      "Course or JobPosting schema without verified facts",
      "mixed paid enrollment and free practice claims",
      "unapproved prices or deadlines",
    ],
    sourceIds: [],
    measurableDemand: false,
    serviceResponseCapacityConfirmed: false,
    proofReviewed: false,
    uniqueContentPlan: false,
  },
  {
    id: "professional_services",
    label: "Professional services",
    priorityServiceClusters: ["website_creation", "website_redesign", "seo", "local_seo", "crm_automation"],
    researchQuestions: [
      "Which consultation, qualification, proposal, document, approval, and delivery workflows need a clearer public path?",
      "Which services are local, national, regulated, or referral-based?",
      "Which proof can be published without exposing client identity or confidential work?",
      "Which CRM and automation steps require human approval or licensed review?",
    ],
    requiredEvidence: [
      "approved service scope and professional boundaries",
      "dated market and query evidence",
      "real geographic/service-area relationship",
      "confirmed response capacity",
      "approved anonymization or permission for cases",
    ],
    prohibitedAssumptions: [
      "legal, financial, medical, tax, or licensing outcome claims",
      "client identities or confidential documents",
      "automatic professional advice or approval",
      "rankings, leads, revenue, or ROI guarantees",
    ],
    sourceIds: [],
    measurableDemand: false,
    serviceResponseCapacityConfirmed: false,
    proofReviewed: false,
    uniqueContentPlan: false,
  },
  {
    id: "home_services",
    label: "Home services",
    priorityServiceClusters: ["website_creation", "website_redesign", "local_seo", "crm_automation"],
    researchQuestions: [
      "Which real services, service areas, emergency rules, appointment windows, licenses, and estimates can be published?",
      "Which city/service combinations have distinct demand and unique operational guidance?",
      "How are calls, estimates, scheduling, dispatch, deposits, and follow-up handled?",
      "Which Google Business Profile and review workflows are approved and eligible?",
    ],
    requiredEvidence: [
      "real business location or service-area evidence",
      "approved services, licenses, insurance, and operating boundaries when applicable",
      "dated local demand and competition evidence",
      "confirmed phone/estimate response capacity",
      "unique city/service content plan",
    ],
    prohibitedAssumptions: [
      "24/7, same-day, emergency, licensed, insured, bonded, or guaranteed-service claims without evidence",
      "fake offices or unsupported service areas",
      "copied city pages",
      "price, arrival-time, lead, call, booking, or revenue guarantees",
    ],
    sourceIds: [],
    measurableDemand: false,
    serviceResponseCapacityConfirmed: false,
    proofReviewed: false,
    uniqueContentPlan: false,
  },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validDate(value: unknown): boolean {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function evaluateDigitalNicheResearch(record: DigitalNicheResearchRecord): {
  status: DigitalResearchStatus;
  blockers: string[];
} {
  const blockers: string[] = [];
  if (!Array.isArray(record.sourceIds) || !record.sourceIds.some(hasText)) blockers.push("dated research provenance is required");
  if (!validDate(record.reviewedAt)) blockers.push("reviewedAt must use a valid YYYY-MM-DD date");
  if (!record.measurableDemand) blockers.push("measurable niche demand is required");
  if (!record.serviceResponseCapacityConfirmed) blockers.push("service response capacity must be confirmed");
  if (!record.proofReviewed) blockers.push("proof and claims review is required");
  if (!record.uniqueContentPlan) blockers.push("unique niche or local content plan is required");

  if (blockers.length) return { status: "blocked_missing_evidence", blockers };
  return { status: "eligible_for_editorial_review", blockers: [] };
}
