import { expect, test } from "@playwright/test";

test("Hermes Connect access center keeps Android behind the release gate", async ({ page }) => {
  await page.goto("/download/");

  await expect(page.getByRole("heading", { level: 1, name: "Web & PWA Access" })).toBeVisible();
  await expect(page.locator(".android-card")).toContainText("Release verification in progress");
  await expect(page.locator(".android-card")).toContainText("The previous beta package has been retired.");
  await expect(page.locator('a[href$=".apk"]')).toHaveCount(0);

  const fallback = page.locator("#open-android-web-fallback");
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute(
    "href",
    "https://connect.hermeslogisticsus.com/workspace?business_type=auto_repair",
  );

  await expect(page.getByRole("heading", { level: 4, name: "Is the Hermes Connect Android APK available?" })).toBeVisible();
  await expect(page.locator(".download-faq-section")).toContainText("Direct APK distribution is temporarily paused");
});
