import { expect, test } from "@playwright/test";

test("business growth landing page shows the focused paid-search lead form", async ({ page }) => {
  await page.goto("/business-growth/?utm_source=google&utm_medium=cpc&utm_campaign=test&utm_term=seo&gclid=test-gclid");

  await expect(page.getByRole("heading", { name: "Launch the system your business needs to get clients." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");

  const form = page.locator("[data-business-lead-form]");
  await expect(form).toBeVisible();
  await expect(form.locator('input[name="company"]')).toBeVisible();
  await expect(form.locator('input[name="city_country"]')).toBeVisible();
  await expect(form.locator('input[name="whatsapp"]')).toBeVisible();
  await expect(form.locator('input[name="telegram"]')).toBeVisible();
  await expect(form.locator('input[name="website_or_social"]')).toBeVisible();
  await expect(form.getByText("Website development", { exact: true })).toBeVisible();
  await expect(form.getByText("Web applications", { exact: true })).toBeVisible();
  await expect(form.getByText("CRM & business automation", { exact: true })).toBeVisible();
  await expect(form.getByText("AI bots / AI sales assistant", { exact: true })).toBeVisible();
  await expect(form.getByText("SEO", { exact: true })).toBeVisible();
  await expect(form.getByText("Google Ads", { exact: true })).toBeVisible();
  await expect(form.locator('select[name="preferred_language"]')).toBeVisible();
  await expect(form.locator('input[name="preferred_contact_time"]')).toBeVisible();
  await expect(form.locator('input[name="interest"]')).toHaveValue("ProgressoPro");
});

test("core Marketing and Technology pages retain the existing contact intake", async ({ page }) => {
  await page.goto("/paths/marketing/?service=SEO%20%2F%20Google%20Search");
  await expect(page.locator("[data-contact-form]")).toBeVisible();
  await expect(page.locator("[data-business-lead-form]")).toHaveCount(0);

  await page.goto("/paths/technology/");
  await expect(page.locator("[data-contact-form]")).toBeVisible();
  await expect(page.locator("[data-business-lead-form]")).toHaveCount(0);
});

test("business lead form requires a messenger and at least one service", async ({ page }) => {
  await page.goto("/business-growth/");
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

  await form.locator('input[name="services"][value="SEO"]').check();
  await form.getByRole("button", { name: /Preview request|Send request/ }).click();
  await expect(form.locator("[data-form-status]")).toContainText("Preview ready");
});
