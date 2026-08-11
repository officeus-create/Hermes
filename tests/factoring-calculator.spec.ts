import { expect, test } from "@playwright/test";

const calculatorPath = "/logistics/resources/factoring-vs-direct-payment-calculator/";

test("factoring calculator compares explicit cash, timing, and user-entered working-capital cost", async ({ page }) => {
  await page.goto(calculatorPath);

  await expect(page).toHaveTitle(/Factoring vs Direct Payment Calculator for Carriers/);
  await expect(page.getByRole("heading", { level: 1, name: "Factoring vs Direct Payment Calculator" })).toBeVisible();
  await expect(page.locator('input[name="capitalRate"]')).toHaveValue("12");

  await expect(page.locator('[data-output="factoringFee"]')).toHaveText("$85.00");
  await expect(page.locator('[data-output="directFee"]')).toHaveText("$0.00");
  await expect(page.locator('[data-output="factoringNet"]')).toHaveText("$2,415.00");
  await expect(page.locator('[data-output="directNet"]')).toHaveText("$2,500.00");
  await expect(page.locator('[data-output="factoringWaitCost"]')).toHaveText("$0.82");
  await expect(page.locator('[data-output="directWaitCost"]')).toHaveText("$24.66");
  await expect(page.locator('[data-output="factoringAdjustedNet"]')).toHaveText("$2,414.18");
  await expect(page.locator('[data-output="directAdjustedNet"]')).toHaveText("$2,475.34");
  await expect(page.locator('[data-output="adjustedDifference"]')).toHaveText("+$61.16 direct");
  await expect(page.locator('[data-output="factoringRetained"]')).toHaveText("96.6%");
  await expect(page.locator('[data-output="directRetained"]')).toHaveText("100%");
  await expect(page.locator('[data-output="daysDifference"]')).toHaveText("29 days faster with factoring");
  await expect(page.locator('[data-output="costPerDay"]')).toHaveText("$2.93/day");
  await expect(page.locator('[data-output="summary"]')).toContainText("12% annual working-capital assumption");

  await page.locator('input[name="invoiceAmount"]').fill("1800");
  await page.locator('input[name="factoringPercent"]').fill("2.5");
  await page.locator('input[name="factoringFixed"]').fill("15");
  await page.locator('input[name="factoringDays"]').fill("2");
  await page.locator('input[name="directPercent"]').fill("1");
  await page.locator('input[name="directFixed"]').fill("5");
  await page.locator('input[name="directDays"]').fill("15");
  await page.locator('input[name="capitalRate"]').fill("20");
  await page.getByRole("button", { name: "Compare payment paths" }).click();

  await expect(page.locator('[data-output="factoringFee"]')).toHaveText("$60.00");
  await expect(page.locator('[data-output="directFee"]')).toHaveText("$23.00");
  await expect(page.locator('[data-output="factoringNet"]')).toHaveText("$1,740.00");
  await expect(page.locator('[data-output="directNet"]')).toHaveText("$1,777.00");
  await expect(page.locator('[data-output="factoringWaitCost"]')).toHaveText("$1.97");
  await expect(page.locator('[data-output="directWaitCost"]')).toHaveText("$14.79");
  await expect(page.locator('[data-output="factoringAdjustedNet"]')).toHaveText("$1,738.03");
  await expect(page.locator('[data-output="directAdjustedNet"]')).toHaveText("$1,762.21");
  await expect(page.locator('[data-output="adjustedDifference"]')).toHaveText("+$24.18 direct");
  await expect(page.locator('[data-output="daysDifference"]')).toHaveText("13 days faster with factoring");
  await expect(page.locator('[data-output="costPerDay"]')).toHaveText("$2.85/day");
  await expect(page.locator('[data-output="summary"]')).toContainText("20% annual working-capital assumption");
});

test("factoring calculator is indexable, discoverable, and declares WebApplication schema", async ({ page }) => {
  await page.goto(calculatorPath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/factoring-vs-direct-payment-calculator/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index,follow,max-image-preview:large",
  );
  await expect(page.getByText("The defaults are an editable illustration, not a market benchmark.", { exact: false })).toBeVisible();

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"WebApplication"');
  expect(schemaText).toContain('"BusinessApplication"');
  expect(schemaText).toContain('"BreadcrumbList"');

  const sitemapResponse = await page.request.get("/sitemap-services.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).toContain(
    "https://hermeslogisticsus.com/logistics/resources/factoring-vs-direct-payment-calculator/",
  );

  await page.goto("/logistics/resources/");
  await expect(page.locator('main a[href="/logistics/resources/factoring-vs-direct-payment-calculator/"]')).toHaveCount(1);
  await expect(page.getByText("Factoring vs Direct Payment Calculator", { exact: true })).toBeVisible();
});

test("factoring calculator analytics emit behavior only, never entered financial terms", async ({ page }) => {
  await page.goto(calculatorPath);

  await page.evaluate(() => {
    (window as any).__factoringEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      (window as any).__factoringEvents.push((event as CustomEvent).detail);
    });
  });

  await page.locator('input[name="invoiceAmount"]').fill("1777.33");
  await page.locator('input[name="factoringPercent"]').fill("2.77");
  await page.locator('input[name="capitalRate"]').fill("19.9");
  await page.getByRole("button", { name: "Compare payment paths" }).click();

  const events = await page.evaluate(() => (window as any).__factoringEvents);
  expect(events.map((event: Record<string, unknown>) => event.name)).toEqual([
    "factoring_calculator_started",
    "factoring_calculator_completed",
  ]);

  for (const event of events) {
    expect(Object.keys(event).sort()).toEqual(["name", "tool", "ts"]);
    expect(event.tool).toBe("factoring_vs_direct_payment");
    const serialized = JSON.stringify(event);
    expect(serialized).not.toContain("1777.33");
    expect(serialized).not.toContain("2.77");
    expect(serialized).not.toContain("19.9");
  }
});
