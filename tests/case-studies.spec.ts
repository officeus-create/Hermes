import { expect, test } from "@playwright/test";

test.describe("Case studies release", () => {
  test("case studies hub is crawlable and links to both published cases", async ({ page }) => {
    const response = await page.goto("/case/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Case studies built from released work");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/case/");
    await expect(page.locator('a[href="/case/it-development/"]')).toBeVisible();
    await expect(page.locator('a[href="/case/appleton-vehicle-transport-seo/"]')).toBeVisible();
  });

  test("Appleton SEO case shows finalized GSC evidence without outcome claims", async ({ page }) => {
    const response = await page.goto("/case/appleton-vehicle-transport-seo/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("useful logistics resource cluster");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://hermeslogisticsus.com/case/appleton-vehicle-transport-seo/",
    );
    await expect(page.getByText("Current GSC checkpoint recorded", { exact: true })).toBeVisible();
    await expect(page.getByText(/6 impressions, 0 clicks, and an average position of 49\.5/i)).toBeVisible();
    await expect(page.getByText(/Warehousing remains an intent mismatch/i)).toBeVisible();
    await expect(page.getByText(/not a like-for-like experiment/i)).toBeVisible();
    await expect(page.getByText(/No GA4, qualified-lead, opportunity, customer, or revenue result is inferred/i)).toBeVisible();
    for (const href of [
      "/logistics/appleton-wi-vehicle-transport/",
      "/logistics/resources/auction-vehicle-pickup-checklist/",
      "/logistics/resources/car-hauler-capacity-checklist/",
    ]) await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  });
});
