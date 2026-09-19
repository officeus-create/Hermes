import { expect, test } from "@playwright/test";

test.describe("Academy and careers governance", () => {
  test("Academy presents five learning tracks and separates paid cohort from free practice", async ({ page }) => {
    const response = await page.goto("/paths/academy/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Build practical skills across five Hermes Academy tracks");

    await page.getByRole("button", { name: /Choose a track/ }).click();
    await expect(page.getByRole("tab")).toHaveCount(5);
    for (const name of ["U.S. Logistics Operations", "Marketing", "IT & AI", "Sales", "COO / Operations"]) {
      await expect(page.getByRole("tab", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toBeVisible();
    }

    await page.getByRole("button", { name: /Next:/ }).click();
    await page.getByRole("button", { name: /See the 6 layers/ }).click();
    await page.getByRole("button", { name: /Method & FAQ/ }).click();

    const methodScreen = page.locator('[data-academy-screen="4"]');
    await expect(methodScreen.getByText("Paid cohort", { exact: true })).toBeVisible();
    await expect(methodScreen.getByText("Free practice opportunity", { exact: true })).toBeVisible();
    await expect(methodScreen.getByText("not a separate learning track", { exact: false })).toBeVisible();

    const pricingFaq = methodScreen.locator("details").filter({ hasText: "Are current prices published?" });
    await pricingFaq.locator("summary").click();
    await expect(pricingFaq.locator("p")).toContainText("No fixed price is published");

    const employmentFaq = methodScreen.locator("details").filter({ hasText: "Is employment or income guaranteed?" });
    await employmentFaq.locator("summary").click();
    await expect(employmentFaq.locator("p")).toContainText("employment, income, clients, certification");

    await expect(page.locator('[data-contact-form]')).toHaveAttribute("data-contact-mode", "preview");
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test("Careers fails closed after the verified vacancy publication window expires", async ({ page }) => {
    const response = await page.goto("/logistics/careers/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
    await expect(page.getByText("0", { exact: true })).toBeVisible();
    await expect(page.getByText("verified public vacancies", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Car Hauling Dispatcher/ })).toHaveCount(0);
    await expect(page.locator('a[href="/careers/car-hauling-dispatcher/"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Prepare a general careers inquiry" })).toBeVisible();
    await expect(page.getByText("does not guarantee review timing", { exact: false })).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join(" ")).not.toContain('"JobPosting"');
  });

  test("Canonical Car Hauling Dispatcher page suppresses stale JobPosting and application CTAs after expiry", async ({ page }) => {
    const response = await page.goto("/careers/car-hauling-dispatcher/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveText("Car Hauling Dispatcher — Remote / U.S. Market");
    await expect(page.getByText("Remote worldwide", { exact: true })).toBeVisible();
    await expect(page.getByText("U.S. Central Time schedule", { exact: true })).toBeVisible();
    await expect(page.getByText(/Publication review due/)).toBeVisible();
    await expect(page.getByText(/awaiting a fresh recruiting review/)).toBeVisible();

    const previewLinks = page.locator('a[href^="/logistics/apply/?for=career&role=car-hauling-dispatcher&source=hermes_careers"]');
    await expect(previewLinks).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Prepare Hermes application preview" })).toHaveCount(0);

    const workUaLinks = page.locator('a[href="https://www.work.ua/jobs/7362244/"][data-external-job-apply]');
    await expect(workUaLinks).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Check current vacancies/ })).toHaveCount(2);

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const combined = jsonLd.join(" ");
    expect(combined).not.toContain('"JobPosting"');
    expect(combined).not.toContain('"validThrough":"2026-09-18T23:59:59Z"');
    expect(combined).not.toContain("@ProgressoPro");
  });
});
