import { expect, test } from "@playwright/test";

test("website development explains the delivery workflow without changing the canonical owner", async ({ page }) => {
  await page.goto("/services/website-development/");

  const showroom = page.locator("[data-website-showroom]");
  await expect(showroom).toBeVisible();
  await expect(page.getByRole("heading", { name: "See how a website moves from business context to verified release." })).toBeVisible();

  const expected = [
    ["Business context", "Start with what the company actually needs."],
    ["Brief + architecture", "Turn discovery into a controlled build plan."],
    ["Design + build", "Build the responsive product around the approved plan."],
    ["QA + human review", "Check the system before it becomes a release."],
    ["Search + release", "Protect discoverability while moving toward production."],
    ["Evidence + next step", "Use real readback to decide what changes next."],
  ];

  for (const [label, heading] of expected) {
    const step = showroom.getByRole("button", { name: label, exact: false });
    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(showroom.getByRole("heading", { name: heading })).toBeVisible();
  }

  await expect(page.locator('a[href="/case/it-development/"]').filter({ hasText: "Review the website case" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/website-development/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
});

test.describe("website development showroom mobile contract", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("remains readable and usable at 390px", async ({ page }) => {
    await page.goto("/services/website-development/");
    const showroom = page.locator("[data-website-showroom]");
    await expect(showroom).toBeVisible();

    await showroom.getByRole("button", { name: "QA + human review", exact: false }).tap();
    await expect(showroom.getByRole("heading", { name: "Check the system before it becomes a release." })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
