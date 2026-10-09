export const iamJourneyStates = [
  "DRAFT",
  "RESEARCH_REQUIRED",
  "PLAN_READY",
  "USER_APPROVED",
  "HANDOFF_PENDING",
  "PROVIDER_ACKNOWLEDGED",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
  "CANCELLED",
] as const;
export type IAmJourneyState = typeof iamJourneyStates[number];

export const iamHandoffStates = [
  "NOT_STARTED",
  "USER_APPROVED",
  "REQUEST_PREPARED",
  "PROVIDER_ACCEPTED",
  "PROVIDER_CONFIRMED",
  "FAILED",
  "REVOKED",
] as const;
export type IAmHandoffState = typeof iamHandoffStates[number];

export const iamAffiliateStates = [
  "PROGRAM_DISCOVERED",
  "APPLIED",
  "PROGRAM_APPROVED",
  "TRACKED_LINK_APPROVED",
  "CONSENTED_OUTBOUND",
  "PROVIDER_ORDER_VERIFIED",
  "RETURN_WINDOW_CLEARED",
  "NETWORK_SALE_APPROVED",
  "PAYOUT_VERIFIED",
] as const;
export type IAmAffiliateState = typeof iamAffiliateStates[number];

export type IAmJourneyReceipt = {
  journeyId: string;
  state: IAmJourneyState;
  countryCode: string;
  capabilityIds: readonly string[];
  sourceReviewedAt: string;
  userApprovalAt: string | null;
  providerId: string | null;
  providerReceiptId: string | null;
  updatedAt: string;
};

export const iamEvidenceRules = Object.freeze({
  clickIsNotOrder: true,
  orderIsNotCommission: true,
  commissionIsNotPayout: true,
  httpAcceptedIsNotHumanReceipt: true,
  sourceReadIsNotLegalEligibility: true,
  prototypeIsNotCustomerUse: true,
});

export const italyShoppingPrototypeJourney: Readonly<IAmJourneyReceipt> = Object.freeze({
  journeyId: "prototype:it-shopping",
  state: "PLAN_READY",
  countryCode: "IT",
  capabilityIds: Object.freeze(["intent-router","italy-shopping-shortlist","italy-tax-free-guidance"]),
  sourceReviewedAt: "2026-10-08",
  userApprovalAt: null,
  providerId: null,
  providerReceiptId: null,
  updatedAt: "2026-10-08",
});
