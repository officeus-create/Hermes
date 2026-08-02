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

test("carrier handoff is counted once only after a reviewed preview and explicit email click", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  await page.evaluate(() => {
    window.dataLayer = [];
  });

  const form = page.locator("[data-vehicle-form]");
  const emailLink = page.locator("[data-vehicle-email]");
  await expect(emailLink).toBeHidden();
  expect(await analyticsEvents(page, "carrier_handoff_ready")).toEqual([]);

  await form.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await form.locator('input[name="carrier_company_name"]').fill("Private Carrier LLC");
  await form.locator('input[name="carrier_contact_name"]').fill("Private Driver");
  await form.locator('input[name="authority_number"]').fill("MC 654321");
  await form.locator('input[name="carrier_email"]').fill("private@example.com");
  await form.locator('input[name="carrier_phone"]').fill("+1 (414) 555-0110");
  await form.locator('input[name="capacity_units"]').fill("3");
  await form.locator('input[name="available_from"]').fill(futureDate(7));
  await form.locator('input[name="origin_location"]').fill("Milwaukee, WI");
  await form.locator('input[name="origin_radius"]').fill("125");
  await form.locator('input[name="anywhere"]').check();
  await form.locator('input[name="carrier_consent"]').check();
  await form.getByRole("button", { name: /Review access request/ }).click();

  await expect(page.locator("[data-vehicle-result]")).toBeVisible();
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute("href", /^mailto:/);
  expect(await analyticsEvents(page, "carrier_handoff_ready")).toEqual([]);

  await page.evaluate(() => {
    document.querySelector("[data-vehicle-email]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await emailLink.click();
  await emailLink.click();

  await expect.poll(async () => (await analyticsEvents(page, "carrier_handoff_ready")).length).toBe(1);
  const handoff = (await analyticsEvents(page, "carrier_handoff_ready"))[0];
  expect(handoff).toMatchObject({
    event: "carrier_handoff_ready",
    audience_type: "carrier",
    page_group: "load_board",
    service_group: "car_hauling_dispatch",
    handoff_method: "email",
    preview_status: "dispatcher_review",
    page_path: "/load-board/",
  });

  const serialized = JSON.stringify(handoff);
  expect(serialized).not.toMatch(/Private Carrier|Private Driver|private@example|414|555|0110|MC 654321|Milwaukee/i);
  expect(serialized).not.toMatch(/mailto|email_address|phone|authority_number|origin_location|equipment_class|capacity_units/i);
});
