import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test("mobile showroom stages stay clickable with sticky header and contact CTA", async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __redesignTransitionCalls?: number }).__redesignTransitionCalls = 0;
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (fn: () => void) => {
        (window as typeof window & { __redesignTransitionCalls: number }).__redesignTransitionCalls++;
        fn();
        return { finished: Promise.resolve() };
      },
    });
  });
  await page.goto("/services/website-redesign/");
  const showroom = page.locator("[data-redesign-showroom]");
  const headings: [string, string][] = [
    ["Existing site", "Start with the real website, not a blank canvas."],
    ["Diagnose", "Separate proven friction from visual preference."],
    ["IA + design system", "Plan the new structure without losing useful ownership."],
    ["Responsive prototype", "Show the changed experience before release."],
    ["Regression + human review", "Compare old and new before anything replaces production."],
    ["Controlled release + measure", "Release carefully, read back production, then measure."],
  ];
  await expect(page.locator(".money-page-action-bar")).toBeVisible();
  for (const [label, title] of headings) {
    const step = showroom.getByRole("button", { name: label, exact: false });
    await step.evaluate(el => el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" }));
    await expect(step).toBeInViewport();
    await step.click({ timeout: 5000 });
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(showroom.getByRole("heading", { name: title })).toBeVisible();
  }
  expect(await page.evaluate(() => (window as typeof window & { __redesignTransitionCalls?: number }).__redesignTransitionCalls)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator(".money-page-action-primary")).toHaveAttribute("href", "/paths/technology/?project=website_redesign#project-brief");
});
