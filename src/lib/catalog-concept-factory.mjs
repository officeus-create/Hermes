export const CATALOG_LIFECYCLE_STATES = Object.freeze([
  "DISCOVERED",
  "RESEARCHED",
  "CONCEPT_DRAFT",
  "REVIEWED",
  "PUBLISHED_UNCLAIMED",
  "CLAIMED",
  "CLIENT",
  "OWN_DOMAIN_LIVE",
]);

export const CATALOG_REFERENCE_ROLES = Object.freeze([
  "visual",
  "functionality",
  "structure-conversion",
]);

export const CATALOG_SOURCE_IMPORT_STATES = Object.freeze(["pending", "verified", "failed"]);

const NEXT_STATES = Object.freeze({
  DISCOVERED: ["RESEARCHED"],
  RESEARCHED: ["CONCEPT_DRAFT"],
  CONCEPT_DRAFT: ["REVIEWED"],
  REVIEWED: ["PUBLISHED_UNCLAIMED"],
  PUBLISHED_UNCLAIMED: ["CLAIMED"],
  CLAIMED: ["CLIENT"],
  CLIENT: ["OWN_DOMAIN_LIVE"],
  OWN_DOMAIN_LIVE: [],
});

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);
const unique = (items) => [...new Set((items || []).filter(Boolean))];

export function catalogConceptPath(business) {
  return `/businesses/${business.countrySlug}/${business.localitySlug}/${business.slug}/`;
}

export function catalogCountryPath(business) {
  return `/businesses/${business.countrySlug}/`;
}

export function catalogLocalityPath(business) {
  return `/businesses/${business.countrySlug}/${business.localitySlug}/`;
}

export function canTransitionCatalogState(from, to) {
  return Boolean(NEXT_STATES[from]?.includes(to));
}

export function catalogRouteRegistry(concepts = []) {
  const countries = new Map();
  for (const business of concepts) {
    const country = countries.get(business.countrySlug) || {
      countrySlug: business.countrySlug,
      countryCode: business.countryCode,
      region: business.region,
      path: catalogCountryPath(business),
      localities: new Map(),
    };
    const locality = country.localities.get(business.localitySlug) || {
      localitySlug: business.localitySlug,
      locality: business.locality,
      path: catalogLocalityPath(business),
      businesses: [],
    };
    locality.businesses.push({ id: business.id, name: business.name, path: catalogConceptPath(business) });
    country.localities.set(business.localitySlug, locality);
    countries.set(business.countrySlug, country);
  }
  return [...countries.values()].map((country) => ({
    ...country,
    localities: [...country.localities.values()],
  }));
}

export function buildCatalogSchema(business, profileUrl) {
  const schemaType = clean(business.schemaType || "LocalBusiness", 80);
  const verifiedChannels = (business.channels || []).filter((channel) => channel?.url).map((channel) => channel.url);
  const base = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${profileUrl}#business`,
    name: business.name,
    url: profileUrl,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.locality,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: business.countryCode,
    },
    sameAs: verifiedChannels,
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: business.primaryIntent,
    provider: { "@id": `${profileUrl}#business` },
    areaServed: { "@type": "Place", name: `${business.locality}, ${business.region}` },
    description: business.seo?.description || `Public business discovery concept for ${business.name}. Owner confirmation is required for unverified operating details.`,
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hermes Catalog", item: "https://hermeslogisticsus.com/businesses/" },
      { "@type": "ListItem", position: 2, name: business.region, item: new URL(catalogCountryPath(business), profileUrl).toString() },
      { "@type": "ListItem", position: 3, name: business.locality, item: new URL(catalogLocalityPath(business), profileUrl).toString() },
      { "@type": "ListItem", position: 4, name: business.name, item: profileUrl },
    ],
  };
  const faq = Array.isArray(business.faq) && business.faq.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: business.faq.map((item) => ({
      "@type": "Question",
      name: clean(item.question, 500),
      acceptedAnswer: { "@type": "Answer", text: clean(item.answer, 1500) },
    })),
  } : null;
  return [base, service, breadcrumbs, ...(faq ? [faq] : [])];
}

export function buildCatalogLeadContext({ business, profileUrl, source = "hermes_catalog", referrer = "", utm = {} }) {
  return {
    business_id: clean(business.id, 180),
    business: clean(business.name, 180),
    profile: clean(profileUrl, 500),
    source: clean(source, 120) || "hermes_catalog",
    referrer: clean(referrer, 500),
    utm_source: clean(utm.utm_source, 120) || "hermes_catalog",
    utm_medium: clean(utm.utm_medium, 120) || "internal",
    utm_campaign: clean(utm.utm_campaign, 160) || "catalog_business_request",
    utm_content: clean(utm.utm_content, 160),
    utm_term: clean(utm.utm_term, 160),
  };
}

export function catalogClaimHref(business, profileUrl) {
  const params = new URLSearchParams({
    type: "claim",
    business_id: business.id,
    business: business.name,
    profile: profileUrl,
    city: business.locality,
    country: business.countryCode,
    identity: business.id,
    evidence: business.sourceRef,
    source: "catalog_claim",
  });
  return `/businesses/request/?${params}`;
}

export function buildBusinessOwnerFreeLeadNotification({ business, request, profileUrl }) {
  return [
    `Hermes Catalog lead for ${business.name}`,
    "",
    "A potential customer requested contact through Hermes Catalog.",
    "Hermes is not charging the business for this lead.",
    `Catalog profile: ${profileUrl}`,
    `Request source: ${clean(request?.source, 120) || "hermes_catalog"}`,
    `Requested service: ${clean(request?.requestedService, 300) || "Not specified"}`,
    `Received at: ${clean(request?.receivedAt, 80) || "Not supplied"}`,
    "",
    "Customer contact details belong only in the authorized private delivery channel.",
    "Claiming the Catalog profile and purchasing Hermes services are optional and separate decisions.",
  ].join("\n");
}

export function catalogSeoReadiness(business) {
  const checks = [
    ["identity", Boolean(business.id && business.name && business.sourceRef)],
    ["route", Boolean(business.countrySlug && business.localitySlug && business.slug)],
    ["nap", Boolean(business.phone && business.address && business.locality && business.countryCode)],
    ["intent", Boolean(business.primaryIntent && business.semanticCore?.length && business.localIntents?.length)],
    ["sources", Boolean(business.sourceImports?.some((item) => item.status === "verified"))],
    ["copy", Boolean(business.copy?.uk && business.copy?.en)],
    ["schema", Boolean(business.schemaType)],
    ["truth_boundary", Array.isArray(business.factsRequiringOwnerConfirmation)],
  ];
  return {
    ready: checks.every(([, ok]) => ok),
    checks: checks.map(([id, ok]) => ({ id, ok })),
  };
}

export function catalogPublicationQa(business, { ownerApproved = false, canonical = "", sitemapIncluded = false, mobileChecked = false, ctaChecked = false } = {}) {
  const seo = catalogSeoReadiness(business);
  const sourcesVerified = (business.sourceImports || []).length > 0
    && (business.sourceImports || []).every((item) => item.status === "verified");
  const ownerGate = business.ownerApproval?.required === false || ownerApproved;
  const lifecycleReady = business.lifecycleState === "REVIEWED" || business.lifecycleState === "PUBLISHED_UNCLAIMED";
  const checks = {
    facts: sourcesVerified,
    owner_approval: ownerGate,
    lifecycle: lifecycleReady,
    seo_readiness: seo.ready,
    canonical: canonical === catalogConceptPath(business) || canonical === new URL(catalogConceptPath(business), "https://hermeslogisticsus.com").toString(),
    sitemap: Boolean(sitemapIncluded),
    mobile: Boolean(mobileChecked),
    cta: Boolean(ctaChecked),
  };
  return { ready: Object.values(checks).every(Boolean), checks };
}

export function ethicalCatalogAttributionLink({ href, label, relationship = "partner" }) {
  return {
    href: clean(href, 1000),
    label: clean(label, 160),
    relationship: clean(relationship, 80),
    editoriallyRequired: true,
    reciprocalRequired: false,
    paidLinkRequired: false,
  };
}

export function normalizeConceptSourceImports(items = []) {
  return (Array.isArray(items) ? items : []).slice(0, 30).flatMap((item) => {
    if (!item?.url) return [];
    const status = CATALOG_SOURCE_IMPORT_STATES.includes(item.status) ? item.status : "pending";
    return [{ url: clean(item.url, 2048), type: clean(item.type, 80) || "website", status, note: clean(item.note, 500) }];
  });
}

export function normalizeConceptReferences(items = []) {
  return (Array.isArray(items) ? items : []).slice(0, 6).flatMap((item) => {
    const rawRole = item?.role === "structure" ? "structure-conversion" : item?.role;
    if (!CATALOG_REFERENCE_ROLES.includes(rawRole) || !item?.url) return [];
    return [{ role: rawRole, url: clean(item.url, 2048), note: clean(item.note, 800) }];
  });
}

export function catalogConceptPreviewGate(business) {
  return {
    state: "concept_preview",
    indexable: false,
    robots: "noindex,nofollow",
    ownerApprovalRequired: business.ownerApproval?.required !== false,
    nextLifecycleState: business.lifecycleState === "CONCEPT_DRAFT" ? "REVIEWED" : business.lifecycleState,
  };
}

export function catalogSemanticSignals(business) {
  return unique([
    ...(business.semanticCore || []),
    ...(business.localIntents || []),
    business.primaryIntent,
    business.locality,
    business.region,
  ]).map((item) => clean(item, 180));
}
