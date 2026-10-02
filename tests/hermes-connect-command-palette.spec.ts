import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("dynamic command results keep readable scoped styles on desktop and mobile", async ({ page }, testInfo) => {
  await page.setViewportSize(testInfo.project.name === "mobile"
    ? { width: 390, height: 844 }
    : { width: 1440, height: 1000 });
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({
      success: true,
      owned_businesses: [{ id: "synthetic-style-company", key: "repair_shop", name: "Synthetic Business Workspace", href: "/services/hermes-connect/repair-shops/dashboard/" }],
      workspaces: [], capabilities: { internal_ai: true },
    }),
  }));
  await page.route("**/api/internal/registrations", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({
      success: true,
      registrations: [{ id: "synthetic-style-registration", shop_name: "Synthetic Owner Record" }],
    }),
  }));
  await page.goto("/services/hermes-connect/");
  await page.locator("[data-hc-command-trigger]").click();
  const dialog = page.locator("[data-hc-command-dialog]");
  const input = dialog.locator("[data-hc-command-input]");
  await input.fill("synthetic");
  const results = dialog.locator("[data-hc-command-result]");
  await expect(results).toHaveCount(2);
  for (const result of await results.all()) {
    await expect(result).toHaveCSS("display", "flex");
    await expect(result.locator("span")).toHaveCSS("display", "grid");
    const layout = await result.evaluate((node) => {
      const title = node.querySelector("strong")!;
      const subtitle = node.querySelector("small")!;
      const heading = node.closest("section")!.querySelector("h3")!;
      const titleBox = title.getBoundingClientRect();
      const subtitleBox = subtitle.getBoundingClientRect();
      const rowBox = node.getBoundingClientRect();
      const rowStyle = getComputedStyle(node);
      return {
        padding: parseFloat(rowStyle.paddingTop),
        titleBottom: titleBox.bottom,
        subtitleTop: subtitleBox.top,
        subtitleHeight: subtitleBox.height,
        titleText: title.textContent,
        subtitleText: subtitle.textContent,
        groupFont: parseFloat(getComputedStyle(heading).fontSize),
        subtitleFont: parseFloat(getComputedStyle(subtitle).fontSize),
        inViewport: rowBox.left >= 0 && rowBox.right <= innerWidth,
      };
    });
    expect(layout.padding).toBeGreaterThanOrEqual(8);
    expect(layout.titleBottom).toBeLessThanOrEqual(layout.subtitleTop);
    expect(layout.subtitleHeight).toBeGreaterThan(0);
    expect(layout.titleText).toMatch(/^Synthetic /);
    expect(layout.subtitleText?.trim()).toBeTruthy();
    expect(layout.groupFont).toBeLessThan(layout.subtitleFont);
    expect(layout.inViewport).toBe(true);
  }
  await input.press("ArrowDown");
  await expect(results.first()).toBeFocused();
  await expect(results.first()).toHaveCSS("background-color", "rgb(243, 246, 251)");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const screenshot = testInfo.outputPath("dynamic-command-results.png");
  await page.screenshot({ path: screenshot });
  await testInfo.attach("dynamic-command-results", { path: screenshot, contentType: "image/png" });
  await input.fill("no-synthetic-match");
  await expect(dialog.locator(".hc-command-empty")).toBeVisible();
  await expect(dialog.locator(".hc-command-empty")).toHaveCSS("text-align", "center");
});

test("Hermes Connect command palette is mounted only through the shared layout", async () => {
  const layout = await readFile("src/layouts/BaseLayout.astro", "utf8");
  expect(layout).toContain("HermesConnectCommandPalette");
  expect(layout).toContain("isHermesConnectExperienceRoute");
});

test("desktop command trigger mounts inside the Hermes Connect product context", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route("**/api/hermes-connect/account", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) });
  });
  await page.goto("/services/hermes-connect/");
  await expect.poll(() => page.locator("[data-hc-product-context] [data-hc-command-trigger]").count()).toBe(1);
});

test("authorized account workspaces and owner registrations become searchable without URL PII", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        identity: { id: "specialist-owner", name: "Owner", email: "owner@example.test" },
        owned_businesses: [
          { key: "repair_shop", id: "shop-1", name: "Kittle's Garage", slug: "kittles-garage", href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" },
        ],
        workspaces: [
          { key: "academy", kind: "shared_workspace", href: "/services/hermes-connect/academy/dashboard/", available: true, state: {} },
          { key: "internal_ai", kind: "capability_workspace", href: "/services/hermes-connect/internal/ai-connect/", available: true, state: { capability: "HERMES_INTERNAL_OWNER" } },
        ],
        capabilities: { internal_ai: true },
      }),
    });
  });
  await page.route("**/api/internal/registrations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        registrations: [
          { id: "specialist-abc12345", name: "Friday QA", email: "private@example.test", role: "Shop Owner", shop_name: "Kittle's Garage", phone: "+1 555 0100", city: "North Little Rock", state: "AR", source: "manager" },
        ],
      }),
    });
  });

  await page.goto("/services/hermes-connect/");
  await page.keyboard.press("Control+K");
  const dialog = page.locator("[data-hc-command-dialog]");
  await expect(dialog).toBeVisible();
  const input = page.locator("[data-hc-command-input]");
  await input.fill("kittle");
  await expect(dialog.getByRole("link", { name: /Kittle's Garage/i })).toHaveCount(2);
  const registrationLink = dialog.locator('a[href^="/services/hermes-connect/internal/registrations/"]').first();
  await expect(registrationLink).toBeVisible();
  await expect(registrationLink).not.toHaveAttribute("href", /private|example|specialist-/i);
});

test("non-owner command palette never requests the owner registration ledger", async ({ page }) => {
  let registrationRequests = 0;
  await page.route("**/api/hermes-connect/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        identity: { id: "specialist-user", name: "User", email: "user@example.test" },
        owned_businesses: [],
        workspaces: [{ key: "academy", kind: "shared_workspace", href: "/services/hermes-connect/academy/dashboard/", available: true, state: {} }],
        capabilities: { internal_ai: false },
      }),
    });
  });
  await page.route("**/api/internal/registrations", async (route) => {
    registrationRequests += 1;
    await route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });

  await page.goto("/services/hermes-connect/");
  await page.keyboard.press("Control+K");
  const dialog = page.locator("[data-hc-command-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Academy/i }).first()).toBeVisible();
  await page.locator("[data-hc-command-input]").fill("owner registration");
  await expect.poll(() => registrationRequests).toBe(0);
});

test("mobile command trigger opens the same searchable surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/hermes-connect/account", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) });
  });
  await page.goto("/services/hermes-connect/");
  const trigger = page.locator("[data-hc-command-trigger]");
  await expect(trigger).toBeVisible();
  await expect.poll(() => trigger.evaluate((node) => node.parentElement === document.body)).toBe(true);
  await trigger.click();
  const dialog = page.locator("[data-hc-command-dialog]");
  await expect(dialog).toBeVisible();
  await page.locator("[data-hc-command-input]").fill("repair");
  await expect(dialog.getByRole("link", { name: /Repair Shops/i })).toBeVisible();
});

test("command trigger does not collide with existing Load Board Search control", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) });
  });
  await page.goto("/load-board/live-pilot/");
  await expect(page.getByRole("button", { name: "Search", exact: true })).toHaveCount(1);
  await expect(page.locator("[data-hc-command-trigger]")).toHaveAccessibleName("Open Hermes command palette");
});

test("account provider cannot inject an external command-palette destination", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        owned_businesses: [
          { key: "repair_shop", id: "safe-shop", name: "Safe Shop", href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" },
          { key: "repair_shop", id: "external-shop", name: "External Shop", href: "https://example.test/phish", workspace_state: "live" },
        ],
        workspaces: [
          { key: "external_tool", kind: "shared_workspace", href: "https://example.test/tool", available: true, state: {} },
        ],
        capabilities: { internal_ai: false },
      }),
    });
  });
  await page.goto("/services/hermes-connect/");
  await page.keyboard.press("Control+K");
  const dialog = page.locator("[data-hc-command-dialog]");
  await page.locator("[data-hc-command-input]").fill("shop");
  await expect(dialog.getByRole("link", { name: /Safe Shop/i })).toBeVisible();
  await expect(dialog.getByText("External Shop", { exact: true })).toHaveCount(0);
  await expect(dialog.locator('a[href^="https://example.test"]')).toHaveCount(0);
});
