import { expect, test } from "@playwright/test";

const calculatorPath = "/logistics/resources/rpm-calculator/";

test("RPM calculator returns transparent trip-economics estimates", async ({ page }) => {
  await page.goto(calculatorPath);

  await expect(page).toHaveTitle(/Free RPM & Load Profit Calculator for Carriers/);
  await expect(page.getByRole("heading", { level: 1, name: "RPM & Load Profitability Calculator" })).toBeVisible();

  await expect(page.locator('[data-output="grossLoadedRpm"]')).toHaveText("$3.00/mi");
  await expect(page.locator('[data-output="allMileRpm"]')).toHaveText("$2.61/mi");
  await expect(page.locator('[data-output="totalMiles"]')).toHaveText("575 mi");
  await expect(page.locator('[data-output="fuelCost"]')).toHaveText("$306.67");
  await expect(page.locator('[data-output="reserveCost"]')).toHaveText("$143.75");
  await expect(page.locator('[data-output="serviceFee"]')).toHaveText("$120.00");
  await expect(page.locator('[data-output="operatingCost"]')).toHaveText("$645.42");
  await expect(page.locator('[data-output="estimatedNet"]')).toHaveText("$854.58");
  await expect(page.locator('[data-output="breakEvenGross"]')).toHaveText("$571.11");
  await expect(page.locator('[data-output="breakEvenLoadedRpm"]')).toHaveText("$1.14/mi");
  await expect(page.locator('[data-output="breakEvenAllMileRpm"]')).toHaveText("$0.99/mi");

  await page.locator('input[name="loadedMiles"]').fill("600");
  await page.getByRole("button", { name: "Calculate trip economics" }).click();

  await expect(page.locator('[data-output="grossLoadedRpm"]')).toHaveText("$2.50/mi");
  await expect(page.locator('[data-output="allMileRpm"]')).toHaveText("$2.22/mi");
  await expect(page.locator('[data-output="estimatedNet"]')).toHaveText("$776.25");
  await expect(page.locator('[data-output="breakEvenGross"]')).toHaveText("$656.25");
});

test("RPM calculator is indexable, discoverable, and declares WebApplication schema", async ({ page }) => {
  await page.goto(calculatorPath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/rpm-calculator/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index,follow,max-image-preview:large",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"WebApplication"');
  expect(schemaText).toContain('"BusinessApplication"');
  expect(schemaText).toContain('"BreadcrumbList"');

  const sitemapResponse = await page.request.get("/sitemap-services.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).toContain(
    "https://hermeslogisticsus.com/logistics/resources/rpm-calculator/",
  );

  await page.goto("/logistics/resources/");
  await expect(page.locator('main a[href="/logistics/resources/rpm-calculator/"]')).toHaveCount(1);
  await expect(page.getByText("RPM & Load Profitability Calculator", { exact: true })).toBeVisible();
});

test("RPM calculator analytics emit behavior only, never entered trip values", async ({ page }) => {
  await page.goto(calculatorPath);

  await page.evaluate(() => {
    (window as any).__rpmEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      (window as any).__rpmEvents.push((event as CustomEvent).detail);
    });
  });

  await page.locator('input[name="grossPay"]').fill("1777.33");
  await page.getByRole("button", { name: "Calculate trip economics" }).click();

  const events = await page.evaluate(() => (window as any).__rpmEvents);
  expect(events.map((event: Record<string, unknown>) => event.name)).toEqual([
    "rpm_calculator_started",
    "rpm_calculator_completed",
  ]);

  for (const event of events) {
    expect(Object.keys(event).sort()).toEqual(["name", "tool", "ts"]);
    expect(event.tool).toBe("rpm_calculator");
  }
});

test("sharing RPM calculator never exposes entered financial values or changes canonical ownership", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__copiedRpmLink = null;
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (url: string) => { (window as any).__copiedRpmLink = url; } },
    });
  });
  await page.goto(calculatorPath);
  await page.evaluate(() => {
    (window as any).__rpmShareEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      if ((event as CustomEvent).detail.name === "rpm_calculator_share_action") {
        (window as any).__rpmShareEvents.push((event as CustomEvent).detail);
      }
    });
  });

  await page.locator('input[name="grossPay"]').fill("1777.33");
  await page.locator('input[name="deadheadMiles"]').fill("94");
  await page.getByRole("button", { name: "Share free calculator" }).click();
  const copied = await page.evaluate(() => (window as any).__copiedRpmLink);
  expect(copied).toBe("https://hermeslogisticsus.com/logistics/resources/rpm-calculator/?utm_source=website_share&utm_medium=referral&utm_campaign=carrier_rpm_tool");
  expect(copied).not.toContain("1777.33");
  expect(copied).not.toContain("94");
  await expect(page.locator("[data-rpm-share-status]")).toContainText("link copied");

  const events = await page.evaluate(() => (window as any).__rpmShareEvents);
  expect(events).toHaveLength(1);
  expect(Object.keys(events[0]).sort()).toEqual(["method", "name", "tool", "ts"]);
  expect(events[0].method).toBe("copy");
  expect(events[0].tool).toBe("rpm_calculator");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/logistics/resources/rpm-calculator/");
});

test("native RPM sharing sends only a public URL, never user-entered values", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__rpmSharePayload = null;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload: any) => { (window as any).__rpmSharePayload = payload; },
    });
  });
  await page.goto(calculatorPath);
  await page.locator('input[name="grossPay"]').fill("3212.43");
  await page.getByRole("button", { name: "Share free calculator" }).click();
  const payload = await page.evaluate(() => (window as any).__rpmSharePayload);
  expect(payload.url).toContain("/logistics/resources/rpm-calculator/?utm_source=website_share");
  expect(JSON.stringify(payload)).not.toContain("3212.43");
  await expect(page.locator("[data-rpm-share-status]")).toContainText("link shared");
});
