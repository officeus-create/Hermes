import { expect, test } from "@playwright/test";

test("Hermes Connect exposes one working entry and opens the Repair Shop registration flow", async ({ page }) => {
  await page.goto("/services/hermes-connect/");

  await expect(page.locator(".site-header .hermes-connect-header-launcher")).toBeHidden();
  const headerConnect = page.locator('.header-actions a[aria-label="Open Hermes Connect"]');
  await expect(headerConnect).toBeVisible();
  await expect(headerConnect).toHaveAttribute("href", /\/services\/hermes-connect\/?$/);

  const registerCta = page.getByRole("link", { name: "Create Repair Shop account" });
  const repairPilotCta = page.getByRole("link", { name: "Open Repair Shop pilot" });
  await expect(registerCta).toHaveAttribute("href", /\/repair-shops\/auth\/\?mode=register$/);
  await expect(repairPilotCta).toHaveAttribute("href", /\/repair-shops\/$/);

  const previewButton = page.getByRole("button", { name: "Open Repair Shop pilot" });
  await expect(previewButton).toBeEnabled();
  await expect(previewButton).toHaveAttribute("tabindex", "0");

  await repairPilotCta.click();
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/$/);
  const createShop = page.getByRole("link", { name: "Create Shop Account" });
  await expect(createShop).toHaveAttribute("href", /\/repair-shops\/auth\/\?mode=register$/);

  await createShop.click();
  await expect(page).toHaveURL(/\/repair-shops\/auth\/\?mode=register$/);
  await expect(page.locator('[data-tab="register"]')).toHaveClass(/active/);
  await expect(page.locator("#register-form")).toHaveClass(/active/);
});

test("Repair Shop corporate offer reaches the private Hermes Logistics intake", async ({ page }) => {
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

  await page.locator("#shop-name").fill("Launch Test Truck Care");
  await page.locator("#shop-type").selectOption("truck_diesel");
  await page.locator("#city-state").fill("Milwaukee, WI");
  await page.locator("#labor-discount").fill("15");
  await page.locator('input[name="equipment"][value="car_hauler"]').check();
  await page.locator("#partner-contact-name").fill("Taylor Launch Test");
  await page.locator("#partner-contact-email").fill("taylor.launch@example.com");
  await page.locator("#partner-contact-consent").check();

  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toHaveText("OFFER_DRAFT");
  expect(leadRequests).toBe(0);

  await page.locator("#submit-btn").click();
  await expect(page.locator("#status-label")).toContainText("OFFER_SUBMITTED");
  await expect(page.locator("[data-repair-partner-delivery-status]")).toContainText("awaiting human review");
  expect(leadRequests).toBe(1);

  const payload = leadPayload as Record<string, any> | null;
  expect(payload).toMatchObject({
    name: "Taylor Launch Test",
    email: "taylor.launch@example.com",
    interest: "Hermes Logistics",
    consent: true,
  });
  const requestId = String(payload?.request_id || "");
  expect(requestId).toMatch(/^repair_partner_[a-z0-9]+_[a-z0-9]+$/i);
  expect(idempotencyKey).toBe(requestId);

  await page.waitForTimeout(1800);
  await expect(page.locator("#status-label")).not.toContainText("UNDER_REVIEW");

  const analytics = await page.evaluate(() => (window as any).dataLayer || []);
  const analyticsText = JSON.stringify(analytics);
  expect(analyticsText).not.toContain("Taylor Launch Test");
  expect(analyticsText).not.toContain("taylor.launch@example.com");
  expect(analyticsText).not.toContain("Milwaukee, WI");
});
