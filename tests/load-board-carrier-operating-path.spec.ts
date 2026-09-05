import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("Load Board stays visible from Logistics and Technology direction entries", async () => {
  const page = await source("src/pages/paths/[slug].astro");
  const nav = await source("src/components/DirectionProductNav.astro");

  expect(page).toContain('<DirectionProductNav direction={path.id as "logistics" | "marketing" | "technology" | "academy"} theme="light" />');
  expect(nav).toContain('logistics: {');
  expect(nav).toContain('technology: {');
  expect(nav.match(/label: "Load Board", href: "\/load-board\/live-pilot\/"/g)?.length).toBeGreaterThanOrEqual(2);
});

test("carrier agreement and legacy operating tools are discoverable inside Logistics", async () => {
  const nav = await source("src/components/DirectionProductNav.astro");
  const legacyNav = await source("src/components/LogisticsProductNav.astro");
  const audiences = await source("src/data/logistics-audiences.ts");
  const carrierAudience = await source("src/pages/logistics/[audience].astro");
  const carrierEntry = await source("src/pages/carrier/index.astro");
  const journey = await source("src/components/CarrierContractJourney.astro");

  expect(nav).toContain('{ id: "agreement", label: "Agreement", href: "/carrier/", icon: FileSignature }');
  expect(nav).toContain('{ id: "operations", label: "Dispatch & Back Office", href: "/logistics/car-hauling-dispatch/", icon: Workflow }');
  expect(legacyNav).toContain('{ id: "agreement", label: "Agreement", href: "/carrier/", icon: FileSignature }');
  expect(legacyNav).toContain('href: "/logistics/car-hauling-dispatch/"');
  expect(legacyNav).not.toContain('href: "/logistics/carrier/"');
  expect(legacyNav).toContain("top:84px");
  expect(legacyNav).toContain("top:72px");

  expect(audiences).toContain('secondary: { label: "Agreement & onboarding", href: "/carrier/" }');
  expect(audiences).toContain('demo: { label: "Open Load Board", href: "/load-board/?role=carrier#available-loads" }');
  expect(carrierAudience).toContain("Carrier operating tools");
  for (const href of [
    "/logistics/start-car-hauling-dispatch/",
    "/carrier/",
    "/load-board/live-pilot/",
    "/logistics/resources/",
    "/logistics/resources/rpm-calculator/",
    "/logistics/resources/factoring-vs-direct-payment-calculator/",
  ]) {
    expect(carrierAudience).toContain(`href: "${href}"`);
  }

  expect(journey).toContain('const isLoadBoard = Astro.url.pathname === "/load-board/"');
  expect(journey).toContain('data-carrier-role-gated={isLoadBoard ? "" : undefined}');
  expect(journey).toContain('new URLSearchParams(window.location.search).get("role") === "carrier"');
  expect(journey).toContain('primaryLabel: "Agreement & onboarding", primaryHref: "/carrier/"');
  expect(journey).not.toContain('Astro.url.searchParams.get("role")');

  expect(carrierEntry).toContain("signed review copy");
  expect(carrierEntry).not.toContain("downloadable execution copy");
  expect(carrierEntry).toContain("Final production execution is not activated");
});

test("carrier Load Board role reveals Agreement & onboarding at runtime", async ({ page }) => {
  await page.goto("/load-board/?role=carrier#available-loads");
  const journey = page.locator("[data-carrier-contract-journey]");
  await expect(journey).toBeVisible();
  await expect(journey).not.toHaveAttribute("data-carrier-role-gated", "");
  await expect(journey.getByRole("link", { name: /Agreement & onboarding/i })).toHaveAttribute("href", "/carrier/");
});

test("plain Load Board keeps the carrier agreement journey hidden", async ({ page }) => {
  await page.goto("/load-board/");
  const journey = page.locator("[data-carrier-contract-journey]");
  await expect(journey).toBeHidden();
  await expect(journey).toHaveAttribute("data-carrier-role-gated", "");
});
