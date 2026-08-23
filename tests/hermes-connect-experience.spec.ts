import { expect, test } from "@playwright/test";

const localeCases = [
  ["en", "/services/hermes-connect/repair-shops/"],
  ["es", "/services/hermes-connect/repair-shops/?lang=es"],
  ["fr", "/services/hermes-connect/repair-shops/?lang=fr"],
  ["uk", "/services/hermes-connect/repair-shops/?lang=uk"],
  ["it", "/services/hermes-connect/repair-shops/?lang=it"],
  ["ru", "/services/hermes-connect/repair-shops/?lang=ru"],
] as const;

const ownerLocaleCases = [
  ["ru", "Доступ владельца СТО", "Зарегистрировать СТО", "Создать аккаунт СТО"],
  ["uk", "Доступ власника СТО", "Зареєструвати СТО", "Створити акаунт СТО"],
  ["es", "Acceso del propietario del taller", "Registrar taller", "Crear cuenta del taller"],
  ["it", "Accesso proprietario officina", "Registra officina", "Crea account officina"],
  ["fr", "Accès propriétaire d’atelier", "Inscrire un atelier", "Créer le compte de l’atelier"],
] as const;

const activationServices = [
  { id: "svc-1", name: "Oil change", duration_minutes: 30 },
  { id: "svc-2", name: "Diagnostics", duration_minutes: 45 },
  { id: "svc-3", name: "Brake inspection", duration_minutes: 45 },
];

async function mockOwnerActivation(page: import("@playwright/test").Page, bookings: unknown[] = []) {
  await page.route("**/api/auth/me", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, specialist: { name: "Owner", email: "owner@example.com", role: "Shop Owner" } }) }));
  await page.route("**/api/repair-shop/profile", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, shop: { id: "shop-1", slug: "apex-auto", name: "Apex Auto", city: "Milwaukee", state: "WI", timezone: "America/Chicago" } }) }));
  await page.route("**/api/services", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, services: activationServices }) }));
  await page.route("**/api/repair-shop/availability", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, days: [{ day_of_week: 1, is_open: true, start_time: "09:00", end_time: "17:00" }] }) }));
  await page.route("**/api/repair-shop/bookings", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, bookings }) }));
  await page.route("**/api/repair-shop/feedback", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, feedback: [] }) }));
}

test("Hermes Connect language switching stays on the equivalent product route", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("heading", { name: "Give customers one link to book your repair shop." })).toBeVisible();
  await expect(page.locator("[data-hc-english-only]")).toContainText("страница пока доступна только на английском");

  const languageMenu = page.locator("[data-language-menu]");
  await expect(languageMenu.locator("summary span")).toHaveText("Русский");
  await expect(languageMenu.locator('a[lang="ru"]')).toHaveAttribute("aria-current", "page");

  for (const [locale, expectedHref] of localeCases) {
    await expect(languageMenu.locator(`a[lang="${locale}"]`)).toHaveAttribute("href", expectedHref);
  }
});

test("Repair Shop owner registration is localized without creating duplicate auth pages", async ({ page }) => {
  for (const [locale, heading, registerTab, createAccount] of ownerLocaleCases) {
    await page.goto(`/services/hermes-connect/repair-shops/auth/?mode=register&lang=${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByRole("button", { name: registerTab })).toHaveClass(/active/);
    await expect(page.getByRole("button", { name: createAccount })).toBeVisible();
    await expect(page.locator("#reg-role")).toHaveValue("Shop Owner");
    await expect(page.locator("#reg-location")).toHaveValue("United States");
  }
});

test("Repair Shop owner language is preserved into workspace links", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { name: "Pilot Owner", email: "owner@example.com", role: "Shop Owner" } }),
  }));
  await page.goto("/services/hermes-connect/repair-shops/auth/?lang=es");
  await expect(page.getByRole("link", { name: "Ir al panel del taller" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/?lang=es");
});

test("Hermes Connect product family navigation presents Repair Shops as the current product", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toContainText("CURRENT PRODUCT");
  await expect(context).not.toContainText("CURRENT LIVE PILOT");
  await expect(context.getByRole("link", { name: "Repair Shops" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
  await expect(context.getByRole("link", { name: "AI Command Center" })).toHaveAttribute("href", "/services/hermes-connect/ai-command-center/");
  await expect(page.locator(".repair-pilot-page .hero-header-nav")).toHaveCount(0);
});

test("Repair Shop dashboard guides a configured owner to share the booking link", async ({ page }) => {
  await mockOwnerActivation(page, []);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=es");

  const activation = page.locator("[data-repair-activation]");
  await expect(activation.getByRole("heading", { name: "Prepara tu taller para recibir clientes" })).toBeVisible();
  await expect(activation).toContainText("3/6 completo");
  await expect(activation.getByRole("link", { name: "Abrir enlace" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/booking/?shop=apex-auto&lang=es");
  await expect(activation.getByRole("link", { name: "Plan Founding — $99" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/plan/?lang=es");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("completed first booking produces a 6/6 activation state and paid decision", async ({ page }) => {
  await mockOwnerActivation(page, [{ id: "booking-1", status: "completed" }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru");

  const activation = page.locator("[data-repair-activation]");
  await expect(activation).toContainText("6/6 готово");
  await expect(activation.getByRole("link", { name: "Запросить платную активацию" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/plan/?lang=ru");
  await expect(activation).toContainText("Первый полный цикл завершён");
  await expect(page.getByRole("heading", { name: "Рабочее пространство СТО" })).toBeVisible();
  await expect(page.getByText("Private beta", { exact: true })).toHaveCount(0);
});

test("Hermes Connect Hub presents one live product, private Academy, and adaptive preview configurations", async ({ page }) => {
  await page.goto("/services/hermes-connect/");

  await expect(page.locator("[data-hc-product-context]")).toContainText("PRODUCT FAMILY · CURRENT");
  await expect(page.getByRole("heading", { name: /Run your business with AI\./ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One system. Different business realities." })).toBeVisible();
  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  await expect(page.getByText("LIVE PRODUCT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("PRIVATE LEARNER WORKSPACE", { exact: true })).toBeVisible();
  await expect(page.locator('main a[href="/services/hermes-connect/academy/"]')).not.toHaveCount(0);
  expect(await page.getByText("PREVIEW CONFIGURATION", { exact: true }).count()).toBeGreaterThanOrEqual(4);
  expect(await page.locator(".hc-lab-links a").count()).toBeGreaterThanOrEqual(7);
  await expect(page.getByText("WORKSPACE PREVIEW · SAMPLE DATA", { exact: true })).toBeVisible();
});

test("Hermes Connect Hub renders real Russian content and keeps Academy private entry", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator(".hc-brand-page")).toHaveAttribute("data-hc-hub-locale", "ru");
  await expect(page.getByRole("heading", { name: "Управляйте бизнесом с AI." })).toBeVisible();
  await expect(page.locator(".hc-lead")).toContainText("Одна операционная система");
  await expect(page.locator(".hc-content-language")).toHaveText("Язык контента: русский");
  await expect(page.locator("[data-hc-product-context] [data-hc-english-only]")).toHaveCount(0);
  await expect(page.getByText("ПРИВАТНОЕ ПРОСТРАНСТВО ОБУЧЕНИЯ", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Открыть Академию" })).toHaveAttribute("href", "/services/hermes-connect/academy/");

  await page.goto("/services/hermes-connect/");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/\?lang=ru$/);
  await expect(page.getByRole("heading", { name: "Управляйте бизнесом с AI." })).toBeVisible();
  await expect(page.locator(".hc-content-language")).toHaveText("Язык контента: русский");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("non-live Hermes Connect modules are reference capabilities without legacy pricing or workspace CTA", async ({ page }) => {
  await page.goto("/services/hermes-connect/proposal-builder/");

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toContainText("REFERENCE CAPABILITY · NOT CURRENT LIVE PILOT");
  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  await expect(page.getByText("$99", { exact: false })).toHaveCount(0);
  await expect(page.getByText("$299", { exact: false })).toHaveCount(0);
  await expect(page.getByText("$799", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Open current Repair Shop product/ })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
});

test("live Corporate Offer runtime removes the legacy browser-only form handler surface", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const form = page.locator("#partner-beta-form");
  await expect(form).toHaveAttribute("data-live-partner-offer", "true");
  await expect(form).not.toHaveAttribute("data-demo-form", /.*/);
});

test("Hermes Connect family navigation remains usable on mobile without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=uk");

  await expect(page.locator("[data-hc-product-context]")).toContainText("ПОТОЧНИЙ ПРОДУКТ");
  await expect(page.locator("[data-hc-english-only]")).toBeVisible();
  await expect(page.locator(".hc-family-nav")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("multilingual Repair Shop registration remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=es");

  await expect(page.getByRole("heading", { name: "Acceso del propietario del taller" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear cuenta del taller" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
