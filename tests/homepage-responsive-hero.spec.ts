import { expect, test } from "@playwright/test";

test("homepage entry uses four architectural system scene and keeps the canonical social preview", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /https:\/\/hermeslogisticsus\.com\/_astro\/hermes-ecosystem-hero\.[^/]+\.jpg/,
  );

  const routes = page.locator(".home-master-route");
  await expect(routes).toHaveCount(4);
  await expect(page.locator(".home-master-core")).toHaveCount(0);

  const visual = await routes.evaluateAll((nodes) =>
    nodes.map((node) => {
      const element = node as HTMLElement;
      return {
        accent: element.style.getPropertyValue("--route-accent"),
        href: element.getAttribute("href"),
      };
    }),
  );

  expect(new Set(visual.map((item) => item.accent)).size).toBe(4);
  expect(visual.map((item) => item.href)).toEqual([
    "/paths/logistics/",
    "/paths/marketing/",
    "/paths/technology/",
    "/paths/academy/",
  ]);

  await expect(page.locator('link[rel="preload"][href*="hermes-ecosystem-hero"]')).toHaveCount(0);
  await expect(page.locator(".hero-media picture")).toHaveCount(0);

  // Visual-source lock: Technology and Academy keep their approved architectural background pictures.
  // Marketing and Academy retired their stale decorative/book-heavy backgrounds, while Logistics
  // uses the owned living-equipment image directly.
  await expect(page.locator(".home-portal-art picture")).toHaveCount(2);
  await expect(page.locator(".home-master-route-technology .home-portal-art picture")).toHaveCount(1);
  await expect(page.locator(".home-master-route-marketing .home-portal-art picture")).toHaveCount(0);
  await expect(page.locator(".home-master-route-academy .home-portal-art picture")).toHaveCount(1);

  await expect(page.locator("[data-home-logistics-scene-image]")).toHaveCount(1);
  await expect(page.locator("[data-home-logistics-scene-image]")).toHaveAttribute("src", "/images/logistics-living/car-hauler-512.webp");
  // CEO-approved V4 Marketing removes decorative leaves; validate the purposeful scene instead.
  await expect(page.locator('[data-home-marketing-journey]')).toHaveCount(1);
  await expect(page.locator('[data-home-marketing-journey] .home-marketing-card')).toHaveCount(4);
  await expect(page.locator(".home-moving-leaves")).toHaveCount(0);
  await expect(page.locator(".home-master-stage video, .home-master-stage canvas")).toHaveCount(0);
});
