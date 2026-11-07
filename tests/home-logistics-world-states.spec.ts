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

test("Logistics golden scene stays coherent and local without split vehicle layers", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="logistics"]');
  const slot = route.locator('[data-home-cinematic-slot="logistics"]');

  await expect(slot).toHaveAttribute("data-cinematic-source-policy", "local-only");
  const video = route.locator('[data-home-cinematic-video="logistics"]');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute("poster", "/images/logistics-living/car-hauler-512.webp");
  await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute("data-cinematic-src", "/media/home/logistics-film-v2-540.mp4");
  await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute("src", "/media/home/logistics-film-v2-540.mp4");
  expect(await video.evaluate((node) => {
    const media = node as HTMLVideoElement;
    return {
      autoplay: media.autoplay,
      muted: media.muted,
      loop: media.loop,
      playsInline: media.playsInline,
      preload: media.preload,
    };
  })).toEqual({
    autoplay: false,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "none",
  });
  await expect(route.locator("[data-home-logistics-scene-image]")).toHaveCount(1);
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

test("Logistics reduced motion never fetches the hidden cinematic movie", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const movieRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/media/home/logistics-film-v2-540.mp4")) movieRequests.push(request.url());
  });
  await page.goto("/");
  await page.locator('[data-route-id="logistics"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const video = page.locator('[data-home-cinematic-video="logistics"]');
  await expect(video).toBeHidden();
  await expect(video.locator("source")).not.toHaveAttribute("src", /.+/);
  expect(movieRequests).toEqual([]);
});

test("Logistics Save-Data renders the poster and never downloads video", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true, addEventListener: () => {} },
    });
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/media/home/logistics-film-v2-540.mp4")) requests.push(request.url());
  });
  await page.goto("/");
  await page.locator('[data-route-id="logistics"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator('[data-home-cinematic-video="logistics"] source')).not.toHaveAttribute("src", /.+/);
  expect(requests).toEqual([]);
});

test("Logistics attaches movie and plays once actually visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const route = page.locator('[data-route-id="logistics"]');
  const video = route.locator('[data-home-cinematic-video="logistics"]');
  const source = video.locator("source");
  await route.scrollIntoViewIfNeeded();
  await expect(source).toHaveAttribute("src", "/media/home/logistics-film-v2-540.mp4");
  await expect.poll(
    () => video.evaluate((node) => (node as HTMLVideoElement).currentTime),
    { timeout: 15000 }
  ).toBeGreaterThan(0.1);
  await expect(video).toBeVisible();
});

test("Logistics begins downloading only after motion preference changes from reduce to allow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const route = page.locator('[data-route-id="logistics"]');
  await route.scrollIntoViewIfNeeded();
  const source = route.locator('[data-home-cinematic-video="logistics"] source');
  await expect(source).not.toHaveAttribute("src", /.+/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(source).toHaveAttribute("src", "/media/home/logistics-film-v2-540.mp4");
});
