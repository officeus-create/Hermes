import { expect, test } from "@playwright/test";

const dashboardUrl = "/services/hermes-connect/repair-shops/dashboard/";
const bookingId = "repair-booking-status-browser-contract";

const owner = {
  success: true,
  specialist: {
    id: "specialist-status-browser-contract",
    email: "owner@example.com",
    name: "Status Test Owner",
    role: "Shop Owner",
  },
};

const profile = {
  success: true,
  shop: {
    id: "shop-status-browser-contract",
    owner_specialist_id: owner.specialist.id,
    name: "Status Test Auto Care",
    slug: "status-test-auto-care",
    phone: "+1 414 555 0100",
    address_line1: "100 Status Way",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  },
};

const booking = (status: string, history: Array<Record<string, unknown>>) => ({
  id: bookingId,
  shop_id: profile.shop.id,
  service_id: "service-status-browser-contract",
  service_name: "Brake inspection",
  duration_minutes: 60,
  appointment_date: "2026-08-20",
  start_time: "10:00",
  end_time: "11:00",
  status,
  client_name: "Jane Customer",
  client_email: "jane@example.com",
  client_phone: "+1 414 555 0199",
  history,
});

async function routeWorkspaceBasics(page: any) {
  await page.route("**/api/auth/me", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(owner) }));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(profile) }));
  await page.route("**/api/services", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, services: [] }) }));
}

test.describe("Hermes Connect Repair Shop booking status browser contract", () => {
  test("owner changes status only after server success and persisted history is rendered", async ({ page }) => {
    await routeWorkspaceBasics(page);
    let currentStatus = "confirmed";
    let history: Array<Record<string, unknown>> = [
      { id: "history-1", booking_id: bookingId, from_status: null, to_status: "confirmed", changed_at: "2026-08-15T07:00:00.000Z" },
    ];
    let patchBody: Record<string, unknown> | null = null;

    await page.route("**/api/repair-shop/bookings", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, bookings: [booking(currentStatus, history)] }),
    }));

    await page.route(`**/api/repair-shop/bookings/${bookingId}/status`, async (route) => {
      patchBody = route.request().postDataJSON();
      currentStatus = "in_progress";
      history = [
        ...history,
        { id: "history-2", booking_id: bookingId, from_status: "confirmed", to_status: "in_progress", changed_at: "2026-08-15T07:05:00.000Z" },
      ];
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, booking: booking(currentStatus, history), history }) });
    });

    await page.goto(dashboardUrl);
    const card = page.locator(`[data-booking-id="${bookingId}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator(".status-pill")).toHaveText("Confirmed");
    await expect(card.locator(".history")).toContainText("Confirmed");

    await card.locator(".status-select").selectOption("in_progress");
    await expect(page.locator("#workspace-alert")).toContainText("In progress");
    await expect(card.locator(".status-pill")).toHaveText("In progress");
    await expect(card.locator(".history")).toContainText("In progress");
    expect(patchBody).toEqual({ status: "in_progress" });
  });

  test("server rejection never paints a fake terminal status", async ({ page }) => {
    await routeWorkspaceBasics(page);
    const history = [
      { id: "history-1", booking_id: bookingId, from_status: null, to_status: "confirmed", changed_at: "2026-08-15T07:00:00.000Z" },
    ];

    await page.route("**/api/repair-shop/bookings", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, bookings: [booking("confirmed", history)] }),
    }));
    await page.route(`**/api/repair-shop/bookings/${bookingId}/status`, (route) => route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "invalid_status_transition" }),
    }));

    await page.goto(dashboardUrl);
    const card = page.locator(`[data-booking-id="${bookingId}"]`);
    await card.locator(".status-select").selectOption("completed");
    await expect(page.locator("#workspace-alert")).toContainText("no longer allowed");
    await expect(card.locator(".status-pill")).toHaveText("Confirmed");
    await expect(card.locator(".history")).not.toContainText("Completed");
  });
});
