import { expect, test } from "@playwright/test";

const cases = [
  {
    route: "/paths/logistics/customers/vehicle-transport/",
    primary: "/logistics/request-vehicle-transport/?request=customer_delivery#transport-intake",
    primaryLabel: "Prepare vehicle transport request",
    demo: "/load-board/?role=private_party#post-load",
    demoLabel: "Preview customer Load Board demo",
    demoRole: "private_party",
    requestType: "customer_delivery",
    context: "vehicle, route, timing, condition, equipment preference, access, and contact",
  },
  {
    route: "/paths/logistics/customers/port-pickup/",
    primary: "/logistics/request-vehicle-transport/?request=other#transport-intake",
    primaryLabel: "Prepare port pickup request",
    demo: "/load-board/?role=private_party#post-load",
    demoLabel: "Preview customer Load Board demo",
    demoRole: "private_party",
    requestType: "other",
    context: "vehicle, route, release status, facility access, timing, storage risk, handling, and contact",
  },
  {
    route: "/paths/logistics/customers/luxury-classic-vehicle/",
    primary: "/logistics/request-vehicle-transport/?request=customer_delivery#transport-intake",
    primaryLabel: "Prepare specialty vehicle request",
    demo: "/load-board/?role=private_party#post-load",
    demoLabel: "Preview customer Load Board demo",
    demoRole: "private_party",
    requestType: "customer_delivery",
    context: "vehicle, route, timing, operability, handling, open or enclosed preference, access, and contact",
  },
  {
    route: "/paths/logistics/shippers-dealers/",
    primary: "/logistics/request-vehicle-transport/?request=dealer_inventory#transport-intake",
    primaryLabel: "Prepare dealer or shipper request",
    demo: "/load-board/?role=dealer#post-load",
    demoLabel: "Preview dealer Load Board demo",
    demoRole: "dealer",
    requestType: "dealer_inventory",
    context: "route, timing, vehicle count, condition, auction or dealer context, equipment preference, access, and contact",
  },
] as const;

for (const item of cases) {
  test(`${item.route} uses direct commercial intake and keeps demo secondary`, async ({ page }) => {
    await page.goto(item.route);

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.route}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
    const primaryLinks = page.locator("[data-recommendation-primary], [data-recommendation-primary-bottom]");
    await expect(primaryLinks).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(primaryLinks.nth(index)).toHaveAttribute("href", item.primary);
      await expect(primaryLinks.nth(index)).toContainText(item.primaryLabel);
    }
    await expect(page.locator("[data-recommendation-demo]")).toHaveAttribute("href", item.demo);
    await expect(page.locator("[data-recommendation-demo]")).toHaveText(item.demoLabel);
    await expect(page.getByRole("link", { name: "Email Logistics Sales" }).first()).toHaveAttribute("href", "mailto:officeus@hermeslogisticsus.com");
    await expect(page.locator("[data-customer-direct-intake]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Use direct intake for a real transportation request." })).toBeVisible();
    await expect(page.locator("[data-customer-direct-intake] p").last()).toHaveText(
      `The direct workspace collects ${item.context} for Logistics Sales review; it does not publish a load, notify carriers, reserve equipment, or book transport. The separate Load Board can show approved, active, unexpired source-gated records when available (which may be zero), alongside clearly labeled, non-bookable market-preview examples.`,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await expect(page.locator('[data-recommendation-primary][href*="/load-board/"]')).toHaveCount(0);
    await expect(page.locator('[data-recommendation-primary-bottom][href*="/load-board/"]')).toHaveCount(0);
  });

  test(`${item.route} clicks through to review and preserves demo role prefill`, async ({ page }) => {
    await page.goto(item.route);
    const origin = new URL(page.url()).origin;
    await page.locator("[data-recommendation-primary]").click();
    await expect(page).toHaveURL(`${origin}${item.primary}`);
    await expect(page.locator("#transport-intake [data-transport-form]")).toBeVisible();
    await expect(page.locator('select[name="request_type"]')).toHaveValue(item.requestType);
    await expect(page.locator('select[name="submitter_type"]')).toHaveValue(""); // These existing primary links have no role query.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

    await page.goto(item.route);
    await page.locator("[data-recommendation-demo]").click();
    await expect(page).toHaveURL(`${origin}${item.demo}`);
    await expect(page.locator('[data-load-board-form] select[name="submitter_type"]')).toHaveValue(item.demoRole);
  });
}
