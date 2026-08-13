import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/revenue-dashboard/";

const verifiedFixture = {
  period: {
    timezone: "America/Chicago",
    date_range: "2026-08-01 to 2026-08-07",
    attribution_basis: "Synthetic aggregate fixture for browser contract testing only.",
    synthetic_test_exclusion: true,
  },
  search_checkpoint: {
    evidence_class: "PLATFORM_VERIFIED",
    label: "Synthetic search checkpoint",
    date_range: "7d synthetic",
    source: "Synthetic aggregate",
    clicks: 20,
    impressions: 400,
    ctr: 0.05,
    average_position: 18.5,
  },
  directions: [
    {
      direction_id: "logistics_carrier",
      label: "Logistics · carrier / owner-operator",
      delivered: 10,
      delivered_evidence: "PRODUCTION_RECEIVER_VERIFIED",
      reviewed: 8,
      reviewed_evidence: "PRIVATE_OPERATIONS_VERIFIED",
      qualified: 4,
      qualified_evidence: "PRIVATE_OPERATIONS_VERIFIED",
      opportunities: 3,
      opportunities_evidence: "PRIVATE_OPERATIONS_VERIFIED",
      won: 1,
      won_evidence: "PRIVATE_OPERATIONS_VERIFIED",
      lost: 1,
      lost_evidence: "PRIVATE_OPERATIONS_VERIFIED",
      revenue: 2500,
      revenue_evidence: "PRIVATE_OPERATIONS_VERIFIED",
    },
  ],
};

test("Revenue Dashboard keeps unverified operating stages DATA_PENDING", async ({ page }) => {
  const writeRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.method() !== "HEAD") writeRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.goto(route);
  await expect(page).toHaveTitle("SEO → Lead → Revenue Dashboard · Hermes Connect");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { level: 1, name: "SEO → Lead → Revenue Dashboard" })).toBeVisible();

  await expect(page.locator('[data-dashboard-output="searchClicks"]')).toHaveText("10");
  await expect(page.locator('[data-dashboard-output="searchImpressions"]')).toHaveText("276");
  await expect(page.locator('[data-dashboard-output="searchCtr"]')).toHaveText("3.6%");
  await expect(page.locator('[data-dashboard-output="searchPosition"]')).toHaveText("38.98");
  await expect(page.locator('[data-dashboard-output="searchEvidence"]')).toHaveText("PLATFORM_VERIFIED");

  for (const key of ["delivered", "reviewed", "qualified", "opportunities", "won", "revenue"]) {
    await expect(page.locator(`[data-dashboard-output="${key}"]`)).toHaveText("DATA_PENDING");
  }
  await expect(page.locator('[data-dashboard-output="qualifiedRate"]')).toHaveText("DATA_PENDING");
  await expect(page.locator('[data-dashboard-output="revenuePerQualified"]')).toHaveText("DATA_PENDING");
  await expect(page.locator('[data-dashboard-output="evidenceCompleteness"]')).toHaveText("0%");
  await expect(page.locator("[data-pending-list]")).toContainText("logistics_carrier → delivered");

  const analytics = await page.evaluate(() => JSON.stringify((window as any).dataLayer ?? []));
  expect(analytics).not.toContain("276");
  expect(analytics).not.toContain("2500");
  expect(writeRequests).toEqual([]);
});

test("Revenue Dashboard renders a complete verified aggregate and derived rates", async ({ page }) => {
  await page.goto(route);
  const textarea = page.locator("[data-revenue-dashboard-input]");
  await textarea.fill(JSON.stringify(verifiedFixture));
  await page.getByRole("button", { name: "Validate and render" }).click();

  await expect(page.locator('[data-dashboard-output="delivered"]')).toHaveText("10");
  await expect(page.locator('[data-dashboard-output="reviewed"]')).toHaveText("8");
  await expect(page.locator('[data-dashboard-output="qualified"]')).toHaveText("4");
  await expect(page.locator('[data-dashboard-output="opportunities"]')).toHaveText("3");
  await expect(page.locator('[data-dashboard-output="won"]')).toHaveText("1");
  await expect(page.locator('[data-dashboard-output="revenue"]')).toHaveText("$2,500.00");
  await expect(page.locator('[data-dashboard-output="qualifiedRate"]')).toHaveText("50.0%");
  await expect(page.locator('[data-dashboard-output="opportunityRate"]')).toHaveText("75.0%");
  await expect(page.locator('[data-dashboard-output="winRate"]')).toHaveText("33.3%");
  await expect(page.locator('[data-dashboard-output="revenuePerQualified"]')).toHaveText("$625.00");
  await expect(page.locator('[data-dashboard-output="revenuePerOpportunity"]')).toHaveText("$833.33");
  await expect(page.locator('[data-dashboard-output="evidenceCompleteness"]')).toHaveText("100%");

  await expect(page.locator("[data-direction-body]")).toContainText("PRODUCTION_RECEIVER_VERIFIED");
  await expect(page.locator("[data-direction-body]")).toContainText("PRIVATE_OPERATIONS_VERIFIED");

  const analytics = await page.evaluate(() => JSON.stringify((window as any).dataLayer ?? []));
  expect(analytics).toContain("revenue_dashboard_view");
  expect(analytics).toContain("revenue_dashboard_import_complete");
  expect(analytics).not.toContain("2500");
  expect(analytics).not.toContain("Synthetic search checkpoint");
});

test("Revenue Dashboard rejects private fields and evidence promotion", async ({ page }) => {
  await page.goto(route);
  const textarea = page.locator("[data-revenue-dashboard-input]");

  const withPrivateField = structuredClone(verifiedFixture) as any;
  withPrivateField.email = "private@example.com";
  await textarea.fill(JSON.stringify(withPrivateField));
  await page.getByRole("button", { name: "Validate and render" }).click();
  await expect(page.locator("[data-revenue-dashboard-error]")).toContainText("Private or prohibited field: root.email");
  await expect(page.locator("[data-revenue-dashboard-results]")).toBeHidden();

  const invalidEvidence = structuredClone(verifiedFixture) as any;
  invalidEvidence.directions[0].reviewed_evidence = "REPOSITORY_VERIFIED";
  await textarea.fill(JSON.stringify(invalidEvidence));
  await page.getByRole("button", { name: "Validate and render" }).click();
  await expect(page.locator("[data-revenue-dashboard-error]")).toContainText("reviewed cannot use evidence class REPOSITORY_VERIFIED");

  const impossibleRevenue = structuredClone(verifiedFixture) as any;
  impossibleRevenue.directions[0].won = 0;
  impossibleRevenue.directions[0].lost = 2;
  await textarea.fill(JSON.stringify(impossibleRevenue));
  await page.getByRole("button", { name: "Validate and render" }).click();
  await expect(page.locator("[data-revenue-dashboard-error]")).toContainText("positive revenue requires at least one verified won outcome");
});
