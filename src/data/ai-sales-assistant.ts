export type SalesAssistantSituation =
  | "carrier"
  | "vehicle_transport"
  | "business_growth"
  | "academy"
  | "careers"
  | "broker"
  | "uncertain";

export type ClaimMaturity =
  | "LIVE_VERIFIED"
  | "LIVE_REVIEW_REQUIRED"
  | "PREVIEW"
  | "CONCEPT"
  | "EVIDENCE_REQUIRED";

export interface SalesAssistantRoute {
  situation: SalesAssistantSituation;
  diagnose: string[];
  metrics: string[];
  smallestStep: string;
  roadmap: string[];
  ctaLabel: string;
  ctaHref: string;
  maturity: ClaimMaturity;
  prohibitedClaims: string[];
}

export const salesAssistantOperatingLoop = [
  "diagnose",
  "clarify_metrics",
  "smallest_useful_step",
  "roadmap",
  "cta",
] as const;

const universalProhibitedClaims = [
  "guaranteed loads",
  "guaranteed rankings",
  "guaranteed revenue",
  "guaranteed employment",
  "fabricated proof",
  "live inventory from a preview",
];

export const salesAssistantRoutes: SalesAssistantRoute[] = [
  {
    situation: "carrier",
    diagnose: ["authority readiness", "equipment and capacity", "availability", "markets", "current dispatch model", "operating bottleneck"],
    metrics: ["loaded miles", "deadhead", "candidate-load quality", "response time", "paperwork backlog", "repeat-customer share"],
    smallestStep: "Complete the carrier operating profile before choosing a larger support scope.",
    roadmap: ["operating profile", "current-load workflow", "back-office discipline", "direct-demand research", "evidence-gated lane development"],
    ctaLabel: "Start carrier review",
    ctaHref: "/logistics/start-car-hauling-dispatch/",
    maturity: "LIVE_REVIEW_REQUIRED",
    prohibitedClaims: [...universalProhibitedClaims, "guaranteed lanes", "guaranteed rate or mileage"],
  },
  {
    situation: "vehicle_transport",
    diagnose: ["pickup market", "delivery market", "vehicle count and type", "condition", "ready date", "handling or facility requirements"],
    metrics: ["route completeness", "timing", "equipment fit", "reviewed carrier fit"],
    smallestStep: "Submit a qualified transportation request for human review.",
    roadmap: ["request", "qualification", "carrier fit review", "human confirmation"],
    ctaLabel: "Request vehicle transport",
    ctaHref: "/logistics/request-vehicle-transport/#transport-intake",
    maturity: "LIVE_REVIEW_REQUIRED",
    prohibitedClaims: [...universalProhibitedClaims, "automatic booking", "automatic carrier commitment"],
  },
  {
    situation: "business_growth",
    diagnose: ["business result", "existing assets", "acquisition or sales bottleneck", "planning budget", "time horizon", "evidence already available"],
    metrics: ["qualified inquiries", "conversion rate", "cost per qualified lead", "search visibility", "booked calls", "proposal rate"],
    smallestStep: "Choose the smallest scope that can test the important business assumption.",
    roadmap: ["first bottleneck", "3-month measurable acquisition", "6-month optimization", "9-month marketing-sales connection", "12-month scale"],
    ctaLabel: "Build a growth plan",
    ctaHref: "/business-growth/#business-lead",
    maturity: "LIVE_REVIEW_REQUIRED",
    prohibitedClaims: [...universalProhibitedClaims, "mandatory website rebuild", "budget must be fully spent", "guaranteed leads or sales"],
  },
  {
    situation: "academy",
    diagnose: ["starting level", "program direction", "experience", "availability", "practical skill target"],
    metrics: ["task accuracy", "repeatability", "error correction", "human review outcome"],
    smallestStep: "Enter at the level supported by current ability and the approved program rules.",
    roadmap: ["explanation", "example", "task", "feedback", "repeat", "human-reviewed progression"],
    ctaLabel: "Review Academy programs",
    ctaHref: "/paths/academy/",
    maturity: "LIVE_REVIEW_REQUIRED",
    prohibitedClaims: [...universalProhibitedClaims, "guaranteed certificate", "guaranteed income", "automatic live-operations access"],
  },
  {
    situation: "careers",
    diagnose: ["target role", "relevant work or starting level", "measurable results", "location and time zone", "languages", "availability", "role-specific evidence"],
    metrics: ["evidence quality", "role fit", "schedule fit", "language fit", "human screening outcome"],
    smallestStep: "Prepare the qualification evidence needed before interview time is requested.",
    roadmap: ["application", "human review", "evidence or practical step", "interview when justified"],
    ctaLabel: "Prepare a careers inquiry",
    ctaHref: "/logistics/apply/",
    maturity: "LIVE_REVIEW_REQUIRED",
    prohibitedClaims: [...universalProhibitedClaims, "guaranteed interview", "guaranteed compensation", "automatic hiring decision"],
  },
  {
    situation: "broker",
    diagnose: ["origin", "destination", "dates", "equipment", "commodity", "rate context", "authority and insurance expectations"],
    metrics: ["request completeness", "equipment fit", "current verified capacity"],
    smallestStep: "Submit the carrier-capacity request for human review.",
    roadmap: ["request", "load and broker review", "capacity fit", "human handoff"],
    ctaLabel: "Request verified carrier capacity",
    ctaHref: "/paths/logistics/brokers/carrier-capacity/",
    maturity: "LIVE_REVIEW_REQUIRED",
    prohibitedClaims: [...universalProhibitedClaims, "automatic carrier commitment"],
  },
  {
    situation: "uncertain",
    diagnose: ["what needs to happen", "who the visitor is", "what is blocked now"],
    metrics: ["correct destination selected"],
    smallestStep: "Choose the situation before recommending a service.",
    roadmap: ["situation", "qualification", "correct Hermes path"],
    ctaLabel: "Choose what you need",
    ctaHref: "/#start",
    maturity: "LIVE_VERIFIED",
    prohibitedClaims: [...universalProhibitedClaims],
  },
];

export const salesAssistantRouteBySituation = Object.fromEntries(
  salesAssistantRoutes.map((route) => [route.situation, route]),
) as Record<SalesAssistantSituation, SalesAssistantRoute>;

export const consequentialActionsRequireHumanReview = [
  "book_freight",
  "commit_carrier",
  "sign_contract",
  "accept_payment",
  "hire_or_reject_candidate",
  "approve_training_progression",
  "publish_external_message",
] as const;

export const salesAssistantAnalyticsAllowlist = [
  "situation_selected",
  "qualification_started",
  "qualification_completed",
  "canonical_destination_selected",
  "transport_request_started",
  "carrier_intake_started",
  "business_growth_brief_started",
  "academy_application_started",
  "careers_inquiry_started",
  "human_handoff_requested",
] as const;
