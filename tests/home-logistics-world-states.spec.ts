import { expect, test } from "@playwright/test";

test("Logistics keeps real film and freight fallback without synthetic weather", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const world = route.locator("[data-home-logistics-echo]");
  const scene = route.locator("[data-home-logistics-scene-image]");
  const cinematic = route.locator('[data-home-cinematic-video="logistics"]');

  await route.scrollIntoViewIfNeeded();
  await expect(world).not.toHaveAttribute("data-logistics-weather-state", /.+/);
  await expect(route.locator(".home-logistics-weather")).toHaveCount(0);
  await expect(scene).toHaveAttribute("data-logistics-scene-ready", /^(car-hauler|dry-van|reefer|flatbed|step-deck|hotshot)$/);
  await expect(cinematic).toHaveAttribute("data-home-cinematic-version", "v2");

  const sceneBefore = await scene.getAttribute("src");
  await route.hover();
  expect(await scene.getAttribute("src")).toBe(sceneBefore);
  await expect(route.locator('[data-home-motion="truck"]')).toHaveCount(0);
});

test("Logistics reduced motion keeps the stable freight fallback and never adds fake weather", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const world = route.locator("[data-home-logistics-echo]");
  const scene = route.locator("[data-home-logistics-scene-image]");

  await expect(world).not.toHaveAttribute("data-logistics-weather-state", /.+/);
  await expect(route.locator(".home-logistics-weather")).toHaveCount(0);
  await expect(world).toHaveAttribute("data-logistics-echo-motion", "reduced");
  await expect(scene).toHaveAttribute("data-logistics-scene-ready", "car-hauler");
  await expect(route.locator('[data-home-cinematic-video="logistics"]')).toHaveCSS("display", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
