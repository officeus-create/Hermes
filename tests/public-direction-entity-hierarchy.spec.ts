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
  expect(nav).toContain("margin-top:84px");
  expect(nav).toContain("top:72px;margin-top:72px");
  expect(legacyLogisticsNav).toContain("top:84px");
  expect(legacyLogisticsNav).toContain("margin-top:84px");
  expect(legacyLogisticsNav).toContain("top:72px;margin-top:72px");
  expect(nav).toContain('a[href="/paths/technology/"]){order:3}');
  expect(nav).toContain('a[href="/paths/academy/"]){order:4}');

  expect(academy).toContain('id: "academy-logistics"');
  expect(academy).toContain('id: "academy-marketing"');
  expect(academy).toContain('id: "academy-it"');
  expect(academy).toContain('id: "academy-sales"');
  expect(academy).toContain('id: "academy-operations"');
});

test("floating corporate header clears the Logistics product nav at initial render", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/load-board/live-pilot/");

    const header = page.locator(".site-header");
    const productNav = page.locator(".logistics-product-nav");
    await expect(header).toBeVisible();
    await expect(productNav).toBeVisible();

    const headerBox = await header.boundingBox();
    const productNavBox = await productNav.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(productNavBox).not.toBeNull();
    expect(productNavBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);

    if (viewport.width >= 981) {
      const x = async (href: string) => (await page.locator(`.site-header .desktop-nav > a[href="${href}"]`).boundingBox())?.x ?? Number.NaN;
      const logisticsX = await x("/paths/logistics/");
      const marketingX = await x("/paths/marketing/");
      const technologyX = await x("/paths/technology/");
      const academyX = await x("/paths/academy/");
      expect(logisticsX).toBeLessThan(marketingX);
      expect(marketingX).toBeLessThan(technologyX);
      expect(technologyX).toBeLessThan(academyX);
    }
  }
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
