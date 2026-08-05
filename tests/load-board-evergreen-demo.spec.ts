import { expect, test } from "@playwright/test";

test("Load Board uses evergreen fictional timing labels", async ({ page }) => {
  await page.goto("/load-board/#available-loads");

  await expect(page.getByText("Demo day +1 · 8 AM–2 PM", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo day +2", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo day +3 · appointment", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo day +4–5", { exact: true })).toBeVisible();

  for (const sample of ["A", "B", "C", "D"]) {
    await expect(page.getByText(`Fictional sample ${sample}`, { exact: true })).toBeVisible();
  }

  await expect(page.locator(".available-load-list dt", { hasText: "Demo status" })).toHaveCount(4);
  await expect(page.getByText("No load below is available to book.", { exact: true })).toBeVisible();

  const demoText = await page.locator(".available-load-list").innerText();
  expect(demoText).not.toMatch(/Jul\s+2[2-6]/i);
  expect(demoText).not.toMatch(/\b\d+\s*(?:min|hr)s?\s+ago\b/i);
});
