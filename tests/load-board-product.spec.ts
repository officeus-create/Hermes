import { expect, test } from "@playwright/test";

test("main navigation uses the four clear business labels", async ({ page, isMobile }) => {
  await page.goto("/paths/technology/");

  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }

  const nav = page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Primary navigation" });
  await expect(nav.getByRole("link", { name: "Logistics", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Marketing", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Academy", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "IT", exact: true })).toHaveAttribute("href", "/paths/technology/");
});

test("Logistics exposes canonical Load Board first and keeps the audience hierarchy clear", async ({ page }) => {
  await page.goto("/paths/logistics/");

  const nav = page.getByRole("navigation", { name: "Hermes Logistics products and audiences" });
  await expect(nav).toBeVisible();
  const loadBoard = nav.getByRole("link", { name: "Load Board", exact: true });
  await expect(loadBoard).toBeVisible();
  await expect(loadBoard).toHaveAttribute("href", "/load-board/");
  await expect(loadBoard).toHaveAttribute("data-logistics-product-link", "load-board");
  await expect(nav.getByRole("link", { name: "Carriers & Fleets" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Agreement", exact: true })).toHaveAttribute("href", "/carrier/");
  await expect(nav.getByRole("link", { name: "Owner-Operators" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Brokers" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Shippers & Dealers" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Dispatch & Back Office" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Find freight without getting lost in the freight market." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Hermes Load Board/ })).toHaveAttribute("href", "/load-board/");
});

test("IT presents canonical Load Board as a Hermes software product", async ({ page }) => {
  await page.goto("/paths/technology/");
  await expect(page.getByRole("heading", { name: "Load Board is one of the products we build and operate." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Hermes Load Board/ })).toHaveAttribute("href", "/load-board/");
});

test("canonical Load Board renders approved live loads and capacity from separate APIs", async ({ page }) => {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await page.route("**/api/load-board/active?type=load", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ records: [{
        id: "hlr-live-test-load",
        type: "load",
        equipment: "car_hauler",
        origin: "Chicago, IL",
        destination: "Miami, FL",
        pickupWindow: "Today",
        rateAmount: 3200,
        rateCurrency: "USD",
        source: "Approved Broker",
        observedAt: now,
        expiresAt: future,
      }] }),
    });
  });

  await page.route("**/api/load-board/active?type=capacity", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ records: [{
        id: "hlr-live-test-capacity",
        type: "capacity",
        equipment: "dry_van",
        origin: "Williamsburg, VA",
        destination: null,
        pickupWindow: "Ready now",
        source: "Approved Carrier",
        observedAt: now,
        expiresAt: future,
      }] }),
    });
  });

  await page.goto("/load-board/");
  const live = page.locator("[data-hlb-live-marketplace]");
  await expect(live).toBeVisible();
  await expect(live.locator("[data-live-load-count]")).toHaveText("1");
  await expect(live.locator("[data-live-capacity-count]")).toHaveText("1");
  await expect(live.getByText("Chicago, IL")).toBeVisible();
  await expect(live.getByText("Miami, FL")).toBeVisible();
  await expect(live.getByText("Williamsburg, VA")).toBeVisible();
  await expect(live.getByRole("link", { name: "Agreement & onboarding" })).toHaveAttribute("href", "/carrier/");
});

test("Load Board v1 pilot still shows multiple equipment types and keeps private operational data gated", async ({ page }) => {
  await page.goto("/load-board/live-pilot/");

  await expect(page).toHaveTitle("Hermes Load Board | Live Freight Marketplace Pilot");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: "Live freight. One board. Less deadhead." })).toBeVisible();

  const equipment = page.locator(".hlb-equipment-grid");
  for (const label of ["Dry Van", "Reefer", "Flatbed", "Step Deck", "Hotshot", "Car Hauler"]) {
    await expect(equipment.getByText(label, { exact: true })).toBeVisible();
  }

  await expect(page.getByText("Preview rows are clearly marked.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Request Load Board access/ })).toHaveAttribute("href", "/load-board/?role=carrier#carrier-access");

  const body = await page.locator("body").innerText();
  expect(body).not.toContain("Tina Bloom");
  expect(body).not.toContain("tina.bloom.truckload@gmail.com");
});

test("Load Board v1 pilot filters preview equipment without creating operational writes", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(`${request.method()} ${request.url()}`);
  });

  await page.goto("/load-board/live-pilot/");
  const filter = page.locator('select[name="equipment"]');
  await filter.selectOption("reefer");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.locator(".hlb-row:visible")).toHaveCount(1);
  await expect(page.locator(".hlb-row:visible")).toContainText("Reefer");
  expect(writes).toEqual([]);
});