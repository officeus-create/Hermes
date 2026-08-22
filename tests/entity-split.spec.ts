import { expect, test } from "@playwright/test";
import { publicEntityRegistry } from "../src/data/public-entity-registry";

const progressoproProfile = "https://www.instagram.com/progressopro/";
const logisticsDirectionProfiles = [
  "https://www.instagram.com/hermes.logistics/",
  "https://www.threads.com/@hermes.logistics",
];

const forbiddenEntitySignals = [
  "staff.am/en/company/hermes-logistics-llc",
  "staff.am/ru/company/hermes-logistics-llc",
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

test("homepage Organization omits direction-specific and unverified sameAs profiles", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  const entities = await readJsonLd(page);
  const organization = entities.find(
    (entity) => entity?.["@type"] === "Organization" && entity?.["@id"] === "https://hermeslogisticsus.com/#organization",
  );
  expect(organization).toBeTruthy();
  expect(organization.sameAs).toBeUndefined();

  const serializedOrganization = JSON.stringify(organization);
  for (const profile of [...logisticsDirectionProfiles, progressoproProfile]) {
    expect(serializedOrganization).not.toContain(profile);
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

test("marketing page does not promote ProgressoPro into public entity schema", async ({ page }) => {
  const response = await page.goto("/paths/marketing/");
  expect(response?.ok()).toBeTruthy();

  const entities = await readJsonLd(page);
  const serialized = JSON.stringify(entities);
  expect(serialized).not.toContain(progressoproProfile);
  expect(
    entities.some(
      (entity) => ["Organization", "Brand"].includes(entity?.["@type"]) && entity?.["@id"] === "https://hermeslogisticsus.com/#progressopro",
    ),
  ).toBeFalsy();
});
