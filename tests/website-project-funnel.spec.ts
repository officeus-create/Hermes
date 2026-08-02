import { expect, test, type Page } from "@playwright/test";

const readEvents = (page: Page) =>
  page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return (analyticsWindow.dataLayer || []).filter((item) => typeof item.event === "string");
  });

test("website development service routes into a structured project brief", async ({ page }) => {
  await page.goto("/services/website-development/");

  const heroActions = page.locator(".digital-service-actions");
  const primary = heroActions.getByRole("link", { name: "Start a website project brief" });
  await expect(primary).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );
  await expect(page.getByRole("link", { name: "Prepare the website brief" })).toHaveAttribute(
    "href",
    "/paths/technology/?project=website_development#project-brief",
  );
  await expect(page.getByText(/does not automatically send or store the answers/i)).toBeVisible();

  await page.evaluate(() => {
    document.querySelector("[data-website-project-cta]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await primary.click();

  const commercialEvent = (await readEvents(page)).find((item) => item.event === "commercial_cta_click");
  expect(commercialEvent).toEqual({
    event: "commercial_cta_click",
    cta_type: "website_project_intake",
    audience_type: "business",
    page_group: "digital_service",
    service_group: "website_development",
    page_path: "/services/website-development/",
    destination_path: "/paths/technology/",
  });

  await page.goto("/paths/technology/?project=website_development#project-brief");
  const brief = page.locator("[data-it-project-brief]");
  await expect(brief).toBeVisible();
  await expect(brief.locator('textarea[name="project_1"]')).toHaveValue("Custom Website Development with SEO Foundation");
});

test("website project brief records start, preview and handoff without submitted data", async ({ page }) => {
  await page.goto("/paths/technology/?project=website_development#project-brief");
  const brief = page.locator("[data-it-project-brief]");

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

  await expect(brief.locator("[data-brief-summary]")).toContainText("Private Example Services");
  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "website_project_preview_ready").length).toBe(1);

  await page.evaluate(() => {
    document.querySelector("[data-brief-email]")?.addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });
  await brief.locator("[data-brief-email]").click();

  await expect.poll(async () => (await readEvents(page)).filter((item) => item.event === "marketing_handoff_ready").length).toBe(1);

  const funnelEvents = (await readEvents(page)).filter((item) =>
    ["website_project_intake_start", "website_project_preview_ready", "marketing_handoff_ready"].includes(String(item.event)),
  );
  expect(funnelEvents).toEqual([
    {
      event: "website_project_intake_start",
      intake_type: "website_project",
      page_group: "technology_project_brief",
      page_path: "/paths/technology/",
    },
    {
      event: "website_project_preview_ready",
      intake_type: "website_project",
      page_group: "technology_project_brief",
      page_path: "/paths/technology/",
      preview_status: "prepared",
    },
    {
      event: "marketing_handoff_ready",
      intake_type: "website_project",
      page_group: "technology_project_brief",
      page_path: "/paths/technology/",
      handoff_method: "email",
      preview_status: "prepared",
    },
  ]);

  const serialized = JSON.stringify(funnelEvents);
  expect(serialized).not.toMatch(/Private|example\.com|Milwaukee|Professional Services|Alex Morgan|website that qualifies/i);
});

test("unsupported project query does not prefill or emit website-project events", async ({ page }) => {
  await page.goto("/paths/technology/?project=unsupported#project-brief");
  const brief = page.locator("[data-it-project-brief]");
  await expect(brief.locator('textarea[name="project_1"]')).toHaveValue("");
  await brief.locator('input[name="industry"]').fill("Test industry");

  const events = await readEvents(page);
  expect(events.filter((item) => item.event === "website_project_intake_start")).toEqual([]);
});
