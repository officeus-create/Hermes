import { expect, test } from "@playwright/test";

const pdfAssetPath = "/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf";
const pdfReviewPath = "/contracts/carrier-agreement-v3/";
const pdfSha256 = "ac35ae765617010dd7551b4a22537b32715923c49601d9aac1f21bbb5e0904a8";
const version = "HERMES-CARRIER-EXECUTION-V2026-08-06";

test("carrier agreement execution summary is private, links to the PDF viewer, and routes to signing", async ({ page, request }) => {
  await page.goto("/logistics/carrier-agreement/");

  await expect(page).toHaveTitle("Carrier Agreement | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-agreement-version]")).toHaveAttribute("data-agreement-version", version);
  await expect(page.getByRole("heading", { name: "Read the important terms without legal fog." })).toBeVisible();
  await expect(page.getByText(version, { exact: false })).toBeVisible();

  const pdfControl = page.locator('[data-contract-download="pdf"]');
  await expect(pdfControl).toHaveAttribute("href", pdfReviewPath);
  await expect(pdfControl).toHaveAttribute("data-pdf-asset", pdfAssetPath);
  await expect(pdfControl).toHaveRole("link");

  const pdfResponse = await request.get(pdfAssetPath);
  expect(pdfResponse.ok()).toBe(true);
  expect((await pdfResponse.body()).subarray(0, 5).toString("ascii")).toBe("%PDF-");

  const eSignLink = page.locator("[data-contract-esign]").first();
  await expect(eSignLink).toHaveAttribute("href", /\/logistics\/carrier-onboarding\//);

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).toContain("Carrier approves every load");
  expect(publicCopy).toContain("Percentage only in Appendix A");
  expect(publicCopy).toContain("No personal guaranty or UCC lien");
  expect(publicCopy).toContain(pdfSha256);
  expect(publicCopy).not.toMatch(/<strong>\s*(?:5|6|8)(?:\.00)?%\s*service fee/i);
  await expect(page.locator('input[type="password"], input[name*="password" i], input[name*="pin" i]')).toHaveCount(0);
});

test("PDF viewer page embeds the same execution master and offers a real download", async ({ page, request }) => {
  await page.goto(pdfReviewPath);

  await expect(page).toHaveTitle("Carrier Agreement Execution PDF | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-agreement-version]")).toHaveAttribute("data-agreement-version", version);
  await expect(page.locator("main[data-pdf-asset]")).toHaveAttribute("data-pdf-asset", pdfAssetPath);
  await expect(page.locator("object[data]")).toHaveAttribute("data", pdfAssetPath);

  const downloadPromise = page.waitForEvent("download");
  await page.locator("[data-download-pdf]").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf");

  const pdfResponse = await request.get(pdfAssetPath);
  expect(pdfResponse.ok()).toBe(true);
  expect((await pdfResponse.body()).subarray(0, 5).toString("ascii")).toBe("%PDF-");
});
