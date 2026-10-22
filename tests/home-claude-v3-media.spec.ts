import { expect, test } from "@playwright/test";

const films = [
  { id: "marketing", video: "marketing-team-v1.mp4", poster: "marketing-team-poster.jpg" },
  { id: "technology", video: "technology-claude-v3.mp4", poster: "technology-claude-v3-poster.jpg" },
  { id: "academy", video: "academy-claude-v3.mp4", poster: "academy-claude-v3-poster.jpg" },
] as const;

test("all three Claude v3 people scenes play locally and preserve native routes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const film of films) {
    const route = page.locator(`[data-route-id="${film.id}"]`);
    const stage = route.locator("[data-home-progressive-cinematic]");
    const video = stage.locator("video");
    await expect(route).toHaveAttribute("href", `/paths/${film.id}/`);
    await expect(stage.locator("img")).toHaveAttribute("src", `/media/home/${film.poster}`);
    await expect(stage.locator("source")).toHaveAttribute("data-mobile-src", `/media/home/${film.video}`);
    await stage.scrollIntoViewIfNeeded();
    await expect.poll(() => stage.getAttribute("data-media-state"), { timeout: 15000 }).toBe("ready");
    await expect(stage.locator("source")).toHaveAttribute("src", `/media/home/${film.video}`);
    const t0 = await video.evaluate(node => (node as HTMLVideoElement).currentTime);
    await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).currentTime), { timeout: 5000 }).toBeGreaterThan(t0 + 0.07);
    await expect(video).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("reduced motion loads posters but no stock video for all three scenes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const film of films) {
    const stage = page.locator(`[data-route-id="${film.id}"] [data-home-progressive-cinematic]`);
    await stage.scrollIntoViewIfNeeded();
    await expect(stage.locator("img")).toBeVisible();
    await expect(stage.locator("source")).not.toHaveAttribute("src", /.+/);
    await expect(stage.locator("video")).toBeHidden();
    await expect(stage).toHaveAttribute("data-media-state", "poster");
  }
});
