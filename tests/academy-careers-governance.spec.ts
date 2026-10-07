import { expect, test } from "@playwright/test";
import { verifiedOpenVacancies } from "../src/data/careers-governance";
const wisconsinIsCurrent = verifiedOpenVacancies.some((item) => item.slug === "wisconsin-owner-operators");

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

  test("Careers lists only the current verified vacancy and its live external source", async ({ page }) => {
    const response = await page.goto("/logistics/careers/");
    expect(response?.ok()).toBeTruthy();
    if (!wisconsinIsCurrent) {
      await expect(page.getByRole("heading", { name: /No verified public vacancy is listed today/ })).toBeVisible();
      await expect(page.locator('a[data-external-vacancy-source]')).toHaveCount(0);
      return;
    }
    await expect(page.getByRole("heading", { name: /Verified public vacancies are open/ })).toBeVisible();
    await expect(page.getByText("1", { exact: true })).toBeVisible();
    await expect(page.getByText("verified public vacancies", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Car Hauling Dispatcher/ })).toHaveCount(0);
    await expect(page.locator('a[href="/careers/car-hauling-dispatcher/"]')).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Wisconsin Owner-Operators/ })).toBeVisible();
    await expect(page.locator('a[href="/careers/wisconsin-owner-operators/"]')).toBeVisible();
    await expect(page.locator('a[href="https://100hires.com/j/G4ek3eN"][data-external-vacancy-source]')).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "This vacancy is awaiting a fresh recruiting review." })).toBeVisible();

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

  test("Wisconsin owner-operator page exposes verified source, public phone, and truthful local scope", async ({ page }) => {
    const response = await page.goto("/careers/wisconsin-owner-operators/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toHaveText("Wisconsin Owner-Operators — Own Truck & Trailer | No Forced Dispatch");
    await expect(page.locator(".career-updated")).toHaveText("Source reviewed October 3, 2026");
    await expect(page.locator(".career-updated")).toBeVisible();
    if (wisconsinIsCurrent) await expect(page.getByRole("link", { name: /View and apply on 100Hires/ })).toHaveAttribute("href", "https://100hires.com/j/G4ek3eN");
    await expect(page.getByRole("link", { name: /Open the Hermes employer page on 100Hires/ })).toHaveAttribute("href", "https://100hires.com/c/hermeslogisticsus-com");
    await expect(page.getByText(/employer-profile reference and not as a complete vacancy directory/)).toBeVisible();
    await expect(page.getByText(/There are no active job postings right now/)).toBeVisible();
    await expect(page.getByText(/After expiry, this page is a recruiting reference/)).toBeVisible();
    if (wisconsinIsCurrent) await expect(page.getByRole("link", { name: /Call recruiting/ })).toHaveAttribute("href", "tel:+14142697377");
    await expect(page.getByText("+1 (414) 269-7377", { exact: true })).toBeVisible();
    await expect(page.getByText("Milwaukee", { exact: true })).toBeVisible();
    await expect(page.getByText("Madison", { exact: true })).toBeVisible();
    await expect(page.getByText("No forced dispatch. No invented income promise.", { exact: true })).toBeVisible();
    await expect(page.getByText("Power Only — trailer and operating arrangement reviewed individually", { exact: true })).toBeVisible();
    const companyDriverFaq = page.locator("details").filter({ hasText: "Is this a company-driver job?" });
    await companyDriverFaq.locator("summary").click();
    await expect(companyDriverFaq.getByText(/Trailer and equipment eligibility are therefore confirmed individually/)).toBeVisible();
    await expect(page.locator('a[href^="tel:"]:visible')).toHaveCount(2);
    for (const href of await page.locator('a[href^="tel:"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
      expect(href).toBe("tel:+14142697377");
    }

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const combined = jsonLd.join(" ");
    if (!wisconsinIsCurrent) {
      expect(combined).not.toContain('"@type":"JobPosting"');
      await expect(page.getByText("This vacancy is awaiting a fresh recruiting review.", { exact: false })).toBeVisible();
      await expect(page.locator("[data-external-job-apply]")).toHaveCount(0);
      return;
    }
    expect(combined).toContain('"@type":"JobPosting"');
    expect(combined).toContain('"employmentType":"CONTRACTOR"');
    expect(combined).toContain('"sameAs":"https://100hires.com/j/G4ek3eN"');
  });
});
