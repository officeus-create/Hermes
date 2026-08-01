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

  test("Careers shows verified vacancy status without JobPosting", async ({ page }) => {
    const response = await page.goto("/logistics/careers/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
    await expect(page.getByText("0", { exact: true })).toBeVisible();
    await expect(page.getByText("verified public vacancies", { exact: true })).toBeVisible();
    await expect(page.locator('a[href="/logistics/apply/"]')).toBeVisible();
    await expect(page.getByText("does not guarantee review timing", { exact: false })).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join(" ")).not.toContain('"JobPosting"');
  });
});
