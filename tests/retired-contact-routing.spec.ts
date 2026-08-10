import { expect, test } from "@playwright/test";

const retiredEmail = "freight_301@hermeslogisticsus.com";
const activeEmail = "officeus@hermeslogisticsus.com";
const retiredGeography = "USA · Europe · International email coordination";
const currentGeography = "U.S. logistics · International email coordination";
const retiredContactStatus = "Contact submission pending connection";

for (const route of ["/", "/about/", "/logistics/appleton-wi-vehicle-transport/"]) {
  test(`retired public trust copy is not exposed on ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator(`a[href^="mailto:${retiredEmail}"]`)).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(retiredEmail);
    await expect(page.locator("body")).not.toContainText(retiredGeography);
    await expect(page.locator("body")).not.toContainText(retiredContactStatus);
    await expect(page.locator("body")).toContainText(currentGeography);
    await expect(page.locator(`a[href^="mailto:${activeEmail}"]`).first()).toBeVisible();
  });
}
