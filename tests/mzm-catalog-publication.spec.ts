import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { homeServiceCatalogPublication, MANAGED_HOME_SERVICE_PUBLICATION_BASIS } from "../functions/api/_lib/home-service-catalog-publication.mjs";

test("Home Services publication contract separates owner opt-in from Hermes-managed verified public facts", async () => {
  const owner = homeServiceCatalogPublication({
    slug: "owner-home-service",
    catalog_opt_in: 1,
    catalog_status: "self_submitted",
    management_mode: "owner_managed",
    catalog_publication_basis: "owner_opt_in",
  });
  expect(owner.eligible).toBe(true);
  expect(owner.ownerOptInClaimed).toBe(true);
  expect(owner.managedPublicFacts).toBe(false);

  const managed = homeServiceCatalogPublication({
    slug: "mzm-junk-removal",
    catalog_opt_in: 0,
    catalog_status: "verified_public",
    management_mode: "hermes_managed",
    catalog_publication_basis: MANAGED_HOME_SERVICE_PUBLICATION_BASIS,
  });
  expect(managed.eligible).toBe(true);
  expect(managed.ownerOptInClaimed).toBe(false);
  expect(managed.managedPublicFacts).toBe(true);
  expect(managed.path).toBe("/businesses/connect/company/mzm-junk-removal/");

  expect(homeServiceCatalogPublication({
    slug: "mzm-junk-removal",
    catalog_opt_in: 0,
    catalog_status: "managed_private",
    management_mode: "hermes_managed",
    catalog_publication_basis: "owner_consent_pending",
  }).eligible).toBe(false);

  expect(homeServiceCatalogPublication({
    slug: "ordinary-private",
    catalog_opt_in: 0,
    catalog_status: "verified_public",
    management_mode: "owner_managed",
    catalog_publication_basis: "owner_opt_in",
  }).eligible).toBe(false);
});

test("all MZM Catalog publication surfaces share the managed publication contract", async () => {
  const profile = readFileSync("functions/businesses/connect/company/[slug].ts", "utf8");
  const api = readFileSync("functions/api/catalog/companies.ts", "utf8");
  const sitemap = readFileSync("functions/sitemap-connect-catalog.xml.ts", "utf8");
  const hub = readFileSync("functions/businesses/index.ts", "utf8");
  const provision = readFileSync("functions/api/internal/mzm-managed-client.ts", "utf8");
  const workflow = readFileSync(".github/workflows/mzm-managed-client.yml", "utf8");

  for (const source of [profile, api, sitemap, hub]) {
    expect(source).toContain("homeServiceCatalogPublication");
  }
  expect(profile).toContain("Hermes-managed client profile · public facts verified");
  expect(profile).toContain('rel="${managedByHermes ? "noopener" : "nofollow noopener"}"');
  expect(api).toContain("Hermes-managed client · public facts verified");
  expect(sitemap).toContain("homeServiceCatalogPublication(row).eligible");
  expect(hub).toContain("data-runtime-home-service-links");
  expect(hub).toContain("/businesses/connect/company/mzm-junk-removal/");
  expect(provision).toContain("MANAGED_HOME_SERVICE_PUBLICATION_BASIS");
  expect(provision).toContain('"verified_public"');
  expect(provision).toContain("catalog_publication_eligible: true");
  expect(provision).toContain("catalog_owner_consent_claimed: false");
  expect(workflow).toContain("hermes_managed_client_public_facts");
  expect(workflow).toContain("catalog_profile_not_public");
  expect(workflow).toContain("catalog_sitemap_publication_failed");
  expect(workflow).toContain("catalog_api_publication_failed");
});

test("Catalog UI labels managed MZM as verified client instead of owner-submitted", async ({ page }) => {
  await page.route("**/api/catalog/companies**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      count: 1,
      companies: [{
        id: "home-service-managed:mzm-junk-removal",
        companyName: "MZM Junk Removal",
        slug: "mzm-junk-removal",
        companyType: "home_service",
        subtype: "junk_removal",
        typeLabel: "Junk Removal & Hauling",
        city: "Roseville",
        state: "CA",
        countryCode: "US",
        status: "verified_public",
        source: "home_service_crm",
        profileUrl: "/businesses/connect/company/mzm-junk-removal/",
        services: ["Junk removal", "Garage cleanouts", "Furniture removal"],
        managementMode: "hermes_managed",
        publicationBasis: "hermes_managed_client_public_facts",
        verificationLabel: "Hermes-managed client · public facts verified",
        updatedAt: "2026-10-11T00:00:00.000Z",
      }],
    }),
  }));

  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  const card = page.locator('[data-catalog-entity-id="home-service-managed:mzm-junk-removal"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText("MZM Junk Removal");
  await expect(card).toContainText("Hermes-managed client · public facts verified");
  await expect(card).toContainText("Hermes-managed client · verified public facts");
  await expect(card.getByRole("link", { name: "View profile" })).toHaveAttribute("href", "/businesses/connect/company/mzm-junk-removal/");
  await expect(card).not.toContainText("owner-submitted");
});
