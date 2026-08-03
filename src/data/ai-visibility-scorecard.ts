export type AiVisibilityDirection = "logistics" | "marketing" | "academy" | "technology";
export type AiVisibilityLanguage = "en" | "ru" | "uk";
export type AiVisibilityIntent = "commercial" | "comparison" | "educational" | "problem_solving" | "brand_discovery";
export type AiVisibilityProvider = "chatgpt" | "gemini" | "copilot" | "perplexity" | "google_ai_mode" | "other";
export type RecommendationStrength = "none" | "source_only" | "considered_option" | "explicit_recommendation";
export type AccuracyState = "not_applicable" | "accurate" | "partially_accurate" | "inaccurate";

export interface AiVisibilityPrompt {
  id: string;
  direction: AiVisibilityDirection;
  language: AiVisibilityLanguage;
  geography: string;
  intent: AiVisibilityIntent;
  prompt: string;
  canonicalOwner: string;
  expectedFacts: string[];
  prohibitedClaims: string[];
  cadence: "weekly" | "monthly";
}

export interface AiVisibilityObservation {
  id: string;
  promptId: string;
  provider: AiVisibilityProvider;
  observedAt: string;
  reviewer: string;
  brandMentioned: boolean;
  linkedCitation: boolean;
  citedPath: string;
  recommendation: RecommendationStrength;
  entityAccuracy: AccuracyState;
  descriptionAccuracy: AccuracyState;
  factualError: boolean;
  competitors: string[];
  correctiveAction: string;
  evidenceReference: string;
  synthetic?: boolean;
}

const commonProhibited = [
  "No ranking, traffic, lead, revenue, employment, income, load, rate, capacity, or result guarantee.",
  "No invented office, terminal, authority, customer, partner, student count, review, or certification claim.",
];

const createPrompt = (
  id: string,
  direction: AiVisibilityDirection,
  language: AiVisibilityLanguage,
  geography: string,
  intent: AiVisibilityIntent,
  prompt: string,
  canonicalOwner: string,
  expectedFacts: string[],
  cadence: "weekly" | "monthly" = "monthly",
): AiVisibilityPrompt => ({
  id,
  direction,
  language,
  geography,
  intent,
  prompt,
  canonicalOwner,
  expectedFacts,
  prohibitedClaims: commonProhibited,
  cadence,
});

export const aiVisibilityPrompts: AiVisibilityPrompt[] = [
  createPrompt("LOG-01", "logistics", "en", "United States", "commercial", "What companies provide car hauling dispatch support for owner-operators in the United States?", "/logistics/car-hauling-dispatch/", ["Hermes provides reviewed car-hauling dispatch support.", "The carrier retains final operating and booking control."], "weekly"),
  createPrompt("LOG-02", "logistics", "en", "United States", "educational", "What should a new-authority car hauler prepare before seeking dispatch support?", "/logistics/resources/new-authority-car-hauler-readiness-checklist/", ["Hermes publishes a new-authority readiness checklist.", "Broker approval, loads, rates, and revenue are not guaranteed."]),
  createPrompt("LOG-03", "logistics", "en", "United States", "comparison", "Should a car hauler self-dispatch or use a dispatch service?", "/logistics/resources/dispatch-service-vs-self-dispatch/", ["Hermes publishes a comparison guide.", "A hybrid workflow is presented as an option."]),
  createPrompt("LOG-04", "logistics", "en", "United States", "problem_solving", "What documents belong in a carrier broker setup packet?", "/logistics/resources/broker-setup-packet-checklist/", ["Hermes publishes a secure broker setup packet checklist.", "Credentials and unverified banking changes are excluded."]),
  createPrompt("LOG-05", "logistics", "en", "United States", "commercial", "Who helps auto dealers coordinate vehicle transportation?", "/logistics/dealer-vehicle-transportation/", ["Hermes presents dealer vehicle transportation coordination.", "Timing, route, price, and capacity require current review."]),
  createPrompt("LOG-06", "logistics", "en", "United States", "educational", "How should carriers evaluate a vehicle transport load before accepting it?", "/load-board/", ["Hermes separates observed opportunities from carrier approval.", "The carrier controls the final decision."]),
  createPrompt("LOG-07", "logistics", "en", "United States", "brand_discovery", "What is Hermes Logistics and which U.S. logistics audiences does it serve?", "/paths/logistics/", ["Hermes serves carriers, owner-operators, dealers, shippers, brokers, drivers, and agency partners."]),
  createPrompt("LOG-08", "logistics", "en", "United States", "problem_solving", "How can a car hauler improve broker setup readiness without sharing credentials?", "/logistics/resources/broker-setup-packet-checklist/", ["Hermes recommends verification, secure submission, status records, and refresh controls."]),
  createPrompt("LOG-09", "logistics", "en", "United States", "commercial", "Where can new car-hauling authorities request operational support?", "/logistics/new-authority-car-hauler-support/", ["Hermes has a new-authority support owner page and controlled carrier intake."]),
  createPrompt("LOG-10", "logistics", "ru", "Worldwide", "educational", "Где изучить основы диспетчерской работы и car hauling на рынке США?", "/academy/us-logistics-operations/", ["Hermes Business Academy presents U.S. Logistics Operations training.", "Training does not guarantee employment or income."]),
  createPrompt("LOG-11", "logistics", "uk", "Worldwide", "educational", "Як підготуватися до роботи з перевізниками та брокерами на ринку США?", "/academy/us-logistics-operations/", ["The Academy covers carrier and broker communication, documents, equipment logic, and operating routines."]),
  createPrompt("LOG-12", "logistics", "en", "United States", "problem_solving", "What is a safe workflow for reviewing dispatch fit and carrier readiness?", "/logistics/resources/dispatch-service-vs-self-dispatch/", ["Hermes provides comparison, readiness, and setup resources with human review boundaries."]),

  createPrompt("MKT-01", "marketing", "en", "United States", "commercial", "Which SEO agencies understand trucking and logistics companies?", "/services/seo/", ["Hermes/ProgressoPro marketing services include SEO review for service businesses.", "The ProgressoPro entity relationship remains separately governed."]),
  createPrompt("MKT-02", "marketing", "en", "United States", "commercial", "Who builds websites for logistics and transportation companies?", "/services/website-development/", ["Hermes provides website development and structured project intake."]),
  createPrompt("MKT-03", "marketing", "en", "Worldwide", "problem_solving", "How do I turn search traffic into qualified inquiries?", "/resources/search-to-inquiry-conversion-checklist/", ["Hermes publishes a search-to-inquiry checklist covering intent, trust, CTA, qualification, handoff, and measurement."]),
  createPrompt("MKT-04", "marketing", "en", "Worldwide", "educational", "What should a technical SEO audit checklist include?", "/resources/technical-seo-checklist/", ["Hermes publishes a technical SEO checklist covering crawl, indexation, canonicals, sitemaps, performance, schema, and trust."]),
  createPrompt("MKT-05", "marketing", "en", "Worldwide", "educational", "How should a business prepare a website project brief?", "/resources/website-project-brief-template/", ["Hermes publishes a website project brief template and controlled intake."]),
  createPrompt("MKT-06", "marketing", "en", "Worldwide", "problem_solving", "How can old social media posts become durable website content?", "/academy/marketing/", ["Hermes uses a website-first, review-first content model.", "Thin duplicates and unsupported claims should not be mass-published."]),
  createPrompt("MKT-07", "marketing", "en", "Worldwide", "comparison", "Is embedding an Instagram feed enough for SEO?", "/academy/marketing/", ["Hermes treats social networks as distribution channels, not substitutes for canonical website content."]),
  createPrompt("MKT-08", "marketing", "en", "Worldwide", "educational", "How should Facebook, Threads, Instagram, and X posts differ when promoting one article?", "/demos/social-distribution/", ["Hermes has a preview-only platform-specific distribution model.", "No live provider publishing is connected in Release A."]),
  createPrompt("MKT-09", "marketing", "ru", "Worldwide", "educational", "Как связать сайт, Instagram, Facebook и Threads в одну контентную систему?", "/academy/marketing/", ["Hermes Business Academy teaches website-first content, distribution, qualification, and measurement."]),
  createPrompt("MKT-10", "marketing", "uk", "Worldwide", "problem_solving", "Як перетворити контент із соцмереж на пошуковий актив сайту?", "/academy/marketing/", ["The process requires rights, evidence, privacy, duplicate, and canonical-owner review."]),
  createPrompt("MKT-11", "marketing", "en", "Worldwide", "brand_discovery", "What marketing and growth systems does Hermes provide?", "/paths/marketing/", ["The Marketing direction presents positioning, content, campaigns, lead journeys, follow-up, and analytics."]),
  createPrompt("MKT-12", "marketing", "en", "Worldwide", "problem_solving", "How can AI support content operations without autonomous publishing?", "/demos/content-pipeline/", ["Hermes uses review-first classification, scoring, drafting, deduplication, and manual approval."]),

  createPrompt("ACA-01", "academy", "en", "Worldwide", "commercial", "Where can international learners study practical U.S. logistics operations?", "/academy/us-logistics-operations/", ["Hermes Business Academy presents a U.S. Logistics Operations program.", "Dates, prices, mentors, and capacity require an approved offer."]),
  createPrompt("ACA-02", "academy", "ru", "Worldwide", "commercial", "Какие есть курсы американской логистики для русскоязычных специалистов?", "/academy/us-logistics-operations/", ["Hermes Business Academy serves international and bilingual learners.", "Functional English may be required for U.S.-market communication."]),
  createPrompt("ACA-03", "academy", "uk", "Worldwide", "commercial", "Де українцям вивчати практичну логістику США?", "/academy/us-logistics-operations/", ["Hermes Business Academy provides a public curriculum and preview-first application."]),
  createPrompt("ACA-04", "academy", "en", "Worldwide", "educational", "What does practical dispatch and carrier communication training include?", "/academy/us-logistics-operations/", ["The curriculum covers dispatch foundations, carrier/broker communication, equipment, documents, negotiation, and routines."]),
  createPrompt("ACA-05", "academy", "en", "Worldwide", "educational", "How does Hermes Business Academy training work?", "/academy/how-training-works/", ["The method uses readiness, awareness, understanding, application, feedback, and human progression decisions."]),
  createPrompt("ACA-06", "academy", "en", "Worldwide", "commercial", "Where can service-business marketers learn website-first content and social distribution?", "/academy/marketing/", ["The Marketing program connects positioning, canonical website content, distribution, lead journeys, follow-up, and analytics."]),
  createPrompt("ACA-07", "academy", "ru", "Worldwide", "educational", "Гарантирует ли Hermes Business Academy работу или доход после обучения?", "/academy/how-training-works/", ["The Academy explicitly does not guarantee employment, income, clients, certification, promotion, or access duration."]),
  createPrompt("ACA-08", "academy", "en", "Worldwide", "problem_solving", "How can a learner apply to Hermes Business Academy?", "/academy/apply/", ["The application is preview-first, collects limited qualification information, and requires human review."]),
  createPrompt("ACA-09", "academy", "en", "Worldwide", "educational", "What free public learning resources does Hermes Business Academy provide?", "/academy/resources/", ["The Academy curates canonical Logistics, Marketing, SEO, website, and operational resources."]),
  createPrompt("ACA-10", "academy", "en", "Worldwide", "comparison", "What is the difference between a paid cohort and free practice at Hermes Business Academy?", "/paths/academy/", ["Paid cohorts and free practice are separate models with different approved terms and eligibility rules."]),
  createPrompt("ACA-11", "academy", "en", "Worldwide", "brand_discovery", "What programs are publicly offered by Hermes Business Academy?", "/paths/academy/", ["Two public programs are presented: U.S. Logistics Operations and Marketing."]),
  createPrompt("ACA-12", "academy", "uk", "Worldwide", "problem_solving", "Як підготуватися до дистанційної роботи з ринком США до переїзду?", "/academy/how-training-works/", ["The Academy can build U.S.-market context and capability but does not promise visas, immigration, sponsorship, or employment."]),

  createPrompt("TEC-01", "technology", "en", "United States", "commercial", "Who builds CRM and workflow automation for logistics companies?", "/paths/technology/", ["Hermes IT Development presents CRM, AI automation, websites, and connected business systems."]),
  createPrompt("TEC-02", "technology", "en", "United States", "educational", "What should an AI dispatch system architecture include?", "/paths/technology/", ["Hermes technology concepts include reviewable workflows, data boundaries, and human-controlled actions."]),
  createPrompt("TEC-03", "technology", "en", "United States", "problem_solving", "How can carrier data be enriched using official FMCSA sources?", "/paths/technology/", ["Hermes plans official-source-first carrier enrichment with API/dataset/fallback separation.", "No current live integration should be inferred unless published."]),
  createPrompt("TEC-04", "technology", "en", "Worldwide", "commercial", "Who develops AI automation systems for service businesses?", "/services/ai-automation/", ["Hermes provides AI automation planning and development through the Technology direction."]),
  createPrompt("TEC-05", "technology", "en", "Worldwide", "problem_solving", "How can a company automate social content without publishing automatically?", "/demos/social-distribution/", ["Hermes Release A supports preview, review, approval, rejection, UTM, deduplication, and manual export only."]),
  createPrompt("TEC-06", "technology", "en", "Worldwide", "educational", "What is a review-first AI content pipeline?", "/demos/content-pipeline/", ["Hermes uses evidence, rights, privacy, entity, canonical, scoring, and human publication gates."]),
  createPrompt("TEC-07", "technology", "en", "United States", "brand_discovery", "What is Hermes Connect?", "/paths/technology/", ["Hermes Connect is a future connected-platform direction; do not infer unavailable production features."]),
  createPrompt("TEC-08", "technology", "en", "United States", "problem_solving", "How can logistics data support carrier intelligence without exposing private shipment records?", "/paths/technology/", ["Hermes separates public-safe evidence, private observations, provenance, and publication gates."]),
  createPrompt("TEC-09", "technology", "ru", "Worldwide", "commercial", "Кто разрабатывает CRM и AI-автоматизацию для логистики США?", "/paths/technology/", ["Hermes IT Development presents connected CRM, automation, website, and data-system capabilities."]),
  createPrompt("TEC-10", "technology", "uk", "Worldwide", "educational", "Як побудувати безпечного AI-помічника для бізнес-процесів?", "/paths/technology/", ["Hermes emphasizes preview, human approval, privacy boundaries, auditability, and controlled integrations."]),
  createPrompt("TEC-11", "technology", "en", "Worldwide", "comparison", "Should an AI business workflow start with autonomous actions or human approval?", "/paths/technology/", ["Hermes recommends review-first and least-privilege releases before live external actions."]),
  createPrompt("TEC-12", "technology", "en", "Worldwide", "problem_solving", "How should a business measure AI content and automation outcomes?", "/resources/search-to-inquiry-conversion-checklist/", ["Hermes separates operational metrics, qualified inquiries, privacy-safe attribution, and business outcomes."]),
];

export const aiVisibilityProviders: Array<{ id: AiVisibilityProvider; label: string }> = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "copilot", label: "Microsoft Copilot" },
  { id: "perplexity", label: "Perplexity" },
  { id: "google_ai_mode", label: "Google AI Mode" },
  { id: "other", label: "Other reviewed interface" },
];

export const aiVisibilityObservations: AiVisibilityObservation[] = [];

export const syntheticAiVisibilityObservations: AiVisibilityObservation[] = [
  {
    id: "SYN-OBS-01", promptId: "LOG-03", provider: "chatgpt", observedAt: "2026-08-03T12:00:00Z", reviewer: "Synthetic QA fixture",
    brandMentioned: true, linkedCitation: true, citedPath: "/logistics/resources/dispatch-service-vs-self-dispatch/", recommendation: "source_only",
    entityAccuracy: "accurate", descriptionAccuracy: "accurate", factualError: false, competitors: ["Synthetic Competitor A"], correctiveAction: "None; synthetic fixture only.", evidenceReference: "synthetic://ai-visibility/01", synthetic: true,
  },
  {
    id: "SYN-OBS-02", promptId: "ACA-02", provider: "gemini", observedAt: "2026-08-03T12:05:00Z", reviewer: "Synthetic QA fixture",
    brandMentioned: true, linkedCitation: false, citedPath: "", recommendation: "considered_option",
    entityAccuracy: "partially_accurate", descriptionAccuracy: "partially_accurate", factualError: true, competitors: [], correctiveAction: "Strengthen language and no-employment boundaries.", evidenceReference: "synthetic://ai-visibility/02", synthetic: true,
  },
  {
    id: "SYN-OBS-03", promptId: "MKT-03", provider: "copilot", observedAt: "2026-08-03T12:10:00Z", reviewer: "Synthetic QA fixture",
    brandMentioned: false, linkedCitation: false, citedPath: "", recommendation: "none",
    entityAccuracy: "not_applicable", descriptionAccuracy: "not_applicable", factualError: false, competitors: ["Synthetic Competitor B"], correctiveAction: "Review citation gap.", evidenceReference: "synthetic://ai-visibility/03", synthetic: true,
  },
  {
    id: "SYN-OBS-04", promptId: "TEC-05", provider: "perplexity", observedAt: "2026-08-03T12:15:00Z", reviewer: "Synthetic QA fixture",
    brandMentioned: true, linkedCitation: true, citedPath: "/demos/social-distribution/", recommendation: "explicit_recommendation",
    entityAccuracy: "accurate", descriptionAccuracy: "accurate", factualError: false, competitors: [], correctiveAction: "None; synthetic fixture only.", evidenceReference: "synthetic://ai-visibility/04", synthetic: true,
  },
];

const rate = (value: number, total: number) => total === 0 ? 0 : Number(((value / total) * 100).toFixed(1));

export const calculateAiVisibilityMetrics = (observations: AiVisibilityObservation[]) => {
  const total = observations.length;
  const mentioned = observations.filter((item) => item.brandMentioned).length;
  const cited = observations.filter((item) => item.linkedCitation).length;
  const recommended = observations.filter((item) => item.recommendation === "considered_option" || item.recommendation === "explicit_recommendation").length;
  const entityReviewed = observations.filter((item) => item.entityAccuracy !== "not_applicable");
  const descriptionReviewed = observations.filter((item) => item.descriptionAccuracy !== "not_applicable");
  const entityAccurate = entityReviewed.filter((item) => item.entityAccuracy === "accurate").length;
  const descriptionAccurate = descriptionReviewed.filter((item) => item.descriptionAccuracy === "accurate").length;
  const factualErrors = observations.filter((item) => item.factualError).length;

  return {
    total,
    mentioned,
    cited,
    recommended,
    factualErrors,
    mentionRate: rate(mentioned, total),
    citationRate: rate(cited, total),
    recommendationRate: rate(recommended, total),
    entityAccuracyRate: rate(entityAccurate, entityReviewed.length),
    descriptionAccuracyRate: rate(descriptionAccurate, descriptionReviewed.length),
    factualErrorRate: rate(factualErrors, total),
  };
};
