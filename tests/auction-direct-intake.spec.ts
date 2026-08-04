import { expect, test } from "@playwright/test";

const route = "/logistics/resources/auction-vehicle-pickup-checklist/";
const directIntake = "/logistics/request-vehicle-transport/?request=auction_pickup#transport-intake";
const demo = "/load-board/?role=shipper#post-load";

test("auction checklist makes direct intake primary and demo secondary", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Auction Vehicle Pickup Checklist | Hermes Logistics");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);

  const directLinks = page.locator("[data-auction-direct-intake], [data-auction-direct-intake-bottom]");
  await expect(directLinks).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(directLinks.nth(index)).toHaveAttribute("href", directIntake);
  }

  await expect(page.locator("[data-auction-demo]")).toHaveAttribute("href", demo);
  await expect(page.locator("[data-auction-demo]")).toHaveText("Preview the Load Board demo");
  await expect(page.getByText(/does not publish a load, notify a carrier, confirm capacity, or create a booking/i)).toBeVisible();
});

test("auction direct intake preselects the auction request type", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page).toHaveURL(/\/logistics\/request-vehicle-transport\/\?request=auction_pickup#transport-intake$/);
  await expect(page.locator('select[name="request_type"]')).toHaveValue("auction_pickup");
});
