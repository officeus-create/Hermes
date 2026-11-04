import { expect, test } from "@playwright/test";

// The Load Board has an on-page RPM tool and a distinct carrier intake.
// Keep the mobile primary action on the consented carrier-access path, not a second analyzer.
test("mobile Load Board quick action opens the real carrier-access section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/load-board/");
  expect(response?.ok()).toBeTruthy();

  const sticky = page.locator(".money-page-action-bar");
  await expect(sticky).toBeVisible();
  const primary = sticky.getByRole("link", { name: "Request free carrier access" });
  await expect(primary).toHaveAttribute("href", "/load-board/?role=carrier#carrier-access");
  await primary.click();
  await expect(page).toHaveURL(/\/load-board\/\?role=carrier#carrier-access$/);
  await expect(page.locator("#carrier-access")).toBeVisible();
  await expect(page.locator("#carrier-access form")).toBeVisible();
});
