import type {
  CarrierEquipmentClusterId,
  CarrierOperatingStage,
  CarrierProblemClusterId,
} from "./carrier-research-registry";

export interface CarrierCtaVariant {
  id: string;
  audienceType: "equipment" | "operating_stage" | "problem";
  equipmentCluster?: CarrierEquipmentClusterId;
  operatingStage?: CarrierOperatingStage;
  problemCluster?: CarrierProblemClusterId;
  label: string;
  destination: string;
  disclosure: string;
}

export interface CarrierProblemHubLink {
  problemCluster: CarrierProblemClusterId;
  links: Array<{ label: string; href: string }>;
}

export interface CarrierFaqItem {
  question: string;
  answer: string;
}

export interface CarrierQualificationField {
  id: string;
  label: string;
  privacyClass: "public_safe_category" | "private_intake_only";
  requiredForReview: boolean;
  guidance: string;
}

export interface CarrierRefreshPolicy {
  cadence: "monthly" | "quarterly" | "event_triggered";
  reviewItems: string[];
  triggers: string[];
}

export interface CarrierMeasurementContract {
  searchConsoleMetrics: string[];
  ga4Events: Array<{
    event: "logistics_cta_click" | "contact_click";
    allowedParameters: string[];
  }>;
  inquiryMetric: {
    status: "aggregate_only_when_approved";
    definition: string;
    prohibitedData: string[];
  };
  cannibalizationReview: string[];
}

const reviewDisclosure =
  "This action starts a review only. It does not create an account, approve a carrier, book a load, or guarantee rates, revenue, mileage, capacity, or direct freight.";

export const carrierCtaVariants: CarrierCtaVariant[] = [
  {
    id: "equipment-open-review",
    audienceType: "equipment",
    equipmentCluster: "open_car_hauler",
    label: "Share your open-car-hauler equipment, current area, and preferred operating lanes for review.",
    destination: "/logistics/owner-operator-dispatch-support/",
    disclosure: reviewDisclosure,
  },
  {
    id: "equipment-enclosed-review",
    audienceType: "equipment",
    equipmentCluster: "enclosed_car_hauler",
    label: "Share enclosed equipment details and operating area for a fit review.",
    destination: "/logistics/car-hauling-dispatch/",
    disclosure: reviewDisclosure,
  },
  {
    id: "equipment-hotshot-review",
    audienceType: "equipment",
    equipmentCluster: "hotshot_car_hauler",
    label: "Share your truck and trailer configuration, documented capacity, authority stage, and operating area for review.",
    destination: "/logistics/new-authority-car-hauler-support/",
    disclosure: reviewDisclosure,
  },
  {
    id: "equipment-multicar-review",
    audienceType: "equipment",
    equipmentCluster: "multi_car_trailer",
    label: "Share documented unit capacity, equipment, current area, and preferred lanes for review.",
    destination: "/logistics/fleet-owner-dispatch-support/",
    disclosure: reviewDisclosure,
  },
  {
    id: "stage-new-authority-review",
    audienceType: "operating_stage",
    operatingStage: "new_authority",
    label: "Prepare your authority status, equipment, insurance status, and operating preferences for a readiness review.",
    destination: "/logistics/new-authority-car-hauler-support/",
    disclosure: reviewDisclosure,
  },
  {
    id: "stage-active-owner-operator-review",
    audienceType: "operating_stage",
    operatingStage: "active_owner_operator",
    label: "Share your current area, equipment, and preferred lanes for dispatch-support review.",
    destination: "/logistics/owner-operator-dispatch-support/",
    disclosure: reviewDisclosure,
  },
  {
    id: "stage-small-fleet-review",
    audienceType: "operating_stage",
    operatingStage: "small_fleet",
    label: "Review fleet equipment, dispatch workflow, documentation, and operating preferences.",
    destination: "/logistics/fleet-owner-dispatch-support/",
    disclosure: reviewDisclosure,
  },
  {
    id: "stage-growth-review",
    audienceType: "operating_stage",
    operatingStage: "growth_stage",
    label: "Discuss a separate long-term shipper and dealer development scope around verified equipment and markets.",
    destination: "/paths/logistics/carriers/direct-freight-development/",
    disclosure: reviewDisclosure,
  },
];

export const carrierProblemHubLinks: CarrierProblemHubLink[] = [
  {
    problemCluster: "load_search",
    links: [
      { label: "Car hauling dispatch support", href: "/logistics/car-hauling-dispatch/" },
      { label: "Owner-operator dispatch support", href: "/logistics/owner-operator-dispatch-support/" },
    ],
  },
  {
    problemCluster: "backhaul_deadhead",
    links: [
      { label: "Owner-operator lane and dispatch support", href: "/logistics/owner-operator-dispatch-support/" },
      { label: "Find your logistics path", href: "/paths/logistics/find-your-path/" },
    ],
  },
  {
    problemCluster: "documents_setup",
    links: [
      { label: "New authority car-hauler support", href: "/logistics/new-authority-car-hauler-support/" },
      { label: "Car-hauler capacity checklist", href: "/logistics/resources/car-hauler-capacity-checklist/" },
    ],
  },
  {
    problemCluster: "rate_negotiation_support",
    links: [
      { label: "Carrier-controlled car hauling dispatch", href: "/logistics/car-hauling-dispatch/" },
      { label: "Carrier logistics path", href: "/logistics/carrier/" },
    ],
  },
  {
    problemCluster: "direct_shipper_dealer_development",
    links: [
      { label: "Direct freight development path", href: "/paths/logistics/carriers/direct-freight-development/" },
      { label: "Dealer vehicle transportation", href: "/logistics/dealer-vehicle-transportation/" },
    ],
  },
];

export const carrierNoGuaranteeFaq: CarrierFaqItem[] = [
  {
    question: "Does Hermes guarantee loads, rates, mileage, or revenue?",
    answer: "No. Hermes may provide research, communication, dispatch, documentation, and business-development support within the agreed scope. Market availability and results are not guaranteed.",
  },
  {
    question: "Who makes the final decision on a load?",
    answer: "The motor carrier does. The carrier reviews the available information and keeps final control over loads, rates, routes, equipment, safety, and operating decisions.",
  },
  {
    question: "Can a new authority begin active dispatch immediately?",
    answer: "Not always. Authority status, insurance, equipment, documents, broker requirements, safety information, and operating readiness require review. A review is not approval or a first-load guarantee.",
  },
  {
    question: "Does Hermes guarantee insurance, financing, a truck, or a trailer?",
    answer: "No. Hermes may research or introduce third-party providers through an approved manual process. Each provider controls eligibility, underwriting, financing, pricing, inventory, condition, terms, and service decisions.",
  },
  {
    question: "Is direct shipper or dealer freight guaranteed?",
    answer: "No. Direct-freight development is a separate long-term research and relationship-development process. Responses, agreements, exclusivity, recurring volume, and loads are not guaranteed.",
  },
];

export const carrierQualificationFields: CarrierQualificationField[] = [
  {
    id: "authority_stage",
    label: "Authority stage",
    privacyClass: "private_intake_only",
    requiredForReview: true,
    guidance: "Collect through an approved private intake path; do not publish MC or DOT identifiers.",
  },
  {
    id: "insurance_status",
    label: "Insurance status",
    privacyClass: "private_intake_only",
    requiredForReview: true,
    guidance: "Review status and required evidence privately without promising approval or coverage.",
  },
  {
    id: "equipment_cluster",
    label: "Equipment cluster",
    privacyClass: "public_safe_category",
    requiredForReview: true,
    guidance: "Use only an approved equipment category; document capacity separately before using a unit-count modifier.",
  },
  {
    id: "operating_area",
    label: "Current area and preferred operating markets",
    privacyClass: "private_intake_only",
    requiredForReview: true,
    guidance: "Use city/state-level planning privately; never expose live truck position or exact address.",
  },
  {
    id: "availability_window",
    label: "Availability window",
    privacyClass: "private_intake_only",
    requiredForReview: true,
    guidance: "Treat as a private planning input, not public capacity or guaranteed availability.",
  },
  {
    id: "operating_constraints",
    label: "Operating constraints and preferences",
    privacyClass: "private_intake_only",
    requiredForReview: true,
    guidance: "Record approved controlled fields; do not export free-form private notes into public content or analytics.",
  },
  {
    id: "communication_workflow",
    label: "Communication and approval workflow",
    privacyClass: "public_safe_category",
    requiredForReview: true,
    guidance: "Document that carrier approval is required before booking and that automatic negotiation or messaging is disabled.",
  },
];

export const carrierRefreshPolicies: CarrierRefreshPolicy[] = [
  {
    cadence: "monthly",
    reviewItems: [
      "Search Console impressions, clicks, CTR, average position, and query-to-page fit",
      "GA4 logistics CTA and contact clicks by privacy-safe page path",
      "internal-link paths and cannibalization between carrier pages",
      "claims, service-scope, FAQ, CTA, and contact accuracy",
    ],
    triggers: [
      "new query family with meaningful impressions",
      "page receives impressions but weak CTR",
      "two Hermes URLs compete for the same primary query",
      "service scope or approved contact path changes",
    ],
  },
  {
    cadence: "quarterly",
    reviewItems: [
      "equipment and operating-stage taxonomy",
      "carrier qualification guidance",
      "direct-freight and vendor-introduction boundaries",
      "language research priority and response capacity",
    ],
    triggers: ["owner-approved scope update", "new verified evidence source", "material compliance or policy change"],
  },
  {
    cadence: "event_triggered",
    reviewItems: [
      "unsupported claim or privacy defect",
      "broken CTA, canonical, schema, sitemap, or internal link",
      "stale or contradictory public service information",
    ],
    triggers: ["P0 or P1 defect", "owner correction", "failed release regression"],
  },
];

export const carrierMeasurementContract: CarrierMeasurementContract = {
  searchConsoleMetrics: [
    "impressions",
    "clicks",
    "CTR",
    "average position",
    "query family",
    "canonical page",
    "competing Hermes pages for the same query",
  ],
  ga4Events: [
    {
      event: "logistics_cta_click",
      allowedParameters: ["cta_type", "audience_role", "page_cluster", "page_path", "destination_path"],
    },
    {
      event: "contact_click",
      allowedParameters: ["contact_method", "page_cluster", "page_path"],
    },
  ],
  inquiryMetric: {
    status: "aggregate_only_when_approved",
    definition: "Count a qualified carrier inquiry only from an approved internal aggregate after manual qualification; never infer it from a click alone.",
    prohibitedData: [
      "name",
      "phone",
      "email",
      "company",
      "MC/DOT",
      "exact address",
      "free-form message",
      "equipment identifiers",
      "rates",
      "shipment or customer information",
    ],
  },
  cannibalizationReview: [
    "compare queries by page in Search Console",
    "assign one preferred canonical page per primary query family",
    "use equipment, stage, and problem pages only when intent is distinct",
    "improve headings and internal anchors before considering consolidation",
    "do not delete or redirect without separate owner approval",
  ],
};
