import { expect, test, type Page } from "@playwright/test";

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

async function analyticsEvents(page: Page, eventName: string) {
  return page.evaluate((name) => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.filter((item) => item.event === name) ?? [];
  }, eventName);
}

async function fillQualification(form: ReturnType<Page["locator"]>) {
  await form.locator('select[name="authority_status"]').selectOption("active");
  await form.locator('select[name="authority_age"]').selectOption("over_one_year");
  await form.locator('select[name="insurance_status"]').selectOption("active");
  await form.locator('select[name="fleet_size"]').selectOption("two_to_three");
  await form.locator('select[name="dispatch_status"]').selectOption("needs_dispatcher");
}

async function fillCarrierForm(page: Page) {
  const form = page.locator("[data-vehicle-form]");
  await expect(form.locator("[data-carrier-qualification]")).toBeVisible();
  await form.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await form.locator('input[name="carrier_company_name"]').fill("Test Carrier LLC");
  await form.locator('input[name="carrier_contact_name"]').fill("Test Driver");
  await form.locator('input[name="authority_number"]').fill("MC 123456");
  await fillQualification(form);
  await form.locator('input[name="carrier_email"]').fill("driver@example.com");
  await form.locator('input[name="carrier_phone"]').fill("+1 (312) 555-0182");
  await expect(form.locator('select[name="equipment_class"]')).toHaveValue("car_hauler");
  await form.locator('input[name="capacity_units"]').fill("3");
  await form.locator('input[name="available_from"]').fill(futureDate(7));
  await form.locator('input[name="origin_location"]').fill("Chicago, IL");
  await form.locator('input[name="origin_radius"]').fill("150");
  await form.locator('input[name="anywhere"]').check();
  await form.locator('input[name="carrier_consent"]').check();
  return form;
}

const isApprovedAnalyticsRequest = (url: string) =>
  url.includes("google-analytics.com") || url.includes("googletagmanager.com");

test("carrier intake emits one start and one privacy-safe preview event", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  await page.evaluate(() => {
    window.dataLayer = [];
  });

  const form = await fillCarrierForm(page);

  await expect.poll(async () => (await analyticsEvents(page, "carrier_intake_start")).length).toBe(1);

  await form.getByRole("button", { name: /Review access request/ }).click();
  await expect(page.locator("[data-vehicle-result]")).toBeVisible();
  await expect(page.locator("[data-vehicle-preview]")).toContainText("Authority status: Active");
  await expect(page.locator("[data-vehicle-preview]")).toContainText("Current dispatch status: Needs dispatch service");
  await expect(page.locator("[data-vehicle-preview]")).toContainText("no email, account, call, CRM write, load booking, or dispatcher assignment was created automatically");
  await expect.poll(async () => (await analyticsEvents(page, "carrier_intake_preview_ready")).length).toBe(1);

  const analytics = {
    starts: await analyticsEvents(page, "carrier_intake_start"),
    previews: await analyticsEvents(page, "carrier_intake_preview_ready"),
  };

  expect(analytics.starts[0]).toMatchObject({
    event: "carrier_intake_start",
    audience_type: "carrier",
    page_group: "load_board",
    service_group: "car_hauling_dispatch",
    page_path: "/load-board/",
  });
  expect(analytics.previews[0]).toMatchObject({
    event: "carrier_intake_preview_ready",
    audience_type: "carrier",
    page_group: "load_board",
    service_group: "car_hauling_dispatch",
    preview_status: "dispatcher_review",
    page_path: "/load-board/",
  });

  const serialized = JSON.stringify(analytics);
  expect(serialized).not.toMatch(/Test Carrier|Test Driver|driver@example|312|555|0182|MC 123456|Chicago/i);
  expect(serialized).not.toMatch(/email|phone|authority_number|authority_status|insurance_status|fleet_size|dispatch_status|origin_location|destination_location|vehicle_name|interested_load/i);
  expect(writes).toEqual([]);
});

test("consented load-board carrier events are forwarded once to gtag without PII", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  await page.evaluate(() => localStorage.setItem("hermes-analytics-consent", "granted"));
  await page.reload();

  await page.evaluate(() => {
    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
      gtag?: (...args: unknown[]) => void;
      __carrierGtagCalls?: unknown[][];
    };
    analyticsWindow.__carrierGtagCalls = [];
    analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.__carrierGtagCalls?.push(args);
    if (analyticsWindow.dataLayer) analyticsWindow.dataLayer.length = 0;
  });

  const form = await fillCarrierForm(page);
  await expect.poll(async () => page.evaluate(() => {
    const analyticsWindow = window as Window & { __carrierGtagCalls?: unknown[][] };
    return analyticsWindow.__carrierGtagCalls?.filter((call) => call[0] === "event" && call[1] === "carrier_intake_start").length ?? 0;
  })).toBe(1);

  await form.getByRole("button", { name: /Review access request/ }).click();
  await expect(page.locator("[data-vehicle-result]")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const analyticsWindow = window as Window & { __carrierGtagCalls?: unknown[][] };
    return analyticsWindow.__carrierGtagCalls?.filter((call) => call[0] === "event" && call[1] === "carrier_intake_preview_ready").length ?? 0;
  })).toBe(1);

  const carrierCalls = await page.evaluate(() => {
    const analyticsWindow = window as Window & { __carrierGtagCalls?: unknown[][] };
    return analyticsWindow.__carrierGtagCalls?.filter((call) => (
      call[0] === "event" && typeof call[1] === "string" && String(call[1]).startsWith("carrier_")
    )) ?? [];
  });

  expect(carrierCalls).toHaveLength(2);
  expect(carrierCalls[0]).toEqual([
    "event",
    "carrier_intake_start",
    {
      audience_type: "carrier",
      page_group: "load_board",
      service_group: "car_hauling_dispatch",
      page_path: "/load-board/",
    },
  ]);
  expect(carrierCalls[1]).toEqual([
    "event",
    "carrier_intake_preview_ready",
    {
      audience_type: "carrier",
      page_group: "load_board",
      service_group: "car_hauling_dispatch",
      preview_status: "dispatcher_review",
      page_path: "/load-board/",
    },
  ]);

  const serialized = JSON.stringify(carrierCalls);
  expect(serialized).not.toMatch(/Test Carrier|Test Driver|driver@example|312|555|0182|MC 123456|Chicago/i);
  expect(serialized).not.toMatch(/email|phone|authority_number|authority_status|insurance_status|fleet_size|dispatch_status|origin_location|destination_location|vehicle_name|interested_load/i);
});

test("invalid carrier intake does not emit a preview-ready event", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  await page.evaluate(() => {
    window.dataLayer = [];
  });

  await page.locator("[data-vehicle-form]").getByRole("button", { name: /Review access request/ }).click();
  await expect(page.locator("[data-vehicle-alert]")).toBeVisible();
  await expect.poll(async () => (await analyticsEvents(page, "carrier_intake_preview_ready")).length).toBe(0);
});