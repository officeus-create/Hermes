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

test("car-hauling dispatch routes commercial intent to the direct intake and repeats the CTA", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  const heroCta = page.locator("[data-commercial-primary-cta]").first();
  await expect(heroCta).toHaveAttribute("href", "/logistics/start-car-hauling-dispatch/");
  await expect(heroCta).not.toHaveAttribute("href", /load-board/);

  const finalCta = page.locator("[data-commercial-final-cta]");
  await expect(finalCta).toBeVisible();
  await expect(finalCta.getByRole("link", { name: /Start car-hauling dispatch review/i })).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );
  await expect(finalCta.getByRole("link", { name: /Email Logistics Sales/i })).toHaveAttribute(
    "href",
    "mailto:freight_301@hermeslogisticsus.com",
  );
  await expect(finalCta.getByRole("link", { name: /262.*302.*3626/i })).toHaveAttribute("href", "tel:+12623023626");
});

test("direct dispatch intake is noindex, qualified, privacy-safe, and separate from the demo", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && !isApprovedAnalyticsRequest(request.url())) {
      writes.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/logistics/start-car-hauling-dispatch/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  await expect(page.getByRole("heading", { name: "Start Your Car Hauling Dispatch Review" })).toBeVisible();
  await expect(page.getByText("Dry-run only")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Preview the Load Board demo/i })).toHaveCount(0);
  await expect(page.locator(".dispatch-start-actions").getByRole("link", { name: /Call Logistics Sales/i })).toHaveAttribute(
    "href",
    "tel:+12623023626",
  );
  await expect(page.locator("[data-dispatch-mobile-intake]")).toHaveAttribute("href", "#dispatch-intake");
  await expect(page.locator("[data-dispatch-mobile-call]")).toHaveAttribute("href", "tel:+12623023626");

  await page.evaluate(() => {
    window.dataLayer = [];
  });

  const form = page.locator("[data-dispatch-intake] [data-vehicle-form]");
  await form.locator('select[name="carrier_role"]').selectOption("owner_operator");
  await form.locator('input[name="carrier_company_name"]').fill("SEO4 Test Carrier LLC");
  await form.locator('input[name="carrier_contact_name"]').fill("SEO4 Test Driver");
  await form.locator('input[name="authority_number"]').fill("MC 123456");
  await form.locator('select[name="authority_status"]').selectOption("active");
  await form.locator('select[name="authority_age"]').selectOption("over_one_year");
  await form.locator('select[name="insurance_status"]').selectOption("active");
  await form.locator('select[name="fleet_size"]').selectOption("two_to_three");
  await form.locator('select[name="dispatch_status"]').selectOption("needs_dispatcher");
  await form.locator('input[name="vehicle_name"]').fill("3-car wedge");
  await form.locator('input[name="capacity_units"]').fill("3");
  await form.locator('input[name="available_from"]').fill(futureDate(7));
  await form.locator('input[name="origin_location"]').fill("Chicago, IL");
  await form.locator('input[name="origin_radius"]').fill("150");
  await form.locator('input[name="anywhere"]').check();
  await form.locator('input[name="carrier_email"]').fill("seo4@example.com");
  await form.locator('input[name="carrier_phone"]').fill("+1 (312) 555-0182");
  await form.locator('input[name="carrier_consent"]').check();

  await expect.poll(async () => (await analyticsEvents(page, "carrier_intake_start")).length).toBe(1);
  await form.getByRole("button", { name: "Review dispatch request" }).click();

  const result = page.locator("[data-dispatch-intake] [data-vehicle-result]");
  await expect(result).toBeVisible();
  await expect(result.locator("[data-vehicle-preview]")).toContainText("Hermes Car Hauling Dispatch");
  await expect(result.locator("[data-vehicle-preview]")).toContainText("Commercial source: DIRECT CAR HAULING DISPATCH INTAKE");
  await expect(result.locator("[data-vehicle-preview]")).toContainText("Current dispatch status: Needs dispatch service");
  await expect(result.locator("[data-vehicle-boundary]")).toContainText("Preview mode creates no account");
  await expect(result.getByRole("link", { name: "Open prepared email" })).toHaveAttribute("href", /^mailto:/);

  const starts = await analyticsEvents(page, "carrier_intake_start");
  const previews = await analyticsEvents(page, "carrier_intake_preview_ready");
  expect(starts).toHaveLength(1);
  expect(previews).toHaveLength(1);
  expect(starts[0]).toMatchObject({
    event: "carrier_intake_start",
    page_group: "commercial_dispatch_intake",
    service_group: "car_hauling_dispatch",
    page_path: "/logistics/start-car-hauling-dispatch/",
  });
  expect(previews[0]).toMatchObject({
    event: "carrier_intake_preview_ready",
    page_group: "commercial_dispatch_intake",
    preview_status: "dispatcher_review",
  });

  const serialized = JSON.stringify({ starts, previews });
  expect(serialized).not.toMatch(/SEO4 Test|seo4@example|312|555|0182|MC 123456|Chicago/i);
  expect(writes).toEqual([]);
});

test("Load Board demo labels cannot display stale calendar dates or fake recent posting times", async ({ page }) => {
  await page.goto("/load-board/?role=carrier#available-loads");

  const firstCard = page.locator("[data-demo-load-card]").first();
  await expect(firstCard).toHaveAttribute("data-demo-freshness-applied", "true");
  await expect(firstCard).toContainText("Demo day +1 · 8 AM–2 PM");
  await expect(firstCard).toContainText("Status");
  await expect(firstCard).toContainText("Illustrative demo");

  const cards = page.locator("[data-demo-load-card]");
  const text = await cards.allTextContents();
  expect(text.join(" ")).not.toMatch(/Jul\s+2[2-6]|min ago|hr ago/i);
});
