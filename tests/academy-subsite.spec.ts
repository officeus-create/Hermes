import { expect, test } from "@playwright/test";

const academyRoutes = [
  "/academy/us-logistics-operations/",
  "/academy/marketing/",
  "/academy/how-training-works/",
  "/academy/apply/",
  "/academy/resources/",
] as const;

test("Academy hub discovers the five child routes", async ({ page }) => {
  const response = await page.goto("/paths/academy/");
  expect(response?.ok()).toBeTruthy();

  for (const route of academyRoutes) {
    await expect(page.locator(`a[href="${route}"]`)).toHaveCount(1);
  }

  await expect(page.getByRole("heading", { name: /Open a program, understand the method/ })).toBeVisible();
});

test("Academy program pages own distinct curriculum intent and structured data", async ({ page }) => {
  await page.goto("/academy/us-logistics-operations/");
  await expect(page).toHaveTitle(/U.S. Logistics Operations Training/);
  await expect(page.getByRole("heading", { level: 1, name: /U.S. logistics work moves/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Six connected learning areas" })).toBeVisible();
  await expect(page.getByText("Carrier and broker communication", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="/academy/apply/?program=us-logistics-operations"]')).toHaveCount(2);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/academy/us-logistics-operations/",
  );

  let schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schemaText).toContain('"Course"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');
  expect(schemaText).toContain("Hermes Business Academy");

  await page.goto("/academy/marketing/");
  await expect(page).toHaveTitle(/Practical Marketing Training/);
  await expect(page.getByRole("heading", { level: 1, name: /Connect content, distribution/ })).toBeVisible();
  await expect(page.getByText("Website-first content", { exact: true })).toBeVisible();
  await expect(page.getByText("Platform distribution", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="/academy/apply/?program=marketing"]')).toHaveCount(2);

  schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schemaText).toContain('"Course"');
  expect(schemaText).toContain('"FAQPage"');
});

test("Academy methodology and resources remain distinct from program pages", async ({ page }) => {
  await page.goto("/academy/how-training-works/");
  await expect(page.getByRole("heading", { level: 1, name: "Training moves from context to reviewed application." })).toBeVisible();
  await expect(page.getByText("Awareness", { exact: true })).toBeVisible();
  await expect(page.getByText("Understanding", { exact: true })).toBeVisible();
  await expect(page.getByText("Application", { exact: true })).toBeVisible();
  let schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schemaText).toContain('"WebPage"');

  await page.goto("/academy/resources/");
  await expect(page.getByRole("heading", { level: 1, name: /Use practical guides/ })).toBeVisible();
  await expect(page.locator('a[href="/logistics/resources/new-authority-car-hauler-readiness-checklist/"]')).toBeVisible();
  await expect(page.locator('a[href="/resources/search-to-inquiry-conversion-checklist/"]')).toBeVisible();
  schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schemaText).toContain('"CollectionPage"');
});

test("Academy application uses preview-only qualification and honors an allowlisted program", async ({ page }) => {
  const response = await page.goto("/academy/apply/?program=marketing");
  expect(response?.ok()).toBeTruthy();

  const form = page.locator("[data-contact-form]");
  await expect(form).toHaveAttribute("data-contact-mode", "preview");
  await expect(form.locator('select[name="path"]')).toHaveValue("Hermes Business Academy");
  await expect(form.locator('select[name="academy_program"]')).toHaveValue("marketing");
  await expect(form.locator('[data-academy-qualification="true"]')).toHaveCount(8);

  await form.locator('input[name="name"]').fill("Academy Test Applicant");
  await form.locator('input[name="email"]').fill("academy.test@example.com");
  await form.locator('select[name="academy_program"]').selectOption("marketing");
  await form.locator('input[name="academy_country_city"]').fill("Ukraine, Kyiv");
  await form.locator('textarea[name="academy_languages_levels"]').fill("Ukrainian native, Russian fluent, English B2");
  await form.locator('select[name="academy_english_level"]').selectOption("B2");
  await form.locator('textarea[name="academy_recent_experience"]').fill("Marketing content planning and sales follow-up during the last three months.");
  await form.locator('select[name="academy_objective"]').selectOption("Career and business");
  await form.locator('input[name="academy_us_timezone_availability"]').fill("Available 15:00-22:00 Kyiv time");
  await form.locator('select[name="academy_preferred_contact_route"]').selectOption("Telegram");
  await form.locator('textarea[name="message"]').fill("I want to understand the approved Marketing program format and application steps.");
  await form.locator('input[name="consent"]').check();

  await form.getByRole("button", { name: "Preview request" }).click();
  await expect(form.locator("[data-contact-handoff]")).toBeVisible();
  await expect(form.locator("[data-handoff-summary]")).toContainText("Academy Test Applicant");
  await expect(form.locator("[data-handoff-summary]")).toContainText("Ukraine, Kyiv");
  await expect(form.locator("[data-handoff-summary]")).toContainText("marketing");
  expect(page.url()).not.toContain("Ukraine");
  expect(page.url()).not.toContain("academy.test@example.com");
});

test("Academy sitemap owns all child routes", async ({ page }) => {
  const response = await page.request.get("/sitemap-academy.xml");
  expect(response.ok()).toBeTruthy();
  const sitemap = await response.text();
  for (const route of academyRoutes) {
    expect(sitemap).toContain(`https://hermeslogisticsus.com${route}`);
  }

  const robotsResponse = await page.request.get("/robots.txt");
  expect(await robotsResponse.text()).toContain("https://hermeslogisticsus.com/sitemap-academy.xml");
});
