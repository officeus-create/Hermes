import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const visibleOffer = "[data-repair-free-launch]:visible";

async function freezeNow(page: Page, iso: string) {
  const fixedNow = Date.parse(iso);
  await page.addInitScript((value) => {
    Date.now = () => value;
  }, fixedNow);
}

test("Repair Shop policy keeps setup access free without a date cutoff and preserves truthful billing", async () => {
  const [policy, component, registerApi, profileApi] = await Promise.all([
    readFile(new URL("../src/data/hermes-connect-repair-shop-launch.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RepairShopFreeLaunchOffer.astro", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/auth/register.ts", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/repair-shop/profile.ts", import.meta.url), "utf8"),
  ]);

  expect(policy).toContain("REPAIR_SHOP_SETUP_ACCESS_ENABLED = true");
  expect(policy).toContain("REPAIR_SHOP_SETUP_ACCESS_PRICE_USD = 0");
  expect(policy).toContain("REPAIR_SHOP_FOUNDING_PRICE_USD = 99");
  expect(policy).toContain("REPAIR_SHOP_CATALOG_LISTING_FEE_USD = 0");
  expect(policy).toContain("REPAIR_SHOP_ONLINE_BILLING_ENABLED = false");
  expect(policy).toContain('id: "repair_shop_free_during_setup_2026"');
  expect(policy).toContain('catalogPublication: "owner-approved-public-facts-only"');
  expect(policy).toContain('discoveryScope: ["seo", "geo", "local-search", "ai-discovery"]');
  expect(policy).toContain("searchResultsGuaranteed: false");

  expect(component).toContain("Use Hermes Connect free while we configure it for your shop.");
  expect(component).toContain("The standard Founding Shop price is $99/month.");
  expect(component).toContain("free public Hermes Catalog listing");
  expect(component).toContain("Search engines control indexing and rankings");
  expect(component).not.toContain("Free-registration countdown");
  expect(component).not.toContain("closeFreeRegistrationUi");
  expect(component).not.toContain("free_registration_through_2026_09_15");

  expect(registerApi).toContain('role === "Shop Owner" && !REPAIR_SHOP_SETUP_ACCESS_ENABLED');
  expect(registerApi).toContain("repair_shop_setup_access_closed");
  expect(registerApi).not.toContain("REPAIR_SHOP_FREE_REGISTRATION_END_MS");
  expect(profileApi).toContain("!REPAIR_SHOP_SETUP_ACCESS_ENABLED");
  expect(profileApi).toContain("repair_shop_setup_access_closed");
  expect(profileApi).not.toContain("REPAIR_SHOP_FREE_REGISTRATION_END_MS");
});

test("built Repair Shop HTML exposes the current free-setup offer", async ({ request }) => {
  const response = await request.get("/services/hermes-connect/repair-shops/");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('data-launch-state="open"');
  expect(html).toContain('data-setup-price="0"');
  expect(html).toContain('data-founding-price="99"');
  expect(html).toContain("Use Hermes Connect free while we configure it for your shop.");
  expect(html).not.toContain("Free repair shop registration ended September 15.");
});

test("Repair Shop landing shows Russian free setup on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });

  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-launch-state", "open");
  await expect(offer).toContainText("Пользуйтесь Hermes Connect бесплатно, пока мы настраиваем систему под ваше СТО.");
  await expect(offer).toContainText("Стандартная цена Founding Shop — $99 в месяц.");
  await expect(offer).toContainText("Hermes Catalog");
  await expect(offer.getByRole("link", { name: "Начать бесплатную настройку" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru",
  );

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("owner login stays operational without conversion offer pressure", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }),
  );
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#login-form")).toHaveClass(/active/);
  await expect(page.locator(visibleOffer)).toHaveCount(0);
});

test("direct Spanish registration opens the current free-setup path", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }),
  );
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=es", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
  await expect(page.locator("#register-form")).toHaveClass(/active/);
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toContainText("Usa Hermes Connect gratis mientras configuramos el sistema para tu taller.");
  await expect(offer.getByRole("link", { name: "Empezar configuración gratis" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=es",
  );
});

test("Founding Plan page presents free setup as the lower-friction first step", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/plan/?lang=uk", { waitUntil: "domcontentloaded" });
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toContainText("Користуйтеся Hermes Connect безкоштовно, поки ми налаштовуємо систему під ваше СТО.");
  await expect(offer.getByRole("link", { name: "Почати безкоштовне налаштування" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=uk",
  );
});

test("free setup does not silently expire on a future clock date", async ({ page }) => {
  await freezeNow(page, "2030-01-01T12:00:00.000Z");
  await page.goto("/services/hermes-connect/repair-shops/?lang=en", { waitUntil: "domcontentloaded" });
  const offer = page.locator(visibleOffer);
  await expect(offer).toHaveAttribute("data-launch-state", "open");
  await expect(offer.getByRole("link", { name: "Start free setup" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register",
  );
});
