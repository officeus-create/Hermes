import { expect, test } from "@playwright/test";

const cases = [
  {
    slug: "en-logistics",
    route: "/academy/us-logistics-operations/",
    eligibility: /B2 level or higher/,
    compliance: /sanctions/i,
  },
  {
    slug: "en-marketing",
    route: "/academy/marketing/",
    eligibility: /Russian or Ukrainian/,
    compliance: /sanctions/i,
  },
  {
    slug: "ua-logistics",
    route: "/ua/academy/us-logistics-operations/",
    eligibility: /B2 або вище/,
    compliance: /санкц/i,
  },
];

for (const item of cases) {
  test(`${item.slug} desktop eligibility preview`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(item.route, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toContainText(item.eligibility);
    await expect(page.locator("body")).toContainText(item.compliance);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `artifacts/academy-eligibility/${item.slug}-desktop.png`, fullPage: true });
  });

  test(`${item.slug} mobile eligibility preview`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(item.route, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toContainText(item.eligibility);
    await expect(page.locator("body")).toContainText(item.compliance);
    const primary = page.locator("a.button.button-primary").first();
    await expect(primary).toBeVisible();
    const box = await primary.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `artifacts/academy-eligibility/${item.slug}-mobile-390.png`, fullPage: true });
  });
}
