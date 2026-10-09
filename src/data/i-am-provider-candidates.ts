export type IAmProviderCandidateState = "PUBLIC_PROGRAM_DISCOVERED";
export type IAmProviderCategory = "travel-marketplace" | "flight-hotel-car-search" | "experiences" | "car-rental";
export type IAmProviderFit = "PUBLISHER_AFFILIATE_CANDIDATE" | "SEPARATE_TECH_PARTNERSHIP_REQUIRED";

export type IAmProviderCandidate = {
  id: string;
  name: string;
  category: IAmProviderCategory;
  officialProgramUrl: string;
  state: IAmProviderCandidateState;
  integrationModes: readonly string[];
  providerFit: IAmProviderFit;
  publicTermsSummary: string;
  eligibilityCaveat: string;
  capabilityIds: readonly string[];
  reviewedAt: "2026-10-08";
  hermesStatus: "NOT_APPLIED_NOT_PARTNERED";
};

export const iamTravelProviderCandidates: readonly IAmProviderCandidate[] = Object.freeze([
  {
    id: "expedia-travel-creator",
    name: "Expedia Group Travel Creator Program",
    category: "travel-marketplace",
    officialProgramUrl: "https://creator.expediagroup.com/affiliates",
    state: "PUBLIC_PROGRAM_DISCOVERED",
    integrationModes: Object.freeze(["tracked links","widgets","site banners"]),
    providerFit: "PUBLISHER_AFFILIATE_CANDIDATE",
    publicTermsSummary: "Official Travel Creator Program advertises free joining, links/widgets/banners and up to 4% on qualifying bookings; current commission terms remain account-controlled.",
    eligibilityCaveat: "Application/program terms, qualifying transactions and current commission rates still control real eligibility and payout.",
    capabilityIds: Object.freeze(["travel-mobility","affiliate-commerce"]),
    reviewedAt: "2026-10-08",
    hermesStatus: "NOT_APPLIED_NOT_PARTNERED",
  },
  {
    id: "skyscanner-affiliate",
    name: "Skyscanner Affiliate Programme",
    category: "flight-hotel-car-search",
    officialProgramUrl: "https://www.partners.skyscanner.net/product/affiliates",
    state: "PUBLIC_PROGRAM_DISCOVERED",
    integrationModes: Object.freeze(["widgets","banners","text links"]),
    providerFit: "SEPARATE_TECH_PARTNERSHIP_REQUIRED",
    publicTermsSummary: "Official affiliate page describes a 30-day referral window and commission on qualified actions for eligible publisher traffic.",
    eligibilityCaveat: "Skyscanner explicitly says technology partners are not accepted in its affiliate programme, so an I am product integration would need a separate permitted commercial route.",
    capabilityIds: Object.freeze(["travel-mobility","affiliate-commerce"]),
    reviewedAt: "2026-10-08",
    hermesStatus: "NOT_APPLIED_NOT_PARTNERED",
  },
  {
    id: "viator-affiliate",
    name: "Viator Affiliate Program",
    category: "experiences",
    officialProgramUrl: "https://partnerresources.viator.com/",
    state: "PUBLIC_PROGRAM_DISCOVERED",
    integrationModes: Object.freeze(["affiliate links","widgets","affiliate API"]),
    providerFit: "PUBLISHER_AFFILIATE_CANDIDATE",
    publicTermsSummary: "Official Viator partner resources advertise affiliate links with an 8% commission on eligible products booked within 30 days, plus widgets and partner tooling.",
    eligibilityCaveat: "Actual account approval, permitted surfaces, API access and current partner terms must be verified before integration.",
    capabilityIds: Object.freeze(["travel-mobility","affiliate-commerce"]),
    reviewedAt: "2026-10-08",
    hermesStatus: "NOT_APPLIED_NOT_PARTNERED",
  },
  {
    id: "discovercars-affiliate",
    name: "DiscoverCars Affiliate Program",
    category: "car-rental",
    officialProgramUrl: "https://www.discovercars.com/affiliate",
    state: "PUBLIC_PROGRAM_DISCOVERED",
    integrationModes: Object.freeze(["affiliate links","booking widget","landing pages","XML API"]),
    providerFit: "PUBLISHER_AFFILIATE_CANDIDATE",
    publicTermsSummary: "Official programme advertises free signup, a 365-day cookie window, affiliate links/widgets/landing pages and XML API options.",
    eligibilityCaveat: "The programme may reject applications; only approved links and completed eligible rentals create affiliate referrals under its terms.",
    capabilityIds: Object.freeze(["travel-mobility","affiliate-commerce"]),
    reviewedAt: "2026-10-08",
    hermesStatus: "NOT_APPLIED_NOT_PARTNERED",
  },
]);
