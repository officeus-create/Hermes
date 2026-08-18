import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const learner = {
  success: true,
  learner: { id: "learner-1", email: "learner@example.com", name: "Alex Learner", identity_role: "Academy Learner" },
  enrollments: [{ id: "enrollment-1", program_slug: "marketing", state: "enrolled", participation_model: "unspecified", cohort_code: null }],
};

const thread = (state = "open", supportBody?: string) => ({
  id: "thread-1",
  program_slug: "marketing",
  lesson_id: "sales-follow-up",
  subject: "How should I structure the follow-up?",
  state,
  created_at: "2026-08-18T09:40:00.000Z",
  updated_at: "2026-08-18T09:40:00.000Z",
  messages: [
    { id: "message-1", author_kind: "learner", body_text: "I understand the first contact, but I need help with the second follow-up.", created_at: "2026-08-18T09:40:00.000Z" },
    ...(supportBody ? [{ id: "message-2", author_kind: "authorized_support", body_text: supportBody, created_at: "2026-08-18T09:45:00.000Z" }] : []),
  ],
});

test.describe("Hermes Connect Academy A3.1 support", () => {
  test("enrolled learner creates a private support question at 390px without control fields", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let payload: any = null;

    await page.route("**/api/academy/profile", (route) => route.fulfill(ok(learner)));
    await page.route("**/api/academy/support", async (route) => {
      if (route.request().method() === "POST") {
        payload = route.request().postDataJSON();
        return route.fulfill(ok({ success: true, thread_id: "thread-1", threads: [thread()] }, 201));
      }
      return route.fulfill(ok({ success: true, threads: [] }));
    });

    await page.goto("/services/hermes-connect/academy/support/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Program").selectOption("marketing");
    await page.getByLabel("Lesson (optional)").selectOption("sales-follow-up");
    await page.getByLabel("Subject").fill("How should I structure the follow-up?");
    await page.getByLabel("Question").fill("I understand the first contact, but I need help with the second follow-up.");
    await page.getByRole("button", { name: "Send private question" }).click();

    expect(payload).toEqual({
      program_slug: "marketing",
      lesson_id: "sales-follow-up",
      subject: "How should I structure the follow-up?",
      body_text: "I understand the first contact, but I need help with the second follow-up.",
    });
    for (const forbidden of ["specialist_id", "learner_id", "author_specialist_id", "author_kind", "state", "payment_state", "employment_state", "commercial_access", "operational_access"]) {
      expect(payload).not.toHaveProperty(forbidden);
    }
    await expect(page.getByText("Private Academy support question created.")).toBeVisible();
    await expect(page.getByText("How should I structure the follow-up?", { exact: true })).toBeVisible();

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("learner rate limit is explained without exposing raw backend code", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/academy/profile", (route) => route.fulfill(ok(learner)));
    await page.route("**/api/academy/support", async (route) => {
      if (route.request().method() === "POST") return route.fulfill(ok({ success: false, error: "support_rate_limited" }, 429));
      return route.fulfill(ok({ success: true, threads: [] }));
    });

    await page.goto("/services/hermes-connect/academy/support/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Program").selectOption("marketing");
    await page.getByLabel("Subject").fill("Need help with follow-up timing");
    await page.getByLabel("Question").fill("When should I send the next follow-up message?");
    await page.getByRole("button", { name: "Send private question" }).click();

    await expect(page.getByText("Too many support messages were sent recently. Please try again later.")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("support_rate_limited");
    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("ordinary Hermes account stays locked out of support responder workspace", async ({ page }) => {
    await page.route("**/api/academy/reviewer/support*", (route) => route.fulfill(ok({ success: false, error: "academy_support_not_authorized" }, 403)));
    await page.goto("/services/hermes-connect/academy/reviewer/support/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Academy support access is not authorized." })).toBeVisible();
    await expect(page.locator("[data-support-review-content]")).toHaveClass(/academy-app-hidden/);
  });

  test("manually authorized support responder answers support state without exposing learner email or internal id", async ({ page }) => {
    let payload: any = null;
    let current = thread();
    const queue = () => ({
      success: true,
      support: { name: "Authorized Support", program_scope: "marketing" },
      threads: [{ ...current, learner_name: "Alex Learner" }],
    });

    await page.route("**/api/academy/reviewer/support*", async (route) => {
      if (route.request().method() === "PUT") {
        payload = route.request().postDataJSON();
        current = thread("answered", payload.body_text);
        return route.fulfill(ok({ success: true, thread_id: "thread-1", state: "answered", threads: queue().threads }));
      }
      return route.fulfill(ok(queue()));
    });

    await page.goto("/services/hermes-connect/academy/reviewer/support/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-support-review-name]")).toHaveText("Authorized Support");
    await expect(page.locator("[data-support-review-program]")).toBeDisabled();
    await expect(page.getByText("Alex Learner", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("learner@example.com");
    await expect(page.locator("body")).not.toContainText("learner-1");
    await page.getByLabel("Private support response for Alex Learner").fill("Use one concrete next step, one deadline, and one direct question in the second follow-up.");
    await page.getByRole("button", { name: "Answer question" }).click();

    expect(payload).toEqual({
      thread_id: "thread-1",
      action: "answer",
      body_text: "Use one concrete next step, one deadline, and one direct question in the second follow-up.",
    });
    for (const forbidden of ["specialist_id", "learner_id", "author_specialist_id", "author_kind", "state", "payment_state", "employment_state", "commercial_access", "operational_access"]) {
      expect(payload).not.toHaveProperty(forbidden);
    }
    await expect(page.getByText("Private Academy support response saved.")).toBeVisible();
  });

  test("support responder rate limit is friendly and does not leak backend code", async ({ page }) => {
    const queue = () => ({
      success: true,
      support: { name: "Authorized Support", program_scope: "marketing" },
      threads: [{ ...thread(), learner_name: "Alex Learner" }],
    });
    await page.route("**/api/academy/reviewer/support*", async (route) => {
      if (route.request().method() === "PUT") return route.fulfill(ok({ success: false, error: "support_rate_limited" }, 429));
      return route.fulfill(ok(queue()));
    });

    await page.goto("/services/hermes-connect/academy/reviewer/support/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Private support response for Alex Learner").fill("A bounded response after the hourly threshold.");
    await page.getByRole("button", { name: "Answer question" }).click();
    await expect(page.getByText("Support response limit reached for this hour. Please try again later.")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("support_rate_limited");
  });
});
