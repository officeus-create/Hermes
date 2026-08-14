import { expect, test } from "@playwright/test";

const workspace = "/demos/hermes-connect-brand-v1/workspace.html";

test.describe("Hermes Connect Onboarding Business Type Selector", () => {
  test.beforeEach(async ({ page }) => {
    // Listen to console and errors
    page.on('console', msg => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.message}`));

    // Force clean localStorage for onboarding tests, but allow reloads to preserve it
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem('hermes_cleared')) {
        window.localStorage.removeItem('hermes_business_type');
        window.sessionStorage.setItem('hermes_cleared', 'true');
      }
    });
  });

  test("First visit shows onboarding modal, allows selection, persistence, reload retention, and keyboard a11y", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop onboarding flow.");
    
    // 1. Visit workspace with clean state
    await page.goto(workspace);

    // 2. Verify onboarding modal is visible and has correct accessibility attributes
    const modal = page.locator('[data-onboarding-modal]');
    await expect(modal).toHaveClass(/open/);
    const cardContainer = modal.locator('.onboarding-modal-card');
    await expect(cardContainer).toHaveAttribute("role", "dialog");
    await expect(cardContainer).toHaveAttribute("aria-modal", "true");

    // 3. Verify logistics is active by default inside modal
    const logisticsCard = page.locator('.business-type-card[data-onboarding-type="logistics"]');
    await expect(logisticsCard).toHaveClass(/active/);

    // 4. Keyboard Accessibility check: Focus logistics card and press Tab
    await logisticsCard.focus();
    await expect(logisticsCard).toBeFocused();
    await page.keyboard.press("Tab");
    const autoCard = page.locator('.business-type-card[data-onboarding-type="auto_repair"]');
    await expect(autoCard).toBeFocused();

    // 5. Select auto repair card using keyboard Enter key
    await page.keyboard.press("Enter");
    await expect(autoCard).toHaveClass(/active/);
    await expect(logisticsCard).not.toHaveClass(/active/);

    // 6. Launch workspace
    const launchBtn = page.locator('[data-launch-workspace-btn]');
    await launchBtn.click();

    // 7. Verify modal closes
    await expect(modal).not.toHaveClass(/open/);

    // 8. Verify localStorage persistence
    let storedType = await page.evaluate(() => window.localStorage.getItem('hermes_business_type'));
    expect(storedType).toBe("auto_repair");

    // 9. Verify correct vertical is applied
    await expect(page.locator('[data-workspace-name]').first()).toHaveText("Apex Auto & Truck Repair");

    // 10. Reload preserves selection and loads correct vertical directly without onboarding
    await page.reload();
    await expect(modal).not.toHaveClass(/open/);
    await expect(page.locator('[data-workspace-name]').first()).toHaveText("Apex Auto & Truck Repair");
  });

  test("Logistics selection works and configures logistics vertical", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop logistics selection flow.");

    await page.goto(workspace);
    const modal = page.locator('[data-onboarding-modal]');
    await expect(modal).toHaveClass(/open/);

    // Logistics is selected by default, just click launch
    await page.locator('[data-launch-workspace-btn]').click();
    await expect(modal).not.toHaveClass(/open/);

    const storedType = await page.evaluate(() => window.localStorage.getItem('hermes_business_type'));
    expect(storedType).toBe("logistics");
    await expect(page.locator('[data-workspace-name]').first()).toHaveText("Hermes Logistics Ops");
  });

  test("Deep-linking with explicit, controlled context parameters bypasses onboarding and loads correct vertical", async ({ page }) => {
    // 1. Visit workspace with full controlled context parameter
    await page.goto(`${workspace}?source_direction=marketing&business_type=agency&business_subtype=digital_growth&module=proposal`);

    // 2. Verify modal remains closed
    const modal = page.locator('[data-onboarding-modal]');
    await expect(modal).not.toHaveClass(/open/);

    // 3. Verify vertical is set to agency
    await expect(page.locator('[data-workspace-name]').first()).toHaveText("Progresso Growth Lab");
  });

  test("Deep-linking without all four controlled parameters does not bypass onboarding", async ({ page }) => {
    // 1. Visit workspace with incomplete parameter context (only module)
    await page.goto(`${workspace}?module=inbox`);

    // 2. Verify modal remains open
    const modal = page.locator('[data-onboarding-modal]');
    await expect(modal).toHaveClass(/open/);
  });

  test("Mobile first visit shows onboarding, allows selection and launches custom UI", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile onboarding flow.");

    // 1. Visit workspace with clean state
    await page.goto(workspace);

    // 2. Verify modal is visible on mobile
    const modal = page.locator('[data-onboarding-modal]');
    await expect(modal).toHaveClass(/open/);

    // 3. Click fitness card
    const fitnessCard = page.locator('.business-type-card[data-onboarding-type="fitness"]');
    await fitnessCard.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await fitnessCard.click({ force: true });
    await expect(fitnessCard).toHaveClass(/active/);

    // 4. Launch workspace
    const launchBtn = page.locator('[data-launch-workspace-btn]');
    await launchBtn.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await launchBtn.click({ force: true });

    // 5. Verify modal closes and mobile shell shows correctly configured vertical
    await expect(modal).not.toHaveClass(/open/);
    await expect(page.locator('[data-workspace-name]').first()).toHaveText("Northline Performance");
  });
});
