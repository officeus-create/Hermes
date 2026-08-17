import { expect, test } from "@playwright/test";

test("homepage hero uses responsive modern assets without the obsolete JPEG preload", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /https:\/\/hermeslogisticsus\.com\/_astro\/hermes-ecosystem-hero\.[^/]+\.jpg/,
  );

  const picture = page.locator(".hero-media picture");
  await expect(picture).toHaveCount(1);

  const avif = picture.locator('source[type="image/avif"]');
  const webp = picture.locator('source[type="image/webp"]');
  await expect(avif).toHaveCount(1);
  await expect(webp).toHaveCount(1);

  const avifSrcset = await avif.getAttribute("srcset");
  const webpSrcset = await webp.getAttribute("srcset");
  expect(avifSrcset).toContain("640w");
  expect(avifSrcset).toContain("1920w");
  expect(webpSrcset).toContain("640w");
  expect(webpSrcset).toContain("1920w");

  const image = picture.locator("img");
  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveAttribute("fetchpriority", "high");
  await expect(image).toHaveAttribute("sizes", "(max-width: 1040px) 100vw, 55vw");
  await expect(image).toHaveAttribute("width", "2200");
  await expect(image).toHaveAttribute("height", "1238");

  await expect(page.locator('link[rel="preload"][href*="hermes-ecosystem-hero"]')).toHaveCount(0);
});
