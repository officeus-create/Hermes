import { expect, test, type Page } from "@playwright/test";

async function analyticsEvents(page: Page, eventName: string) {
  return page.evaluate((name) => {
    const layer = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer ?? [];
    return layer.filter((item) => item.event === name);
  }, eventName);
}

test("Catalog exposes 3/6/9/12 marketing roadmaps without stale fixed pricing", async ({ page }) => {
  await page.goto("/businesses/");
  const selector = page.locator("[data-marketing-packages]");
  await expect(selector).toBeVisible();
  const cards = selector.locator("[data-package-months]");
  await expect(cards).toHaveCount(4);
  for (const months of [3, 6, 9, 12]) {
    const card = selector.locator(`[data-package-months="${months}"]`);
    await expect(card).toContainText(`${months} months`);
    await expect(card.getByRole("link")).toHaveAttribute("href", `/businesses/request/?type=marketing-package&months=${months}`);
  }
  await expect(selector).toContainText(/current fee are scoped after the business brief/i);
  await expect(selector).toContainText(/Historical package prices are not published as current offers/i);
  await expect(selector).not.toContainText(/\$4,999|\$1,500\/month/i);
});

test("Catalog claim keeps public business identity in one idempotent structured handoff", async ({ page }) => {
  const calls: Array<{ headers: Record<string, string>; body: Record<string, any> }> = [];
  await page.addInitScript(() => localStorage.setItem("hermes-analytics-consent", "granted"));
  await page.route("**/api/business-lead", async (route) => {
    const request = route.request();
    calls.push({ headers: request.headers(), body: request.postDataJSON() });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, request_id: request.headers()["idempotency-key"] }) });
  });

  await page.goto("/businesses/arkansas/sherwood/seans-autopro-mobile/");
  await page.getByRole("link", { name: "Request claim / verification" }).click();
  await expect(page).toHaveURL(/\/businesses\/request\/\?type=claim/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  const form = page.locator("[data-catalog-request]");
  await expect(form).toHaveAttribute("data-request-type", "claim");
  await expect(form.locator('input[name="company"]')).toHaveValue("Sean's AutoPro Mobile");
  await expect(form.locator('input[name="website_or_social"]')).toHaveValue("/businesses/arkansas/sherwood/seans-autopro-mobile/");
  await form.locator('input[name="name"]').fill("Synthetic Catalog Owner");
  await form.locator('input[name="email"]').fill("catalog-owner@example.com");
  await form.locator('input[name="whatsapp"]').fill("+1 501 555 0199");
  await form.locator('input[name="preferred_contact_time"]').fill("10:00-13:00 Central Time");
  const consent = form.locator('input[name="consent"]');
  await consent.focus();
  await page.keyboard.press("Space");
  await expect(consent).toBeChecked();
  const submit = form.getByRole("button", { name: "Send request" });
  await submit.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("[data-request-success]")).toBeVisible();
  expect(calls).toHaveLength(1);
  const { headers, body } = calls[0];
  expect(headers["idempotency-key"]).toBe(body.request_id);
  expect(body).toMatchObject({
    interest: "Hermes Catalog",
    company: "Sean's AutoPro Mobile",
    services: ["Catalog claim / verification"],
    consent: true,
  });
  expect(body.source_path).toContain("/businesses/request/?type=claim");

  const events = await analyticsEvents(page, "catalog_claim_requested");
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({ event: "catalog_claim_requested", requestType: "claim", businessContext: true });
  expect(JSON.stringify(events)).not.toMatch(/Synthetic Catalog Owner|catalog-owner@example\.com|501|555|0199|Sean's AutoPro/i);
});

test("marketing roadmap request reuses the same business lead receiver", async ({ page }) => {
  const calls: Array<Record<string, any>> = [];
  await page.route("**/api/business-lead", async (route) => {
    calls.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto("/businesses/request/?type=marketing-package&months=6");
  const form = page.locator("[data-catalog-request]");
  await expect(form).toHaveAttribute("data-months", "6");
  await form.locator('input[name="name"]').fill("Synthetic Marketing Owner");
  await form.locator('input[name="email"]').fill("marketing-owner@example.com");
  await form.locator('input[name="company"]').fill("Example Business");
  await form.locator('input[name="city_country"]').fill("Milwaukee, WI");
  await form.locator('input[name="telegram"]').fill("@syntheticowner");
  await form.locator('input[name="preferred_contact_time"]').fill("09:00-12:00 Central Time");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Send request" }).click();
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    interest: "ProgressoPro",
    planning_horizon: "6 months",
    services: ["Social media marketing & organic growth"],
    consent: true,
  });
});
