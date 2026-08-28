import { expect, test } from "@playwright/test";

const ownerStatus = {
  success: true,
  runtime: { online: true },
  active_task: null,
  latest_task: null,
};

const tasks = [
  {
    id: "hcai_12345678-aaaa-bbbb-cccc-111111111111",
    organization_scope: "hermes_internal",
    agent_role: "software_engineer",
    prompt: "secret-value-that-must-not-render-in-history",
    status: "completed",
    created_at: "2026-08-28T09:00:00.000Z",
    started_at: "2026-08-28T09:01:00.000Z",
    completed_at: "2026-08-28T09:03:00.000Z",
    updated_at: "2026-08-28T09:03:00.000Z",
    branch: "ai/task-12345678",
    pr_url: "https://github.com/officeus-create/Hermes/pull/999",
    evidence_class: "repository_inspection",
    output_summary: "Current main inspected; no files changed.",
    approval_gate: null,
    cancel_requested: false,
  },
  {
    id: "hcai_87654321-dddd-eeee-ffff-222222222222",
    organization_scope: "hermes_internal",
    agent_role: "software_engineer",
    prompt: "inspect merge requirements",
    status: "needs_approval",
    created_at: "2026-08-28T08:00:00.000Z",
    started_at: "2026-08-28T08:01:00.000Z",
    completed_at: null,
    updated_at: "2026-08-28T08:02:00.000Z",
    branch: "ai/task-87654321",
    pr_url: null,
    evidence_class: "approval_receipt",
    output_summary: "Stopped before any merge or deploy action.",
    approval_gate: "merge_deploy",
    cancel_requested: false,
  },
];

async function routeOwner(page: import("@playwright/test").Page) {
  await page.route("**/api/internal-ai/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(ownerStatus),
  }));
  await page.route("**/api/internal-ai/tasks", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, tasks }),
  }));
}

test.describe("Hermes Connect internal AI Activity", () => {
  test("shows real task history, results and approval stops without rendering prompts", async ({ page }) => {
    await routeOwner(page);
    await page.goto("/services/hermes-connect/internal/ai-connect/activity/");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.locator('[data-cabinet-link][aria-current="page"]')).toHaveText("Activity");
    await expect(page.locator("[data-task-count]")).toHaveText("2");
    await expect(page.locator("[data-approval-count]")).toHaveText("1");
    await expect(page.getByText("Current main inspected; no files changed.")).toBeVisible();
    await expect(page.getByText(/Stopped safely for approval: merge deploy/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Open PR" })).toHaveAttribute("href", "https://github.com/officeus-create/Hermes/pull/999");
    await expect(page.getByText("secret-value-that-must-not-render-in-history")).toHaveCount(0);
    await expect(page.locator('a[href*="127.0.0.1"], iframe[src*="127.0.0.1"], a[href*="localhost"], iframe[src*="localhost"]')).toHaveCount(0);
  });

  test("keeps Activity localized in Russian and preserves cabinet language", async ({ page }) => {
    await routeOwner(page);
    await page.goto("/services/hermes-connect/internal/ai-connect/activity/?lang=ru");
    await expect(page.getByRole("heading", { name: "Активность" })).toBeVisible();
    await expect(page.locator('[data-cabinet-link][aria-current="page"]')).toHaveText("Активность");
    await expect(page.getByText("Завершено", { exact: true })).toBeVisible();
    await expect(page.getByText(/Безопасно остановлено для подтверждения: merge deploy/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Открыть ИИ-ассистент" })).toHaveAttribute("href", /lang=ru/);
  });

  test("fails closed for anonymous access", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "not_authenticated" }),
    }));
    await page.route("**/api/internal-ai/tasks", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "not_authenticated" }),
    }));
    await page.goto("/services/hermes-connect/internal/ai-connect/activity/");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeHidden();
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.locator("[data-activity-content]")).toHaveClass(/hidden/);
  });

  test("is usable at 390px", async ({ page }) => {
    await routeOwner(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/hermes-connect/internal/ai-connect/activity/?lang=ru");
    await expect(page.locator("[data-hc-internal-cabinet]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Активность", exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.getByText("Current main inspected; no files changed.")).toBeVisible();
  });
});
