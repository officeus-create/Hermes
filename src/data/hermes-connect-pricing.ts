/**
 * HISTORICAL PLANNING DATA — NOT CURRENT PUBLIC HERMES CONNECT PRICING.
 *
 * These tiers are retained only for compatibility with preserved legacy/demo assets and
 * historical product experiments. Canonical Hermes Connect product pages must not import
 * this module to publish prices, structured-data offers, or current commercial terms.
 *
 * Repair Shops is the current live pilot. Commercial pricing for Hermes Connect must be
 * explicitly approved and reintroduced through a new public pricing contract before use.
 */

export const HERMES_CONNECT_PRICING_STATUS = "historical-planning-only" as const;

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  description: string;
  badge?: string;
  features: string[];
}

export const HERMES_CONNECT_PRICING: Record<string, PricingTier> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    description: "Historical planning tier retained for legacy/demo compatibility only.",
    features: ["Historical planning data — not a current public offer"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 299,
    priceAnnualMonthly: 249,
    description: "Historical planning tier retained for legacy/demo compatibility only.",
    features: ["Historical planning data — not a current public offer"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 799,
    priceAnnualMonthly: 699,
    description: "Historical planning tier retained for legacy/demo compatibility only.",
    features: ["Historical planning data — not a current public offer"],
  },
};

export const CANONICAL_PRICING_TIERS = Object.values(HERMES_CONNECT_PRICING);
