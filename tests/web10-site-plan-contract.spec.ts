import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("WEB 10 keeps one canonical department order across header and localized surfaces", async () => {
  const header = await source("src/components/SiteHeader.astro");
  const localized = await source("src/components/LocalizedOverviewPage.astro");
  const footer = await source("src/components/SiteFooter.astro");

  for (const file of [header, localized, footer]) {
    expect(file.indexOf("logistics")).toBeLessThan(file.indexOf("marketing"));
    expect(file.indexOf("marketing")).toBeLessThan(file.indexOf("technology"));
    expect(file.indexOf("technology")).toBeLessThan(file.indexOf("academy"));
  }
});

test("WEB 10 exposes Russian product hubs without duplicating operational backends", async () => {
  const route = await source("src/pages/ru/paths/[slug].astro");
  const data = await source("src/data/russian-direction-hubs.ts");
  const hub = await source("src/components/RussianDirectionHub.astro");
  const menu = await source("src/components/DepartmentMenuLocalization.astro");
  const router = await source("src/components/RussianDirectionLinkRouter.astro");

  for (const id of ["logistics", "marketing", "technology", "academy"]) {
    expect(data).toContain(`${id}: {`);
    expect(menu).toContain(`/ru/paths/${id}/`);
    expect(router).toContain(`/ru/paths/${id}/`);
  }

  expect(route).toContain("russianDirectionHubOrder.map");
  expect(data).toContain('href: "/load-board/?role=carrier#available-loads"');
  expect(data).toContain('href: "/carrier/"');
  expect(data).toContain('href: "/services/hermes-connect/?lang=ru"');
  expect(data).not.toContain('href: "/ru/load-board/"');
  expect(data).not.toContain('href: "/ru/carrier/"');

  for (const localizedPath of [
    "/ru/business-growth/",
    "/ru/business-growth/website/",
    "/ru/business-growth/seo/",
    "/ru/business-growth/social-media/",
    "/ru/business-growth/advertising/",
  ]) {
    expect(hub).toContain(localizedPath);
    expect(menu).toContain(localizedPath);
  }

  expect(menu).toContain('/services/hermes-connect/?lang=ru');
  expect(menu).toContain('/ru/gb/london/it-web-development/');
  expect(menu).not.toContain('/ru/load-board/');
  expect(menu).not.toContain('/ru/carrier/');
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
