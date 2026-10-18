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
  await expect(route.locator('[data-marketing-stage="content"]')).toContainText("CANONICAL CONTENT");
  await expect(route.locator('[data-marketing-stage="distribution"]')).toContainText("DISTRIBUTION");
  await expect(route.locator('[data-marketing-stage="website"]')).toContainText("WEBSITE ACTION");
  await expect(route.locator('[data-marketing-stage="evidence"]')).toContainText("CRM EVIDENCE");
  await expect(route.locator(".home-marketing-card")).toHaveCount(0);
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
  await expect(journey.locator(".home-marketing-pulse")).toHaveCSS("animation-name", "none");
  await expect(journey.locator("[data-marketing-stage]")).toHaveCount(4);
  const smallestLabel = await journey.locator("[data-marketing-stage] small").evaluateAll(nodes =>
    Math.min(...nodes.map(node => parseFloat(getComputedStyle(node).fontSize))),
  );
  expect(smallestLabel).toBeGreaterThanOrEqual(10);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
