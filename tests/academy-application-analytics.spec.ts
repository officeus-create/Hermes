import { expect, test } from "@playwright/test";

test("Academy application emits bounded program/language funnel events without PII", async ({ page }) => {
  await page.goto("/academy/apply/?program=us-logistics-operations&language=uk#contact", { waitUntil: "domcontentloaded" });

  await page.locator('input[name="name"]').fill("Analytics Test Person");
  await page.locator('input[name="email"]').fill("analytics-test@example.com");
  await page.locator('textarea[name="message"]').fill("This is synthetic browser QA application text only.");
  await page.locator('input[name="consent"]').check();

  await expect(page.locator('select[name="academy_program"]')).toHaveValue("us-logistics-operations");
  await page.locator('input[name="academy_country_city"]').fill("Synthetic City");
  await page.locator('textarea[name="academy_languages_levels"]').fill("Synthetic language answer");
  await page.locator('select[name="academy_english_level"]').selectOption("B2");
  await page.locator('textarea[name="academy_recent_experience"]').fill("Synthetic recent experience");
  await page.locator('select[name="academy_objective"]').selectOption("Career development");
  await page.locator('input[name="academy_us_timezone_availability"]').fill("Synthetic availability");
  await page.locator('select[name="academy_preferred_contact_route"]').selectOption("Email");

  await page.locator('input[name="academy_target_role_or_skill"]').fill("Synthetic role");
  await page.locator('input[name="academy_weekly_learning_availability"]').fill("Synthetic weekly availability");
  await page.locator('input[name="academy_preferred_language"]').fill("Ukrainian");

  await page.locator('button[type="submit"]').click();
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();

  const handoffLink = page.locator("[data-handoff-route-link]");
  await expect(handoffLink).toHaveAttribute("href", /^mailto:/);
  await handoffLink.click({ noWaitAfter: true });

  const events = await page.evaluate(() =>
    (window.dataLayer ?? []).filter((entry: any) => String(entry?.event ?? "").startsWith("academy_application_")),
  );

  const names = events.map((entry: any) => entry.event);
  expect(names.filter((name: string) => name === "academy_application_start")).toHaveLength(1);
  expect(names.filter((name: string) => name === "academy_application_preview_ready")).toHaveLength(1);
  expect(names.filter((name: string) => name === "academy_application_handoff_ready")).toHaveLength(1);

  for (const event of events) {
    expect(event.page_group).toBe("academy_application");
    expect(event.service_group).toBe("academy");
    expect(event.academy_program).toBe("us-logistics-operations");
    expect(event.application_language).toBe("uk");
    expect(event.page_path).toBe("/academy/apply/");

    const serialized = JSON.stringify(event).toLowerCase();
    for (const forbidden of [
      "analytics test person",
      "analytics-test@example.com",
      "synthetic city",
      "synthetic language answer",
      "synthetic recent experience",
      "synthetic availability",
      "synthetic browser qa application text",
      "synthetic role",
      "request_id",
      "idempotency",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  }
});

test("Academy analytics source has no delivery-confirmed event without receiver contract", async ({ page }) => {
  await page.goto("/academy/apply/?program=marketing", { waitUntil: "domcontentloaded" });
  const source = await page.locator("body").evaluate(() => document.documentElement.innerHTML);
  expect(source).not.toContain("academy_application_delivery_confirmed");
});
