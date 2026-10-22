import { expect, test } from "@playwright/test";
import { publicEntityRegistry } from "../src/data/public-entity-registry";

const progressoproProfile = "https://www.instagram.com/progressopro/";
const expectedHermesProfiles = [
  "https://www.instagram.com/hermes.logistics/",
  "https://www.threads.com/@hermes.logistics",
];

const forbiddenEntitySignals = [
  "work.ua/resumes/10640079",
  "robota.ua/candidates/23423822",
  "dnb.com/business-directory/company-profiles.hermes_logistics_llc",
  "buzzfile.com/business/Hermes-Logistics",
  "hermes-logistic.com",
  "hermesreloservice.com",
  "hermesexp.com",
  "hermes-cargo.com",
];

const readJsonLd = async (page: import("@playwright/test").Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents())
    .flatMap((text) => {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    });

test("public entity registry excludes unrelated and personal-profile Hermes signals", () => {
  const serialized = JSON.stringify(publicEntityRegistry).toLowerCase();
  for (const signal of forbiddenEntitySignals) {
    expect(serialized).not.toContain(signal.toLowerCase());
  }
});

test("homepage Organization uses exact Hermes same-entity profiles only", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  const entities = await readJsonLd(page);
  const organization = entities.find(
    (entity) => entity?.["@type"] === "Organization" && entity?.["@id"] === "https://hermeslogisticsus.com/#organization",
  );
  expect(organization).toBeTruthy();
  expect(organization.sameAs).toEqual(expectedHermesProfiles);
  expect(organization.sameAs).not.toContain(progressoproProfile);
  expect(organization.department).toBeUndefined();
});

test("homepage publishes one stable Hermes Logistics LLC Organization node", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  const entities = await readJsonLd(page);
  const logistics = entities.find(
    (entity) => entity?.["@type"] === "Organization" && entity?.["@id"] === "https://hermeslogisticsus.com/#logistics",
  );
  expect(logistics).toBeTruthy();
  expect(logistics.name).toBe("Hermes Logistics LLC");
  expect(logistics.legalName).toBe("Hermes Logistics, LLC");
  expect(logistics.identifier?.propertyID).toBe("Wisconsin DFI Entity ID");
  expect(logistics.identifier?.value).toBe("H062724");
  expect(logistics.foundingDate).toBe("2018-11-01");
  expect(logistics.url).toBe("https://hermeslogisticsus.com/paths/logistics/");
  expect(logistics.mainEntityOfPage).toBe("https://hermeslogisticsus.com/company-information/");
  expect(logistics.sameAs).toEqual(["https://staff.am/en/company/hermes-logistics-llc"]);
});

test("canonical Logistics hub binds Service provider to the stable Logistics entity", async ({ page }) => {
  const response = await page.goto("/paths/logistics/");
  expect(response?.ok()).toBeTruthy();
  const entities = await readJsonLd(page);
  const logistics = entities.find(
    (entity) => entity?.["@type"] === "Organization" && entity?.["@id"] === "https://hermeslogisticsus.com/#logistics",
  );
  const service = entities.find((entity) => entity?.["@type"] === "Service");
  expect(logistics?.name).toBe("Hermes Logistics LLC");
  expect(service?.provider?.["@id"]).toBe("https://hermeslogisticsus.com/#logistics");
});

test("Logistics commercial and resource Service providers resolve to the approved Logistics LLC node", async ({ page }) => {
  const routes = [
    "/logistics/car-hauler-loads/",
    "/logistics/car-hauler-loads/denver-co/",
    "/logistics/resources/",
    "/logistics/resources/rpm-calculator/",
    "/logistics/resources/factoring-vs-direct-payment-calculator/",
    "/logistics/resources/broker-setup-packet-checklist/",
    "/logistics/resources/wisconsin-car-shipping-cost-guide/",
    "/logistics/resources/dispatch-service-vs-self-dispatch/",
    "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
    "/paths/logistics/shippers-dealers/",
    "/paths/logistics/brokers/carrier-capacity/",
    "/paths/logistics/customers/vehicle-transport/",
    "/ru/logistics/",
  ];

  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
    const entities = await readJsonLd(page);
    const providers = entities
      .map((entity) => entity?.provider?.["@id"])
      .filter((provider): provider is string => Boolean(provider));

    expect(providers.length, `${route} must publish at least one provider-bearing schema node`).toBeGreaterThan(0);
    expect(new Set(providers), route).toEqual(new Set(["https://hermeslogisticsus.com/#logistics"]));
  }
});

test("homepage schema excludes unrelated and owner-unverified Hermes entity signals", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  const entities = await readJsonLd(page);
  const serialized = JSON.stringify(entities).toLowerCase();
  for (const signal of forbiddenEntitySignals) {
    expect(serialized).not.toContain(signal.toLowerCase());
  }
});

test("marketing page keeps visible ProgressoPro positioning without premature sameAs", async ({ page }) => {
  const response = await page.goto("/paths/marketing/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByText(/ProgressoPro/).first()).toBeVisible();

  const entities = await readJsonLd(page);
  const serialized = JSON.stringify(entities);
  expect(serialized).not.toContain(progressoproProfile);
  expect(
    entities.some(
      (entity) => ["Organization", "Brand"].includes(entity?.["@type"]) && entity?.["@id"] === "https://hermeslogisticsus.com/#progressopro",
    ),
  ).toBeFalsy();
});

test("Home v3 preserves the Logistics legal owner, resources and discovery through canonical pages", async ({ page }) => {
  await page.goto("/");
  // The compact four-direction chooser replaces the old legal-identity promo panel,
  // but does not remove the corporate identity schema or its owner URLs.
  const logisticsRoute = page.locator('[data-home-route][data-route-id="logistics"]');
  await expect(logisticsRoute).toHaveAttribute("href", "/paths/logistics/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Company Information" })).toHaveAttribute("href", "/company-information/");
  const homeEntities = await readJsonLd(page);
  const logistics = homeEntities.find(
    (entity) => entity?.["@type"] === "Organization" && entity?.["@id"] === "https://hermeslogisticsus.com/#logistics",
  );
  expect(logistics?.identifier?.value).toBe("H062724");
  expect(logistics?.mainEntityOfPage).toBe("https://hermeslogisticsus.com/company-information/");

  await page.goto("/company-information/");
  await expect(page.getByRole("heading", { name: "Hermes Logistics LLC — Company Information" })).toBeVisible();
  await expect(page.getByText("H062724").first()).toBeVisible();

  // Qualified commercial and research paths remain live in their existing owners.
  for (const route of ["/logistics/car-hauling-dispatch/", "/logistics/resources/rpm-calculator/"]) {
    const response = await page.request.get(route);
    expect(response.status(), route).toBe(200);
  }
  await page.goto("/insights/");
  const preserved = page.locator("#homepage-evidence-archive");
  await expect(preserved).toBeVisible();
  await expect(preserved.getByRole("link", { name: /Logistics · Company information/ })).toHaveAttribute("href", "/company-information/");
});
