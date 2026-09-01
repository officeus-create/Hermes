import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const salon = {
  id: "salon-controls-1",
  name: "Aurelia Studio",
  slug: "aurelia-studio-controls",
  phone: "+13055550148",
  website: "https://example.com/",
  address_line1: "100 Ocean Dr",
  city: "Miami",
  region: "Florida",
  postal_code: "33139",
  country_code: "US",
  timezone: "America/New_York",
};
const context = { id: "ctx-beauty-controls-1", vertical_key: "beauty_salon" };

async function mockBeautyControls(page: any) {
  let team = [
    { id: "team-controls-1", display_name: "Leah Morgan", role_label: "Studio Manager", public_title: "Studio Manager", is_public: true, is_active: true },
  ];
  let services = [
    { id: "service-delete-1", name: "Signature Facial", duration_minutes: 60 },
    { id: "service-locked-1", name: "Booked Brow Service", duration_minutes: 30 },
  ];

  await page.route("**/api/hermes-connect/account", (route: any) => route.fulfill(json({
    success: true,
    identity: { id: "owner-controls-1", name: "Office Owner", email: "office@example.com", role: "owner" },
    owned_businesses: [{ key: "beauty_salon", kind: "owned_business", id: salon.id, name: salon.name, slug: salon.slug, href: "/services/hermes-connect/beauty/workspace/", workspace_state: "private_foundation" }],
    workspaces: [{ key: "academy", kind: "shared_workspace", href: "/services/hermes-connect/academy/dashboard/", available: true, state: {} }],
    capabilities: { internal_ai: false },
  })));
  await page.route("**/api/internal-ai/status", (route: any) => route.fulfill(json({ success: false, error: "forbidden" }, 403)));

  await page.route("**/api/beauty-salon/profile", async (route: any) => {
    if (route.request().method() === "PUT") return route.fulfill(json({ success: true, salon, service_context: context }));
    return route.fulfill(json({ success: true, salon, service_context: context }));
  });

  await page.route("**/api/beauty-salon/team/**", async (route: any) => {
    if (route.request().method() !== "PATCH") return route.fallback();
    const memberId = route.request().url().split("/").pop();
    const payload = route.request().postDataJSON();
    const index = team.findIndex((item) => item.id === memberId);
    if (index < 0) return route.fulfill(json({ success: false, error: "team_member_not_found" }, 404));
    team[index] = { ...team[index], ...payload };
    return route.fulfill(json({ success: true, member: team[index] }));
  });

  await page.route("**/api/beauty-salon/team", async (route: any) => {
    if (route.request().method() === "POST") return route.fulfill(json({ success: false, error: "not_used" }, 400));
    return route.fulfill(json({ success: true, salon_id: salon.id, team }));
  });

  await page.route("**/api/services/*?context=ctx-beauty-controls-1", async (route: any) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    const url = new URL(route.request().url());
    const serviceId = url.pathname.split("/").pop();
    if (serviceId === "service-locked-1") {
      return route.fulfill(json({ success: false, error: "service_has_bookings" }, 409));
    }
    services = services.filter((item) => item.id !== serviceId);
    return route.fulfill(json({ success: true, deleted: serviceId }));
  });

  await page.route("**/api/services?context=ctx-beauty-controls-1", async (route: any) => {
    if (route.request().method() === "POST") return route.fulfill(json({ success: false, error: "not_used" }, 400));
    return route.fulfill(json({ success: true, context, services }));
  });
}

test("Beauty owner can edit roster state through the existing owner-scoped PATCH API", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await mockBeautyControls(page);
  await page.goto("/services/hermes-connect/beauty/workspace/?lang=ru", { waitUntil: "domcontentloaded" });

  const edit = page.locator("[data-beauty-edit-member]");
  await expect(edit).toBeVisible();
  await edit.click();

  const dialog = page.locator("[data-beauty-member-dialog]");
  await expect(dialog).toBeVisible();
  await dialog.locator('[name="display_name"]').fill("Leah Morgan-Smith");
  await dialog.locator('[name="role_label"]').fill("General Manager");
  await dialog.locator('[name="public_title"]').fill("Studio Director");
  await dialog.locator('[name="is_public"]').uncheck();
  await dialog.locator('[name="is_active"]').uncheck();
  await dialog.locator('button[type="submit"]').click();

  const row = page.locator('[data-team-list] .beauty-b1-row[data-beauty-member-id="team-controls-1"]');
  await expect(row).toContainText("Leah Morgan-Smith");
  await expect(row).toContainText("General Manager · Studio Director");
  await expect(row).toContainText("Неактивен");
  await expect(row).toHaveClass(/beauty-b11-inactive/);
  await expect(page.locator("[data-team-count]")).toHaveText("0");
  await expect(page.locator("[data-beauty-alert]")).toContainText("Данные сотрудника обновлены");
});

test("Beauty service deletion is real and remains blocked when bookings already use the service", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockBeautyControls(page);
  await page.goto("/services/hermes-connect/beauty/workspace/?lang=ru", { waitUntil: "domcontentloaded" });

  const deletable = page.getByRole("button", { name: "Удалить услугу: Signature Facial" });
  await expect(deletable).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await deletable.click();
  await expect(page.locator("[data-services-list]")).not.toContainText("Signature Facial");
  await expect(page.locator("[data-services-count]")).toHaveText("1");
  await expect(page.locator("[data-beauty-alert]")).toContainText("Услуга удалена");

  const locked = page.getByRole("button", { name: "Удалить услугу: Booked Brow Service" });
  await expect(locked).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await locked.click();
  await expect(page.locator("[data-services-list]")).toContainText("Booked Brow Service");
  await expect(page.locator("[data-beauty-alert]")).toContainText("Эту услугу нельзя удалить");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
