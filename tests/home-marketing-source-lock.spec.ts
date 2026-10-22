import { expect, test } from "@playwright/test";

test("Marketing source lock requires authentic local media and no false UI claims", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const route=page.locator('[data-route-id="marketing"]');
  await expect(route.locator("[data-home-marketing-cinematic]")).toHaveCount(1);
  await expect(route.locator('[data-home-marketing-cinematic] img')).toHaveAttribute("src","/media/home/marketing-film-v2-poster.jpg");
  await expect(route.locator("[data-home-marketing-journey]")).toHaveCount(0);
  await expect(route.locator('[data-home-explainer]')).toHaveCount(0);
  await expect(route.locator(".home-moving-leaves")).toHaveCount(0);
  await route.scrollIntoViewIfNeeded();
  await expect.poll(async () => route.locator("[data-home-marketing-cinematic] source").getAttribute("src")).toBe("/media/home/marketing-film-v2-540.mp4");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Marketing source-lock fallback stays visible without video downloads in reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const route=page.locator('[data-route-id="marketing"]');
  await route.scrollIntoViewIfNeeded();
  await expect(route.locator('[data-home-marketing-cinematic] img')).toBeVisible();
  await expect(route.locator('[data-home-marketing-cinematic] source')).not.toHaveAttribute("src",/.+/);
  await expect(route.locator('[data-home-marketing-cinematic] video')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
