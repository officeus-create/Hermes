import { expect, test } from "@playwright/test";

const ownerStatus = {
  success: true,
  runtime: { online: true },
  active_task: null,
  latest_task: null,
};

async function routeOwner(page: import("@playwright/test").Page) {
  await page.route("**/api/internal-ai/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(ownerStatus),
  }));
}

test.describe("Hermes Connect internal AI cabinet UX", () => {
  test("keeps internal cabinet navigation hidden from an anonymous direct visitor", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "not_authenticated" }),
    }));
    await page.goto("/services/hermes-connect/internal/ai-connect/");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeHidden();
    await expect(page.getByText("Sign in required")).toBeVisible();
  });

  test("makes the verified owner area look and navigate like a cabinet", async ({ page }) => {
    await routeOwner(page);
    await page.goto("/services/hermes-connect/internal/ai-connect/");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeVisible();
    await expect(page.getByText("Internal cabinet", { exact: true })).toBeVisible();
    await expect(page.locator('[data-cabinet-link][aria-current="page"]')).toHaveText("Overview");
    await expect(page.getByRole("link", { name: /Open project/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open AI Assistant/ })).toBeVisible();
    await expect(page.locator(".site-footer")).toBeHidden();
  });

  test("keeps Russian across AI Connect, project and AI Assistant", async ({ page }) => {
    await routeOwner(page);
    await page.goto("/services/hermes-connect/internal/ai-connect/?lang=ru");
    await expect(page.getByText("Внутренний кабинет", { exact: true })).toBeVisible();
    await expect(page.getByText("Текущий проект", { exact: true })).toBeVisible();
    const project = page.getByRole("link", { name: /Открыть проект/ });
    await expect(project).toHaveAttribute("href", /lang=ru/);
    await project.click();
    await expect(page).toHaveURL(/internal\/ai-connect\/projects\/hermes-connect-internal-ai-pilot\/?\?lang=ru/);
    await expect(page.getByText("Что уже готово", { exact: true })).toBeVisible();
    const assistant = page.getByRole("link", { name: /Открыть ИИ-ассистент/ });
    await expect(assistant).toHaveAttribute("href", /lang=ru/);
    await assistant.click();
    await expect(page.getByRole("heading", { name: "ИИ-ассистент" })).toBeVisible();
    await expect(page.getByText("Поставить задачу", { exact: true })).toBeVisible();
    await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);
  });

  test("is familiar and usable at 390px", async ({ page }) => {
    await routeOwner(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/hermes-connect/internal/ai-connect/?lang=ru");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.getByRole("link", { name: "Обзор" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Проект" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ИИ-ассистент" })).toBeVisible();
  });
});
