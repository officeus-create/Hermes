import { expect, test } from "@playwright/test";

const isGoogleAnalyticsRequest = (url: string) =>
  /https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com)\//.test(url);

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
  expect(analyticsRequests).toEqual([]);
});

test("analytics loads only after explicit allow and preferences can be reopened", async ({ page }) => {
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

  await page.getByRole("button", { name: "Privacy settings" }).click();
  await expect(page.getByRole("heading", { name: "Choose whether to allow website analytics." })).toBeVisible();
});
