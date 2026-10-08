import { test, expect } from "@playwright/test";
import { addRepairCatalogLinks } from "../functions/businesses/index";

const shop = { id: "fixture-shop", name: "Fixture Repair", slug: "kittle-s-garage-a146544", catalog_opt_in: 1, city: "Fixture City", state: "AR" };
const profileUrl = "/businesses/connect/repair-shop/kittle-s-garage-a146544/";

test("runtime HTML discovery survives disabled JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.route("**/businesses/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: addRepairCatalogLinks(await response.text(), [shop]) });
  });
  await page.goto("/businesses/");
  await expect(page.locator(`nav[data-runtime-repair-links] a[href="${profileUrl}"]`)).toBeVisible();
  await expect(page.locator('[data-catalog-card][data-catalog-entity-id="repair-shop-crm:fixture-shop"]')).toHaveCount(0);
  await context.close();
});

test("runtime discovery does not duplicate the client card", async ({ page }) => {
  await page.route("**/businesses/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: addRepairCatalogLinks(await response.text(), [shop]) });
  });
  await page.route("**/api/catalog/companies", (route) => route.fulfill({ json: { success: true, companies: [{
    id: "repair-shop-crm:fixture-shop", companyName: shop.name, companyType: "repair_shop", countryCode: "US", city: shop.city, state: shop.state, profileUrl, services: [], verificationLabel: "Self-submitted · verification pending",
  }] } }));
  await page.goto("/businesses/");
  await expect(page.locator(`nav[data-runtime-repair-links] a[href="${profileUrl}"]`)).toBeVisible();
  await expect(page.locator('[data-catalog-card][data-catalog-entity-id="repair-shop-crm:fixture-shop"]')).toHaveCount(1);
  await expect(page.locator(`nav[data-runtime-repair-links] [data-catalog-card]`)).toHaveCount(0);
});
