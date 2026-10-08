export const buildCatalogConceptSchema = ({ business, profileUrl, catalogUrl = "https://hermeslogisticsus.com/businesses/", display = business, faqLocale = "uk" }) => {
  const businessId = profileUrl + "#business";
  const areaName = [display.locality, display.region].filter(Boolean).join(", ");
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": business.schemaType,
    "@id": businessId,
    name: business.name,
    ...(display.name !== business.name ? { alternateName: display.name } : {}),
    url: profileUrl,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: display.address,
      addressLocality: display.locality,
      addressRegion: display.region,
      ...(business.postalCode ? { postalCode: business.postalCode } : {}),
      addressCountry: business.countryCode,
    },
    ...(business.schemaHours?.length ? { openingHours: business.schemaHours } : {}),
    ...(business.channels?.length ? { sameAs: business.channels.map((channel) => channel.url) } : {}),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: display.primaryIntent,
    provider: { "@id": businessId },
    areaServed: { "@type": "Place", name: areaName },
    description: `Hermes Catalog discovery profile for ${display.name}. Exact service scope, prices, availability and warranty terms require owner confirmation unless explicitly verified.`,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hermes Catalog", item: catalogUrl },
      { "@type": "ListItem", position: 2, name: business.countrySlug, item: `${catalogUrl}${business.countrySlug}/` },
      { "@type": "ListItem", position: 3, name: display.locality, item: `${catalogUrl}${business.countrySlug}/${business.localitySlug}/` },
      { "@type": "ListItem", position: 4, name: display.name, item: profileUrl },
    ],
  };
  const faqSchema = business.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: business.faq.map((item) => ({
      "@type": "Question",
      name: faqLocale === "en" ? (item.questionEn ?? item.question) : item.question,
      acceptedAnswer: { "@type": "Answer", text: faqLocale === "en" ? (item.answerEn ?? item.answer) : item.answer },
    })),
  } : null;
  return [businessSchema, serviceSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];
};
