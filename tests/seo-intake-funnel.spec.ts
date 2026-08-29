import { expect, test, type Page } from "@playwright/test";

const readEvents = (page: Page) =>
  page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return (analyticsWindow.dataLayer || []).filter((item) => typeof item.event === "string");
  });

const prepareConsentGrantedQueue = async (page: Page) => {
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
  await page.addInitScript(() => {
    window.localStorage.setItem("hermes-analytics-consent", "granted");
  });
};

const readGtagEvents = (page: Page) =>
  page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<unknown> };
    return (analyticsWindow.dataLayer || []).flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const values = Object.values(entry as Record<string, unknown>);
      if (values[0] !== "event" || typeof values[1] !== "string") return [];
      return [{ event: values[1], parameters: values[2] }];
    });
  });

test("SEO service CTA records a privacy-safe commercial entry", async ({ page }) => {
  await prepareConsentGrantedQueue(page);
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
  expect((await readGtagEvents(page)).filter((item) => item.event === "commercial_cta_click")).toHaveLength(1);
});

test("SEO intake produces a structured preview and explicit handoff without analytics PII", async ({ page }) => {
  await prepareConsentGrantedQueue(page);
  await page.goto("/paths/marketing/?service=seo#contact");
  const form = page.locator("[data-contact-form]");

  await expect(form.locator("[data-seo-intake]")).toBeVisible();
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

  const ga4FunnelEvents = (await readGtagEvents(page)).filter((item) =>
    ["seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"].includes(item.event),
  );
  expect(ga4FunnelEvents.map((item) => item.event)).toEqual([
    "seo_intake_start",
    "seo_intake_preview_ready",
    "seo_handoff_ready",
  ]);
  expect(JSON.stringify(ga4FunnelEvents)).not.toMatch(/Jordan|example\.com|private-example|Milwaukee|qualified inquiries|monthly|6 months/i);
});

const supportingContexts = [
  {
    sourcePath: "/services/local-seo/",
    ctaName: "Start a local SEO review",
    service: "local_seo",
    serviceGroup: "local_seo",
    presetName: "seo_search_scope",
    presetValue: "local",
  },
  {
    sourcePath: "/services/seo-for-logistics-companies/",
    ctaName: "Start a logistics SEO review",
    service: "logistics_seo",
    serviceGroup: "logistics_seo",
    presetName: "seo_vertical",
    presetValue: "logistics",
  },
  {
    sourcePath: "/services/seo-for-independent-auto-dealers/",
    ctaName: "Start an auto dealer SEO review",
    service: "auto_dealer_seo",
    serviceGroup: "auto_dealer_seo",
    presetName: "seo_vertical",
    presetValue: "auto_dealer",
  },
] as const;

for (const context of supportingContexts) {
  test(`${context.service} uses a privacy-safe commercial event and approved intake preset`, async ({ page }) => {
    await prepareConsentGrantedQueue(page);
    await page.goto(context.sourcePath);
    await page.evaluate(() => {
      document.querySelector("[data-seo-service-cta]")?.addEventListener("click", (event) => event.preventDefault(), {
        capture: true,
      });
    });
    await page.locator(".digital-service-actions").getByRole("link", { name: context.ctaName }).click();
    const commercial = (await readEvents(page)).find((item) => item.event === "commercial_cta_click");
    expect(commercial).toEqual(expect.objectContaining({
      event: "commercial_cta_click",
      service_group: context.serviceGroup,
      page_path: context.sourcePath,
      destination_path: "/paths/marketing/",
    }));
    expect((await readGtagEvents(page)).filter((item) => item.event === "commercial_cta_click")).toHaveLength(1);

    await page.goto(`/paths/marketing/?service=${context.service}#contact`);
    const form = page.locator("[data-contact-form]");
    await expect(form.locator('[data-seo-intake="true"]')).toBeVisible();
    await expect(form.locator('[data-seo-intake="true"]')).toHaveAttribute("data-seo-service", context.service);
    await expect(form.locator(`select[name="${context.presetName}"]`)).toHaveValue(context.presetValue);
    await expect(form.locator('select[name="path"]')).toHaveValue("ProgressoPro");
    await expect(form.locator('select[name="path"]')).toBeDisabled();
  });
}

test("Logistics SEO supporting funnel queues every GA4 event exactly once without PII", async ({ page }) => {
  await prepareConsentGrantedQueue(page);
  await page.goto("/paths/marketing/?service=logistics_seo#contact");
  const form = page.locator("[data-contact-form]");

  await form.locator('input[name="name"]').fill("SYNTHETIC_LOGISTICS_NAME");
  await form.locator('input[name="email"]').fill("synthetic-logistics@example.invalid");
  await form.locator('input[name="seo_current_website"]').fill("https://synthetic-logistics.invalid");
  await form.locator('input[name="seo_primary_market"]').fill("SYNTHETIC_LOGISTICS_MARKET");
  await form.locator('select[name="seo_search_scope"]').selectOption("national");
  await form.locator('select[name="seo_gsc_access"]').selectOption("available");
  await form.locator('select[name="seo_ga4_access"]').selectOption("available");
  await form.locator('select[name="seo_work_scope"]').selectOption("conversion");
  await form.locator('select[name="seo_timeline"]').selectOption("3 months");
  await form.locator('textarea[name="seo_current_problem"]').fill("SYNTHETIC_LOGISTICS_PROBLEM for an exact-once analytics contract.");
  await form.locator('textarea[name="message"]').fill("SYNTHETIC_LOGISTICS_MESSAGE remains outside analytics.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Preview request" }).click();

  await expect(form.locator("[data-contact-handoff]")).toBeVisible();
  await page.evaluate(() => {
    document.querySelector("[data-handoff-route-link]")?.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
    });
  });
  await form.locator("[data-handoff-route-link]").click();
  await form.locator("[data-handoff-route-link]").click();

  const expectedEvents = ["seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"];
  const localFunnelEvents = (await readEvents(page)).filter((item) => expectedEvents.includes(String(item.event)));
  const ga4FunnelEvents = (await readGtagEvents(page)).filter((item) => expectedEvents.includes(item.event));

  expect(localFunnelEvents.map((item) => item.event)).toEqual(expectedEvents);
  expect(ga4FunnelEvents.map((item) => item.event)).toEqual(expectedEvents);
  expect(JSON.stringify({ localFunnelEvents, ga4FunnelEvents })).not.toMatch(
    /SYNTHETIC_LOGISTICS|example\.invalid|synthetic-logistics\.invalid/i,
  );
});

test("unsupported marketing service query keeps the generic contact form", async ({ page }) => {
  await page.goto("/paths/marketing/?service=unsupported#contact");
  const form = page.locator("[data-contact-form]");
  await expect(form.locator("[data-seo-intake]")).toHaveCount(0);
  await form.locator('input[name="name"]').fill("Generic visitor");

  const events = await readEvents(page);
  expect(events.filter((item) => item.event === "seo_intake_start")).toEqual([]);
});
