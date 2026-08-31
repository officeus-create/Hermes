import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const deadline = "2026-09-16T05:00:00.000Z";
const activeNow = "2026-09-01T06:00:00.000Z";
const expiredNow = "2026-09-16T06:00:00.000Z";
const visibleOffer = "[data-repair-free-launch]:visible";

async function freezeNow(page: Page, iso: string) {
  const fixedNow = Date.parse(iso);
  await page.addInitScript((value) => {
    Date.now = () => value;
  }, fixedNow);
}

test("Repair Shop free-registration policy is fixed through September 15 Central Time and honest about billing", async () => {
  const [policy, component] = await Promise.all([
    readFile(new URL("../src/data/hermes-connect-repair-shop-launch.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RepairShopFreeLaunchOffer.astro", import.meta.url), "utf8"),
  ]);

  expect(policy).toContain(`REPAIR_SHOP_FREE_REGISTRATION_END_ISO = "${deadline}"`);
  expect(policy).toContain('REPAIR_SHOP_FREE_REGISTRATION_TIMEZONE = "America/Chicago"');
  expect(policy).toContain('REPAIR_SHOP_FREE_REGISTRATION_FREE_THROUGH_LOCAL_DATE = "2026-09-15"');
  expect(policy).toContain("REPAIR_SHOP_ONLINE_BILLING_ENABLED = false");
  expect(policy).toContain("countLimited: false");
  expect(policy).toContain("cardRequired: false");
  expect(policy).toContain('afterDeadlineWithoutBilling: "current_plan_required"');
  expect(component).toContain("data-days");
  expect(component).toContain("data-hours");
  expect(component).toContain("data-minutes");
  expect(component).toContain("data-seconds");
  expect(component).toContain("window.setInterval(tick, 1000)");
  expect(component).toContain("Free repair shop registration through September 15.");
  expect(component).toContain("Free registration closes at midnight Central Time after September 15, 2026.");
  expect(component).toContain("New Repair Shop registrations now use the current Founding Shop Plan.");
  expect(component).not.toMatch(/first\s+1[,.]?000|first\s+1000|первых\s+1000/i);
  expect(component).not.toMatch(/Date\.now\(\)\s*\+\s*14/);
});

test("Repair Shop landing shows the active Russian September 15 free-registration state", async ({ page }) => {
  await freezeNow(page, activeNow);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });

  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-deadline", deadline);
  await expect(offer).not.toHaveAttribute("data-expired", "true");
  await expect(offer.getByRole("heading", { name: "Бесплатная регистрация СТО до 15 сентября включительно." })).toBeVisible();
  await expect(offer).toContainText("Создайте аккаунт владельца СТО и начните пользоваться текущим Hermes Connect без банковской карты.");
  await expect(offer).toContainText("Уже созданные аккаунты сохраняют доступ.");
  await expect(offer.locator("[data-days]")).not.toHaveText("00");
  await expect(offer.getByRole("link", { name: "Зарегистрироваться бесплатно" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru",
  );
  await expect(offer).not.toContainText("1000");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("direct free-registration CTA opens the Repair Shop registration form while the offer is active", async ({ page }) => {
  await freezeNow(page, activeNow);
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }));
  await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=es", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
  await expect(page.locator("#register-form")).toHaveClass(/active/);
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).not.toHaveAttribute("data-expired", "true");
  await expect(offer.getByRole("heading", { name: "Registro gratuito de talleres hasta el 15 de septiembre inclusive." })).toBeVisible();
  await expect(offer.getByRole("link", { name: "Registrarme gratis" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=es",
  );
});

test("Founding Plan page keeps active Ukrainian free registration as the lower-friction first step", async ({ page }) => {
  await freezeNow(page, activeNow);
  await page.goto("/services/hermes-connect/repair-shops/plan/?lang=uk", { waitUntil: "domcontentloaded" });
  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).not.toHaveAttribute("data-expired", "true");
  await expect(offer).toContainText("Безкоштовна реєстрація СТО до 15 вересня включно.");
  await expect(offer).toContainText("Уже створені акаунти зберігають доступ.");
  await expect(offer.getByRole("link", { name: "Зареєструватися безкоштовно" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/auth/?mode=register&lang=uk",
  );
});

test("after the September 15 cutoff new Repair Shop registration routes to the current plan", async ({ page }) => {
  await freezeNow(page, expiredNow);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });

  const offer = page.locator(visibleOffer);
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute("data-deadline", deadline);
  await expect(offer).toHaveAttribute("data-expired", "true");
  await expect(offer.getByRole("heading", { name: "Бесплатная регистрация СТО завершилась 15 сентября." })).toBeVisible();
  await expect(offer).toContainText("Новые регистрации СТО теперь проходят через текущий тариф Founding Shop.");
  await expect(offer.locator("[data-days]")).toHaveText("00");
  await expect(offer.locator("[data-hours]")).toHaveText("00");
  await expect(offer.locator("[data-minutes]")).toHaveText("00");
  await expect(offer.locator("[data-seconds]")).toHaveText("00");
  await expect(offer.getByRole("link", { name: "Посмотреть тариф" })).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/plan/?lang=ru",
  );
});
