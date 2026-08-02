import { expect, test, type Page } from "@playwright/test";

const readEvents = (page: Page) =>
  page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return (analyticsWindow.dataLayer || []).filter((item) => typeof item.event === "string");
  });

test("SEO service CTA records a privacy-safe commercial entry", async ({ page }) => {
  await page.goto("/services/seo/");
  const cta = page.locator(".digital-service-actions").getByRole("link", { name: "Start an SEO review request" });
  await page.evaluate(() => {
    document.querySelector("[data-seo-service-cta]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await cta.click();

  const event = (await readEvents(page)).find((item) => item.event === "commercial_cta_click");
  expect(event).toEqual(expect.objectContaining({
    event: "commercial_cta_click",
    cta_type: "seo_service_intake",
    audience_type: "business",
    page_group: "digital_service",
    service_group: "seo_services",
    page_path: "/services/seo/",
    destination_path: "/paths/marketing/",
  }));
});

test("SEO intake produces a structured preview and explicit handoff without analytics PII", async ({ page }) => {
  await page.goto("/paths/marketing/?service=seo#contact");
  const form = page.locator("[data-contact-form]");

  await expect(form.locator("[data-seo-intake]")) .toBeVisible();
  await expect(form.locator('select[name="path"]')).toHaveValue("ProgressoPro");
  await expect(form.locator('select[name="path"]')).toBeDisabled();

  await form.locator('input[name="name"]').fill("Private Jordan Blake");
  await form.locator('input[name="email"]').fill("private-jordan@example.com");
  await form.locator('input[name="seo_current_website"]').fill("https://private-example.com");
  await form.locator('input[name="seo_primary_market"]').fill("Milwaukee and the United States");
  await form.locator('select[name="seo_vertical"]').selectOption("professional_services");
  await form.locator('select[name="seo_search_scope"]').selectOption("local_and_national");
  await form.locator('select[name="seo_gsc_access"]').selectOption("available");
  await form.locator('select[name="seo_ga4_access"]').selectOption("needs_setup");
  await form.locator('select[name="seo_work_scope"]').selectOption("full_service");
  await form.locator('select[name="seo_timeline"]').selectOption("6 months");
  await form.locator('select[name="seo_budget_mode"]').selectOption("monthly");
  await form.locator('textarea[name="seo_current_problem"]').fill("Organic traffic is not producing qualified inquiries from the target United States market.");
  await form.locator('textarea[name="message"]').fill("Review technical SEO, query ownership, authority, and the search-to-inquiry path.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Preview request" }).click();

  const handoff = form.locator("[data-contact-handoff]");
  const summary = form.locator("[data-handoff-summary]");
  await expect(handoff).toBeVisible();
  await expect(summary).toContainText("SEO / Google Search");
  await expect(summary).toContainText("Full SEO service");
  await expect(summary).toContainText("Milwaukee and the United States");
  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "seo_intake_preview_ready").length).toBe(1);

  await page.evaluate(() => {
    document.querySelector("[data-handoff-route-link]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await form.locator("[data-handoff-route-link]").click();
  await form.locator("[data-handoff-route-link]").click();

  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "seo_handoff_ready").length).toBe(1);

  const funnelEvents = (await readEvents(page)).filter((item) =>
    ["seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"].includes(String(item.event)),
  );
  expect(funnelEvents).toHaveLength(3);
  expect(funnelEvents).toEqual([
    expect.objectContaining({
      event: "seo_intake_start",
      intake_type: "seo_service",
      page_group: "marketing_contact",
      service_group: "seo_services",
      page_path: "/paths/marketing/",
    }),
    expect.objectContaining({
      event: "seo_intake_preview_ready",
      intake_type: "seo_service",
      preview_status: "prepared",
      page_path: "/paths/marketing/",
    }),
    expect.objectContaining({
      event: "seo_handoff_ready",
      intake_type: "seo_service",
      handoff_method: "email",
      preview_status: "prepared",
      page_path: "/paths/marketing/",
    }),
  ]);

  const serialized = JSON.stringify(funnelEvents);
  expect(serialized).not.toMatch(/Jordan|example\.com|private-example|Milwaukee|qualified inquiries|monthly|6 months/i);
});

test("unsupported marketing service query keeps the generic contact form", async ({ page }) => {
  await page.goto("/paths/marketing/?service=unsupported#contact");
  const form = page.locator("[data-contact-form]");
  await expect(form.locator("[data-seo-intake]")).toHaveCount(0);
  await form.locator('input[name="name"]').fill("Generic visitor");

  const events = await readEvents(page);
  expect(events.filter((item) => item.event === "seo_intake_start")).toEqual([]);
});
