import { expect, test } from "@playwright/test";

test.skip(!process.env.HERMES_PRODUCTION_URL, "production-only smoke; local regression has no Cloudflare API runtime");

test("production Catalog reconciles public CRM profiles with the single v2 runtime", async ({ page }) => {
  const pageErrors: string[] = [];
  const failedCatalogRequests: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.includes("/api/catalog/companies") || url.includes("/catalog-connect-live")) {
      failedCatalogRequests.push(`${url}: ${request.failure()?.errorText ?? "request failed"}`);
    }
  });

  const catalogResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      new URL(response.url()).pathname === "/api/catalog/companies",
  );

  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });

  const response = await catalogResponse;
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  expect(payload?.success).toBe(true);

  const companies = Array.isArray(payload?.companies)
    ? payload.companies.filter(
        (company: { companyType?: unknown; profileUrl?: unknown; countryCode?: unknown }) =>
          company?.companyType === "repair_shop" && String(company?.countryCode || "").trim().toUpperCase() === "US" && typeof company?.profileUrl === "string" && company.profileUrl,
      )
    : [];

  const runtimeOwners = await page
    .locator('script[src*="catalog-connect-live"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  expect(runtimeOwners).toEqual(["/catalog-connect-live.v2.js"]);

  for (const company of companies) {
    await expect(page.locator(`a[href="${company.profileUrl}"]`).first()).toBeVisible();
  }

  const cards = page.locator("[data-catalog-grid] [data-catalog-card]");
  await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(companies.length);
  const renderedCount = await cards.count();

  const publishedCount = page.locator("[data-catalog-business-count]").first();
  await expect
    .poll(async () => Number((await publishedCount.textContent())?.trim() || "0"))
    .toBe(renderedCount);

  expect(failedCatalogRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});
