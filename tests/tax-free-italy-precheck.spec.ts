import { expect, test } from "@playwright/test";

const route = "/demos/hermes-connect/tax-free-italy/";

test("Italy Tax Free precheck stays excluded from SEO and claims no operational refund", async ({page}) => {
  await page.goto(route,{waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("lang","it");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/demos/hermes-connect/tax-free-italy/");
  await expect(page.getByText(/NESSUN RIMBORSO/).first()).toBeVisible();
  await expect(page.locator("main")).toContainText("Non emette fatture");
  await expect(page.locator("main")).toContainText("Nessun dato del modulo viene trasmesso a Hermes");
  await expect(page.locator('a[href="https://vatrefund.adm.gov.it/howto"]')).toBeVisible();
});

test("Italy precheck keeps > 70 euro threshold and end-of-third-month export window", async ({page}) => {
  await page.goto(route,{waitUntil:"domcontentloaded"});
  await page.locator("#invoice-total").fill("70.00");
  await page.locator("#buyer-residence").selectOption("non-eu");
  await page.locator("#goods-purpose").selectOption("personal");
  await page.locator("#invoice-date").fill("2026-01-10");
  await page.locator("#export-date").fill("2026-03-31");
  await page.getByRole("button",{name:"Verifica le condizioni generali"}).click();
  await expect(page.locator("#italy-taxfree-result")).toContainText("deve superare 70");
  await page.locator("#invoice-total").fill("70.01");
  await page.getByRole("button",{name:"Verifica le condizioni generali"}).click();
  await expect(page.locator("#italy-taxfree-result")).toContainText("NON conferma il diritto al rimborso");
  await page.locator("#export-date").fill("2026-04-01");
  await page.getByRole("button",{name:"Verifica le condizioni generali"}).click();
  await expect(page.locator("#italy-taxfree-result")).toContainText("supera il termine generale");
});

test("Italy precheck rejects missing residency and remains usable at 390px", async ({page}) => {
  await page.goto(route,{waitUntil:"domcontentloaded"});
  await page.locator("#invoice-total").fill("350.00");
  await page.locator("#buyer-residence").selectOption("unknown");
  await page.locator("#goods-purpose").selectOption("personal");
  await page.locator("#invoice-date").fill("2026-03-10");
  await page.locator("#export-date").fill("2026-05-09");
  await page.getByRole("button",{name:"Verifica le condizioni generali"}).click();
  await expect(page.locator("#italy-taxfree-result")).toContainText("Occorre verificare");
  const horizontalOverflow = await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(2);
});
