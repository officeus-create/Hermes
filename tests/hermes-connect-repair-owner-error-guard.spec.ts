import { expect, test } from "@playwright/test";

const specialist = {
  id: "owner-error-guard",
  name: "QA Owner",
  email: "owner@example.com",
  role: "Shop Owner",
};

test.describe("Hermes Connect Repair Shop owner error guard", () => {
  test("owner login never exposes database_not_configured and localizes the failure", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "not_authenticated" }),
      }),
    );
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "database_not_configured" }),
      }),
    );

    await page.goto("/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru");
    await page.locator("#login-email").fill("owner@example.com");
    await page.locator("#login-password").fill("test-password");
    await page.locator("#login-form button[type='submit']").click();

    const alert = page.locator("#alert-box");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText("Сейчас не удалось выполнить вход или регистрацию. Попробуйте ещё раз чуть позже.");
    await expect(alert).not.toContainText("database_not_configured");
    await expect(page.locator("body")).not.toContainText("database_not_configured");
  });

  test("owner availability 503 is customer-safe and 390px does not overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, specialist }),
      }),
    );
    await page.route("**/api/repair-shop/availability", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "database_not_configured" }),
      }),
    );

    await page.goto("/services/hermes-connect/repair-shops/availability/?lang=ru");

    const alert = page.locator("#availability-alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText("Сейчас не удалось загрузить или сохранить расписание. Попробуйте ещё раз чуть позже.");
    await expect(page.locator("body")).not.toContainText("database_not_configured");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("customers route sanitizes unknown backend codes without hiding the owner flow", async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, specialist }),
      }),
    );
    await page.route("**/api/repair-shop/customers", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "database_not_configured" }),
      }),
    );

    await page.goto("/services/hermes-connect/repair-shops/customers/?lang=ru");

    const alert = page.locator("#page-alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText("Сейчас не удалось загрузить историю клиентов. Попробуйте ещё раз чуть позже.");
    await expect(page.locator("body")).not.toContainText("database_not_configured");
  });
});
