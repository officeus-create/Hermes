import { expect, test } from "@playwright/test";

const route = "/ua/academy/us-logistics-operations/";

const assertCoreSeo = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/academy/us-logistics-operations/");
  await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("логістика США");
  await expect(page.getByRole("link", { name: /Подати заявку в Academy/ }).first()).toBeVisible();
};

test("Academy Ukraine desktop preview keeps canonical SEO and approved design system", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route, { waitUntil: "networkidle" });
  await assertCoreSeo(page);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({ path: "artifacts/academy-ukraine/desktop.png", fullPage: true });
});

test("Academy Ukraine 390px preview keeps the primary funnel usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route, { waitUntil: "networkidle" });
  await assertCoreSeo(page);

  const primary = page.getByRole("link", { name: /Подати заявку в Academy/ }).first();
  await expect(primary).toBeVisible();
  const primaryBox = await primary.boundingBox();
  expect(primaryBox).not.toBeNull();
  expect(primaryBox!.width).toBeGreaterThanOrEqual(44);
  expect(primaryBox!.height).toBeGreaterThanOrEqual(44);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({ path: "artifacts/academy-ukraine/mobile-390.png", fullPage: true });
});
