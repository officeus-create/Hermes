import { expect, test, type Page } from "@playwright/test";

const futureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
};

const readEvents = (page: Page) =>
  page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return (analyticsWindow.dataLayer || []).filter((item) => typeof item.event === "string");
  });

test("carrier preview records one privacy-safe email handoff", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  const form = page.locator("[data-vehicle-form]");

  await form.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await form.locator('input[name="carrier_company_name"]').fill("Private Test Carrier LLC");
  await form.locator('input[name="carrier_contact_name"]').fill("Private Test Driver");
  await form.locator('input[name="authority_number"]').fill("MC 123456");
  await form.locator('input[name="carrier_email"]').fill("private@example.com");
  await form.locator('input[name="carrier_phone"]').fill("+1 (312) 555-0182");
  await form.locator('input[name="capacity_units"]').fill("3");
  await form.locator('input[name="available_from"]').fill(futureDate(7));
  await form.locator('input[name="origin_location"]').fill("Chicago, IL");
  await form.locator('input[name="origin_radius"]').fill("150");
  await form.locator('input[name="anywhere"]').check();
  await form.locator('input[name="carrier_consent"]').check();

  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "carrier_intake_start").length).toBe(1);

  await form.getByRole("button", { name: "Review access request" }).click();
  await expect(page.locator("[data-vehicle-result]")).toBeVisible();
  await expect(page.locator("[data-vehicle-decision]")).toHaveText("dispatcher review");
  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "carrier_intake_preview_ready").length).toBe(1);
  expect((await readEvents(page)).filter((item) => item.event === "carrier_handoff_ready")).toEqual([]);

  await page.evaluate(() => {
    document.querySelector("[data-vehicle-email]")?.addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });
  const emailHandoff = page.locator("[data-vehicle-email]");
  await emailHandoff.click();
  await emailHandoff.click();

  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "carrier_handoff_ready").length).toBe(1);

  const handoffEvent = (await readEvents(page)).find((item) => item.event === "carrier_handoff_ready");
  expect(handoffEvent).toEqual(expect.objectContaining({
    event: "carrier_handoff_ready",
    audience_type: "carrier",
    page_group: "load_board",
    service_group: "car_hauling_dispatch",
    handoff_method: "email",
    preview_status: "dispatcher_review",
    page_path: "/load-board/",
  }));

  expect(JSON.stringify(handoffEvent)).not.toMatch(/Private Test|example\.com|312|123456|Chicago|capacity_units|origin_location|authority_number/i);
});

test("carrier handoff is not reported before a valid preview", async ({ page }) => {
  await page.goto("/load-board/?role=carrier#carrier-access");
  const form = page.locator("[data-vehicle-form]");
  await form.getByRole("button", { name: "Review access request" }).click();
  await page.waitForTimeout(50);

  expect((await readEvents(page)).filter((item) => item.event === "carrier_handoff_ready")).toEqual([]);
});
