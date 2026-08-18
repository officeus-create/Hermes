import { expect, test } from "@playwright/test";

const previewPath = "/demos/geo-car-hauling-owner/";

test("car-hauling GEO production candidate stays noindex and evidence-labeled", async ({ page }) => {
  await page.goto(previewPath);

  await expect(page).toHaveTitle(/Car Hauling GEO Owner Preview/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow,noarchive");
  await expect(page.getByText("GEO PRODUCTION CANDIDATE · PREVIEW ONLY · CEO APPROVAL REQUIRED")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("What does Hermes car-hauling dispatch support include");
  await expect(page.getByText("Hermes public website · first-party service source")).toBeVisible();
  await expect(page.getByText("It is not independent third-party proof of performance.")).toBeVisible();

  const structuredData = page.locator('script[type="application/ld+json"]');
  await expect(structuredData).toContainText('"@type":"Question"');
  await expect(structuredData).toContainText("https://hermeslogisticsus.com/#organization");
  await expect(structuredData).toContainText('"url":"https://hermeslogisticsus.com/demos/geo-car-hauling-owner/"');
  await expect(structuredData).toContainText('"@id":"https://hermeslogisticsus.com/demos/geo-car-hauling-owner/#geo-answer"');

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).not.toContain(previewPath);
});

test("car-hauling guided fit moves from recognition to contextual action", async ({ page }) => {
  await page.goto(previewPath);
  const guided = page.locator("[data-owner-guided]");

  await expect(guided.locator('[data-question="primary-bottleneck"]')).toBeVisible();
  await guided.getByRole("button", { name: "Authority or broker readiness" }).click();
  await expect(guided.locator("[data-realization]")).toContainText("upstream of load search");
  await expect(guided.getByRole("heading", { name: "Readiness-first route" })).toBeVisible();
  await expect(guided.getByRole("link", { name: "Open broker setup checklist" })).toHaveAttribute(
    "href",
    "/logistics/resources/broker-setup-packet-checklist/",
  );

  await guided.getByRole("button", { name: "Start again" }).click();
  await guided.getByRole("button", { name: "Daily load-search execution" }).click();
  await expect(guided.locator('[data-question="control-priority"]')).toBeVisible();
  await guided.getByRole("button", { name: "Keep final load control" }).click();
  await expect(guided.getByRole("heading", { name: "Control-first dispatch review" })).toBeVisible();
  await expect(guided.getByRole("link", { name: "Start carrier-specific review" })).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );
});

test("car-hauling GEO preview is readable at 390px with no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(previewPath);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".thread-node").first()).toBeVisible();
  await expect(page.locator(".entity-card").first()).toBeVisible();
  await expect(page.locator(".choices button").first()).toBeVisible();
});