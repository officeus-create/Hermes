import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/";

test("Hermes Connect surfaces live tools and keeps one Web App access form", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("Hermes Connect Web App · Live Tools");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: /One clear workflow/i })).toBeVisible();
  await expect(page.locator("#live-tools")).toBeVisible();
  await expect(page.locator("[data-connect-tool]")).toHaveCount(5);

  const categoryCards = page.locator("[data-category-id]");
  await expect(categoryCards).toHaveCount(10);
  await page.locator('[data-category-id="truck-car-hauler-repair"]').click();
  await expect(page.locator('[data-category-id="truck-car-hauler-repair"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-preview-name]")).toHaveText("FleetLine Repair");
  await expect(page.locator("[data-preview-role]")).toContainText("Commercial truck and car-hauler service");
  await expect(page.locator('[name="category_id"]')).toHaveValue("truck-car-hauler-repair");
  await expect(page.locator("[data-selected-summary] strong")).toContainText("Truck & car-hauler repair · Hermes Connect Web App");

  await expect(page.locator('[name="platform_id"]')).toHaveCount(0);
  await expect(page.getByText(/iPhone|Android|App Store|Google Play/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Requests become reviewed product tasks/i })).toBeVisible();
  await expect(page.getByText(/AI tools support implementation/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Need a workflow that is not in Live Tools yet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Request Web App access/i })).toBeVisible();
  await expect(page.locator('footer a[href="https://hermeslogisticsus.com/services/hermes-connect/"]')).toBeVisible();
  await expect(page.locator('footer a[href="https://hermeslogisticsus.com/services/hermes-connect/"]')).toHaveText("Hermes Connect overview");
});

test("Hermes Connect exposes the automotive and equipment categories on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const requiredMobileCategories = [
    "auto-service-repair",
    "truck-car-hauler-repair",
    "heavy-equipment-service",
    "oversize-specialty-equipment",
  ];

  for (const categoryId of requiredMobileCategories) {
    await expect(page.locator(`[data-category-id="${categoryId}"]`)).toBeVisible();
  }

  await page.locator('[data-category-id="oversize-specialty-equipment"]').click();
  await expect(page.locator("[data-preview-name]")).toHaveText("Titan Specialty Support");
  await expect(page.locator('[name="category_id"]')).toHaveValue("oversize-specialty-equipment");
  await expect(page.locator("[data-selected-summary] strong")).toContainText("Oversize & specialty equipment · Hermes Connect Web App");
  await expect(page.locator(".mobile-apply")).toBeVisible();
  await expect(page.locator(".mobile-apply")).toHaveAttribute("href", "#live-tools");
});

test("Hermes Connect submits a privacy-safe Web App access request through the protected adapter", async ({ page }) => {
  let submittedInterest = "";
  let submittedSourcePath = "";
  let submittedMessage = "";
  let submittedRequestId = "";
  let requestIdHeader = "";
  let submittedPublicDimensions: Record<string, unknown> = {};

  await page.route("https://hermeslogisticsus.com/api/connect-lead", async (route) => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    submittedInterest = String(payload.interest ?? "");
    submittedSourcePath = String(payload.source_path ?? "");
    submittedMessage = String(payload.message ?? "");
    submittedRequestId = String(payload.request_id ?? "");
    submittedPublicDimensions = (payload.public_dimensions ?? {}) as Record<string, unknown>;
    requestIdHeader = route.request().headers()["idempotency-key"] ?? "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, request_id: submittedRequestId }),
    });
  });

  await page.goto(route);
  await page.locator('[name="name"]').fill("Connect Test Owner");
  await page.locator('[name="email"]').fill("owner@example.com");
  await page.locator('[name="business_name"]').fill("Test Service Studio");
  await page.locator('[name="role"]').fill("Owner");
  await page.locator('[name="category_id"]').selectOption("beauty-wellness");
  await page.locator('[name="team_size"]').selectOption({ label: "2–5 people" });
  await page.locator('[name="current_method"]').selectOption({ label: "Instagram / social messages" });
  await page.locator('[name="must_have"]').fill("Clients must choose a service, see available request times and submit in under two minutes.");
  await page.locator('[name="consent"]').check();
  await page.getByRole("button", { name: /Request Web App access/i }).click();

  await expect(page.locator("[data-application-result]")).toBeVisible();
  await expect(page.locator("[data-form-status]")).toHaveText("Web App access request delivery confirmed.");

  expect(submittedInterest).toBe("IT Development");
  expect(submittedSourcePath).toBe("/hermes-connect/web-access/");
  expect(submittedMessage).toContain("Hermes Connect web-access request");
  expect(submittedMessage).toContain("Category: Beauty & wellness");
  expect(submittedMessage).toContain("Requested product: Hermes Connect Web App");
  expect(submittedMessage).not.toMatch(/iPhone|Android/);
  expect(submittedPublicDimensions.platform_id).toBe("web");
  expect(requestIdHeader).toBe(submittedRequestId);
  expect(submittedRequestId.length).toBeGreaterThan(7);

  const analytics = await page.evaluate(() => JSON.stringify(window.dataLayer ?? []));
  expect(analytics).toContain("connect_application_delivery_confirmed");
  expect(analytics).toContain("beauty-wellness");
  expect(analytics).toContain("web");
  expect(analytics).not.toContain("owner@example.com");
  expect(analytics).not.toContain("Connect Test Owner");
  expect(analytics).not.toContain("Test Service Studio");
});

test("Hermes Connect keeps a prepared email fallback when Web App delivery is not confirmed", async ({ page }) => {
  await page.route("https://hermeslogisticsus.com/api/connect-lead", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });

  await page.goto(route);
  await page.locator('[name="name"]').fill("Fallback Owner");
  await page.locator('[name="email"]').fill("fallback@example.com");
  await page.locator('[name="role"]').fill("Owner");
  await page.locator('[name="must_have"]').fill("I need a client request path for services and availability.");
  await page.locator('[name="consent"]').check();
  await page.getByRole("button", { name: /Request Web App access/i }).click();

  await expect(page.locator("[data-fallback-result]")).toBeVisible();
  await expect(page.locator("[data-fallback-email]")).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com/);
  await expect(page.locator("[data-application-result]")).toBeHidden();
});
