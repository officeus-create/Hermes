import type { Page } from "@playwright/test";

export const REPAIR_REGISTRATION_ACTIVE_NOW = "2026-09-14T12:00:00Z";

export async function freezeRepairRegistrationOpen(page: Page) {
  const fixedNow = Date.parse(REPAIR_REGISTRATION_ACTIVE_NOW);
  await page.addInitScript((value) => {
    Date.now = () => value;
  }, fixedNow);
}
