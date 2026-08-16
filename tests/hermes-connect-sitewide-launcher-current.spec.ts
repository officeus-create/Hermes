import { expect, test } from "@playwright/test";

const productHub = "/services/hermes-connect/";

test("shared Hermes Connect launchers outside the product route use the current product hub", async ({ page }) => {
  await page.goto("/paths/technology/");

  const launchers = page.locator('[data-hermes-connect-launcher]');
  expect(await launchers.count()).toBeGreaterThan(0);

  for (let index = 0; index < await launchers.count(); index += 1) {
    const launcher = launchers.nth(index);
    await expect(launcher.locator('a[href="https://connect.hermeslogisticsus.com/workspace"], a[href^="https://connect.hermeslogisticsus.com/workspace?"]')).toHaveCount(0);
  }

  const productHubLinks = page.locator(`[data-hermes-connect-launcher] a[href="${productHub}"], a[data-hermes-connect-launcher][href="${productHub}"]`);
  expect(await productHubLinks.count()).toBeGreaterThan(0);
});

test("shared launcher copy distinguishes the current Repair Shop pilot from demo capabilities", async ({ page }) => {
  await page.goto("/paths/technology/");

  const text = await page.locator('[data-hermes-connect-launcher]').allTextContents();
  expect(text.join(" ")).toContain("Repair Shop Partner Beta");
  expect(text.join(" ")).toContain("demo");
  expect(text.join(" ")).not.toContain("Business Operations Workspace — Public Beta");
});
