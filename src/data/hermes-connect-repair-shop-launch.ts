// Current CEO commercial policy: Repair Shop registration and software access stay free
// while Hermes configures the workspace around the business. The standard Founding Shop
// subscription remains $99/month after setup, with human confirmation before billing.
export const REPAIR_SHOP_SETUP_ACCESS_ENABLED = true;
export const REPAIR_SHOP_SETUP_ACCESS_PRICE_USD = 0;
export const REPAIR_SHOP_FOUNDING_PRICE_USD = 99;
export const REPAIR_SHOP_CATALOG_LISTING_FEE_USD = 0;

// Online card billing is still not presented as live. Paid activation remains a
// human-confirmation and invoice flow; no card is charged during setup.
export const REPAIR_SHOP_ONLINE_BILLING_ENABLED = false;

export const REPAIR_SHOP_SETUP_ACCESS_POLICY = {
  id: "repair_shop_free_during_setup_2026",
  setupAccessEnabled: REPAIR_SHOP_SETUP_ACCESS_ENABLED,
  setupPriceUsd: REPAIR_SHOP_SETUP_ACCESS_PRICE_USD,
  foundingMonthlyPriceUsd: REPAIR_SHOP_FOUNDING_PRICE_USD,
  catalogListingFeeUsd: REPAIR_SHOP_CATALOG_LISTING_FEE_USD,
  cardRequiredDuringSetup: false,
  paidActivation: "human-confirmation-and-invoice-after-setup",
  catalogPublication: "owner-approved-public-facts-only",
  discoveryScope: ["seo", "geo", "local-search", "ai-discovery"],
  searchResultsGuaranteed: false,
} as const;

// Historical launch-window constants are retained only for provenance and old
// production evidence. They no longer gate current Repair Shop registration.
export const REPAIR_SHOP_FREE_REGISTRATION_END_ISO = "2026-09-16T05:00:00.000Z";
export const REPAIR_SHOP_FREE_REGISTRATION_TIMEZONE = "America/Chicago";
export const REPAIR_SHOP_FREE_REGISTRATION_FREE_THROUGH_LOCAL_DATE = "2026-09-15";
export const REPAIR_SHOP_FREE_REGISTRATION_DISPLAY_DATE = "September 15, 2026";
