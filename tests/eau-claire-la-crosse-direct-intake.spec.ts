import { expect, test } from "@playwright/test";

const directIntake = "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake";

const cases = [
  {
    city: "Eau Claire",
    route: "/logistics/eau-claire-wi-vehicle-transport/",
    directSelector: "[data-eau-claire-direct-intake]",
    demoSelector: "[data-eau-claire-demo]",
    demo: "/load-board/?role=private_party&origin=Eau%20Claire%2C%20WI#post-load",
    title: "Eau Claire Vehicle Transport | Hermes Logistics",
  },
  {
    city: "La Crosse",
    route: "/logistics/la-crosse-wi-vehicle-transport/",
    directSelector: "[data-la-crosse-direct-intake]",
    demoSelector: "[data-la-crosse-demo]",
    demo: "/load-board/?role=private_party&origin=La%20Crosse%2C%20WI#post-load",
    title: "La Crosse Vehicle Transport | Hermes Logistics",
  },
] as const;

for (const item of cases) {
  test(`${item.city} customer CTA uses direct intake and keeps demo secondary`, async ({ page }) => {
    await page.goto(item.route);
    await expect(page).toHaveTitle(item.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.route}`);
    await expect(page.locator(item.directSelector)).toHaveAttribute("href", directIntake);
    await expect(page.locator(item.demoSelector)).toHaveAttribute("href", item.demo);
    await expect(page.locator(item.demoSelector)).toContainText(`Preview the ${item.city} Load Board demo`);
    await expect(page.getByText(/does not publish a request, notify a carrier, confirm capacity, create a booking/i)).toBeVisible();
    await expect(page.locator(`${item.directSelector}[href*="/load-board/"]`)).toHaveCount(0);
  });
}

test("Eau Claire and La Crosse direct intake preselects private customer delivery", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("private_party");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("customer_delivery");
});
