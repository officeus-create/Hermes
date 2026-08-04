import { expect, test } from "@playwright/test";

const directIntake = "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake";

const cases = [
  {
    city: "Oshkosh",
    route: "/logistics/oshkosh-wi-vehicle-transport/",
    directSelector: "[data-oshkosh-direct-intake]",
    demoSelector: "[data-oshkosh-demo]",
    demo: "/load-board/?role=private_party&origin=Oshkosh%2C%20WI#post-load",
    title: "Oshkosh Vehicle Transport | Hermes Logistics",
  },
  {
    city: "Fond du Lac",
    route: "/logistics/fond-du-lac-wi-vehicle-transport/",
    directSelector: "[data-fond-du-lac-direct-intake]",
    demoSelector: "[data-fond-du-lac-demo]",
    demo: "/load-board/?role=private_party&origin=Fond%20du%20Lac%2C%20WI#post-load",
    title: "Fond du Lac Vehicle Transport | Hermes Logistics",
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

test("Oshkosh and Fond du Lac direct intake preselects private customer delivery", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("private_party");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("customer_delivery");
});
