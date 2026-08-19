import { expect, test } from "@playwright/test";

const applicationRoute = "/ua/academy/apply/?program=us-logistics-operations&language=uk";
const logisticsRoute = "/ua/academy/us-logistics-operations/";

test("Ukrainian Academy application keeps one localized review funnel on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(applicationRoute, { waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/ua/academy/apply/");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/academy/apply/");
  await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/ua/academy/apply/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/заявк/i);

  const form = page.locator("[data-contact-form]");
  await expect(form).toHaveCount(1);
  await expect(form.locator('select[name="path"]')).toHaveValue("Hermes Business Academy");
  await expect(form.locator('select[name="academy_program"]')).toHaveValue("us-logistics-operations");
  await expect(form.locator('[data-submit-label]')).toContainText(/заявк/i);
  await expect(form.locator('select[name="academy_english_level"]')).toHaveCount(1);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "artifacts/academy-ukrainian-application/desktop-1440.png", fullPage: true });
});

test("Ukrainian Academy application remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(applicationRoute, { waitUntil: "networkidle" });

  const form = page.locator("[data-contact-form]");
  await expect(form).toHaveCount(1);
  const submit = form.locator('button[type="submit"]');
  const box = await submit.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "artifacts/academy-ukrainian-application/mobile-390.png", fullPage: true });
});

test("Ukrainian Logistics owner routes to the localized application and preserves program/language", async ({ page }) => {
  await page.goto(logisticsRoute, { waitUntil: "networkidle" });
  const primary = page.getByRole("link", { name: /^Подати заявку$/ }).first();
  await expect(primary).toHaveAttribute("href", "/ua/academy/apply/?program=us-logistics-operations&language=uk#contact");
});
