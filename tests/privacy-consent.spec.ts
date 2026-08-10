import { expect, test } from "@playwright/test";

const analyticsRequest = (url: string) =>
  url.includes("googletagmanager.com/gtag/js") || url.includes("google-analytics.com/") || url.includes("google.com/g/collect");

test("fresh visitor receives no analytics request before making a choice", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (analyticsRequest(request.url())) analyticsRequests.push(request.url());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-privacy-consent]");
  await expect(panel).toBeVisible();
  await page.waitForTimeout(500);

  expect(analyticsRequests).toEqual([]);
  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(0);
});

test("necessary-only choice persists without loading GA4 and settings remain reopenable", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (analyticsRequest(request.url())) analyticsRequests.push(request.url());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Necessary only" }).click();
  await expect(page.locator("[data-privacy-consent]")).toBeHidden();
  await expect(page.getByRole("button", { name: "Privacy settings" })).toBeVisible();

  const choice = await page.evaluate(() => JSON.parse(localStorage.getItem("hermes-privacy-consent-v1") || "null"));
  expect(choice).toMatchObject({ version: 1, analytics: false });
  expect(analyticsRequests).toEqual([]);
  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(0);

  await page.getByRole("button", { name: "Privacy settings" }).click();
  await expect(page.locator("[data-privacy-consent]")).toBeVisible();
});

test("analytics choice dynamically installs the single approved GA4 loader", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Accept analytics" }).click();

  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveCount(1);
  await expect(page.locator('script[data-hermes-ga4="true"]')).toHaveAttribute(
    "src",
    "https://www.googletagmanager.com/gtag/js?id=G-RY26321PVW",
  );
  const choice = await page.evaluate(() => JSON.parse(localStorage.getItem("hermes-privacy-consent-v1") || "null"));
  expect(choice).toMatchObject({ version: 1, analytics: true });
  await expect(page.getByRole("button", { name: "Privacy settings" })).toBeVisible();
});
