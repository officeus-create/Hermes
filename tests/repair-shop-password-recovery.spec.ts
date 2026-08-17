import { expect, test } from "@playwright/test";

const token = "a".repeat(64);

test("localized Repair Shop login exposes forgot password link", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));
  await page.goto("/services/hermes-connect/repair-shops/auth/?lang=ru", { waitUntil: "domcontentloaded" });
  const forgot = page.locator("[data-repair-forgot-password]");
  await expect(forgot).toBeVisible();
  await expect(forgot).toHaveText("Забыли пароль?");
  await expect(forgot).toHaveAttribute("href", "/services/hermes-connect/repair-shops/forgot-password/?lang=ru");
});

test("forgot password stays neutral, offers support fallback, and is usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let requestBody: any = null;
  await page.route("**/api/auth/forgot-password", async (route) => {
    requestBody = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto("/services/hermes-connect/repair-shops/forgot-password/?lang=ru", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Сброс пароля" })).toBeVisible();
  const support = page.locator("#recovery-support");
  await expect(support).toContainText("Письмо не пришло?");
  const supportLink = page.locator("#recovery-support-link");
  await expect(supportLink).toHaveText("Связаться с поддержкой Hermes");
  await expect(supportLink).toHaveAttribute("href", /mailto:officeus@hermeslogisticsus\.com\?subject=Hermes%20Connect%20Repair%20Shop%20password%20recovery/);
  await page.locator("#forgot-email").fill("owner@example.com");
  await page.getByRole("button", { name: "Отправить ссылку" }).click();
  await expect(page.locator("#recovery-message")).toContainText("Если для этого email существует");
  expect(requestBody).toEqual({ email: "owner@example.com", lang: "ru" });
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});

test("reset password validates confirmation and posts one-time token at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let requestBody: any = null;
  await page.route("**/api/auth/reset-password", async (route) => {
    requestBody = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto(`/services/hermes-connect/repair-shops/reset-password/?token=${token}&lang=ru`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Новый пароль" })).toBeVisible();
  await page.locator("#reset-password").fill("new-password-123");
  await page.locator("#reset-confirm").fill("different-password");
  await page.getByRole("button", { name: "Обновить пароль" }).click();
  await expect(page.locator("#reset-message")).toContainText("Пароли не совпадают");
  expect(requestBody).toBeNull();

  // Validate the 390px layout before the successful submit intentionally schedules
  // a redirect back to login. Measuring after success races that navigation.
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);

  await page.locator("#reset-confirm").fill("new-password-123");
  await page.getByRole("button", { name: "Обновить пароль" }).click();
  await expect(page.locator("#reset-message")).toContainText("Пароль обновлён");
  expect(requestBody).toEqual({ token, password: "new-password-123" });
});