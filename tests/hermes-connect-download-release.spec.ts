import { expect, test } from "@playwright/test";

test("Hermes Connect access center keeps native mobile distribution behind the release gate", async ({ page }) => {
  await page.goto("/download/");

  await expect(page.getByRole("heading", { level: 1, name: "Use the current product in your browser." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Responsive Web App" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Native mobile distribution" })).toBeVisible();
  await expect(page.getByText("No public APK, Google Play, or App Store release is currently claimed.", { exact: false })).toBeVisible();
  await expect(page.locator('a[href$=".apk"]')).toHaveCount(0);
  await expect(page.locator('a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);

  const currentProduct = page.getByRole("link", { name: /Open Repair Shops/ }).first();
  await expect(currentProduct).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
  await expect(page.getByRole("link", { name: "Owner Login / Get Started" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/",
  );

  await expect(page.getByRole("heading", { level: 3, name: "Is there a public Android APK or app-store release?" })).toBeVisible();
  await expect(page.locator(".hc-access-faq")).toContainText("No public mobile-store or direct APK release is currently presented as available.");
});
