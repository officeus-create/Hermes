import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

const isGoogleAnalyticsRequest = (url: string) => {
  const hostname = new URL(url).hostname;
  return (
    hostname === "googletagmanager.com" ||
    hostname.endsWith(".googletagmanager.com") ||
    hostname === "google-analytics.com" ||
    hostname.endsWith(".google-analytics.com")
  );
};

const isHermesGaCollectRequest = (url: string) => {
  const parsed = new URL(url);
  return (
    (parsed.hostname === "google-analytics.com" || parsed.hostname.endsWith(".google-analytics.com")) &&
    parsed.pathname.endsWith("/g/collect") &&
    parsed.searchParams.get("tid") === "G-RY26321PVW"
  );
};

const rectanglesOverlap = (a: DOMRect, b: DOMRect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

test("analytics stays off before choice and after decline", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (isGoogleAnalyticsRequest(request.url())) analyticsRequests.push(request.url());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeVisible();
  await page.waitForTimeout(400);
  expect(analyticsRequests).toEqual([]);

  await page.getByRole("button", { name: "Continue without analytics" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("denied");
  await page.waitForTimeout(400);
  expect(analyticsRequests).toEqual([]);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeHidden();
  await page.waitForTimeout(400);
  expect(analyticsRequests).toEqual([]);
});

test("analytics consent uses host-appropriate transport and can be withdrawn", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (isGoogleAnalyticsRequest(request.url())) analyticsRequests.push(request.url());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(analyticsRequests).toEqual([]);

  const expectedTransport = await page.evaluate(() => {
    const productionHosts = new Set([
      "hermeslogisticsus.com",
      "www.hermeslogisticsus.com",
      "connect.hermeslogisticsus.com",
    ]);
    return productionHosts.has(window.location.hostname) ? "ga4" : "disabled-non-production";
  });

  await page.getByRole("button", { name: "Allow analytics" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("granted");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.analyticsTransport)).toBe(expectedTransport);

  if (expectedTransport === "ga4") {
    await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(1);
    await expect.poll(() => analyticsRequests.some((url) => url.includes("googletagmanager.com/gtag/js?id=G-RY26321PVW"))).toBe(true);
    await expect.poll(() => analyticsRequests.some(isHermesGaCollectRequest)).toBe(true);
  } else {
    await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(0);
    const localInstrumentation = await page.evaluate(() => ({
      hasDataLayer: Array.isArray(window.dataLayer),
      hasGtag: typeof (window as Window & { gtag?: unknown }).gtag === "function",
    }));
    expect(localInstrumentation).toEqual({ hasDataLayer: true, hasGtag: true });
    await page.waitForTimeout(400);
    expect(analyticsRequests).toEqual([]);
  }

  await page.getByRole("button", { name: "Privacy settings" }).click();
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeVisible();
  const analyticsRequestCountBeforeWithdrawal = analyticsRequests.length;

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.getByRole("button", { name: "Continue without analytics" }).click(),
  ]);

  await expect.poll(() => page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("denied");
  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeHidden();
  await page.waitForTimeout(400);
  expect(analyticsRequests).toHaveLength(analyticsRequestCountBeforeWithdrawal);
});

test("mobile consent stays compact, below the header and clear of every primary hero CTA", async ({ page }) => {
  const routes = [
    { path: "/paths/logistics/", cta: ".detail-page-logistics .detail-hero .button-primary" },
    { path: "/paths/marketing/", cta: ".detail-page-marketing .detail-hero .button-primary" },
    { path: "/paths/academy/", cta: ".detail-page-academy .detail-hero .button-primary" },
    { path: "/paths/technology/", cta: ".detail-page-technology .detail-hero .button-primary" },
    { path: "/services/hermes-connect/", cta: ".hc-primary" },
  ];

  for (const route of routes) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route.path, { waitUntil: "domcontentloaded" });

    const banner = page.locator("[data-consent-banner]");
    const primaryCta = page.locator(route.cta).first();

    await expect(banner).toBeVisible();
    await expect(primaryCta).toBeVisible();
    await expect(page.locator(".tracking-consent-detail")).toBeHidden();
    await expect(page.getByRole("button", { name: "Allow analytics" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue without analytics" })).toBeVisible();

    const geometry = await page.evaluate(({ cta }) => {
      const bannerElement = document.querySelector<HTMLElement>("[data-consent-banner]");
      const ctaElement = document.querySelector<HTMLElement>(cta);
      const acceptElement = document.querySelector<HTMLElement>("[data-consent-accept]");
      const declineElement = document.querySelector<HTMLElement>("[data-consent-decline]");
      if (!bannerElement || !ctaElement || !acceptElement || !declineElement) return null;
      const bannerRect = bannerElement.getBoundingClientRect();
      const ctaRect = ctaElement.getBoundingClientRect();
      const acceptRect = acceptElement.getBoundingClientRect();
      const declineRect = declineElement.getBoundingClientRect();
      const overlap = bannerRect.left < ctaRect.right && bannerRect.right > ctaRect.left && bannerRect.top < ctaRect.bottom && bannerRect.bottom > ctaRect.top;
      return {
        bannerHeight: bannerRect.height,
        bannerTop: bannerRect.top,
        bannerBottom: bannerRect.bottom,
        ctaTop: ctaRect.top,
        ctaBottom: ctaRect.bottom,
        overlap,
        acceptHeight: acceptRect.height,
        declineHeight: declineRect.height,
      };
    }, { cta: route.cta });

    expect(geometry, route.path).not.toBeNull();
    expect(geometry!.bannerHeight, route.path).toBeLessThanOrEqual(120);
    expect(geometry!.bannerTop, route.path).toBeGreaterThanOrEqual(64);
    expect(geometry!.overlap, route.path).toBe(false);
    expect(geometry!.acceptHeight, route.path).toBeGreaterThanOrEqual(44);
    expect(geometry!.declineHeight, route.path).toBeGreaterThanOrEqual(44);

    await page.getByRole("button", { name: "Continue without analytics" }).click();
    await page.evaluate(() => localStorage.removeItem("hermes-analytics-consent"));
  }
});

test("privacy settings stays in document flow after a mobile choice", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/marketing/", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Continue without analytics" }).click();
  const settings = page.getByRole("button", { name: "Privacy settings" });
  await expect(settings).toBeVisible();
  await expect(settings).toHaveCSS("position", "static");

  const overlap = await page.evaluate(() => {
    const settingsButton = document.querySelector<HTMLElement>("[data-consent-settings]");
    const primary = document.querySelector<HTMLElement>(".detail-page-marketing .detail-hero .button-primary");
    if (!settingsButton || !primary) return null;
    return rectanglesOverlap(settingsButton.getBoundingClientRect(), primary.getBoundingClientRect());

    function rectanglesOverlap(a: DOMRect, b: DOMRect) {
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }
  });
  expect(overlap).toBe(false);
});
