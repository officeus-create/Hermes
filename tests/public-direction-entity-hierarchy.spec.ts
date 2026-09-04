import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { publicPaths } from "../src/data/public-paths";
import { contactHandoffRoutes } from "../src/lib/contact";

test("public Four Directions use canonical Hermes entities and revenue-first order", () => {
  expect(publicPaths.map(({ id }) => id)).toEqual([
    "logistics",
    "marketing",
    "technology",
    "academy",
  ]);
  expect(publicPaths.map(({ number }) => number)).toEqual(["01", "02", "03", "04"]);
  expect(publicPaths.map(({ brandLabel }) => brandLabel)).toEqual([
    "Hermes Logistics",
    "Hermes Marketing",
    "Hermes Technology",
    "Hermes Academy",
  ]);
  expect(publicPaths.map(({ category }) => category)).toEqual([
    "Hermes Logistics",
    "Hermes Marketing",
    "Hermes Technology",
    "Hermes Academy",
  ]);
});

test("direction breadcrumb is derived from the public entity rather than legacy navigation", async () => {
  const source = await readFile(resolve(process.cwd(), "src/pages/paths/[slug].astro"), "utf8");
  expect(source).toContain("name: path.brandLabel");
  expect(source).not.toContain("site.navigation.find");
});

test("all four main directions share one product-header geometry", async () => {
  const page = await readFile(resolve(process.cwd(), "src/pages/paths/[slug].astro"), "utf8");
  const nav = await readFile(resolve(process.cwd(), "src/components/DirectionProductNav.astro"), "utf8");
  const academy = await readFile(resolve(process.cwd(), "src/components/AcademyProgramMatrix.astro"), "utf8");
  const legacyLogisticsNav = await readFile(resolve(process.cwd(), "src/components/LogisticsProductNav.astro"), "utf8");

  expect(page).toContain("<DirectionProductNav direction={path.id");
  expect(nav).toContain('logistics: {');
  expect(nav).toContain('marketing: {');
  expect(nav).toContain('technology: {');
  expect(nav).toContain('academy: {');
  expect(nav).toContain("top:84px");
  expect(nav).toContain("top:72px");
  expect(legacyLogisticsNav).toContain("top:84px");
  expect(legacyLogisticsNav).toContain("top:72px");

  expect(academy).toContain('id: "academy-logistics"');
  expect(academy).toContain('id: "academy-marketing"');
  expect(academy).toContain('id: "academy-it"');
  expect(academy).toContain('id: "academy-sales"');
  expect(academy).toContain('id: "academy-operations"');
});

test("carrier agreement, Load Board, and legacy operating tools remain discoverable inside Logistics", async () => {
  const nav = await readFile(resolve(process.cwd(), "src/components/DirectionProductNav.astro"), "utf8");
  const audiences = await readFile(resolve(process.cwd(), "src/data/logistics-audiences.ts"), "utf8");
  const carrierPage = await readFile(resolve(process.cwd(), "src/pages/logistics/[audience].astro"), "utf8");
  const carrierEntry = await readFile(resolve(process.cwd(), "src/pages/carrier/index.astro"), "utf8");

  expect(nav).toContain('{ id: "agreement", label: "Agreement", href: "/carrier/", icon: FileSignature }');
  expect(nav).toContain('{ id: "operations", label: "Dispatch & Back Office", href: "/logistics/car-hauling-dispatch/", icon: Workflow }');
  expect(nav).not.toContain('{ id: "operations", label: "Dispatch & Back Office", href: "/logistics/carrier/", icon: Workflow }');
  expect(audiences).toContain('secondary: { label: "Agreement & onboarding", href: "/carrier/" }');
  expect(audiences).toContain('demo: { label: "Open Load Board", href: "/load-board/?role=carrier#available-loads" }');
  expect(carrierPage).toContain('<DirectionProductNav direction="logistics" theme="dark" />');
  expect(carrierPage).toContain("Carrier operating tools");
  for (const href of [
    "/logistics/start-car-hauling-dispatch/",
    "/carrier/",
    "/load-board/live-pilot/",
    "/logistics/resources/",
    "/logistics/resources/rpm-calculator/",
    "/logistics/resources/factoring-vs-direct-payment-calculator/",
  ]) {
    expect(carrierPage).toContain(`href: "${href}"`);
  }

  expect(carrierEntry).toContain('<DirectionProductNav direction="logistics" theme="dark" />');
  expect(carrierEntry).toContain("signed review copy");
  expect(carrierEntry).not.toContain("downloadable execution copy");
});

test("public entity naming does not erase existing operating contact routes", async () => {
  expect(contactHandoffRoutes.some((route) => route.category === "ProgressoPro" && route.label === "Email Marketing")).toBe(true);
  expect(contactHandoffRoutes.some((route) => route.category === "IT Development" && route.label === "Email IT Development")).toBe(true);

  const source = await readFile(resolve(process.cwd(), "src/pages/paths/[slug].astro"), "utf8");
  expect(source).toContain("contactInterestCategory = site.paths.find");
  expect(source).toContain("<ContactCTA selectedPath={contactInterestCategory} />");
});
