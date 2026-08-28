import { expect, test } from "@playwright/test";

test.describe("Hermes Connect internal AI Assistant", () => {
  test("keeps the internal assistant in the Hermes Connect shell and denies an anonymous visitor", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }));
    await page.goto("/services/hermes-connect/internal/ai-assistant/");
    await expect(page).toHaveTitle(/AI Assistant \| Hermes Connect/);
    await expect(page.locator("[data-hc-product-context]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Assistant" })).toBeVisible();
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.getByText("Use your Hermes Connect account, then reopen this internal route.")).toBeVisible();
    await expect(page.locator("[data-ai-content]")).toHaveClass(/hidden/);
    await expect(page.locator('a[href="/services/hermes-connect/owner/"]')).toHaveCount(0);
  });

  test("is usable at 390px without exposing a remote shell", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/hermes-connect/internal/ai-assistant/");
    await expect(page.getByRole("heading", { name: "AI Assistant" })).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.getByText(/remote terminal/i)).toHaveCount(0);
  });

  test("renders the native cabinet entry only after the server confirms the internal owner capability", async ({ page }) => {
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, runtime: {}, active_task: null, latest_task: null }) }));
    await page.goto("/services/hermes-connect/");
    await expect(page.locator("[data-hc-internal-ai-link]")).toHaveText("AI Connect");
    await expect(page.locator("[data-hc-internal-ai-link]")).toHaveAttribute("href", "/services/hermes-connect/internal/ai-connect/");
  });

  test("does not render the internal cabinet entry for anonymous or non-owner sessions", async ({ page }) => {
    let status = 401;
    await page.route("**/api/internal-ai/status", (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: false, error: status === 401 ? "not_authenticated" : "hermes_internal_owner_required" }) }));
    await page.goto("/services/hermes-connect/");
    await expect(page.locator("[data-hc-internal-ai-link]")).toHaveCount(0);
    status = 403;
    await page.reload();
    await expect(page.locator("[data-hc-internal-ai-link]")).toHaveCount(0);
  });
});
