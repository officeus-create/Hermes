import { expect, test } from "@playwright/test";

const expectedDirections = [
  [/Open Hermes Logistics/i, "/paths/logistics/"],
  [/Open Hermes Marketing/i, "/paths/marketing/"],
  [/Open Hermes Technology/i, "/paths/technology/"],
  [/Open Hermes Academy/i, "/paths/academy/"],
] as const;

test("homepage presents one semantic four-direction system", async ({ page }) => {
  await page.goto("/");

  const stage = page.locator("#paths.home-master-stage");
  await expect(stage).toBeVisible();
  await expect(stage.locator(".home-master-route")).toHaveCount(4);
  await expect(page.locator("[data-home-role-router]")).toHaveCount(0);

  for (const [label, href] of expectedDirections) {
    await expect(page.getByRole("link", { name: label })).toHaveAttribute("href", href);
  }
});

test("homepage does not expose a second competing routing layer", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("One operating architecture.", { exact: false })).toBeVisible();
  await expect(page.locator(".home-role-router")).toHaveCount(0);
  await expect(page.locator(".path-pillars")).toHaveCount(0);
  await expect(page.locator(".product-showcase")).toHaveCount(0);
});
