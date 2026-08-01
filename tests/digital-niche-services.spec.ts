import { expect, test } from "@playwright/test";

const routes = [
  ["/services/seo-for-logistics-companies/", "SEO for U.S. Logistics Companies"],
  ["/services/seo-for-independent-auto-dealers/", "SEO for Independent Auto Dealers"],
] as const;

test.describe("Niche SEO service pages", () => {
  for (const [route, h1] of routes) {
    test(`${route} is crawlable, preview-first, and email-only`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(h1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://hermeslogisticsus.com${route}`,
      );
      await expect(page.locator('[aria-label="Breadcrumb"]')).toBeVisible();
      await expect(page.locator('[data-contact-form]')).toHaveAttribute("data-contact-mode", "preview");
      await expect(page.locator('a[href="mailto:officeus@hermeslogisticsus.com"]').first()).toBeVisible();
      await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
      await expect(page.getByText("Capabilities are scoped. Results are not guaranteed.")).toBeVisible();
    });
  }

  test("national SEO hub links to both evidence-reviewed niche pages", async ({ page }) => {
    await page.goto("/services/seo/");
    await expect(page.locator('a[href="/services/seo-for-logistics-companies/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/services/seo-for-independent-auto-dealers/"]').first()).toBeVisible();
  });
});
