export type EvidenceStrength = "none" | "weak" | "moderate" | "strong";
export type ReviewStatus = "unreviewed" | "needs_evidence" | "ready_for_scoring" | "approved" | "rejected";
export type PublicationStatus = "research_only" | "blocked" | "eligible_for_draft" | "approved_for_publish";

export interface SourceReference {
  sourceId: string;
  sourceType:
    | "historical_route_export"
    | "search_console"
    | "keyword_research"
    | "serp_review"
    | "analytics"
    | "crm"
    | "official_registry"
    | "business_record"
    | "owner_approved_fact";
  title: string;
  locator: string;
  retrievedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string;
}

export interface EvidenceField {
  strength: EvidenceStrength;
  summary: string;
  sourceIds: string[];
}

export interface CarrierPageResearchRecord {
  id: string;
  laneId: string;
  origin: { city: string; state: string };
  destination: { city: string; state: string };
  equipment:
    | "open_car_hauler"
    | "enclosed_car_hauler"
    | "hotshot_car_hauler"
    | "multi_car_trailer";
  audience: "owner_operator" | "carrier" | "small_fleet";
  language: "en" | "es" | "ru" | "uk" | "ro" | "lt" | "hi" | "pa" | "gu";
  routeEvidence: EvidenceField;
  demandEvidence: EvidenceField;
  competitionEvidence: EvidenceField;
  serviceFitEvidence: EvidenceField;
  uniqueLocalValue: string[];
  sourceIds: string[];
  reviewedAt?: string;
  reviewer?: string;
  reviewStatus: ReviewStatus;
  publicationStatus: PublicationStatus;
  proposedPath?: string;
}

export interface DealerShipperDemandRecord {
  id: string;
  linkedLaneIds: string[];
  market: { city: string; state: string };
  audience:
    | "independent_dealer"
    | "dealer_group"
    | "shipper"
    | "auction_buyer"
    | "remarketing_company"
    | "broker"
    | "private_customer";
  demandType:
    | "single_vehicle"
    | "recurring_volume"
    | "auction_pickup"
    | "dealer_transfer"
    | "port_or_storage_pickup"
    | "classic_or_luxury_vehicle";
  demandEvidence: EvidenceField;
  carrierCapacityEvidence: EvidenceField;
  competitionEvidence: EvidenceField;
  operationalFitEvidence: EvidenceField;
  sourceIds: string[];
  reviewedAt?: string;
  reviewer?: string;
  reviewStatus: ReviewStatus;
  publicationStatus: PublicationStatus;
  proposedPath?: string;
}

export interface WebsiteSeoMarketResearchRecord {
  id: string;
  country: "US";
  market: { city: string; state: string };
  niche:
    | "logistics"
    | "independent_auto_dealer"
    | "beauty"
    | "education"
    | "professional_services"
    | "home_services"
    | "immigrant_owned_business";
  service:
    | "website_creation"
    | "website_redesign"
    | "seo"
    | "local_seo"
    | "multilingual_website"
    | "crm_automation";
  demandEvidence: EvidenceField;
  competitionEvidence: EvidenceField;
  serviceFitEvidence: EvidenceField;
  proofAvailable: string[];
  sourceIds: string[];
  reviewedAt?: string;
  reviewer?: string;
  reviewStatus: ReviewStatus;
  publicationStatus: PublicationStatus;
  proposedPath?: string;
}

export interface InternationalMarketingMarketRecord {
  id: string;
  countryCode: string;
  city: string;
  language: "ru" | "uk";
  audienceNeed:
    | "website_creation"
    | "seo"
    | "local_seo"
    | "social_media_marketing"
    | "lead_generation"
    | "marketing_training";
  languageDemandEvidence: EvidenceField;
  commercialDemandEvidence: EvidenceField;
  competitionEvidence: EvidenceField;
  paymentEligibilityEvidence: EvidenceField;
  complianceEvidence: EvidenceField;
  serviceCapacityEvidence: EvidenceField;
  sourceIds: string[];
  reviewedAt?: string;
  reviewer?: string;
  reviewStatus: ReviewStatus;
  publicationStatus: PublicationStatus;
  proposedPath?: string;
}

export const sourceReferences: SourceReference[] = [];
export const carrierPageResearchRecords: CarrierPageResearchRecord[] = [];
export const dealerShipperDemandRecords: DealerShipperDemandRecord[] = [];
export const websiteSeoMarketResearchRecords: WebsiteSeoMarketResearchRecord[] = [];
export const internationalMarketingMarketRecords: InternationalMarketingMarketRecord[] = [];

export function hasApprovedEvidence(field: EvidenceField): boolean {
  return field.strength === "strong" && field.sourceIds.length > 0 && field.summary.trim().length > 0;
}

export function canPublishCarrierRecord(record: CarrierPageResearchRecord): boolean {
  return (
    record.reviewStatus === "approved" &&
    record.publicationStatus === "approved_for_publish" &&
    record.sourceIds.length > 0 &&
    record.uniqueLocalValue.length > 0 &&
    hasApprovedEvidence(record.routeEvidence) &&
    hasApprovedEvidence(record.demandEvidence) &&
    hasApprovedEvidence(record.competitionEvidence) &&
    hasApprovedEvidence(record.serviceFitEvidence)
  );
}

export function canPublishDemandRecord(record: DealerShipperDemandRecord): boolean {
  return (
    record.reviewStatus === "approved" &&
    record.publicationStatus === "approved_for_publish" &&
    record.linkedLaneIds.length > 0 &&
    record.sourceIds.length > 0 &&
    hasApprovedEvidence(record.demandEvidence) &&
    hasApprovedEvidence(record.carrierCapacityEvidence) &&
    hasApprovedEvidence(record.competitionEvidence) &&
    hasApprovedEvidence(record.operationalFitEvidence)
  );
}

export function canPublishWebsiteSeoRecord(record: WebsiteSeoMarketResearchRecord): boolean {
  return (
    record.reviewStatus === "approved" &&
    record.publicationStatus === "approved_for_publish" &&
    record.sourceIds.length > 0 &&
    record.proofAvailable.length > 0 &&
    hasApprovedEvidence(record.demandEvidence) &&
    hasApprovedEvidence(record.competitionEvidence) &&
    hasApprovedEvidence(record.serviceFitEvidence)
  );
}

export function canPublishInternationalMarketingRecord(
  record: InternationalMarketingMarketRecord,
): boolean {
  return (
    record.reviewStatus === "approved" &&
    record.publicationStatus === "approved_for_publish" &&
    record.sourceIds.length > 0 &&
    hasApprovedEvidence(record.languageDemandEvidence) &&
    hasApprovedEvidence(record.commercialDemandEvidence) &&
    hasApprovedEvidence(record.competitionEvidence) &&
    hasApprovedEvidence(record.paymentEligibilityEvidence) &&
    hasApprovedEvidence(record.complianceEvidence) &&
    hasApprovedEvidence(record.serviceCapacityEvidence)
  );
}
