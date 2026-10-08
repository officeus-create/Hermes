/**
 * Public research-only retailer registry for the I am Italy preview.
 * An external shop URL and a published affiliate programme are NOT a signed partnership,
 * tracked affiliate link, inventory feed, Tax Free entitlement or order integration.
 *
 * Private commercial credentials/affiliate IDs belong in approved server-side config,
 * never here, in click URLs, or in static content.
 */
export type IAmItalyMerchantCandidate = {
  id: string;
  name: string;
  category: "luxury-fashion" | "fashion" | "department-store" | "outlet" | "airport";
  shopUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  affiliateProgramUrl: string | null;
  affiliateProgramState: "public-program-discovered" | "not-verified";
  fulfillment: "merchant-online-checkout" | "direct-boutique-contact" | "airport-departure-reserve";
  summary: string;
  affiliateState: "not-applied";
  partnerState: "unverified";
  lastReviewedAt: "2026-10-08";
};

export const iamItalyMerchantCandidates: readonly IAmItalyMerchantCandidate[] = Object.freeze([
  {
    id: "farfetch",
    name: "FARFETCH",
    category: "luxury-fashion",
    shopUrl: "https://www.farfetch.com/it/",
    sourceUrl: "https://www.farfetch.com/it/pag1987.aspx",
    sourceLabel: "Official affiliate programme",
    affiliateProgramUrl: "https://www.farfetch.com/it/pag1987.aspx",
    affiliateProgramState: "public-program-discovered",
    fulfillment: "merchant-online-checkout",
    summary: "Global luxury-fashion marketplace. An official affiliate programme exists; no I am account, tracking link or rate is approved.",
    affiliateState: "not-applied",
    partnerState: "unverified",
    lastReviewedAt: "2026-10-08",
  },
  {
    id: "yoox",
    name: "YOOX",
    category: "fashion",
    shopUrl: "https://www.yoox.com/it/",
    sourceUrl: "https://www.yoox.com/it/affiliation/program",
    sourceLabel: "Official Italian affiliate programme",
    affiliateProgramUrl: "https://www.yoox.com/it/affiliation/program",
    affiliateProgramState: "public-program-discovered",
    fulfillment: "merchant-online-checkout",
    summary: "Designer fashion and accessories. Affiliate application is offered; customer checkout stays with the retailer.",
    affiliateState: "not-applied",
    partnerState: "unverified",
    lastReviewedAt: "2026-10-08",
  },
  {
    id: "mytheresa",
    name: "Mytheresa",
    category: "luxury-fashion",
    shopUrl: "https://www.mytheresa.com/",
    sourceUrl: "https://www.mytheresa.com/au/en/affiliates",
    sourceLabel: "Official global affiliate programme",
    affiliateProgramUrl: "https://www.mytheresa.com/au/en/affiliates",
    affiliateProgramState: "public-program-discovered",
    fulfillment: "merchant-online-checkout",
    summary: "Luxury e-commerce retailer with an official free-to-apply affiliate programme, customizable links and product feeds. I am has not applied or received tracking credentials.",
    affiliateState: "not-applied",
    partnerState: "unverified",
    lastReviewedAt: "2026-10-08",
  },
  {
    id: "rinascente",
    name: "Rinascente",
    category: "department-store",
    shopUrl: "https://www.rinascente.it/en/",
    sourceUrl: "https://www.rinascente.it/en/",
    sourceLabel: "Official online, On Demand Chat&Shop and Click & Collect channels",
    affiliateProgramUrl: null,
    affiliateProgramState: "not-verified",
    fulfillment: "merchant-online-checkout",
    summary: "Italian department store with official online shopping, On Demand Chat&Shop and Click & Collect. No I am affiliate or commercial agreement is verified.",
    affiliateState: "not-applied",
    partnerState: "unverified",
    lastReviewedAt: "2026-10-08",
  },
  {
    id: "fidenza-village",
    name: "Fidenza Village",
    category: "outlet",
    shopUrl: "https://www.thebicestercollection.com/fidenza-village/it/la-tua-visita/servizi/",
    sourceUrl: "https://www.thebicestercollection.com/fidenza-village/en/visit/",
    sourceLabel: "Official visitor and Shop from Home information",
    affiliateProgramUrl: null,
    affiliateProgramState: "not-verified",
    fulfillment: "direct-boutique-contact",
    summary: "Boutiques can be contacted through the official Shop from Home channels. No I am referral or pickup integration is agreed.",
    affiliateState: "not-applied",
    partnerState: "unverified",
    lastReviewedAt: "2026-10-08",
  },
  {
    id: "milan-airports-boutique",
    name: "Milan Airports Boutique",
    category: "airport",
    shopUrl: "https://www.milanairports-shop.com/it/servizi/eboutique",
    sourceUrl: "https://www.milanairports-shop.com/en/services/eboutique",
    sourceLabel: "Official airport reserve-and-collect guide",
    affiliateProgramUrl: null,
    affiliateProgramState: "not-verified",
    fulfillment: "airport-departure-reserve",
    summary: "The airport's own site accepts non-binding reservations for pickup when DEPARTING through eligible Milan terminals; not pickup on arrival.",
    affiliateState: "not-applied",
    partnerState: "unverified",
    lastReviewedAt: "2026-10-08",
  },
]);

export const iamItalyAffiliateNetworkResearch = Object.freeze({
  name: "Awin",
  url: "https://www.awin.com/it/pricing/affiliate-partners",
  state: "network-discovered-no-hermes-membership",
  terms: "Publisher signup is advertised as free; technical partner integrations can have different commercial requirements. Individual programmes still require approval.",
});
