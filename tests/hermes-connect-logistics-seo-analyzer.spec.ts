import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/logistics-seo-analyzer/";

test("Logistics SEO Analyzer keeps evidence gaps separate from defects", async ({ page }) => {
  const writeRequests: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writeRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.goto(route);
  await expect(page).toHaveTitle("Logistics SEO Analyzer · Hermes Connect");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByText("No fake website crawl.")).toBeVisible();

  await expect(page.locator('[data-seo-output="blockers"]')).toHaveText("0");
  await expect(page.locator('[data-seo-output="measurement"]')).toHaveText("2");
  await expect(page.locator('[data-seo-output="holds"]')).toHaveText("1");
  await expect(page.locator("[data-findings-body]")).toContainText("Analytics events exist in code but production receipt is unverified");
  await expect(page.locator("[data-findings-body]")).toContainText("External company/entity profiles conflict");
  await expect(page.locator("[data-findings-body]")).toContainText("Operational proof exists but publication permission is not approved");
  await expect(page.locator("[data-findings-body]")).toContainText("7-day / 28-day baseline is incomplete");
  await expect(page.locator("[data-roadmap='30']")).toContainText("Protect current conversion/index ownership");

  expect(writeRequests).toEqual([]);
});

test("Logistics SEO Analyzer prioritizes real buyer blockers and thin-page risk", async ({ page }) => {
  await page.goto(route);
  await page.locator('select[name="primaryCta"]').selectOption("demo_or_generic");
  await page.locator('select[name="deliverySemantics"]').selectOption("optimistic_or_unknown");
  await page.locator('select[name="canonicalIndexability"]').selectOption("issues");
  await page.locator('select[name="moneyPageOwnership"]').selectOption("overlapping");
  await page.locator('select[name="internalLinks"]').selectOption("weak");
  await page.locator('select[name="locationUniqueness"]').selectOption("repeated_thin_risk");
  await page.getByRole("button", { name: "Build SEO decision roadmap" }).click();

  await expect(page.locator('[data-seo-output="blockers"]')).toHaveText("3");
  const findings = page.locator("[data-findings-body]");
  await expect(findings).toContainText("Primary CTA routes to a demo or generic path");
  await expect(findings).toContainText("Delivery success semantics are optimistic or unverified");
  await expect(findings).toContainText("Canonical or indexability issues are observed");
  await expect(findings).toContainText("Commercial intent overlaps across multiple pages");
  await expect(findings).toContainText("Location/service pages show repeated-thin risk");
  await expect(page.locator("[data-roadmap='30']")).toContainText("Make the real intake the primary action");

  const analytics = await page.evaluate(() => JSON.stringify((window as any).dataLayer ?? []));
  expect(analytics).toContain("logistics_seo_analyzer_start");
  expect(analytics).toContain("logistics_seo_analyzer_complete");
  expect(analytics).not.toContain("demo_or_generic");
  expect(analytics).not.toContain("repeated_thin_risk");
});

test("Logistics SEO Analyzer keeps unknown access as measurement work and preserves approved handoff", async ({ page }) => {
  await page.goto(route);
  await page.locator('select[name="searchConsole"]').selectOption("unknown");
  await page.locator('select[name="analyticsReceipt"]').selectOption("unknown");
  await page.locator('select[name="canonicalIndexability"]').selectOption("unknown");
  await page.locator('select[name="moneyPageOwnership"]').selectOption("unknown");
  await page.locator('select[name="internalLinks"]').selectOption("unknown");
  await page.getByRole("button", { name: "Build SEO decision roadmap" }).click();

  await expect(page.locator("[data-findings-body]")).toContainText("MEASURE");
  await expect(page.locator("[data-findings-body]")).toContainText("Canonical/indexability state is unknown");
  await expect(page.locator("[data-findings-body]")).toContainText("Preferred money-page owners are not documented");
  await expect(page.locator('a[data-logistics-seo-handoff]').first()).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/paths/marketing/?service=logistics_seo#contact",
  );
});
