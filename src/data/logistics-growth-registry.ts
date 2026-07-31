export type LogisticsLanguageCode =
  | "en"
  | "es"
  | "ru"
  | "uk"
  | "ro"
  | "lt"
  | "hi"
  | "pa"
  | "gu";

export type LanguagePriority = "primary" | "secondary" | "research_only";

export interface LogisticsLanguageEligibility {
  code: LogisticsLanguageCode;
  label: string;
  priority: LanguagePriority;
  publishRequirements: string[];
}

export const logisticsLanguageEligibility: LogisticsLanguageEligibility[] = [
  {
    code: "en",
    label: "English",
    priority: "primary",
    publishRequirements: [
      "verified U.S. logistics intent",
      "real Hermes service fit",
      "approved evidence and editorial review",
    ],
  },
  {
    code: "es",
    label: "Spanish",
    priority: "secondary",
    publishRequirements: [
      "language-specific query evidence",
      "natural U.S. logistics terminology",
      "Spanish-capable response path",
    ],
  },
  {
    code: "ru",
    label: "Russian",
    priority: "secondary",
    publishRequirements: [
      "language-specific query evidence",
      "Russian-capable response path",
      "content must target business need rather than nationality",
    ],
  },
  {
    code: "uk",
    label: "Ukrainian",
    priority: "secondary",
    publishRequirements: [
      "language-specific query evidence",
      "Ukrainian-capable response path",
      "content must target business need rather than nationality",
    ],
  },
  {
    code: "ro",
    label: "Romanian",
    priority: "research_only",
    publishRequirements: [
      "measurable query or conversion evidence",
      "Romanian-capable response path",
      "7/10 publication score",
    ],
  },
  {
    code: "lt",
    label: "Lithuanian",
    priority: "research_only",
    publishRequirements: [
      "measurable query or conversion evidence",
      "Lithuanian-capable response path",
      "7/10 publication score",
    ],
  },
  {
    code: "hi",
    label: "Hindi",
    priority: "research_only",
    publishRequirements: [
      "measurable query or conversion evidence",
      "bilingual U.S. logistics terminology review",
      "7/10 publication score",
    ],
  },
  {
    code: "pa",
    label: "Punjabi",
    priority: "research_only",
    publishRequirements: [
      "measurable query or conversion evidence",
      "bilingual U.S. logistics terminology review",
      "7/10 publication score",
    ],
  },
  {
    code: "gu",
    label: "Gujarati",
    priority: "research_only",
    publishRequirements: [
      "measurable query or conversion evidence",
      "bilingual U.S. logistics terminology review",
      "7/10 publication score",
    ],
  },
];

export type CarHaulerEquipment =
  | "open_car_hauler"
  | "enclosed_car_hauler"
  | "hotshot_car_hauler"
  | "multi_car_trailer";

export type CarrierOperatingStage =
  | "new_authority"
  | "active_owner_operator"
  | "small_fleet"
  | "growth_stage";

export type CarrierProblem =
  | "load_search"
  | "backhaul_deadhead"
  | "dispatch_support"
  | "documents_and_setup"
  | "rate_negotiation"
  | "direct_shipper_dealer_development"
  | "vendor_introduction";

export interface CarrierKeywordHypothesis {
  id: string;
  language: LogisticsLanguageCode;
  equipment: CarHaulerEquipment;
  operatingStage: CarrierOperatingStage;
  problem: CarrierProblem;
  phrases: string[];
  researchOnly: boolean;
}

export const carrierKeywordHypotheses: CarrierKeywordHypothesis[] = [
  {
    id: "en-open-active-dispatch",
    language: "en",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: [
      "car hauler dispatch support",
      "dispatch service for car hauling owner operators",
    ],
    researchOnly: true,
  },
  {
    id: "en-hotshot-new-authority",
    language: "en",
    equipment: "hotshot_car_hauler",
    operatingStage: "new_authority",
    problem: "documents_and_setup",
    phrases: [
      "new authority hotshot car hauler support",
      "car hauling dispatch for new MC authority",
    ],
    researchOnly: true,
  },
  {
    id: "en-multicar-backhaul",
    language: "en",
    equipment: "multi_car_trailer",
    operatingStage: "small_fleet",
    problem: "backhaul_deadhead",
    phrases: [
      "car hauler backhaul planning",
      "reduce deadhead for multi car haulers",
    ],
    researchOnly: true,
  },
  {
    id: "es-open-dispatch",
    language: "es",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: [
      "despacho para transportistas de autos",
      "apoyo de dispatch para car haulers",
    ],
    researchOnly: true,
  },
  {
    id: "ru-open-dispatch",
    language: "ru",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: [
      "диспетчер для автовоза в США",
      "диспетчерская поддержка для car hauler",
    ],
    researchOnly: true,
  },
  {
    id: "uk-open-dispatch",
    language: "uk",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: [
      "диспетчер для автовоза у США",
      "диспетчерська підтримка для car hauler",
    ],
    researchOnly: true,
  },
  {
    id: "ro-open-dispatch",
    language: "ro",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: ["servicii de dispecerat pentru transportatori auto"],
    researchOnly: true,
  },
  {
    id: "lt-open-dispatch",
    language: "lt",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: ["dispečerinė pagalba automobilių vežėjams"],
    researchOnly: true,
  },
  {
    id: "hi-open-dispatch",
    language: "hi",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: ["कार हॉलर डिस्पैच सहायता"],
    researchOnly: true,
  },
  {
    id: "pa-open-dispatch",
    language: "pa",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: ["ਕਾਰ ਹੌਲਰ ਡਿਸਪੈਚ ਸਹਾਇਤਾ"],
    researchOnly: true,
  },
  {
    id: "gu-open-dispatch",
    language: "gu",
    equipment: "open_car_hauler",
    operatingStage: "active_owner_operator",
    problem: "dispatch_support",
    phrases: ["કાર હોલર ડિસ્પેચ સહાય"],
    researchOnly: true,
  },
];

export function getLanguageEligibility(
  code: LogisticsLanguageCode,
): LogisticsLanguageEligibility {
  const entry = logisticsLanguageEligibility.find((item) => item.code === code);

  if (!entry) {
    throw new Error(`Unsupported logistics language: ${code}`);
  }

  return entry;
}
