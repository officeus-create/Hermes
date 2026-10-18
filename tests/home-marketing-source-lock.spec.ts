import { expect, test } from "@playwright/test";

test("Marketing source lock keeps causal demand journey without an unapproved pictorial subject", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="marketing"]');
  const journey = route.locator("[data-home-marketing-journey]");

  await route.scrollIntoViewIfNeeded();
  await expect(route.locator("[data-home-marketing-human]")).toHaveCount(0);
  await expect(route.locator(".home-portal-art img")).toHaveCount(0);
  await expect(route.locator('img[src*="/images/home-20261001/marketing-"]')).toHaveCount(0);
  await expect(journey).toHaveAttribute("data-journey-motion", "running");
  await expect(route.locator(".home-marketing-content")).toContainText("CONTENT");
  await expect(route.locator(".home-marketing-discovery")).toContainText("DISCOVERY");
  await expect(route.locator(".home-marketing-site")).toContainText("WEBSITE");
  await expect(route.locator(".home-marketing-inquiry")).toContainText("CRM EVIDENCE");
});

test("Marketing source lock stays legible and static under reduced motion at 390px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="marketing"]');
  const journey = route.locator("[data-home-marketing-journey]");

  await route.scrollIntoViewIfNeeded();
  await expect(route.locator(".home-portal-art img")).toHaveCount(0);
  await expect(journey).toHaveAttribute("data-journey-motion", "reduced");
  await expect(route.locator(".home-marketing-content")).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
