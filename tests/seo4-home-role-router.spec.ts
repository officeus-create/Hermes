import { expect, test } from "@playwright/test";

const expectedDirections = [
  ["Open Hermes Logistics", "/paths/logistics/"],
  ["Open Hermes Marketing", "/paths/marketing/"],
  ["Open Hermes Academy", "/paths/academy/"],
  ["Open Hermes Technology", "/paths/technology/"],
] as const;

test("homepage presents one clear four-direction choice", async ({ page }) => {
  await page.goto("/");

  const rooms = page.locator("#paths.home-rooms-grid");
  await expect(rooms).toBeVisible();
  await expect(rooms.locator(".home-room")).toHaveCount(4);
  await expect(page.locator("[data-home-role-router]")).toHaveCount(0);

  for (const [label, href] of expectedDirections) {
    await expect(page.getByRole("link", { name: label })).toHaveAttribute("href", href);
  }
});

test("homepage does not expose a second competing routing layer", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("One Hermes ecosystem. Four different worlds", { exact: false })).toBeVisible();
  await expect(page.locator(".home-role-router")).toHaveCount(0);
  await expect(page.locator(".path-pillars")).toHaveCount(0);
  await expect(page.locator(".product-showcase")).toHaveCount(0);
});
