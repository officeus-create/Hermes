import { expect, test } from "@playwright/test";

const repairRoot = "/services/hermes-connect/repair-shops/";

test("registered Repair Shop owner sees sign-in immediately on mobile landing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(repairRoot);

  const entry = page.locator("[data-repair-owner-entry]");
  await expect(entry).toBeVisible();
  await expect(entry.locator(".repair-owner-entry__prompt")).toHaveText("Already registered?");

  const signIn = entry.locator("[data-repair-owner-signin]");
  await expect(signIn).toBeVisible();
  await expect(signIn).toHaveText("Sign in to my shop");
  await expect(signIn).toHaveAttribute("href", "/services/hermes-connect/repair-shops/auth/");

  const isBeforeLead = await page.evaluate(() => {
    const entryNode = document.querySelector("[data-repair-owner-entry]");
    const lead = document.querySelector(".repair-live-hero .repair-lead");
    if (!entryNode || !lead) return false;
    return Boolean(entryNode.compareDocumentPosition(lead) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(isBeforeLead).toBe(true);
});

test("Russian owner sign-in preserves locale and reaches login", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${repairRoot}?lang=ru`);

  const entry = page.locator("[data-repair-owner-entry]");
  await expect(entry).toBeVisible();
  await expect(entry.locator(".repair-owner-entry__prompt")).toHaveText("Уже зарегистрированы?");

  const signIn = entry.locator("[data-repair-owner-signin]");
  await expect(signIn).toHaveText("Войти в кабинет СТО");
  await expect(signIn).toHaveAttribute("href", "/services/hermes-connect/repair-shops/auth/?lang=ru");

  await signIn.click();
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/auth\/\?lang=ru$/);
  await expect(page.locator('[data-tab="login"]')).toHaveText("Войти");
});
