import { expect, test } from "@playwright/test";

test("website redesign explains controlled change without changing the canonical owner", async ({ page }) => {
  await page.goto("/services/website-redesign/");

  const showroom = page.locator("[data-redesign-showroom]");
  await expect(showroom).toBeVisible();
  await expect(page.getByRole("heading", { name: "See how an existing website changes without throwing away what already works." })).toBeVisible();

  const expected = [
    ["Existing site", "Start with the real website, not a blank canvas."],
    ["Diagnose", "Separate proven friction from visual preference."],
    ["IA + design system", "Plan the new structure without losing useful ownership."],
    ["Responsive prototype", "Show the changed experience before release."],
    ["Regression + human review", "Compare old and new before anything replaces production."],
    ["Controlled release + measure", "Release carefully, read back production, then measure."],
  ];

  for (const [label, heading] of expected) {
    const step = showroom.getByRole("button", { name: label, exact: false });
    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");
    await expect(showroom.getByRole("heading", { name: heading })).toBeVisible();
    const key = await step.getAttribute("data-redesign-step");
    if (!key) throw new Error("Missing redesign stage key");
    await expect(showroom.locator(`[data-redesign-ledger="${key}"]`)).toHaveClass(/active/);
    await expect(showroom.locator(".redesign-proof-ledger-state.active")).toHaveCount(1);
  }

  await expect(page.locator('a[href="/case/it-development/"]').filter({ hasText: "Review the Hermes website case" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/website-redesign/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://hermeslogisticsus.com/images/hermes-live-product.jpg");
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1440");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "900");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", "The live Hermes website showing its four interactive business portals");
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute("content", "The live Hermes website showing its four interactive business portals");
  await expect(page.getByRole("heading", { name: "Website Redesign Built Around Business Priorities" })).toBeVisible();
});

test.describe("website redesign showroom mobile contract", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("remains readable and usable at 390px", async ({ page }) => {
    await page.goto("/services/website-redesign/");
    const showroom = page.locator("[data-redesign-showroom]");
    await expect(showroom).toBeVisible();

    await showroom.getByRole("button", { name: "Regression + human review", exact: false }).tap();
    await expect(showroom.getByRole("heading", { name: "Compare old and new before anything replaces production." })).toBeVisible();
    const ledger = showroom.locator('[data-redesign-ledger="review"]');
    await expect(ledger).toHaveClass(/active/);
    await expect(ledger).toContainText("Exact-head CI + human gate");

    const geometry = await ledger.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(390);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});


test("redesign showroom uses native View Transition only when motion is allowed", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __redesignTransitions?: number }).__redesignTransitions = 0;
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (update: () => void) => {
        (window as unknown as { __redesignTransitions: number }).__redesignTransitions += 1;
        update();
        return { finished: Promise.resolve() };
      },
    });
  });
  await page.goto("/services/website-redesign/");
  const showroom = page.locator("[data-redesign-showroom]");
  await expect(page.locator("html")).toHaveCSS("view-transition-name", "none");
  await expect(showroom.locator(".redesign-showroom-browser")).toHaveCSS("view-transition-name", "website-redesign-stage");

  await showroom.getByRole("button", { name: "Diagnose", exact: false }).click();
  await expect(showroom).toHaveAttribute("data-native-transition", /running|ready/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __redesignTransitions?: number }).__redesignTransitions ?? 0)).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const before = await page.evaluate(() => (window as unknown as { __redesignTransitions?: number }).__redesignTransitions ?? 0);
  await showroom.getByRole("button", { name: "IA + design system", exact: false }).click();
  const after = await page.evaluate(() => (window as unknown as { __redesignTransitions?: number }).__redesignTransitions ?? 0);

  expect(after).toBe(before);
  await expect(showroom.getByRole("heading", { name: "Plan the new structure without losing useful ownership." })).toBeVisible();
});
