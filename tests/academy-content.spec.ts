import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const negotiationLesson = {
  program_slug: "us-logistics-operations",
  lesson_id: "negotiation-practice",
  version: "2026-08-24-v1",
  title: "Negotiation practice: clarify the objection",
  purpose: "Apply the conversation-stage method to a synthetic objection and submit a bounded written response for human review.",
  objectives: ["Identify the stage", "Ask one focused question"],
  sections: [],
  scenario: "Synthetic case: the owner already has dispatch help.",
  assignment: {
    submission_type: "written_reflection",
    max_words: 120,
    prompt: "Write one response containing exactly four parts.",
    parts: ["Conversation stage", "Acknowledgment", "Next question", "Boundary and option"],
  },
  rubric: [
    { key: "stage_identification", label: "Stage identification", pass: "Correctly identifies the stage." },
    { key: "claim_safety", label: "Claim safety", pass: "Does not promise outcomes." },
  ],
  boundaries: ["Use the synthetic scenario only.", "Human review remains required."],
};

const marketingLesson = {
  program_slug: "marketing",
  lesson_id: "website-first-content",
  version: "2026-08-24-v1",
  title: "Website-first content: build a one-week distribution plan",
  purpose: "Turn approved public website assets into a coherent five-record organic distribution plan.",
  objectives: ["Identify the canonical owner", "Match audience and funnel stage", "Use privacy-safe measurement"],
  sections: [
    { title: "Start with the canonical destination", summary: "Every record begins with an approved public page.", actions: ["Name the destination before the hook."] },
  ],
  approved_sources: [
    { title: "Dispatch Service vs Self-Dispatch", path: "/logistics/resources/dispatch-service-vs-self-dispatch/" },
    { title: "Broker Setup Packet Checklist", path: "/logistics/resources/broker-setup-packet-checklist/" },
    { title: "Search-to-Inquiry Conversion Checklist", path: "/resources/search-to-inquiry-conversion-checklist/" },
    { title: "Academy — U.S. Logistics Operations", path: "/academy/us-logistics-operations/" },
    { title: "Technical SEO Checklist", path: "/resources/technical-seo-checklist/" },
  ],
  scenario: "Synthetic business-services ecosystem with approved public pages and no live credentials or private data.",
  assignment: {
    submission_type: "written_reflection",
    prompt: "Create exactly five content records — one for each approved source page.",
    parts: ["Audience and funnel stage", "Platform, hook, value and CTA", "UTM, evidence, KPI and human-review note"],
  },
  rubric: [
    { key: "five_records", label: "Exactly five records", pass: "Five complete records." },
    { key: "canonical_ownership", label: "Canonical ownership", pass: "Each record uses the relevant public page." },
    { key: "audience_funnel", label: "Audience and funnel stage", pass: "Audience and stage are specific." },
    { key: "platform_fit", label: "Platform fit", pass: "Format fits the platform." },
    { key: "hook_value", label: "Useful hook and value", pass: "Specific and educational." },
    { key: "cta_quality", label: "CTA quality", pass: "One action matches page readiness." },
    { key: "utm_safety", label: "UTM safety", pass: "No PII or private data." },
    { key: "evidence_claims", label: "Evidence and claims", pass: "Claims are evidenced or flagged." },
    { key: "non_duplication", label: "Non-duplication", pass: "Records vary meaningfully." },
    { key: "measurement_review", label: "Measurement and review", pass: "KPI and review gate are useful." },
  ],
  boundaries: ["Use only approved public destinations and synthetic planning context.", "Human review remains required."],
};

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile-390", width: 390, height: 844 },
]) {
  test(`enrolled learner can read the private Logistics assignment on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    let lessonRequests = 0;

    await page.route("**/api/academy/lesson*", async (route) => {
      lessonRequests += 1;
      const url = new URL(route.request().url());
      expect(url.searchParams.get("program")).toBe("us-logistics-operations");
      expect(url.searchParams.get("lesson")).toBe("negotiation-practice");
      await route.fulfill(ok({
        success: true,
        enrollment: { program_slug: "us-logistics-operations", state: "enrolled" },
        lesson: negotiationLesson,
      }));
    });

    await page.goto(
      "/services/hermes-connect/academy/lesson/?program=us-logistics-operations&lesson=negotiation-practice",
      { waitUntil: "domcontentloaded" },
    );

    await expect(page.getByRole("heading", { name: negotiationLesson.title })).toBeVisible();
    await expect(page.getByText(negotiationLesson.assignment.prompt)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Every criterion is Pass or Revise." })).toBeVisible();
    const submit = page.getByRole("link", { name: "Submit this assignment" });
    await expect(submit).toHaveAttribute(
      "href",
      /\/services\/hermes-connect\/academy\/submissions\/\?program=us-logistics-operations&lesson=negotiation-practice&type=written_reflection$/,
    );
    expect(lessonRequests).toBe(1);

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test(`enrolled learner can complete the Marketing website-first lesson handoff on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    let lessonRequests = 0;

    await page.route("**/api/academy/lesson*", async (route) => {
      lessonRequests += 1;
      const url = new URL(route.request().url());
      expect(url.searchParams.get("program")).toBe("marketing");
      expect(url.searchParams.get("lesson")).toBe("website-first-content");
      await route.fulfill(ok({
        success: true,
        enrollment: { program_slug: "marketing", state: "enrolled" },
        lesson: marketingLesson,
      }));
    });

    await page.goto(
      "/services/hermes-connect/academy/lesson/?program=marketing&lesson=website-first-content",
      { waitUntil: "domcontentloaded" },
    );

    await expect(page.getByRole("heading", { name: marketingLesson.title })).toBeVisible();
    await expect(page.getByText(marketingLesson.assignment.prompt)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Build from these canonical public destinations." })).toBeVisible();
    await expect(page.getByRole("link", { name: "/resources/technical-seo-checklist/" })).toHaveAttribute("href", "/resources/technical-seo-checklist/");
    await expect(page.getByRole("heading", { name: "UTM safety" })).toBeVisible();
    await expect(page.locator("[data-rubric-list] .academy-review-card")).toHaveCount(10);
    const submit = page.getByRole("link", { name: "Submit this assignment" });
    await expect(submit).toHaveAttribute(
      "href",
      /\/services\/hermes-connect\/academy\/submissions\/\?program=marketing&lesson=website-first-content&type=written_reflection$/,
    );
    expect(lessonRequests).toBe(1);

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });
}

test("lesson shell does not reveal content when enrollment is not active", async ({ page }) => {
  await page.route("**/api/academy/lesson*", (route) => route.fulfill(ok({
    success: false,
    error: "enrollment_not_active",
    enrollment_state: "applied",
  }, 409)));

  await page.goto(
    "/services/hermes-connect/academy/lesson/?program=us-logistics-operations&lesson=negotiation-practice",
    { waitUntil: "domcontentloaded" },
  );

  await expect(page.getByRole("heading", { name: "Lesson unavailable" })).toBeVisible();
  await expect(page.getByText("This full lesson is available only inside an enrolled Academy program.")).toBeVisible();
  await expect(page.getByText(negotiationLesson.assignment.prompt)).toHaveCount(0);
});

test("Evidence workspace applies lesson query context only after enrolled access is proven", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/academy/profile", (route) => route.fulfill(ok({
    success: true,
    learner: {
      id: "learner-synthetic",
      email: "synthetic@example.invalid",
      name: "Synthetic Learner",
      identity_role: "Academy Learner",
      preferred_language: "en",
      timezone: "America/Chicago",
    },
    enrollments: [
      {
        id: "enrollment-logistics",
        program_slug: "us-logistics-operations",
        state: "enrolled",
        participation_model: "unspecified",
        cohort_code: null,
        created_at: "2026-08-24T00:00:00.000Z",
        updated_at: "2026-08-24T00:00:00.000Z",
      },
    ],
  })));
  await page.route("**/api/academy/submissions", (route) => route.fulfill(ok({ success: true, submissions: [] })));

  await page.goto(
    "/services/hermes-connect/academy/submissions/?program=us-logistics-operations&lesson=negotiation-practice&type=written_reflection",
    { waitUntil: "domcontentloaded" },
  );

  await expect(page.locator("#submission-program")).toHaveValue("us-logistics-operations");
  await expect(page.locator("#submission-lesson")).toHaveValue("negotiation-practice");
  await expect(page.locator("#submission-type")).toHaveValue("written_reflection");
  await expect(page.getByText(/Assignment selected: Negotiation practice/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit for human review" })).toBeEnabled();

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});
