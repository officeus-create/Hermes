import { expect, test, type Page } from "@playwright/test";

const workspace = "/demos/hermes-connect/workspace.html";

async function resetHermesBrowserState(page: Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }
    localStorage.removeItem("hermes_business_type");
    sessionStorage.clear();
  });
}

test.describe("Hermes Connect Academy and Beauty module integration", () => {
  test.beforeEach(async ({ page }) => {
    await resetHermesBrowserState(page);
  });

  test("Beauty controlled context opens Salon OS and returns to the same Beauty workspace", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop module handoff flow.");

    const beautyContext = `${workspace}?source_direction=beauty&business_type=beauty&business_subtype=salon&module=home`;
    await page.goto(beautyContext);

    const onboarding = page.locator("[data-onboarding-modal]");
    await expect(onboarding).not.toHaveClass(/open/);
    await expect(page.locator("[data-workspace-name]").first()).toHaveText("Aurelia Studio");

    const salonEntry = page.locator("[data-vertical-module-entry]");
    await expect(salonEntry).toBeVisible();
    await expect(salonEntry).toHaveAttribute("href", "./beauty-salon.html");
    await expect(salonEntry).toContainText("Beauty Salon OS");

    await salonEntry.click();
    await expect(page).toHaveURL(/\/demos\/hermes-connect\/beauty-salon\.html$/);
    await expect(page.locator("h1")).toContainText("Fill the calendar");

    const commandCenter = page.locator('[data-workspace-entry]').filter({ hasText: "Command Center" });
    await expect(commandCenter).toBeVisible();
    await commandCenter.click();

    await expect(page).toHaveURL(/workspace\.html\?source_direction=beauty&business_type=beauty&business_subtype=salon&module=home$/);
    await expect(page.locator("[data-onboarding-modal]")).not.toHaveClass(/open/);
    await expect(page.locator("[data-workspace-name]").first()).toHaveText("Aurelia Studio");
    await expect(page.locator("[data-vertical-module-entry]")).toBeVisible();
  });

  test("Academy panel exposes the full Academy Hub inside the canonical workspace", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop Academy module flow.");

    await page.goto(`${workspace}?source_direction=marketing&business_type=agency&business_subtype=digital_growth&module=academy`);
    await expect(page.locator("[data-onboarding-modal]")).not.toHaveClass(/open/);

    await page.locator('[data-view="academy"]').click();
    await expect(page.locator('[data-view-panel="academy"]')).toHaveClass(/active/);

    const academyEntry = page.locator("[data-academy-hub-entry]");
    await expect(academyEntry).toBeVisible();
    await expect(academyEntry).toHaveAttribute("href", "./academy.html");
    await expect(academyEntry).toContainText("Open Academy Hub");

    await academyEntry.click();
    await expect(page).toHaveURL(/\/demos\/hermes-connect\/academy\.html$/);
    await expect(page.locator("h1")).toContainText("Learn it. Explain it. Practice it. Prove readiness.");
    await expect(page.getByText("DAILY CONTROL LOOP · DEMO")).toBeVisible();
    await expect(page.getByText("REVIEWER QUEUE · DEMO")).toBeVisible();
  });
});
