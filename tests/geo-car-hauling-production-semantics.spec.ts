import { expect, test } from "@playwright/test";

const route = "/logistics/car-hauling-dispatch/";

const readSemanticSignature = async (page: any) => page.evaluate(() => {
  const normalize = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ").trim();
  const body = normalize(document.body.textContent);
  const primary = [...document.querySelectorAll<HTMLAnchorElement>('a[href="/logistics/start-car-hauling-dispatch/"]')][0];
  return {
    h1: normalize(document.querySelector("h1")?.textContent),
    primaryActionHref: primary?.getAttribute("href") ?? "",
    carrierControl: body.includes("The carrier reviews and approves every load before booking"),
    noGuarantee: body.includes("Does Hermes guarantee loads, rates, or revenue?") && body.includes("No."),
    newAuthorityBoundary: body.includes("Can a new authority start immediately?") && body.includes("Not always."),
    ownerOperator: body.includes("Owner-operators"),
    smallFleet: body.includes("Small fleets"),
  };
});

test("car-hauling production owner keeps semantic parity at desktop and 390px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const desktop = await readSemanticSignature(page);

  expect(desktop).toEqual({
    h1: "Car Hauling Dispatch Services for Owner-Operators and Small Fleets",
    primaryActionHref: "/logistics/start-car-hauling-dispatch/",
    carrierControl: true,
    noGuarantee: true,
    newAuthorityBoundary: true,
    ownerOperator: true,
    smallFleet: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  const mobile = await readSemanticSignature(page);
  expect(mobile).toEqual(desktop);

  await expect(page.getByRole("heading", { level: 1, name: desktop.h1 })).toBeVisible();
  const primary = page.getByRole("link", { name: "Start car-hauling dispatch review" }).first();
  await expect(primary).toBeVisible();
  await expect(primary).toHaveAttribute("href", desktop.primaryActionHref);
});
