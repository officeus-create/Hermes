import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/load-analyzer/";

test("Hermes Connect Load Analyzer keeps trip economics local and explainable", async ({ page }) => {
  const writeRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET" && request.method() !== "HEAD") writeRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.goto(route);

  await expect(page).toHaveTitle("Load Analyzer · Hermes Connect");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { level: 1, name: "Load Analyzer & Route Intelligence" })).toBeVisible();
  await expect(page.getByText("No live load-board API is connected.")).toBeVisible();
  await expect(page.getByText(/GOOD \/ BORDERLINE \/ BAD uses your own target net/i)).toBeVisible();

  await expect(page.locator('[data-load-output="grossLoadedRpm"]')).toHaveText("$3.00/mi");
  await expect(page.locator('[data-load-output="allMileRpm"]')).toHaveText("$2.61/mi");
  await expect(page.locator('[data-load-output="estimatedNet"]')).toHaveText("$854.58");
  await expect(page.locator('[data-load-output="breakEvenGross"]')).toHaveText("$571.11");
  await expect(page.locator('[data-load-output="breakEvenAllMileRpm"]')).toHaveText("$0.99/mi");
  await expect(page.locator("[data-load-recommendation]")).toHaveText("GOOD");

  await page.locator('input[name="originLabel"]').fill("PRIVATE-ROUTE-ORIGIN");
  await page.locator('input[name="destinationLabel"]').fill("PRIVATE-ROUTE-DESTINATION");
  await page.locator('input[name="grossPay"]').fill("1777.33");
  await page.locator('input[name="targetNet"]').fill("900");
  await page.getByRole("button", { name: "Analyze trip economics" }).click();

  await expect(page.locator('[data-load-output="estimatedNet"]')).toHaveText("$1,109.72");
  await expect(page.locator("[data-load-recommendation]")).toHaveText("GOOD");

  await page.getByRole("button", { name: "Save current as baseline" }).click();
  await page.locator('input[name="deadheadMiles"]').fill("300");
  await page.getByRole("button", { name: "Analyze trip economics" }).click();
  await expect(page.locator("[data-load-comparison]")).toBeVisible();
  await expect(page.locator("[data-load-comparison-copy]")).toContainText("saved baseline");

  const analytics = await page.evaluate(() => JSON.stringify((window as any).dataLayer ?? []));
  expect(analytics).toContain("load_analyzer_start");
  expect(analytics).toContain("load_analyzer_complete");
  expect(analytics).toContain("load_analyzer_compare");
  expect(analytics).not.toContain("PRIVATE-ROUTE-ORIGIN");
  expect(analytics).not.toContain("PRIVATE-ROUTE-DESTINATION");
  expect(analytics).not.toContain("1777.33");
  expect(writeRequests).toEqual([]);

  await expect(page.locator('a[data-load-analyzer-handoff]').first()).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/start-car-hauling-dispatch/",
  );
});

test("Hermes Connect Load Analyzer rejects impossible percentage assumptions", async ({ page }) => {
  await page.goto(route);

  await page.locator('input[name="servicePercent"]').fill("70");
  await page.locator('input[name="paymentFeePercent"]').fill("30");
  await page.getByRole("button", { name: "Analyze trip economics" }).click();

  await expect(page.locator("[data-load-analyzer-error]")).toBeVisible();
  await expect(page.locator("[data-load-analyzer-error]")).toContainText("percentage fees must stay below 100% combined");
});
