import { expect, test } from "@playwright/test";

const retiredEmail = "freight_301@hermeslogisticsus.com";
const activeEmail = "officeus@hermeslogisticsus.com";

for (const route of ["/", "/about/"]) {
  test(`retired logistics email is not exposed on ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator(`a[href^="mailto:${retiredEmail}"]`)).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(retiredEmail);
    await expect(page.locator(`a[href^="mailto:${activeEmail}"]`).first()).toBeVisible();
  });
}
