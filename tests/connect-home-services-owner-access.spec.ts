import { test, expect } from "@playwright/test";

test("Home Services owner setup is English-first and does not preselect Catalog publication", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401, contentType: "application/json",
    body: JSON.stringify({ success: false, error: "authentication_required" }),
  }));
  await page.goto("/services/hermes-connect/home-services/access/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "One account. Your Home Services CRM." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('[data-auth-panel]')).toBeVisible();
  await expect(page.locator('[data-company-panel]')).toBeHidden();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("[data-login-form]")).toBeVisible();
  await expect(page.locator("[data-register-form]")).toBeHidden();
});

test("Home Services owner gets private-company setup and explicit Catalog opt-in only", async ({ page }) => {
  let catalogPermission: boolean | null = null;
  let company: Record<string, unknown> | null = null;
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401, contentType: "application/json",
    body: JSON.stringify({ success: false, error: "authentication_required" }),
  }));
  // Stub read-only workspace data so this test cannot create real leads or public pages.
  await page.route("**/api/hermes-connect/home-services/crm**", (route) => {
    const isLeads = new URL(route.request().url()).searchParams.get("module") === "leads";
    return route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify(isLeads
        ? { success: true, leads: [] }
        : { success: true, company: { name: "Synthetic QA Removal", slug: "synthetic-qa",
            catalogOptIn: false, catalogStatus: "self_submitted" }, profile: null,
          metrics: { totalLeads: 0, bookedRate: null, reviewRate: null, byCity: [], bySource: [], byJobType: [], bySearchQuery: [] } }) });
  });
  await page.route("**/api/auth/login", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ success: true }),
  }));
  await page.route("**/api/hermes-connect/company", async (route) => {
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON();
      catalogPermission = input.catalogOptIn;
      expect(input.companyType).toBe("home_service");
      expect(input.countryCode).toBe("US");
      company = { id: "synthetic-test-only", companyType: "home_service", catalogOptIn: input.catalogOptIn,
        companyName: input.companyName, city: input.city, state: input.state };
      await route.fulfill({ status: 200, contentType: "application/json",
        body: JSON.stringify({ success: true, company }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ success: true, company }) });
  });
  await page.goto("/services/hermes-connect/home-services/access/?mode=login", { waitUntil: "domcontentloaded" });
  await page.locator('[data-login-form] input[name="email"]').fill("qa-owner@example.invalid");
  await page.locator('[data-login-form] input[name="password"]').fill("synthetic-test-password");
  await page.locator('[data-login-form] button[type="submit"]').click();
  await expect(page.locator("[data-company-panel]")).toBeVisible();
  await expect(page.locator('[data-company-form] input[name="catalogOptIn"]')).not.toBeChecked();
  await page.locator('[data-company-form] input[name="companyName"]').fill("Synthetic QA Removal (test only)");
  await page.locator('[data-company-form] input[name="city"]').fill("Roseville");
  await page.locator('[data-company-form] input[name="state"]').fill("CA");
  await page.locator('[data-company-form] button[type="submit"]').click();
  await expect.poll(() => catalogPermission).toBe(false);
  await expect(page).toHaveURL(/\/services\/hermes-connect\/home-services\/workspace\/$/);
  await expect(page.locator("[data-catalog-link]")).toBeHidden();
  await expect(page.locator("[data-catalog-private]")).toContainText("Catalog private");
  await expect(page.locator('[data-kpi="bookedRate"]')).toHaveText("UNKNOWN");
  await expect(page.locator('[data-kpi="reviewRate"]')).toHaveText("UNKNOWN");
});

test("Home Services owner setup refuses to overwrite a different existing company type", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { id: "qa-existing", name: "QA" } }),
  }));
  await page.route("**/api/hermes-connect/company", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, company: { id: "qa-other", companyType: "carrier" } }),
  }));
  await page.goto("/services/hermes-connect/home-services/access/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-company-panel]")).toBeVisible();
  await expect(page.locator("[data-company-form]")).toBeHidden();
  await expect(page.locator("[data-company-message]")).toContainText("blocked");
});
