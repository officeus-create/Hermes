export const buildCatalogConceptSchema = ({ business, profileUrl, catalogUrl = "https://hermeslogisticsus.com/businesses/" }) => {
  const businessId = profileUrl + "#business";
  const areaName = [business.locality, business.region].filter(Boolean).join(", ");
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": business.schemaType,
    "@id": businessId,
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
    ...(business.schemaHours?.length ? { openingHours: business.schemaHours } : {}),
    ...(business.channels?.length ? { sameAs: business.channels.map((channel) => channel.url) } : {}),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: business.primaryIntent,
    provider: { "@id": businessId },
    areaServed: { "@type": "Place", name: areaName },
    description: `Hermes Catalog discovery profile for ${business.name}. Exact service scope, prices, availability and warranty terms require owner confirmation unless explicitly verified.`,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hermes Catalog", item: catalogUrl },
      { "@type": "ListItem", position: 2, name: business.countrySlug, item: `${catalogUrl}${business.countrySlug}/` },
      { "@type": "ListItem", position: 3, name: business.locality, item: `${catalogUrl}${business.countrySlug}/${business.localitySlug}/` },
      { "@type": "ListItem", position: 4, name: business.name, item: profileUrl },
    ],
  };
  const faqSchema = business.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: business.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } : null;
  return [businessSchema, serviceSchema, breadcrumbSchema, faqSchema].filter(Boolean);
};
