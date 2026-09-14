import { expect, test } from "@playwright/test";

test("Catalog exposes Hermes services and a truthful global market registry", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#hermes-services .service-card")).toHaveCount(18);
  await expect(page.getByRole("heading", { name: "Hermes Connect CRM" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hermes Load Board" })).toBeVisible();
  await expect(page.locator("#global-markets").getByText("110-country target registry", { exact: true })).toBeVisible();
  const details = page.locator("#global-markets details");
  await details.locator("summary").click();
  await expect(details.locator(".country-cloud span")).toHaveCount(110);
  await expect(page.locator("#global-markets .city-cloud span")).toHaveCount(36);
  await expect(details).toContainText("Vietnam · Tiếng Việt");
  await expect(details).toContainText("Philippines · Filipino");
  await expect(details).toContainText("Tajikistan · Тоҷикӣ");
  await expect(details).toContainText("Morocco · العربية");
  await expect(details).toContainText("Moldova · Română");
  await expect(details).toContainText("Romania · Română");
  await expect(page.locator("#global-markets [data-country-sample]")).toHaveCount(6);
  await expect(page.locator("#global-markets")).toContainText("Compliance screening required");
  await expect(page.locator("#global-markets")).toContainText("Local language first");
  await expect(page.getByText(/not office claims/i)).toBeVisible();
});

test("Catalog search spans first-party Hermes services and external profiles", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  const input = page.locator("[data-catalog-input]");
  await input.fill("Hermes Connect CRM");
  await expect(page.locator('[data-catalog-card]:not([hidden])')).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Hermes Connect CRM" })).toBeVisible();
  await expect(page.locator("[data-catalog-count]")).toHaveText("1 searchable entry");
});

test("self-promo rail appears in Catalog and every top-level direction", async ({ page }) => {
  for (const path of ["/businesses/", "/paths/logistics/", "/paths/marketing/", "/paths/technology/", "/paths/academy/"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const rail = page.locator("[data-promo-rail]");
    await expect(rail).toBeVisible();
    await expect(rail.locator("[data-promo-slide]")) .toHaveCount(4);
    await expect(rail.locator(".promo-question")).toHaveText("?");
  }
});

test("Hermes Connect preserves desktop CRM treatment and the mobile product entry", async ({ page, isMobile }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  if (isMobile) {
    await page.locator("[data-menu-button]").click();
    await expect(page.locator('[data-hermes-connect-launcher="mobile"]')).toBeVisible();
    await expect(page.locator('[data-hermes-connect-launcher="mobile"]')).toHaveAttribute("href", "/services/hermes-connect/");
    return;
  }
  const launcher = page.locator('[data-hermes-connect-launcher="header"]');
  await expect(launcher).toBeVisible();
  await expect(launcher.getByText("CRM", { exact: true })).toBeVisible();
  await expect(launcher.locator("img")).toHaveCount(0);
  await expect(launcher).toHaveCSS("border-radius", "9px");
});
