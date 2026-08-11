import { expect, test } from "@playwright/test";

const path = "/logistics/resources/factoring-vs-direct-payment/";

test("payment comparison calculates entered fee and waiting-cost assumptions", async ({ page }) => {
  await page.goto(path);

  await expect(page.getByRole("heading", { level: 1, name: "Factoring vs Direct Payment Calculator" })).toBeVisible();
  await expect(page.locator('[data-output="factoringFeeCost"]')).toHaveText("$75.00");
  await expect(page.locator('[data-output="factoringWaitCost"]')).toHaveText("$0.82");
  await expect(page.locator('[data-output="factoringProceeds"]')).toHaveText("$2,425.00");
  await expect(page.locator('[data-output="factoringNet"]')).toHaveText("$2,424.18");
  await expect(page.locator('[data-output="directFeeCost"]')).toHaveText("$0.00");
  await expect(page.locator('[data-output="directWaitCost"]')).toHaveText("$24.66");
  await expect(page.locator('[data-output="directProceeds"]')).toHaveText("$2,500.00");
  await expect(page.locator('[data-output="directNet"]')).toHaveText("$2,475.34");
  await expect(page.locator('[data-output="difference"]')).toHaveText("$51.16");
  await expect(page.locator('[data-output="summary"]')).toContainText("direct payment leaves $51.16 more");

  await page.locator('input[name="directFee"]').fill("4");
  await page.getByRole("button", { name: "Compare payment economics" }).click();
  await expect(page.locator('[data-output="directFeeCost"]')).toHaveText("$100.00");
  await expect(page.locator('[data-output="directNet"]')).toHaveText("$2,375.34");
  await expect(page.locator('[data-output="summary"]')).toContainText("factoring leaves $48.84 more");
});

test("payment comparison is indexable, discoverable, and transparent about schema and assumptions", async ({ page }) => {
  await page.goto(path);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/factoring-vs-direct-payment/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
  await expect(page.getByText("Illustrative starting values only.", { exact: true })).toBeVisible();

  const schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
  expect(schemaText).toContain('"WebApplication"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');

  const sitemap = await page.request.get("/sitemap-services.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain(
    "https://hermeslogisticsus.com/logistics/resources/factoring-vs-direct-payment/",
  );
});

test("payment comparison analytics never contain invoice or payment assumptions", async ({ page }) => {
  await page.goto(path);

  await page.evaluate(() => {
    (window as any).__paymentEvents = [];
    window.addEventListener("hermes:analytics", (event) => {
      (window as any).__paymentEvents.push((event as CustomEvent).detail);
    });
  });

  await page.locator('input[name="invoiceAmount"]').fill("9876.54");
  await page.locator('input[name="factoringFee"]').fill("2.7");
  await page.getByRole("button", { name: "Compare payment economics" }).click();

  const events = await page.evaluate(() => (window as any).__paymentEvents);
  expect(events.map((event: Record<string, unknown>) => event.name)).toEqual([
    "payment_comparison_started",
    "payment_comparison_completed",
  ]);
  for (const event of events) {
    expect(Object.keys(event).sort()).toEqual(["name", "tool", "ts"]);
    expect(event.tool).toBe("factoring_vs_direct");
    expect(JSON.stringify(event)).not.toContain("9876.54");
    expect(JSON.stringify(event)).not.toContain("2.7");
  }
});
