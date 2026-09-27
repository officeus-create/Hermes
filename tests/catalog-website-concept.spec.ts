import { expect, test } from "@playwright/test";

const conceptPath = "/businesses/ukraine/chaiky/chayka-store/";

test("Catalog Website Concept keeps opportunity details in a reusable dialog", async ({ page }) => {
  await page.goto(conceptPath);

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
