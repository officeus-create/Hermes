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


test("Logistics untouched CDN originals decode independently and retain a fixed road (source QA only)", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const scene = route.locator("[data-home-logistics-scene-image]");
  const roadPlate = route.locator("[data-home-logistics-road-plate]");
  const truckLayer = route.locator("[data-home-logistics-truck-layer]");
  await expect(scene).toHaveCount(1);
  await expect(roadPlate).toHaveCount(1);
  await expect(truckLayer).toHaveCount(1);

  // No src mutation or local substitution: this test exercises the actual
  // currently configured external assets, unlike the separate deterministic mock.
  const [roadURL, truckURL] = await Promise.all([
    roadPlate.getAttribute("src"), truckLayer.getAttribute("src"),
  ]);
  expect(roadURL).toMatch(/^https:\/\/[^/]+\.cloudfront\.net\/.+\.png$/);
  expect(truckURL).toMatch(/^https:\/\/[^/]+\.cloudfront\.net\/.+\.png$/);
  expect(roadURL).not.toBe(truckURL);
  await expect.poll(() => roadPlate.evaluate(n => (n as HTMLImageElement).naturalWidth), { timeout: 20000 }).toBeGreaterThan(0);
  await expect.poll(() => truckLayer.evaluate(n => (n as HTMLImageElement).naturalWidth), { timeout: 20000 }).toBeGreaterThan(0);

  await route.scrollIntoViewIfNeeded();
  await expect(route).toHaveAttribute("data-logistics-layered", "true");
  await expect(scene).toHaveCSS("opacity", "0");
  await expect(roadPlate).toHaveCSS("transform", "none");
  await expect(truckLayer).toHaveCSS("animation-name", "home-logistics-truck-drive");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  await testInfo.attach("logistics-untouched-original-source-1440.png", {
    body: await route.screenshot({ animations: "allow" }),
    contentType: "image/png",
  });
  // Image decode, animation and screenshots are technical evidence, NOT CEO
  // approval of camera angle, truck isolation, provenance, or scene composition.
});

test("Logistics CDN failure preserves the local fallback without duplicate moving subjects", async ({ page }) => {
  await page.route("https://**/*.cloudfront.net/**", async route => route.abort("failed"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const scene = route.locator("[data-home-logistics-scene-image]");
  await route.scrollIntoViewIfNeeded();
  await expect.poll(() => scene.evaluate(n => (n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(route).toHaveAttribute("data-logistics-layered", "false");
  await expect(scene).toHaveCSS("opacity", "1");
  await expect(route.locator("[data-home-logistics-road-plate]")).toHaveCSS("opacity", "0");
  await expect(route.locator("[data-home-logistics-truck-layer]")).toHaveCSS("opacity", "0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
