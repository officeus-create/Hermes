import { expect, test } from "@playwright/test";

test("Catalog U.S. map uses an accessible labeled group, not an image enclosing links", async ({ page }) => {
  await page.goto("/businesses/");
  const map = page.getByRole("group", {
    name: "United States tile map showing active Hermes Catalog states",
  });
  await expect(map).toHaveCount(1);
  await expect(page.locator(".tile-map[role='img']")).toHaveCount(0);

  const liveStates = map.locator("a.state-tile.active");
  expect(await liveStates.count()).toBeGreaterThan(0);
  await expect(liveStates.first()).toHaveAttribute("href", /^\/businesses\/[a-z-]+\/$/);
  await expect(liveStates.first()).toHaveAttribute("aria-label", /business profile/);

  const research = map.locator("span.state-tile.pending");
  expect(await research.count()).toBeGreaterThan(0);
  await expect(research.first()).toHaveAttribute("role", "img");
  await expect(research.first()).toHaveAttribute("aria-label", /: research queue$/);
  // A state with a live profile is a real link, while pending tiles remain
  // static announcements; neither kind sits inside a flattened role=img map.
  await expect(research.locator("a,button")).toHaveCount(0);
  await liveStates.first().click();
  await expect(page).toHaveURL(/\/businesses\/[a-z-]+\/$/);
});

test("accessible map semantics are retained at 390px with no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/businesses/");
  const map = page.getByRole("group", {
    name: "United States tile map showing active Hermes Catalog states",
  });
  await expect(map).toHaveCount(1);
  // The map is intentionally horizontally scrollable within its container.
  // It must not expand the entire document beyond the viewport.
  const width = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.doc).toBeLessThanOrEqual(width.client + 1);
});
