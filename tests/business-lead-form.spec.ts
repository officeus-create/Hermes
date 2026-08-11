import { expect, test } from "@playwright/test";

test("marketing path shows the focused business lead form", async ({ page }) => {
  await page.goto("/paths/marketing/?utm_source=google&utm_medium=cpc&utm_campaign=test&utm_term=seo");

  const form = page.locator("[data-business-lead-form]");
  await expect(form).toBeVisible();
  await expect(form.locator('input[name="company"]')).toBeVisible();
  await expect(form.locator('input[name="city_country"]')).toBeVisible();
  await expect(form.locator('input[name="whatsapp"]')).toBeVisible();
  await expect(form.locator('input[name="telegram"]')).toBeVisible();
  await expect(form.locator('input[name="website_or_social"]')).toBeVisible();
  await expect(form.getByText("Website development", { exact: true })).toBeVisible();
  await expect(form.getByText("SEO", { exact: true })).toBeVisible();
  await expect(form.getByText("Google Ads", { exact: true })).toBeVisible();
  await expect(form.locator('select[name="preferred_language"]')).toBeVisible();
  await expect(form.locator('input[name="preferred_contact_time"]')).toBeVisible();
  await expect(form.locator('input[name="interest"]')).toHaveValue("ProgressoPro");
});

test("technology path routes the same lead form to IT Development", async ({ page }) => {
  await page.goto("/paths/technology/");
  const form = page.locator("[data-business-lead-form]");
  await expect(form).toBeVisible();
  await expect(form.locator('input[name="interest"]')).toHaveValue("IT Development");
  await expect(form.getByText("CRM & business automation", { exact: true })).toBeVisible();
  await expect(form.getByText("AI bots / AI sales assistant", { exact: true })).toBeVisible();
});

test("business lead form requires a messenger and at least one service", async ({ page }) => {
  await page.goto("/paths/marketing/");
  const form = page.locator("[data-business-lead-form]");

  await form.locator('input[name="name"]').fill("Test Lead");
  await form.locator('input[name="email"]').fill("lead@example.com");
  await form.locator('input[name="company"]').fill("Example Company");
  await form.locator('input[name="city_country"]').fill("Kyiv, Ukraine");
  await form.locator('input[name="website_or_social"]').fill("https://example.com");
  await form.locator('select[name="preferred_language"]').selectOption("Ukrainian");
  await form.locator('input[name="preferred_contact_time"]').fill("10:00-12:00 Kyiv time");
  await form.locator('textarea[name="message"]').fill("We need more qualified leads for our business.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: /Preview request|Send request/ }).click();

  await expect(form.locator("[data-form-alert]")).toContainText("WhatsApp number or Telegram");

  await form.locator('input[name="telegram"]').fill("@testlead");
  await form.getByRole("button", { name: /Preview request|Send request/ }).click();
  await expect(form.locator("[data-form-alert]")).toContainText("select at least one service");
});
