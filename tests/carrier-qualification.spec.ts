import { expect, test } from "@playwright/test";

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

test("new authority carrier is routed to readiness review with a complete Sales preview", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  const form = page.locator("[data-vehicle-form]");

  await expect(form.locator("[data-carrier-qualification]")).toBeVisible();
  await form.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await form.locator('input[name="carrier_company_name"]').fill("New Authority Carrier LLC");
  await form.locator('input[name="carrier_contact_name"]').fill("New Carrier Owner");
  await form.locator('input[name="authority_number"]').fill("MC 765432");
  await form.locator('select[name="authority_status"]').selectOption("pending");
  await form.locator('select[name="authority_age"]').selectOption("under_90_days");
  await form.locator('select[name="insurance_status"]').selectOption("quote_in_progress");
  await form.locator('select[name="fleet_size"]').selectOption("one");
  await form.locator('select[name="dispatch_status"]').selectOption("needs_dispatcher");
  await form.locator('input[name="carrier_email"]').fill("new-authority@example.com");
  await form.locator('input[name="carrier_phone"]').fill("+1 (312) 555-0144");
  await form.locator('input[name="capacity_units"]').fill("3");
  await form.locator('input[name="available_from"]').fill(futureDate(10));
  await form.locator('input[name="origin_location"]').fill("Chicago, IL");
  await form.locator('input[name="origin_radius"]').fill("175");
  await form.locator('input[name="anywhere"]').check();
  await form.locator('input[name="carrier_consent"]').check();
  await form.getByRole("button", { name: /Review access request/ }).click();

  const result = page.locator("[data-vehicle-result]");
  const preview = page.locator("[data-vehicle-preview]");
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("data-decision", "readiness_review");
  await expect(preview).toContainText("Authority status: Pending activation");
  await expect(preview).toContainText("Authority age: Under 90 days");
  await expect(preview).toContainText("Insurance status: Quote / policy in progress");
  await expect(preview).toContainText("Current dispatch status: Needs dispatch service");
  await expect(page.locator("[data-vehicle-email]")).toHaveAttribute("href", /READINESS%20REVIEW/);
});

test("inactive insurance blocks normal carrier onboarding", async ({ page }) => {
  await page.goto("/load-board/?role=carrier&equipment=car_hauler#carrier-access");
  const form = page.locator("[data-vehicle-form]");

  await form.locator('select[name="carrier_role"]').selectOption("carrier");
  await form.locator('input[name="carrier_company_name"]').fill("Insurance Review Carrier LLC");
  await form.locator('input[name="carrier_contact_name"]').fill("Carrier Contact");
  await form.locator('input[name="authority_number"]').fill("USDOT 1234567");
  await form.locator('select[name="authority_status"]').selectOption("active");
  await form.locator('select[name="authority_age"]').selectOption("over_one_year");
  await form.locator('select[name="insurance_status"]').selectOption("inactive");
  await form.locator('select[name="fleet_size"]').selectOption("four_to_ten");
  await form.locator('select[name="dispatch_status"]').selectOption("self_dispatching");
  await form.locator('input[name="carrier_email"]').fill("insurance-review@example.com");
  await form.locator('input[name="carrier_phone"]').fill("+1 (414) 555-0199");
  await form.locator('input[name="capacity_units"]').fill("7");
  await form.locator('input[name="available_from"]').fill(futureDate(12));
  await form.locator('input[name="origin_location"]').fill("Milwaukee, WI");
  await form.locator('input[name="origin_radius"]').fill("200");
  await form.locator('input[name="anywhere"]').check();
  await form.locator('input[name="carrier_consent"]').check();
  await form.getByRole("button", { name: /Review access request/ }).click();

  const result = page.locator("[data-vehicle-result]");
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("data-decision", "needs_more_information");
  await expect(page.locator("[data-vehicle-actions]")).toContainText(/active operating authority and insurance/i);
});
