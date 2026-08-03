import { expect, test } from "@playwright/test";

const progressoproProfile = "https://www.instagram.com/progressopro/";
const expectedHermesProfiles = [
  "https://www.instagram.com/hermes.logistics/",
  "https://www.threads.com/@hermes.logistics",
];

const readJsonLd = async (page: import("@playwright/test").Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents())
    .flatMap((text) => {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
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
