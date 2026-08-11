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

  // Wait for the initial GA4 collect request created while consent is explicitly granted.
  // Without this synchronization, that allowed page-view request can start after the
  // withdrawal baseline is captured and make the test misclassify it as post-withdrawal traffic.
  await expect.poll(() => analyticsRequests.some(isHermesGaCollectRequest)).toBe(true);

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