export const REPAIR_SHOP_OFFER_STATUS = "current-public-offer" as const;

export type RepairShopAccessState =
  | "trialing"
  | "founding"
  | "active"
  | "past_due"
  | "cancelled"
  | "comped";

export interface RepairShopOffer {
  id: string;
  name: string;
  priceMonthlyUsd: number;
  billingUnit: string;
  purchaseFlow: "human-confirmation-and-invoice";
  trialAvailable: boolean;
  included: string[];
}

export const REPAIR_SHOP_FOUNDING_OFFER: RepairShopOffer = {
  id: "repair_shop_founding",
  name: "Founding Shop Plan",
  priceMonthlyUsd: 99,
  billingUnit: "per repair shop location",
  purchaseFlow: "human-confirmation-and-invoice",
  trialAvailable: true,
  included: [
    "Owner workspace for one repair shop location",
    "Public shop profile and service catalog",
    "Weekly availability and shareable booking link",
    "Booking inbox with appointment status history",
    "Customer and vehicle context connected to bookings",
    "Private product feedback with founding-customer priority review",
  ],
};

export const REPAIR_SHOP_ACCESS_STATES: readonly RepairShopAccessState[] = [
  "trialing",
  "founding",
  "active",
  "past_due",
  "cancelled",
  "comped",
] as const;
