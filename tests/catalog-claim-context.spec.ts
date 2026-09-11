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

  const decodedHref = decodeURIComponent(href ?? "");
  expect(decodedHref).toContain("mailto:officeus@hermeslogisticsus.com");
  expect(decodedHref).toContain("Claim Hermes Catalog profile: Sean's AutoPro Mobile");
  expect(decodedHref).toContain(
    "Catalog profile: https://hermeslogisticsus.com/businesses/arkansas/sherwood/seans-autopro-mobile/",
  );
  expect(decodedHref).toContain("Location: Sherwood, AR, US");
  expect(decodedHref).toContain("Catalog identity: arkansas/sherwood/seans-autopro-mobile");
  expect(decodedHref).toContain("Evidence reference: PUBLIC-WEB-SEANS-AUTOPRO-20260909");
  expect(decodedHref).toContain(
    "Hermes Connect CRM and public booking must remain inactive until ownership is verified.",
  );
});
