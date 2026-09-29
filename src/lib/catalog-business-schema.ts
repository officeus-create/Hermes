import type { CatalogBusinessConcept } from "../data/catalog-business-concepts";

const schemaTypeFor = (business: CatalogBusinessConcept) => {
  if (business.vertical === "restaurant") return "Restaurant";
  if (business.vertical === "barber_shop") return "HairSalon";
  if (business.vertical === "flower_shop") return "Florist";
  return "LocalBusiness";
};

export const buildInternationalCatalogSchema = (business: CatalogBusinessConcept, profileUrl: string) => {
  const countryUrl = `https://hermeslogisticsus.com/businesses/${business.countrySlug}/`;
  const localityUrl = `${countryUrl}${business.localitySlug}/`;
  const mapChannel = business.channels.find((channel) => channel.direction === "maps");
  const sameAs = [...new Set([
    ...(business.website ? [business.website] : []),
    ...business.channels.filter((channel) => channel.direction !== "maps").map((channel) => channel.url),
  ])];
  const businessEntity: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaTypeFor(business),
    "@id": `${profileUrl}#business`,
    name: business.name,
    url: profileUrl,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.locality,
      addressRegion: business.region,
      ...(business.postalCode ? { postalCode: business.postalCode } : {}),
      addressCountry: business.countryCode,
    },
    knowsAbout: business.services,
    ...(mapChannel ? { hasMap: mapChannel.url } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  if (business.vertical === "restaurant" && business.website) businessEntity.hasMenu = business.website;

  const faqItems = [
    {
      q: `Is ${business.name} a Hermes customer?`,
      a: "No. This is an unclaimed public Catalog profile and does not imply a commercial relationship with Hermes.",
    },
    {
      q: "Can the business use Hermes Connect?",
      a: `Yes after an authorized owner claims the profile. Hermes Connect uses one CRM core with a ${business.vertical.replaceAll("_", " ")} configuration for this business type.`,
    },
    {
      q: "Are prices and every service owner-confirmed?",
      a: "No. Only bounded public facts are published. Prices, availability and other unverified operating details remain pending owner confirmation.",
    },
  ];

  return [
    businessEntity,
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hermes Catalog", item: "https://hermeslogisticsus.com/businesses/" },
        { "@type": "ListItem", position: 2, name: business.countryName, item: countryUrl },
        { "@type": "ListItem", position: 3, name: business.locality, item: localityUrl },
        { "@type": "ListItem", position: 4, name: business.name, item: profileUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${business.primaryIntent} discovery for ${business.name}`,
      provider: { "@id": `${profileUrl}#business` },
      areaServed: { "@type": "Place", name: `${business.locality}, ${business.region}, ${business.countryName}` },
      serviceType: business.services,
      description: "Hermes Catalog public discovery profile. Exact current pricing, availability and full operating scope require owner confirmation unless explicitly sourced.",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
};

export const catalogProfileDescription = (business: CatalogBusinessConcept) =>
  `${business.name} in ${business.locality}, ${business.region}: public business facts, contact paths and a Hermes ${business.vertical.replaceAll("_", " ")} CRM concept. Unclaimed until owner verification.`;
