import { expect, test } from "@playwright/test";

test("Marketing keeps the approved human anchor behind the causal demand journey", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="marketing"]');
  const human = route.locator("[data-home-marketing-human] img");
  const journey = route.locator("[data-home-marketing-journey]");

  await route.scrollIntoViewIfNeeded();
  await expect(human).toBeVisible();
  await expect(human).toHaveAttribute("src", "/images/home-20261001/marketing-512.webp");
  await expect(journey).toHaveAttribute("data-journey-motion", "running");
  await expect(route.locator(".home-marketing-content")).toContainText("CONTENT");
  await expect(route.locator(".home-marketing-discovery")).toContainText("DISCOVERY");
  await expect(route.locator(".home-marketing-site")).toContainText("WEBSITE");
  await expect(route.locator(".home-marketing-inquiry")).toContainText("CRM EVIDENCE");

  const opacity = await human.evaluate((node) => Number.parseFloat(getComputedStyle(node).opacity));
  expect(opacity).toBeGreaterThanOrEqual(0.5);
});

test("Marketing remains legible and static under reduced motion at 390px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="marketing"]');
  const human = route.locator("[data-home-marketing-human] img");
  const journey = route.locator("[data-home-marketing-journey]");

  await route.scrollIntoViewIfNeeded();
  await expect(human).toBeVisible();
  await expect(journey).toHaveAttribute("data-journey-motion", "reduced");
  await expect(route.locator(".home-marketing-content")).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
