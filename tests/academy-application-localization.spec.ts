import { expect, test } from "@playwright/test";

test("Ukrainian Academy application localizes qualification fields without forking canonical values", async ({ page }) => {
  await page.goto("/academy/apply/?program=us-logistics-operations&language=uk#contact");

  const group = page.locator('[data-direction-fields] .contact-direction-group');
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("data-academy-application-language", "uk");

  await expect(group.getByText("Країна та місто", { exact: true })).toBeVisible();
  await expect(group.getByText("Мови та рівні", { exact: true })).toBeVisible();
  await expect(group.getByText("Рівень розмовної англійської", { exact: true })).toBeVisible();
  await expect(group.getByText("Основна мета", { exact: true })).toBeVisible();
  await expect(group.getByText("Бажаний канал зв’язку", { exact: true })).toBeVisible();

  const program = group.locator('select[name="academy_program"]');
  await expect(program).toHaveValue("us-logistics-operations");

  const objectiveValues = await group.locator('select[name="academy_objective"] option').evaluateAll((options) =>
    options.map((option) => (option as HTMLOptionElement).value),
  );
  expect(objectiveValues).toContain("Career development");
  expect(objectiveValues).toContain("Business capability");

  const contactValues = await group.locator('select[name="academy_preferred_contact_route"] option').evaluateAll((options) =>
    options.map((option) => (option as HTMLOptionElement).value),
  );
  expect(contactValues).toEqual(expect.arrayContaining(["Email", "Telegram", "WhatsApp"]));

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("English Academy application remains the default", async ({ page }) => {
  await page.goto("/academy/apply/?program=marketing#contact");

  const group = page.locator('[data-direction-fields] .contact-direction-group');
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("data-academy-application-language", "en");
  await expect(group.getByText("Country and city", { exact: true })).toBeVisible();
  await expect(group.locator('select[name="academy_program"]')).toHaveValue("marketing");
});
