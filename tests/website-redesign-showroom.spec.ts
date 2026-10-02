import { expect, test } from "@playwright/test";

test("website redesign explains controlled change without changing the canonical owner", async ({ page }) => {
  await page.goto("/services/website-redesign/");

  const showroom = page.locator("[data-redesign-showroom]");
  await expect(showroom).toBeVisible();
  await expect(page.getByRole("heading", { name: "See how an existing website changes without throwing away what already works." })).toBeVisible();

  const expected = [
    ["Existing site", "Start with the real website, not a blank canvas."],
    ["Diagnose", "Separate proven friction from visual preference."],
    ["IA + design system", "Plan the new structure without losing useful ownership."],
    ["Responsive prototype", "Show the changed experience before release."],
    ["Regression + human review", "Compare old and new before anything replaces production."],
    ["Controlled release + measure", "Release carefully, read back production, then measure."],
  ];

  for (const [label, heading] of expected) {
    const step = showroom.getByRole("button", { name: label, exact: false });
    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(showroom.getByRole("heading", { name: heading })).toBeVisible();
  }

  await expect(page.locator('a[href="/case/it-development/"]').filter({ hasText: "Review the Hermes website case" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/website-redesign/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.getByRole("heading", { name: "Website Redesign Built Around Business Priorities" })).toBeVisible();
});

test.describe("website redesign showroom mobile contract", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("remains readable and usable at 390px", async ({ page }) => {
    await page.goto("/services/website-redesign/");
    const showroom = page.locator("[data-redesign-showroom]");
    await expect(showroom).toBeVisible();

    await showroom.getByRole("button", { name: "Regression + human review", exact: false }).tap();
    await expect(showroom.getByRole("heading", { name: "Compare old and new before anything replaces production." })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
