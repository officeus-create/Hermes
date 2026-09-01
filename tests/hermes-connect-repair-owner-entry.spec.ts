import { expect, test } from "@playwright/test";

const repairRoot = "/services/hermes-connect/repair-shops/";

test("registered Repair Shop owner sees one sign-in action on the first mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(repairRoot);

  const prompt = page.locator("[data-repair-owner-prompt]");
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveText("Already registered? Use your existing owner account.");

  const signIn = page.getByRole("link", { name: "Sign in to my shop" });
  await expect(signIn).toHaveCount(1);
  await expect(signIn).toBeVisible();
  await expect(signIn).toHaveAttribute("href", "/services/hermes-connect/repair-shops/auth/?mode=login");

  const box = await signIn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(844);

  await expect(page.locator("[data-repair-free-launch] [data-owner-cta]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Register free" })).toHaveCount(1);
});

test("Russian first-screen owner sign-in preserves locale and reaches login", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${repairRoot}?lang=ru`);

  await expect(page.locator("[data-repair-owner-prompt]")).toHaveText(
    "Уже зарегистрированы? Войдите в существующий аккаунт владельца.",
  );

  const signIn = page.getByRole("link", { name: "Войти в кабинет СТО" });
  await expect(signIn).toHaveCount(1);
  await expect(signIn).toBeVisible();
  await expect(signIn).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru",
  );

  await signIn.click();
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/auth\/\?mode=login&lang=ru$/);
  await expect(page.locator('[data-tab="login"]')).toHaveText("Войти");
});
