import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("Playwright baseURL is required");
  await page.addInitScript(() => sessionStorage.setItem("hermes-intro-seen", "true"));
  await page.route("https://hermeslogisticsus.com/**", async (route) => {
    const incoming = new URL(route.request().url());
    const local = new URL(`${incoming.pathname}${incoming.search}`, baseURL);
    const response = await route.fetch({ url: local.href });
    await route.fulfill({ response });
  });
  await page.goto("https://hermeslogisticsus.com/paths/logistics/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-contact-form]")).toHaveAttribute("data-contact-mode", "live");
  await expect(page.locator("[data-contact-form]")).toHaveAttribute("data-contact-endpoint", "/api/logistics-lead");
});

const fillSyntheticRequest = async (page: import("@playwright/test").Page) => {
  const form = page.locator("[data-contact-form]");
  await form.locator('[name="name"]').fill("QA Example");
  await form.locator('[name="email"]').fill("qa@example.invalid");
  await form.locator('[name="message"]').fill("Synthetic request for local delivery testing only.");
  await form.locator('[name="consent"]').check();
  return form;
};

test("relative live endpoint sends once and reports success only after 2xx", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/logistics-lead", async (route) => {
    posts += 1;
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.headers()["idempotency-key"]).toBeTruthy();
    expect(request.postDataJSON().source_path).toBe("/paths/logistics/");
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
  });

  const form = await fillSyntheticRequest(page);
  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[data-form-status]")).toContainText("sent successfully");
  expect(posts).toBe(1);
});

test("failed live delivery keeps the request and never reports success", async ({ page }) => {
  await page.route("**/api/logistics-lead", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: '{"success":false}' }),
  );

  const form = await fillSyntheticRequest(page);
  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[data-form-alert]")).toContainText("not confirmed as received");
  await expect(form.locator("[data-form-status]")).not.toContainText("sent successfully");
  await expect(form.locator('[name="message"]')).toHaveValue("Synthetic request for local delivery testing only.");
});

test("insecure external endpoint is rejected before sending", async ({ page }) => {
  const form = page.locator("[data-contact-form]");
  await form.evaluate((element) => {
    (element as HTMLFormElement).dataset.contactEndpoint = "http://example.invalid/api/logistics-lead";
  });
  let posts = 0;
  await page.route("**/api/logistics-lead", async (route) => {
    posts += 1;
    await route.abort();
  });

  await fillSyntheticRequest(page);
  await form.locator('button[type="submit"]').click();
  await expect(form.locator("[data-form-alert]")).toContainText("temporarily unavailable");
  expect(posts).toBe(0);
});
