import { expect, test } from "@playwright/test";

const managedLogin = "/services/hermes-connect/home-services/access/?mode=login&managed=mzm-junk-removal";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.hostname === "127.0.0.1" ? route.continue() : route.abort();
  });
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "authentication_required" }),
  }));
});

test("existing MZM managed reviewer is routed to sign-in without owner registration", async ({ page }) => {
  await page.goto(managedLogin, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("Home Services CRM access | Hermes Connect");
  await expect(page.locator("[data-managed-reviewer-note]")).toBeVisible();
  await expect(page.locator("[data-managed-reviewer-note]")).toContainText("Reviewer access is not client-owner activation");
  await expect(page.locator("[data-owner-setup-note]")).toBeHidden();
  await expect(page.locator('[data-auth-mode="register"]')).toBeHidden();
  await expect(page.locator("[data-register-form]")).toBeHidden();
  await expect(page.locator("[data-login-form]")).toBeVisible();
  await expect(page.locator('[data-auth-mode="login"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
});

test("ordinary Home Services owners retain the existing registration path", async ({ page }) => {
  await page.goto("/services/hermes-connect/home-services/access/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-managed-reviewer-note]")).toBeHidden();
  await expect(page.locator('[data-auth-mode="register"]')).toBeVisible();
  await expect(page.locator("[data-register-form]")).toBeVisible();
  await expect(page.locator("[data-login-form]")).toBeHidden();
});

test("expired managed CRM session returns to the same company reviewer login", async ({ page }) => {
  await page.route("**/api/hermes-connect/home-services/crm?**", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "authentication_required" }),
  }));
  await page.goto("/services/hermes-connect/home-services/workspace/?managed=mzm-junk-removal", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/services\/hermes-connect\/home-services\/access\/\?mode=login&managed=mzm-junk-removal$/);
  await expect(page.locator("[data-managed-reviewer-note]")).toBeVisible();
  await expect(page.locator("[data-login-form]")).toBeVisible();
});

test("managed MZM reviewer locale links retain canonical company and login mode on desktop and mobile", async ({ page }) => {
  await page.goto(managedLogin, { waitUntil: "domcontentloaded" });
  for (const selector of [".language-menu a[lang='ru']", ".mobile-language-switcher a[lang='uk']"]) {
    await expect.poll(() => page.locator(selector).getAttribute("href")).toContain("managed=mzm-junk-removal");
    const href = await page.locator(selector).getAttribute("href");
    const target = new URL(String(href), "http://127.0.0.1");
    expect(target.pathname).toBe("/services/hermes-connect/home-services/access/");
    expect(target.searchParams.get("managed")).toBe("mzm-junk-removal");
    expect(target.searchParams.get("mode")).toBe("login");
    expect(target.searchParams.get("lang")).toBe(selector.includes("'ru'") ? "ru" : "uk");
  }
  await page.goto("/services/hermes-connect/home-services/access/?lang=ru&managed=mzm-junk-removal&mode=login", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-managed-reviewer-note]")).toBeVisible();
  await expect(page.locator("[data-login-form]")).toBeVisible();
  await expect(page.locator("[data-register-form]")).toBeHidden();
});

test("managed MZM workspace language switching preserves its existing company scope", async ({ page }) => {
  await page.route("**/api/hermes-connect/home-services/crm?**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, company: { name: "MZM Junk Removal", slug: "mzm-junk-removal", readOnly: true, accessRole: "viewer" }, metrics: { totalLeads: 0 }, recentLeads: [], leads: [] }),
  }));
  await page.goto("/services/hermes-connect/home-services/workspace/?managed=mzm-junk-removal", { waitUntil: "domcontentloaded" });
  for (const selector of [".language-menu a[lang='es']", ".mobile-language-switcher a[lang='ru']"]) {
    await expect.poll(() => page.locator(selector).getAttribute("href")).toContain("managed=mzm-junk-removal");
    const target = new URL(String(await page.locator(selector).getAttribute("href")), "http://127.0.0.1");
    expect(target.pathname).toBe("/services/hermes-connect/home-services/workspace/");
    expect(target.searchParams.get("managed")).toBe("mzm-junk-removal");
    expect(target.searchParams.has("mode")).toBe(false);
  }
});
