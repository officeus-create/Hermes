import { expect, test } from "@playwright/test";

const path = "/services/hermes-connect/internal/carrier-intake/";
const endpoint = "**/api/internal/carrier-intake?*";
const synthetic = (index: number) => ({
  request_id: "synthetic_owner_carrier_" + String(index).padStart(5, "0"),
  classification: "commercial", status: "new",
  source_path: "/logistics/start-car-hauling-dispatch/",
  contact_email: "example" + index + "@example.invalid",
  created_at: new Date(Date.UTC(2026, 9, 15, 8, index)).toISOString(),
  retention_until: "2099-01-01T00:00:00.000Z",
  delivery_state: "not_sent",
});

test("private carrier review stays inaccessible when the owner capability is absent", async ({ page }) => {
  let requests = 0;
  await page.route(endpoint, async (route) => {
    requests++;
    await route.fulfill({ status: 403, contentType: "application/json",
      body: JSON.stringify({ success: false, error: "hermes_internal_owner_required" }) });
  });
  await page.goto(path);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByText("HERMES_INTERNAL_OWNER access required.")).toBeVisible();
  await expect(page.locator("[data-queue]")).toBeHidden();
  expect(requests).toBe(1);
});

test("private carrier queue pages past 20 without disclosing body until a deliberate review", async ({ page }) => {
  const items = Array.from({ length: 25 }, (_, index) => synthetic(index));
  let outbound = 0;
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    if (request.method() !== "GET") { outbound++; await route.abort(); return; }
    const url = new URL(request.url());
    if (url.pathname !== "/api/internal/carrier-intake") { await route.continue(); return; }
    const id = url.searchParams.get("request_id");
    if (id) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        success: true, request: { ...items.find(row => row.request_id === id),
          email_body: "<script>window.__privacyFail = true</script> Private synthetic carrier detail" },
      }) }); return;
    }
    const offset = url.searchParams.get("cursor") === "page2" ? 20 : 0;
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ success: true, requests: items.slice(offset, offset + 20),
        next_cursor: offset === 0 ? "page2" : null, partial: offset === 0 }) });
  });
  await page.goto(path);
  await expect(page.locator("[data-records] article")).toHaveCount(20);
  await expect(page.locator("[data-page-number]")).toHaveText("Page 1");
  await expect(page.locator("[data-records]")).not.toContainText("Private synthetic carrier detail");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator("[data-records] article")).toHaveCount(5);
  await expect(page.locator("[data-page-number]")).toHaveText("Page 2");
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page.locator("[data-records] article")).toHaveCount(20);
  await page.getByRole("button", { name: "View private details" }).first().click();
  await expect(page.locator("[data-detail]")).toBeVisible();
  await expect(page.locator("[data-detail-body]")).toContainText("Private synthetic carrier detail");
  expect(await page.evaluate(() => (window as typeof window & { __privacyFail?: boolean }).__privacyFail)).toBeUndefined();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.locator("[data-detail-body]")).toHaveText("");
  expect(outbound).toBe(0);
});
