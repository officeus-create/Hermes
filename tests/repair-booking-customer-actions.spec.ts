import { expect, test } from "@playwright/test";

const publicShopPayload = {
  success: true,
  shop: {
    id: "shop-1",
    slug: "apex-auto",
    name: "Apex Auto",
    phone: "+1 (414) 555-0100",
    address_line1: "100 Test Ave",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  },
  services: [
    { id: "svc-1", name: "Diagnostics", duration_minutes: 45 },
  ],
  availability: [
    { day_of_week: 1, is_open: true, start_time: "08:00", end_time: "17:00" },
  ],
};

test("booking confirmation offers the customer direct shop contact actions, not Hermes marketing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/public/repair-shop?*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(publicShopPayload) }),
  );

  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=apex-auto&lang=ru", {
    waitUntil: "domcontentloaded",
  });

  const actions = page.locator("[data-repair-customer-actions]");
  await expect(actions).toHaveCount(1);
  await page.evaluate(() => document.getElementById("success-panel")?.classList.remove("hidden"));

  await expect(actions).toBeVisible();
  await expect(actions).toContainText("Нужно изменить запись? Свяжитесь напрямую с СТО.");
  await expect(actions.getByRole("link", { name: "Позвонить в СТО" })).toHaveAttribute("href", "tel:+14145550100");
  await expect(actions.getByRole("link", { name: "Маршрут" })).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=/);
  await expect(page.getByText("Grow My Business", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Want more customers for your business?", { exact: false })).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
