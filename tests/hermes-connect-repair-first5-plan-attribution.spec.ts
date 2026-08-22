import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

test("authenticated Founding Plan request is prefilled and linked to the canonical shop", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;

  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") {
      return route.fulfill(json({
        success: true,
        specialist: { id: "owner-first5", name: "Alex Owner", email: "alex@apex.example", role: "Shop Owner" },
      }));
    }
    if (path === "/api/repair-shop/profile") {
      return route.fulfill(json({
        success: true,
        shop: {
          id: "shop-first5",
          name: "Apex Auto Care",
          slug: "apex-auto-care",
          phone: "+1 414 555 0100",
          city: "Milwaukee",
          state: "WI",
        },
      }));
    }
    if (path === "/api/logistics-lead" && route.request().method() === "POST") {
      submitted = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill(json({ success: true, request_id: "first5-paid-request" }));
    }
    return route.fulfill(json({ success: true }));
  });

  await page.goto("/services/hermes-connect/repair-shops/plan/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#plan-shop-name")).toHaveValue("Apex Auto Care");
  await expect(page.locator("#plan-contact-name")).toHaveValue("Alex Owner");
  await expect(page.locator("#plan-phone")).toHaveValue("+1 414 555 0100");
  await expect(page.locator("#plan-email")).toHaveValue("alex@apex.example");
  await expect(page.locator("#plan-city-state")).toHaveValue("Milwaukee, WI");

  await page.locator("#plan-goal").fill("Reduce scheduling calls and keep repeat customer history together.");
  await page.locator("#plan-consent").check();
  await page.locator("#paid-plan-submit").click();

  await expect(page.locator("#paid-plan-status")).toContainText("Request received");
  expect(submitted).not.toBeNull();
  const message = String(submitted?.message || "");
  expect(message).toContain("Shop: Apex Auto Care");
  expect(message).toContain("Hermes Connect shop identity: shop-first5 · apex-auto-care");

  const analytics = await page.evaluate(() => (window.dataLayer || []).filter((entry: Record<string, unknown>) => String(entry.event || "").startsWith("connect_paid_plan")));
  expect(analytics.some((entry: Record<string, unknown>) => entry.event === "connect_paid_plan_prefilled" && entry.linked_shop === true)).toBe(true);
  expect(JSON.stringify(analytics)).not.toContain("alex@apex.example");
  expect(JSON.stringify(analytics)).not.toContain("shop-first5");
});

test("guest Founding Plan request remains usable without authenticated shop linkage", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;

  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(json({ success: false, error: "unauthorized" }, 401));
    if (path === "/api/logistics-lead" && route.request().method() === "POST") {
      submitted = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill(json({ success: true, request_id: "manual-paid-request" }));
    }
    return route.fulfill(json({ success: true }));
  });

  await page.goto("/services/hermes-connect/repair-shops/plan/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/plan\/$/);

  await page.locator("#plan-shop-name").fill("Manual Motor Works");
  await page.locator("#plan-contact-name").fill("Morgan Owner");
  await page.locator("#plan-phone").fill("+1 312 555 0101");
  await page.locator("#plan-email").fill("morgan@example.com");
  await page.locator("#plan-city-state").fill("Chicago, IL");
  await page.locator("#plan-goal").fill("Make customer booking and follow-up easier for the front desk.");
  await page.locator("#plan-consent").check();
  await page.locator("#paid-plan-submit").click();

  await expect(page.locator("#paid-plan-status")).toContainText("Request received");
  expect(submitted).not.toBeNull();
  expect(String(submitted?.message || "")).toContain("Hermes Connect shop identity: manual request without authenticated shop linkage");
});
