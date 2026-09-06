import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("Hermes direction order stays Logistics → Marketing → IT → Academy", async ({ page }) => {
  const header = await source("src/components/SiteHeader.astro");
  const publicPaths = await source("src/data/public-paths.ts");

  expect(header).toContain('const directionOrder: Record<string, number> = { logistics: 0, marketing: 1, technology: 2, academy: 3 }');
  expect(header).toContain('const orderedNavigation = [...site.navigation].sort(');
  expect(header).toContain('const orderedPaths = [...site.paths].sort(');
  expect(header).toContain('["logistics", "marketing", "technology", "academy"]');
  expect(publicPaths).toContain("logistics: 0");
  expect(publicPaths).toContain("marketing: 1");
  expect(publicPaths).toContain("technology: 2");
  expect(publicPaths).toContain("academy: 3");

  await page.goto("/");
  const desktopDirections = await page.locator('.desktop-nav a[href^="/paths/"]').evaluateAll((links) =>
    links.map((link) => ({ href: link.getAttribute("href"), label: link.textContent?.trim() })),
  );
  expect(desktopDirections).toEqual([
    { href: "/paths/logistics/", label: "Logistics" },
    { href: "/paths/marketing/", label: "Marketing" },
    { href: "/paths/technology/", label: "IT" },
    { href: "/paths/academy/", label: "Academy" },
  ]);

  const roomIds = await page.locator("[data-home-room]").evaluateAll((rooms) => rooms.map((room) => room.getAttribute("data-room-id")));
  expect(roomIds).toEqual(["logistics", "marketing", "technology", "academy"]);
});

test("Academy exposes five learning tracks without pretending enrollment is open", async () => {
  const academy = await source("src/data/academy-public.ts");

  for (const id of ["logistics", "marketing", "it", "sales", "operations"]) {
    expect(academy).toContain(`id: "${id}"`);
  }
  for (const label of ["U.S. Logistics Operations", "Marketing", "IT & AI", "Sales", "COO / Operations"]) {
    expect(academy).toContain(`label: "${label}"`);
  }

  expect(academy).toContain('status: "owner_approval_required"');
  expect(academy).toContain("A visible learning track does not by itself mean a paid cohort or enrollment window is open.");
  expect(academy).toContain("No fixed price");
  expect(academy).toContain("employment, income, clients, certification");
  expect(academy).not.toContain("Two programs: U.S. Logistics Operations and Marketing");
});
