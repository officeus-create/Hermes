import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const learnerProfile = (state: string) => ({
  success: true,
  learner: {
    id: "learner-1",
    email: "learner@example.com",
    name: "Alex Learner",
    identity_role: "Academy Learner",
    preferred_language: "en",
    timezone: "Europe/Kyiv",
  },
  enrollments: [{
    id: "enrollment-marketing",
    program_slug: "marketing",
    state,
    participation_model: "unspecified",
    cohort_code: null,
  }],
});

test.describe("Hermes Connect Academy A3", () => {
  test("enrolled learner submits private written evidence and sees own reviewer feedback at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let postPayload: any = null;
    const submissions: any[] = [{
      id: "submission-old",
      program_slug: "marketing",
      lesson_id: "sales-follow-up",
      submission_type: "written_reflection",
      text_content: "I would follow up with a concrete next step and keep the conversation tied to the business objective.",
      evidence_url: null,
      state: "accepted",
      created_at: "2026-08-18T03:30:00.000Z",
      updated_at: "2026-08-18T03:35:00.000Z",
      reviews: [{
        id: "review-old",
        decision: "accepted",
        feedback_text: "Clear reasoning. Keep the next-step language this specific in the live practice stage.",
        created_at: "2026-08-18T03:35:00.000Z",
      }],
    }];

    await page.route("**/api/academy/profile", (route) => route.fulfill(ok(learnerProfile("enrolled"))));
    await page.route("**/api/academy/submissions", async (route) => {
      if (route.request().method() === "GET") return route.fulfill(ok({ success: true, submissions }));
      postPayload = route.request().postDataJSON();
      const created = {
        id: "submission-new",
        program_slug: postPayload.program_slug,
        lesson_id: postPayload.lesson_id,
        submission_type: postPayload.submission_type,
        text_content: postPayload.text_content,
        evidence_url: null,
        state: "submitted",
        created_at: "2026-08-18T04:20:00.000Z",
        updated_at: "2026-08-18T04:20:00.000Z",
        reviews: [],
      };
      submissions.unshift(created);
      return route.fulfill(ok({ success: true, submission: created }, 201));
    });

    await page.goto("/services/hermes-connect/academy/submissions/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Human review · accepted")).toBeVisible();
    await expect(page.getByText(/Clear reasoning/)).toBeVisible();

    await page.getByLabel("Program").selectOption("marketing");
    await page.getByLabel("Lesson").selectOption("positioning-offer");
    await page.getByLabel("Evidence type").selectOption("written_reflection");
    await page.getByLabel("Written reflection").fill("I would start by making the business offer specific, measurable, and tied to the customer's current bottleneck.");
    await page.getByRole("button", { name: "Submit for human review" }).click();

    expect(postPayload).toEqual({
      program_slug: "marketing",
      lesson_id: "positioning-offer",
      submission_type: "written_reflection",
      text_content: "I would start by making the business offer specific, measurable, and tied to the customer's current bottleneck.",
      evidence_url: "",
    });
    expect(postPayload).not.toHaveProperty("specialist_id");
    expect(postPayload).not.toHaveProperty("review_decision");
    expect(postPayload).not.toHaveProperty("enrollment_state");
    await expect(page.getByText(/Evidence submitted for private human review/)).toBeVisible();
    await expect(page.getByText(/I would start by making the business offer specific/)).toBeVisible();

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("non-enrolled learner can read history but cannot create new evidence", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let postCount = 0;
    await page.route("**/api/academy/profile", (route) => route.fulfill(ok(learnerProfile("applied"))));
    await page.route("**/api/academy/submissions", async (route) => {
      if (route.request().method() === "POST") postCount += 1;
      return route.fulfill(ok({ success: true, submissions: [] }));
    });

    await page.goto("/services/hermes-connect/academy/submissions/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/No enrolled program is available yet/)).toBeVisible();
    await expect(page.getByLabel("Program")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Submit for human review" })).toBeDisabled();
    expect(postCount).toBe(0);
  });

  test("ordinary Hermes account is locked out of reviewer queue without manual allowlist", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.route("**/api/academy/reviewer/submissions*", (route) => route.fulfill(ok({ success: false, error: "academy_reviewer_not_authorized" }, 403)));

    await page.goto("/services/hermes-connect/academy/reviewer/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Reviewer access is not authorized." })).toBeVisible();
    await expect(page.getByText(/Changing an account role label cannot unlock this queue/)).toBeVisible();
    await expect(page.locator("[data-reviewer-content]")).toHaveClass(/academy-app-hidden/);
  });

  test("manually authorized scoped reviewer records private feedback without control fields", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    let reviewPayload: any = null;
    let submissionState = "submitted";
    const reviews: any[] = [];

    await page.route("**/api/academy/reviewer/submissions*", async (route) => {
      const request = route.request();
      if (request.method() === "PUT") {
        reviewPayload = request.postDataJSON();
        submissionState = reviewPayload.decision;
        reviews.push({ id: "review-1", decision: reviewPayload.decision, feedback_text: reviewPayload.feedback_text, created_at: "2026-08-18T04:25:00.000Z" });
        return route.fulfill(ok({
          success: true,
          review: { id: "review-1", submission_id: "submission-1", decision: reviewPayload.decision, feedback_text: reviewPayload.feedback_text, created_at: "2026-08-18T04:25:00.000Z" },
          submission_state: reviewPayload.decision,
        }));
      }
      return route.fulfill(ok({
        success: true,
        reviewer: { name: "Authorized Reviewer", email: "reviewer@example.com", program_scope: "marketing" },
        submissions: [{
          id: "submission-1",
          program_slug: "marketing",
          lesson_id: "positioning-offer",
          submission_type: "evidence_link",
          text_content: "Please review the first two minutes for offer clarity.",
          evidence_url: "https://example.com/private-evidence",
          state: submissionState,
          created_at: "2026-08-18T04:20:00.000Z",
          updated_at: "2026-08-18T04:20:00.000Z",
          learner_name: "Alex Learner",
          learner_email: "learner@example.com",
          reviews,
        }],
      }));
    });

    await page.goto("/services/hermes-connect/academy/reviewer/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-reviewer-name]")).toHaveText("Authorized Reviewer");
    await expect(page.locator("[data-reviewer-program]")).toBeDisabled();
    await expect(page.locator("[data-reviewer-program]")).toHaveValue("marketing");
    await expect(page.getByText("Alex Learner · learner@example.com")).toBeVisible();
    await expect(page.getByRole("link", { name: "https://example.com/private-evidence" })).toHaveAttribute("rel", /noopener noreferrer/);

    await page.getByLabel("Private reviewer feedback").fill("The positioning is clear. Keep the opening specific and tie the offer to one measurable business outcome.");
    await page.getByRole("button", { name: "Accept evidence" }).click();

    expect(reviewPayload).toEqual({
      submission_id: "submission-1",
      decision: "accepted",
      feedback_text: "The positioning is clear. Keep the opening specific and tie the offer to one measurable business outcome.",
    });
    expect(reviewPayload).not.toHaveProperty("reviewer_specialist_id");
    expect(reviewPayload).not.toHaveProperty("program_slug");
    expect(reviewPayload).not.toHaveProperty("enrollment_state");
    await expect(page.getByText(/Private human review saved/)).toBeVisible();
    await expect(page.getByText("accepted", { exact: true })).toBeVisible();
    await expect(page.getByText(/Prior review · accepted/)).toBeVisible();
  });
});
