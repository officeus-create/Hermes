import { expect, test } from "@playwright/test";

test("marketing path uses an action-specific brief CTA", async ({ page }) => {
  await page.goto("/paths/marketing/");

  const cta = page.getByRole("link", { name: "Prepare a marketing brief" }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "#contact");
});

test("Academy path uses a path-specific inquiry CTA", async ({ page }) => {
  await page.goto("/paths/academy/");

  const cta = page.getByRole("link", { name: "Ask about the Academy path" }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "#contact");
});

test("Academy explore flow requires a public micro-commitment before application", async ({ page }) => {
  await page.goto("/paths/academy/");

  await expect(page.getByText("Next: choose a learning track and try one public exercise before you decide whether to apply.")).toBeVisible();

  await page.getByRole("button", { name: "Choose a track" }).click();
  await page.getByRole("button", { name: /Next: U\.S\. Logistics Operations/ }).click();
  await page.getByRole("button", { name: "See the 6 layers" }).click();
  await page.getByRole("button", { name: "Method & FAQ" }).click();

  await expect(page.getByRole("heading", { name: "Try one public exercise first." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Try a public exercise/ })).toHaveAttribute("href", "/academy/resources/");
  await expect(page.getByRole("link", { name: /Apply for human review/ })).toHaveAttribute("href", "/academy/apply/");
});

