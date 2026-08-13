import { expect, test } from "@playwright/test";

const workspace = "/demos/hermes-connect-brand-v1/workspace-v2.html";

test("Hermes Connect service page launches the approved animated workspace", async ({ page }) => {
  await page.goto("/services/hermes-connect/");
  const launch = page.getByRole("link", { name: "Open interactive workspace" });
  await expect(launch).toHaveAttribute("href", workspace);
});

test("Hermes Connect launch workspace keeps explicit demo boundaries, knot identity, and vertical switching", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop launch contract.");
  await page.goto(workspace);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  const app = page.frameLocator("#workspace-frame");
  await expect(app.getByText("Visual prototype", { exact: true })).toBeVisible();
  await expect(app.getByText("● Demo", { exact: true }).first()).toBeVisible();
  await expect(app.locator(".hc-floating-knot")).toBeVisible();
  await expect(app.locator(".hc-floating-knot")).toHaveAttribute("aria-label", "Open Hermes Intelligence");

  await app.locator('[data-workspace-menu]').click();
  await app.locator('[data-vertical="logistics"]').click();
  await expect(app.locator('[data-workspace-name]').first()).toHaveText("Hermes Logistics Ops");

  await app.locator('[data-view="crm"]').click();
  await expect(app.locator('[data-customer-table]')).toContainText("Triple C Auto Transport");

  await app.locator('[data-view="inbox"]').click();
  await expect(app.locator('.conversation-header')).toContainText("Triple C Auto Transport");
  await expect(app.locator('.conversation-thread')).toContainText("Simulated AI");

  await app.locator('[data-view="operations"]').click();
  await expect(app.locator('[data-ops-list]')).toContainText("Simulated");
});

test("Hermes Connect mobile Web launches the same V2 workspace and Hermes Intelligence", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile launch contract.");
  await page.goto(workspace);
  const app = page.frameLocator("#workspace-frame");
  await expect(app.locator('.mobile-bar')).toBeVisible();
  await expect(app.locator('.mobile-nav')).toBeVisible();
  await expect(app.locator('.hc-floating-knot')).toBeVisible();
  await app.locator('.mobile-bar [data-hermes-open]').click();
  await expect(app.locator('[data-hermes-drawer]')).toHaveClass(/open/);
  await expect(app.locator('[data-hermes-drawer]')).toContainText("simulated");
});
