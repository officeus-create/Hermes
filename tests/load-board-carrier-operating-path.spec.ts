import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("canonical Load Board stays visible from Logistics and Technology direction entries", async () => {
  const page = await source("src/pages/paths/[slug].astro");
  const header = await source("src/components/SiteHeader.astro");
  const nav = await source("src/components/DirectionProductNav.astro");
  const legacyNav = await source("src/components/LogisticsProductNav.astro");
  const spotlight = await source("src/components/LoadBoardProductSpotlight.astro");

  expect(page).toContain('<SiteHeader contactHref="#contact" theme="light" />');
  expect(header).toContain('<DirectionProductNav direction={section ?? "products"} theme="light"');
  expect(nav).toContain('logistics: {');
  expect(nav).toContain('technology: {');
  expect(nav.match(/label: "Load Board", href: "\/load-board\/"/g)?.length).toBeGreaterThanOrEqual(2);
  expect(nav).not.toContain('label: "Load Board", href: "/load-board/live-pilot/"');
  expect(legacyNav).toContain('{ id: "load-board", label: "Load Board", href: "/load-board/", icon: Route }');
  expect(spotlight).toContain('href="/load-board/">Open Hermes Load Board');
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

test("canonical Load Board source is wired to separate live load, capacity and truthful summary APIs", async () => {
  const layout = await source("src/layouts/BaseLayout.astro");
  const live = await source("src/components/LoadBoardCapacityEnhancer.astro");
  const parser = await source("workers/lead-email/src/load-board-inbound.mjs");
  const intake = await source("functions/api/load-board/intake.ts");

  expect(layout).toContain('import LoadBoardCapacityEnhancer from "../components/LoadBoardCapacityEnhancer.astro"');
  expect(layout).toContain("<LoadBoardCapacityEnhancer />");
  expect(live).toContain('Astro.url.pathname === "/load-board/"');
  expect(live).toContain('url.searchParams.set("type", type)');
  expect(live).toContain('if (requestedEquipment) url.searchParams.set("equipment", requestedEquipment)');
  expect(live).toContain('fetchJson(activeFeedUrl("load"))');
  expect(live).toContain('fetchJson(activeFeedUrl("capacity"))');
  expect(live).toContain("fetchJson('/api/load-board/summary')");
  expect(live).toContain("Interface preview rows are not inventory.");
  expect(live).toContain("Only the real count above represents active, unexpired records.");
  expect(live).toContain("available trucks");
  expect(live).toContain("A truck is capacity, not freight.");
  expect(live).toContain('const accessPath = "/services/hermes-connect/load-board/access/"');
  expect(live).toContain('href="/carrier/"');
  expect(parser).not.toContain('reason: "car_hauling_hold"');
  expect(parser).toContain('return "car_hauler"');
  expect(intake).toContain("Number(managedSource.car_hauling_ingest_allowed || 0) === 1");
  expect(intake).toContain("car_hauling_broker_outreach_hold: true");
  expect(intake).toContain("source_approval_required");
  expect(intake).toContain("source_ingest_not_enabled");
  expect(intake).not.toContain("INSERT INTO hermes_load_sources");
  expect(intake).toContain("outbound_enabled: false");
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

test("mobile carrier journey stays connected from Home to intake", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const logisticsHome = page.locator('#paths a[href="/paths/logistics/"]').first();
  await expect(logisticsHome).toBeVisible();
  await logisticsHome.click();
  await expect(page).toHaveURL(/\/paths\/logistics\/$/);

  const carrierPath = page.getByRole("link", { name: /Carrier or owner-operator/i }).first();
  await expect(carrierPath).toBeVisible();
  await carrierPath.click();
  await expect(page).toHaveURL(/\/logistics\/carrier\/$/);

  const rpm = page.getByRole("link", { name: /RPM & profitability/i }).first();
  const loadBoard = page.getByRole("link", { name: /Open Load Board|Live Load Board/i }).first();
  const dispatch = page.getByRole("link", { name: /Start dispatch review|Dispatch review/i }).first();
  await expect(rpm).toBeVisible();
  await expect(loadBoard).toBeVisible();
  await expect(dispatch).toBeVisible();

  await rpm.click();
  await expect(page).toHaveURL(/\/logistics\/resources\/rpm-calculator\/$/);
  const intake = page.getByRole("link", { name: /Request dispatch-fit review|Open carrier intake/i }).first();
  await expect(intake).toBeVisible();
  await intake.click();
  await expect(page).toHaveURL(/\/logistics\/start-car-hauling-dispatch\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/carrier|dispatch/i);
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});
