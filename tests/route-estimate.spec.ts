import { expect, test } from "@playwright/test";

const openLoadForm = async (page) => {
  const response = await page.goto("/load-board/?role=dealer#post-load");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("[data-route-estimate-panel]")).toBeVisible();
};

const fillRoute = async (page, origin = "Chicago, IL", destination = "Milwaukee, WI") => {
  await page.locator('input[name="pickup_location"]').fill(origin);
  await page.locator('input[name="delivery_location"]').fill(destination);
};

const enableLiveModeForTest = async (page) => {
  await page.locator("[data-route-estimate-panel]").evaluate((panel) => {
    if (!(panel instanceof HTMLElement)) throw new Error("route panel missing");
    panel.dataset.routeEstimateMode = "live";
    panel.dataset.routeEstimateEndpoint = "/api/route-estimate";
  });
};

test.describe("Route estimate boundary", () => {
  test("preview mode validates locations and performs no request", async ({ page }) => {
    let routeRequests = 0;
    await page.route("**/api/route-estimate", async (route) => {
      routeRequests += 1;
      await route.abort();
    });
    await openLoadForm(page);

    await fillRoute(page, "Paris", "London");
    const button = page.getByRole("button", { name: "Estimate route" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-route-estimate-status]")).toContainText("U.S. city and state");

    await fillRoute(page);
    await button.click();
    await expect(page.locator("[data-route-estimate-status]")).toContainText("not connected yet");
    expect(routeRequests).toBe(0);
  });

  test("renders a mocked general driving estimate after explicit interaction", async ({ page }) => {
    await page.route("**/api/route-estimate", async (route) => {
      const request = route.request();
      expect(request.method()).toBe("POST");
      expect(request.headers()["content-type"]).toContain("application/json");
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({
        origin: { address: "Chicago, IL" },
        destination: { address: "Milwaukee, WI" },
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          distance_miles: 92.4,
          duration_minutes: 101,
        }),
      });
    });
    await openLoadForm(page);
    await enableLiveModeForTest(page);
    await fillRoute(page);

    const button = page.getByRole("button", { name: "Estimate route" });
    await button.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("[data-route-estimate-result]")).toBeVisible();
    await expect(page.locator("[data-route-estimate-miles]")).toHaveText("92.4");
    await expect(page.locator("[data-route-estimate-minutes]")).toHaveText("101");
    await expect(page.locator("[data-route-estimate-status]")).toContainText("planning context only");
    await expect(page.locator("[data-route-estimate-panel]")).toContainText("not truck-specific");
  });

  test("shows quota fallback without changing or submitting the lead form", async ({ page }) => {
    await page.route("**/api/route-estimate", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "rate_limit_exceeded" }),
      });
    });
    await openLoadForm(page);
    await enableLiveModeForTest(page);
    await fillRoute(page);
    await page.getByRole("button", { name: "Estimate route" }).click();

    await expect(page.locator("[data-route-estimate-status]")).toContainText("limit was reached");
    await expect(page.locator("[data-route-estimate-result]")).toBeHidden();
    await expect(page.locator("[data-load-result]")).toBeHidden();
    await expect(page.locator('input[name="pickup_location"]')).toHaveValue("Chicago, IL");
    await expect(page.locator('input[name="delivery_location"]')).toHaveValue("Milwaukee, WI");
  });

  test("uses a clear offline fallback and does not claim the request was sent", async ({ page }) => {
    await page.route("**/api/route-estimate", async (route) => route.abort("internetdisconnected"));
    await openLoadForm(page);
    await enableLiveModeForTest(page);
    await fillRoute(page, "Madison, WI", "Indianapolis, IN");
    await page.getByRole("button", { name: "Estimate route" }).click();

    const status = page.locator("[data-route-estimate-status]");
    await expect(status).toContainText("temporarily unavailable");
    await expect(status).toContainText("details were not sent");
    await expect(page.locator("[data-route-estimate-result]")).toBeHidden();
  });
});
