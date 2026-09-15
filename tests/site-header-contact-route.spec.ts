import { expect, test } from "@playwright/test";

test("header conversation CTA falls back to the canonical contact route when the page has no local contact target", async ({ page }) => {
  await page.goto("/carrier/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#contact")).toHaveCount(0);
  await expect(page.locator(".header-actions [data-header-contact-link]")).toHaveAttribute("href", "/contacts/#contact");
});

test("header conversation CTA keeps the local contact target when the page renders one", async ({ page }) => {
  await page.goto("/paths/logistics/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#contact")).toHaveCount(1);
  await expect(page.locator(".header-actions [data-header-contact-link]")).toHaveAttribute("href", "#contact");
});

test("mobile conversation CTA uses the same route-safe behavior", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/carrier/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator('#mobile-menu [data-header-contact-link]')).toHaveAttribute("href", "/contacts/#contact");
});
