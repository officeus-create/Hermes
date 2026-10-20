import { expect, test } from "@playwright/test";

// Protect business-critical customer journeys during the separate homepage
// redesign. These checks never submit forms or exercise a production receiver.
test.describe("390px non-homepage commercial CTA navigation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("car-hauling dispatch primary CTA opens the actual carrier review form", async ({ page }) => {
    await page.goto("/logistics/car-hauling-dispatch/");

    const cta = page.locator(".commercial-actions [data-commercial-primary-cta]");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");

    // A real click detects sticky-header / floating-panel interception.
    await cta.click();
    await expect(page).toHaveURL(/\/logistics\/start-car-hauling-dispatch\/$/);
    await expect(page.locator("#dispatch-intake")).toBeVisible();
    await expect(page.locator('input[name="authority_number"]')).toBeVisible();
  });

  test("website redesign primary CTA opens the redesign-specific brief", async ({ page }) => {
    await page.goto("/services/website-redesign/");

    const cta = page.locator(".digital-service-actions [data-website-project-cta]");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      "href",
      "/paths/technology/?project=website_redesign#project-brief",
    );
    await cta.click();
    await expect(page).toHaveURL(/\/paths\/technology\/\?project=website_redesign#project-brief$/);
    const brief = page.locator("[data-it-project-brief]");
    await expect(brief).toBeVisible();
    await expect(brief.locator('[data-website-project-scope]')).toBeVisible();
  });

  test("website development primary CTA opens the new-website brief", async ({ page }) => {
    await page.goto("/services/website-development/");

    const cta = page.locator(".digital-service-actions [data-website-project-cta]");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      "href",
      "/paths/technology/?project=website_development#project-brief",
    );
    await cta.click();
    await expect(page).toHaveURL(/\/paths\/technology\/\?project=website_development#project-brief$/);
    const brief = page.locator("[data-it-project-brief]");
    await expect(brief).toBeVisible();
    await expect(brief.locator('[data-website-project-scope]')).toBeVisible();
  });

  test("carrier review CTA also works with keyboard activation", async ({ page }) => {
    await page.goto("/logistics/car-hauling-dispatch/");
    const cta = page.locator(".commercial-actions [data-commercial-primary-cta]");
    await cta.focus();
    await expect(cta).toBeFocused();
    await cta.press("Enter");
    await expect(page).toHaveURL(/\/logistics\/start-car-hauling-dispatch\/$/);
    await expect(page.locator("#dispatch-intake")).toBeVisible();
  });
});
