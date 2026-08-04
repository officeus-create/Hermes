import { expect, test, type Page } from "@playwright/test";

const route = "/demos/hermes-connect/";

async function fillRequiredRequest(page: Page) {
  await page.locator('[name="name"]').fill("Accessible Test Owner");
  await page.locator('[name="email"]').fill("owner@example.com");
  await page.locator('[name="role"]').fill("Owner");
  await page.locator('[name="must_have"]').fill("Clients need one clear service and availability request workflow.");
  await page.locator('[name="consent"]').check();
}

test("Hermes Connect exposes safe guidance and focuses the first invalid field", async ({ page }) => {
  await page.goto(route);

  await expect(page.locator("[data-selected-summary]")).toHaveAttribute("aria-live", "polite");
  await expect(page.locator('[name="must_have"]')).toHaveAttribute("aria-describedby", "connect-must-have-help");
  await expect(page.locator("#connect-must-have-help")).toContainText("Do not include client names");
  await expect(page.getByRole("button", { name: /Request Web App access/i })).toHaveAttribute(
    "aria-describedby",
    "connect-form-status",
  );

  await page.getByRole("button", { name: /Request Web App access/i }).click();

  const name = page.locator('[name="name"]');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("[data-form-alert]")).toHaveText("Review the highlighted fields and try again.");
  await expect(page.locator("[data-form-status]")).toHaveText("Request not sent.");

  await name.fill("Accessible Test Owner");
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
});

test("confirmed delivery moves focus to the review result", async ({ page }) => {
  await page.route("https://hermeslogisticsus.com/api/connect-lead", async (requestRoute) => {
    const payload = requestRoute.request().postDataJSON() as Record<string, unknown>;
    await requestRoute.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, request_id: payload.request_id }),
    });
  });

  await page.goto(route);
  await fillRequiredRequest(page);
  await page.getByRole("button", { name: /Request Web App access/i }).click();

  const result = page.locator("[data-application-result]");
  await expect(result).toBeVisible();
  await expect(result).toBeFocused();
  await expect(result).toHaveAttribute("tabindex", "-1");
});

test("unconfirmed delivery moves focus to the prepared-email fallback", async ({ page }) => {
  await page.route("https://hermeslogisticsus.com/api/connect-lead", async (requestRoute) => {
    await requestRoute.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ success: false }),
    });
  });

  await page.goto(route);
  await fillRequiredRequest(page);
  await page.getByRole("button", { name: /Request Web App access/i }).click();

  const fallback = page.locator("[data-fallback-result]");
  await expect(fallback).toBeVisible();
  await expect(fallback).toBeFocused();
  await expect(fallback).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("[data-fallback-email]")).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com/);
});
