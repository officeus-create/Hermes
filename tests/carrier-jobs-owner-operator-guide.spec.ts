import { expect, test } from "@playwright/test";

const guidePath = "/logistics/resources/car-hauler-jobs-owner-operator-guide/";

async function commercialEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.filter((item) => item.event === "commercial_cta_click") ?? [];
  });
}

async function lifecyclePathEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
    return analyticsWindow.dataLayer?.filter((item) => item.event === "carrier_lifecycle_path_click") ?? [];
  });
}

async function preventCommercialNavigation(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.addEventListener(
      "click",
      (event) => {
        const source = event.target;
        if (source instanceof Element && source.closest("a[data-commercial-primary-cta]")) event.preventDefault();
      },
      { capture: true },
    );
  });
}

test("car-hauler jobs guide separates employment from operating-carrier intent", async ({ page }) => {
  await page.goto(guidePath);

  await expect(page).toHaveTitle("Car Hauler Jobs & Owner-Operator Paths | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/car-hauler-jobs-owner-operator-guide/",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Car Hauler Jobs vs Owner-Operator Carrier Work: Which Path Fits?",
  );

  await expect(page.getByRole("link", { name: "Looking for employment?" })).toHaveAttribute(
    "href",
    "/logistics/careers/",
  );
  await expect(page.getByRole("link", { name: /Open carrier fit review/i }).first()).toHaveAttribute(
    "href",
    "/logistics/start-car-hauling-dispatch/",
  );
});

test("car-hauler jobs guide keeps compensation and availability boundaries explicit", async ({ page }) => {
  await page.goto(guidePath);

  const main = await page.locator("main").innerText();
  expect(main).toContain("Do not compare salary with carrier gross revenue.");
  expect(main).toContain("Current Hermes employee openings, when available, belong on the careers pages—not in the carrier intake.");
  expect(main).toContain("does not guarantee acceptance, freight, rates, miles, utilization, profit, or revenue");
  expect(main).not.toMatch(/guaranteed loads|guaranteed revenue|guaranteed salary/i);

  await page.getByText("Is this page a list of current car hauler job openings?", { exact: true }).click();
  await expect(page.getByText(/The carrier intake is a business-to-business review and is not an employment application/i)).toBeVisible();

  await expect(page.getByRole("link", { name: /Owner-operator dispatch support/i })).toHaveAttribute(
    "href",
    "/logistics/owner-operator-dispatch-support/",
  );
  await expect(page.getByRole("link", { name: /New-authority readiness/i })).toHaveAttribute(
    "href",
    "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  );
  await expect(page.getByRole("link", { name: /RPM & profitability calculator/i })).toHaveAttribute(
    "href",
    "/logistics/resources/rpm-calculator/",
  );
});

test("owner-operator commercial owner links back to the early-intent guide", async ({ page }) => {
  await page.goto("/logistics/owner-operator-dispatch-support/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Car Hauler Owner-Operator Dispatch Support");
  await expect(page.getByRole("link", { name: "Car Hauler Jobs vs Owner-Operator Paths" })).toHaveAttribute("href", guidePath);
});

test("car-hauler jobs guide attributes carrier-intake clicks to the pilot owner", async ({ page }) => {
  await page.goto(guidePath);
  await page.evaluate(() => {
    window.dataLayer = [];
  });
  await preventCommercialNavigation(page);

  const intakeCtas = page.locator('a[href="/logistics/start-car-hauling-dispatch/"][data-commercial-primary-cta]');
  await expect(intakeCtas).toHaveCount(3);
  await expect(intakeCtas.first()).toHaveAttribute("data-service-group", "carrier_lifecycle_guide");
  await intakeCtas.first().click();

  await expect.poll(async () => (await commercialEvents(page)).length).toBe(1);
  expect((await commercialEvents(page))[0]).toMatchObject({
    event: "commercial_cta_click",
    cta_type: "carrier_intake",
    audience_type: "carrier",
    page_group: "logistics_service",
    service_group: "carrier_lifecycle_guide",
    page_path: guidePath,
    destination_path: "/logistics/start-car-hauling-dispatch/",
  });
});

test("car-hauler jobs guide measures early-intent routing without changing canonical ownership", async ({ page }) => {
  await page.goto(guidePath);
  await page.evaluate(() => {
    localStorage.setItem("hermes-analytics-consent", "granted");
    window.dataLayer = [];
    document.addEventListener(
      "click",
      (event) => {
        const source = event.target;
        if (source instanceof Element && source.closest("a[data-carrier-lifecycle-path]")) event.preventDefault();
      },
      { capture: true },
    );
  });

  const employment = page.locator('a[data-carrier-lifecycle-path="employment"][data-carrier-lifecycle-position="hero"]');
  const ownerOperator = page.locator('a[data-carrier-lifecycle-path="owner_operator"]');
  const newAuthority = page.locator('a[data-carrier-lifecycle-path="new_authority"]');
  const loadBoard = page.locator('a[data-carrier-lifecycle-path="load_board"]');

  await expect(employment).toHaveAttribute("href", "/logistics/careers/");
  await expect(ownerOperator).toHaveAttribute("href", "/paths/logistics/carriers/owner-operators/");
  await expect(newAuthority).toHaveAttribute("href", "/logistics/new-authority-car-hauler-support/");
  await expect(loadBoard).toHaveAttribute("href", "/load-board/?role=carrier&equipment=car_hauler#available-loads");

  await employment.click();
  await ownerOperator.click();
  await newAuthority.click();
  await loadBoard.click();

  await expect.poll(async () => (await lifecyclePathEvents(page)).length).toBe(4);
  expect(await lifecyclePathEvents(page)).toEqual([
    expect.objectContaining({ path_choice: "employment", path_position: "hero", page_path: guidePath, destination_path: "/logistics/careers/" }),
    expect.objectContaining({ path_choice: "owner_operator", path_position: "intent_router", page_path: guidePath, destination_path: "/paths/logistics/carriers/owner-operators/" }),
    expect.objectContaining({ path_choice: "new_authority", path_position: "intent_router", page_path: guidePath, destination_path: "/logistics/new-authority-car-hauler-support/" }),
    expect.objectContaining({ path_choice: "load_board", path_position: "related_resources", page_path: guidePath, destination_path: "/load-board/" }),
  ]);
});
