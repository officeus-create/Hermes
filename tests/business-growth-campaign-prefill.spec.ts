import { expect, test } from "@playwright/test";

test("Russian paid-search parameters preselect controlled services and language only", async ({ page }) => {
  await page.goto(
    "/ru/business-growth/?service=website,seo&language=ru&location=Warsaw%2C%20Poland&goal=Launch%20a%20website%20and%20get%20qualified%20leads&utm_source=google&utm_medium=cpc&utm_campaign=ru-warsaw-website",
  );

  const form = page.locator("[data-business-lead-form]");
  await expect(form.locator('input[name="services"][value="Website development"]')).toBeChecked();
  await expect(form.locator('input[name="services"][value="SEO"]')).toBeChecked();
  await expect(form.locator('select[name="preferred_language"]')).toHaveValue("Russian");
  await expect(form.locator('input[name="city_country"]')).toHaveValue("");
  await expect(form.locator('textarea[name="message"]')).toHaveValue("");
  await expect(page.locator("[data-campaign-context]")).toContainText("разработка сайта");
  await expect(page.locator("[data-campaign-context]")).not.toContainText("Warsaw");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
});

test("Ukrainian campaign aliases preselect only approved advertising services", async ({ page }) => {
  await page.goto("/ua/business-growth/?service=google-ads,meta-ads&city=Prague%2C%20Czechia");

  const form = page.locator("[data-business-lead-form]");
  await expect(form.locator('input[name="services"][value="Google Ads"]')).toBeChecked();
  await expect(form.locator('input[name="services"][value="Meta Ads (Facebook / Instagram)"]')).toBeChecked();
  await expect(form.locator('input[name="city_country"]')).toHaveValue("");
  await expect(form.locator('select[name="preferred_language"]')).toHaveValue("Ukrainian");
  await expect(page.locator("[data-campaign-context]")).toContainText("Google Ads");
});

test("unknown and free-form campaign values never become form values", async ({ page }) => {
  await page.goto(
    "/business-growth/?service=unknown-service&location=Berlin%2C%20Germany&goal=Please%20include%20private%20details%20here&language=unknown",
  );

  const form = page.locator("[data-business-lead-form]");
  await expect(form.locator('input[name="services"]:checked')).toHaveCount(0);
  await expect(form.locator('input[name="city_country"]')).toHaveValue("");
  await expect(form.locator('textarea[name="message"]')).toHaveValue("");
  await expect(page.locator("[data-campaign-context]")).toBeHidden();
});
