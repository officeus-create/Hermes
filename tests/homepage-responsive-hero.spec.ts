import { expect, test } from "@playwright/test";

test("homepage entry uses four directional visual scenes and keeps the canonical social preview", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /https:\/\/hermeslogisticsus\.com\/_astro\/hermes-ecosystem-hero\.[^/]+\.jpg/,
  );

  const rooms = page.locator(".home-room");
  const roomImages = page.locator(".home-room-image");
  await expect(rooms).toHaveCount(4);
  await expect(roomImages).toHaveCount(4);

  for (let index = 0; index < 4; index += 1) {
    await rooms.nth(index).scrollIntoViewIfNeeded();
    if (index > 0) {
      await expect(rooms.nth(index)).toHaveAttribute("data-image-ready", "true");
    }
    await expect.poll(() =>
      roomImages.nth(index).evaluate((node) => getComputedStyle(node as HTMLElement).backgroundImage),
    ).toMatch(/^url\(/);
  }

  await expect(page.locator('link[rel="preload"][href*="hermes-ecosystem-hero"]')).toHaveCount(0);
  await expect(page.locator(".hero-media picture")).toHaveCount(0);
});
