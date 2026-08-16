export const REPAIR_SHOP_FREE_REGISTRATION_END_ISO = "2026-08-30T20:28:52.000Z";

// Keep this false until a real online payment flow is production-ready.
// When false, registration remains free after the countdown instead of creating a fake paywall.
export const REPAIR_SHOP_ONLINE_BILLING_ENABLED = false;

export const REPAIR_SHOP_FREE_REGISTRATION_POLICY = {
  id: "repair_shop_free_launch_registration",
  deadlineIso: REPAIR_SHOP_FREE_REGISTRATION_END_ISO,
  onlineBillingEnabled: REPAIR_SHOP_ONLINE_BILLING_ENABLED,
  countLimited: false,
  cardRequired: false,
  afterDeadlineWithoutBilling: "remain_free",
} as const;
