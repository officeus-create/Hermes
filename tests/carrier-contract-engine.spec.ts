import { expect, test, type Page, type Route } from "@playwright/test";

type SubmittedContractPayload = {
  selected_plan: string;
  legal_company_name: string;
  signer_email: string;
  load_boards: string[];
  access_handoff_method: string;
  sales_contact: string;
  signature_jpeg: string;
  [key: string]: unknown;
};

const onboardingRoute = "/logistics/carrier-onboarding/?plan=pro";

async function completeCarrierPacket(page: Page) {
  await page.goto(onboardingRoute);

  await expect(page).toHaveTitle("Carrier Onboarding and Signature | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: /Complete the carrier packet from your phone/i })).toBeVisible();
  await expect(page.locator('input[name="selected_plan"][value="pro"]')).toBeChecked();
  await expect(page.getByText("No load-board passwords are collected here", { exact: true })).toBeVisible();
  await expect(page.locator('input[name*="password" i], input[name*="pin" i], input[name*="token" i], textarea[name*="password" i]')).toHaveCount(0);
  await expect(page.locator("[data-step-label]")).toHaveText("Step 1 of 5");

  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 2 of 5");
  await page.locator('input[name="legal_company_name"]').fill("TEST Mobile Carrier LLC");
  await page.locator('input[name="mc_number"]').fill("123456");
  await page.locator('input[name="signer_name"]').fill("Test Mobile Signer");
  await page.locator('input[name="signer_title"]').fill("Owner");
  await page.locator('input[name="signer_email"]').fill("carrier-mobile@example.com");
  await page.locator('input[name="signer_phone"]').fill("+1 414 555 0155");

  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 3 of 5");
  await page.locator('input[name="equipment_types"][value="Car hauler"]').check();
  await page.locator('input[name="fleet_size"]').fill("2");
  await page.locator('input[name="home_base"]').fill("Milwaukee, WI");
  await page.locator('textarea[name="preferred_lanes"]').fill("Wisconsin to Illinois and return toward Milwaukee");
  await page.locator('input[name="max_deadhead"]').fill("100 miles");

  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 4 of 5");
  await page.locator('input[name="load_boards"][value="Central Dispatch"]').check();
  await page.locator('input[name="load_boards"][value="DAT"]').check();
  await page.locator('select[name="access_handoff_method"]').selectOption({ label: "Separate secure handoff to assigned load planner" });
  await page.locator('input[name="sales_contact"]').fill("TEST Assistant 107");
  await expect(page.getByText(/Passwords, PINs, API tokens, recovery codes/i)).toBeVisible();

  await page.locator("[data-next]").click();
  await expect(page.locator("[data-step-label]")).toHaveText("Step 5 of 5");
  await expect(page.locator("[data-plan-summary]")).toContainText("Hermes Pro · 8%");
  await page.locator('input[name="typed_signature"]').fill("Test Mobile Signer");
  for (const consent of [
    "consent_electronic_records",
    "consent_authority",
    "consent_document_review",
    "consent_selected_scope",
  ]) {
    await page.locator(`input[name="${consent}"]`).check();
  }

  const canvas = page.locator("[data-signature-canvas]");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Signature canvas is not visible.");
  const startX = box.x + 30;
  const startY = box.y + box.height * 0.65;
  await canvas.dispatchEvent("pointerdown", {
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    button: 0,
    buttons: 1,
    clientX: startX,
    clientY: startY,
  });
  await canvas.dispatchEvent("pointermove", {
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    button: 0,
    buttons: 1,
    clientX: box.x + box.width * 0.5,
    clientY: box.y + box.height * 0.35,
  });
  await canvas.dispatchEvent("pointerup", {
    pointerId: 7,
    pointerType: "pen",
    isPrimary: true,
    button: 0,
    buttons: 0,
    clientX: box.x + box.width * 0.85,
    clientY: box.y + box.height * 0.6,
  });

  const invalidFields = await page.locator("#carrier-onboarding-form").evaluate((node) => {
    const form = node as HTMLFormElement;
    return [...form.elements]
      .filter((element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
        element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement,
      )
      .filter((element) => !element.checkValidity())
      .map((element) => element.name || element.id || element.tagName);
  });
  expect(invalidFields).toEqual([]);

  let submittedPayload: SubmittedContractPayload | null = null;
  await page.route("**/api/carrier-contract", async (route: Route) => {
    submittedPayload = route.request().postDataJSON() as SubmittedContractPayload;
    await route.fulfill({
      status: 200,
      contentType: "application/pdf",
      headers: {
        "Content-Disposition": 'attachment; filename="Hermes_TEST_Mobile_Carrier_LLC_Signed_Appendix_A.pdf"',
        "X-Hermes-Delivery": "delivered",
        "X-Hermes-Document-Mode": "review",
        "X-Hermes-Pdf-Sha256": "a".repeat(64),
      },
      body: "%PDF-1.4\n% synthetic browser contract packet\n%%EOF\n",
    });
  });

  await page.getByRole("button", { name: /Create and send signed packet/i }).click();
  await page.waitForTimeout(250);
  if (!submittedPayload) {
    const formError = (await page.locator("[data-form-error]").textContent())?.trim() || "No visible form error";
    throw new Error(`The contract endpoint was not called. Form status: ${formError}`);
  }

  const payload: SubmittedContractPayload = submittedPayload;
  expect(payload.selected_plan).toBe("pro");
  expect(payload.legal_company_name).toBe("TEST Mobile Carrier LLC");
  expect(payload.signer_email).toBe("carrier-mobile@example.com");
  expect([...payload.load_boards].sort()).toEqual(["Central Dispatch", "DAT"].sort());
  expect(payload.access_handoff_method).toBe("Separate secure handoff to assigned load planner");
  expect(payload.sales_contact).toBe("TEST Assistant 107");
  expect(payload.signature_jpeg).toMatch(/^data:image\/jpeg;base64,/);
  expect(payload.consent_electronic_records).toBe(true);
  expect(payload.consent_authority).toBe(true);
  expect(payload.consent_document_review).toBe(true);
  expect(payload.consent_selected_scope).toBe(true);
  expect(payload).not.toHaveProperty("password");
  expect(payload).not.toHaveProperty("internal_recipients");
}

test("carrier can complete the Pro onboarding and finger-signature workflow", async ({ page }) => {
  await completeCarrierPacket(page);
});

test("custom plan reveals proposal fields and remains non-binding", async ({ page }) => {
  await page.goto("/logistics/carrier-onboarding/?plan=custom");
  await expect(page.locator('input[name="selected_plan"][value="custom"]')).toBeChecked();
  await expect(page.locator("[data-custom-plan]")).toBeVisible();
  await expect(page.locator('input[name="custom_percentage"]')).toHaveAttribute("required", "");
  await expect(page.getByText(/proposal is non-binding/i)).toBeVisible();
});
