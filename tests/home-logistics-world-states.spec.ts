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
  const video = route.locator('[data-home-cinematic-video="logistics"]');
  await expect(world).toHaveAttribute("data-logistics-weather-state", "sun");
  await expect(world).toHaveAttribute("data-logistics-echo-motion", "reduced");
  await expect(route.locator(".home-logistics-weather")).toHaveCSS("animation-name", "none");
  await expect(video).toHaveCSS("display", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});


test("Logistics golden scene stays coherent and local without split vehicle layers", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const slot = route.locator('[data-home-cinematic-slot="logistics"]');

  await expect(slot).toHaveAttribute("data-cinematic-source-policy", "local-only");
  await expect(route.locator("[data-home-logistics-scene-image]")).toHaveCount(1);
  const video = route.locator('[data-home-cinematic-video="logistics"]');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute("poster", "/images/logistics-living/car-hauler-512.webp");
  await expect(video.locator("source")).toHaveAttribute("src", "/media/home/logistics-golden-v1.mp4");
  await expect(video.locator("source")).toHaveAttribute("type", "video/mp4");
  const videoContract = await video.evaluate((node: HTMLVideoElement) => ({
    autoplay: node.autoplay,
    muted: node.muted,
    loop: node.loop,
    playsInline: node.playsInline,
    preload: node.preload,
  }));
  expect(videoContract).toEqual({ autoplay: true, muted: true, loop: true, playsInline: true, preload: "metadata" });
  const mediaResponse = await request.get("/media/home/logistics-golden-v1.mp4");
  expect(mediaResponse.ok()).toBeTruthy();
  expect(mediaResponse.headers()["content-type"]).toContain("video/mp4");
  await expect(route.locator("[data-home-logistics-road-plate]")).toHaveCount(0);
  await expect(route.locator("[data-home-logistics-truck-layer]")).toHaveCount(0);
  await expect(route.locator(".home-logistics-road-plate")).toHaveCount(0);
  await expect(route.locator(".home-logistics-truck-layer")).toHaveCount(0);
  await expect(route.locator(".home-road-flow")).toHaveCount(0);
  await expect(route.locator('[data-home-explainer="logistics"]')).toHaveCSS("display", "none");

  const externalMedia = await route.locator("img, video, source").evaluateAll((nodes) =>
    nodes
      .flatMap((node) => [node.getAttribute("src"), node.getAttribute("srcset")])
      .filter((value): value is string => Boolean(value))
      .filter((value) => /^https?:\/\//i.test(value)),
  );
  expect(externalMedia).toEqual([]);
});
