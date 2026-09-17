import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

const localPort = process.env.HERMES_E2E_PORT ?? "4321";
const localOrigin = `http://127.0.0.1:${localPort}`;
const productionOrigin = "https://hermeslogisticsus.com";

const futureDate = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

test("canonical Load Board upgrades preview handoffs to same-origin secure delivery", async ({ page }) => {
  test.setTimeout(60_000);
  const deliveries: Array<{ url: string; method: string; body: any }> = [];

  await page.route(`${productionOrigin}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/api/logistics-lead") {
      deliveries.push({ url: request.url(), method: request.method(), body: request.postDataJSON() });
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
      return;
    }

    const localResponse = await fetch(`${localOrigin}${url.pathname}${url.search}`);
    const body = Buffer.from(await localResponse.arrayBuffer());
    const contentType = localResponse.headers.get("content-type") || "application/octet-stream";
    await route.fulfill({ status: localResponse.status, headers: { "content-type": contentType }, body });
  });

  await page.goto(`${productionOrigin}/load-board/`, { waitUntil: "load" });

  const carrierForm = page.locator("[data-vehicle-form]");
  const loadForm = page.locator("[data-load-board-form]");
  await expect(carrierForm.locator('select[name="authority_status"]')).toBeAttached();
  await expect(carrierForm).toHaveAttribute("data-lead-mode", "live");
  await expect(carrierForm).toHaveAttribute("data-lead-endpoint", "/api/logistics-lead");
  await expect(loadForm).toHaveAttribute("data-lead-mode", "live");
  await expect(loadForm).toHaveAttribute("data-lead-endpoint", "/api/logistics-lead");

  await carrierForm.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await carrierForm.locator('input[name="carrier_company_name"]').fill("Synthetic Production Host Carrier LLC");
  await carrierForm.locator('input[name="carrier_contact_name"]').fill("QA Carrier");
  await carrierForm.locator('input[name="authority_number"]').fill("MC 123456");
  await carrierForm.locator('select[name="equipment_class"]').selectOption("car_hauler");
  for (const name of ["authority_status", "authority_age", "insurance_status", "fleet_size", "dispatch_status"]) {
    const select = carrierForm.locator(`select[name="${name}"]`);
    const firstValue = await select.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value).find(Boolean) || "");
    await select.selectOption(firstValue);
  }
  await carrierForm.locator('input[name="carrier_email"]').fill("carrier-production-smoke@hermesconnect.app");
  await carrierForm.locator('input[name="carrier_phone"]').fill("+1 (312) 555-0182");
  await carrierForm.locator('input[name="capacity_units"]').fill("3");
  await carrierForm.locator('input[name="available_from"]').fill(futureDate(7));
  await carrierForm.locator('input[name="origin_location"]').fill("Chicago, IL");
  await carrierForm.locator('input[name="origin_radius"]').fill("150");
  for (const name of ["anywhere", "carrier_consent"]) {
    await carrierForm.locator(`input[name="${name}"]`).evaluate((input: HTMLInputElement) => {
      input.checked = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  await carrierForm.evaluate((form: HTMLFormElement) => form.requestSubmit());

  const sendButton = page.locator("[data-send-vehicle-lead]");
  await expect(sendButton).toBeVisible();
  await expect(page.locator("[data-vehicle-email]")).toBeHidden();
  await sendButton.scrollIntoViewIfNeeded();
  await sendButton.click();

  await expect.poll(() => deliveries.length).toBe(1);
  expect(deliveries[0].url).toBe(`${productionOrigin}/api/logistics-lead`);
  expect(deliveries[0].method).toBe("POST");
  expect(deliveries[0].body.lead_type).toBe("load_board_access");
  expect(deliveries[0].body.sales_tag).toBe("LOAD BOARD ACCESS / CARRIER");
  await expect(page.locator("[data-vehicle-delivery-status]")).toContainText("Request received by Logistics Sales");

  await loadForm.locator('select[name="submitter_type"]').selectOption("private_party");
  await loadForm.locator('input[name="contact_name"]').fill("QA Customer");
  await loadForm.locator('input[name="email"]').fill("qa-customer@example.com");
  await loadForm.locator('input[name="phone"]').fill("+1 (414) 555-0167");
  await loadForm.locator('input[name="pickup_location"]').fill("Milwaukee, WI");
  await loadForm.locator('input[name="delivery_location"]').fill("Chicago, IL");
  await loadForm.locator('input[name="ready_date"]').fill(futureDate(10));
  await loadForm.locator('select[name="commodity_type"]').selectOption("passenger_vehicle");
  await loadForm.locator('input[name="year_make_model"]').fill("2021 Toyota Camry");
  await loadForm.locator('input[name="quantity"]').fill("1");
  await loadForm.locator('select[name="condition"]').selectOption("operable");
  await loadForm.locator('input[name="consent"]').evaluate((input: HTMLInputElement) => {
    input.checked = true;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await loadForm.evaluate((form: HTMLFormElement) => form.requestSubmit());

  const loadSendButton = page.locator("[data-send-load-lead]");
  await expect(loadSendButton).toBeVisible();
  await expect(page.locator("[data-load-email]")).toBeHidden();
  await loadSendButton.scrollIntoViewIfNeeded();
  await loadSendButton.click();

  await expect.poll(() => deliveries.length).toBe(2);
  expect(deliveries[1].url).toBe(`${productionOrigin}/api/logistics-lead`);
  expect(deliveries[1].method).toBe("POST");
  expect(deliveries[1].body.lead_type).toBe("posted_load");
  expect(deliveries[1].body.sales_tag).toBe("POSTED LOAD / CUSTOMER");
  await expect(page.locator("[data-load-delivery-status]")).toContainText("Request received by Logistics Sales");
});
