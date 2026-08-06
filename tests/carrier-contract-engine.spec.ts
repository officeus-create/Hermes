import { expect, test, type Page, type Route } from "@playwright/test";

type SubmittedContractPayload = {
  selected_plan: string;
  service_percentage: string;
  legal_company_name: string;
  company_website: string;
  signer_email: string;
  sales_contact: string;
  offer_code: string;
  signature_jpeg: string;
  [key: string]: unknown;
};

const onboardingRoute = "/logistics/carrier-onboarding/?plan=pro&rate=8&rep=TEST%20Assistant%20107&offer=PRO-AUG&carrier_name=SHOULD_NOT_TRAVEL&mc=123456";

async function drawSignature(page: Page) {
  const canvas = page.locator("[data-signature-canvas]");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Signature canvas is not visible.");
  await canvas.dispatchEvent("pointerdown", { pointerId: 7, pointerType: "pen", isPrimary: true, button: 0, buttons: 1, clientX: box.x + 30, clientY: box.y + box.height * 0.65 });
  await canvas.dispatchEvent("pointermove", { pointerId: 7, pointerType: "pen", isPrimary: true, button: 0, buttons: 1, clientX: box.x + box.width * 0.5, clientY: box.y + box.height * 0.35 });
  await canvas.dispatchEvent("pointerup", { pointerId: 7, pointerType: "pen", isPrimary: true, button: 0, buttons: 0, clientX: box.x + box.width * 0.85, clientY: box.y + box.height * 0.6 });
}

async function completeCarrierPacket(page: Page) {
  let submittedPayload: SubmittedContractPayload | null = null;
  await page.route("**/api/carrier-contract", async (route: Route) => {
    submittedPayload = route.request().postDataJSON() as SubmittedContractPayload;
    await route.fulfill({
      status: 200,
      contentType: "application/pdf",
      headers: {
        "Content-Disposition": 'attachment; filename="Hermes_TEST_Mobile_Carrier_LLC_Signed_Review_Packet.pdf"',
        "X-Hermes-Delivery": "delivered",
        "X-Hermes-Document-Mode": "review",
        "X-Hermes-Pdf-Sha256": "a".repeat(64),
      },
      body: "%PDF-1.4\n% synthetic browser contract packet\n%%EOF\n",
    });
  });

  await page.goto(onboardingRoute);
  await expect(page).toHaveTitle("Carrier Agreement Packet | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: /Review the exact terms. Sign from your phone/i })).toBeVisible();
  await expect(page.locator('input[name="selected_plan"][value="pro"]')).toBeChecked();
  await expect(page).toHaveURL(/\/logistics\/carrier-onboarding\/\?plan=pro$/);
  await expect(page.locator('input[name="service_percentage"]')).toHaveValue("");
  await expect(page.locator('input[name="sales_contact"]')).toHaveValue("");
  await expect(page.locator('input[name="offer_code"]')).toHaveValue("");
  await page.locator('input[name="service_percentage"]').fill("8");
  await page.locator('input[name="sales_contact"]').fill("TEST Assistant 107");
  await page.locator('input[name="offer_code"]').fill("PRO-AUG");
  await expect(page.locator("[data-step-label]")).toHaveText("Step 1 of 3");
  await expect(page.getByText("No full street address required", { exact: true })).toBeVisible();
  await expect(page.locator('input[name="business_address"], input[name="city"], input[name="state"], input[name="zip"]')).toHaveCount(0);
  await expect(page.locator('input[name="equipment_types"], input[name="load_boards"], select[name="access_handoff_method"]')).toHaveCount(0);
  await expect(page.locator('input[name*="password" i], input[name*="pin" i], input[name*="token" i]')).toHaveCount(0);

  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 2 of 3");
  await page.locator('input[name="legal_company_name"]').fill("TEST Mobile Carrier LLC");
  await page.locator('input[name="mc_number"]').fill("123456");
  await page.locator('input[name="company_website"]').fill("https://carrier.example.com");
  await page.locator('input[name="signer_name"]').fill("Test Mobile Signer");
  await page.locator('input[name="signer_title"]').fill("Owner");
  await page.locator('input[name="signer_email"]').fill("carrier-mobile@example.com");
  await page.locator('input[name="signer_phone"]').fill("+1 414 555 0155");

  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 3 of 3");
  await expect(page.locator("[data-plan-summary]")).toContainText("Full Partnership · 8%");
  await expect(page.getByText("Carrier approves every load and keeps operating control.", { exact: true })).toBeVisible();
  await page.locator('input[name="typed_signature"]').fill("Test Mobile Signer");
  for (const consent of ["consent_electronic_records", "consent_authority", "consent_document_review", "consent_selected_scope"]) {
    await page.locator(`input[name="${consent}"]`).check();
  }
  await drawSignature(page);

  const invalidFields = await page.locator("#carrier-onboarding-form").evaluate((node) => {
    const form = node as HTMLFormElement;
    return [...form.elements]
      .filter((element): element is HTMLInputElement | HTMLTextAreaElement => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
      .filter((element) => !element.checkValidity())
      .map((element) => element.name || element.id || element.tagName);
  });
  expect(invalidFields).toEqual([]);

  await page.getByRole("button", { name: /Create signed packet/i }).click();
  await page.waitForTimeout(250);
  if (!submittedPayload) {
    const formError = (await page.locator("[data-form-error]").textContent())?.trim() || "No visible form error";
    throw new Error(`The contract endpoint was not called. Form status: ${formError}`);
  }

  const payload: SubmittedContractPayload = submittedPayload;
  expect(payload.selected_plan).toBe("pro");
  expect(payload.service_percentage).toBe("8");
  expect(payload.legal_company_name).toBe("TEST Mobile Carrier LLC");
  expect(payload.company_website).toBe("https://carrier.example.com");
  expect(payload.signer_email).toBe("carrier-mobile@example.com");
  expect(payload.sales_contact).toBe("TEST Assistant 107");
  expect(payload.offer_code).toBe("PRO-AUG");
  expect(payload.signature_jpeg).toMatch(/^data:image\/jpeg;base64,/);
  expect(payload.consent_electronic_records).toBe(true);
  expect(payload.consent_authority).toBe(true);
  expect(payload.consent_document_review).toBe(true);
  expect(payload.consent_selected_scope).toBe(true);
  for (const prohibited of ["business_address", "city", "state", "zip", "equipment_types", "preferred_lanes", "load_boards", "access_handoff_method", "password", "internal_recipients"]) {
    expect(payload).not.toHaveProperty(prohibited);
  }
}

test("carrier can complete the three-step mobile agreement and finger-signature workflow", async ({ page }) => {
  await completeCarrierPacket(page);
});

test("public carrier links never propagate raw commercial or identity context", async ({ page }) => {
  await page.goto("/carrier/?plan=pro&rate=8&rep=Assistant%20107&offer=PRO-AUG&carrier_name=SHOULD_NOT_TRAVEL&mc=123456");
  const primary = page.getByRole("link", { name: /Review and sign/i }).first();
  await expect(primary).toHaveAttribute("href", "/logistics/carrier-onboarding/");
  const href = await primary.getAttribute("href");
  expect(href).not.toMatch(/plan=|rate=|rep=|offer=|carrier_name|mc=|123456/);
  await expect(page.locator("[data-carrier-sms]")).toHaveAttribute("href", /sms:.*hermeslogisticsus\.com%2Fsign%2F/i);
  await expect(page.getByText("Non-exclusive · no minimum volume", { exact: true })).toBeVisible();
  await expect(page.getByText("Freight funds go to your company or factor", { exact: true })).toBeVisible();
});

test("custom plan requires scope, ignores raw rate parameters, and remains a review proposal", async ({ page }) => {
  await page.goto("/logistics/carrier-onboarding/?plan=custom&rate=7.25&rep=UNTRUSTED&offer=UNTRUSTED");
  await expect(page.locator('input[name="selected_plan"][value="custom"]')).toBeChecked();
  await expect(page).toHaveURL(/\/logistics\/carrier-onboarding\/\?plan=custom$/);
  await expect(page.locator('input[name="service_percentage"]')).toHaveValue("");
  await expect(page.locator('input[name="sales_contact"]')).toHaveValue("");
  await expect(page.locator('input[name="offer_code"]')).toHaveValue("");
  await expect(page.locator("[data-custom-plan]")).toBeVisible();
  await expect(page.locator('textarea[name="custom_scope"]')).toHaveAttribute("required", "");
  await expect(page.getByText(/custom submission creates only a proposal\/review record/i)).toBeVisible();
});