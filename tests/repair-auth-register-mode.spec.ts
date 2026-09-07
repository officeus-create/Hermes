import { expect, test } from "@playwright/test";

test("Repair registration deep link opens the Register New Shop tab", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register");

  const registerTab = page.locator('[data-tab="register"]');
  const registerForm = page.locator("#register-form");
  const loginTab = page.locator('[data-tab="login"]');
  const loginForm = page.locator("#login-form");

  await expect(registerTab).toHaveClass(/active/);
  await expect(registerForm).toHaveClass(/active/);
  await expect(loginTab).not.toHaveClass(/active/);
  await expect(loginForm).not.toHaveClass(/active/);
});

test("plain Repair owner access keeps Login as the default", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/auth/");

  await expect(page.locator('[data-tab="login"]')).toHaveClass(/active/);
  await expect(page.locator("#login-form")).toHaveClass(/active/);
  await expect(page.locator('[data-tab="register"]')).not.toHaveClass(/active/);
  await expect(page.locator("#register-form")).not.toHaveClass(/active/);
});