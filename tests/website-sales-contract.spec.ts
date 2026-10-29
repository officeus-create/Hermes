import { expect, test } from "@playwright/test";
import {
  canTransitionWebsiteSalesStage,
  privateWebsiteSalesFields,
  recurringAttached,
  validateWebsiteSalesQuote,
  verifiedGrossMargin,
  websiteSalesAnalyticsProjection,
  type WebsiteSalesQuote,
} from "../src/data/website-sales-contract";

const baseQuote: WebsiteSalesQuote = {
  quoteId: "quote-demo-1",
  opportunityId: "opp-demo-1",
  productFamily: "WEBSITE",
  packageId: "BUSINESS_GROWTH_WEBSITE",
  oneTimePriceCents: 279000,
  monthlyRecurringCents: 24900,
  discountClass: "NONE",
  discountPercent: 0,
  approvalState: "AUTO_POLICY",
  approvalReference: null,
  salesRepCode: "rep-demo",
  commissionRateBps: 2000,
  commissionAmountCents: 55800,
  estimatedDeliveryCostCents: null,
  costEvidenceStatus: "NO_COST_EVIDENCE",
  leadSource: "website_inquiry",
  nextAction: "Review proposal",
  stage: "PROPOSAL",
  decisionReason: null,
  caseStudyTerms: "NOT_REQUESTED",
  evidenceReference: null,
  createdAt: "2026-10-26T00:00:00.000Z",
  updatedAt: "2026-10-26T00:00:00.000Z",
};

test("website sales stages preserve truthful forward progression", () => {
  expect(canTransitionWebsiteSalesStage("INQUIRY", "QUALIFIED")).toBe(true);
  expect(canTransitionWebsiteSalesStage("PROPOSAL", "ACCEPTED")).toBe(true);
  expect(canTransitionWebsiteSalesStage("ACCEPTED", "PAID")).toBe(true);
  expect(canTransitionWebsiteSalesStage("PAID", "DELIVERED")).toBe(true);
  expect(canTransitionWebsiteSalesStage("PROPOSAL", "PAID")).toBe(false);
  expect(canTransitionWebsiteSalesStage("DELIVERED", "QUALIFIED")).toBe(false);
});

test("website and platform scope cannot drift", () => {
  expect(validateWebsiteSalesQuote(baseQuote)).toEqual({ valid: true, errors: [] });
  const bad = validateWebsiteSalesQuote({
    ...baseQuote,
    productFamily: "WEBSITE",
    packageId: "PLATFORM_CUSTOM",
  });
  expect(bad.valid).toBe(false);
  expect(bad.errors).toContain("product_family_package_mismatch");
});

test("discount policy requires explicit approval", () => {
  const standard = validateWebsiteSalesQuote({
    ...baseQuote,
    discountClass: "STANDARD",
    discountPercent: 10,
    approvalState: "AUTO_POLICY",
  });
  expect(standard.valid).toBe(true);

  const tooDeep = validateWebsiteSalesQuote({
    ...baseQuote,
    discountClass: "STANDARD",
    discountPercent: 11,
    approvalState: "AUTO_POLICY",
  });
  expect(tooDeep.errors).toContain("standard_discount_exceeds_10_percent");

  const caseStudy = validateWebsiteSalesQuote({
    ...baseQuote,
    discountClass: "CASE_STUDY",
    discountPercent: 15,
    approvalState: "CASE_STUDY_APPROVED",
    approvalReference: "case-study:terms-1",
    caseStudyTerms: "APPROVED",
  });
  expect(caseStudy.valid).toBe(true);

  const caseStudyWithoutReference = validateWebsiteSalesQuote({
    ...baseQuote,
    discountClass: "CASE_STUDY",
    discountPercent: 15,
    approvalState: "CASE_STUDY_APPROVED",
    caseStudyTerms: "APPROVED",
  });
  expect(caseStudyWithoutReference.errors).toContain("case_study_approval_reference_required");

  const ceoWithoutReference = validateWebsiteSalesQuote({
    ...baseQuote,
    discountClass: "CEO_EXCEPTION",
    discountPercent: 20,
    approvalState: "CEO_APPROVED",
  });
  expect(ceoWithoutReference.errors).toContain("ceo_approval_reference_required");

  const ceoWithReference = validateWebsiteSalesQuote({
    ...baseQuote,
    discountClass: "CEO_EXCEPTION",
    discountPercent: 20,
    approvalState: "CEO_APPROVED",
    approvalReference: "ceo:pricing-exception-1",
  });
  expect(ceoWithReference.valid).toBe(true);
});

test("gross margin stays unknown until delivery cost evidence is verified", () => {
  expect(verifiedGrossMargin(baseQuote)).toBeNull();
  const unverifiedPersistedCost = validateWebsiteSalesQuote({
    ...baseQuote,
    estimatedDeliveryCostCents: 100000,
    costEvidenceStatus: "PARTIAL_UNVERIFIED",
  });
  expect(unverifiedPersistedCost.errors).toContain("unverified_delivery_cost_must_not_be_persisted");

  expect(verifiedGrossMargin({
    ...baseQuote,
    estimatedDeliveryCostCents: 100000,
    costEvidenceStatus: "VERIFIED",
    evidenceReference: "drive://verified-cost-packet",
  })).toEqual({ amountCents: 123200, marginBps: 4416 });
});

test("recurring attach is explicit and public analytics excludes private economics", () => {
  expect(recurringAttached(baseQuote)).toBe(true);
  expect(recurringAttached({ monthlyRecurringCents: 0 })).toBe(false);

  const projection = websiteSalesAnalyticsProjection(baseQuote);
  expect(projection).toEqual({ eventName: "website_sales_stage", stage: "PROPOSAL" });

  const publicKeys = new Set(Object.keys(projection));
  for (const field of privateWebsiteSalesFields) {
    expect(publicKeys.has(String(field))).toBe(false);
  }
});
