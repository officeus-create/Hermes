import { expect, test } from "@playwright/test";

const representativeRoutes = [
  "/gb/london/",
  "/gb/london/seo-services/",
  "/gb/london/it-web-development/",
  "/gb/london/us-logistics-training/",
  "/gb/london/academy/",
  "/gb/london/academy/freight-dispatcher-training/",
  "/ru/gb/london/",
  "/ru/gb/london/marketing/",
  "/ua/gb/london/",
  "/ua/gb/london/marketing/",
];

for (const route of representativeRoutes) {
  test(`London mobile layout stays readable and crawl-safe: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route, { waitUntil: "domcontentloaded" });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    const images = page.locator("img");
    const imageCount = await images.count();
    for (let index = 0; index < imageCount; index += 1) {
      await expect(images.nth(index)).toHaveAttribute("alt", /\S/);
    }

    const primaryCtas = page.locator("a.button-primary:visible, button.button-primary:visible");
    const ctaCount = await primaryCtas.count();
    for (let index = 0; index < ctaCount; index += 1) {
      const box = await primaryCtas.nth(index).boundingBox();
      expect(box, `visible primary CTA should have a measurable box on ${route}`).not.toBeNull();
      if (box) expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
}

test("Russian London navigation stays inside the Russian market graph", async ({ page }) => {
  await page.goto("/ru/gb/london/", { waitUntil: "domcontentloaded" });
  for (const href of [
    "/ru/gb/london/marketing/",
    "/ru/gb/london/it-web-development/",
    "/ru/gb/london/us-logistics-training/",
  ]) {
    await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
  }

  for (const section of ["marketing", "it-web-development", "us-logistics-training"]) {
    await page.goto(`/ru/gb/london/${section}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/ru/gb/london/"]')).toBeVisible();
  }
});

test("Ukrainian London navigation stays inside the Ukrainian market graph", async ({ page }) => {
  await page.goto("/ua/gb/london/", { waitUntil: "domcontentloaded" });
  for (const href of [
    "/ua/gb/london/marketing/",
    "/ua/gb/london/it-web-development/",
    "/ua/gb/london/us-logistics-training/",
  ]) {
    await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
  }

  for (const section of ["marketing", "it-web-development", "us-logistics-training"]) {
    await page.goto(`/ua/gb/london/${section}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/ua/gb/london/"]')).toBeVisible();
  }
});
