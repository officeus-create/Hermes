import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const progression = (state = "changes_requested", feedback = "Strengthen the final sales follow-up evidence before completion.") => ({
  program_slug: "marketing",
  enrollment_state: "enrolled",
  total_lessons: 6,
  completed_lessons: 5,
  evidence: { submitted: 1, changes_requested: 1, accepted: 4 },
  lessons: [
    { lesson_id: "positioning-offer", lesson_state: "completed", evidence: { submitted: 0, changes_requested: 0, accepted: 1 } },
    { lesson_id: "website-first-content", lesson_state: "completed", evidence: { submitted: 0, changes_requested: 0, accepted: 1 } },
    { lesson_id: "platform-distribution", lesson_state: "completed", evidence: { submitted: 0, changes_requested: 0, accepted: 1 } },
    { lesson_id: "lead-journey", lesson_state: "completed", evidence: { submitted: 0, changes_requested: 0, accepted: 1 } },
    { lesson_id: "sales-follow-up", lesson_state: "in_progress", evidence: { submitted: 1, changes_requested: 1, accepted: 0 } },
    { lesson_id: "analytics-improvement", lesson_state: "completed", evidence: { submitted: 0, changes_requested: 0, accepted: 0 } },
  ],
  progression_state: state,
  latest_review: { decision: state === "in_progress" ? "continue" : state, feedback_text: feedback, created_at: "2026-08-18T08:30:00.000Z" },
  review_history: [{ decision: state === "in_progress" ? "continue" : state, feedback_text: feedback, created_at: "2026-08-18T08:30:00.000Z" }],
});

test.describe("Hermes Connect Academy A4", () => {
  test("learner sees own aggregated progression evidence at 390px without any completion control", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/academy/profile", (route) => route.fulfill(ok({
      success: true,
      learner: { id: "learner-1", email: "learner@example.com", name: "Alex Learner", identity_role: "Academy Learner" },
      enrollments: [{ id: "enrollment-1", program_slug: "marketing", state: "enrolled", participation_model: "unspecified", cohort_code: null }],
    })));
    await page.route("**/api/academy/progression?program=marketing", (route) => route.fulfill(ok({ success: true, progression: progression() })));

    await page.goto("/services/hermes-connect/academy/progression/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-completed-lessons]")).toHaveText("5");
    await expect(page.locator("[data-total-lessons]")).toHaveText("6");
    await expect(page.locator("[data-accepted-evidence]")).toHaveText("4");
    await expect(page.locator("[data-unresolved-evidence]")).toHaveText("2");
    await expect(page.locator("[data-progression-state]")).toHaveText("Changes Requested");
    await expect(page.locator("[data-progression-feedback]")).toHaveText("Strengthen the final sales follow-up evidence before completion.");
    await expect(page.getByRole("button", { name: "Mark Academy program completed" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continue program" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Request progression changes" })).toHaveCount(0);

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("ordinary Hermes account stays locked out of A4 reviewer progression workspace", async ({ page }) => {
    await page.route("**/api/academy/reviewer/progression*", (route) => route.fulfill(ok({ success: false, error: "academy_reviewer_not_authorized" }, 403)));
    await page.goto("/services/hermes-connect/academy/reviewer/progression/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Reviewer access is not authorized." })).toBeVisible();
    await expect(page.locator("[data-reviewer-progression-content]")).toHaveClass(/academy-app-hidden/);
  });

  test("authorized reviewer records only a human program progression decision", async ({ page }) => {
    let reviewPayload: any = null;
    let currentState = "changes_requested";
    let currentFeedback = "Strengthen the final sales follow-up evidence before completion.";

    await page.route("**/api/academy/reviewer/progression*", async (route) => {
      const request = route.request();
      if (request.method() === "PUT") {
        reviewPayload = request.postDataJSON();
        currentState = reviewPayload.decision === "continue" ? "in_progress" : reviewPayload.decision;
        currentFeedback = reviewPayload.feedback_text;
        return route.fulfill(ok({
          success: true,
          review: { id: "progression-review-2", decision: reviewPayload.decision, feedback_text: reviewPayload.feedback_text, created_at: "2026-08-18T08:35:00.000Z" },
          progression: progression(currentState, currentFeedback),
        }));
      }
      return route.fulfill(ok({
        success: true,
        reviewer: { name: "Authorized Reviewer", email: "reviewer@example.com", program_scope: "marketing" },
        learners: [{
          id: "learner-1",
          name: "Alex Learner",
          email: "learner@example.com",
          program_slug: "marketing",
          progression: progression(currentState, currentFeedback),
        }],
      }));
    });

    await page.goto("/services/hermes-connect/academy/reviewer/progression/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-progression-reviewer-name]")).toHaveText("Authorized Reviewer");
    await expect(page.locator("[data-progression-program]")).toBeDisabled();
    await expect(page.getByText("Alex Learner", { exact: true })).toBeVisible();
    await expect(page.getByText("5/6 lessons complete", { exact: true })).toBeVisible();
    await expect(page.getByText("4 accepted evidence", { exact: true })).toBeVisible();

    await page.getByLabel("Private progression feedback for Alex Learner").fill("Human review confirms the program evidence is sufficient for Academy completion only.");
    await page.getByRole("button", { name: "Mark Academy program completed" }).click();

    expect(reviewPayload).toEqual({
      learner_id: "learner-1",
      program_slug: "marketing",
      decision: "completed",
      feedback_text: "Human review confirms the program evidence is sufficient for Academy completion only.",
    });
    expect(reviewPayload).not.toHaveProperty("reviewer_specialist_id");
    expect(reviewPayload).not.toHaveProperty("enrollment_state");
    expect(reviewPayload).not.toHaveProperty("employment_state");
    expect(reviewPayload).not.toHaveProperty("certificate_state");
    expect(reviewPayload).not.toHaveProperty("commercial_access");
    expect(reviewPayload).not.toHaveProperty("operational_access");
    await expect(page.getByText(/Private human progression decision saved/)).toBeVisible();
    await expect(page.getByText("Completed", { exact: true })).toBeVisible();
  });
});
