import { expect, test } from "@playwright/test";

test.describe("Academy learner handoff", () => {
  test("keeps the public Academy page canonical while exposing one subtle server-rendered learner link", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/paths/academy/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/paths/academy/");
    const handoff = page.locator(".academy-learner-handoff");
    await expect(handoff).toHaveCount(1);
    await expect(handoff).toContainText("Already learning with Hermes?");
    await expect(handoff).toHaveAttribute("href", "/services/hermes-connect/academy/");
    await expect(handoff).not.toHaveClass(/button-primary/);
  });

  test("learner handoff preserves a supported selected locale without changing canonical ownership", async ({ page }) => {
    await page.goto("/paths/academy/?lang=ru");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/paths/academy/");
    await expect(page.locator(".academy-learner-handoff")).toHaveAttribute("href", "/services/hermes-connect/academy/?lang=ru");
  });

  test("learner handoff exists without JavaScript and remains touch-safe on mobile", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/paths/academy/");
    const handoff = page.locator(".academy-learner-handoff");
    await expect(handoff).toBeVisible();
    await expect(handoff).toHaveAttribute("href", "/services/hermes-connect/academy/");
    const box = await handoff.boundingBox();
    expect(box).not.toBeNull();
    if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
});
