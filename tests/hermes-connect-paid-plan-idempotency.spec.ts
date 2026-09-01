import { expect, test } from "@playwright/test";

async function fillPlan(page: import("@playwright/test").Page, goal = "Reduce scheduling calls and keep customer history connected.") {
  await page.locator("#plan-shop-name").fill("Apex Auto Care");
  await page.locator("#plan-contact-name").fill("Alex Owner");
  await page.locator("#plan-phone").fill("+1 414 555 0100");
  await page.locator("#plan-email").fill("owner@example.com");
  await page.locator("#plan-city-state").fill("Milwaukee, WI");
  await page.locator("#plan-goal").fill(goal);
  await page.locator("#plan-consent").check();
}

test("paid activation retries the same unchanged purchase intent with the same idempotency key", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));

  const keys: string[] = [];
  const requestIds: string[] = [];
  let attempt = 0;
  await page.route("**/api/logistics-lead", async (route) => {
    attempt += 1;
    const request = route.request();
    keys.push(request.headers()["idempotency-key"] || "");
    requestIds.push(String(request.postDataJSON()?.request_id || ""));
    if (attempt === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: "delivery_unavailable" }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/plan/");
  await fillPlan(page);
  await page.locator("#paid-plan-submit").click();
  await expect(page.locator("#paid-plan-status")).toContainText("Nothing was charged");
  await expect(page.locator("#paid-plan-submit")).toBeEnabled();

  await page.locator("#paid-plan-submit").click();
  await expect(page.locator("#paid-plan-status")).toContainText("Request received");

  expect(keys).toHaveLength(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
  expect(requestIds[1]).toBe(requestIds[0]);
});

test("editing purchase intent after a failed delivery creates a new idempotency identity", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false }) }));

  const keys: string[] = [];
  await page.route("**/api/logistics-lead", async (route) => {
    keys.push(route.request().headers()["idempotency-key"] || "");
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: "delivery_unavailable" }) });
  });

  await page.goto("/services/hermes-connect/repair-shops/plan/");
  await fillPlan(page);
  await page.locator("#paid-plan-submit").click();
  await expect(page.locator("#paid-plan-submit")).toBeEnabled();

  await page.locator("#plan-goal").fill("Reduce scheduling calls, retain customer history, and improve repeat booking follow-up.");
  await page.locator("#paid-plan-submit").click();
  await expect.poll(() => keys.length).toBe(2);

  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBeTruthy();
  expect(keys[1]).not.toBe(keys[0]);
});
