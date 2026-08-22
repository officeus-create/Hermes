import { expect, test } from "@playwright/test";

test.describe("Hermes Connect Beauty B1 CEO preview", () => {
  test("desktop keeps B1 scope truthful and architecture visible", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/services/hermes-connect/beauty/workspace-preview/", { waitUntil: "domcontentloaded" });

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByText("CEO PREVIEW", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your salon foundation, in one calm workspace." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Salon profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "People in this salon" })).toBeVisible();
    await expect(page.getByText("Existing Hermes session")).toBeVisible();
    await expect(page.getByText("beauty_salon")).toBeVisible();
    await expect(page.getByText("Shared services model")).toBeVisible();
    await expect(page.getByText("Appointments · deferred")).toBeVisible();
    await expect(page.getByText("Payments · deferred")).toBeVisible();
    await expect(page.getByText("Clinical / medical data · excluded")).toBeVisible();
    await expect(page.getByText("Revenue metrics · no evidence")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/live revenue|live utilization|live appointments/i);
  });

  test("390px uses mobile owner shell without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services/hermes-connect/beauty/workspace-preview/", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(page.locator(".mobile-head")).toBeVisible();
    await expect(page.locator(".mobile-nav")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Salon profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "People in this salon" })).toBeVisible();

    const geometry = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      mainId: document.querySelector("main")?.id || "",
    }));
    expect(geometry.mainId).toBe("main-content");
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width + 1);
  });
});
