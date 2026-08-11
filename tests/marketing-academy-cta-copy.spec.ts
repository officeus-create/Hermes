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
