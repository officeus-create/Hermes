import { expect, test } from "@playwright/test";

test("Hermes Connect Product Hub keeps explicit Russian locale after shared runtimes settle", async ({ page }) => {
  await page.goto("/services/hermes-connect/?lang=ru", { waitUntil: "domcontentloaded" });

  const hub = page.locator(".hc-brand-page");
  await expect(hub).toHaveAttribute("data-hc-hub-locale", "ru");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator(".hc-hero h1")).toContainText("Управляйте бизнесом");
  await expect(page.locator(".hc-language-menu strong")).toContainText("Русский");
  await expect(page.locator(".hc-content-language")).toContainText("Язык контента: русский");

  // The regression only appeared after the shared Hermes Connect shell finished mutating the DOM.
  await page.waitForTimeout(1200);

  await expect(hub).toHaveAttribute("data-hc-hub-locale", "ru");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator(".hc-hero h1")).toContainText("Управляйте бизнесом");
  await expect(page.locator(".hc-hero h1")).toContainText("с AI.");
  await expect(page.locator(".hc-truth")).toContainText("СТО уже работает");
  await expect(page.getByRole("heading", { name: "Какая конфигурация Hermes Connect работает сейчас?" })).toBeVisible();

  const localizedLinks = await page.locator(".hc-brand-page a[href^='/services/hermes-connect/'], .hc-brand-page a[href^='/load-board/']").evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).href),
  );
  expect(localizedLinks.length).toBeGreaterThan(0);
  for (const href of localizedLinks) expect(new URL(href).searchParams.get("lang")).toBe("ru");
});

test("Hermes Connect Product Hub restores a previously selected Russian locale on a clean URL", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("hermes-connect-language", "ru"));
  await page.goto("/services/hermes-connect/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/services\/hermes-connect\/\?lang=ru$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator(".hc-brand-page")).toHaveAttribute("data-hc-hub-locale", "ru");
  await expect(page.locator(".hc-hero h1")).toContainText("Управляйте бизнесом");
  await expect(page.locator(".hc-truth")).toContainText("СТО уже работает");
});
