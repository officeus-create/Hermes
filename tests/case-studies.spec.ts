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
    await expect(page.getByText("First finalized GSC baseline recorded", { exact: true })).toBeVisible();
    await expect(page.getByText(/33 impressions, 0 clicks, and an average position of 45\.33/i)).toBeVisible();
    await expect(page.getByText(/does not prove stable rankings, qualified traffic, inquiries, customers, or revenue/i)).toBeVisible();
    for (const href of [
      "/logistics/appleton-wi-vehicle-transport/",
      "/logistics/resources/auction-vehicle-pickup-checklist/",
      "/logistics/resources/car-hauler-capacity-checklist/",
    ]) await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  });
});
