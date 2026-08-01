export type CarrierLanguageCode =
  | "en"
  | "es"
  | "ru"
  | "uk"
  | "ro"
  | "lt"
  | "hi"
  | "pa"
  | "gu";

export type CarrierLanguagePriority =
  | "primary_research"
  | "conditional_research"
  | "research_only";

export type CarrierLanguageStatus =
  | "blocked_missing_evidence"
  | "research_only"
  | "eligible_for_editorial_review";

export interface CarrierQueryHypothesis {
  id: string;
  phrase: string;
  intent:
    | "dispatch_support"
    | "new_authority_support"
    | "backhaul_deadhead"
    | "documents_setup"
    | "direct_freight_development";
  researchOnly: true;
}

export interface CarrierLanguageResearchEntry {
  code: CarrierLanguageCode;
  label: string;
  priority: CarrierLanguagePriority;
  queryHypotheses: CarrierQueryHypothesis[];
  terminologyRules: string[];
  publicationRequirements: string[];
}

export interface CarrierLanguageEvidence {
  sourceIds: string[];
  reviewedAt: string;
  measurableDemand: boolean;
  responseCapacityConfirmed: boolean;
  terminologyReviewedByCapableHuman: boolean;
  uniqueContentPlan: boolean;
  canonicalAndHreflangPlan: boolean;
  usefulCtaAndLanguageDisclosure: boolean;
}

export interface CarrierLanguageEvaluation {
  status: CarrierLanguageStatus;
  blockers: string[];
  limitations: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const sharedRequirements = [
  "dated query or Search Console evidence",
  "confirmed response capacity in the represented language",
  "natural terminology review by a capable human",
  "unique content plan rather than translated thin copy",
  "canonical and hreflang plan",
  "useful CTA with response-language disclosure",
];

const sharedTerminologyRules = [
  "Keep common U.S. operating terms in English when that is how the audience searches and works.",
  "Explain carrier, owner-operator, dispatch, load, broker, shipper, dealer, MC, DOT, COI, BOL, POD, backhaul, deadhead, and car hauler naturally in context.",
  "Do not treat a machine translation as terminology approval.",
  "Do not target nationality; target a documented logistics business need and communication preference.",
];

export const carrierLanguageResearch: CarrierLanguageResearchEntry[] = [
  {
    code: "en",
    label: "English",
    priority: "primary_research",
    queryHypotheses: [
      {
        id: "en-car-hauler-dispatch",
        phrase: "car hauler dispatch support",
        intent: "dispatch_support",
        researchOnly: true,
      },
      {
        id: "en-owner-operator-dispatch",
        phrase: "dispatch service for car hauling owner operators",
        intent: "dispatch_support",
        researchOnly: true,
      },
      {
        id: "en-new-authority",
        phrase: "new authority car hauler support",
        intent: "new_authority_support",
        researchOnly: true,
      },
      {
        id: "en-backhaul",
        phrase: "car hauler backhaul planning",
        intent: "backhaul_deadhead",
        researchOnly: true,
      },
    ],
    terminologyRules: sharedTerminologyRules,
    publicationRequirements: sharedRequirements,
  },
  {
    code: "es",
    label: "Spanish",
    priority: "conditional_research",
    queryHypotheses: [
      {
        id: "es-car-hauler-dispatch",
        phrase: "apoyo de dispatch para transportistas de autos",
        intent: "dispatch_support",
        researchOnly: true,
      },
      {
        id: "es-owner-operator-dispatch",
        phrase: "servicio de despacho para car haulers owner-operators",
        intent: "dispatch_support",
        researchOnly: true,
      },
    ],
    terminologyRules: [
      ...sharedTerminologyRules,
      "Review whether the audience uses despacho, dispatch, transportista de autos, car hauler, or a mixed U.S. logistics phrase before publication.",
    ],
    publicationRequirements: sharedRequirements,
  },
  {
    code: "ru",
    label: "Russian",
    priority: "conditional_research",
    queryHypotheses: [
      {
        id: "ru-car-hauler-dispatch",
        phrase: "диспетчерская поддержка для car hauler в США",
        intent: "dispatch_support",
        researchOnly: true,
      },
      {
        id: "ru-new-authority",
        phrase: "поддержка нового MC для автовоза в США",
        intent: "new_authority_support",
        researchOnly: true,
      },
    ],
    terminologyRules: [
      ...sharedTerminologyRules,
      "Use natural Russian explanations while preserving common U.S. terms such as dispatch, carrier, load, broker, MC, DOT, COI, BOL, and POD where operationally clearer.",
    ],
    publicationRequirements: sharedRequirements,
  },
  {
    code: "uk",
    label: "Ukrainian",
    priority: "conditional_research",
    queryHypotheses: [
      {
        id: "uk-car-hauler-dispatch",
        phrase: "диспетчерська підтримка для car hauler у США",
        intent: "dispatch_support",
        researchOnly: true,
      },
      {
        id: "uk-new-authority",
        phrase: "підтримка нового MC для автовоза у США",
        intent: "new_authority_support",
        researchOnly: true,
      },
    ],
    terminologyRules: [
      ...sharedTerminologyRules,
      "Use natural Ukrainian explanations while preserving common U.S. terms such as dispatch, carrier, load, broker, MC, DOT, COI, BOL, and POD where operationally clearer.",
    ],
    publicationRequirements: sharedRequirements,
  },
  ...([
    ["ro", "Romanian"],
    ["lt", "Lithuanian"],
    ["hi", "Hindi"],
    ["pa", "Punjabi"],
    ["gu", "Gujarati"],
  ] as const).map(([code, label]) => ({
    code,
    label,
    priority: "research_only" as const,
    queryHypotheses: [],
    terminologyRules: [
      ...sharedTerminologyRules,
      "Do not add keyword phrases until a capable human reviews natural U.S. logistics terminology for this language.",
    ],
    publicationRequirements: [
      ...sharedRequirements,
      "language remains research-only until the owner approves a separate evidence-backed release review",
    ],
  })),
];

const languageByCode = new Map(carrierLanguageResearch.map((entry) => [entry.code, entry]));

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoCalendarDate(value: unknown): value is string {
  if (!hasText(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function getCarrierLanguageResearch(
  code: CarrierLanguageCode,
): CarrierLanguageResearchEntry {
  const entry = languageByCode.get(code);
  if (!entry) throw new Error(`Unsupported carrier research language: ${code}`);
  return entry;
}

export function evaluateCarrierLanguageResearch(
  code: CarrierLanguageCode,
  evidence: CarrierLanguageEvidence,
): CarrierLanguageEvaluation {
  const entry = getCarrierLanguageResearch(code);
  const blockers: string[] = [];

  if (!Array.isArray(evidence.sourceIds) || !evidence.sourceIds.some((sourceId) => hasText(sourceId))) {
    blockers.push("dated demand provenance is required");
  }
  if (!isIsoCalendarDate(evidence.reviewedAt)) {
    blockers.push("reviewedAt must use a valid YYYY-MM-DD date");
  }
  if (!evidence.measurableDemand) blockers.push("measurable language-specific demand is required");
  if (!evidence.responseCapacityConfirmed) blockers.push("response capacity must be confirmed");
  if (!evidence.terminologyReviewedByCapableHuman) blockers.push("capable-human terminology review is required");
  if (!evidence.uniqueContentPlan) blockers.push("a unique content plan is required");
  if (!evidence.canonicalAndHreflangPlan) blockers.push("canonical and hreflang planning is required");
  if (!evidence.usefulCtaAndLanguageDisclosure) blockers.push("a useful CTA and language disclosure are required");

  const limitations = [
    "Query phrases are hypotheses until dated demand evidence is attached.",
    "Language eligibility does not authorize a translated page, route claim, or public operational claim.",
    "No machine-translated thin page may be published from this registry.",
  ];

  if (blockers.length > 0) {
    return { status: "blocked_missing_evidence", blockers, limitations };
  }

  if (entry.priority === "research_only") {
    return {
      status: "research_only",
      blockers: ["language is held research-only pending a separate owner-approved evidence review"],
      limitations,
    };
  }

  return {
    status: "eligible_for_editorial_review",
    blockers: [],
    limitations,
  };
}
