import { expect, test } from "@playwright/test";

test("Academy preserves the approved visual source and reviewed progression at 1440", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="academy"]');
  const proof = route.locator('[data-home-pillar-proof="progress"]');
  await route.scrollIntoViewIfNeeded();

  const picture = route.locator(".home-portal-art picture");
  const image = picture.locator("img");
  await expect(picture).toHaveCount(1);
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", "/images/home-20261001/academy-512.webp");
  await expect(image).toHaveAttribute("srcset", /academy-512\.webp 512w, \/images\/home-20261001\/academy-887\.webp 887w/);

  await expect(route.locator("[data-home-academy-human]")).toHaveCount(0);
  await expect(route.locator(".home-academy-human")).toHaveCount(0);
  await expect(route.locator(".home-academy-book")).toHaveCount(0);
  await expect(route.locator('img[src*="academy-learner-owner-reference"]')).toHaveCount(0);

  await expect(proof).toHaveAttribute("data-academy-source", "/services/hermes-connect/academy/");
  await expect(proof.locator(".home-academy-state")).toHaveCount(4);
  await expect(proof).toContainText("TASK + PRACTICE");
  await expect(proof).toContainText("HUMAN FEEDBACK");
  await expect(proof).toContainText("RETRY");
  await expect(proof).toContainText("PROGRESSION");
  await expect(proof).toContainText("NEXT STEP");

  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Academy keeps approved source and all progression meaning at 390 reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="academy"]');
  const proof = route.locator('[data-home-pillar-proof="progress"]');
  await route.scrollIntoViewIfNeeded();

  await expect(route.locator(".home-portal-art picture img")).toBeVisible();
  await expect(route.locator("[data-home-academy-human]")).toHaveCount(0);
  await expect(route.locator(".home-academy-book")).toHaveCount(0);
  await expect(proof).toHaveAttribute("data-motion-state", "reduced");
  await expect(proof.locator(".home-academy-state")).toHaveCount(4);
  await expect(proof.locator(".home-academy-state").first()).toHaveCSS("animation-name", "none");
  await expect(proof).toContainText("TASK");
  await expect(proof).toContainText("PRACTICE");
  await expect(proof).toContainText("FEEDBACK");
  await expect(proof).toContainText("NEXT STEP");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
