import { expect, test } from "@playwright/test";

test("auto repair website owner shows a truthful search-to-shop workflow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/services/auto-repair-website-design/");

  const proof = page.locator("[data-auto-repair-website-proof]");
  await expect(proof).toBeVisible();
  await expect(proof.locator("[data-repair-proof-stage]")).toHaveCount(4);
  await expect(proof.locator('[data-repair-proof-stage="discover"]')).toHaveAttribute("data-proof-source", "/services/seo-for-auto-repair-shops/");
  await expect(proof.locator('[data-repair-proof-stage="availability"]')).toHaveAttribute("data-proof-source", "/services/hermes-connect/repair-shops/availability/");
  await expect(proof.locator('[data-repair-proof-stage="workspace"]')).toHaveAttribute("data-proof-source", "/services/hermes-connect/repair-shops/dashboard/");

  for (const label of ["Local discovery", "Mobile website", "Booking availability", "Shop-owned workflow", "Booking inbox", "Catalog inquiries"]) {
    await expect(proof).toContainText(label);
  }

  await expect(proof.locator(".repair-proof-flow > i b").first()).toHaveCSS("animation-name", "repair-proof-current");
  await expect(proof.locator(".repair-proof-current i")).toHaveCSS("animation-name", "repair-proof-dot");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/auto-repair-website-design/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("auto repair proof remains readable at 390px with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/auto-repair-website-design/");

  const proof = page.locator("[data-auto-repair-website-proof]");
  await expect(proof).toBeVisible();
  await expect(proof.locator("[data-repair-proof-stage]")).toHaveCount(4);
  await expect(proof.locator(".repair-proof-flow > i b").first()).toHaveCSS("animation-name", "none");
  await expect(proof.locator(".repair-proof-current")).toBeHidden();
  await expect(proof.getByRole("link", { name: "Explore the repair-shop operating layer" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
