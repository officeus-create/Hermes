import { expect, test } from "@playwright/test";

test("Ukrainian Academy application localizes shell and qualification fields without forking canonical values", async ({ page }) => {
  await page.goto("/academy/apply/?program=us-logistics-operations&language=uk#contact");

  const form = page.locator("[data-contact-form]");
  await expect(form).toHaveAttribute("data-academy-application-language", "uk");
  await expect(form.locator('input[name="name"]').locator("xpath=ancestor::label[1]")).toContainText("Ваше ім’я");
  await expect(form.locator('select[name="path"]').locator("xpath=ancestor::label[1]")).toContainText("Напрям");
  await expect(form.locator('textarea[name="message"]').locator("xpath=ancestor::label[1]")).toContainText("Коротко опишіть вашу мету");
  await expect(form.locator(".consent-field")).toContainText("Я погоджуюся, що Hermes може використати ці дані");
  await expect(form.locator('[data-submit-label]')).toHaveText(/Переглянути заявку|Надіслати заявку/);
  await expect(page.locator(".contact-direct-routes")).toHaveAttribute("aria-label", "Доступні канали зв’язку");

  const pathValue = await form.locator('select[name="path"]').inputValue();
  expect(pathValue).toBe("Hermes Business Academy");

  const group = page.locator('[data-direction-fields] .contact-direction-group');
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("data-academy-application-language", "uk");
  await expect(group.locator(".contact-direction-eyebrow")).toHaveText("Дані Academy");

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

  const form = page.locator("[data-contact-form]");
  await expect(form.locator('input[name="name"]').locator("xpath=ancestor::label[1]")).toContainText("Your name");
  await expect(form.locator('[data-submit-label]')).toHaveText(/Preview request|Send request/);

  const group = page.locator('[data-direction-fields] .contact-direction-group');
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("data-academy-application-language", "en");
  await expect(group.getByText("Country and city", { exact: true })).toBeVisible();
  await expect(group.locator('select[name="academy_program"]')).toHaveValue("marketing");
});
