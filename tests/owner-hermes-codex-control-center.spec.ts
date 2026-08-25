import { expect, test } from "@playwright/test";

const runtimeStatus = {
  success: true,
  runtime: {
    online: true,
    last_seen_at: "2026-08-25T09:30:00.000Z",
    repo_sha: "ff20f033945dd8b026513c95a31a98c8ef1641e9",
    runtime_version: "codex-cli 0.149.1",
    model: "openai/gpt-5.6-terra",
    fallback_route: "openai/gpt-5.4-mini",
  },
  active_task: null,
  latest_task: null,
};

async function mockOwnerApis(page: import("@playwright/test").Page) {
  await page.route("**/api/owner-codex/status", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(runtimeStatus) });
  });
  await page.route("**/api/owner-codex/tasks", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          task: {
            id: "hcx-test",
            task_type: body.task_type,
            prompt: body.prompt,
            status: "queued",
            created_at: "2026-08-25T09:31:00.000Z",
            updated_at: "2026-08-25T09:31:00.000Z",
          },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, tasks: [] }) });
  });
}

test("owner control center presents Repair Shops, Academy and routed Hermes Codex", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/owner/");

  await expect(page.getByRole("heading", { name: "Owner Control Center" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Repair Shops/ })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/");
  await expect(page.getByRole("link", { name: /Academy/ })).toHaveAttribute("href", "/services/hermes-connect/academy/dashboard/");
  await expect(page.getByRole("link", { name: /Hermes Codex/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Online", { exact: true })).toBeVisible();
  await expect(page.getByText("openai/gpt-5.6-terra", { exact: true })).toBeVisible();
  await expect(page.getByText("openai/gpt-5.4-mini", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("owner Hermes Codex composer works at 390px without horizontal overflow", async ({ page }) => {
  await mockOwnerApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/owner/");

  await page.getByRole("button", { name: "Current priorities" }).click();
  await expect(page.locator("[data-task-prompt]")).toContainText("Read AGENTS.md");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator("[data-task-alert]")).toContainText("Task queued for Hermes Codex");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("owner control center fails closed when the authenticated user is not owner", async ({ page }) => {
  await page.route("**/api/owner-codex/status", async (route) => {
    await route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ success: false, error: "owner_access_required" }) });
  });
  await page.goto("/services/hermes-connect/owner/");

  await expect(page.getByText("Owner access required", { exact: true })).toBeVisible();
  await expect(page.locator("[data-owner-content]")).toHaveClass(/hidden/);
  await expect(page.getByRole("button", { name: "Run", exact: true })).toBeHidden();
});
