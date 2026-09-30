import { expect, test } from "@playwright/test";

// Separate required pointer stage. Keep this explicit if the endpoint's
// headless actionability issue remains unresolved; keyboard coverage is separate.
test("pointer submit after concept dialog navigation", async ({ page }) => {
  await page.route(/^https:\/\//, route => route.abort());
  await page.goto("/businesses/concepts/kittles-garage/");
  await page.getByRole("button", { name: /Diagnostics/ }).click();
  await page.getByRole("link", { name: /Open a short/ }).click();
  await page.getByRole("button", { name: "Preview development brief" }).click({ timeout: 5000 });
  expect(await page.locator('input[name="name"]').evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false);
});
