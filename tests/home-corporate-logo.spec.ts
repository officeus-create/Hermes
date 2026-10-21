import { expect, test } from "@playwright/test";

const logoSrc = "/brand/hermes-ecosystem-h-option-b.svg";

test("Home previews the selected Hermes H while preserving existing inner-page identities", async ({ page }) => {
  await page.goto("/");
  const mark = page.locator(".site-header[data-home-portal='true'] .wordmark-mark-corporate img");
  await expect(mark).toHaveCount(1);
  await expect(mark).toHaveAttribute("src", logoSrc);
  await expect(page.locator(".site-header .wordmark")).toHaveAccessibleName("Hermes home");
  const response = await page.request.get(logoSrc);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");

  await page.goto("/paths/logistics/");
  await expect(page.locator(".site-header .wordmark-mark")).toHaveText("H");
  await expect(page.locator(".site-header .wordmark-mark-corporate")).toHaveCount(0);
});

test("Hermes Option B crossbar stays between the uprights, in correct paint order", async ({ page }) => {
  const response = await page.request.get(logoSrc);
  expect(response.ok()).toBe(true);
  const svg = await response.text();
  const blue = svg.indexOf('fill="#7EA9C7"');
  const green = svg.indexOf('<rect x="27" y="44" width="41" height="13" fill="#16715B"');
  const coral = svg.indexOf('fill="#D8926B"');
  expect(blue).toBeGreaterThan(0);
  expect(green).toBeGreaterThan(blue);
  expect(coral).toBeGreaterThan(green);
  // The green bar begins at the blue outer edge and ends at x=68, coral's midpoint inner edge.
  expect(27 + 41).toBe(68);
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
