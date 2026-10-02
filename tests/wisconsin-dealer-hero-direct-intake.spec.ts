import { expect, test } from "@playwright/test";

const cases = [
  {
    path: "/logistics/wisconsin-dealer-vehicle-transport/",
    href: "/logistics/request-vehicle-transport/?role=dealer&request=dealer_inventory#transport-intake",
    label: "Prepare a dealer transport request",
    secondaryHref: "/logistics/wisconsin-multi-vehicle-dealer-transport/",
    guarantee: "Submission begins a review and does not guarantee a carrier, price, equipment, or pickup window.",
    serviceGroup: "wisconsin_dealer_vehicle_transport",
    equipment: null,
  },
  {
    path: "/logistics/wisconsin-multi-vehicle-dealer-transport/",
    href: "/logistics/request-vehicle-transport/?role=dealer&request=dealer_inventory&equipment=multi_car#transport-intake",
    label: "Prepare a multi-vehicle request",
    secondaryHref: "/logistics/wisconsin-dealer-vehicle-transport/",
    guarantee: "Vehicle count does not guarantee one truck or one pickup window.",
    serviceGroup: "wisconsin_multi_vehicle_dealer_transport",
    equipment: "multi_car",
  },
] as const;

for (const item of cases) {
  test(`${item.serviceGroup} hero reaches the direct dealer review form`, async ({ page }) => {
    const analyticsRequests: string[] = [];
    page.on("request", (request) => {
      if (/google-analytics\.com|googletagmanager\.com|\/api\/analytics/.test(request.url())) {
        analyticsRequests.push(request.url());
      }
    });

    await page.goto(item.path);
    const hero = page.locator(".logistics-audience-actions");
    const cta = hero.locator("a.button-primary");
    await expect(cta).toHaveText(item.label);
    await expect(cta).toHaveAttribute("href", item.href);
    await expect(cta).toHaveAttribute("data-commercial-primary-cta", "");
    await expect(cta).toHaveAttribute("data-service-group", item.serviceGroup);
    await expect(hero.locator("a.button:not(.button-primary)")).toHaveAttribute("href", item.secondaryHref);
    await expect(page.locator(".logistics-audience-actions + p")).toHaveText(item.guarantee);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.path}`);

    // The existing delegated listener runs first. Retain its controlled event through same-origin navigation.
    await page.evaluate(() => {
      window.dataLayer = [];
      document.addEventListener("click", (event) => {
        if (!event.isTrusted || !(event.target instanceof Element) || !event.target.closest(".logistics-audience-actions a[data-commercial-primary-cta]")) return;
        sessionStorage.setItem(
          "wisconsinDealerHeroClickEvents",
          JSON.stringify(window.dataLayer?.filter((entry: { event?: string }) => entry.event === "commercial_cta_click") ?? []),
        );
      }, { once: true });
    });

    await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await cta.click();
    await expect(page).toHaveURL(new RegExp(`${item.href.replace(/[?]/g, "\\?")}$`));
    await expect(page.locator("#transport-intake [data-transport-form]")).toBeVisible();
    await expect(page.locator('select[name="submitter_type"]')).toHaveValue("dealer");
    await expect(page.locator('select[name="request_type"]')).toHaveValue("dealer_inventory");
    if (item.equipment) {
      await expect(page.locator('select[name="equipment_preference"]')).toHaveValue(item.equipment);
    }
    await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

    const events = await page.evaluate(() => JSON.parse(sessionStorage.getItem("wisconsinDealerHeroClickEvents") ?? "[]"));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      event: "commercial_cta_click",
      cta_type: "vehicle_transport_intake",
      audience_type: "dealer",
      page_group: "logistics_service",
      service_group: item.serviceGroup,
      request_type: "dealer_inventory",
      page_path: item.path,
      destination_path: "/logistics/request-vehicle-transport/",
    });
    expect(analyticsRequests).toEqual([]); // Default e2e storage state denies analytics consent.
  });
}
