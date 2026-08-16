import { expect, test } from "@playwright/test";

test("Hermes Connect access center keeps mobile distribution out of the current Repair Shop release", async ({ page }) => {
  await page.goto("/download/");

  await expect(page.getByRole("heading", { level: 1, name: "Repair Shop Partner Beta is the current live product." })).toBeVisible();
  await expect(page.locator(".mobile-status-card")).toContainText("NO PUBLIC MOBILE RELEASE");
  await expect(page.locator('a[href$=".apk"]')).toHaveCount(0);
  await expect(page.locator('a[href*="connect.hermeslogisticsus.com/workspace"]')).toHaveCount(0);

  const repairBeta = page.getByRole("link", { name: /Open Repair Shop Partner Beta/i }).first();
  await expect(repairBeta).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
  await expect(page.getByRole("link", { name: "Owner Login / Get Started" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/",
  );

  await expect(page.getByRole("heading", { level: 4, name: "Is the Hermes Connect Android APK available?" })).toBeVisible();
  await expect(page.locator(".access-faq")).toContainText("No public Android APK is part of the current release");
});
