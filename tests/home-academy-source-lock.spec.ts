import { expect, test } from "@playwright/test";

test("Academy uses the Claude v3 human training film without new decorative books", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="academy"]');
  const scene = route.locator("[data-home-academy-cinematic]");
  const proof = route.locator('[data-home-pillar-proof="progress"]');
  await route.scrollIntoViewIfNeeded();
  await expect(scene).toBeVisible();
  await expect(scene.locator("img")).toHaveAttribute("src", "/media/home/academy-claude-v3-poster.jpg");
  await expect(scene.locator("video")).toHaveAttribute("poster", "/media/home/academy-claude-v3-poster.jpg");
  await expect(scene.locator("source")).toHaveAttribute("data-desktop-src", "/media/home/academy-claude-v3.mp4");
  await expect(route).toHaveAttribute("href", "/paths/academy/");

  await expect(route.locator("[data-home-academy-human]")).toHaveCount(0);
  await expect(route.locator(".home-academy-human")).toHaveCount(0);
  await expect(route.locator(".home-academy-book")).toHaveCount(0);
  await expect(proof).toBeHidden();
  await expect(proof).toHaveAttribute("data-academy-source", "/services/hermes-connect/academy/");
  await expect(proof.locator(".home-academy-state")).toHaveCount(4);
  await expect(proof).toContainText("TASK + PRACTICE");
  await expect(proof).toContainText("HUMAN FEEDBACK");
  await expect(proof).toContainText("RETRY");
  await expect(proof).toContainText("PROGRESSION");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Academy keeps the exact static film frame and native route at 390px reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="academy"]');
  const scene = route.locator("[data-home-academy-cinematic]");
  await route.scrollIntoViewIfNeeded();
  await expect(scene.locator("img")).toBeVisible();
  await expect(scene.locator("source")).not.toHaveAttribute("src", /.+/);
  await expect(scene.locator("video")).toBeHidden();
  await expect(scene).toHaveAttribute("data-media-state", "poster");
  await expect(route.locator('[data-home-pillar-proof="progress"]')).toBeHidden();
  await expect(route.locator(".home-master-route-copy strong")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
