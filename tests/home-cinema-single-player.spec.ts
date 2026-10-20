import { expect, test } from "@playwright/test";

test("Home keeps media static on reduced motion without requesting four films", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const movieRequests: string[] = [];
  page.on("request", request => {
    if (/\/media\/home\/.*\.mp4(?:\?|$)/.test(request.url())) movieRequests.push(request.url());
  });
  await page.goto("/");
  const routes = page.locator("[data-home-route]");
  await expect(routes).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await routes.nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  expect(movieRequests).toEqual([]);
  expect(await page.locator("video").evaluateAll(videos => videos.filter(video => !(video as HTMLVideoElement).paused).length)).toBe(0);
  await expect(page.locator("[data-home-route] a")).toHaveCount(0);
  for (const id of ["logistics", "technology", "academy", "marketing"]) {
    await expect(page.locator(`[data-home-route][data-route-id="${id}"]`)).toHaveAttribute("href", `/paths/${id}/`);
  }
});

test("Mobile Home never plays more than one movie while switching scenes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const routes = page.locator("[data-home-route]");
  await expect(routes).toHaveCount(4);
  const countActive = () => page.locator("video").evaluateAll(
    videos => videos.filter(video => !(video as HTMLVideoElement).paused).length
  );
  const countLoaded = () => page.locator("video source[src]").count();
  await expect.poll(async () => await page.locator("html").getAttribute("data-home-cinema-active")).not.toBeNull();
  expect(await countActive()).toBeLessThanOrEqual(1);
  expect(await countLoaded()).toBeLessThanOrEqual(1);
  for (let i = 1; i < 4; i++) {
    await routes.nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await countActive(), `more than one movie playing at route ${i}`).toBeLessThanOrEqual(1);
  }
});

test("Save-Data retains static posters even on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true, value: { saveData: true, effectiveType: "4g" }
    });
  });
  const requests: string[] = [];
  page.on("request", request => {
    if (/\/media\/home\/.*\.mp4(?:\?|$)/.test(request.url())) requests.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-home-cinema-active", "poster");
  for (let i = 0; i < 4; i++) await page.locator("[data-home-route]").nth(i).scrollIntoViewIfNeeded();
  expect(requests).toEqual([]);
  await expect(page.locator('video source[src]')).toHaveCount(0);
});
