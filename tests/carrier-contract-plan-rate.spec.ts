import { expect, test } from "@playwright/test";

test("carrier standard plans lock their approved percentages while custom remains editable", async ({ page }) => {
  await page.goto("/logistics/carrier-onboarding/");

  const percentage = page.locator('input[name="service_percentage"]');
  const essential = page.locator('input[name="selected_plan"][value="essential"]');
  const pro = page.locator('input[name="selected_plan"][value="pro"]');
  const custom = page.locator('input[name="selected_plan"][value="custom"]');

  await expect(pro).toBeChecked();
  await expect(percentage).toHaveValue("8");
  await expect(percentage).toHaveAttribute("readonly", "");

  await essential.check();
  await expect(percentage).toHaveValue("6");
  await expect(percentage).toHaveAttribute("readonly", "");

  await custom.check();
  await expect(percentage).toHaveValue("");
  await expect(percentage).not.toHaveAttribute("readonly", "");
  await expect(percentage).toHaveAttribute("min", "1");
  await expect(percentage).toHaveAttribute("max", "15");
  await expect(percentage).toHaveAttribute("step", "0.25");

  await essential.check();
  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 2 of 3");
  await expect(page.locator('[data-step="2"]')).toBeVisible();
});

test("plan query context also resolves to the matching locked rate", async ({ page }) => {
  await page.goto("/logistics/carrier-onboarding/?plan=essential&rate=99&carrier_name=ignored");

  await expect(page).toHaveURL(/\/logistics\/carrier-onboarding\/\?plan=essential$/);
  await expect(page.locator('input[name="selected_plan"][value="essential"]')).toBeChecked();
  await expect(page.locator('input[name="service_percentage"]')).toHaveValue("6");
  await expect(page.locator('input[name="service_percentage"]')).toHaveAttribute("readonly", "");
});
