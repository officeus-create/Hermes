import { expect, test } from "@playwright/test";

const mobileRoutes = [
  "/services/hermes-connect/",
  "/services/hermes-connect/repair-shops/",
  "/services/hermes-connect/ai-command-center/",
  "/services/hermes-connect/unified-inbox/",
  "/services/hermes-connect/load-analyzer/",
  "/services/hermes-connect/rate-negotiator/",
  "/services/hermes-connect/proposal-builder/",
  "/services/hermes-connect/roi-calculator/",
  "/services/hermes-connect/business-automation/",
];

test.describe("Hermes Connect dedicated mobile regression", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const route of mobileRoutes) {
    test(`${route} has no document-level horizontal overflow`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("[data-hc-product-context]")).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(hasOverflow).toBe(false);
    });
  }

  test("localized product chrome preserves the exact mobile capability route", async ({ page }) => {
    await page.goto("/services/hermes-connect/rate-negotiator/?lang=fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("[data-hc-product-context]")).toContainText("CAPACITÉ DE RÉFÉRENCE");
    await expect(page.locator("[data-hc-english-only]")).toBeVisible();
    await expect(page.locator('[data-language-menu] a[lang="es"]')).toHaveAttribute(
      "href",
      "/services/hermes-connect/rate-negotiator/?lang=es",
    );
  });

  test("Repair Shop mobile flow exposes current product navigation without the old back arrow", async ({ page }) => {
    await page.goto("/services/hermes-connect/repair-shops/");
    await expect(page.locator(".repair-pilot-page .hero-header-nav")).toHaveCount(0);
    await expect(page.locator(".hc-family-nav")).toBeVisible();
    await expect(page.locator("#partner-beta-form")).toHaveAttribute("data-live-partner-offer", "true");
  });

  test("product family navigation visibly signals and supports horizontal exploration", async ({ page }) => {
    await page.goto("/services/hermes-connect/");
    const nav = page.locator(".hc-family-nav");
    await expect(nav).toHaveAttribute("data-scrollable", "true");
    await expect(nav).toHaveAttribute("data-scroll-start", "true");

    const state = await nav.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        maskImage: style.maskImage,
        scrollSnapType: style.scrollSnapType,
      };
    });
    expect(state.scrollWidth).toBeGreaterThan(state.clientWidth);
    expect(state.maskImage).not.toBe("none");
    expect(state.scrollSnapType).toContain("x");

    await nav.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await expect(nav).toHaveAttribute("data-scroll-end", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });
});
