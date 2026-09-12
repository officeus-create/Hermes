import { expect, test } from "@playwright/test";

test("Load Board curtain is present in HTML without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/load-board/`);
  await expect(page.locator(".hlb-structural-preview")).toHaveCount(60);
  await expect(page.locator(".hlb-structural-preview").first()).toContainText("PREVIEW · NOT LIVE");
  await expect(page.locator("[data-live-load-count]")).toHaveText("—");
  await context.close();
});

test("unavailable load inventory never masquerades as zero live loads", async ({ page }) => {
  await page.route("**/api/load-board/**", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"success":false}' }));
  await page.goto("/load-board/");
  await expect(page.locator("[data-live-load-status]")).toContainText("temporarily unavailable");
  await expect(page.locator("[data-live-load-count]")).toHaveText("—");
  await expect(page.locator("[data-live-capacity-count]")).toHaveText("—");
  await expect(page.locator(".hlb-structural-preview")).toHaveCount(60);
  expect(await page.locator(".hlb-structural-preview").first().evaluate(node => getComputedStyle(node).display)).toBe("grid");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("requested login mode selects the existing-account form", async ({ page }) => {
  await page.route("**/api/auth/me", route => route.fulfill({ status: 401, contentType: "application/json", body: '{}' }));
  await page.goto("/services/hermes-connect/load-board/access/?mode=login");
  await expect(page.locator("[data-login-form]")).toBeVisible();
  await expect(page.locator("[data-register-form]")).toBeHidden();
});

test("qualified action is bound to the rendered load ID without a second inventory read", async ({ page }) => {
  let inventoryReads = 0;
  let requestedLoad: string | null = null;
  await page.route("**/api/load-board/active?type=load", route => {
    inventoryReads += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      success: true, load_board_access: true, records: [{ id: inventoryReads === 1 ? "fixture-load-a" : "fixture-load-b", equipment: "car_hauler", origin: "Chicago, IL", destination: "Miami, FL", rateAmount: 1800, rateCurrency: "USD" }],
    }) });
  });
  await page.route("**/api/load-board/active?type=capacity", route => route.fulfill({ status: 200, contentType: "application/json", body: '{"records":[]}' }));
  await page.route("**/api/load-board/summary", route => route.fulfill({ status: 200, contentType: "application/json", body: '{"available_loads":1,"available_trucks":0}' }));
  await page.route("**/api/load-board/source-requests", route => route.fulfill({ status: 200, contentType: "application/json", body: '{"eligible_to_propose_source":false}' }));
  await page.route("**/api/load-board/interest", route => {
    requestedLoad = route.request().postDataJSON().load_id;
    return route.fulfill({ status: 202, contentType: "application/json", body: '{"request":{"status":"requested"}}' });
  });
  await page.goto("/load-board/");
  const row = page.locator('.hlb-live-row--open[data-load-id="fixture-load-a"]');
  await row.getByRole("button", { name: "Request details" }).click();
  await expect(row.getByRole("button", { name: "Requested for review" })).toBeVisible();
  expect(requestedLoad).toBe("fixture-load-a");
  expect(inventoryReads).toBe(1);
});
