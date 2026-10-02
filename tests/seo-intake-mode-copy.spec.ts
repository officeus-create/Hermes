import { expect, test, type Page } from "@playwright/test";

const checkIntake = async (page: Page, mode: "live" | "preview") => {
  const form = page.locator("[data-contact-form]");
  await expect(form.locator("[data-seo-intake]")).toBeVisible();
  await expect(form).toHaveAttribute("data-contact-mode", mode);
  await expect(form.locator('select[name="path"]')).toHaveValue("ProgressoPro");
  await expect(form.locator('input[type="hidden"][name="path"]')).toHaveValue("ProgressoPro");
  await expect(form.locator('input[type="hidden"][name="platforms"]')).toHaveValue("SEO / Google Search");
  for (const name of ["seo_primary_market", "seo_vertical", "seo_search_scope", "seo_gsc_access", "seo_ga4_access", "seo_work_scope", "seo_timeline", "seo_current_problem"]) {
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute("required", "");
  }
  await expect(form.locator('input[name="consent"]')).toHaveAttribute("required", "");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
};

test("SEO preview explains the explicit handoff at 390px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/paths/marketing/?service=seo#contact");
  await checkIntake(page, "preview");
  await expect(page.locator(".seo-intake-boundary")).toContainText("This preview does not send or store your answers");
  await expect(page.locator(".seo-intake-boundary")).toContainText("use the contact route");
  await expect(page.locator("[data-submit-label]")).toHaveText("Preview request");
});

test("SEO live mode copy follows the production override at 390px without submitting", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  const localOrigin = `http://127.0.0.1:${process.env.HERMES_E2E_PORT ?? "4321"}`;
  await page.route("https://hermeslogisticsus.com/**", async (route) => {
    const url = new URL(route.request().url());
    const local = `${localOrigin}${url.pathname}${url.search}`;
    const response = await route.fetch({ url: local });
    await route.fulfill({ response });
  });
  await page.goto("https://hermeslogisticsus.com/paths/marketing/?service=seo#contact");
  await checkIntake(page, "live");
  await expect(page.locator("[data-contact-form]")).toHaveAttribute("data-contact-endpoint", "/api/logistics-lead");
  await expect(page.locator(".seo-intake-boundary")).toContainText("accepted for delivery, not that a person received or qualified it");
  await expect(page.locator(".seo-intake-boundary")).not.toContainText("This preview does not send");
  await expect(page.locator("[data-submit-label]")).toHaveText("Send request");
});
