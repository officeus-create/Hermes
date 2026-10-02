import { expect, test } from "@playwright/test";

const fixtureCompany = {
  id: "catalog-single-renderer-fixture",
  companyName: "Single Renderer Fixture Garage",
  companyType: "repair_shop",
  city: "Test City",
  state: "AR",
  profileUrl: "/businesses/arkansas/test-city/catalog-single-renderer-fixture/",
  services: ["Fixture diagnostics"],
  verificationLabel: "Owner-submitted · test fixture",
};

for (const scenario of [
  { name: "the API responds immediately", delayMs: 0 },
  { name: "the API response is delayed", delayMs: 250 },
]) {
  test(`Catalog renders one CRM profile when ${scenario.name}`, async ({ page }) => {
    let catalogReads = 0;
    await page.route("**/api/catalog/companies", async (route) => {
      catalogReads += 1;
      if (scenario.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, scenario.delayMs));
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, companies: [fixtureCompany] }),
      });
    });

    await page.goto("/businesses/", { waitUntil: "domcontentloaded" });

    const primaryGrid = page.locator(".catalog-results .business-grid");
    const fixtureLink = primaryGrid.locator(`a[href="${fixtureCompany.profileUrl}"]`);
    await expect(fixtureLink).toHaveCount(1);
    await expect(fixtureLink).toBeVisible();
    await expect.poll(() => catalogReads).toBe(1);

    await expect(primaryGrid.locator(".business-card--runtime")).toHaveCount(0);
    await expect(primaryGrid.locator("[data-company-runtime-id]")).toHaveCount(0);

    const publishedCards = primaryGrid.locator("[data-catalog-card]");
    const publishedCount = await publishedCards.count();
    const counters = page.locator("[data-catalog-business-count]");
    await expect(counters).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(counters.nth(index)).toHaveText(String(publishedCount));
    }

    const search = page.locator("[data-catalog-input]");
    await search.fill("single renderer fixture");
    await expect(page.locator("[data-catalog-card]:visible")).toHaveCount(1);
    await expect(fixtureLink).toBeVisible();
  });
}
