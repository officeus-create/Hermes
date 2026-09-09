import { expect, test } from "@playwright/test";

async function mockOwner(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { id:"owner-shell-1", name: "Pilot Owner", email: "owner@example.com", role: "Shop Owner" } }),
  }));
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success:true, identity:{ id:"owner-shell-1", name:"Pilot Owner", email:"owner@example.com", role:"Shop Owner" }, owned_businesses:[], workspaces:[], capabilities:{ internal_ai:false } }),
  }));
  await page.route("**/api/auth/logout", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true }) }));
}

test("Repair Shop private workspace reads as a full CRM app with separate working screens", async ({ page }) => {
  await mockOwner(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/");

  const crm = page.locator("[data-repair-crm-shell]");
  await expect(crm).toBeAttached();
  await expect(crm.locator(".repair-crm-topbar")).toBeVisible();
  await expect(crm.locator(".repair-crm-sidebar")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/hc-repair-crm/);
  await expect(page.locator("html")).toHaveClass(/hc-repair-design4/);
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".hc-product-context")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();

  const sidebar = crm.locator(".repair-crm-sidebar");
  await expect(sidebar.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  await expect(sidebar.getByRole("link", { name: "Bookings" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/appointments/");
  await expect(sidebar.getByRole("link", { name: "Customers" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/customers/");
  await expect(sidebar.getByRole("link", { name: "Vehicles" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/vehicles/");
  await expect(sidebar.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/services/");
  await expect(sidebar.getByRole("link", { name: "Team" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/team/");
  await expect(sidebar.getByRole("link", { name: "Schedule" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/schedule/");
  await expect(sidebar.getByRole("link", { name: "Company" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/company/");
  await expect(sidebar.getByRole("link", { name: "Driver Benefits" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/driver-benefits/");
  await expect(sidebar.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/preferences/");
  await expect(crm.locator(".repair-crm-topbar .repair-crm-logout")).toBeVisible();
  await expect(crm.locator("[data-repair-crm-date]")).not.toHaveText("");
  await expect(crm.locator("[data-repair-crm-time]")).not.toHaveText("");

  const overflowState = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName,
          id: node.id,
          className: typeof node.className === "string" ? node.className.slice(0, 180) : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
          position: getComputedStyle(node).position,
        };
      })
      .filter((item) => item.right > clientWidth + 1)
      .sort((a, b) => b.right - a.right)
      .slice(0, 30);
    return { clientWidth, scrollWidth, offenders };
  });
  console.log("CRM_OVERFLOW_DIAGNOSTIC", JSON.stringify(overflowState));
  expect(overflowState.scrollWidth).toBeLessThanOrEqual(overflowState.clientWidth);
});

test("Repair Shop CRM uses persistent bottom app navigation and a More drawer on a 390px phone", async ({ page }) => {
  await mockOwner(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/customers/?lang=ru");

  const crm = page.locator("[data-repair-crm-shell]");
  await expect(crm).toBeAttached();
  await expect(crm.locator(".repair-crm-topbar")).toBeVisible();
  await expect(crm.locator(".repair-crm-mobile-quick")).toBeVisible();
  await expect(crm.locator(".repair-crm-mobile-quick").getByRole("link", { name: "Клиенты" })).toHaveAttribute("aria-current", "page");
  await expect(crm.locator(".repair-crm-topbar .repair-crm-logout")).toBeHidden();

  const sidebar = crm.locator(".repair-crm-sidebar");
  await expect(sidebar).not.toBeInViewport();
  await crm.locator("[data-repair-crm-more]").click();
  await expect(sidebar).toBeInViewport();
  await expect(sidebar.getByRole("link", { name: "Клиенты" })).toHaveAttribute("aria-current", "page");
  await expect(sidebar.getByRole("link", { name: "Команда" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/team/?lang=ru");
  await expect(sidebar.getByRole("link", { name: "График" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/schedule/?lang=ru");
  await expect(sidebar.getByRole("link", { name: "Компания" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/company/?lang=ru");
  await expect(sidebar.getByRole("link", { name: "Настройки" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/preferences/?lang=ru");
  await expect(crm.getByRole("link", { name: "Все продукты" })).toHaveAttribute("href", "/services/hermes-connect/?lang=ru");
  await expect(crm.locator(".repair-crm-mobile-logout")).toBeVisible();
  await expect(crm.locator(".repair-crm-mobile-logout")).toHaveText("Выйти");

  await crm.locator("[data-repair-crm-overlay]").click({ position:{ x:380, y:400 } }).catch(() => {});
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});