import { expect, test } from "@playwright/test";

test("Russian paid-search parameters prefill the lead without changing the receiver contract", async ({ page }) => {
  await page.goto(
    "/ru/business-growth/?service=website,seo&location=Warsaw%2C%20Poland&language=ru&goal=Launch%20a%20website%20and%20get%20qualified%20leads&utm_source=google&utm_medium=cpc&utm_campaign=ru-warsaw-website",
  );

  const form = page.locator("[data-business-lead-form]");
  await expect(form.locator('input[name="services"][value="Website development"]')).toBeChecked();
  await expect(form.locator('input[name="services"][value="SEO"]')).toBeChecked();
  await expect(form.locator('input[name="city_country"]')).toHaveValue("Warsaw, Poland");
  await expect(form.locator('select[name="preferred_language"]')).toHaveValue("Russian");
  await expect(form.locator('textarea[name="message"]')).toHaveValue("Launch a website and get qualified leads");
  await expect(page.locator("[data-campaign-context]")).toContainText("разработка сайта");
  await expect(page.locator("[data-campaign-context]")).toContainText("Warsaw, Poland");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
});

test("Ukrainian campaign aliases preselect advertising and location", async ({ page }) => {
  await page.goto("/ua/business-growth/?service=google-ads,meta-ads&city=Prague%2C%20Czechia");

  const form = page.locator("[data-business-lead-form]");
  await expect(form.locator('input[name="services"][value="Google Ads"]')).toBeChecked();
  await expect(form.locator('input[name="services"][value="Meta Ads (Facebook / Instagram)"]')).toBeChecked();
  await expect(form.locator('input[name="city_country"]')).toHaveValue("Prague, Czechia");
  await expect(form.locator('select[name="preferred_language"]')).toHaveValue("Ukrainian");
  await expect(page.locator("[data-campaign-context]")).toContainText("Prague, Czechia");
});

test("unknown campaign service is ignored instead of injecting arbitrary form values", async ({ page }) => {
  await page.goto("/business-growth/?service=unknown-service&location=Berlin%2C%20Germany");

  const form = page.locator("[data-business-lead-form]");
  await expect(form.locator('input[name="services"]:checked')).toHaveCount(0);
  await expect(form.locator('input[name="city_country"]')).toHaveValue("Berlin, Germany");
  await expect(page.locator("[data-campaign-context]")).toHaveText("Business location: Berlin, Germany.");
});
