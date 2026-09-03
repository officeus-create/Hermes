import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const account = {
  success: true,
  identity: {
    id: "factory-owner-ru",
    name: "Владелец Factory",
    email: "factory-ru@example.com",
    role: "Hermes Member",
    location: "Kyiv",
  },
  owned_businesses: [],
  workspaces: [],
  capabilities: { internal_ai: false },
};

const draft = {
  id: "wf_ru_1",
  title: "New website brief",
  state: "draft",
  current_step: 1,
  payload: {
    starting_from_zero: false,
    sources: [],
    facts: {},
    goals: { primary: "", secondary: [], target_customer: "", geography: "", languages: [], primary_action: "" },
    brief: { text: "", must_have: [], nice_to_have: [], dislikes: [], tone: "", constraints: [], unresolved_questions: [] },
    references: [],
    pages: ["Home", "Services", "About / Trust", "FAQ", "Contact"],
    capabilities: [],
    brand: { logo_url: null, colors: [], notes: "" },
    unresolved_critical: [],
  },
  created_at: "2026-09-03T12:00:00.000Z",
  updated_at: "2026-09-03T12:00:00.000Z",
  submitted_at: null,
};

async function mockFactory(page: any) {
  await page.route("**/api/hermes-connect/account", (route: any) => route.fulfill(json(account)));
  await page.route("**/api/website-factory/drafts", async (route: any) => {
    if (route.request().method() === "POST") return route.fulfill(json({ success: true, draft }));
    return route.fulfill(json({ success: true, drafts: [] }));
  });
  await page.route("**/api/website-factory/drafts/*", async (route: any) => {
    if (route.request().method() === "PUT") {
      const payload = route.request().postDataJSON();
      return route.fulfill(json({ success: true, draft: { ...draft, ...payload } }));
    }
    return route.fulfill(json({ success: true, draft }));
  });
}

test("Website Factory identifies itself as a private workflow instead of a reference capability", async ({ page }) => {
  await mockFactory(page);
  await page.goto("/services/hermes-connect/website-factory/", { waitUntil: "domcontentloaded" });

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toHaveClass(/is-private/);
  await expect(context).not.toHaveClass(/is-reference/);
  await expect(context.locator(".hc-product-context__summary strong")).toHaveText("PRIVATE WEBSITE FACTORY WORKFLOW");
  await expect(context.locator("[data-hc-website-factory-link]")).toHaveAttribute("aria-current", "page");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
});

test("Russian Website Factory stays on the same noindex route and localizes the full wizard", async ({ page }) => {
  await mockFactory(page);
  await page.goto("/services/hermes-connect/website-factory/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/services\/hermes-connect\/website-factory\/\?lang=ru$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.locator("[data-hc-product-context]")).toHaveClass(/is-private/);
  await expect(page.locator("[data-hc-product-context] .hc-product-context__summary strong")).toHaveText("ПРИВАТНЫЙ ПРОЦЕСС WEBSITE FACTORY");
  await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Сначала соберите бриф — потом создавайте сайт." })).toBeVisible();
  await expect(page.getByText("Ваши брифы сайтов", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Начать новый сайт" })).toBeVisible();

  await page.getByRole("button", { name: "Начать новый сайт" }).click();
  await expect(page.locator("[data-wizard-view]")).toBeVisible();
  await expect(page.locator("[data-step-count]")).toHaveText("Шаг 1 из 9");
  await expect(page.locator('[data-step="1"] h3')).toHaveText("Где ваш бизнес уже представлен?");
  await expect(page.locator('[data-step="2"] h3')).toHaveText("Подтвердите данные, которые должен использовать сайт.");
  await expect(page.locator('[data-step="3"] h3')).toHaveText("Что сайт должен делать для бизнеса?");
  await expect(page.locator('[data-step="4"] h3')).toHaveText("Опишите своими словами, чего вы хотите.");
  await expect(page.locator('[data-step="5"] h3')).toHaveText("Три референса — три разные задачи.");
  await expect(page.locator('[data-step="6"] h3')).toHaveText("Выберите объем первого брифа на создание сайта.");
  await expect(page.locator('[data-step="7"] h3')).toHaveText("Используйте то, что уже есть, или опишите направление.");
  await expect(page.locator('[data-step="8"] h3')).toHaveText("Проверьте, как Hermes понял задачу.");
  await expect(page.locator('[data-step="9"] h3')).toHaveText("Создайте бриф сайта.");
  await expect(page.locator('[data-step="9"] > p:not(.factory-kicker)')).toContainText("Она не утверждает, что production-процесс создания сайта уже запущен.");
  await expect(page.getByRole("button", { name: "Сохранить и продолжить" })).toBeVisible();
  await expect(page.getByText("Главная", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Форма лида", { exact: true })).toHaveCount(1);

  const factoryText = await page.locator(".factory-page").textContent();
  for (const forbidden of [
    "Where does your business already exist?",
    "Confirm the facts the website should use.",
    "What should the website do for the business?",
    "Explain what you want naturally.",
    "Three references, three different jobs.",
    "Choose the first build brief scope.",
    "Use what already exists — or describe the direction.",
    "Review what Hermes understands.",
    "Create the website brief.",
  ]) {
    expect(factoryText || "").not.toContain(forbidden);
  }
});
