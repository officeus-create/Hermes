import { expect, test } from "@playwright/test";

// This test intentionally exercises real Chromium native form behavior with no
// scripts and only synthetic, non-contactable example.invalid data. Never POST
// test submissions to the real Hermes receiver.
test.describe("carrier direct-intake native HTML safety", () => {
  test.use({ javaScriptEnabled: false });

  test("disabled native review cannot leak carrier details into the URL", async ({ page }) => {
    const navigations: string[] = [];
    page.on("request", (request) => {
      if (request.isNavigationRequest()) navigations.push(request.url());
    });

    await page.goto("/logistics/start-car-hauling-dispatch/");
    const form = page.locator("[data-dispatch-intake] [data-vehicle-form]");
    const review = form.locator("[data-review-dispatch-request]");

    await expect(review).toBeDisabled();
    await expect(form).toContainText("Interactive request review requires JavaScript");
    await expect(form.getByRole("link", { name: "email Logistics Sales directly" }))
      .toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com");

    await form.locator('input[name="carrier_company_name"]').fill("Synthetic QA Carrier");
    await form.locator('input[name="carrier_email"]').fill("qa-carrier@example.invalid");
    await form.locator('input[name="authority_number"]').fill("MC000000");
    await form.locator('input[name="carrier_company_name"]').press("Enter");

    await expect(page).toHaveURL(/\/logistics\/start-car-hauling-dispatch\/$/);
    expect(navigations).toHaveLength(1);
    expect(navigations.join(" ")).not.toMatch(/Synthetic|qa-carrier|MC000000|carrier_company_name|carrier_email/i);
  });
});

test("carrier form review activates after safe browser handlers initialize", async ({ page }) => {
  await page.goto("/logistics/start-car-hauling-dispatch/");
  const form = page.locator("[data-dispatch-intake] [data-vehicle-form]");
  const review = form.locator("[data-review-dispatch-request]");

  await expect(review).toBeEnabled();
  await review.click();
  await expect(form.locator("[data-vehicle-alert]")).toBeVisible();
  await expect(form.locator("[data-vehicle-alert]")).toContainText("Complete the company");
  await expect(page).toHaveURL(/\/logistics\/start-car-hauling-dispatch\/$/);
});
