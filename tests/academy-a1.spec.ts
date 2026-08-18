import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const learnerState = {
  success: true,
  learner: {
    id: "specialist-learner-1",
    email: "learner@example.com",
    name: "Alex Learner",
    identity_role: "Academy Learner",
    preferred_language: "en",
    timezone: "Europe/Kyiv",
  },
  enrollments: [],
};

test.describe("Hermes Connect Academy A1", () => {
  test("existing Hermes session opens Academy without a second auth store", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/auth/me", (route) => route.fulfill(ok({
      success: true,
      specialist: { id: "specialist-shop-1", email: "owner@example.com", name: "Existing Hermes User", role: "Shop Owner" },
    })));

    await page.goto("/services/hermes-connect/academy/auth/?mode=login", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Welcome, Existing Hermes User.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open learner dashboard" })).toHaveAttribute("href", "/services/hermes-connect/academy/dashboard/");

    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.viewport + 1);
  });

  test("new learner registration uses existing Hermes auth endpoint and Academy Learner role", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let registerPayload: any = null;
    await page.route("**/api/auth/me", (route) => route.fulfill(ok({ success: false, error: "not_authenticated" }, 401)));
    await page.route("**/api/auth/register", async (route) => {
      registerPayload = route.request().postDataJSON();
      return route.fulfill(ok({ success: true, specialist: { id: "specialist-new", email: registerPayload.email, name: registerPayload.name, role: registerPayload.role } }, 201));
    });

    await page.goto("/services/hermes-connect/academy/auth/?mode=register", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Full name").fill("New Learner");
    await page.getByLabel("Email", { exact: true }).last().fill("new@example.com");
    await page.getByLabel("Country and city").fill("Kyiv, Ukraine");
    await page.getByLabel("Password", { exact: true }).last().fill("correct-horse-123");

    await Promise.all([
      page.waitForURL(/\/services\/hermes-connect\/academy\/dashboard\/$/),
      page.getByRole("button", { name: "Create learner identity" }).click(),
    ]);

    expect(registerPayload).toEqual({
      email: "new@example.com",
      password: "correct-horse-123",
      name: "New Learner",
      role: "Academy Learner",
      location: "Kyiv, Ukraine",
      bio: "Hermes Academy learner identity for reviewed training access.",
    });
    expect(JSON.stringify(registerPayload)).not.toContain("academy_session");
  });

  test("learner can request only an Applied enrollment and sees it after refresh", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let state = structuredClone(learnerState);
    let enrollmentPayload: any = null;

    await page.route("**/api/academy/profile", async (route) => {
      if (route.request().method() === "PUT") {
        const payload = route.request().postDataJSON();
        state = { ...state, learner: { ...state.learner, preferred_language: payload.preferred_language, timezone: payload.timezone } };
      }
      return route.fulfill(ok(state));
    });
    await page.route("**/api/academy/enrollments", async (route) => {
      enrollmentPayload = route.request().postDataJSON();
      const enrollment = {
        id: "academy-enrollment-1",
        program_slug: enrollmentPayload.program_slug,
        state: "applied",
        participation_model: "unspecified",
        cohort_code: null,
        created_at: "2026-08-18T03:30:00.000Z",
        updated_at: "2026-08-18T03:30:00.000Z",
      };
      state = { ...state, enrollments: [enrollment] };
      return route.fulfill(ok({ success: true, existing: false, enrollment }, 201));
    });

    await page.goto("/services/hermes-connect/academy/dashboard/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Welcome, Alex Learner.")).toBeVisible();
    await page.getByLabel("Program").selectOption("us-logistics-operations");
    await page.getByRole("button", { name: "Request program review" }).click();

    expect(enrollmentPayload).toEqual({ program_slug: "us-logistics-operations" });
    expect(enrollmentPayload).not.toHaveProperty("state");
    expect(enrollmentPayload).not.toHaveProperty("participation_model");
    expect(enrollmentPayload).not.toHaveProperty("cohort_code");
    await expect(page.getByText("Applied · human review pending")).toBeVisible();
    await expect(page.getByText("Participation model: decided during human review")).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Applied · human review pending")).toBeVisible();
    await expect(page.getByLabel("Program").locator('option[value="us-logistics-operations"]')).toBeDisabled();

    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.viewport + 1);
  });

  test("unauthenticated learner dashboard redirects to shared Academy auth", async ({ page }) => {
    await page.route("**/api/academy/profile", (route) => route.fulfill(ok({ success: false, error: "not_authenticated" }, 401)));
    await page.goto("/services/hermes-connect/academy/dashboard/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/services\/hermes-connect\/academy\/auth\/\?mode=login$/);
  });
});
