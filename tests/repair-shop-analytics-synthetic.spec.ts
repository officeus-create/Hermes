import { expect, test, type Page } from "@playwright/test";

type AnalyticsEvent = { name?: string; synthetic?: boolean; [key: string]: unknown };

async function installObserver(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("hermes-analytics-consent", "granted");
    (window as any).__repairAnalyticsEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      if (event instanceof CustomEvent) (window as any).__repairAnalyticsEvents.push(event.detail);
    });
  });
}

function shopPayload(synthetic: boolean) {
  return {
    success: true,
    synthetic,
    shop: {
      id: synthetic ? "shop-synthetic" : "shop-real",
      name: synthetic ? "Synthetic Test Shop" : "Real Test Fixture Shop",
      slug: synthetic ? "synthetic-shop" : "real-shop",
      phone: null,
      address_line1: null,
      city: "Test City",
      state: "WI",
      postal_code: null,
      timezone: "America/Chicago",
    },
    services: [],
    availability: [],
    capabilities: {},
    driver_discount: { enabled: false },
  };
}

async function analyticsState(page: Page) {
  return page.evaluate(() => {
    const events = ((window as any).__repairAnalyticsEvents || []) as AnalyticsEvent[];
    const local = events.find((event) => event?.name === "hc_repair_public_booking_opened") || null;
    const layer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const ga4ObjectEvent = layer.some((item: any) => item?.event === "hc_repair_public_booking_opened");
    const ga4ArgumentEvent = layer.some((item: any) => {
      if (!item || typeof item !== "object" || !("length" in item)) return false;
      const args = Array.from(item as ArrayLike<unknown>);
      return args[0] === "event" && args[1] === "hc_repair_public_booking_opened";
    });
    return { local, ga4ObjectEvent, ga4ArgumentEvent };
  });
}

test("synthetic Repair booking open stays local and is excluded from GA4", async ({ page }) => {
  await installObserver(page);
  await page.route("**/api/public/repair-shop?slug=synthetic-shop", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload(true)) }),
  );
  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=synthetic-shop");
  await expect(page.locator("#shop-title")).toHaveText("Synthetic Test Shop");
  await expect.poll(() => analyticsState(page)).toMatchObject({
    local: { name: "hc_repair_public_booking_opened", synthetic: true },
    ga4ObjectEvent: false,
    ga4ArgumentEvent: false,
  });
});

test("real Repair booking open keeps the existing GA4 path", async ({ page }) => {
  await installObserver(page);
  await page.route("**/api/public/repair-shop?slug=real-shop", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload(false)) }),
  );
  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=real-shop");
  await expect(page.locator("#shop-title")).toHaveText("Real Test Fixture Shop");
  await expect.poll(() => analyticsState(page)).toMatchObject({
    local: { name: "hc_repair_public_booking_opened", synthetic: false },
    ga4ObjectEvent: true,
    ga4ArgumentEvent: true,
  });
});
