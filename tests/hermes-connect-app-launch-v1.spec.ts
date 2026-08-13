import { expect, test } from "@playwright/test";

const workspace = "/demos/hermes-connect-brand-v1/workspace.html";

test("Hermes Connect service page launches the interactive workspace", async ({ page }) => {
  await page.goto("/services/hermes-connect/");
  const launch = page.getByRole("link", { name: "Open interactive workspace" });
  await expect(launch).toHaveAttribute("href", workspace);
});

test("Hermes Connect launch workspace keeps explicit demo boundaries and switches vertical data", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop launch contract.");
  await page.goto(workspace);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.getByText("Visual prototype", { exact: true })).toBeVisible();
  await expect(page.getByText("● Demo", { exact: true }).first()).toBeVisible();

  await page.locator('[data-workspace-menu]').click();
  await page.locator('[data-vertical="logistics"]').click();
  await expect(page.locator('[data-workspace-name]').first()).toHaveText("Hermes Logistics Ops");

  await page.locator('[data-view="crm"]').click();
  await expect(page.locator('[data-customer-table]')).toContainText("Triple C Auto Transport");

  await page.locator('[data-view="inbox"]').click();
  await expect(page.locator('.conversation-header')).toContainText("Triple C Auto Transport");
  await expect(page.locator('.conversation-thread')).toContainText("Simulated AI");

  await page.locator('[data-view="operations"]').click();
  await expect(page.locator('[data-ops-list]')).toContainText("Simulated");
});

test("Hermes Connect mobile Web launches the same workspace and Hermes Intelligence", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile launch contract.");
  await page.goto(workspace);
  await expect(page.locator('.mobile-bar')).toBeVisible();
  await expect(page.locator('.mobile-nav')).toBeVisible();
  await page.locator('.mobile-bar [data-hermes-open]').click();
  await expect(page.locator('[data-hermes-drawer]')).toHaveClass(/open/);
  await expect(page.locator('[data-hermes-drawer]')).toContainText("simulated");
});
