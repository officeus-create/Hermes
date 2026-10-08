import { expect, test } from "@playwright/test";

test("Load Board keeps indexability and an early customer path with honest inventory labels", async ({ page }, testInfo) => {
  await page.goto("/load-board/");
  const cta = page.locator("[data-hero-transport-cta]");
  await expect(cta).toBeVisible();
  expect(await cta.evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(844);
  await expect(cta).toHaveAttribute("href", "/logistics/request-vehicle-transport/#transport-intake");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator(".lbv2-product-row")).toContainText("preview examples are not inventory");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/load-board/");
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).not.toContain("noindex");
  const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schema.some((text) => JSON.parse(text).name === "Hermes Load Board")).toBe(true);
  const boardSchema = JSON.parse(schema.find((text) => JSON.parse(text).name === "Hermes Load Board")!);
  expect(boardSchema.mainEntity["@type"]).toBe("WebApplication");
  expect(boardSchema.mainEntity.offers).toBeUndefined();
  expect(boardSchema.mainEntity.aggregateRating).toBeUndefined();
  await expect(page.locator("#top")).toHaveCount(1);
  const screenshot = testInfo.outputPath("load-board-first-screen.png");
  await page.screenshot({ path: screenshot });
  await testInfo.attach("Load Board first screen", { path: screenshot, contentType: "image/png" });
  await cta.click();
  await expect(page.locator("#transport-intake")).toBeVisible();
  await expect(page.locator(".header-cta")).toHaveAttribute("href", "#transport-intake");
});

test("production transport form rejects generic 2xx and preserves retries with secure UUID fallback", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(crypto, "randomUUID", { configurable: true, value: undefined }));
  const origin = "https://hermeslogisticsus.com";
  const ids: string[] = [];
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/logistics-lead") {
      const id = route.request().postDataJSON().request_id;
      ids.push(id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ids.length === 1 ? {} : { success: true, request_id: id }) });
      return;
    }
    const response = await fetch(`http://127.0.0.1:${process.env.HERMES_E2E_PORT ?? "4321"}${url.pathname}${url.search}`);
    await route.fulfill({ status: response.status, headers: { "content-type": response.headers.get("content-type") || "application/octet-stream" }, body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.goto(`${origin}/logistics/request-vehicle-transport/?role=customer`);
  await expect(page.locator("[data-transport-mode-note]")).toContainText("Live request intake");
  const form = page.locator("[data-transport-form]");
  await form.locator('select[name="request_type"]').selectOption("customer_delivery");
  await form.locator('select[name="request_frequency"]').selectOption("one_time");
  await form.locator('select[name="equipment_preference"]').selectOption("open");
  for (const [name, value] of Object.entries({ contact_name: "Synthetic QA", email: "qa@example.com", phone: "+1 (414) 555-0199", pickup_location: "Chicago, IL", delivery_location: "Madison, WI", year_make_model: "2021 Toyota Camry", quantity: "1" })) {
    await form.locator(`input[name="${name}"]`).fill(value);
  }
  const date = new Date(); date.setUTCDate(date.getUTCDate() + 7);
  await form.locator('input[name="ready_date"]').fill(date.toISOString().slice(0, 10));
  await form.locator('select[name="commodity_type"]').selectOption("passenger_vehicle");
  await form.locator('select[name="condition"]').selectOption("operable");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Review transport request" }).click();
  const button = page.locator("[data-send-transport-lead]");
  await button.click();
  const status = page.locator("[data-transport-delivery-status]");
  await expect(status).toHaveAttribute("data-submission-state", "unconfirmed");
  await button.click();
  await expect(status).toHaveAttribute("data-submission-state", "submitted");
  await expect(status).toHaveAttribute("data-delivery-state", "unconfirmed");
  await expect(status).toHaveAttribute("data-human-receipt-state", "unconfirmed");
  expect(ids).toHaveLength(2);
  expect(ids[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(ids[0]).toBe(ids[1]);
});
