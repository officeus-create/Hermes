import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

test("KNB Academy owner path defaults to Ukrainian, prefills bounded public facts, and switches to English", async ({ page, isMobile }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(ok({ success: false, error: "not_authenticated" }, 401)));

  await page.goto("/services/hermes-connect/academy/business/auth/?mode=register&business=kons-na-bis&lang=uk", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByRole("heading", { name: "CRM, яка підлаштовується під академію, курси або бізнес-клуб." })).toBeVisible();
  await expect(page.locator('input[name="businessName"]')).toHaveValue("Конс на Бі$");
  await expect(page.locator('select[name="academyType"]')).toHaveValue("business_club");
  await expect(page.locator('input[name="website"]')).toHaveValue("https://kons-na-bis.com/");
  await expect(page.locator('input[name="countryCode"]')).toHaveValue("UA");
  await expect(page.locator('input[name="city"]')).toHaveValue("Біла Церква");
  await expect(page.locator('input[name="region"]')).toHaveValue("Київська область");
  await expect(page.locator('input[name="phone"]')).not.toHaveValue("");
  await expect(page.locator('input[name="timezone"]')).toHaveValue("Europe/Kyiv");
  await expect(page.locator('input[name="catalogOptIn"]')).not.toBeChecked();

  if (isMobile) {
    await page.locator("[data-menu-button]").click();
    await page.locator('.mobile-language-switcher a[lang="en"]').click();
  } else {
    await page.locator('[data-language-menu] summary').click();
    await page.locator('[data-language-menu] a[lang="en"]').click();
  }
  await expect(page).toHaveURL(/business=kons-na-bis/);
  await expect.poll(() => new URL(page.url()).searchParams.get("lang") ?? "en").toBe("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "A CRM adapted to an academy, courses, or a business club." })).toBeVisible();
  await expect(page.locator('input[name="businessName"]')).toHaveValue("Конс на Бі$");
});

test("Academy owner registration persists business profile and routes into the vertical CRM", async ({ page }) => {
  let registered = false;
  let savedBody: Record<string, unknown> | null = null;

  await page.route("**/api/auth/me", (route) => route.fulfill(registered
    ? ok({ success: true, specialist: { id: "academy-owner-1", name: "Academy Owner", email: "owner@example.com", role: "Academy Business Owner" } })
    : ok({ success: false, error: "not_authenticated" }, 401)));

  await page.route("**/api/auth/register", async (route) => {
    registered = true;
    const body = route.request().postDataJSON();
    return route.fulfill(ok({ success: true, specialist: { id: "academy-owner-1", name: body.name, email: body.email, role: body.role } }, 201));
  });

  await page.route("**/api/hermes-connect/academy/business", async (route) => {
    if (route.request().method() === "GET") return route.fulfill(ok({ success: true, academyBusiness: null }));
    savedBody = route.request().postDataJSON();
    return route.fulfill(ok({
      success: true,
      academyBusiness: { businessName: savedBody?.businessName, slug: "demo-academy-owner1", academyType: savedBody?.academyType, catalogOptIn: savedBody?.catalogOptIn },
      catalog: { listed: true, status: "self_submitted", profileUrl: "/businesses/connect/academy/demo-academy-owner1/" },
      next_url: "/services/hermes-connect/academy/business/workspace/",
    }));
  });

  await page.goto("/services/hermes-connect/academy/business/auth/?mode=register&lang=uk", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="name"]').fill("Academy Owner");
  await page.locator('input[name="email"]').first().fill("owner@example.com");
  await page.locator('input[name="location"]').fill("Kyiv, Ukraine");
  await page.locator('input[name="password"]').first().fill("correct-horse-123");
  await page.getByRole("button", { name: "Створити акаунт власника" }).click();

  await expect(page.locator("[data-business-setup]")).toBeVisible();
  await page.locator('input[name="businessName"]').fill("Demo Academy");
  await page.locator('select[name="academyType"]').selectOption("business_academy");
  await page.locator('input[name="city"]').fill("Kyiv");
  await page.locator('input[name="catalogOptIn"]').check();

  await Promise.all([
    page.waitForURL(/\/services\/hermes-connect\/academy\/business\/workspace\/$/),
    page.getByRole("button", { name: "Зберегти та відкрити Academy CRM" }).click(),
  ]);

  expect(savedBody).toMatchObject({
    businessName: "Demo Academy",
    academyType: "business_academy",
    city: "Kyiv",
    countryCode: "UA",
    catalogOptIn: true,
  });
});


test("KNB Catalog strategy case is mobile-safe, bilingual, and preserves the organic-first readiness gate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/businesses/concepts/kons-na-bis/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByRole("heading", { name: "Конс на Бі$ Organic → Paid Learning → Offer → CRM" })).toBeVisible();
  await expect(page.getByText("77.1K", { exact: true })).toBeVisible();
  await expect(page.getByText("TASK 1 · INSTAGRAM AUDIT", { exact: true })).toBeVisible();
  await expect(page.getByText("TASK 2 · 7-WEEK PROGRAM FUNNEL", { exact: true })).toBeVisible();
  await expect(page.getByText("DIAGNOSTIC LENSES · PROVIDED TRAINING", { exact: true })).toBeVisible();
  await expect(page.getByText("Перша рекомендація — не таргет, а internal audit + organic programming.")).toBeVisible();
  await expect(page.getByText("Funnel можна проектувати, але валідовувати — тільки після readiness gate.")).toBeVisible();

  const auditCta = page.getByRole("link", { name: "Обговорити ціль і бюджет →" }).last();
  await expect(auditCta).toHaveAttribute("href", /\/businesses\/request\/\?type=marketing-package&months=3/);
  await expect(auditCta).toHaveAttribute("href", /utm_campaign=knb_marketing_case/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);

  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Want the same type of audit for your business?" })).toBeVisible();
  await expect(page.getByText("Six places where marketing can lose money before funnel optimization.")).toBeVisible();
});
