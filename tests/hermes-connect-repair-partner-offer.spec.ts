import { expect, test } from "@playwright/test";

test("repair shop corporate offer is delivered privately and waits for human review", async ({ page }) => {
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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/services/hermes-connect/repair-shops/?salesperson_code=REP_17");

  await expect(page.locator("#partner-contact-name")).toBeVisible();
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
  await page.locator("#partner-contact-consent").check();

  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toHaveText("OFFER_DRAFT");
  await expect(page.locator("#submit-btn")).toContainText("Submit Offer For Review");
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
  expect(String((leadPayload as Record<string, any> | null)?.message || "")).toContain("Private salesperson code: REP_17");
  expect(String((leadPayload as Record<string, any> | null)?.message || "")).toContain("Labor discount: 15%");

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
  expect(analyticsText).not.toContain("REP_17");
  expect(analyticsText).not.toContain("15%");
});
