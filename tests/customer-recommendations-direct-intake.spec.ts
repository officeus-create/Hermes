import { expect, test } from "@playwright/test";

const cases = [
  {
    route: "/paths/logistics/customers/vehicle-transport/",
    primary: "/logistics/request-vehicle-transport/?request=customer_delivery#transport-intake",
    demo: "/load-board/?role=private_party#post-load",
    requestType: "customer_delivery",
  },
  {
    route: "/paths/logistics/customers/port-pickup/",
    primary: "/logistics/request-vehicle-transport/?request=other#transport-intake",
    demo: "/load-board/?role=private_party#post-load",
    requestType: "other",
  },
  {
    route: "/paths/logistics/customers/luxury-classic-vehicle/",
    primary: "/logistics/request-vehicle-transport/?request=customer_delivery#transport-intake",
    demo: "/load-board/?role=private_party#post-load",
    requestType: "customer_delivery",
  },
  {
    route: "/paths/logistics/shippers-dealers/",
    primary: "/logistics/request-vehicle-transport/?request=dealer_inventory#transport-intake",
    demo: "/load-board/?role=dealer#post-load",
    requestType: "dealer_inventory",
  },
] as const;

for (const item of cases) {
  test(`${item.route} uses direct commercial intake and keeps demo secondary`, async ({ page }) => {
    await page.goto(item.route);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.route}`);
    const primaryLinks = page.locator("[data-recommendation-primary], [data-recommendation-primary-bottom]");
    await expect(primaryLinks).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(primaryLinks.nth(index)).toHaveAttribute("href", item.primary);
    }
    await expect(page.locator("[data-recommendation-demo]")).toHaveAttribute("href", item.demo);
    await expect(page.locator("[data-customer-direct-intake]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Use direct intake for a real transportation request." })).toBeVisible();
    await expect(page.getByText(/does not publish a request, notify a carrier, confirm capacity, create a booking, or guarantee acceptance/i)).toBeVisible();
    await expect(page.locator('[data-recommendation-primary][href*="/load-board/"]')).toHaveCount(0);
    await expect(page.locator('[data-recommendation-primary-bottom][href*="/load-board/"]')).toHaveCount(0);
  });

  test(`${item.route} direct intake preselects ${item.requestType}`, async ({ page }) => {
    await page.goto(item.primary);
    await expect(page.locator('select[name="request_type"]')).toHaveValue(item.requestType);
  });
}
