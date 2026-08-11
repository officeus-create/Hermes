import { expect, test, type Page } from "@playwright/test";

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

async function analyticsEvents(page: Page, eventName: string) {
  return page.evaluate((name) => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.filter((item) => item.event === name) ?? [];
  }, eventName);
}

const isApprovedAnalyticsRequest = (url: string) =>
  url.includes("google-analytics.com") || url.includes("googletagmanager.com");

test("dealer and auction commercial pages route buyers to direct transport intake", async ({ page }) => {
  await page.goto("/logistics/dealer-vehicle-transportation/");
  await expect(page.locator("[data-commercial-primary-cta]").first()).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=dealer&request=dealer_inventory#transport-intake",
  );
  await expect(page.getByText("Can I prepare a Copart, IAA, or Manheim pickup request?")).toBeVisible();
  await expect(page.locator("[data-commercial-final-cta]")).toContainText("Prepare a dealer transport request");

  await page.goto("/logistics/auction-vehicle-pickup/");
  await expect(page.locator("[data-commercial-primary-cta]").first()).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=dealer&request=auction_pickup#transport-intake",
  );
  const auctionFaq = page.locator("details").filter({ hasText: "Can I submit a Copart, IAA, or Manheim pickup?" });
  await expect(auctionFaq.locator("summary")).toBeVisible();
  await auctionFaq.locator("summary").click();
  await expect(auctionFaq).toContainText("Hermes is not affiliated with Copart, IAA, or Manheim");
});

test("shipper, broker, and carrier audience pages use direct role-specific commercial paths", async ({ page }) => {
  await page.goto("/logistics/shipper-dealer/");
  await expect(page.getByRole("link", { name: "Prepare transport request" }).first()).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=shipper#transport-intake",
  );
  await expect(page.getByRole("link", { name: /Post a load in the Load Board demo/i }).first()).toHaveAttribute(
    "href",
    "/load-board/?role=shipper#post-load",
  );
  await expect(page.locator(".logistics-audience-final")).toContainText("Prepare transport request");

  await page.goto("/logistics/broker/");
  await expect(page.getByRole("link", { name: "Prepare broker opportunity" }).first()).toHaveAttribute(
    "href",
    "/logistics/request-vehicle-transport/?role=broker#transport-intake",
  );
  await expect(page.getByRole("link", { name: /Open broker Load Board demo/i }).first()).toHaveAttribute(
    "href",
    "/load-board/?role=broker#post-load",
  );

  await page.goto("/logistics/carrier/");
  await expect(page.getByRole("link", { name: "Start dispatch review" }).first()).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );
  await expect(page.getByRole("link", { name: /Open Load Board demo/i }).first()).toHaveAttribute(
    "href",
    "/load-board/?role=carrier#available-loads",
  );
});

test("direct auction request is noindex, preselected, reviewable, and privacy-safe", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/logistics/request-vehicle-transport/?role=dealer&request=auction_pickup#transport-intake");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  await expect(page.getByRole("heading", { name: "Request a Vehicle Transportation Review" })).toBeVisible();
  await expect(page.locator('select[name="submitter_type"]')).toHaveValue("dealer");
  await expect(page.locator('select[name="request_type"]')).toHaveValue("auction_pickup");
  await expect(page.getByText(/does not claim affiliation with those companies/i)).toBeVisible();

  await page.evaluate(() => {
    window.dataLayer = [];
  });

  const form = page.locator("[data-transport-form]");
  await form.locator('input[name="company_name"]').fill("SEO4 Dealer Test LLC");
  await form.locator('input[name="contact_name"]').fill("SEO4 Dealer Contact");
  await form.locator('input[name="email"]').fill("dealer-seo4@example.com");
  await form.locator('input[name="phone"]').fill("+1 (414) 555-0199");
  await form.locator('input[name="pickup_location"]').fill("Copart Milwaukee South, WI");
  await form.locator('input[name="delivery_location"]').fill("Madison, WI");
  await form.locator('input[name="ready_date"]').fill(futureDate(5));
  await form.locator('select[name="request_frequency"]').selectOption("repeat");
  await form.locator('select[name="commodity_type"]').selectOption("passenger_vehicle");
  await form.locator('input[name="year_make_model"]').fill("Two operable sedans");
  await form.locator('input[name="quantity"]').fill("2");
  await form.locator('select[name="condition"]').selectOption("operable");
  await form.locator('select[name="equipment_preference"]').selectOption("open");
  await form.locator('select[name="auction_source"]').selectOption("copart");
  await form.locator('select[name="release_status"]').selectOption("ready");
  await form.locator('input[name="storage_deadline"]').fill(futureDate(8));
  await form.locator('input[name="notes"]').fill("Pickup weekdays before 3 PM; keys confirmed.");
  await form.locator('input[name="consent"]').check();

  await expect.poll(async () => (await analyticsEvents(page, "vehicle_transport_intake_start")).length).toBe(1);
  await form.getByRole("button", { name: "Review transport request" }).click();

  const result = page.locator("[data-transport-result]");
  await expect(result).toBeVisible();
  await expect(result.locator("[data-transport-decision]")).toHaveText("approved");
  await expect(result.locator("[data-transport-preview]")).toContainText("Hermes Vehicle Transportation");
  await expect(result.locator("[data-transport-preview]")).toContainText("Request type: auction pickup");
  await expect(result.locator("[data-transport-preview]")).toContainText("Auction/facility context: copart");
  await expect(result.locator("[data-transport-preview]")).toContainText("Equipment preference: open");
  await expect(result.locator("[data-transport-preview]")).toContainText("Request frequency: repeat");
  await expect(result.locator("[data-transport-boundary]")).toContainText("Preview mode creates no booking");
  const preparedEmail = result.getByRole("link", { name: "Open prepared email" });
  await expect(preparedEmail).toHaveAttribute("href", /^mailto:officeus@hermeslogisticsus\.com/);
  await expect(preparedEmail).not.toHaveAttribute("href", /^mailto:freight_301@hermeslogisticsus\.com/);

  const starts = await analyticsEvents(page, "vehicle_transport_intake_start");
  const previews = await analyticsEvents(page, "vehicle_transport_preview_ready");
  expect(starts).toHaveLength(1);
  expect(previews).toHaveLength(1);
  expect(previews[0]).toMatchObject({
    event: "vehicle_transport_preview_ready",
    page_group: "commercial_transport_intake",
    service_group: "vehicle_transportation",
    submitter_group: "dealer",
    preview_status: "approved",
  });

  const serialized = JSON.stringify({ starts, previews });
  expect(serialized).not.toMatch(/SEO4 Dealer|dealer-seo4|414|555|0199|Copart Milwaukee|Madison|sedans|keys/i);
  expect(writes).toEqual([]);
});