import { expect, test } from "@playwright/test";

const insightRoute = "/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", routeHandler => {
    const url = new URL(routeHandler.request().url());
    return url.hostname === "127.0.0.1" ? routeHandler.continue() : routeHandler.abort();
  });
});

test("MZM Insight returns commercial intent to the client and exposes verifiable evidence sources", async ({ page }) => {
  await page.goto(insightRoute, { waitUntil: "domcontentloaded" });

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
  await expect(page.getByRole("link", { name: /Visit MZM Junk Removal/i }).first()).toHaveAttribute(
    "href",
    "https://mzm-junk-removal.com/",
  );

  const evidence = page.locator(".insight-evidence-links");
  await expect(evidence).toBeVisible();
  for (const href of [
    "https://mzm-junk-removal.com/",
    "https://mzm-junk-removal.com/junk-removal-sacramento",
    "https://mzm-junk-removal.com/junk-removal-rancho-cordova",
    "https://mzm-junk-removal.com/junk-removal-citrus-heights",
    "https://mzm-junk-removal.com/junk-removal-rocklin",
    "https://mzm-junk-removal.com/junk-removal-orangevale",
  ]) {
    await expect(evidence.locator(`a[href="${href}"]`)).toHaveCount(1);
  }

  await expect(page.locator("main")).toContainText("Ranking, leads and revenue stay UNKNOWN");
});
