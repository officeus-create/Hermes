import { expect, test } from "@playwright/test";

test("Hermes Catalog claim request preserves business identity and verification context", async ({ page }) => {
  await page.goto("/businesses/arkansas/sherwood/seans-autopro-mobile/");
  await expect(page.getByText("Unclaimed profile", { exact: true })).toBeVisible();
  await expect(page.getByText("Not a Hermes customer", { exact: true })).toBeVisible();
  await expect(page.getByText("Not linked to this profile", { exact: true })).toBeVisible();
  await expect(page.getByText("Off until owner verification", { exact: true })).toBeVisible();

  const claim = page.getByRole("link", { name: "Request claim / verification" });
  await expect(claim).toBeVisible();
  const href = await claim.getAttribute("href");
  expect(href).toContain("/businesses/request/?");
  const url = new URL(href ?? "", "https://hermeslogisticsus.com");
  expect(url.searchParams.get("type")).toBe("claim");
  expect(url.searchParams.get("business")).toBe("Sean's AutoPro Mobile");
  expect(url.searchParams.get("profile")).toBe("/businesses/arkansas/sherwood/seans-autopro-mobile/");
  expect(url.searchParams.get("identity")).toBe("arkansas/sherwood/seans-autopro-mobile");
  expect(url.searchParams.get("evidence")).toBe("PUBLIC-WEB-SEANS-AUTOPRO-20260909");

  await claim.click();
  await expect(page.locator("[data-catalog-request]")).toHaveAttribute("data-request-type", "claim");
  await expect(page.locator('input[name="company"]')).toHaveValue("Sean's AutoPro Mobile");
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/Catalog identity: arkansas\/sherwood\/seans-autopro-mobile/);
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/Evidence reference: PUBLIC-WEB-SEANS-AUTOPRO-20260909/);
  await expect(page.locator("[data-connect-handoff]")).toHaveAttribute("href", /source=catalog_request/);
  await expect(page.locator("[data-connect-handoff]")).toHaveAttribute("href", /catalog_identity=arkansas%2Fsherwood%2Fseans-autopro-mobile/);
});
