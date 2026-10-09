import { expect, test } from "@playwright/test";

const insightRoute = "/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.hostname === "127.0.0.1" ? route.continue() : route.abort();
  });
});

test("MZM Insight keeps client ownership, visible evidence, and bounded referral measurement", async ({ page }) => {
  await page.goto(insightRoute, { waitUntil: "domcontentloaded" });

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index,follow,max-image-preview:large",
  );

  const primary = page.getByRole("link", { name: /Visit MZM Junk Removal/i }).first();
  await expect(primary).toHaveAttribute("href", "https://mzm-junk-removal.com/");
  await expect(primary).toHaveAttribute("data-insight-source-cta", "true");

  const evidence = page.locator(".insight-evidence-sources");
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

  await page.evaluate(() => {
    (window as any).__mzmAnalyticsEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      (window as any).__mzmAnalyticsEvents.push((event as CustomEvent).detail);
    });
    document.querySelector("[data-insight-source-cta=true]")?.addEventListener(
      "click",
      (event) => event.preventDefault(),
      { once: true },
    );
  });

  await primary.click();
  const events = await page.evaluate(() => (window as any).__mzmAnalyticsEvents);
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    name: "insight_source_click",
    page_group: "insights",
    module_id: "verified_source_cta",
    page_path: insightRoute,
    source_host: "mzm-junk-removal.com",
  });
  for (const forbidden of ["email", "phone", "postal_code", "address", "customer_name"]) {
    expect(events[0]).not.toHaveProperty(forbidden);
  }

  await expect(page.locator("main")).toContainText("Ranking, leads and revenue stay UNKNOWN");
});
