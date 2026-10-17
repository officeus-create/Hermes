import { expect, test } from "@playwright/test";

test("Logistics hover changes weather without replacing the equipment scene", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const world = route.locator("[data-home-logistics-echo]");
  const scene = route.locator("[data-home-logistics-scene-image]");
  const weather = route.locator(".home-logistics-weather");

  await route.scrollIntoViewIfNeeded();
  const weatherBefore = await world.getAttribute("data-logistics-weather-state");
  const sceneBefore = await scene.getAttribute("src");
  expect(weatherBefore).toMatch(/^(sun|fog|dusk|rain)$/);

  await route.hover();
  await expect.poll(() => world.getAttribute("data-logistics-weather-state")).not.toBe(weatherBefore);
  expect(await scene.getAttribute("src")).toBe(sceneBefore);
  await expect(scene).toHaveCSS("transform", "none");
  await expect(route.locator('[data-home-motion="truck"]')).toHaveCount(0);
});

test("Logistics reduced motion freezes the world in the stable sun state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const world = route.locator("[data-home-logistics-echo]");
  await expect(world).toHaveAttribute("data-logistics-weather-state", "sun");
  await expect(world).toHaveAttribute("data-logistics-echo-motion", "reduced");
  await expect(route.locator(".home-logistics-weather")).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
