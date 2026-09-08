import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const staff = [{
  id: "staff-layout-1",
  name: "Alex Rivera",
  role: "Technician",
  specialties: ["Brakes", "Diagnostics"],
  active: true,
}];

const schedules = Array.from({ length: 7 }, (_, day) => ({
  day_of_week: day,
  is_working: day > 0 && day < 6,
  start_time: day > 0 && day < 6 ? "07:30" : null,
  end_time: day > 0 && day < 6 ? "18:30" : null,
  breaks: day > 0 && day < 6 ? [{ start_time: "12:00", end_time: "12:30" }] : [],
}));

async function mockCompanySchedule(page: Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill(json({
    success: true,
    specialist: {
      id: "owner-layout-1",
      name: "Schedule Layout Owner",
      email: "owner-layout@example.com",
      role: "Shop Owner",
    },
  })));

  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json({
    success: true,
    identity: {
      id: "owner-layout-1",
      name: "Schedule Layout Owner",
      email: "owner-layout@example.com",
      role: "Shop Owner",
    },
    owned_businesses: [{
      key: "repair_shop",
      kind: "owned_business",
      id: "shop-layout-1",
      name: "Schedule Layout Garage",
      slug: "schedule-layout-garage",
      href: "/services/hermes-connect/repair-shops/dashboard/",
      workspace_state: "live",
    }],
    workspaces: [],
    capabilities: { internal_ai: false },
  })));

  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(json({
    success: true,
    shop: {
      id: "shop-layout-1",
      slug: "schedule-layout-garage",
      name: "Schedule Layout Garage",
      phone: "+14145550100",
      address_line1: "123 Test Ave",
      city: "Milwaukee",
      state: "WI",
      region: "Wisconsin",
      country_code: "US",
      postal_code: "53202",
      timezone: "America/Chicago",
    },
  })));

  await page.route("**/api/repair-shop/staff", (route) => route.fulfill(json({
    success: true,
    shop_id: "shop-layout-1",
    staff,
  })));

  await page.route("**/api/repair-shop/staff-schedule**", (route) => route.fulfill(json({
    success: true,
    shop_id: "shop-layout-1",
    staff_id: "staff-layout-1",
    timezone: "America/Chicago",
    schedules,
    calendar_conflicts: [],
    calendar_conflicts_source: "local_only",
  })));
}

async function captureSchedule(page: Page, testInfo: TestInfo) {
  const directory = path.resolve("artifacts/repair-shop-settings");
  await mkdir(directory, { recursive: true });
  const schedule = page.locator("#schedule");
  await schedule.scrollIntoViewIfNeeded();
  await schedule.screenshot({
    path: path.join(directory, `company-schedule-layout-${testInfo.project.name}.png`),
    animations: "disabled",
  });
}

test("Company schedule remains readable and touch-safe on desktop and mobile", async ({ page }, testInfo) => {
  await mockCompanySchedule(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#schedule-form")).toBeVisible();
  await expect(page.locator(".schedule-row")).toHaveCount(7);

  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);

  const monday = page.locator('.schedule-row[data-day="1"]');
  await expect(monday).toBeVisible();
  await expect(monday.locator(".start-input")).toHaveValue("07:30");
  await expect(monday.locator(".end-input")).toHaveValue("18:30");
  await expect(monday.locator(".break-start-input")).toHaveValue("12:00");
  await expect(monday.locator(".break-end-input")).toHaveValue("12:30");

  const metrics = await monday.evaluate((row) => {
    const inputs = Array.from(row.querySelectorAll<HTMLInputElement>('input[type="time"]'));
    return inputs.map((input) => {
      const rect = input.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
  });
  expect(metrics).toHaveLength(4);
  for (const metric of metrics) {
    expect(metric.height).toBeGreaterThanOrEqual(44);
    expect(metric.width).toBeGreaterThanOrEqual(90);
  }

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 780) {
    const labels = await monday.evaluate((row) => {
      const working = row.querySelector("label");
      const pairs = row.querySelectorAll(".time-pair");
      return {
        working: working ? getComputedStyle(working, "::after").content : "",
        shift: pairs[0] ? getComputedStyle(pairs[0], "::before").content : "",
        breakLabel: pairs[1] ? getComputedStyle(pairs[1], "::before").content : "",
      };
    });
    expect(labels.working).toContain("Working");
    expect(labels.shift).toContain("Shift");
    expect(labels.breakLabel).toContain("Break");

    const rowBox = await monday.boundingBox();
    expect(rowBox).not.toBeNull();
    expect((rowBox?.width || 0)).toBeLessThanOrEqual(viewport.width);
  }

  await captureSchedule(page, testInfo);
});

test("Russian mobile schedule labels stay localized", async ({ page }) => {
  test.skip((page.viewportSize()?.width || 9999) > 780, "mobile-only label check");
  await mockCompanySchedule(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/?lang=ru", { waitUntil: "domcontentloaded" });

  const monday = page.locator('.schedule-row[data-day="1"]');
  await expect(monday).toBeVisible();
  const labels = await monday.evaluate((row) => {
    const working = row.querySelector("label");
    const pairs = row.querySelectorAll(".time-pair");
    return {
      working: working ? getComputedStyle(working, "::after").content : "",
      shift: pairs[0] ? getComputedStyle(pairs[0], "::before").content : "",
      breakLabel: pairs[1] ? getComputedStyle(pairs[1], "::before").content : "",
    };
  });
  expect(labels.working).toContain("Работает");
  expect(labels.shift).toContain("Смена");
  expect(labels.breakLabel).toContain("Перерыв");
});
