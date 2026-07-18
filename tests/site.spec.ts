import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/paths/logistics/",
  "/paths/marketing/",
  "/paths/academy/",
  "/paths/technology/",
  "/case/it-development/",
  "/privacy/",
];

for (const route of routes) {
  test(`${route} renders without broken layout`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("#main-content")).toBeVisible();

    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    }));

    expect(result.overflow).toBe(false);
    expect(result.brokenImages).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("direction card opens the matching page and preselects the form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Hermes IT Development/ }).click();
  await page.getByRole("link", { name: "Explore IT Development: Hermes IT Development" }).click();
  await expect(page).toHaveURL(/\/paths\/technology\/$/);
  await expect(page.locator('select[name="path"]')).toHaveValue("IT Development");
});

test("business pillars reveal one direction at a time and support keyboard navigation", async ({ page }) => {
  await page.goto("/#paths");
  const logistics = page.getByRole("tab", { name: /Hermes Logistics/ });
  const marketing = page.getByRole("tab", { name: /Hermes Marketing/ });

  await expect(logistics).toHaveAttribute("aria-selected", "true");
  await marketing.click();
  await expect(marketing).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: /Hermes Marketing/ })).toContainText("Organic content and distribution");
  await expect(page.getByRole("tabpanel", { name: /Hermes Logistics/ })).toBeHidden();

  await marketing.press("ArrowRight");
  const academy = page.getByRole("tab", { name: /Hermes Academy/ });
  await expect(academy).toBeFocused();
  await expect(academy).toHaveAttribute("aria-selected", "true");
});

test("desktop business portals expand on hover and keep click navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop hover interaction");
  await page.goto("/#paths");

  const marketing = page.getByRole("tab", { name: /Hermes Marketing/ });
  await marketing.hover();
  await expect(marketing).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: /Hermes Marketing/ })).toContainText("Organic content and distribution");
  await expect(marketing.locator("xpath=.." )).toHaveAttribute("data-active", "true");
});

test("premium opening runs once per session and exits without blocking the page", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("hermes-intro-seen"))).toBe("true");
  await expect(page.locator("[data-site-intro]")).toHaveCount(0, { timeout: 2500 });
  await page.reload();
  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Four businesses. One place to move forward." })).toBeVisible();
});

test("homepage proves the website product and routes to IT Development", async ({ page }) => {
  await page.goto("/");
  const proof = page.getByRole("heading", { name: "This website is our first live product." });
  await proof.scrollIntoViewIfNeeded();
  await expect(proof).toBeVisible();
  await page.getByRole("link", { name: "See how it was built" }).click();
  await expect(page).toHaveURL(/\/case\/it-development\/$/);
  await expect(page.getByRole("heading", { name: "One digital front door for four businesses." })).toBeVisible();
});

test("IT case presents verified delivery evidence and a working inquiry route", async ({ page }) => {
  await page.goto("/case/it-development/");
  await expect(page.getByRole("heading", { name: "Quality was tested as part of the product." })).toBeVisible();
  await expect(page.getByText("64", { exact: true })).toBeVisible();
  await expect(page.getByText("browser scenarios passed", { exact: true })).toBeVisible();
  await expect(page.locator('.site-header a[href="/paths/technology/"][aria-current="page"]')).toHaveCount(2);
  await page.getByRole("link", { name: "Start your project brief" }).click();
  await expect(page).toHaveURL(/\/paths\/technology\/#project-brief$/);
  await expect(page.locator("[data-it-project-brief]")).toBeVisible();
  await expect.poll(() => page.locator("[data-it-project-brief]").evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(60);
  await expect.poll(() => page.locator("[data-it-project-brief]").evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(100);
});

test("direction navigation identifies the current business", async ({ page }) => {
  await page.goto("/paths/marketing/");
  await expect(page.locator('.site-header a[href="/paths/marketing/"][aria-current="page"]')).toHaveCount(2);
});

test("preview contact workflow validates and sends no request", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Test User");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await expect(page.locator('input[name="phone"]')).toBeVisible();
  await page.locator('input[name="phone"]').fill("+1 (351) 777-5337");
  await page.locator('textarea[name="message"]').fill("I would like to discuss a logistics workflow.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-form-status]")).toContainText("Your information was not sent or stored");
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-summary]")).toContainText("Direction: Hermes Logistics");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Phone: +1 (351) 777-5337");
  await expect(page.locator("[data-handoff-route-link]")).toHaveAttribute("href", "tel:+13517775337");
  await expect(page.locator(".contact-direct-routes").getByRole("link", { name: "Call Logistics" })).toHaveAttribute("href", "tel:+13517775337");
  expect(posts).toEqual([]);
});

test("preview handoff exposes the approved email route for marketing", async ({ page }) => {
  await page.goto("/paths/marketing/#contact");
  await page.locator('input[name="name"]').fill("Marketing Lead");
  await page.locator('input[name="email"]').fill("lead@example.com");
  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await expect(page.locator('input[name="phone"]')).toHaveCount(0);
  await page.locator('textarea[name="message"]').fill("We need a clearer growth system for our service business.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-route-link]")).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com?subject=ProgressoPro%20Marketing%20Inquiry",
  );
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});

test("copy request places sanitized plain text on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Clipboard User");
  await page.locator('input[name="email"]').fill("copy@example.com");
  await page.locator('select[name="path"]').selectOption("IT Development");
  await page.locator('textarea[name="tech_system_or_workflow_needed"]').fill("A CRM workflow for client follow-up.");
  await page.locator('textarea[name="tech_integrations_needed"]').fill("<script>alert(1)</script> Zapier + webhooks.");
  await page.locator('textarea[name="message"]').fill("I need a CRM workflow for client follow-up.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await page.locator("[data-copy-request]").click();
  await expect(page.locator("[data-copy-status]")).toContainText("Request copied");

  const clipboardText = await page.evaluate(async () => navigator.clipboard.readText());
  expect(clipboardText).toContain("Hermes Contact Request (Preview)");
  expect(clipboardText).toContain("Direction: IT Development");
  expect(clipboardText).toContain("Name: Clipboard User");
  expect(clipboardText).toContain("I need a CRM workflow for client follow-up.");
  expect(clipboardText).toContain("System/workflow needed: A CRM workflow for client follow-up.");
  expect(clipboardText).not.toContain("<");
  expect(clipboardText).not.toMatch(/<script/i);
});

test("clipboard failure shows recoverable manual-copy guidance", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });

  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Manual Copy User");
  await page.locator('input[name="email"]').fill("manual@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Business Academy");
  await expect(page.locator('input[name="academy_preferred_language"]')).toBeVisible();
  await expect(page.locator('input[name="phone"]')).toHaveCount(0);
  await page.locator('textarea[name="message"]').fill("I want to explore the logistics program.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await page.locator("[data-copy-request]").click();

  await expect(page.locator("[data-copy-status]")).toContainText("Copy did not work");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Direction: Hermes Business Academy");
});

test("changing direction clears a stale preview handoff", async ({ page }) => {
  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Stale Handoff User");
  await page.locator('input[name="email"]').fill("stale@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await page.locator('input[name="phone"]').fill("+1 (351) 777-5337");
  await page.locator('textarea[name="message"]').fill("I would like to discuss carrier onboarding.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();

  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await expect(page.locator("[data-contact-handoff]")).toBeHidden();
  await expect(page.locator('input[name="phone"]')).toHaveCount(0);
});

test("each non-logistics direction exposes a working direct contact route", async ({ page }) => {
  const cases = [
    { slug: "marketing", link: "Email Marketing", subject: "ProgressoPro%20Marketing%20Inquiry" },
    { slug: "academy", link: "Email the Academy", subject: "Hermes%20Business%20Academy%20Inquiry" },
    { slug: "technology", link: "Email IT Development", subject: "IT%20Development%20Inquiry" },
  ];

  for (const item of cases) {
    await page.goto(`/paths/${item.slug}/#contact`);
    await expect(page.getByRole("link", { name: item.link })).toHaveAttribute(
      "href",
      `mailto:officeus@hermeslogisticsus.com?subject=${item.subject}`,
    );
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator('input[name="phone"]')).toHaveCount(0);
  }
});

test("marketing field group supports multiple platforms + 3/6/9/12 horizon and includes direction details in summary", async ({ page }, testInfo) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/paths/marketing/#contact");
  await page.locator('input[name="name"]').fill("Marketing Discovery");
  await page.locator('input[name="email"]').fill("lead@example.com");
  await page.locator('textarea[name="message"]').fill("We need a clearer growth system for our service business.");
  await page.locator('input[name="consent"]').check();

  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await page.locator('input[name="platforms"][value="Google"]').check();
  await page.locator('input[name="platforms"][value="YouTube"]').check();
  await page.locator('select[name="planning_horizon"]').selectOption("6 months");
  await page.locator('input[name="primary_goal"]').fill("More qualified leads <script>alert(1)</script>");

  if (testInfo.project.name === "desktop") {
    await page.locator("[data-direction-fields]").screenshot({ path: "docs/screenshots/intake02-marketing-desktop.png" });
  }

  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-contact-handoff]")).toBeVisible();
  await expect(page.locator("[data-handoff-summary]")).toContainText("Platforms: Google, YouTube");
  await expect(page.locator("[data-handoff-summary]")).toContainText("Planning horizon: 6 months");
  await expect(page.locator("[data-handoff-summary]")).not.toContainText("<");

  expect(posts).toEqual([]);
});

test("direction-specific input changes clear stale preview handoff", async ({ page }) => {
  await page.goto("/paths/logistics/#contact");
  await page.locator('input[name="name"]').fill("Logistics Discovery");
  await page.locator('input[name="email"]').fill("fleet@example.com");
  await page.locator('textarea[name="message"]').fill("We need dispatch + document coordination.");
  await page.locator('input[name="consent"]').check();

  await page.locator('input[name="phone"]').fill("+1 (351) 777-5337");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator("[data-contact-handoff]")).toBeVisible();

  await page.locator('input[name="phone"]').fill("+1 (555) 123-4567");
  await expect(page.locator("[data-contact-handoff]")).toBeHidden();
});

test("technology page offers concrete industry starting points", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Fitness and wellness" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Beauty and salon" })).toBeVisible();
  await page.getByRole("link", { name: "Add Beauty and Salon Starter System to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("Beauty and Salon Starter System");
  await expect(page).toHaveURL(/#project-brief$/);
});

test("mobile menu supports keyboard close", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only behavior");
  await page.goto("/");
  const button = page.locator("[data-menu-button]");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
});

test("academy screen flow selects track and advances layers", async ({ page }) => {
  await page.goto("/paths/academy/");
  await page.getByRole("button", { name: /Choose a track/i }).click();
  const coo = page.getByRole("tab", { name: /COO \/ Operational Director/i });
  await coo.click();
  await expect(coo).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: /^Next$/i }).click();
  await expect(page.locator("#academy-screen-2").getByText(/Problem: The company runs on heroics/i)).toBeVisible();
  await page.getByRole("button", { name: /See the 6 layers/i }).click();
  await expect(page.getByText("Operating Career System")).toBeVisible();
  await expect(page.getByText("Executive", { exact: true }).first()).toBeVisible();
});

test("marketing growth flow supports click and keyboard navigation", async ({ page }) => {
  await page.goto("/paths/marketing/");
  const contentTab = page.getByRole("tab", { name: "02 Content" });
  await contentTab.click();
  await expect(contentTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "02 Content" })).toContainText("Message system and content direction");

  await contentTab.press("ArrowRight");
  const distributionTab = page.getByRole("tab", { name: "03 Distribution" });
  await expect(distributionTab).toBeFocused();
  await expect(distributionTab).toHaveAttribute("aria-selected", "true");
});

test("technology solution pre-fills the project brief", async ({ page }) => {
  await page.goto("/paths/technology/");
  await page.getByRole("link", { name: "Add AI Assistant and Workflow to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("AI Assistant and Workflow");
  await expect(page).toHaveURL(/#project-brief$/);
});

test("company operating system starts the full project brief", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Hermes IT Development" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quality assurance" })).toBeVisible();
  await page.getByRole("link", { name: "Add Company Digital Operating System to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("Company Digital Operating System");
  await expect(page).toHaveURL(/#project-brief$/);
});

test("technology partnership presents four growth layers and evidence statuses", async ({ page }) => {
  await page.goto("/paths/technology/");
  const partnership = page.locator(".technology-partnership");
  await expect(partnership.getByRole("heading", { name: "One partner that can keep building as your company grows." })).toBeVisible();
  for (const heading of [
    "Build the products your next stage needs.",
    "Create demand around the new capability.",
    "Prepare people to operate the system.",
    "Support the physical operation behind growth.",
  ]) {
    await expect(partnership.getByRole("heading", { name: heading })).toBeVisible();
  }

  await expect(page.getByText("Live product", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Working prototype", { exact: true })).toBeVisible();
  await expect(page.getByText("Build-ready capability", { exact: true })).toHaveCount(2);
  await expect(page.getByText("WhatsApp", { exact: true })).toBeVisible();
  await expect(page.getByText("Google Chat", { exact: true })).toBeVisible();
  await expect(page.getByText(/digital employee/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Add operations control to your brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("CRM and Operations Control");
});

test("each business direction exposes Wisconsin SEO signals and service schema", async ({ page }) => {
  for (const slug of ["logistics", "marketing", "academy", "technology"]) {
    await page.goto(`/paths/${slug}/`);
    await expect(page).toHaveTitle(/Wisconsin/);
    await expect(page.getByText(/Wisconsin first/)).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  }
});

test("AI assistant roles show setup time and pre-fill the brief", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Operations AI Assistant", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HR and Recruiting AI Assistant" })).toBeVisible();
  await expect(page.locator(".digital-workforce").getByText("4-8 weeks", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Add AI Assistant Program to your project brief" }).click();
  await expect(page.locator('textarea[name="project_1"]')).toHaveValue("AI Assistant Program");
});

test("IT project brief turns unstructured ideas into an email-ready summary", async ({ page }) => {
  await page.goto("/paths/technology/#project-brief");
  const brief = page.locator("[data-it-project-brief]");

  await brief.locator('select[name="company_stage"]').selectOption({ label: "Small company ready to grow" });
  await brief.locator('textarea[name="business_goal"]').fill("Increase qualified sales while reducing manual administrative work.");
  await brief.locator('textarea[name="project_1"]').fill("A corporate website that qualifies customer requests.");
  await brief.locator('textarea[name="project_2"]').fill("A CRM with a clear sales pipeline.");
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('input[name="example_1"]').fill("https://example.com");
  await brief.locator('textarea[name="example_1_detail"]').fill("The service selection is simple and clear.");
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('select[name="budget_mode"]').selectOption("monthly");
  await brief.locator('input[name="budget_amount"]').fill("USD 2,500 per month");
  await brief.locator('select[name="investment_horizon"]').selectOption({ label: "6 months" });
  await brief.getByRole("button", { name: "Continue" }).click();

  await brief.locator('input[name="company_name"]').fill("Example Services");
  await brief.locator('input[name="contact_name"]').fill("Alex Morgan");
  await brief.locator('input[name="contact_role"]').fill("Owner");
  await brief.locator('input[name="contact_email"]').fill("alex@example.com");
  await brief.locator('input[name="country"]').fill("United States");
  await brief.locator('input[name="region_city"]').fill("Milwaukee, Wisconsin");
  await brief.locator('textarea[name="public_presence"]').fill("https://example.com");
  await brief.locator('input[name="brief_consent"]').check();
  await brief.getByRole("button", { name: "Continue" }).click();

  await expect(brief.locator("[data-brief-summary]")).toContainText("Example Services");
  await expect(brief.locator("[data-brief-summary]")).toContainText("USD 2,500 per month");
  await expect(brief.locator("[data-brief-summary]")).toContainText("A CRM with a clear sales pipeline.");
  await expect(brief.locator("[data-brief-email]")).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com\?subject=/);
});

test("IT pages publish no fixed prices", async ({ page }) => {
  for (const route of ["/paths/technology/", "/case/it-development/"]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText("$");
  }
});
