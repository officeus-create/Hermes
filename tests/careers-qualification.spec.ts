import { expect, test } from "@playwright/test";

test("careers page explains evidence and screening before interview", async ({ page }) => {
  await page.goto("/logistics/careers/");

  await expect(page.getByRole("heading", { name: "Show fit first. Interview time comes after screening." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Relevant work or a clear starting level" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Measurable results" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Real availability" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Role-specific proof" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Application → review → evidence → interview" })).toBeVisible();
  await expect(page.getByText(/A resume can provide context, but it is not the whole decision/i)).toBeVisible();
  await expect(page.getByText(/submitting an inquiry, completing a test, joining training, or reaching an interview does not guarantee a job/i)).toBeVisible();
});
