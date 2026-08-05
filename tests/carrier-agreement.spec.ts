import { expect, test } from "@playwright/test";

const pdfPath = "/contracts/Hermes_Carrier_Dispatch_Agreement_Master_DRAFT_v2026-08-05.pdf";
const docxPath = "/contracts/Hermes_Carrier_Dispatch_Agreement_Master_DRAFT_v2026-08-05.docx";
const pdfSha256 = "35b14cf8e68a8cc4a0e4720157e8dd141765868a16b5db3145c94168bbf80e0b";

test("carrier agreement review is private, downloadable, and e-sign ready", async ({ page, request }) => {
  await page.goto("/logistics/carrier-agreement/");

  await expect(page).toHaveTitle("Carrier Agreement Review | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-agreement-version]")).toHaveAttribute(
    "data-agreement-version",
    "DRAFT-2026-08-05",
  );
  await expect(page.getByRole("heading", { name: "Review the Carrier Dispatch Agreement" })).toBeVisible();
  await expect(page.getByText("Draft for attorney review", { exact: true })).toBeVisible();

  const pdfControl = page.locator('[data-contract-download="pdf"]');
  const docxControl = page.locator('[data-contract-download="docx"]');
  await expect(pdfControl).toHaveAttribute("data-download-path", pdfPath);
  await expect(docxControl).toHaveAttribute("data-download-path", docxPath);
  await expect(pdfControl).toHaveRole("button");
  await expect(docxControl).toHaveRole("button");

  const pdfResponse = await request.get(pdfPath);
  expect(pdfResponse.ok()).toBe(true);
  expect((await pdfResponse.body()).subarray(0, 5).toString("ascii")).toBe("%PDF-");

  const docxResponse = await request.get(docxPath);
  expect(docxResponse.ok()).toBe(true);
  expect((await docxResponse.body()).subarray(0, 2).toString("ascii")).toBe("PK");

  const eSignLink = page.locator("[data-contract-esign]");
  const eSignHref = await eSignLink.getAttribute("href");
  expect(eSignHref).toBeTruthy();
  expect(eSignHref).toMatch(/^(mailto:officeus@hermeslogisticsus\.com|https:\/\/)/i);

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).toContain("5.00% fee");
  expect(publicCopy).toContain("Carrier approves every load");
  expect(publicCopy).toContain("No passwords in the agreement");
  expect(publicCopy).toContain(pdfSha256);
  expect(publicCopy).not.toMatch(/24\s*[–-]\s*48\s+hours/i);
  expect(publicCopy).not.toMatch(/personalized dispatcher.*route planned/i);
  await expect(page.locator('input[type="password"], input[name*="password" i], input[name*="pin" i]')).toHaveCount(0);
});
