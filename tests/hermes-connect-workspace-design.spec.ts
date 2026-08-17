import { expect, test } from "@playwright/test";

async function mockAvailabilityWorkspace(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      specialist: { name: "Owner", email: "owner@example.com", role: "Shop Owner" },
    }),
  }));

  await page.route("**/api/repair-shop/availability", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      timezone: "America/Chicago",
      days: [
        { day_of_week: 1, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 2, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 3, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 4, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 5, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 6, is_open: false, start_time: null, end_time: null },
        { day_of_week: 0, is_open: false, start_time: null, end_time: null },
      ],
    }),
  }));
}

test("Repair Shop owner availability uses the shared Obsidian workspace grammar", async ({ page }) => {
  await mockAvailabilityWorkspace(page);
  await page.goto("/services/hermes-connect/repair-shops/availability/");

  await expect(page.getByRole("heading", { name: "Weekly availability" })).toBeVisible();
  await expect(page.locator("#timezone-pill")).toContainText("America/Chicago");
  await expect(page.locator(".day-row")).toHaveCount(7);

  const visual = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".availability-page");
    const panel = document.querySelector<HTMLElement>(".availability-page .panel");
    const button = document.querySelector<HTMLElement>("#save-availability-btn");
    if (!root || !panel || !button) return null;

    const rootStyle = getComputedStyle(root);
    const panelStyle = getComputedStyle(panel);
    const buttonStyle = getComputedStyle(button);
    return {
      rootBackground: rootStyle.backgroundColor,
      panelRadius: panelStyle.borderRadius,
      buttonBackground: buttonStyle.backgroundColor,
      buttonBackgroundImage: buttonStyle.backgroundImage,
      buttonColor: buttonStyle.color,
      buttonRadius: buttonStyle.borderRadius,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.rootBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.panelRadius).toBe("22px");
  expect(visual!.buttonBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.buttonBackgroundImage).toBe("none");
  expect(visual!.buttonColor).toBe("rgb(11, 13, 18)");
  expect(visual!.buttonRadius).toBe("12px");
});

test("Repair Shop owner availability remains usable on mobile after workspace convergence", async ({ page }) => {
  await mockAvailabilityWorkspace(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/availability/");

  await expect(page.getByRole("heading", { name: "Weekly availability" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save weekly availability" })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
