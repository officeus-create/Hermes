import { expect, test } from "@playwright/test";

const dashboardUrl = "/services/hermes-connect/repair-shops/dashboard/";

async function routeWorkspace(page: any) {
  await page.route("**/api/auth/me", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, specialist: { id: "owner-feedback", name: "Feedback Owner", email: "owner@example.com", role: "Shop Owner" } }) }));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, shop: null }) }));
  await page.route("**/api/services", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, services: [] }) }));
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, bookings: [] }) }));
}

test("owner submits private beta feedback and sees the persisted result", async ({ page }) => {
  await routeWorkspace(page);
  let submitted: Record<string, unknown> | null = null;
  let feedback: Array<Record<string, unknown>> = [];
  await page.route("**/api/repair-shop/feedback", async (route) => {
    if (route.request().method() === "POST") {
      submitted = route.request().postDataJSON();
      feedback = [{ id: "feedback-browser", ...submitted, created_at: "2026-08-15T20:00:00.000Z", retention_until: "2027-02-11T20:00:00.000Z" }];
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, feedback: feedback[0] }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, feedback }) });
  });

  await page.goto(dashboardUrl);
  await expect(page.getByText(/never sent to GA4/i)).toBeVisible();
  await page.locator("#feedback-category").selectOption("booking");
  await page.locator("#feedback-rating").selectOption("4");
  await page.locator("#feedback-message").fill("The booking status flow is clear and fast.");
  await page.getByRole("button", { name: "Send private feedback" }).click();

  expect(submitted).toEqual({ category: "booking", rating: 4, message: "The booking status flow is clear and fast." });
  await expect(page.locator("#workspace-alert")).toContainText("Private feedback saved");
  await expect(page.locator("#feedback-list")).toContainText("The booking status flow is clear and fast.");
  await expect(page.locator("#feedback-count")).toHaveText("1 note");
});

test("feedback text never enters analytics requests", async ({ page }) => {
  await routeWorkspace(page);
  const analyticsBodies: string[] = [];
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, feedback: [] }) }));
  await page.route(/google-analytics\.com|googletagmanager\.com/, async (route) => {
    analyticsBodies.push(route.request().postData() ?? route.request().url());
    await route.abort();
  });
  await page.goto(dashboardUrl);
  await page.locator("#feedback-message").fill("Private pilot note must stay out of analytics.");
  await page.waitForTimeout(250);
  expect(analyticsBodies.join("\n")).not.toContain("Private pilot note must stay out of analytics.");
});
