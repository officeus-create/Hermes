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
