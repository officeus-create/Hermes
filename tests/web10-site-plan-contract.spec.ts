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

test("WEB 10 keeps Russian direction discovery on the existing localized overview and reuses canonical product backends", async () => {
  const header = await source("src/components/SiteHeader.astro");
  const loader = await source("src/components/DepartmentMenuEnhancer.astro");
  const menu = await source("public/department-menu.js");
  const integrity = await source("src/components/RussianLocaleIntegrity.astro");

  expect(header).toContain('url: `${localeBase}#${path.id}`');
  expect(loader).toContain('/department-menu.js');
  expect(loader).toContain('/department-menu.css');
  for (const [id, href] of [
    ["logistics", "/ru/#logistics"],
    ["marketing", "/ru/#marketing"],
    ["technology", "/ru/#technology"],
    ["academy", "/ru/#academy"],
  ]) {
    expect(menu).toContain(`${id}: "${href}"`);
    expect(integrity).toContain(href);
  }

  for (const localizedPath of [
    "/ru/business-growth/",
    "/ru/business-growth/website/",
    "/ru/business-growth/seo/",
    "/ru/business-growth/social-media/",
    "/ru/business-growth/advertising/",
  ]) {
    expect(menu).toContain(localizedPath);
  }

  expect(menu).toContain('/services/hermes-connect/?lang=ru');
  expect(menu).toContain('/ru/gb/london/it-web-development/');
  expect(menu).not.toContain('/ru/load-board/');
  expect(menu).not.toContain('/ru/carrier/');
  expect(menu).not.toContain('/ru/paths/');
});

test("WEB 10 keeps five Academy tracks public but commercial activation gated", async () => {
  const academy = await source("src/data/academy-public.ts");

  for (const track of ["U.S. Logistics Operations", "Marketing", "IT & AI", "Sales", "COO / Operations"]) {
    expect(academy).toContain(track);
  }

  expect(academy).toContain("A visible learning track does not by itself mean a paid cohort or enrollment window is open.");
  expect(academy).toContain("No fixed price");
  expect(academy).toContain("do not guarantee employment");
});
