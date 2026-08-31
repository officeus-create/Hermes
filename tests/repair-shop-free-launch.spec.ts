import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const deadline = "2026-08-30T20:28:52.000Z";
const visibleOffer = "[data-repair-free-launch]:visible";

test("Repair Shop free-launch policy is global, fixed, and honest about billing", async () => {
  const [policy, component] = await Promise.all([
    readFile(new URL("../src/data/hermes-connect-repair-shop-launch.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RepairShopFreeLaunchOffer.astro", import.meta.url), "utf8"),
  ]);

  expect(policy).toContain(`REPAIR_SHOP_FREE_REGISTRATION_END_ISO = "${deadline}"`);
  expect(policy).toContain("REPAIR_SHOP_ONLINE_BILLING_ENABLED = false");
  expect(policy).toContain("countLimited: false");
  expect(policy).toContain('afterDeadlineWithoutBilling: "remain_free"');
  expect(component).toContain("data-days");
  expect(component).toContain("data-hours");
  expect(component).toContain("data-minutes");
  expect(component).toContain("data-seconds");
  expect(component).toContain("window.setInterval(tick, 1000)");
  expect(component).toContain("registration stays free until it is");
  expect(component).toContain("Registration remains free while online billing is unavailable.");
  expect(component).not.toMatch(/first\s+1[,.]?000|first\s+1000|первых\s+1000/i);
  expect(component).not.toMatch(/Date\.now\(\)\s*\+\s*14/);
});

test("Repair Shop landing shows the localized post-deadline free-registration state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });

  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-deadline", deadline);
  await expect(offer).toHaveAttribute("data-expired", "true");
  await expect(offer.getByRole("heading", { name: "Регистрация остаётся бесплатной, пока онлайн-оплата не подключена." })).toBeVisible();
  await expect(offer).toContainText("Онлайн-оплата ещё не подключена — регистрация остаётся бесплатной.");
  await expect(offer.locator("[data-days]")).toHaveText("00");
  await expect(offer.locator("[data-hours]")).toHaveText("00");
  await expect(offer.locator("[data-minutes]")).toHaveText("00");
  await expect(offer.locator("[data-seconds]")).toHaveText("00");
  await expect(offer.getByRole("link", { name: "Зарегистрироваться бесплатно" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru",
  );
  await expect(offer).not.toContainText("1000");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("direct free-registration CTA opens the Repair Shop registration form", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }));
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=es", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
  await expect(page.locator("#register-form")).toHaveClass(/active/);
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-expired", "true");
  await expect(offer.getByRole("heading", { name: "El registro sigue siendo gratuito mientras la facturación en línea no esté disponible." })).toBeVisible();
  await expect(offer.getByRole("link", { name: "Registrarme gratis" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=es",
  );
});

test("Founding Plan page keeps free registration as the lower-friction first step", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/plan/?lang=uk", { waitUntil: "domcontentloaded" });
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-expired", "true");
  await expect(offer).toContainText("Реєстрація залишається безкоштовною, поки онлайн-оплату не підключено.");
  await expect(offer).toContainText("Онлайн-оплату ще не підключено — реєстрація залишається безкоштовною.");
  await expect(offer.getByRole("link", { name: "Зареєструватися безкоштовно" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=uk",
  );
});
