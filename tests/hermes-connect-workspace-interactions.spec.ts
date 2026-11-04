import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/workspace.html";

test("Hermes Connect workspace navigates core desktop modules and opens Hermes Intelligence", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interaction contract.");
  await page.addInitScript(() => {
    window.localStorage.setItem('hermes_business_type', 'beauty');
  });
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
  await page.addInitScript(() => {
    window.localStorage.setItem('hermes_business_type', 'logistics');
  });
  await page.goto(route);

  await page.locator('[data-workspace-menu]').click();
  await page.locator('[data-vertical="logistics"]').click();
  await expect(page.locator('[data-workspace-name]').first()).toHaveText("Hermes Logistics Ops");
  await expect(page.locator('[data-kpi="revenue"]')).toHaveText("$14,620");
  await expect(page.locator('[data-activity-list]')).toContainText("load opportunities");
});

test("Hermes Connect mobile browser uses task-first progressive disclosure", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile interaction contract.");
  await page.addInitScript(() => {
    window.localStorage.setItem('hermes_business_type', 'logistics');
  });
  await page.goto(route);

  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('.mobile-bar')).toBeVisible();
  const mobileNav = page.locator('.mobile-nav');
  await expect(mobileNav).toBeVisible();
  for (const label of ["Today", "Inbox", "Customers", "Calendar", "More"]) {
    await expect(mobileNav.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(mobileNav.locator('[data-hermes-open]')).toHaveCount(0);

  await mobileNav.locator('[data-mobile-view="calendar"]').click({ force: true });
  await expect(page.locator('[data-view-panel="calendar"]')).toBeVisible();
  await expect(page.locator('[data-view-title]')).toHaveText("Calendar");
  await expect(page.locator('[data-mobile-hermes-entry]')).toHaveAttribute("aria-label", "Ask Hermes about Calendar");

  const more = mobileNav.locator('[data-mobile-more]');
  await more.click({ force: true });
  await expect(more).toHaveAttribute("aria-expanded", "true");
  const sheet = page.locator('[data-mobile-more-sheet]');
  await expect(sheet).toHaveClass(/open/);
  await expect(sheet).toContainText("Sales");
  await expect(sheet).toContainText("Marketing");
  await expect(sheet).toContainText("Finance");
  await expect(sheet).toContainText("Operations");
  await expect(sheet).toContainText("Integrations");
  await expect(sheet).toContainText("Academy");

  await sheet.locator('[data-mobile-view="operations"]').click({ force: true });
  await expect(sheet).not.toHaveClass(/open/);
  await expect(page.locator('[data-view-panel="operations"]')).toBeVisible();
  await expect(page.locator('[data-view-title]')).toHaveText("Operations");
  await expect(more).toHaveClass(/active/);

  await page.locator('.mobile-bar [data-hermes-open]').click({ force: true });
  const drawer = page.locator('[data-hermes-drawer]');
  await expect(drawer).toHaveClass(/open/);
  await expect(drawer.locator('[data-hermes-context]')).toContainText("Hermes Logistics Ops · Operations");
});

test("Hermes Connect review hub exposes only canonical review surfaces", async ({ page }) => {
  await page.goto("/demos/hermes-connect/review.html");
  await expect(page).toHaveTitle(/Review Hub/);
  await expect(page.getByText("Responsive Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Request Access", { exact: true })).toBeVisible();
  await expect(page.getByText("AI Sales Coach", { exact: true })).toBeVisible();
  await expect(page.getByText("Mobile Web", { exact: true })).toHaveCount(0);
  await expect(page.locator('a[href*="hermes-connect-brand-v1"], a[href*="workspace-v2"], a[href*="mobile.html"]')).toHaveCount(0);
});
