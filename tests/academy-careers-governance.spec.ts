import { expect, test } from "@playwright/test";

test.describe("Academy and careers governance", () => {
  test("Academy presents two programs and separates paid cohort from free practice", async ({ page }) => {
    const response = await page.goto("/paths/academy/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Learn practical U.S. logistics and marketing skills");

    await page.getByRole("button", { name: /Choose a track/ }).click();
    await expect(page.getByRole("tab")).toHaveCount(2);
    await expect(page.getByRole("tab", { name: /U.S. Logistics Operations/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Marketing/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /COO|Multi-business leadership/ })).toHaveCount(0);

    await page.getByRole("button", { name: /Next:/ }).click();
    await page.getByRole("button", { name: /See the 6 layers/ }).click();
    await page.getByRole("button", { name: /Method & FAQ/ }).click();

    const methodScreen = page.locator('[data-academy-screen="4"]');
    await expect(methodScreen.getByText("Paid cohort", { exact: true })).toBeVisible();
    await expect(methodScreen.getByText("Free practice opportunity", { exact: true })).toBeVisible();
    await expect(methodScreen.getByText("not a third Academy program", { exact: false })).toBeVisible();

    const pricingFaq = methodScreen.locator("details").filter({ hasText: "Are current prices published?" });
    await pricingFaq.locator("summary").click();
    await expect(pricingFaq.locator("p")).toContainText("No fixed price is published");

    const employmentFaq = methodScreen.locator("details").filter({ hasText: "Is employment or income guaranteed?" });
    await employmentFaq.locator("summary").click();
    await expect(employmentFaq.locator("p")).toContainText("employment, income, clients, certification");

    await expect(page.locator('[data-contact-form]')).toHaveAttribute("data-contact-mode", "preview");
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test("Careers lists the verified Car Hauling Dispatcher vacancy without duplicating JobPosting schema on the hub", async ({ page }) => {
    const response = await page.goto("/logistics/careers/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: /Verified public vacancies are open/ })).toBeVisible();
    await expect(page.getByText("1", { exact: true })).toBeVisible();
    await expect(page.getByText("verified public vacancies", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Car Hauling Dispatcher/ })).toBeVisible();
    await expect(page.locator('a[href="/careers/car-hauling-dispatcher/"]')).toBeVisible();
    await expect(page.getByRole("link", { name: "Prepare a general careers inquiry" })).toBeVisible();
    await expect(page.getByText("does not guarantee review timing", { exact: false })).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join(" ")).not.toContain('"JobPosting"');
  });

  test("Canonical Car Hauling Dispatcher page carries one truthful JobPosting and a real interim application route", async ({ page }) => {
    const response = await page.goto("/careers/car-hauling-dispatcher/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveText("Car Hauling Dispatcher — Remote / U.S. Market");
    await expect(page.getByText("Remote worldwide", { exact: true })).toBeVisible();
    await expect(page.getByText("U.S. Central Time schedule", { exact: true })).toBeVisible();

    const previewLinks = page.locator('a[href^="/logistics/apply/?for=career&role=car-hauling-dispatcher&source=hermes_careers"]');
    await expect(previewLinks).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Prepare Hermes application preview" })).toBeVisible();

    const workUaLinks = page.locator('a[href="https://www.work.ua/jobs/7362244/"][data-external-job-apply]');
    await expect(workUaLinks).toHaveCount(2);
    await expect(workUaLinks.first()).toHaveText(/Apply on Work\.ua/);
    await expect(page.getByText("does not yet send or store an application", { exact: false })).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const combined = jsonLd.join(" ");
    expect(combined.match(/\"@type\":\"JobPosting\"/g)?.length ?? 0).toBe(1);
    expect(combined).toContain('"employmentType":"FULL_TIME"');
    expect(combined).toContain('"jobLocationType":"TELECOMMUTE"');
    expect(combined).toContain('"directApply":false');
    expect(combined).toContain('"datePosted":"2026-02-26"');
    expect(combined).toContain('"validThrough":"2026-09-14T23:59:59Z"');
    expect(combined).not.toContain("@ProgressoPro");
  });
});
