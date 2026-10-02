import { expect, test } from "@playwright/test";
import { buildCatalogConceptSchema } from "../src/lib/catalog-concept-schema.mjs";

const base = {
  id: "fixture",
  countrySlug: "ukraine",
  localitySlug: "chaiky",
  name: "Fixture Business",
  phone: "+380 00 000 00 00",
  address: "1 Test St",
  locality: "Chaiky",
  region: "Kyiv Oblast",
  countryCode: "UA",
  primaryIntent: "Fixture service",
  schemaHours: ["Mo-Fr 09:00-18:00"],
  channels: [{ label: "Website", url: "https://example.com/", direction: "primary" }],
  faq: [{ question: "Q?", answer: "A." }],
};

for (const schemaType of ["Store", "Restaurant", "HairSalon", "Florist", "LocalBusiness"]) {
  test(`catalog concept schema preserves ${schemaType} without auto-repair hardcoding`, () => {
    const schema = buildCatalogConceptSchema({
      business: { ...base, schemaType },
      profileUrl: "https://hermeslogisticsus.com/businesses/ukraine/chaiky/fixture/",
    });
    const [businessSchema, serviceSchema, breadcrumbSchema, faqSchema] = schema;
    expect(businessSchema?.["@type"]).toBe(schemaType);
    expect(JSON.stringify(schema)).not.toContain("AutoRepair");
    expect((serviceSchema as { name?: string } | null)?.name).toBe("Fixture service");
    expect((breadcrumbSchema as { itemListElement?: Array<{ item?: string }> } | null)?.itemListElement?.at(-1)?.item).toContain("/fixture/");
    expect(faqSchema?.["@type"]).toBe("FAQPage");
  });
}
