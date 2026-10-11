import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("managed MZM reviewer login bypasses owner-company creation and enters the same managed workspace", async ({ page }) => {
  let companyCalls = 0;
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "authentication_required" }),
  }));
  await page.route("**/api/auth/login", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  }));
  await page.route("**/api/hermes-connect/company", (route) => {
    companyCalls += 1;
    return route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "company_route_must_not_run_for_managed_reviewer" }),
    });
  });

  await page.goto("/services/hermes-connect/home-services/access/?mode=login&managed=mzm-junk-removal", { waitUntil: "domcontentloaded" });
  await page.locator('[data-login-form] input[name="email"]').fill("mzm-reviewer@example.invalid");
  await page.locator('[data-login-form] input[name="password"]').fill("synthetic-test-password");
  await page.locator('[data-login-form] button[type="submit"]').click();

  await expect(page).toHaveURL(/\/services\/hermes-connect\/home-services\/workspace\/\?managed=mzm-junk-removal$/);
  expect(companyCalls).toBe(0);
});

test("MZM reviewer workspace is read-only and shows KPI-excluded sample pipeline when no real leads exist", async ({ page }) => {
  await page.route("**/api/hermes-connect/home-services/crm**", (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "managed_client_read_only" }),
      });
    }
    if (url.searchParams.get("module") === "leads") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, leads: [] }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        company: {
          id: "home-service-managed:mzm-junk-removal",
          name: "MZM Junk Removal",
          slug: "mzm-junk-removal",
          city: "Roseville",
          state: "CA",
          catalogOptIn: false,
          catalogStatus: "managed_private",
          managementMode: "hermes_managed",
          publicationBasis: "owner_consent_pending",
          accessMode: "hermes_managed_reviewer",
          accessRole: "viewer",
          readOnly: true,
        },
        profile: {
          id: "home-service-managed-profile:mzm-junk-removal",
          companyId: "home-service-managed:mzm-junk-removal",
          serviceSubtype: "junk_removal",
          services: ["Junk removal", "Garage cleanouts"],
          serviceAreas: ["Roseville", "Sacramento", "Orangevale", "Rancho Cordova"],
          publicSummary: "MZM Junk Removal serves Roseville and Greater Sacramento.",
          semanticCoreRef: "client-provided:MZM_Junk_Removal_Semantic_Core.xlsx",
          contentStatus: "active_content_planning",
        },
        metrics: {
          totalLeads: 0,
          bookedRate: null,
          revenueCents: null,
          grossAfterTrackedCostsCents: null,
          averageTicketCents: null,
          reviewRate: null,
          moneyEvidence: {
            revenue: { verifiedCount: 0, requiredCount: 0 },
            leadCost: { verifiedCount: 0, requiredCount: 0 },
            disposalCost: { verifiedCount: 0, requiredCount: 0 },
          },
          byCity: [], bySource: [], byJobType: [], bySearchQuery: [],
        },
        recentLeads: [],
      }),
    });
  });

  await page.goto("/services/hermes-connect/home-services/workspace/?managed=mzm-junk-removal", { waitUntil: "domcontentloaded" });

  await expect(page.locator("[data-company-name]")).toHaveText("MZM Junk Removal");
  await expect(page.locator("[data-readonly-banner]")).toBeVisible();
  await expect(page.locator("[data-sample-banner]")).toContainText("SAMPLE DATA");
  await expect(page.locator("[data-write-panel]")).toHaveCount(2);
  await expect(page.locator("[data-write-panel]").first()).toBeHidden();
  await expect(page.locator('[data-kpi="totalLeads"]')).toHaveText("0");
  await expect(page.locator('[data-kpi="bookedRate"]')).toHaveText("UNKNOWN");
  await expect(page.locator('[data-kpi="reviewRate"]')).toHaveText("UNKNOWN");
  await expect(page.locator(".sample-chip")).toHaveCount(4);
  await expect(page.getByText("SAMPLE · Roseville homeowner")).toBeVisible();
  await expect(page.getByText("SAMPLE · Orangevale property")).toBeVisible();
  await expect(page.locator("[data-leads-body] button.edit")).toHaveCount(0);
});

test("managed reviewer backend scope is company-specific and fail-closed for writes", async () => {
  const helper = readFileSync("functions/api/_lib/home-service-crm.mjs", "utf8");
  const api = readFileSync("functions/api/hermes-connect/home-services/crm.ts", "utf8");
  const grant = readFileSync("functions/api/internal/mzm-reviewer-access.ts", "utf8");
  const workflow = readFileSync(".github/workflows/mzm-reviewer-access.yml", "utf8");

  expect(helper).toContain("CREATE TABLE IF NOT EXISTS hermes_managed_client_access");
  expect(helper).toContain("PRIMARY KEY (specialist_id, company_id)");
  expect(helper).toContain("managed_client_access_required");
  expect(helper).toContain("hermes_managed_reviewer");
  expect(helper).toContain("readOnly: !internalAccess && accessRole !== \"editor\"");
  expect(api).toContain("managed_client_read_only");
  expect(api).toContain("readOnly: Boolean(ctx.readOnly)");
  expect(grant).toContain("verifyGitHubMzmReviewerAccessOidcToken");
  expect(grant).toContain("home-service-managed:mzm-junk-removal");
  expect(grant).toContain("access_role: \"viewer\"");
  expect(grant).toContain("owner_authentication_claimed: false");
  expect(workflow).toContain("github.event.comment.user.login == 'officeus-create'");
  expect(workflow).toContain("startsWith(github.event.comment.body, '/create-mzm-reviewer ')");
  expect(workflow).toContain("RECIPIENT_KEY_COMMENT");
  expect(workflow).toContain("Reviewer recipient key must be RSA-4096.");
  expect(workflow).toContain("openssl pkeyutl -encrypt -pubin");
  expect(workflow).not.toContain("-----BEGIN PUBLIC KEY-----");
  expect(workflow).not.toContain("Temporary password");
});
