import { expect, test } from "@playwright/test";

test.describe("owner-approved design polish 2026-09-02", () => {
  test("public direction keeps rounded header and routes Hermes Connect to Product Hub", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/paths/marketing/");

    const header = page.locator(".site-header");
    await expect(header).toBeVisible();
    expect(parseFloat(await header.evaluate((node) => getComputedStyle(node).borderRadius))).toBeGreaterThanOrEqual(20);

    const launcher = page.locator('[data-hermes-connect-launcher="header"]');
    await expect(launcher).toBeVisible();
    await expect(launcher).toContainText("Hermes Connect");
    await expect(launcher).toHaveAttribute("href", /\/services\/hermes-connect\/$/);
  });

  test("Product Hub-first exists in server HTML without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.goto("/paths/technology/");
    await expect(page.locator('[data-hermes-connect-launcher="header"]')).toHaveAttribute("href", "/services/hermes-connect/");
    await context.close();
  });

  test("Hermes Connect keeps corporate navigation plus sticky Product Family navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/services/hermes-connect/");

    const corporateNav = page.locator(".site-header .desktop-nav");
    await expect(corporateNav).toBeVisible();
    await expect(corporateNav).toContainText("Logistics");
    await expect(corporateNav).toContainText("Marketing");
    await expect(corporateNav).toContainText("Academy");

    const family = page.locator("[data-hc-product-context]");
    await expect(family).toBeVisible();
    await expect(family).toContainText("Product Hub");
    await expect(family).toContainText("Repair Shops");
    await expect(family).toHaveCSS("position", "sticky");
  });

  test("Russian Product Hub shows compact RU selector, correct active language, and contained hero copy", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/services/hermes-connect/?lang=ru");

    const language = page.locator("[data-language-menu]");
    await expect(language.locator("summary span")).toHaveText("RU");
    await expect(language.locator('a[lang="ru"]')).toHaveAttribute("aria-current", "page");
    await expect(language.locator('a[lang="en"]')).not.toHaveAttribute("aria-current", "page");

    const title = page.locator(".hc-copy h1");
    const stage = page.locator(".hc-product-stage");
    await expect(title).toContainText("Управляйте бизнесом");
    const titleBox = await title.boundingBox();
    const stageBox = await stage.boundingBox();
    expect(titleBox).not.toBeNull();
    expect(stageBox).not.toBeNull();
    if (titleBox && stageBox && titleBox.y < stageBox.y + stageBox.height && stageBox.y < titleBox.y + titleBox.height) {
      expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(stageBox.x + 4);
    }
  });

  test("Product Hub signal steps are understandable and interactive", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/services/hermes-connect/");

    const steps = page.locator(".hc-signal-list > div");
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0)).toContainText("Capture the signal");
    await expect(steps.nth(1)).toContainText("Connect the context");
    await expect(steps.nth(2)).toContainText("Move work forward");
    await expect(steps.nth(0)).toHaveAttribute("aria-expanded", "true");
    await steps.nth(1).click();
    await expect(steps.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(steps.nth(1).locator(".hc-signal-extra")).toBeVisible();
  });

  test("Technology partnership remains readable and exposes truthful delivery proof", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/paths/technology/");

    const partnership = page.locator(".technology-partnership");
    await expect(partnership).toBeVisible();
    const heading = partnership.locator("#technology-partnership-title");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");

    const proof = page.locator(".technology-channel-proof");
    await expect(proof).toBeVisible();
    await expect(proof).toContainText("One corporate front door across four Hermes directions");
    await expect(proof).toContainText("Repair Shops is the current public live vertical");
  });

  test("polish layer preserves canonical, robots, and structured-data contracts", async ({ page }) => {
    await page.goto("/paths/technology/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/paths/technology/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);

    const structuredData = page.locator('script[type="application/ld+json"]');
    expect(await structuredData.count()).toBeGreaterThan(0);
    const payloads = await structuredData.allTextContents();
    expect(payloads.join("\n")).toContain('"@type":"Service"');
    expect(payloads.join("\n")).toContain('"@type":"BreadcrumbList"');
  });
});
