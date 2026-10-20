import { expect, test } from "@playwright/test";

test("four portals remain still until hovered and only hovered film plays", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto("/");
  const routes = page.locator("[data-home-route]");
  await expect(routes).toHaveCount(4);
  for (const route of await routes.all()) await expect(route).toHaveAttribute("data-home-portal-active", "false");
  for (const id of ["logistics", "technology", "academy", "marketing"]) {
    const route = page.locator(`[data-route-id="${id}"]`);
    await route.hover();
    await expect(route).toHaveAttribute("data-home-portal-active", "true");
    await expect(page.locator('[data-home-route][data-home-portal-active="true"]')).toHaveCount(1);
    const video = route.locator("video").first();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 15000 }).toBeGreaterThan(0.1);
  }
  await page.mouse.move(0, 0);
  await expect(page.locator('[data-home-route][data-home-portal-active="true"]')).toHaveCount(0);
  for (const video of await page.locator("[data-home-route] video").all()) {
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  }
});

test("sound requires an explicit toggle; hovering alone never enables it", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator("[data-home-sound-toggle]");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.locator('[data-route-id="academy"]').hover();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("reduced motion prevents all portal playback even when hovered", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const movieRequests: string[] = [];
  page.on("request", r => { if (r.url().includes("/media/home/") && r.url().endsWith(".mp4")) movieRequests.push(r.url()); });
  for (const route of await page.locator("[data-home-route]").all()) {
    await route.hover();
    await expect(route).toHaveAttribute("data-home-portal-active", "false");
  }
  expect(movieRequests).toEqual([]);
});

test("evidence cards keep original semantic links and direction order", async ({ page }) => {
  await page.goto("/");
  const order = await page.locator("[data-proof-direction]").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-proof-direction")));
  expect(order).toEqual(["logistics", "technology", "academy", "marketing"]);
  await expect(page.locator("[data-home-proof-decision] [data-proof-service]")).toHaveCount(4);
  await expect(page.locator("[data-home-proof-decision] [data-proof-evidence]")).toHaveCount(4);
});
