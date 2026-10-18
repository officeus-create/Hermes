import { expect, test } from "@playwright/test";

test("Technology replays real Hermes product surfaces instead of abstract status cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="technology"]');
  const proof = route.locator('[data-home-pillar-proof="systems"]');
  await route.scrollIntoViewIfNeeded();

  await expect(proof).toHaveAttribute("data-motion-state", "running");
  await expect(proof.locator(".home-system-card")).toHaveCount(4);
  await expect(proof.locator('[data-tech-source="/services/hermes-connect/repair-shops/dashboard/"]')).toContainText("SHOP OWNER WORKSPACE");
  await expect(proof).toContainText("Services");
  await expect(proof).toContainText("Booking inbox");
  await expect(proof).toContainText("Catalog inquiries");
  await expect(proof.locator('[data-tech-source="/services/website-development/"]').first()).toContainText("SEMANTIC BUILD");
  await expect(proof).toContainText("Responsive");
  await expect(proof).toContainText("Canonical");
  await expect(proof).toContainText("Schema");
  await expect(proof.locator('[data-tech-source="/services/hermes-connect/repair-shops/social/"]')).toContainText("OWNER AUTHORIZATION");
  await expect(proof).toContainText("provider readback");
  await expect(proof).toContainText("RELEASE EVIDENCE");
  await expect(proof).toContainText("deploy ≠ live until readback");
  for (const label of await proof.locator(".home-tech-factory-ui i").all()) {
    expect(await label.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false);
  }

  const packet = proof.locator(".home-system-wire i").first();
  await expect(packet).toHaveCSS("animation-name", "home-system-packet");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Technology has a static readable 390px reduced-motion composition", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="technology"]');
  const proof = route.locator('[data-home-pillar-proof="systems"]');
  await route.scrollIntoViewIfNeeded();

  await expect(proof).toBeVisible();
  await expect(proof).toHaveAttribute("data-motion-state", "reduced");
  await expect(proof.locator(".home-system-card")).toHaveCount(4);
  await expect(proof.locator(".home-system-card").first()).toHaveCSS("animation-name", "none");
  await expect(proof).toContainText("SHOP OWNER WORKSPACE");
  await expect(proof).toContainText("SEMANTIC BUILD");
  await expect(proof).toContainText("OWNER AUTHORIZATION");
  await expect(proof).toContainText("RELEASE EVIDENCE");
  for (const label of await proof.locator(".home-tech-factory-ui i").all()) {
    expect(await label.evaluate(node => node.scrollWidth > node.clientWidth + 1)).toBe(false);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
