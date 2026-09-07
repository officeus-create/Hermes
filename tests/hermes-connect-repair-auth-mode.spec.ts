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

test("repair shop owner auth has visible parity across all six canonical locales", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));

  const locales = [
    { lang: "en", title: "Repair Shop Owner Access", confirm: "Confirm Password", create: "Create Shop Account" },
    { lang: "ru", title: "Доступ владельца СТО", confirm: "Повторите пароль", create: "Создать аккаунт СТО" },
    { lang: "uk", title: "Доступ власника СТО", confirm: "Повторіть пароль", create: "Створити акаунт СТО" },
    { lang: "es", title: "Acceso del propietario del taller", confirm: "Confirmar contraseña", create: "Crear cuenta del taller" },
    { lang: "it", title: "Accesso proprietario officina", confirm: "Conferma password", create: "Crea account officina" },
    { lang: "fr", title: "Accès propriétaire d’atelier", confirm: "Confirmer le mot de passe", create: "Créer le compte de l’atelier" },
  ];

  for (const locale of locales) {
    const suffix = locale.lang === "en" ? "?mode=register" : `?mode=register&lang=${locale.lang}`;
    await page.goto(`/services/hermes-connect/repair-shops/auth/${suffix}`);
    await expect(page.locator("#auth-forms .auth-header h1")).toHaveText(locale.title);
    await expect(page.locator('label[for="reg-password-confirm"]')).toHaveText(locale.confirm);
    await expect(page.locator('#register-form button[type="submit"]')).toHaveText(locale.create);
    await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
    const backHref = await page.locator(".back-link").getAttribute("href");
    if (locale.lang === "en") expect(backHref).not.toContain("lang=");
    else expect(backHref).toContain(`lang=${locale.lang}`);
  }
});

test("repair shop registration catches a password mismatch before sending", async ({ page }) => {
  let registerRequests = 0;
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));
  await page.route("**/api/auth/register", (route) => {
    registerRequests += 1;
    return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register");
  await page.locator("#reg-name").fill("QA Shop Owner");
  await page.locator("#reg-email").fill("qa-owner@example.com");
  await page.locator("#reg-password").fill("TestPassword123!");
  await page.locator("#reg-password-confirm").fill("TestPassword321!");
  await page.locator("#register-form button[type='submit']").click();

  await expect(page.locator("#alert-box")).toHaveRole("alert");
  await expect(page.locator("#alert-box")).toHaveText("Passwords do not match. Re-enter them and try again.");
  await expect(page.locator("#reg-password-confirm")).toBeFocused();
  expect(registerRequests).toBe(0);
});

test("repair shop registration localizes validation errors without sending", async ({ page }) => {
  let registerRequests = 0;
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));
  await page.route("**/api/auth/register", (route) => {
    registerRequests += 1;
    return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru");
  await page.locator("#reg-name").fill("QA Shop Owner");
  await page.locator("#reg-email").fill("qa-owner@example.com");
  await page.locator("#reg-password").fill("TestPassword123!");
  await page.locator("#reg-password-confirm").fill("TestPassword321!");
  await page.locator("#register-form button[type='submit']").click();

  await expect(page.locator("#alert-box")).toHaveText("Пароли не совпадают. Введите их ещё раз.");
  await expect(page.locator("#reg-password-confirm")).toBeFocused();
  expect(registerRequests).toBe(0);
});

test("repair shop registration masks internal API errors and restores the action", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));
  await page.route("**/api/auth/register", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "database_unavailable" }),
  }));

  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register");
  await page.locator("#reg-name").fill("QA Shop Owner");
  await page.locator("#reg-email").fill("qa-owner@example.com");
  await page.locator("#reg-password").fill("TestPassword123!");
  await page.locator("#reg-password-confirm").fill("TestPassword123!");
  const submit = page.locator("#register-form button[type='submit']");
  await submit.click();

  await expect(page.locator("#alert-box")).toHaveText("We could not create your account. Check your details and try again.");
  await expect(page.locator("#alert-box")).not.toContainText("database_unavailable");
  await expect(submit).toBeEnabled();
  await expect(submit).toHaveAttribute("aria-busy", "false");
});
