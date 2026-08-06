import { expect, test } from "@playwright/test";

const pdfPath = "/contracts/Hermes_Carrier_Dispatch_Agreement_Master_DRAFT_v2026-08-05.pdf";
const docxPath = "/contracts/Hermes_Carrier_Dispatch_Agreement_Master_DRAFT_v2026-08-05.docx";
const pdfSha256 = "35b14cf8e68a8cc4a0e4720157e8dd141765868a16b5db3145c94168bbf80e0b";

test("carrier agreement review is private, trust-first, downloadable, and execution-gated", async ({ page, request }) => {
  await page.goto("/logistics/carrier-agreement/");

  await expect(page).toHaveTitle("Carrier Agreement Review | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator("main[data-agreement-version]")).toHaveAttribute(
    "data-agreement-version",
    "DRAFT-2026-08-05",
  );
  await expect(
    page.getByRole("heading", { name: "Clear responsibilities. No hidden transfer of control." }),
  ).toBeVisible();
  await expect(page.getByText("Review draft — not the final execution version", { exact: true })).toBeVisible();
  await expect(page.getByText("You approve every load", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Freight funds go to your company", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Continue to carrier packet/i }).first()).toHaveAttribute(
    "href",
    "/logistics/carrier-onboarding/",
  );

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
  expect(eSignHref).toMatch(/^(\/logistics\/carrier-onboarding\/|https:\/\/)/i);

  const publicCopy = await page.locator("main").innerText();
  expect(publicCopy).toContain("legacy 5.00% rate");
  expect(publicCopy).toContain("The carrier keeps authority over drivers, equipment, safety, routes, compliance, and load acceptance.");
  expect(publicCopy).toContain("Passwords, PINs, W-9s, CDL images, payment credentials, VIN lists, gate codes, release documents, and private shipment records");
  expect(publicCopy).toContain(pdfSha256);
  expect(publicCopy).not.toMatch(/24\s*[–-]\s*48\s+hours/i);
  expect(publicCopy).not.toMatch(/personalized dispatcher.*route planned/i);
  expect(publicCopy).not.toMatch(/limited time|expires today|only \d+ spots|sign now/i);
  await expect(page.locator('input[type="password"], input[name*="password" i], input[name*="pin" i]')).toHaveCount(0);
});
