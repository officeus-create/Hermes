import { expect, test } from "@playwright/test";

const projectPath = "/services/hermes-connect/internal/ai-connect/projects/hermes-connect-internal-ai-pilot/";

test.describe("AI Connect project workspace", () => {
  test("denies anonymous access without rendering internal project content", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "not_authenticated" }),
    }));

    await page.goto(projectPath);
    await expect(page).toHaveTitle(/Hermes Connect Internal AI Pilot \| AI Connect/);
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.locator("[data-project-content]")).toHaveClass(/hidden/);
    await expect(page.locator('iframe[src*="127.0.0.1"]')).toHaveCount(0);
    await expect(page.locator('a[href*="127.0.0.1"]')).toHaveCount(0);
  });

  test("renders the real internal project and live runner state for an authorized owner", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        runtime: { online: true },
        active_task: null,
        latest_task: null,
      }),
    }));

    await page.goto(projectPath);
    await expect(page.getByRole("heading", { name: "Hermes Connect · Internal AI Pilot" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Execution path is online" })).toBeVisible();
    await expect(page.getByText("Runner is ready for the live receipt", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open AI Assistant/ })).toHaveAttribute("href", "/services/hermes-connect/internal/ai-assistant/");
  });

  test("turns a real approval state into the project blocker instead of creating parallel work", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        runtime: { online: true },
        active_task: { id: "hcai_test", status: "needs_approval", approval_gate: "merge_deploy" },
        latest_task: null,
      }),
    }));

    await page.goto(projectPath);
    await expect(page.getByText("Approval required: merge deploy")).toBeVisible();
    await expect(page.getByText("Review the current approval gate")).toBeVisible();
  });

  test("fits the 390px owner workspace without exposing FCC Admin", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, runtime: { online: false }, active_task: null, latest_task: null }),
    }));

    await page.goto(projectPath);
    await expect(page.getByRole("heading", { name: "Hermes Connect · Internal AI Pilot" })).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.locator('iframe[src*="localhost"], iframe[src*="127.0.0.1"], a[href*="localhost"], a[href*="127.0.0.1"]')).toHaveCount(0);
  });
});
