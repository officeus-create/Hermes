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

test("carrier intake records start, preview and handoff without submitted data", async ({ page }) => {
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

  const emailHandoff = page.locator("[data-vehicle-email]");
  await page.evaluate(() => {
    document.querySelector("[data-vehicle-email]")?.addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });
  await emailHandoff.click();

  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "carrier_handoff_ready").length).toBe(1);

  const funnelEvents = (await readEvents(page)).filter((item) =>
    ["carrier_intake_start", "carrier_intake_preview_ready", "carrier_handoff_ready"].includes(String(item.event)),
  );
  expect(funnelEvents).toEqual([
    {
      event: "carrier_intake_start",
      intake_type: "carrier",
      page_group: "load_board",
      page_path: "/load-board/",
    },
    {
      event: "carrier_intake_preview_ready",
      intake_type: "carrier",
      page_group: "load_board",
      page_path: "/load-board/",
      preview_status: "dispatcher_review",
    },
    {
      event: "carrier_handoff_ready",
      intake_type: "carrier",
      page_group: "load_board",
      page_path: "/load-board/",
      handoff_method: "email",
      preview_status: "dispatcher_review",
    },
  ]);

  const serialized = JSON.stringify(funnelEvents);
  expect(serialized).not.toMatch(/Private Test|example\.com|312|123456|Chicago|car_hauler|capacity/i);
});

test("invalid carrier form does not report preview or handoff readiness", async ({ page }) => {
  await page.goto("/load-board/?role=carrier#carrier-access");
  await page.locator("[data-vehicle-form]").getByRole("button", { name: "Review access request" }).click();
  await page.waitForTimeout(50);

  const events = await readEvents(page);
  expect(events.filter((item) => item.event === "carrier_intake_preview_ready")).toEqual([]);
  expect(events.filter((item) => item.event === "carrier_handoff_ready")).toEqual([]);
});
