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

test("analytics loads only after explicit allow and can be withdrawn", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (isGoogleAnalyticsRequest(request.url())) analyticsRequests.push(request.url());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(analyticsRequests).toEqual([]);

  await page.getByRole("button", { name: "Allow analytics" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("granted");
  await expect.poll(() => analyticsRequests.some((url) => url.includes("googletagmanager.com/gtag/js?id=G-RY26321PVW"))).toBe(true);
  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(1);

  await expect.poll(() => analyticsRequests.some(isHermesGaCollectRequest)).toBe(true);

  await page.getByRole("button", { name: "Privacy settings" }).click();
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeVisible();

  const requestsAfterWithdrawal: string[] = [];
  const withdrawalListener = (request: any) => {
    if (isGoogleAnalyticsRequest(request.url())) requestsAfterWithdrawal.push(request.url());
  };

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.getByRole("button", { name: "Continue without analytics" }).click(),
  ]);

  page.on("request", withdrawalListener);

  await expect.poll(() => page.evaluate(() => localStorage.getItem("hermes-analytics-consent"))).toBe("denied");
  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeHidden();
  await page.waitForTimeout(400);
  expect(requestsAfterWithdrawal).toEqual([]);
});

test("Hermes Connect mobile consent stays compact and does not cover the primary product CTA", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/", { waitUntil: "domcontentloaded" });

  const banner = page.locator("[data-consent-banner]");
  const primaryCta = page.getByRole("link", { name: /Open Repair Shops/ });

  await expect(banner).toBeVisible();
  await expect(primaryCta).toBeVisible();
  await expect(page.getByText("Analytics is off until you choose. Advertising storage and personalization stay disabled.", { exact: false })).toBeVisible();
  await expect(page.locator(".tracking-consent-detail")).toBeHidden();
  await expect(page.getByRole("button", { name: "Allow analytics" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue without analytics" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy Policy" }).first()).toBeVisible();

  const geometry = await page.evaluate(() => {
    const bannerElement = document.querySelector<HTMLElement>("[data-consent-banner]");
    const ctaElement = document.querySelector<HTMLElement>(".hc-primary");
    const acceptElement = document.querySelector<HTMLElement>("[data-consent-accept]");
    const declineElement = document.querySelector<HTMLElement>("[data-consent-decline]");
    if (!bannerElement || !ctaElement || !acceptElement || !declineElement) return null;
    const bannerRect = bannerElement.getBoundingClientRect();
    const ctaRect = ctaElement.getBoundingClientRect();
    const acceptRect = acceptElement.getBoundingClientRect();
    const declineRect = declineElement.getBoundingClientRect();
    return {
      bannerHeight: bannerRect.height,
      bannerTop: bannerRect.top,
      ctaTop: ctaRect.top,
      ctaBottom: ctaRect.bottom,
      acceptHeight: acceptRect.height,
      declineHeight: declineRect.height,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.bannerHeight).toBeLessThanOrEqual(120);
  expect(geometry!.ctaBottom).toBeLessThanOrEqual(geometry!.bannerTop);
  expect(geometry!.acceptHeight).toBeGreaterThanOrEqual(44);
  expect(geometry!.declineHeight).toBeGreaterThanOrEqual(44);
});

test("mobile consent is compact on every public direction and privacy settings no longer float over CTAs", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/", { waitUntil: "domcontentloaded" });

  const banner = page.locator("[data-consent-banner]");
  await expect(banner).toBeVisible();
  await expect(page.locator(".tracking-consent-detail")).toBeHidden();

  const bannerHeight = await banner.evaluate((element) => element.getBoundingClientRect().height);
  expect(bannerHeight).toBeLessThanOrEqual(120);

  await page.getByRole("button", { name: "Continue without analytics" }).click();
  const settings = page.getByRole("button", { name: "Privacy settings" });
  await expect(settings).toBeVisible();
  await expect(settings).toHaveCSS("position", "static");

  const overlap = await page.evaluate(() => {
    const settingsButton = document.querySelector<HTMLElement>("[data-consent-settings]");
    const primary = document.querySelector<HTMLElement>(".detail-page-logistics .detail-hero .button-primary");
    if (!settingsButton || !primary) return null;
    const a = settingsButton.getBoundingClientRect();
    const b = primary.getBoundingClientRect();
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  });
  expect(overlap).toBe(false);
});
