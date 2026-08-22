import { expect, test } from "@playwright/test";

const localeCases = [
  ["en", "Weekly availability", "Monday"],
  ["ru", "Недельное расписание", "Понедельник"],
  ["uk", "Тижневий розклад", "Понеділок"],
  ["es", "Disponibilidad semanal", "Lunes"],
  ["it", "Disponibilità settimanale", "Lunedì"],
  ["fr", "Disponibilités hebdomadaires", "Lundi"],
] as const;

const days = Array.from({ length:7 }, (_, day_of_week) => ({ day_of_week, is_open:day_of_week >= 1 && day_of_week <= 5, start_time:day_of_week >= 1 && day_of_week <= 5 ? "09:00" : null, end_time:day_of_week >= 1 && day_of_week <= 5 ? "17:00" : null }));

async function mockAvailability(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, specialist:{ name:"Owner", email:"owner@example.com" } }) }));
  await page.route("**/api/repair-shop/availability", async (route) => {
    await route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, timezone:"America/Chicago", days }) });
  });
}

test("Repair Shop availability keeps six-language parity and mobile fit", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await mockAvailability(page);
  for (const [locale, heading, monday] of localeCases) {
    const suffix = locale === "en" ? "" : `?lang=${locale}`;
    await page.goto(`/services/hermes-connect/repair-shops/availability/${suffix}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { name:heading })).toBeVisible();
    await expect(page.getByText(monday, { exact:true })).toBeVisible();
    await expect(page.locator("#timezone-pill")).toContainText("America/Chicago");
    const dashboardHref = locale === "en" ? "/services/hermes-connect/repair-shops/dashboard/" : `/services/hermes-connect/repair-shops/dashboard/?lang=${locale}`;
    await expect(page.locator(".back-link")).toHaveAttribute("href", dashboardHref);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  }
});

test("Repair Shop availability preserves locale on expired session", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status:401, contentType:"application/json", body:JSON.stringify({ success:false, error:"not_authenticated" }) }));
  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=es");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/auth\/\?lang=es$/);
});
