import type { CatalogBusinessConcept } from "../data/catalog-business-concepts";

export function catalogConceptReadiness(business: CatalogBusinessConcept) {
  const checks = [
    ["identity", Boolean(business.name && business.phone)],
    ["location", Boolean(business.address && business.locality && business.countryCode)],
    ["public_source", business.channels.length > 0],
    ["primary_intent", business.semanticCore.primary.length > 0],
    ["geography", business.semanticCore.geography.length > 0],
    ["fact_boundary", business.factsRequiringOwnerConfirmation.length > 0],
    ["locales", business.locales.supported.length > 0],
    ["lifecycle", Boolean(business.lifecycle)],
  ] as const;
  const passed = checks.filter(([,ok])=>ok).length;
  return { checks: Object.fromEntries(checks), passed, total: checks.length, ready: passed === checks.length };
}

export function catalogLeadAttribution(business: CatalogBusinessConcept, profileUrl: string, input: {
  referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string;
}) {
  return {
    business_id: business.id,
    business_name: business.name,
    profile: profileUrl,
    lifecycle: business.lifecycle,
    source: "hermes_catalog",
    referrer: input.referrer ?? "",
    utm_source: input.utm_source ?? "hermes_catalog",
    utm_medium: input.utm_medium ?? "organic",
    utm_campaign: input.utm_campaign ?? `${business.slug}_concept`,
  };
}

export const CATALOG_LIFECYCLE = Object.freeze([
  "discovered","researched","concept_draft","reviewed","published_unclaimed","claimed","client","own_domain_live"
] as const);
