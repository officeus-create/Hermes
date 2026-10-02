import { catalogBusinessConcepts, type CatalogBusinessConcept } from "../data/catalog-business-concepts";

export type CatalogConceptCountryRoute = {
  slug: string;
  name: string;
  businesses: readonly CatalogBusinessConcept[];
};

export type CatalogConceptLocalityRoute = {
  countrySlug: string;
  countryName: string;
  slug: string;
  name: string;
  region: string;
  businesses: readonly CatalogBusinessConcept[];
};

export type CatalogConceptBusinessRoute = {
  countrySlug: string;
  localitySlug: string;
  slug: string;
  business: CatalogBusinessConcept;
};

const countryName = (business: CatalogBusinessConcept) => {
  if (business.countryCode === "UA") return "Ukraine";
  if (business.countryCode === "US") return "United States";
  return business.countrySlug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const international = catalogBusinessConcepts.filter((business) => business.market === "international");

export const catalogConceptBusinessRoutes: readonly CatalogConceptBusinessRoute[] = Object.freeze(
  international.map((business) => ({
    countrySlug: business.countrySlug,
    localitySlug: business.localitySlug,
    slug: business.slug,
    business,
  })),
);

export const catalogConceptCountryRoutes: readonly CatalogConceptCountryRoute[] = Object.freeze(
  [...new Set(international.map((business) => business.countrySlug))].map((slug) => {
    const businesses = international.filter((business) => business.countrySlug === slug);
    return { slug, name: countryName(businesses[0]), businesses };
  }),
);

export const catalogConceptLocalityRoutes: readonly CatalogConceptLocalityRoute[] = Object.freeze(
  [...new Map(international.map((business) => [
    `${business.countrySlug}/${business.localitySlug}`,
    { countrySlug: business.countrySlug, localitySlug: business.localitySlug },
  ])).values()].map(({ countrySlug, localitySlug }) => {
    const businesses = international.filter((business) =>
      business.countrySlug === countrySlug && business.localitySlug === localitySlug
    );
    const first = businesses[0];
    return {
      countrySlug,
      countryName: countryName(first),
      slug: localitySlug,
      name: first.locality,
      region: first.region,
      businesses,
    };
  }),
);

export const catalogConceptRouteRegistry = Object.freeze({
  countries: catalogConceptCountryRoutes,
  localities: catalogConceptLocalityRoutes,
  businesses: catalogConceptBusinessRoutes,
});
