import { expect, test } from "@playwright/test";

async function fillPartnerOffer(page: import("@playwright/test").Page, options: { consent?: boolean } = {}) {
  await page.locator("#shop-name").fill("Revenue Test Auto Care");
  await page.locator("#shop-type").selectOption("truck_diesel");
  await page.locator("#city-state").fill("Milwaukee, WI");
  await page.locator("#roadside-rate").fill("145");
  await page.locator("#labor-discount").fill("15");
  await page.locator("#parts-discount").fill("8");
  await page.locator('input[name="equipment"][value="car_hauler"]').check();
  await page.locator('input[name="equipment"][value="dry_van"]').check();
  await page.locator("#turnaround").fill("24");
  await page.locator("#partner-contact-name").fill("Taylor Partner Test");
  await page.locator("#partner-contact-email").fill("taylor.partner@example.com");
  await page.locator("#partner-contact-phone").fill("+1 414 555 0188");
  if (options.consent !== false) await page.locator("#partner-contact-consent").check();
}

test("repair shop corporate offer is clear, delivered privately and waits for human review", async ({ page }) => {
  let leadRequests = 0;
  let leadPayload: Record<string, any> | null = null;
  let idempotencyKey = "";

  await page.addInitScript(() => {
    (window as any).dataLayer = [];
  });

  await page.route("**/api/logistics-lead", async (route) => {
    leadRequests += 1;
    leadPayload = route.request().postDataJSON();
    idempotencyKey = route.request().headers()["idempotency-key"] || "";
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/");

  await expect(page.locator("#partner-contact-name")).toBeVisible();
  await expect(page.locator("[data-repair-offer-next-step]")).toContainText("What happens next");
  await expect(page.locator("[data-repair-help='city-state']")).toContainText("street address is not required");
  await expect(page.locator("[data-repair-equipment-help]")).toContainText("actually service");
  await expect(page.locator("#submit-btn")).toContainText("Review Offer Details");

  await fillPartnerOffer(page);

  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toHaveText("OFFER_DRAFT");
  await expect(page.locator("#submit-btn")).toContainText("Submit Offer to Hermes");
  await expect(page.locator("[data-repair-partner-delivery-status]")).toContainText("Nothing has been sent yet");
  expect(leadRequests).toBe(0);

  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toContainText("OFFER_SUBMITTED");
  await expect(page.locator("[data-repair-partner-delivery-status]")).toContainText("awaiting human review");
  expect(leadRequests).toBe(1);
  expect(leadPayload).toMatchObject({
    name: "Taylor Partner Test",
    email: "taylor.partner@example.com",
    interest: "Hermes Logistics",
    consent: true,
    source_path: "/services/hermes-connect/repair-shops/",
    direction_fields: {
      direction: "Hermes Logistics",
      fields: {
        phone: "+1 414 555 0188",
        equipment_type: ["car_hauler", "dry_van"],
        preferred_lanes: "Milwaukee, WI",
        service_needed: "Repair Shop / Truck Repair Partner Beta",
        primary_goal: "Corporate repair partner offer review",
      },
    },
  });

  const requestId = String((leadPayload as Record<string, any> | null)?.request_id || "");
  expect(requestId).toMatch(/^repair_partner_[a-z0-9]+_[a-z0-9]+$/i);
  expect(idempotencyKey).toBe(requestId);
  expect(String((leadPayload as Record<string, any> | null)?.message || "")).toContain("Labor discount: 15%");
  expect(String((leadPayload as Record<string, any> | null)?.message || "")).toContain("Service city / state: Milwaukee, WI");
  expect(JSON.stringify(leadPayload)).not.toMatch(/salesperson_code|salesperson code|commission/i);

  await page.waitForTimeout(1800);
  await expect(page.locator("#status-label")).toContainText("OFFER_SUBMITTED");
  await expect(page.locator("#status-label")).not.toContainText("UNDER_REVIEW");

  const analytics = await page.evaluate(() => (window as any).dataLayer || []);
  const submittedEvent = analytics.find((item: any) => item?.event === "connect_offer_submitted");
  expect(submittedEvent).toEqual({
    event: "connect_offer_submitted",
    source: "repair_shop_partner_offer",
    shop_subtype: "truck_diesel",
    request_state: "received",
  });

  const analyticsText = JSON.stringify(analytics);
  expect(analyticsText).not.toContain("Taylor Partner Test");
  expect(analyticsText).not.toContain("taylor.partner@example.com");
  expect(analyticsText).not.toContain("+1 414 555 0188");
  expect(analyticsText).not.toContain("Milwaukee, WI");
  expect(analyticsText).not.toContain("15%");
});

test("review step sends nothing and consent is required only for the real submission", async ({ page }) => {
  let leadRequests = 0;
  await page.route("**/api/logistics-lead", async (route) => {
    leadRequests += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/");
  await fillPartnerOffer(page, { consent: false });

  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toHaveText("OFFER_DRAFT");
  await expect(page.locator("[data-repair-partner-delivery-status]")).toContainText("Nothing has been sent yet");
  expect(leadRequests).toBe(0);

  await page.locator("#submit-btn").click();
  await expect(page.locator("[data-repair-partner-delivery-status]")).toContainText("confirm consent");
  expect(leadRequests).toBe(0);

  await page.locator("#partner-contact-consent").check();
  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toContainText("OFFER_SUBMITTED");
  expect(leadRequests).toBe(1);
});

test("partner offer keeps entered data and exposes prepared email fallback when delivery cannot be confirmed", async ({ page }) => {
  const requestIds: string[] = [];
  await page.route("**/api/logistics-lead", async (route) => {
    requestIds.push(route.request().headers()["idempotency-key"] || "");
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "delivery_temporarily_unavailable" }),
    });
  });

  await page.goto("/services/hermes-connect/repair-shops/");
  await fillPartnerOffer(page);
  await page.locator("#submit-btn").click();
  await page.locator("#submit-btn").click();

  await expect(page.locator("#status-label")).toHaveText("OFFER_DRAFT");
  await expect(page.locator("[data-repair-partner-delivery-status]")).toContainText("could not confirm delivery");
  const fallback = page.locator("[data-repair-partner-fallback]");
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com/);
  await expect(page.locator("#shop-name")).toHaveValue("Revenue Test Auto Care");
  await expect(page.locator("#partner-contact-email")).toHaveValue("taylor.partner@example.com");

  await page.locator("#submit-btn").click();
  expect(requestIds).toHaveLength(2);
  expect(requestIds[1]).toBe(requestIds[0]);
});

test("Russian Repair Shop partner offer explains service location and next step in Russian", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru");

  await expect(page.locator("label", { has: page.locator("#city-state") })).toContainText("Город / штат обслуживания");
  await expect(page.locator("[data-repair-help='city-state']")).toContainText("Полный адрес улицы здесь не нужен");
  await expect(page.locator("[data-repair-offer-next-step]")).toContainText("Что произойдёт дальше");
  await expect(page.locator("#submit-btn")).toContainText("Проверить предложение");
});

test("Repair Shop owner registration explains the next step and keeps labels explicit", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/auth/");
  await page.locator('[data-tab="register"]').click();

  await expect(page.locator("label[for='reg-name']")).toHaveText("Your Full Name");
  await expect(page.locator("label[for='reg-email']")).toHaveText("Business Email");
  await expect(page.locator("[data-hc-help-for='reg-email']")).toContainText("future Hermes sign-in");
  await expect(page.locator("[data-hc-help-for='reg-password']")).toContainText("at least 8 characters");
  await expect(page.locator("[data-hc-registration-next]")).toContainText("What happens after registration?");
  await expect(page.locator("[data-hc-registration-next]")).toContainText("Shop Dashboard");
  await expect(page.locator("[data-hc-registration-next]")).toContainText("does not activate a paid plan");
});
