import { expect, test } from "@playwright/test";

const conceptPath = "/businesses/ukraine/chaiky/chayka-store/";

test("Catalog Website Concept keeps opportunity details in a reusable dialog", async ({ page }) => {
  await page.goto(conceptPath);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/businesses/ukraine/chaiky/chayka-store/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  const schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schemaText).toContain('"LocalBusiness"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).not.toContain('"AutoRepair"');

  await expect(page.locator('form[action="/businesses/request/"] input[name="requested_service"]')).toHaveValue("Phone repair & accessories");

  const offer = page.getByRole("button", { name: "Сайт / редизайн" });
  await expect(offer).toBeVisible();
  await offer.click();

  const dialog = page.locator("[data-catalog-opportunity-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Сайт / редизайн" })).toBeVisible();
  await expect(dialog).toContainText("не підтвердження активної послуги");

  const requestHref = await dialog.locator("[data-catalog-opportunity-request]").getAttribute("href");
  const requestUrl = new URL(requestHref!, "https://hermeslogisticsus.com");
  expect(requestUrl.pathname).toBe("/businesses/request/");
  expect(requestUrl.searchParams.get("type")).toBe("catalog-growth");
  expect(requestUrl.searchParams.get("business")).toBe("Чайка Store");
  expect(requestUrl.searchParams.get("interest")).toBe("Сайт / редизайн");
  expect(requestUrl.searchParams.get("profile")).toContain(conceptPath);

  await dialog.locator("[data-catalog-opportunity-close]").click();
  await expect(dialog).toBeHidden();
});

test("Catalog Website Concept opportunity dialog follows English locale", async ({ page }) => {
  await page.goto(`${conceptPath}?lang=en`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const offer = page.getByRole("button", { name: "Website / redesign" });
  await expect(offer).toBeVisible();
  await offer.click();

  const dialog = page.locator("[data-catalog-opportunity-dialog]");
  await expect(dialog.getByRole("heading", { name: "Website / redesign" })).toBeVisible();
  await expect(dialog).toContainText("does not confirm an active service");

  const requestHref = await dialog.locator("[data-catalog-opportunity-request]").getAttribute("href");
  const requestUrl = new URL(requestHref!, "https://hermeslogisticsus.com");
  expect(requestUrl.searchParams.get("interest")).toBe("Website / redesign");
  expect(requestUrl.searchParams.get("profile")).toContain("?lang=en");
});


test("non-US Catalog locality hub uses generic business semantics", async ({ page }) => {
  await page.goto("/businesses/ukraine/chaiky/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Businesses in Chaiky");
  await expect(page.getByText("Business categories", { exact: true })).toBeVisible();
  await expect(page.getByText("Repair categories", { exact: true })).toHaveCount(0);
});


test("Catalog customer request keeps target context fixed and accepts email-only contact", async ({ page }) => {
  await page.goto(conceptPath);
  await page.locator("#catalog-request form button[type=submit]").click();
  await expect(page).toHaveURL(/\/businesses\/request\/\?/);

  const company = page.locator('input[name="company"]');
  const cityCountry = page.locator('input[name="city_country"]');
  const profile = page.locator('input[name="website_or_social"]');
  const requestedService = page.locator('input[name="requested_service"]');

  await expect(company).toHaveValue("Чайка Store");
  await expect(company).toHaveJSProperty("readOnly", true);
  await expect(cityCountry).toHaveValue("Chaiky, UA");
  await expect(cityCountry).toHaveJSProperty("readOnly", true);
  await expect(profile).toHaveJSProperty("readOnly", true);
  await expect(profile).toHaveValue(/businesses\/ukraine\/chaiky\/chayka-store\//);
  await expect(requestedService).toHaveValue("Phone repair & accessories");
  await expect(requestedService).toHaveAttribute("required", "");

  let deliveredPayload: Record<string, unknown> | undefined;
  await page.route("**/api/business-lead", async (route) => {
    deliveredPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.locator('input[name="name"]').fill("Catalog QA");
  await page.locator('input[name="email"]').fill("catalog.qa@example.com");
  await page.locator('input[name="preferred_contact_time"]').fill("10:00–13:00 EET");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Send request" }).click();

  await expect(page.getByRole("heading", { name: "Request received." })).toBeVisible();
  expect(deliveredPayload).toBeDefined();
  expect(deliveredPayload?.services).toEqual(["Catalog customer request"]);
  expect((deliveredPayload?.catalog_context as Record<string, unknown>)?.business_id).toBe("catalog-ua-chayka-store");
  expect((deliveredPayload?.catalog_context as Record<string, unknown>)?.requested_service).toBe("Phone repair & accessories");
  expect(deliveredPayload?.whatsapp).toBe("");
  expect(deliveredPayload?.telegram).toBe("");
});
