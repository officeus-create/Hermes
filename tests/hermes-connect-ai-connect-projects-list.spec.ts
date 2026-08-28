import { expect, test } from "@playwright/test";

const ownerStatus = {
  success: true,
  runtime: { online: true },
  active_task: null,
  latest_task: null,
};

async function owner(page: import("@playwright/test").Page) {
  await page.route("**/api/internal-ai/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(ownerStatus),
  }));
}

test.describe("AI Connect Projects", () => {
  test("shows only the real current project and opens its workspace", async ({ page }) => {
    await owner(page);
    await page.goto("/services/hermes-connect/internal/ai-connect/projects/");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByText("1 current project", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hermes Connect · Internal AI Pilot" })).toBeVisible();
    await expect(page.locator('[data-cabinet-link][aria-current="page"]')).toHaveText("Projects");
    await page.getByRole("link", { name: /Open project/ }).click();
    await expect(page).toHaveURL(/internal\/ai-connect\/projects\/hermes-connect-internal-ai-pilot\/$/);
  });

  test("keeps Russian language through the projects list into the project", async ({ page }) => {
    await owner(page);
    await page.goto("/services/hermes-connect/internal/ai-connect/projects/?lang=ru");
    await expect(page.getByRole("heading", { name: "Проекты" })).toBeVisible();
    await expect(page.getByText("1 текущий проект", { exact: true })).toBeVisible();
    await expect(page.locator('[data-cabinet-link][aria-current="page"]')).toHaveText("Проекты");
    const open = page.getByRole("link", { name: /Открыть проект/ });
    await expect(open).toHaveAttribute("href", /lang=ru/);
    await open.click();
    await expect(page).toHaveURL(/hermes-connect-internal-ai-pilot\/?\?lang=ru/);
    await expect(page.getByText("Текущий проект", { exact: true })).toBeVisible();
  });

  test("stays usable at 390px", async ({ page }) => {
    await owner(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/hermes-connect/internal/ai-connect/projects/?lang=ru");
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.getByRole("link", { name: "Проекты" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Открыть проект/ })).toBeVisible();
  });

  test("does not reveal the projects workspace to anonymous access", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "not_authenticated" }),
    }));
    await page.goto("/services/hermes-connect/internal/ai-connect/projects/");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeHidden();
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.locator("[data-projects-content]")).toHaveClass(/hidden/);
  });
});
