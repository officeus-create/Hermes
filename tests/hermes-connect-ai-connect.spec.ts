import { expect, test } from "@playwright/test";

test.describe("Hermes Connect AI Connect", () => {
  test("keeps AI Connect internal and denies an anonymous visitor", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "not_authenticated" }),
    }));
    await page.goto("/services/hermes-connect/internal/ai-connect/");
    await expect(page).toHaveTitle(/AI Connect \| Hermes Connect/);
    await expect(page.locator("[data-hc-product-context]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Connect" })).toBeVisible();
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.locator("[data-ai-connect-content]")).toHaveClass(/hidden/);
  });

  test("shows the live project/runtime overview only after internal-owner authorization", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        runtime: { online: true },
        active_task: { id: "hcai_demo", status: "running", updated_at: "2026-08-28T08:00:00.000Z" },
        latest_task: null,
      }),
    }));
    await page.goto("/services/hermes-connect/internal/ai-connect/");
    await expect(page.locator("[data-ai-connect-content]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hermes Connect · Internal AI Pilot" })).toBeVisible();
    await expect(page.locator("[data-runner-state]")).toHaveText("Online");
    await expect(page.locator("[data-active-task]")).toHaveText("hcai_demo");
    await expect(page.locator("[data-task-status]")).toHaveText("running");
    await expect(page.getByRole("link", { name: /Open AI Assistant/i })).toHaveAttribute("href", "/services/hermes-connect/internal/ai-assistant/");
  });

  test("stays usable at 390px and exposes no localhost/FCC admin surface", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "hermes_internal_owner_required" }),
    }));
    await page.goto("/services/hermes-connect/internal/ai-connect/");
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.getByText("Internal owner capability required")).toBeVisible();
    await expect(page.locator('iframe[src*="127.0.0.1"]')).toHaveCount(0);
    await expect(page.locator('a[href*="127.0.0.1:8082"]')).toHaveCount(0);
  });
});
