import { expect, test } from "@playwright/test";

const ukRoute = "/ua/academy/marketing/";
const enRoute = "/academy/marketing/";

const assertUkrainianOwner = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${ukRoute}`);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${enRoute}`);
  await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${ukRoute}`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${enRoute}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/маркетинг/i);
  const primary = page.getByRole("link", { name: /^Подати заявку$/ }).first();
  await expect(primary).toHaveAttribute("href", "/ua/academy/apply/?program=marketing&language=uk#contact");
};

test("Ukrainian Marketing owner is indexable, reciprocal and usable on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(ukRoute, { waitUntil: "networkidle" });
  await assertUkrainianOwner(page);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "artifacts/academy-ukrainian-marketing/desktop-1440.png", fullPage: true });
});

test("Ukrainian Marketing owner keeps its primary funnel usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ukRoute, { waitUntil: "networkidle" });
  await assertUkrainianOwner(page);

  const primary = page.getByRole("link", { name: /^Подати заявку$/ }).first();
  const box = await primary.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "artifacts/academy-ukrainian-marketing/mobile-390.png", fullPage: true });
});

test("English Marketing owner reciprocates Ukrainian hreflang", async ({ page }) => {
  await page.goto(enRoute, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${enRoute}`);
  await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${ukRoute}`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${enRoute}`);
});
