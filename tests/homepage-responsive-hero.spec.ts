import { expect, test } from "@playwright/test";

test("homepage entry uses four restrained direction pillars and keeps the canonical social preview", async ({ page }) => {
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

  const visual = await rooms.evaluateAll((nodes) => nodes.map((node) => {
    const element = node as HTMLElement;
    const image = element.querySelector<HTMLElement>(".home-room-image");
    const style = getComputedStyle(element);
    return {
      accent: element.style.getPropertyValue("--room-accent"),
      imageDisplay: image ? getComputedStyle(image).display : "",
      topBorder: parseFloat(style.borderTopWidth),
      leftBorder: parseFloat(style.borderLeftWidth),
    };
  }));

  expect(new Set(visual.map((item) => item.accent)).size).toBe(4);
  expect(visual.every((item) => item.imageDisplay === "none")).toBe(true);
  expect(visual.every((item) => Math.max(item.topBorder, item.leftBorder) >= 6)).toBe(true);

  await expect(page.locator('link[rel="preload"][href*="hermes-ecosystem-hero"]')).toHaveCount(0);
  await expect(page.locator(".hero-media picture")).toHaveCount(0);
});
