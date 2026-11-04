import { expect, test } from "@playwright/test";

const logoSrc = "/brand/hermes-mark.svg";

test("Home and approved Directions share Hermes H v1.1 while product surfaces keep their own identity", async ({ page }) => {
  await page.goto("/");
  const homeMark = page.locator(".site-header[data-home-portal='true'] .wordmark-mark-corporate img");
  await expect(homeMark).toHaveCount(1);
  await expect(homeMark).toHaveAttribute("src", logoSrc);
  await expect(page.locator(".site-header .wordmark")).toHaveAccessibleName("Hermes home");
  const response = await page.request.get(logoSrc);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");

  for (const path of ["/paths/logistics/", "/paths/technology/", "/paths/academy/", "/paths/marketing/"]) {
    await page.goto(path);
    const directionMark = page.locator(".site-header .wordmark-mark-corporate img");
    await expect(directionMark).toHaveCount(1);
    await expect(directionMark).toHaveAttribute("src", logoSrc);
    await expect(page.locator(".site-header .hermes-connect-header-launcher")).toHaveCount(0);
    // Desktop and mobile Products menus both render (mobile lives in the collapsed menu).
    await expect(page.locator(".site-header .desktop-products-menu[data-hermes-products]")).toHaveCount(1);
    await expect(page.locator(".site-header .mobile-products-menu[data-hermes-products]")).toHaveCount(1);
  }

  await page.goto("/paths/technology/");
  await expect(page.locator('.desktop-nav a[href="/paths/technology/"]')).toHaveText("Technology");

  await page.goto("/services/hermes-connect/");
  // Connect product pages carry the same Hermes brand mark (owner directive 2026-10-27), next to the Connect launcher.
  await expect(page.locator(".site-header .wordmark-mark-corporate img")).toBeVisible();
  await expect(page.locator(".site-header .hermes-connect-header-launcher")).toHaveCount(1);
});

test("Approved H v1.1 crossbar follows the left upright and remains in correct paint order", async ({ page }) => {
  const response = await page.request.get(logoSrc);
  expect(response.ok()).toBe(true);
  const svg = await response.text();
  const blue = svg.indexOf('d="M24,18 L42,18');
  const green = svg.indexOf('d="M22.875,42 L59.4,42');
  const coral = svg.indexOf('d="M58,18 L76,18');
  expect(blue).toBeGreaterThan(0);
  expect(green).toBeGreaterThan(blue);
  expect(coral).toBeGreaterThan(green);
  expect(svg).toContain('Q22.725,50 22.875,42');
});

for (const width of [390, 430, 768, 1024, 1440]) {
  test(`Home logo stays present without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".wordmark-mark-corporate img")).toBeVisible();
    const size = await page.locator(".wordmark-mark-corporate").evaluate((node) => {
      const box = node.getBoundingClientRect();
      return { width: box.width, height: box.height, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    });
    expect(size.width).toBeGreaterThanOrEqual(32);
    expect(size.height).toBeGreaterThanOrEqual(32);
    expect(size.overflow).toBe(false);
  });
}
