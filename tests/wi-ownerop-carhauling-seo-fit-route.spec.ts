import { expect, test } from "@playwright/test";

test("Wisconsin owner-operator recruiting page separates job path from car hauler dispatch service", async ({ page }) => {
  await page.goto("/careers/wisconsin-owner-operators/");

  const dispatchLink = page.locator('.resource-grid a[href="/logistics/car-hauling-dispatch/"]');
  await expect(dispatchLink).toBeVisible();
  await expect(dispatchLink).toContainText("This is not a job application or a freight guarantee.");
  await dispatchLink.click();

  await expect(page).toHaveURL(/\/logistics\/car-hauling-dispatch\/$/);
  await expect(page.getByRole("heading", { name: "Car Hauler Dispatch Service for Owner-Operators and Small Fleets", level: 1 })).toBeVisible();
  await expect(page.getByText("This is not a consumer car-shipping quote service", { exact: false })).toBeVisible();
});
