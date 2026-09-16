// The owner has not set an end date. Keep this explicit rather than fabricating one.
// Registration remains available so a shop can configure the product before it asks
// Hermes for the human-confirmed, invoice-based paid activation.
export const REPAIR_SHOP_ONLINE_BILLING_ENABLED = false;

export const REPAIR_SHOP_LAUNCH_PROMOTION = {
  id: "repair_shop_launch_promotion_active",
  active: true,
  priceMonthlyUsd: 3,
  billingUnit: "per repair shop location",
  onlineBillingEnabled: REPAIR_SHOP_ONLINE_BILLING_ENABLED,
  cardRequired: false,
  purchaseFlow: "human-confirmation-and-invoice",
} as const;
