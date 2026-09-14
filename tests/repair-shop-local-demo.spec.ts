import { expect, test } from "@playwright/test";

const demo = "/services/hermes-connect/repair-shops/customers/?demo=1&lang=ru";

test.describe("Repair Shop synthetic demonstration mode", () => {
  test("renders a complete synthetic Russian workspace without a real session", async ({ page }) => {
    await page.goto(demo, { waitUntil: "domcontentloaded" });

    const demoBadge = page.locator("[data-local-demo-badge]");
    await expect(demoBadge).toBeVisible();
    await expect(demoBadge).toHaveText("ЛОКАЛЬНОЕ ДЕМО · синтетические данные");
    await expect(page.locator('link[data-repair-shop-design-polish]')).toHaveAttribute("href", "/repair-shop-design-polish.css");
    await expect(page.locator("#customer-count")).toHaveText("12 клиентов");
    await expect(page.getByRole("button", { name: "Открыть клиента" }).first()).toBeVisible();
    await expect(page.locator(".customer-card")).toHaveCount(12);

    const menu = page.locator("[data-repair-crm-menu]");
    if (await menu.isVisible()) await menu.click();
    await page.locator(".repair-crm-nav").getByRole("link", { name: "График" }).click();
    await expect(page).toHaveURL(/availability\/\?lang=ru&demo=1/);
    await expect(page.getByRole("button", { name: "Сохранить недельный график" })).toBeVisible();
    await expect(page.locator('input[type="time"]')).toHaveCount(14);
  });

  test("keeps the synthetic owner dashboard future-facing and stateful", async ({ page }) => {
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?demo=1&lang=ru", { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-hc-today-ready]")).toHaveText("Профиль готов");
    const nextText = (await page.locator("[data-hc-next-booking]").textContent()) || "";
    const nextDate = nextText.slice(0, 10);
    const today = await page.evaluate(() => new Date().toISOString().slice(0, 10));
    expect(nextDate >= today).toBeTruthy();

    const servicesText = (await page.locator("#services-list").textContent()) || "";
    for (const name of ["Диагностика автомобиля", "Замена масла и фильтра", "Проверка тормозов", "Шиномонтаж", "Проверка кондиционера", "Предрейсовый осмотр / DOT"]) {
      expect(servicesText).toContain(name);
    }

    const apiState = await page.evaluate(async () => {
      const before = await fetch("/api/repair-shop/capabilities").then((response) => response.json());
      await fetch("/api/repair-shop/capabilities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_types:["commercial_truck"], fleet_service:true, mobile_roadside:true, emergency_24_7:true, parallel_booking_capacity:5 }),
      });
      const after = await fetch("/api/repair-shop/capabilities").then((response) => response.json());
      const created = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name:"Demo test service", duration_minutes:30 }),
      }).then((response) => response.json());
      const deleted = await fetch(`/api/services/${encodeURIComponent(created.service.id)}`, { method:"DELETE" });
      return { before:before.capabilities, after:after.capabilities, deleteStatus:deleted.status };
    });

    expect(apiState.before.parallel_booking_capacity).toBe(3);
    expect(apiState.after.parallel_booking_capacity).toBe(5);
    expect(apiState.after.mobile_roadside).toBe(true);
    expect(apiState.deleteStatus).toBe(200);
  });

  test("loads the light Repair Shop design layer without synthetic data", async ({ page }) => {
    await page.goto("/services/hermes-connect/repair-shops/auth/", { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[data-repair-shop-design-polish]')).toHaveAttribute("href", "/repair-shop-design-polish.css");
    await expect(page.locator("[data-local-demo-badge]")).toHaveCount(0);
  });

  test("does not activate synthetic data without the explicit demo flag", async ({ page }) => {
    await page.goto("/services/hermes-connect/repair-shops/customers/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-local-demo-badge]")).toHaveCount(0);
  });
});
