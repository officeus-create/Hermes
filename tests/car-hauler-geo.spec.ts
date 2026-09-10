import { expect, test, type Page } from "@playwright/test";

async function analyticsEvents(page: Page, eventName: string) {
  return page.evaluate((name) => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.filter((item) => item.event === name) ?? [];
  }, eventName);
}

test("car-hauler GEO hub exposes exactly 25 indexable market links with one commercial owner", async ({ page }) => {
  await page.goto("/logistics/car-hauler-loads/");

  await expect(page).toHaveTitle(/Car Hauler Load Search & Dispatch by U\.S\. Market/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/car-hauler-loads/",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Car Hauler Load Search & Dispatch by U.S. Market");

  const marketLinks = page.locator('a[href^="/logistics/car-hauler-loads/"][data-carrier-geo-cta="market_select"]');
  await expect(marketLinks).toHaveCount(25);
  await expect(page.getByRole("link", { name: /Colorado Springs, CO/i })).toHaveAttribute("href", "/logistics/car-hauler-loads/colorado-springs-co/");
  await expect(page.getByRole("link", { name: /Puyallup, WA/i })).toHaveAttribute("href", "/logistics/car-hauler-loads/puyallup-wa/");

  const primary = page.locator('[data-commercial-primary-cta][data-service-group="car_hauler_geo"]').first();
  await expect(primary).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  await expect(page.getByRole("link", { name: /Plans & carrier agreement/i })).toHaveAttribute("href", "/carrier/");

  const body = await page.locator("main").innerText();
  expect(body).toContain("do not claim Hermes offices in those cities");
  expect(body).not.toMatch(/260 loads|256 loads|OFFICE 374|MC\s*\d{4,}/i);
});

test("Colorado Springs GEO page answers carrier load-search intent without publishing private route evidence", async ({ page }) => {
  await page.goto("/logistics/car-hauler-loads/colorado-springs-co/");

  await expect(page).toHaveTitle(/Car Hauler Loads in Colorado Springs, CO/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/logistics/car-hauler-loads/colorado-springs-co/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Looking for Car Hauler Loads in Colorado Springs, CO?");
  const marketContext = page.locator(".carrier-geo-market-card");
  await expect(marketContext.getByText(/Colorado Springs sits on Colorado's Front Range/)).toBeVisible();
  await expect(marketContext.getByText("Fountain, CO")).toBeVisible();
  await expect(marketContext.getByText("Pueblo, CO")).toBeVisible();

  await expect(page.getByRole("heading", { name: /First keep the truck moving/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Here-and-now load search" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Multi-source search + back office" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Direct demand development" })).toBeVisible();

  await expect(page.getByText("Central Dispatch", { exact: true })).toBeVisible();
  await expect(page.getByText("Super Dispatch", { exact: true })).toBeVisible();
  await expect(page.getByText("Ship.Cars Carrier Market", { exact: true })).toBeVisible();
  await expect(page.getByText("CarsArrive Network", { exact: true })).toBeVisible();
  await expect(page.getByText("RunBuggy", { exact: true })).toBeVisible();
  await expect(page.getByText(/does not claim a partnership, automatic access/i)).toBeVisible();

  const supportItems = page.locator(".carrier-geo-support-list > li");
  await expect(supportItems).toHaveCount(20);
  await expect(page.getByRole("link", { name: /Preview Load Board/i })).toHaveAttribute("href", "/load-board/#available-loads");
  await expect(page.getByText(/illustrative\/demo surface/i)).toBeVisible();
  await expect(page.getByText(/discounts, parts offers, or partner benefits are shown only/i)).toBeVisible();

  const body = await page.locator("main").innerText();
  expect(body).not.toMatch(/259|260\+|OFFICE 374|Autobidmaster|Carvana|customer ID/i);
});

test("carrier GEO pages wait for explicit analytics consent, then emit privacy-safe GA4-reportable depth and CTA events once", async ({ page }) => {
  await page.goto("/logistics/car-hauler-loads/puyallup-wa/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Looking for Car Hauler Loads in Puyallup, WA?");
  const marketContext = page.locator(".carrier-geo-market-card");
  await expect(marketContext.getByText(/Puyallup is a useful South Puget Sound operating point/)).toBeVisible();
  await expect(marketContext.getByText("Tacoma, WA")).toBeVisible();
  await expect(marketContext.getByText("Auburn, WA")).toBeVisible();

  expect(await analyticsEvents(page, "carrier_geo_page_view")).toHaveLength(0);
  expect(await analyticsEvents(page, "carrier_geo_section_view")).toHaveLength(0);
  expect(await analyticsEvents(page, "carrier_geo_reach_hero")).toHaveLength(0);
  await expect(page.locator("html")).toHaveAttribute("data-analytics-consent", "denied");

  await page.locator("[data-consent-settings]").click();
  await expect(page.locator("[data-consent-banner]")).toBeVisible();
  await page.locator("[data-consent-accept]").click();
  await expect(page.locator("html")).toHaveAttribute("data-analytics-consent", "granted");

  await expect.poll(async () => (await analyticsEvents(page, "carrier_geo_page_view")).length).toBe(1);
  await page.locator('[data-carrier-geo-section="hero"]').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await analyticsEvents(page, "carrier_geo_section_view")).length).toBeGreaterThan(0);
  await expect.poll(async () => (await analyticsEvents(page, "carrier_geo_reach_hero")).length).toBe(1);

  await page.evaluate(() => { document.documentElement.dataset.analyticsConsent = "granted"; });
  await expect.poll(async () => (await analyticsEvents(page, "carrier_geo_page_view")).length).toBe(1);

  await page.evaluate(() => {
    document.addEventListener("click", (event) => {
      const source = event.target;
      if (source instanceof Element && source.closest('[data-carrier-geo-cta="start_review"]')) event.preventDefault();
    }, true);
  });
  await page.locator('[data-carrier-geo-cta="start_review"]').first().click();

  const geoCtas = await analyticsEvents(page, "carrier_geo_cta_click");
  const reportableStartReview = await analyticsEvents(page, "carrier_geo_click_start_review");
  const commercialCtas = await analyticsEvents(page, "commercial_cta_click");
  expect(geoCtas).toHaveLength(1);
  expect(reportableStartReview).toHaveLength(1);
  expect(geoCtas[0]).toMatchObject({ event: "carrier_geo_cta_click", cta_type: "start_review", audience_type: "carrier", page_group: "car_hauler_geo", service_group: "car_hauler_geo", page_path: "/logistics/car-hauler-loads/puyallup-wa/", destination_path: "/logistics/start-car-hauling-dispatch/" });
  expect(reportableStartReview[0]).toMatchObject({ event: "carrier_geo_click_start_review", cta_type: "start_review", page_path: "/logistics/car-hauler-loads/puyallup-wa/" });
  expect(commercialCtas).toHaveLength(1);
  expect(commercialCtas[0]).toMatchObject({ event: "commercial_cta_click", cta_type: "carrier_intake", page_group: "car_hauler_geo", service_group: "car_hauler_geo" });

  const serialized = JSON.stringify({ geoCtas, reportableStartReview, commercialCtas });
  expect(serialized).not.toMatch(/MC\s*\d+|USDOT\s*\d+|@|\+1|Puyallup.*Tacoma/i);
});
