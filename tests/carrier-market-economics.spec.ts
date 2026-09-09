import { expect, test } from "@playwright/test";

const equipmentPages = [
  ["car-hauling", "Car Hauling"],
  ["hotshot", "Hotshot"],
  ["box-truck", "Box Truck"],
  ["cargo-van", "Cargo Van"],
  ["power-only", "Power Only"],
  ["dry-van", "Dry Van"],
  ["reefer", "Reefer"],
  ["flatbed", "Flatbed"],
  ["step-deck", "Step Deck"],
] as const;

test("all nine equipment choices resolve to substantial indexable carrier owners", async ({ page }) => {
  for (const [slug, label] of equipmentPages) {
    await page.goto(`/paths/logistics/carriers/${slug}/`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://hermeslogisticsus.com/paths/logistics/carriers/${slug}/`,
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(label);
    await expect(page.locator("[data-carrier-economics]")).toHaveAttribute("data-equipment", slug);
  }
});

test("reefer economics compares relevant boards and keeps 25 city anchors on the canonical equipment owner", async ({ page }) => {
  await page.goto("/paths/logistics/carriers/reefer/");

  await expect(page.getByText("DAT One", { exact: true })).toBeVisible();
  await expect(page.getByText("Truckstop Load Board", { exact: true })).toBeVisible();
  await expect(page.getByText("123Loadboard", { exact: true })).toBeVisible();
  await expect(page.getByText("8%", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("+10–15%", { exact: true })).toBeVisible();

  const marketLinks = page.locator(".carrier-market-link-grid a");
  await expect(marketLinks).toHaveCount(25);
  const chicago = marketLinks.filter({ hasText: "Chicago, IL" });
  await expect(chicago).toHaveAttribute("href", "/paths/logistics/carriers/reefer/#market-chicago-il");

  const body = await page.locator("[data-carrier-economics]").innerText();
  expect(body).toMatch(/planning model, not an earnings claim/i);
  expect(body).toMatch(/does not guarantee a \+10%, \+15%/i);
});

test("economics calculator shows modeled gross and carrier net after the 8 percent fee", async ({ page }) => {
  await page.goto("/paths/logistics/carriers/dry-van/");
  await page.locator("[data-benchmark-rpm]").fill("3.06");
  await page.locator("[data-loaded-miles]").fill("3500");

  await expect(page.locator("[data-base-rpm]")).toHaveText("$3.06/mi");
  await expect(page.locator("[data-low-rpm]")).toHaveText("$3.37/mi");
  await expect(page.locator("[data-high-rpm]")).toHaveText("$3.52/mi");
  await expect(page.locator("[data-net-range]")).toHaveText("$3.10/mi – $3.24/mi");
  await expect(page.locator("[data-net-weekly]")).toContainText("after the 8% fee");
});

test("existing indexed car-hauler city owner receives the economics layer without query-state Load Board links", async ({ page }) => {
  await page.goto("/logistics/car-hauler-loads/colorado-springs-co/");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator("[data-carrier-economics][data-equipment='car-hauling']")).toBeVisible();
  await expect(page.getByText("Central Dispatch", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Super Dispatch", { exact: true }).first()).toBeVisible();

  const queryStateLinks = page.locator('a[href*="/load-board/?role="]');
  await expect(queryStateLinks).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Preview Load Board/i })).toHaveAttribute("href", "/load-board/#available-loads");
});
