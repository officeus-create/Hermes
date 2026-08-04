import { expect, test } from "@playwright/test";

const route = "/logistics/request-vehicle-transport/";

test("vehicle transport intake safely prefills a public pickup location", async ({ page }) => {
  await page.goto(`${route}?role=dealer&request=dealer_inventory&pickup=Appleton%2C%20%20WI#transport-intake`);

  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("dealer");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("dealer_inventory");
  await expect(page.locator('input[name="pickup_location"]')).toHaveValue("Appleton, WI");

  const analytics = await page.evaluate(() => JSON.stringify(window.dataLayer ?? []));
  expect(analytics).not.toContain("Appleton");
  expect(analytics).not.toContain("pickup");
});

test("vehicle transport intake ignores an overlong pickup query value", async ({ page }) => {
  const overlongPickup = "A".repeat(181);
  await page.goto(`${route}?pickup=${overlongPickup}#transport-intake`);

  await expect(page.locator('input[name="pickup_location"]')).toHaveValue("");
});
