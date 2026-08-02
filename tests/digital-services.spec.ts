import { expect, test } from "@playwright/test";

const routes = [
  ["/services/website-development/", "Custom Website Development for U.S. Businesses"],
  ["/services/website-redesign/", "Website Redesign Built Around Business Priorities"],
  ["/services/seo/", "SEO Services Built on Technical Quality and Useful Content"],
  ["/services/local-seo/", "Local SEO for Real U.S. Service Areas and Customer Needs"],
] as const;

test.describe("National digital service hubs", () => {
  for (const [route, h1] of routes) {
    test(`${route} is crawlable, email-only, and preview-first`, async ({ page }) => {
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

  test("website and SEO hubs cross-link to the correct supporting owners", async ({ page }) => {
    await page.goto("/services/website-development/");
    await expect(page.locator('a[href="/services/website-redesign/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/services/seo/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/services/seo-for-logistics-companies/"]').first()).toBeVisible();

    await page.goto("/services/seo/");
    await expect(page.locator('a[href="/services/local-seo/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/case/it-development/"]').first()).toBeVisible();
  });
});
