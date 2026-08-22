import { expect, test } from "@playwright/test";

const locales = ["/ua/", "/ru/", "/es/", "/it/", "/fr/"] as const;
const canonicalBrands = ["Hermes Logistics", "Hermes Marketing", "Hermes Academy", "Hermes Technology"] as const;

test("localized direction surfaces use one canonical Hermes entity hierarchy", async ({ page }) => {
  for (const route of locales) {
    await page.goto(route);
    const directions = page.locator(".localized-direction-list");
    await expect(directions.locator(".localized-direction")).toHaveCount(4);

    for (const brand of canonicalBrands) {
      await expect(directions.getByText(brand, { exact: true })).toHaveCount(1);
    }

    const text = await directions.innerText();
    expect(text).not.toContain("Hermes Business Academy");
    expect(text).not.toContain("Hermes IT Development");
    expect(text).not.toContain("Hermes Marketing · ProgressoPro");
  }
});

test("localized direction mail subjects use canonical direction names", async ({ page }) => {
  await page.goto("/ru/");
  for (const [id, brand] of [
    ["marketing", "Hermes Marketing"],
    ["technology", "Hermes Technology"],
  ] as const) {
    const href = await page.locator(`#${id} .localized-direction-copy a`).getAttribute("href");
    expect(href).toContain("mailto:officeus@hermeslogisticsus.com");
    expect(decodeURIComponent(href ?? "")).toContain(brand);
  }
});