import { expect, test, type Locator, type Page } from "@playwright/test";

const readEvents = (page: Page) =>
  page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return (analyticsWindow.dataLayer || []).filter((item) => typeof item.event === "string");
  });

async function fillWebsiteScope(brief: Locator, projectType = "website_and_seo") {
  await expect(brief.locator("[data-website-project-scope]")).toBeVisible();
  await brief.locator('select[name="website_project_type"]').selectOption(projectType);
  await brief.locator('input[name="website_current_url"]').fill("https://private-current-site.example");
  await brief.locator('input[name="website_target_market"]').fill("United States professional services market");
  await brief.locator('select[name="website_page_range"]').selectOption("6-10");
  await brief.locator('textarea[name="website_integrations"]').fill("CRM, scheduling, analytics, and secure lead routing");
  await brief.locator('input[name="website_languages"]').fill("English and Spanish");
}

test("website development service records CTA and opens an exact project scope", async ({ page }) => {
  await page.goto("/services/website-development/");

  const primary = page.locator(".digital-service-actions").getByRole("link", {
    name: "Start a website project brief",
  });
  await expect(primary).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );

  await page.evaluate(() => {
    document.querySelector("[data-website-project-cta]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await primary.click();

  const commercialEvent = (await readEvents(page)).find((item) => item.event === "commercial_cta_click");
  expect(commercialEvent).toEqual(expect.objectContaining({
    event: "commercial_cta_click",
    cta_type: "website_project_intake",
    audience_type: "business",
    page_group: "digital_service",
    service_group: "website_development",
    page_path: "/services/website-development/",
    destination_path: "/paths/technology/",
  }));

  await page.goto("/paths/technology/?project=website_development#project-brief");
  const brief = page.locator("[data-it-project-brief]");
  await expect(brief).toBeVisible();
  await expect(brief.locator('textarea[name="project_1"]')).toHaveValue("Custom Website Development with SEO Foundation");
  await expect(brief.locator('select[name="website_project_type"]')).toHaveValue("new_website");
});

test("website project brief includes exact scope and records start, preview and explicit handoff without analytics PII", async ({ page }) => {
  await page.goto("/paths/technology/?project=website_development#project-brief");
  const brief = page.locator("[data-it-project-brief]");

  await fillWebsiteScope(brief);
  await brief.locator('select[name="company_stage"]').selectOption({ label: "Small company ready to grow" });
  await brief.locator('input[name="industry"]').fill("Private Professional Services");
  await brief.locator('textarea[name="business_goal"]').fill("Create a stronger website that qualifies U.S. customer inquiries.");
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('input[name="no_examples"]').check();
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('select[name="investment_horizon"]').selectOption({ label: "6 months" });
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('input[name="company_name"]').fill("Private Example Services");
  await brief.locator('input[name="contact_name"]').fill("Private Alex Morgan");
  await brief.locator('input[name="contact_role"]').fill("Owner");
  await brief.locator('input[name="contact_email"]').fill("private@example.com");
  await brief.locator('input[name="country"]').fill("United States");
  await brief.locator('input[name="region_city"]').fill("Milwaukee, Wisconsin");
  await brief.locator('input[name="brief_consent"]').check();
  await brief.getByRole("button", { name: "Continue" }).click();

  const summary = brief.locator("[data-brief-summary]");
  await expect(summary).toContainText("Private Example Services");
  await expect(summary).toContainText("Website project scope");
  await expect(summary).toContainText("Project type: Website + SEO");
  await expect(summary).toContainText("Required page range: 6–10 pages");
  await expect(summary).toContainText("CRM, scheduling, analytics, and secure lead routing");
  await expect(brief.locator("[data-brief-email]")).toHaveAttribute("href", /Website%20project%20scope/);
  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "website_project_preview_ready").length).toBe(1);

  await page.evaluate(() => {
    document.querySelector("[data-brief-email]")?.addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });
  await brief.locator("[data-brief-email]").click();
  await brief.locator("[data-brief-email]").click();

  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "website_handoff_ready").length).toBe(1);

  const funnelEvents = (await readEvents(page)).filter((item) =>
    ["website_project_intake_start", "website_project_preview_ready", "website_handoff_ready"].includes(String(item.event)),
  );
  expect(funnelEvents).toHaveLength(3);
  const serialized = JSON.stringify(funnelEvents);
  expect(serialized).not.toMatch(/Private|example\.com|Milwaukee|Professional Services|Alex Morgan|website that qualifies|scheduling|Spanish|6-10/i);
});

test("website redesign uses redesign scope and its own privacy-safe funnel taxonomy", async ({ page }) => {
  await page.goto("/services/website-redesign/");
  const cta = page.locator(".digital-service-actions").getByRole("link", { name: "Start a website redesign brief" });
  await page.evaluate(() => {
    document.querySelector("[data-website-project-cta]")?.addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });
  await cta.click();
  const commercial = (await readEvents(page)).find((item) => item.event === "commercial_cta_click");
  expect(commercial).toEqual(expect.objectContaining({
    service_group: "website_redesign",
    page_path: "/services/website-redesign/",
  }));

  await page.goto("/paths/technology/?project=website_redesign#project-brief");
  const brief = page.locator("[data-it-project-brief]");
  await expect(brief.locator('textarea[name="project_1"]')).toHaveValue("Website Redesign with SEO and Conversion Protection");
  await expect(brief.locator('select[name="website_project_type"]')).toHaveValue("redesign");
});

test("unsupported project query does not add website scope, prefill or emit website-project events", async ({ page }) => {
  await page.goto("/paths/technology/?project=unsupported#project-brief");
  const brief = page.locator("[data-it-project-brief]");
  await expect(brief.locator('textarea[name="project_1"]')).toHaveValue("");
  await expect(brief.locator("[data-website-project-scope]")).toHaveCount(0);
  await brief.locator('input[name="industry"]').fill("Test industry");

  const events = await readEvents(page);
  expect(events.filter((item) => item.event === "website_project_intake_start")).toEqual([]);
});
