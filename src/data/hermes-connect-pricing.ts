/**
 * Single Source of Truth for Hermes Connect Pricing & Tiering
 * Used across Astro pages, UI components, structured data, proposal builders, and LLM text files.
 */

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
    description: "Essential AI automation and inbox management for growing solo operators and small teams.",
    features: [
      "AI Front-Door Lead Classification",
      "Unified Command Center Inbox",
      "Interactive Load Analyzer (Logistics)",
      "Standard Proposal Builder",
      "Email & Web Chat Integration"
    ]
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    priceMonthly: 299,
    priceAnnualMonthly: 249,
    description: "Advanced multi-vertical AI capabilities, rate negotiator, and ROI automation for scaling fleets & agencies.",
    features: [
      "Everything in Starter",
      "Automated Rate Negotiator & Counter-Offers",
      "Multi-Vertical Workspace Customization",
      "Instant HTML & PDF Proposal Exports",
      "Interactive Business ROI Calculator",
      "Priority API & DataLayer Telemetry"
    ]
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    badge: "Full Power",
    priceMonthly: 799,
    priceAnnualMonthly: 699,
    description: "Full enterprise operating system with dedicated AI models, custom dispatch workflows, and 24/7 SLA.",
    features: [
      "Everything in Pro",
      "Custom Fine-Tuned AI Brain Prompts",
      "Unlimited Multi-Branch Operators",
      "Dedicated Technical Account Manager",
      "Custom ERP & CRM Integration Pipeline",
      "Guaranteed 99.9% Uptime SLA"
    ]
  }
};

export const CANONICAL_PRICING_TIERS = Object.values(HERMES_CONNECT_PRICING);
