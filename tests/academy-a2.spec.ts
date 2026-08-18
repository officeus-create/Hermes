import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const enrollment = (program_slug: string, state: string) => ({
  id: `enrollment-${program_slug}`,
  program_slug,
  state,
  participation_model: "unspecified",
  cohort_code: null,
  created_at: "2026-08-18T03:30:00.000Z",
  updated_at: "2026-08-18T03:30:00.000Z",
});

test.describe("Hermes Connect Academy A2", () => {
  test("Applied learner can review canonical Logistics curriculum but cannot mutate progress", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let putCount = 0;

    await page.route("**/api/academy/progress?program=us-logistics-operations", (route) => route.fulfill(ok({
      success: true,
      enrollment: enrollment("us-logistics-operations", "applied"),
      progress: [],
    })));
    await page.route("**/api/academy/progress", async (route) => {
      if (route.request().method() === "PUT") putCount += 1;
      return route.fulfill(ok({ success: false, error: "enrollment_not_active", enrollment_state: "applied" }, 409));
    });

    await page.goto("/services/hermes-connect/academy/program/us-logistics-operations/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Dispatch foundations" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Carrier and broker communication" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Operating rhythm" })).toBeVisible();
    await expect(page.getByText("Enrollment · applied")).toBeVisible();
    await expect(page.getByText(/Progress controls stay locked while enrollment is applied/)).toBeVisible();

    const firstAction = page.locator('[data-lesson-id="dispatch-foundations"] [data-progress-action]');
    await expect(firstAction).toBeDisabled();
    await firstAction.click({ force: true }).catch(() => {});
    expect(putCount).toBe(0);

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("Enrolled learner persists Marketing self-tracked progress without enrollment mutation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const progress = new Map<string, string>();
    const putPayloads: any[] = [];

    await page.route("**/api/academy/progress?program=marketing", (route) => route.fulfill(ok({
      success: true,
      enrollment: enrollment("marketing", "enrolled"),
      progress: [...progress.entries()].map(([lesson_id, state]) => ({ lesson_id, state, started_at: "2026-08-18T03:30:00.000Z", completed_at: state === "completed" ? "2026-08-18T03:35:00.000Z" : null, updated_at: "2026-08-18T03:35:00.000Z" })),
    })));
    await page.route("**/api/academy/progress", async (route) => {
      if (route.request().method() !== "PUT") return route.continue();
      const payload = route.request().postDataJSON();
      putPayloads.push(payload);
      progress.set(payload.lesson_id, payload.state);
      return route.fulfill(ok({
        success: true,
        enrollment_state: "enrolled",
        progress: {
          lesson_id: payload.lesson_id,
          state: payload.state,
          started_at: "2026-08-18T03:30:00.000Z",
          completed_at: payload.state === "completed" ? "2026-08-18T03:35:00.000Z" : null,
          updated_at: "2026-08-18T03:35:00.000Z",
        },
      }));
    });

    await page.goto("/services/hermes-connect/academy/program/marketing/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Positioning and offer" })).toBeVisible();
    await expect(page.getByText("Enrollment · enrolled")).toBeVisible();

    const firstCard = page.locator('[data-lesson-id="positioning-offer"]');
    const firstAction = firstCard.locator("[data-progress-action]");
    await expect(firstAction).toBeEnabled();
    await expect(firstAction).toHaveText("Start module");

    await firstAction.click();
    expect(putPayloads[0]).toEqual({ program_slug: "marketing", lesson_id: "positioning-offer", state: "in_progress" });
    expect(putPayloads[0]).not.toHaveProperty("enrollment_state");
    expect(putPayloads[0]).not.toHaveProperty("specialist_id");
    await expect(firstCard.locator("[data-lesson-state-label]")).toHaveText("In progress");
    await expect(firstAction).toHaveText("Mark module complete");

    await firstAction.click();
    expect(putPayloads[1]).toEqual({ program_slug: "marketing", lesson_id: "positioning-offer", state: "completed" });
    await expect(firstCard.locator("[data-lesson-state-label]")).toHaveText("Completed · self-tracked");
    await expect(page.locator("[data-progress-count]")).toHaveText("1");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-lesson-id="positioning-offer"] [data-lesson-state-label]')).toHaveText("Completed · self-tracked");
    await expect(page.locator("[data-progress-count]")).toHaveText("1");

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("dashboard shows truthful curriculum actions for Applied and Enrolled states", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/academy/profile", (route) => route.fulfill(ok({
      success: true,
      learner: {
        id: "learner-1",
        email: "learner@example.com",
        name: "Alex Learner",
        identity_role: "Academy Learner",
        preferred_language: "en",
        timezone: "Europe/Kyiv",
      },
      enrollments: [
        enrollment("us-logistics-operations", "applied"),
        enrollment("marketing", "enrolled"),
      ],
    })));

    await page.goto("/services/hermes-connect/academy/dashboard/", { waitUntil: "domcontentloaded" });
    const review = page.getByRole("link", { name: "Review curriculum" });
    const continueLink = page.getByRole("link", { name: "Continue learning" });
    await expect(review).toHaveAttribute("href", "/services/hermes-connect/academy/program/us-logistics-operations/");
    await expect(continueLink).toHaveAttribute("href", "/services/hermes-connect/academy/program/marketing/");
  });

  test("unauthenticated program route redirects to shared Academy auth", async ({ page }) => {
    await page.route("**/api/academy/progress?program=marketing", (route) => route.fulfill(ok({ success: false, error: "not_authenticated" }, 401)));
    await page.goto("/services/hermes-connect/academy/program/marketing/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/services\/hermes-connect\/academy\/auth\/\?mode=login$/);
  });
});
