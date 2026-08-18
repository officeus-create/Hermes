import { expect, test } from "@playwright/test";

const previewPath = "/demos/geo-answer-surface/";

test("GEO answer surface is noindex, layered, and explicitly demo-labeled", async ({ page }) => {
  await page.goto(previewPath);

  await expect(page).toHaveTitle(/GEO Answer Surface Preview/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow,noarchive");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("What should a car-hauling owner-operator compare");
  await expect(page.getByText("GEO PREVIEW · DEMO · CEO APPROVAL REQUIRED")).toBeVisible();
  await expect(page.locator(".geo-entity-card")).toHaveCount(4);
  await expect(page.locator(".geo-relationship-row")).toHaveCount(3);
  await expect(page.locator(".geo-evidence-claim")).toHaveCount(3);
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('"@type":"Question"');
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('"@type":"Answer"');

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).not.toContain(previewPath);
});

test("guided GEO path reveals one realization and a contextual outcome", async ({ page }) => {
  await page.goto(previewPath);

  const guided = page.locator("[data-geo-guided]");
  await expect(guided.locator('[data-question-id="goal"]')).toBeVisible();
  await guided.getByRole("button", { name: "Broker setup readiness" }).click();
  await expect(guided.locator("[data-guided-realization]")).toContainText("setup friction");
  await expect(guided.locator('[data-outcome-id="setup-route"]')).toBeVisible();
  await expect(guided.getByRole("heading", { name: "Readiness-first route" })).toBeVisible();
  await expect(guided.getByRole("link", { name: "Open broker setup checklist" })).toHaveAttribute(
    "href",
    "/logistics/resources/broker-setup-packet-checklist/",
  );

  await guided.getByRole("button", { name: "Start again" }).click();
  await expect(guided.locator('[data-question-id="goal"]')).toBeVisible();

  await guided.getByRole("button", { name: "Support without losing control" }).click();
  await expect(guided.locator('[data-question-id="priority"]')).toBeVisible();
  await guided.getByRole("button", { name: "Control" }).click();
  await expect(guided.getByRole("heading", { name: "Control-first route" })).toBeVisible();
});

test("GEO preview remains readable at 390px without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(previewPath);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".geo-thread li").first()).toBeVisible();
  await expect(page.locator(".geo-entity-card").first()).toBeVisible();
  await expect(page.locator(".geo-choice").first()).toBeVisible();
});