import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/search-opportunity-radar/";
const privateQuery = "PRIVATE-SYNTHETIC-QUERY-DO-NOT-TRACK";

test("Search Opportunity Radar classifies sanitized evidence without transmitting rows", async ({ page }) => {
  const writeRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.method() !== "HEAD") writeRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.goto(route);
  await expect(page).toHaveTitle("Search Opportunity Radar · Hermes Connect");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { level: 1, name: "Search Opportunity Radar" })).toBeVisible();
  await expect(page.getByText(/It does not manufacture pages/i)).toBeVisible();

  await page.getByRole("button", { name: "Load synthetic example" }).click();
  await expect(page.locator("[data-search-radar-results]")).toBeVisible();
  await expect(page.locator("[data-search-radar-summary]")).toContainText("4 rows classified");

  const table = page.locator("[data-search-radar-body]");
  await expect(table).toContainText("seo for logistics companies");
  await expect(table).toContainText("POSITION_OPPORTUNITY · KEEP_OWNER");
  await expect(table).toContainText("car hauler load board");
  await expect(table).toContainText("/load-board/");
  await expect(table).toContainText("appleton warehousing services");
  await expect(table).toContainText("INTENT_MISMATCH · NEW_PAGE_NOT_JUSTIFIED");

  const customCsv = `query,page,clicks,impressions,ctr,position,date_range,country_bucket,device_bucket\n${privateQuery},/,0,4,0%,70,synthetic,USA,desktop`;
  await page.locator("[data-search-radar-input]").fill(customCsv);
  await page.getByRole("button", { name: "Classify opportunities" }).click();
  await expect(table).toContainText(privateQuery);
  await expect(table).toContainText("LOW_PRIORITY");

  const analytics = await page.evaluate(() => JSON.stringify((window as any).dataLayer ?? []));
  expect(analytics).toContain("search_radar_start");
  expect(analytics).toContain("search_radar_import_complete");
  expect(analytics).toContain("search_radar_classification_view");
  expect(analytics).not.toContain(privateQuery);
  expect(writeRequests).toEqual([]);

  const handoff = page.locator("[data-search-radar-action]").first();
  await expect(handoff).toHaveAttribute("href", "https://hermeslogisticsus.com/paths/marketing/?service=logistics_seo#contact");
});

test("Search Opportunity Radar rejects private and unsupported columns", async ({ page }) => {
  await page.goto(route);

  await page.locator("[data-search-radar-input]").fill(
    "query,page,clicks,impressions,ctr,position,email\nseo services,/services/seo/,0,10,0%,8,test@example.com",
  );
  await page.getByRole("button", { name: "Classify opportunities" }).click();
  await expect(page.locator("[data-search-radar-error]")).toBeVisible();
  await expect(page.locator("[data-search-radar-error]")).toContainText("Private or prohibited column: email");
  await expect(page.locator("[data-search-radar-results]")).toBeHidden();

  await page.locator("[data-search-radar-input]").fill(
    "query,page,clicks,impressions,ctr,position,unexpected\nseo services,/services/seo/,0,10,0%,8,x",
  );
  await page.getByRole("button", { name: "Classify opportunities" }).click();
  await expect(page.locator("[data-search-radar-error]")).toContainText("Unsupported column: unexpected");
});

test("Search Opportunity Radar exposes CTR and wrong-owner decisions", async ({ page }) => {
  await page.goto(route);
  const csv = `query,page,clicks,impressions,ctr,position\nseo services,/services/seo/,0,10,0.5%,8\nlogistics seo agency,/services/seo/,0,20,0%,42`;
  await page.locator("[data-search-radar-input]").fill(csv);
  await page.getByRole("button", { name: "Classify opportunities" }).click();

  const table = page.locator("[data-search-radar-body]");
  await expect(table).toContainText("CTR_PROBLEM · KEEP_OWNER");
  await expect(table).toContainText("INTENT_MISMATCH · INTERNAL_LINK_GAP");
  await expect(table).toContainText("/services/seo-for-logistics-companies/");
});
