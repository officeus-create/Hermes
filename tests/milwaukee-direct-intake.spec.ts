import { expect, test } from "@playwright/test";

const route = "/logistics/milwaukee-wi-vehicle-transport/";
const directIntake = "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake";
const demo = "/load-board/?role=private_party&origin=Milwaukee%2C%20WI#post-load";

test("Milwaukee customer CTA uses direct intake and keeps demos secondary", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Milwaukee Vehicle Transport | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  await expect(page.locator("[data-milwaukee-direct-intake]")).toHaveAttribute("href", directIntake);
  await expect(page.locator("[data-milwaukee-demo]")).toHaveAttribute("href", demo);
  await expect(page.locator("[data-milwaukee-demo]")).toHaveText("Preview the Milwaukee Load Board demo");
  await expect(page.getByText(/does not publish a request, notify a carrier, confirm capacity, create a booking/i)).toBeVisible();
  await expect(page.locator('[data-milwaukee-direct-intake][href*="/load-board/"]')).toHaveCount(0);
});

test("Milwaukee direct intake preselects private customer delivery", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("private_party");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("customer_delivery");
});
