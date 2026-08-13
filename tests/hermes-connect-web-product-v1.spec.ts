import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect-brand-v1/workspace.html";

test("Hermes Connect workspace navigates core desktop modules and opens Hermes Intelligence", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interaction contract.");
  await page.goto(route);

  await expect(page).toHaveTitle(/Hermes Connect · Workspace/);
  await expect(page.locator('[data-view-panel="home"]')).toBeVisible();
  await expect(page.locator('[data-view-title]')).toContainText("Good morning");

  await page.locator('[data-view="inbox"]').click();
  await expect(page.locator('[data-view-panel="inbox"]')).toBeVisible();
  await expect(page.locator('[data-view-title]')).toHaveText("Conversations");

  await page.locator('[data-view="crm"]').click();
  await expect(page.locator('[data-view-panel="crm"]')).toBeVisible();
  await expect(page.locator('[data-customer-table]')).toContainText("Anna Martinez");

  await page.locator('[data-view="sales"]').click();
  await expect(page.locator('[data-sales-kanban]')).toContainText("Qualified");

  await page.locator('[data-view="integrations"]').click();
  await expect(page.locator('[data-integration-grid]')).toContainText("Gmail");

  await page.locator('[data-hermes-open]').first().click();
  await expect(page.locator('[data-hermes-drawer]')).toHaveClass(/open/);
  await expect(page.locator('[data-hermes-drawer]')).toContainText("One intelligence across your business");
  await page.locator('[data-hermes-close]').click();
  await expect(page.locator('[data-hermes-drawer]')).not.toHaveClass(/open/);
});

test("Hermes Connect workspace switches industry context", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop workspace-switcher contract.");
  await page.goto(route);

  await page.locator('[data-workspace-menu]').click();
  await page.locator('[data-vertical="logistics"]').click();
  await expect(page.locator('[data-workspace-name]').first()).toHaveText("Hermes Logistics Ops");
  await expect(page.locator('[data-kpi="revenue"]')).toHaveText("$14,620");
  await expect(page.locator('[data-activity-list]')).toContainText("load opportunities");
});

test("Hermes Connect mobile web uses the shared product shell", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile interaction contract.");
  await page.goto(route);

  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('.mobile-bar')).toBeVisible();
  await expect(page.locator('.mobile-nav')).toBeVisible();

  await page.locator('[data-mobile-view="inbox"]').click();
  await expect(page.locator('[data-view-panel="inbox"]')).toBeVisible();
  await expect(page.locator('[data-view-title]')).toHaveText("Conversations");

  await page.locator('.mobile-bar [data-hermes-open]').click();
  await expect(page.locator('[data-hermes-drawer]')).toHaveClass(/open/);
});

test("Hermes Connect review hub exposes the four visual review surfaces", async ({ page }) => {
  await page.goto("/demos/hermes-connect-brand-v1/review.html");
  await expect(page).toHaveTitle(/Visual Review Hub/);
  await expect(page.getByText("Web Brand Lab", { exact: true })).toBeVisible();
  await expect(page.getByText("Hermes Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Mobile Web", { exact: true })).toBeVisible();
  await expect(page.getByText("AI Sales Coach", { exact: true })).toBeVisible();
});
