import { expect, test } from "@playwright/test";

const directIntake = "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake";

const cases = [
  {
    city: "Madison",
    route: "/logistics/madison-wi-vehicle-transport/",
    directSelector: "[data-madison-direct-intake]",
    demoSelector: "[data-madison-demo]",
    demo: "/load-board/?role=private_party&origin=Madison%2C%20WI#post-load",
    title: "Madison Vehicle Transport | Hermes Logistics",
  },
  {
    city: "Green Bay",
    route: "/logistics/green-bay-wi-vehicle-transport/",
    directSelector: "[data-green-bay-direct-intake], [data-green-bay-direct-intake-bottom]",
    demoSelector: "[data-green-bay-demo]",
    demo: "/load-board/?role=private_party&origin=Green%20Bay%2C%20WI#post-load",
    title: "Green Bay Vehicle Transport | Hermes Logistics",
  },
] as const;

for (const item of cases) {
  test(`${item.city} customer CTAs use direct intake and keep demo secondary`, async ({ page }) => {
    await page.goto(item.route);

    await expect(page).toHaveTitle(item.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.route}`);

    const directLinks = page.locator(item.directSelector);
    expect(await directLinks.count()).toBeGreaterThan(0);
    for (let index = 0; index < await directLinks.count(); index += 1) {
      await expect(directLinks.nth(index)).toHaveAttribute("href", directIntake);
    }

    await expect(page.locator(item.demoSelector)).toHaveAttribute("href", item.demo);
    await expect(page.locator(item.demoSelector)).toContainText(`Preview the ${item.city} Load Board demo`);
    await expect(page.getByText(/does not publish a request, notify a carrier, confirm capacity, create a booking/i)).toBeVisible();
  });
}

test("Wisconsin city direct intake preselects private customer delivery", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("private_party");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("customer_delivery");
});
