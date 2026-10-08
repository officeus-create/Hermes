export type IAmRuleImplementationState = "informational" | "partner-required" | "not-implemented";
export type IAmRuleReviewState = "reviewed-public-source" | "legal-review-required";

export type IAmCountryRule = {
  id: string;
  countryCode: string;
  jurisdiction: string;
  topic: string;
  statement: string;
  sourceUrl: string;
  sourceAuthority: string;
  sourceKind: "government" | "regulator" | "provider";
  reviewedAt: string;
  effectiveFrom: string | null;
  reviewState: IAmRuleReviewState;
  implementationState: IAmRuleImplementationState;
  operationalEffect: string;
};

export const italyTaxFreeRules: readonly IAmCountryRule[] = Object.freeze([
  {
    id: "it-tax-free-minimum-invoice",
    countryCode: "IT",
    jurisdiction: "Italy",
    topic: "Tax Free Shopping",
    statement: "The VAT-inclusive amount of the eligible invoice must exceed €70.",
    sourceUrl: "https://www.adm.gov.it/portale/en/progetti-aida-otello",
    sourceAuthority: "Agenzia delle Dogane e dei Monopoli (ADM)",
    sourceKind: "government",
    reviewedAt: "2026-10-08",
    effectiveFrom: null,
    reviewState: "reviewed-public-source",
    implementationState: "informational",
    operationalEffect: "Used only for general pre-check guidance; it does not create a refund entitlement.",
  },
  {
    id: "it-tax-free-non-eu-residence",
    countryCode: "IT",
    jurisdiction: "Italy",
    topic: "Tax Free Shopping",
    statement: "The purchaser must have residence or domicile outside the European Union.",
    sourceUrl: "https://www.adm.gov.it/portale/en/progetti-aida-otello",
    sourceAuthority: "Agenzia delle Dogane e dei Monopoli (ADM)",
    sourceKind: "government",
    reviewedAt: "2026-10-08",
    effectiveFrom: null,
    reviewState: "reviewed-public-source",
    implementationState: "informational",
    operationalEffect: "The prototype can explain this condition but cannot verify identity or residence.",
  },
  {
    id: "it-tax-free-personal-goods",
    countryCode: "IT",
    jurisdiction: "Italy",
    topic: "Tax Free Shopping",
    statement: "Goods must be intended for personal or family use rather than commercial resale.",
    sourceUrl: "https://www.adm.gov.it/portale/en/progetti-aida-otello",
    sourceAuthority: "Agenzia delle Dogane e dei Monopoli (ADM)",
    sourceKind: "government",
    reviewedAt: "2026-10-08",
    effectiveFrom: null,
    reviewState: "reviewed-public-source",
    implementationState: "informational",
    operationalEffect: "User-declared guidance only; no legal eligibility determination is made.",
  },
  {
    id: "it-tax-free-export-window",
    countryCode: "IT",
    jurisdiction: "Italy",
    topic: "Tax Free Shopping",
    statement: "The goods must leave the EU by the end of the third month following the invoice month.",
    sourceUrl: "https://www.adm.gov.it/portale/en/progetti-aida-otello",
    sourceAuthority: "Agenzia delle Dogane e dei Monopoli (ADM)",
    sourceKind: "government",
    reviewedAt: "2026-10-08",
    effectiveFrom: null,
    reviewState: "reviewed-public-source",
    implementationState: "informational",
    operationalEffect: "The date can be explained in a demo; customs validation remains an official process.",
  },
  {
    id: "it-tax-free-otello",
    countryCode: "IT",
    jurisdiction: "Italy",
    topic: "OTELLO",
    statement: "Italian Tax Free Shopping documentation and customs validation are handled through the official OTELLO electronic process.",
    sourceUrl: "https://www.adm.gov.it/portale/-/otello",
    sourceAuthority: "Agenzia delle Dogane e dei Monopoli (ADM)",
    sourceKind: "government",
    reviewedAt: "2026-10-08",
    effectiveFrom: null,
    reviewState: "reviewed-public-source",
    implementationState: "partner-required",
    operationalEffect: "I am has no OTELLO authorization or credentials; operational submission is blocked.",
  },
]);

export const iamCountryRuleSets = Object.freeze({
  IT: Object.freeze({
    countryName: "Italy",
    reviewedAt: "2026-10-08",
    rules: italyTaxFreeRules,
    operationalStatus: "INFORMATION_ONLY",
    disclaimer: "Rules are source-backed guidance, not a customs, tax or legal determination.",
  }),
});
