import { expect, test } from "@playwright/test";

test("Hermes Catalog claim request preserves business identity and verification context", async ({ page }) => {
  await page.goto("/businesses/arkansas/sherwood/seans-autopro-mobile/");

  await expect(page.getByText("Unclaimed profile", { exact: true })).toBeVisible();
  await expect(page.getByText("Not a Hermes customer", { exact: true })).toBeVisible();
  await expect(page.getByText("Not activated", { exact: true })).toBeVisible();
  await expect(page.getByText("Off until owner verification", { exact: true })).toBeVisible();

  const claim = page.getByRole("link", { name: "Request claim / verification" });
  await expect(claim).toBeVisible();

  const href = await claim.getAttribute("href");
  expect(href).toBeTruthy();

  const structured = new URL(href ?? "", "https://hermeslogisticsus.com");
  expect(structured.pathname).toBe("/businesses/request/");
  expect(structured.searchParams.get("type")).toBe("claim");
  expect(structured.searchParams.get("business")).toBe("Sean\'s AutoPro Mobile");
  expect(structured.searchParams.get("profile")).toBe("/businesses/arkansas/sherwood/seans-autopro-mobile/");
  expect(structured.searchParams.get("city")).toBe("Sherwood");
  expect(structured.searchParams.get("state")).toBe("AR");
  expect(structured.searchParams.get("country")).toBe("US");
  expect(structured.searchParams.get("identity")).toBe("arkansas/sherwood/seans-autopro-mobile");
  expect(structured.searchParams.get("evidence")).toBe("PUBLIC-WEB-SEANS-AUTOPRO-20260909");

  await claim.click();
  await expect(page).toHaveURL(/\/businesses\/request\/\?type=claim/);
  await expect(page.locator("[data-context-business-value]")).toHaveText("Sean\'s AutoPro Mobile");
  await expect(page.locator("[data-context-evidence-value]")).toHaveText("PUBLIC-WEB-SEANS-AUTOPRO-20260909");
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/Catalog identity: arkansas\/sherwood\/seans-autopro-mobile/);
  await expect(page.locator('textarea[name="message"]')).toHaveValue(/Evidence reference: PUBLIC-WEB-SEANS-AUTOPRO-20260909/);
});
