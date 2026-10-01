import { expect, test } from "@playwright/test";

test.describe("KNB client concept", () => {
  test("stays noindex and links the isolated CRM demo", async ({ page }) => {
    await page.goto("/businesses/concepts/kons-na-bis/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(page.getByText("це не офіційний сайт бізнесу")).toBeVisible();
    await expect(page.getByRole("link", { name: /CRM demo/i })).toHaveAttribute(
      "href",
      "/services/hermes-connect/academy/business-demo/kons-na-bis/",
    );
    await expect(page.getByRole("link", { name: /Офіційна сторінка програми/ })).toHaveAttribute(
      "href",
      "https://biznes-club-knb.com/zrostannia-u-biznesi-ads",
    );
    await expect(page.locator(".steps .step")).toHaveCount(7);
  });

  test("does not overflow at mobile widths", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/businesses/concepts/kons-na-bis/");
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});