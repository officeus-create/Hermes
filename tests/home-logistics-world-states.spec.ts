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
  await expect(world).toHaveAttribute("data-logistics-weather-state", "sun");
  const before = await scene.getAttribute("src");

  await route.hover();
  await expect(world).toHaveAttribute("data-logistics-weather-state", "fog");
  expect(await scene.getAttribute("src")).toBe(before);
  await expect(weather).toHaveCSS("transform", "none");
  await expect(route.locator('[data-home-motion="truck"]')).toHaveAttribute("data-motion-state", "running");
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
