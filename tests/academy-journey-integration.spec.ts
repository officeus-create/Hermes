import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

test("enrolled Academy course exposes the current evidence and progression handoff at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/academy/progress*", (route) => route.fulfill(ok({
    success: true,
    enrollment: {
      id: "enrollment-marketing",
      program_slug: "marketing",
      state: "enrolled",
      participation_model: "unspecified",
      cohort_code: null,
    },
    progress: [],
  })));

  await page.goto("/services/hermes-connect/academy/program/marketing/", { waitUntil: "domcontentloaded" });

  const journey = page.locator("[data-academy-evidence-journey]");
  await expect(journey.getByRole("heading", { name: "The next Academy stages are already connected." })).toBeVisible();
  await expect(journey).toContainText("authorized human reviewer");
  await expect(journey.getByRole("link", { name: "Open Evidence workspace" })).toHaveAttribute("href", "/services/hermes-connect/academy/submissions/");
  await expect(journey.getByRole("link", { name: "View Progression" })).toHaveAttribute("href", "/services/hermes-connect/academy/progression/");
  await expect(page.locator("body")).not.toContainText("A later bounded Academy release may add assignments");

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});
