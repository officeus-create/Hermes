export const websiteSalesStages = [
  "INQUIRY",
  "QUALIFIED",
  "PROPOSAL",
  "ACCEPTED",
  "PAID",
  "DELIVERED",
  "LOST",
  "ON_HOLD",
] as const;

export type WebsiteSalesStage = (typeof websiteSalesStages)[number];

export const websitePackageIds = [
  "LAUNCH",
  "BUSINESS_GROWTH_WEBSITE",
  "GROWTH_WEBSITE_SYSTEM",
  "SIGNATURE",
  "PLATFORM_CUSTOM",
] as const;

export type WebsitePackageId = (typeof websitePackageIds)[number];
export type WebsiteProductFamily = "WEBSITE" | "PLATFORM_CUSTOM";
export type WebsiteDiscountClass = "NONE" | "STANDARD" | "CASE_STUDY" | "CEO_EXCEPTION";
export type WebsiteApprovalState = "AUTO_POLICY" | "CASE_STUDY_APPROVED" | "CEO_APPROVED";
export type CostEvidenceStatus = "NO_COST_EVIDENCE" | "PARTIAL_UNVERIFIED" | "VERIFIED";
export type CaseStudyTerms = "NOT_REQUESTED" | "APPROVED" | "DECLINED";

export type WebsiteSalesQuote = {
  quoteId: string;
  opportunityId: string | null;
  productFamily: WebsiteProductFamily;
  packageId: WebsitePackageId;
  oneTimePriceCents: number;
  monthlyRecurringCents: number;
  discountClass: WebsiteDiscountClass;
  discountPercent: number;
  approvalState: WebsiteApprovalState;
  approvalReference: string | null;
  salesRepCode: string;
  commissionRateBps: number;
  commissionAmountCents: number;
  estimatedDeliveryCostCents: number | null;
  costEvidenceStatus: CostEvidenceStatus;
  leadSource: string;
  nextAction: string;
  stage: WebsiteSalesStage;
  decisionReason: string | null;
  caseStudyTerms: CaseStudyTerms;
  evidenceReference: string | null;
  createdAt: string;
  updatedAt: string;
};

export const privateWebsiteSalesFields = new Set<keyof WebsiteSalesQuote>([
  "quoteId",
  "opportunityId",
  "oneTimePriceCents",
  "monthlyRecurringCents",
  "discountClass",
  "discountPercent",
  "approvalState",
  "approvalReference",
  "salesRepCode",
  "commissionRateBps",
  "commissionAmountCents",
  "estimatedDeliveryCostCents",
  "costEvidenceStatus",
  "leadSource",
  "nextAction",
  "decisionReason",
  "caseStudyTerms",
  "evidenceReference",
]);

const forwardStageTransitions: Record<WebsiteSalesStage, readonly WebsiteSalesStage[]> = {
  INQUIRY: ["QUALIFIED", "LOST", "ON_HOLD"],
  QUALIFIED: ["PROPOSAL", "LOST", "ON_HOLD"],
  PROPOSAL: ["ACCEPTED", "LOST", "ON_HOLD"],
  ACCEPTED: ["PAID", "LOST", "ON_HOLD"],
  PAID: ["DELIVERED", "ON_HOLD"],
  DELIVERED: [],
  LOST: [],
  ON_HOLD: ["INQUIRY", "QUALIFIED", "PROPOSAL", "ACCEPTED"],
};

export function canTransitionWebsiteSalesStage(from: WebsiteSalesStage, to: WebsiteSalesStage) {
  return from === to || forwardStageTransitions[from].includes(to);
}

export function expectedProductFamily(packageId: WebsitePackageId): WebsiteProductFamily {
  return packageId === "PLATFORM_CUSTOM" ? "PLATFORM_CUSTOM" : "WEBSITE";
}

export function recurringAttached(quote: Pick<WebsiteSalesQuote, "monthlyRecurringCents">) {
  return quote.monthlyRecurringCents > 0;
}

export function discountPolicyError(
  quote: Pick<WebsiteSalesQuote, "discountClass" | "discountPercent" | "approvalState" | "caseStudyTerms">,
) {
  if (!Number.isFinite(quote.discountPercent) || quote.discountPercent < 0 || quote.discountPercent > 100) {
    return "invalid_discount_percent";
  }
  if (quote.discountClass === "NONE" && quote.discountPercent !== 0) return "discount_class_mismatch";
  if (quote.discountClass === "STANDARD") {
    if (quote.discountPercent > 10) return "standard_discount_exceeds_10_percent";
    if (quote.approvalState !== "AUTO_POLICY") return "standard_discount_wrong_approval";
  }
  if (quote.discountClass === "CASE_STUDY") {
    if (quote.discountPercent > 15) return "case_study_discount_exceeds_15_percent";
    if (quote.caseStudyTerms !== "APPROVED") return "case_study_terms_not_approved";
    if (quote.approvalState !== "CASE_STUDY_APPROVED") return "case_study_discount_wrong_approval";
  }
  if (quote.discountClass === "CEO_EXCEPTION" && quote.approvalState !== "CEO_APPROVED") {
    return "ceo_exception_not_approved";
  }
  return null;
}

export function verifiedGrossMargin(quote: Pick<
  WebsiteSalesQuote,
  "oneTimePriceCents" | "commissionAmountCents" | "estimatedDeliveryCostCents" | "costEvidenceStatus" | "evidenceReference"
>) {
  if (
    quote.costEvidenceStatus !== "VERIFIED" ||
    quote.estimatedDeliveryCostCents === null ||
    !quote.evidenceReference
  ) {
    return null;
  }
  const amountCents = quote.oneTimePriceCents - quote.commissionAmountCents - quote.estimatedDeliveryCostCents;
  const marginBps = quote.oneTimePriceCents > 0
    ? Math.round((amountCents / quote.oneTimePriceCents) * 10_000)
    : null;
  return { amountCents, marginBps };
}

export function validateWebsiteSalesQuote(quote: WebsiteSalesQuote) {
  const errors: string[] = [];
  if (!quote.quoteId.trim()) errors.push("quote_id_required");
  if (!quote.leadSource.trim()) errors.push("lead_source_required");
  if (quote.productFamily !== expectedProductFamily(quote.packageId)) errors.push("product_family_package_mismatch");
  if (!Number.isInteger(quote.oneTimePriceCents) || quote.oneTimePriceCents < 0) errors.push("invalid_one_time_price");
  if (!Number.isInteger(quote.monthlyRecurringCents) || quote.monthlyRecurringCents < 0) errors.push("invalid_monthly_recurring");
  if (!Number.isInteger(quote.commissionAmountCents) || quote.commissionAmountCents < 0) errors.push("invalid_commission");
  if (!Number.isInteger(quote.commissionRateBps) || quote.commissionRateBps < 0) errors.push("invalid_commission_rate");

  const discountError = discountPolicyError(quote);
  if (discountError) errors.push(discountError);
  if (quote.approvalState === "CASE_STUDY_APPROVED" && !quote.approvalReference?.trim()) {
    errors.push("case_study_approval_reference_required");
  }
  if (quote.approvalState === "CEO_APPROVED" && !quote.approvalReference?.trim()) {
    errors.push("ceo_approval_reference_required");
  }

  if (quote.costEvidenceStatus === "VERIFIED") {
    if (quote.estimatedDeliveryCostCents === null || quote.estimatedDeliveryCostCents < 0) {
      errors.push("verified_delivery_cost_required");
    }
    if (!quote.evidenceReference?.trim()) errors.push("verified_cost_evidence_required");
  } else if (quote.estimatedDeliveryCostCents !== null) {
    errors.push("unverified_delivery_cost_must_not_be_persisted");
  }

  return { valid: errors.length === 0, errors };
}

export function websiteSalesAnalyticsProjection(quote: Pick<WebsiteSalesQuote, "stage">) {
  return {
    eventName: "website_sales_stage",
    stage: quote.stage,
  } as const;
}
