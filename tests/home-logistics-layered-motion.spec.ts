import { expect, test } from "@playwright/test";

test("Logistics Golden Scene uses one coherent local visual owner", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const slot = route.locator('[data-home-cinematic-slot="logistics"]');
  const scene = route.locator("[data-home-logistics-scene-image]");

  await expect(slot).toHaveCount(1);
  await expect(slot).toHaveAttribute("data-cinematic-source-policy", "local-only");
  await expect(scene).toHaveCount(1);
  await expect(scene).toHaveAttribute("src", "/images/logistics-living/golden-car-hauler-512.webp");
  await expect(scene).toBeVisible();
  await expect(route).toHaveAttribute("data-logistics-motion", "running");
  await expect(route.locator("[data-home-logistics-road-plate]")).toHaveCount(0);
  await expect(route.locator("[data-home-logistics-truck-layer]")).toHaveCount(0);
  await expect(route.locator(".home-road-flow")).toHaveCount(0);
  await expect(route.locator('[data-home-explainer="logistics"]')).toHaveCSS("display", "none");

  const currentSrc = await scene.evaluate(node => (node as HTMLImageElement).currentSrc);
  expect(currentSrc).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/images\/logistics-living\/golden-car-hauler-(512|768|887)\.webp$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Logistics Golden Scene stays static and local for reduced motion", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", request => {
    const hostname = new URL(request.url()).hostname;
    if (hostname.endsWith(".cloudfront.net")) externalRequests.push(request.url());
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const scene = route.locator("[data-home-logistics-scene-image]");
  await expect(route).toHaveAttribute("data-logistics-motion", "reduced");
  await expect(scene).toBeVisible();
  await expect(scene).toHaveCSS("transform", "none");
  await expect(route.locator("[data-home-logistics-road-plate], [data-home-logistics-truck-layer]")).toHaveCount(0);
  await expect(route.locator("video")).toHaveCount(0);
  expect(externalRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Logistics Golden Frame responsive assets decode from owned local files only", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const widths = [512, 768, 887];
  const decoded = await page.evaluate(async (variants) => Promise.all(variants.map(async width => {
    const image = new Image();
    image.src = `/images/logistics-living/golden-car-hauler-${width}.webp`;
    await image.decode();
    return {
      width,
      ok: image.naturalWidth > 0 && image.naturalHeight > 0,
      currentSrc: image.currentSrc,
    };
  })), widths);

  expect(decoded.every(item => item.ok)).toBe(true);
  expect(decoded.every(item => new URL(item.currentSrc).origin === "http://127.0.0.1:4321")).toBe(true);
  await expect(page.locator('[data-home-logistics-echo]')).toHaveAttribute("data-logistics-echo-count", "1");
  await expect(page.locator('[data-home-logistics-echo]')).toHaveAttribute("data-logistics-echo-scenes", "golden-car-hauler");
  await expect(page.locator('[data-home-logistics-echo]')).not.toHaveAttribute("data-logistics-equipment-cycle-ms", /./);
});

test("Logistics keeps the integrated local fallback without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    javaScriptEnabled: false,
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    const externalRequests: string[] = [];
    page.on("request", request => {
      if (new URL(request.url()).hostname.endsWith(".cloudfront.net")) externalRequests.push(request.url());
    });
    await page.goto("/");
    const route = page.locator('[data-route-id="logistics"]');
    const scene = route.locator("[data-home-logistics-scene-image]");
    await expect(scene).toHaveCount(1);
    await scene.evaluate(node => (node as HTMLImageElement).decode());
    await expect(scene).toBeVisible();
    await expect(route.locator("[data-home-logistics-road-plate], [data-home-logistics-truck-layer]")).toHaveCount(0);
    await expect(route.locator('[data-home-explainer="logistics"]')).toHaveCSS("display", "none");
    expect(externalRequests).toEqual([]);
  } finally {
    await context.close();
  }
});
