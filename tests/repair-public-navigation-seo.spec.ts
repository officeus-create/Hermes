import { expect, test } from "@playwright/test";

const publicRoute = "/services/hermes-connect/repair-shops/";

const privateOperationalRoutes = [
  "/services/hermes-connect/repair-shops/dashboard/",
  "/services/hermes-connect/repair-shops/availability/",
  "/services/hermes-connect/repair-shops/customers/",
];

const requiredPublicRoutes = [
  "/services/hermes-connect/repair-shops/auth/",
  "/services/hermes-connect/repair-shops/plan/",
  "/services/local-seo/",
  "/services/website-development/",
  "/services/seo/",
];

test("Repair public page keeps operational deep links behind auth while preserving commercial owners", async ({ page }) => {
  await page.goto(publicRoute, { waitUntil: "domcontentloaded" });

  for (const href of privateOperationalRoutes) {
    await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
  }

  for (const href of requiredPublicRoutes) {
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  }

  await expect(page.locator('a[href="#repair-capabilities-title"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Start publicly. Continue operations after sign-in." })).toBeVisible();
});

test("Repair public navigation remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(publicRoute, { waitUntil: "domcontentloaded" });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);

  for (const href of [
    "/services/hermes-connect/repair-shops/auth/",
    "/services/hermes-connect/repair-shops/plan/",
    "#repair-capabilities-title",
  ]) {
    const link = page.locator(`a[href="${href}"]`).first();
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    if (box) expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
