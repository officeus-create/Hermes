import { expect, test, type Locator, type Page } from "@playwright/test";

type DataLayerEvent = Record<string, unknown> & { event?: string };

async function carrierEvents(page: Page) {
  return page.evaluate(() => {
    const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    return dataLayer
      .filter((entry): entry is Record<string, unknown> => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
        const eventName = (entry as { event?: unknown }).event;
        return typeof eventName === "string" && (
          eventName.startsWith("carrier_contract") ||
          eventName === "commercial_cta_click"
        );
      })
      .map((entry) => Object.fromEntries(
        Object.entries(entry).filter(([key]) => !key.startsWith("gtm.")),
      ));
  }) as Promise<DataLayerEvent[]>;
}

async function preventNavigation(locator: Locator) {
  await locator.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true });
  });
}

test("carrier sales choices, sharing, and document actions emit controlled events", async ({ page }) => {
  await page.goto("/carrier/");

  const offerLink = page.getByRole("link", { name: "See what Hermes handles" });
  await preventNavigation(offerLink);
  await offerLink.click();
  await page.locator("[data-carrier-copy]").click();

  let events = await carrierEvents(page);
  expect(events.filter((entry) => entry.event === "commercial_cta_click")).toContainEqual({
    event: "commercial_cta_click",
    cta_type: "carrier_offer_review",
    audience_type: "carrier",
    page_group: "carrier_contract",
    service_group: "carrier_contract",
    page_path: "/carrier/",
    destination_path: "/logistics/carrier-offer/",
  });
  expect(events.filter((entry) => entry.event === "carrier_contract_share")).toContainEqual({
    event: "carrier_contract_share",
    handoff_method: "copy",
    audience_type: "carrier",
    page_group: "carrier_contract",
    service_group: "carrier_contract",
    page_path: "/carrier/",
  });

  await page.goto("/logistics/carrier-agreement/");
  const pdfControl = page.locator('[data-contract-download="pdf"]');
  await preventNavigation(pdfControl);
  await pdfControl.click();
  const esignLink = page.locator("[data-contract-esign]").first();
  await preventNavigation(esignLink);
  await esignLink.click();

  events = await carrierEvents(page);
  const documentActions = events.filter((entry) => entry.event === "carrier_contract_document_action");
  expect(documentActions).toContainEqual({
    event: "carrier_contract_document_action",
    cta_type: "agreement_pdf_download",
    audience_type: "carrier",
    page_group: "carrier_agreement",
    service_group: "carrier_contract",
    page_path: "/logistics/carrier-agreement/",
  });
  expect(documentActions).toContainEqual({
    event: "carrier_contract_document_action",
    cta_type: "carrier_esign_request",
    handoff_method: "site_packet",
    audience_type: "carrier",
    page_group: "carrier_agreement",
    service_group: "carrier_contract",
    page_path: "/logistics/carrier-agreement/",
  });
});

test("carrier onboarding records steps one through three and packet status without form values", async ({ page }) => {
  await page.goto("/logistics/carrier-onboarding/?plan=essential");

  const servicePercentage = page.locator('input[name="service_percentage"]');
  await expect(servicePercentage).toHaveValue("6");
  await expect(servicePercentage).toHaveAttribute("readonly", "");
  await expect(servicePercentage).toHaveAttribute("min", "6");
  await expect(servicePercentage).toHaveAttribute("max", "6");
  await page.locator("[data-next]").click();

  await page.locator('input[name="legal_company_name"]').fill("PRIVATE TEST Carrier LLC");
  await page.locator('input[name="mc_number"]').fill("987654");
  await page.locator('input[name="signer_name"]').fill("Private Test Signer");
  await page.locator('input[name="signer_title"]').fill("Owner");
  await page.locator('input[name="signer_email"]').fill("private-analytics-test@example.com");
  await page.locator('input[name="signer_phone"]').fill("+1 414 555 0199");
  await page.locator("[data-next]").click();

  await expect(page.locator("[data-step-label]")).toHaveText("Step 3 of 3");
  await page.waitForFunction(() => {
    const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    return dataLayer.some((entry) => (
      entry && typeof entry === "object" &&
      (entry as { event?: unknown }).event === "carrier_contract_step_reached" &&
      Number((entry as { stepNumber?: unknown }).stepNumber) === 3
    ));
  });

  await page.locator("[data-result-title]").evaluate((element) => {
    element.textContent = "Your PDF packet is ready and copies were sent.";
  });
  await page.waitForFunction(() => {
    const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
    return dataLayer.some((entry) => (
      entry && typeof entry === "object" &&
      (entry as { event?: unknown }).event === "carrier_contract_packet_result"
    ));
  });

  const events = await carrierEvents(page);
  const starts = events.filter((entry) => entry.event === "carrier_contract_intake_start");
  expect(starts).toHaveLength(1);
  expect(starts[0]).toEqual({
    event: "carrier_contract_intake_start",
    audience_type: "carrier",
    page_group: "carrier_contract_onboarding",
    service_group: "carrier_contract",
    page_path: "/logistics/carrier-onboarding/",
  });

  const reachedSteps = events
    .filter((entry) => entry.event === "carrier_contract_step_reached")
    .map((entry) => Number(entry.stepNumber))
    .sort((left, right) => left - right);
  expect(reachedSteps).toEqual([1, 2, 3]);

  expect(events.filter((entry) => entry.event === "carrier_contract_packet_result")).toContainEqual({
    event: "carrier_contract_packet_result",
    preview_status: "delivered",
    audience_type: "carrier",
    page_group: "carrier_contract_onboarding",
    service_group: "carrier_contract",
    page_path: "/logistics/carrier-onboarding/",
  });

  const serialized = JSON.stringify(events);
  for (const prohibitedValue of [
    "PRIVATE TEST Carrier LLC",
    "987654",
    "Private Test Signer",
    "private-analytics-test@example.com",
    "+1 414 555 0199",
  ]) {
    expect(serialized).not.toContain(prohibitedValue);
  }

  const approvedKeys = new Set([
    "event",
    "cta_type",
    "audience_type",
    "page_group",
    "service_group",
    "page_path",
    "destination_path",
    "handoff_method",
    "stepNumber",
    "preview_status",
  ]);
  for (const event of events) {
    for (const key of Object.keys(event)) expect(approvedKeys.has(key)).toBe(true);
  }
});
