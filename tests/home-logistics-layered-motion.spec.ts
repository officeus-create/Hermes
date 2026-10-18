import { expect, test } from "@playwright/test";

test("Logistics car-hauler separates the moving subject from the camera-locked road with a local fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const scene = route.locator("[data-home-logistics-scene-image]");
  const roadPlate = route.locator("[data-home-logistics-road-plate]");
  const truckLayer = route.locator("[data-home-logistics-truck-layer]");

  await expect(roadPlate).toHaveCount(1);
  await expect(truckLayer).toHaveCount(1);
  await expect(scene).toHaveAttribute("src", "/images/logistics-living/car-hauler-512.webp");

  await roadPlate.evaluate((node) => { (node as HTMLImageElement).src = "/images/logistics-living/car-hauler-512.webp"; });
  await truckLayer.evaluate((node) => { (node as HTMLImageElement).src = "/images/logistics-living/car-hauler-512.webp"; });
  await expect.poll(async () => page.locator("[data-home-logistics-echo]").getAttribute("data-logistics-layer-ready")).toBe("true");

  await route.scrollIntoViewIfNeeded();
  await expect(route).toHaveAttribute("data-logistics-layered", "true");
  await expect(route).toHaveAttribute("data-logistics-motion", "running");
  await expect(scene).toHaveCSS("opacity", "0");
  await expect(roadPlate).toHaveCSS("opacity", "1");
  await expect(roadPlate).toHaveCSS("transform", "none");
  await expect(truckLayer).toHaveCSS("opacity", "1");
  await expect(truckLayer).toHaveCSS("animation-name", "home-logistics-truck-drive");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Logistics separated subject enhancement stays off for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const scene = route.locator("[data-home-logistics-scene-image]");
  const truckLayer = route.locator("[data-home-logistics-truck-layer]");

  await expect(route).toHaveAttribute("data-logistics-layered", "false");
  await expect(route).toHaveAttribute("data-logistics-motion", "reduced");
  await expect(scene).toHaveCSS("opacity", "1");
  await expect(truckLayer).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
