import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("WEB 10 keeps one canonical department order across header and localized surfaces", async () => {
  const header = await source("src/components/SiteHeader.astro");
  const localized = await source("src/components/LocalizedOverviewPage.astro");
  const footer = await source("src/components/SiteFooter.astro");
  const canonicalOrder = /logistics:\s*0[\s\S]*marketing:\s*1[\s\S]*technology:\s*2[\s\S]*academy:\s*3/;

  for (const file of [header, localized, footer]) expect(file).toMatch(canonicalOrder);
});

test("WEB 10 keeps the primary header simple and Russian direction discovery on localized overviews", async () => {
  const header = await source("src/components/SiteHeader.astro");
  const motion = await source("src/components/MotionLayer.astro");
  const integrity = await source("src/components/RussianLocaleIntegrity.astro");

  expect(header).toContain('url: `${localeBase}#${path.id}`');
  expect(header).toContain('<nav class="desktop-nav"');
  expect(motion).not.toContain("DepartmentMenuEnhancer");
  expect(motion).not.toContain("DepartmentMenuLocalization");
  expect(motion).not.toContain("/department-menu.js");
  expect(motion).not.toContain("/department-menu.css");

  for (const href of ["/ru/#logistics", "/ru/#marketing", "/ru/#technology", "/ru/#academy"]) {
    expect(integrity).toContain(href);
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
