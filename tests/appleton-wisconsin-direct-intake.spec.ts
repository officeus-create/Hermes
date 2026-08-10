import { expect, test } from "@playwright/test";

const directIntake = "/logistics/request-vehicle-transport/?role=customer&request=customer_delivery#transport-intake";

const cases = [
  {
    name: "Appleton",
    route: "/logistics/appleton-wi-vehicle-transport/",
    directSelector: "[data-appleton-direct-intake], [data-appleton-direct-intake-bottom]",
    demoSelector: "[data-appleton-demo]",
    demo: "/load-board/?role=private_party&origin=Appleton%2C%20WI#post-load",
    title: "Appleton Vehicle Transport | Hermes Logistics",
  },
  {
    name: "Wisconsin",
    route: "/logistics/wisconsin-vehicle-transport/",
    directSelector: "[data-wisconsin-direct-intake]",
    demoSelector: "[data-wisconsin-demo]",
    demo: "/load-board/?role=private_party&origin=Wisconsin#post-load",
    title: "Wisconsin Vehicle Transport | Hermes Logistics",
  },
] as const;

for (const item of cases) {
  test(`${item.name} customer CTAs use direct intake and keep Load Board secondary`, async ({ page }) => {
    await page.goto(item.route);

    await expect(page).toHaveTitle(item.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.route}`);

    const directLinks = page.locator(item.directSelector);
    expect(await directLinks.count()).toBeGreaterThan(0);
    for (let index = 0; index < await directLinks.count(); index += 1) {
      await expect(directLinks.nth(index)).toHaveAttribute("href", directIntake);
    }

    await expect(page.locator(item.demoSelector)).toHaveAttribute("href", item.demo);
    await expect(page.locator(item.demoSelector)).toContainText(/Load Board demo/i);
    await expect(page.getByText(/does not publish a request, notify a carrier/i)).toBeVisible();
  });
}

test("Appleton and Wisconsin direct intake preselects private customer delivery", async ({ page }) => {
  await page.goto(directIntake);
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("private_party");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("customer_delivery");
});
