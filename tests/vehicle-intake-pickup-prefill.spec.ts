import { expect, test } from "@playwright/test";

const route = "/logistics/request-vehicle-transport/";

test("vehicle transport intake safely prefills an allowlisted public pickup market", async ({ page }) => {
  await page.goto(`${route}?role=dealer&request=dealer_inventory&pickup_market=appleton-wi#transport-intake`);

  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("dealer");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("dealer_inventory");
  await expect(page.locator('input[name="pickup_location"]')).toHaveValue("Appleton, WI");

  const analytics = await page.evaluate(() => JSON.stringify(window.dataLayer ?? []));
  expect(analytics).not.toContain("Appleton");
  expect(analytics).not.toContain("pickup_market");
});

test("vehicle transport intake ignores an unknown pickup market identifier", async ({ page }) => {
  await page.goto(`${route}?pickup_market=unknown-market#transport-intake`);

  await expect(page.locator('input[name="pickup_location"]')).toHaveValue("");
});

test("vehicle transport intake ignores arbitrary pickup text in the public URL", async ({ page }) => {
  await page.goto(`${route}?pickup=123%20Private%20Address#transport-intake`);

  await expect(page.locator('input[name="pickup_location"]')).toHaveValue("");
});
