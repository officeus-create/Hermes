import { expect, test } from "@playwright/test";

test.describe("Home direction contact strip", () => {
  for (const width of [390, 1440]) {
    test(`keeps the approved contact handoff readable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      await page.goto("/");

      const strip = page.locator(".home-contact-strip");
      await expect(strip).toBeVisible();
      await expect(strip.getByText("Not sure which direction fits?")).toBeVisible();
      await expect(strip.getByText("officeus@hermeslogisticsus.com")).toHaveAttribute(
        "href",
        "mailto:officeus@hermeslogisticsus.com",
      );
      await expect(strip.getByRole("link", { name: "Describe your request" })).toHaveAttribute(
        "href",
        "mailto:officeus@hermeslogisticsus.com",
      );

      const routeLinks = strip.locator(".home-contact-strip__routes > a");
      await expect(routeLinks).toHaveCount(4);
      await expect(routeLinks.nth(0)).toHaveAttribute("href", "/paths/logistics/");
      await expect(routeLinks.nth(1)).toHaveAttribute("href", "/paths/technology/");
      await expect(routeLinks.nth(2)).toHaveAttribute("href", "/paths/academy/");
      await expect(routeLinks.nth(3)).toHaveAttribute("href", "/paths/marketing/");

      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  }
});
