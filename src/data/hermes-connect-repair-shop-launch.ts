export const REPAIR_SHOP_FREE_REGISTRATION_END_ISO = "2026-09-16T05:00:00.000Z";
export const REPAIR_SHOP_FREE_REGISTRATION_TIMEZONE = "America/Chicago";
export const REPAIR_SHOP_FREE_REGISTRATION_FREE_THROUGH_LOCAL_DATE = "2026-09-15";
export const REPAIR_SHOP_FREE_REGISTRATION_DISPLAY_DATE = "September 15, 2026";

// Online card billing is still not presented as live. After the free-registration
// window closes, new Repair Shop owners are routed to the current human-confirmation
// Founding Shop Plan rather than to a fake checkout.
export const REPAIR_SHOP_ONLINE_BILLING_ENABLED = false;

export const REPAIR_SHOP_FREE_REGISTRATION_POLICY = {
  id: "repair_shop_free_registration_sep15_2026",
  deadlineIso: REPAIR_SHOP_FREE_REGISTRATION_END_ISO,
  timezone: REPAIR_SHOP_FREE_REGISTRATION_TIMEZONE,
  freeThroughLocalDate: REPAIR_SHOP_FREE_REGISTRATION_FREE_THROUGH_LOCAL_DATE,
  displayDate: REPAIR_SHOP_FREE_REGISTRATION_DISPLAY_DATE,
  onlineBillingEnabled: REPAIR_SHOP_ONLINE_BILLING_ENABLED,
  countLimited: false,
  cardRequired: false,
  afterDeadlineWithoutBilling: "current_plan_required",
  afterDeadline: "current_plan_required",
} as const;
