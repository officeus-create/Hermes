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

test("Repair Shop landing shows localized day-hour-minute-second countdown on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });

  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-deadline", deadline);
  await expect(offer.getByRole("heading", { name: "14-дневная стартовая акция: регистрация СТО бесплатно." })).toBeVisible();
  await expect(offer).toContainText("дней");
  await expect(offer).toContainText("часов");
  await expect(offer).toContainText("минут");
  await expect(offer).toContainText("секунд");
  await expect(offer.locator("[data-days]")).toHaveText(/^\d+$/);
  await expect(offer.locator("[data-hours]")).toHaveText(/^\d{2}$/);
  await expect(offer.locator("[data-minutes]")).toHaveText(/^\d{2}$/);
  await expect(offer.locator("[data-seconds]")).toHaveText(/^\d{2}$/);
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
  await expect(offer.getByRole("heading", { name: "Oferta de lanzamiento de 14 días: registro gratuito del taller." })).toBeVisible();
});

test("Founding Plan page keeps free registration as the lower-friction first step", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/plan/?lang=uk", { waitUntil: "domcontentloaded" });
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toContainText("14-денна стартова акція: реєстрація СТО безкоштовна.");
  await expect(offer.getByRole("link", { name: "Зареєструватися безкоштовно" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=uk",
  );
});
