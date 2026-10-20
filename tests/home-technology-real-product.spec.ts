import { expect, test } from "@playwright/test";

test("Technology Home portal keeps clean artwork and preserves truthful product provenance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="technology"]');
  const proof = route.locator('[data-home-pillar-proof="systems"]');
  await route.scrollIntoViewIfNeeded();
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute("href", "/paths/technology/");
  await expect(route.locator(".home-portal-art img")).toBeVisible();
  await expect(proof).toBeHidden(); // No fake miniature product dashboards over the Claude scene.

  // The original source annotations remain intact for deep product-specific pages.
  await expect(proof.locator(".home-system-card")).toHaveCount(4);
  await expect(proof.locator('[data-tech-source="/services/hermes-connect/repair-shops/dashboard/"]')).toContainText("SHOP OWNER WORKSPACE");
  await expect(proof.locator('[data-tech-source="/services/website-development/"]').first()).toContainText("SEMANTIC BUILD");
  await expect(proof.locator('[data-tech-source="/services/hermes-connect/repair-shops/social/"]')).toContainText("OWNER AUTHORIZATION");
  await expect(proof).toContainText("RELEASE EVIDENCE");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Technology|IT/i);
});

test("Technology Home has a static accessible 390px reduced-motion image and route", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="technology"]');
  await route.scrollIntoViewIfNeeded();
  await expect(route.locator(".home-portal-art img")).toBeVisible();
  await expect(route.locator('[data-home-pillar-proof="systems"]')).toBeHidden();
  await expect(route.locator(".home-master-route-copy strong")).toBeVisible();
  await expect(route).toHaveAttribute("href", "/paths/technology/");
  expect(await route.locator(".home-portal-art img").evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
