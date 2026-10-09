import { expect, test } from "@playwright/test";

const repairShop = {
  id: "catalog-single-renderer-fixture",
  companyName: "Single Renderer Fixture Garage",
  companyType: "repair_shop",
  countryCode: "US",
  city: "Test City",
  state: "AR",
  profileUrl: "/businesses/connect/repair-shop/catalog-single-renderer-fixture/",
  services: ["Fixture diagnostics"],
  verificationLabel: "Owner-submitted · test fixture",
};

const genericCompany = {
  id: "catalog-generic-company-fixture",
  companyName: "Generic Opt-In Carrier Fixture",
  companyType: "carrier",
  city: "Test City",
  state: "AR",
  profileUrl: null,
  services: [],
  verificationLabel: "Self-submitted · test fixture",
};

for (const scenario of [
  { name: "the first API response resolves first", delays: [0, 250] },
  { name: "the second API response resolves first", delays: [250, 0] },
]) {
  test(`Catalog keeps generic and Repair Shop cards correct when ${scenario.name}`, async ({ page }) => {
    let catalogReads = 0;
    await page.route("**/api/catalog/companies", async (route) => {
      const requestIndex = catalogReads;
      catalogReads += 1;
      const delayMs = scenario.delays[requestIndex] ?? 0;
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, companies: [genericCompany, repairShop] }),
      });
    });

    await page.goto("/businesses/", { waitUntil: "domcontentloaded" });

    const primaryGrid = page.locator("[data-catalog-grid]");
    const repairLink = primaryGrid.locator(`a[href="${repairShop.profileUrl}"]`);
    const genericCard = primaryGrid.locator(`[data-company-runtime-id="${genericCompany.id}"]`);
    await expect(repairLink).toHaveCount(1);
    await expect(repairLink).toBeVisible();
    await expect(genericCard).toHaveCount(1);
    await expect(genericCard).toBeVisible();
    await expect.poll(() => catalogReads).toBe(2);

    await expect(primaryGrid.locator(".business-card--runtime")).toHaveCount(1);
    await expect(primaryGrid.locator(`[data-company-runtime-id="${repairShop.id}"]`)).toHaveCount(0);
    await expect(primaryGrid.getByRole("heading", { name: repairShop.companyName, exact: true })).toHaveCount(1);
    await expect(primaryGrid.getByRole("heading", { name: genericCompany.companyName, exact: true })).toHaveCount(1);

    const publishedCards = primaryGrid.locator("[data-catalog-card]");
    const publishedCount = await publishedCards.count();
    const counters = page.locator("[data-catalog-business-count]");
    await expect(counters).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(counters.nth(index)).toHaveText(String(publishedCount));
    }

    const search = page.locator("[data-catalog-input]");
    await search.fill("generic opt-in carrier fixture");
    await expect(page.locator("[data-catalog-card]:visible")).toHaveCount(1);
    await expect(genericCard).toBeVisible();
    await search.fill("single renderer fixture");
    await expect(page.locator("[data-catalog-card]:visible")).toHaveCount(1);
    await expect(repairLink).toBeVisible();
  });
}
