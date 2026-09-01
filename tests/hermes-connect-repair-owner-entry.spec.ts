import { expect, test } from "@playwright/test";

const repairRoot = "/services/hermes-connect/repair-shops/";

test("registered Repair Shop owner gets a usable login form on the first mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });
  await page.goto(repairRoot);

  const card = page.locator("[data-repair-owner-quick-login]");
  const form = page.locator("[data-repair-owner-login-form]");
  await expect(card).toBeVisible();
  await expect(form).toBeVisible();
  await expect(page.locator("[data-repair-owner-login-email]")).toBeVisible();
  await expect(page.locator("[data-repair-owner-login-password]")).toBeVisible();
  await expect(page.locator("[data-repair-owner-login-submit]")).toHaveText("Sign in");
  await expect(page.getByRole("link", { name: "Sign in to my shop" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=login",
  );

  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(844);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);

  await expect(page.locator("[data-repair-free-launch] [data-owner-cta]")).toBeHidden();
  await expect(page.getByRole("link", { name: "Register free" }).first()).toBeVisible();
});

test("landing login submits through canonical auth API and opens dashboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });
  await page.route("**/api/auth/login", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.postDataJSON()).toEqual({ email: "owner@example.com", password: "password123" });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.goto(repairRoot);
  await page.locator("[data-repair-owner-login-email]").fill("owner@example.com");
  await page.locator("[data-repair-owner-login-password]").fill("password123");
  await page.locator("[data-repair-owner-login-submit]").click();
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/dashboard\/$/);
});

test("Russian first-screen login form preserves locale", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });
  await page.goto(`${repairRoot}?lang=ru`);

  const card = page.locator("[data-repair-owner-quick-login]");
  await expect(card).toBeVisible();
  await expect(card.getByRole("heading", { name: "Войдите в кабинет СТО" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Войти в кабинет СТО" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru",
  );
  await expect(page.locator("[data-repair-owner-login-submit]")).toHaveText("Войти");
  await expect(page.locator("[data-repair-owner-register]")).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru",
  );
});

test("active owner session replaces login form with direct dashboard action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, specialist: { name: "Owner", email: "owner@example.com", role: "Shop Owner" } }),
    });
  });
  await page.goto(`${repairRoot}?lang=ru`);

  await expect(page.locator("[data-repair-owner-login-form]")).toBeHidden();
  const dashboard = page.locator("[data-repair-owner-dashboard]");
  await expect(dashboard).toBeVisible();
  await expect(dashboard).toHaveText("Открыть мой кабинет");
  await expect(dashboard).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/?lang=ru");
  await expect(dashboard).toHaveAttribute("data-session-active", "true");
});
