import { expect, test } from "@playwright/test";

test("repair shop manager link opens registration mode directly", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register");

  await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
  await expect(page.locator("#register-form")).toHaveClass(/active/);
  await expect(page.locator('[data-tab="login"]')).not.toHaveClass(/active/);
});

test("repair shop auth mode preserves Connect locale query", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru&referral=captured");

  await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
  await expect(page.locator("#register-form")).toHaveClass(/active/);
  await expect(page.locator('[data-language-menu] summary')).toContainText("Русский");
  expect(page.url()).toContain("mode=register");
  expect(page.url()).toContain("referral=captured");
});
