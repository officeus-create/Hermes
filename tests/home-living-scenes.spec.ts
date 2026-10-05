import { expect, test } from "@playwright/test";

test("Home keeps native routes and shows living details without layout overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Four directions." })).toBeVisible();
  await expect(page.locator(".home-scene-detail")).toHaveCount(4);
  await expect(page.locator(".home-master-stage video, .home-master-stage canvas")).toHaveCount(0);
  await expect(page.locator(".home-master-route")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".home-display-i")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".home-story-frame").first()).toHaveCSS("animation-name", "none");
});

test("Home update glow follows a dated public Insight and expires after seven days", async ({ page }) => {
  await page.addInitScript(() => { Date.now = () => Date.parse("2026-10-06T12:00:00Z"); });
  await page.goto("/");
  const insights = page.locator('.desktop-nav a[data-nav-tone="insights"]');
  await expect(insights).toHaveClass(/has-home-update/);
  await expect(insights).toHaveAttribute("aria-describedby", "home-insights-update");
  await expect(page.locator('.desktop-nav a[data-nav-tone="connect"]')).not.toHaveClass(/has-home-update/);
  await expect(page.locator('.desktop-nav a[data-nav-tone="catalog"]')).not.toHaveClass(/has-home-update/);
  const futurePage = await page.context().newPage();
  await futurePage.addInitScript(() => { Date.now = () => Date.parse("2026-10-14T12:00:00Z"); });
  await futurePage.goto("/");
  await expect(futurePage.locator('.desktop-nav a[data-nav-tone="insights"]')).not.toHaveClass(/has-home-update/);
  await futurePage.close();
});
