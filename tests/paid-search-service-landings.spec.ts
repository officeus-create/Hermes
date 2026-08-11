import { expect, test } from "@playwright/test";

const routes = [
  { path: "/ru/business-growth/website/", heading: "Сайт для бизнеса", services: ["Website development"] },
  { path: "/ru/business-growth/seo/", heading: "SEO, которое строится", services: ["SEO"] },
  { path: "/ru/business-growth/advertising/", heading: "Запуск рекламы", services: ["Google Ads", "Meta Ads (Facebook / Instagram)"] },
  { path: "/ru/business-growth/social-media/", heading: "Социальные сети, контент и видео", services: ["Social media marketing & organic growth", "TikTok / Threads / X growth", "Video & content production"] },
  { path: "/ru/business-growth/ai-automation/", heading: "Автоматизация и AI", services: ["CRM & business automation", "AI bots / AI sales assistant"] },
  { path: "/ua/business-growth/website/", heading: "Сайт для бізнесу", services: ["Website development"] },
  { path: "/ua/business-growth/seo/", heading: "SEO, яке будується", services: ["SEO"] },
  { path: "/ua/business-growth/advertising/", heading: "Запуск реклами", services: ["Google Ads", "Meta Ads (Facebook / Instagram)"] },
  { path: "/ua/business-growth/social-media/", heading: "Соціальні мережі, контент і відео", services: ["Social media marketing & organic growth", "TikTok / Threads / X growth", "Video & content production"] },
  { path: "/ua/business-growth/ai-automation/", heading: "Автоматизація та AI", services: ["CRM & business automation", "AI bots / AI sales assistant"] },
];

for (const route of routes) {
  test(`${route.path} is a focused noindex paid-search landing`, async ({ page }) => {
    await page.goto(`${route.path}?utm_source=google&utm_medium=cpc&utm_campaign=test`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.heading);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
    await expect(page.locator("[data-business-lead-form]")).toBeVisible();

    for (const service of route.services) {
      await expect(page.locator(`input[name="services"][value="${service}"]`)).toBeChecked();
    }
  });
}

test("paid-search service landing keeps free-form lead fields empty", async ({ page }) => {
  await page.goto("/ru/business-growth/website/?location=Berlin%2C%20Germany&goal=private%20project%20brief");
  const form = page.locator("[data-business-lead-form]");

  await expect(form.locator('input[name="city_country"]')).toHaveValue("");
  await expect(form.locator('textarea[name="message"]')).toHaveValue("");
  await expect(form.locator('input[name="services"][value="Website development"]')).toBeChecked();
});
