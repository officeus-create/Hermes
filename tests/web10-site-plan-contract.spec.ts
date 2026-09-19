import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("WEB 10 keeps the approved header order without rewriting localized or footer discovery", async () => {
  const header = await source("src/components/SiteHeader.astro");
  const localized = await source("src/components/LocalizedOverviewPage.astro");
  const footer = await source("src/components/SiteFooter.astro");
  const headerOrder = /logistics:\s*0[\s\S]*marketing:\s*1[\s\S]*technology:\s*2[\s\S]*academy:\s*3/;
  const existingSurfaceOrder = /logistics:\s*0[\s\S]*marketing:\s*1[\s\S]*technology:\s*2[\s\S]*academy:\s*3/;

  expect(header).toMatch(headerOrder);
  for (const file of [localized, footer]) expect(file).toMatch(existingSurfaceOrder);
});

test("WEB 10 keeps the primary header simple and Russian direction discovery on localized overviews", async () => {
  const header = await source("src/components/SiteHeader.astro");
  const motion = await source("src/components/MotionLayer.astro");
  const integrity = await source("src/components/RussianLocaleIntegrity.astro");

  expect(header).toContain("directionOwnerRoutes[activeLocale]");
  expect(header).toMatch(/<nav class="desktop-nav(?: [^"]*)?"/);
  expect(motion).not.toContain("DepartmentMenuEnhancer");
  expect(motion).not.toContain("DepartmentMenuLocalization");
  expect(motion).not.toContain("/department-menu.js");
  expect(motion).not.toContain("/department-menu.css");

  for (const href of ["/ru/logistics/", "/ru/marketing/", "/ru/technology/", "/ru/academy/"]) {
    expect(integrity).toContain(href);
  }
});

test("WEB 10 Russian owners expose localized secondary navigation without header overlap", async ({ page }) => {
  const cases = [
    { path: "/ru/logistics/", direction: "logistics", links: [["load-board", "/load-board/"], ["agreement", "/carrier/"]] },
    { path: "/ru/marketing/", direction: "marketing", links: [["websites", "/ru/business-growth/website/"], ["seo", "/ru/business-growth/seo/"]] },
    { path: "/ru/technology/", direction: "technology", links: [["connect", "/services/hermes-connect/?lang=ru"], ["load-board", "/load-board/"]] },
    { path: "/ru/academy/", direction: "academy", links: [["logistics", "/ru/academy/us-logistics-operations/"]] },
  ];

  for (const item of cases) {
    await page.goto(item.path);
    const nav = page.locator(`[data-direction-product-nav="${item.direction}"]`);
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute("data-direction-product-locale", "ru");

    for (const [id, href] of item.links) {
      await expect(nav.locator(`[data-direction-product-link="${id}"]`)).toHaveAttribute("href", href);
    }

    const headerBox = await page.locator("[data-header]").boundingBox();
    const navBox = await nav.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(navBox!.y + 1).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  }
});

test("WEB 10 keeps five Academy tracks public but commercial activation gated", async () => {
  const academy = await source("src/data/academy-public.ts");
  const trustBadge = await source("src/components/TrustBadge.astro");

  for (const track of ["U.S. Logistics Operations", "Marketing", "IT & AI", "Sales", "COO / Operations"]) {
    expect(academy).toContain(track);
  }

  expect(academy).toContain("A visible learning track does not by itself mean a paid cohort or enrollment window is open.");
  expect(academy).toContain("No fixed price");
  expect(academy).toContain("do not guarantee employment");
  expect(trustBadge).toContain('value: "5 learning tracks"');
  expect(trustBadge).not.toContain('value: "2 programs"');
});
