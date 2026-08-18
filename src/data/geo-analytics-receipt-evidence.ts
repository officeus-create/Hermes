import type { GeoEvidenceClass } from "./geo-measurement-layer.ts";

export const geoAnalyticsReceiptVersion = "geo_analytics_receipt_v1" as const;
export type GeoAnalyticsEvidenceClass = Extract<GeoEvidenceClass, "platform_verified" | "owner_provided_handoff" | "unverified">;
export type GeoAnalyticsOwnershipState = "existing_property_confirmed" | "ownership_not_confirmed";
export type GeoDuplicateTagState = "none_observed" | "suspected" | "confirmed" | "not_checked";
export type GeoAnalyticsReceiptState = "observed_once" | "observed_multiple" | "not_observed";
export type GeoAnalyticsFreshnessState = "current" | "stale";
export type GeoCanonicalAnalyticsEvent =
  | "commercial_cta_click"
  | "carrier_intake_start" | "carrier_intake_preview_ready" | "carrier_handoff_ready" | "carrier_delivery_confirmed"
  | "vehicle_transport_intake_start" | "vehicle_transport_preview_ready" | "vehicle_transport_handoff_ready" | "vehicle_transport_delivery_confirmed"
  | "seo_intake_start" | "seo_intake_preview_ready" | "seo_handoff_ready"
  | "website_project_intake_start" | "website_project_preview_ready" | "website_handoff_ready";

export interface GeoAnalyticsOwnershipAttestation {
  checkedAt: string;
  ownershipState: GeoAnalyticsOwnershipState;
  duplicateTagState: GeoDuplicateTagState;
  evidenceClass: GeoAnalyticsEvidenceClass;
}
export interface GeoAnalyticsReceipt {
  schemaVersion: typeof geoAnalyticsReceiptVersion;
  referenceId: string;
  canonicalOwner: string;
  eventPagePath: string;
  eventName: GeoCanonicalAnalyticsEvent;
  observedAt: string;
  receiptState: GeoAnalyticsReceiptState;
  synthetic: boolean;
  parameterKeys: string[];
  evidenceClass: GeoAnalyticsEvidenceClass;
  supersedesReferenceId: string | null;
  unexpectedParameterKeys: string[];
  missingRequiredParameterKeys: string[];
  exactOnceVerified: boolean;
}
export interface GeoAnalyticsAttributionMapInput {
  canonical_owner: string;
  journey_path: string;
  family: "carrier" | "vehicle_transport" | "seo" | "website_project";
}

const eventRegistry: Record<GeoCanonicalAnalyticsEvent, { required: string[]; allowed: string[] }> = {
  commercial_cta_click: { required: ["cta_type", "audience_type", "page_group", "service_group", "page_path", "destination_path"], allowed: ["cta_type", "audience_type", "page_group", "service_group", "page_path", "destination_path"] },
  carrier_intake_start: { required: ["audience_type", "page_group", "service_group", "page_path"], allowed: ["audience_type", "page_group", "service_group", "page_path"] },
  carrier_intake_preview_ready: { required: ["audience_type", "page_group", "service_group", "page_path", "preview_status"], allowed: ["audience_type", "page_group", "service_group", "page_path", "preview_status"] },
  carrier_handoff_ready: { required: ["audience_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status"], allowed: ["audience_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status"] },
  carrier_delivery_confirmed: { required: ["audience_type", "page_group", "service_group", "page_path", "preview_status"], allowed: ["audience_type", "page_group", "service_group", "page_path", "preview_status"] },
  vehicle_transport_intake_start: { required: ["audience_type", "page_group", "service_group", "page_path"], allowed: ["audience_type", "page_group", "service_group", "page_path"] },
  vehicle_transport_preview_ready: { required: ["audience_type", "page_group", "service_group", "page_path", "preview_status", "submitter_group"], allowed: ["audience_type", "page_group", "service_group", "page_path", "preview_status", "submitter_group"] },
  vehicle_transport_handoff_ready: { required: ["audience_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status"], allowed: ["audience_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status", "submitter_group"] },
  vehicle_transport_delivery_confirmed: { required: ["audience_type", "page_group", "service_group", "page_path", "preview_status"], allowed: ["audience_type", "page_group", "service_group", "page_path", "preview_status", "submitter_group"] },
  seo_intake_start: { required: ["intake_type", "page_group", "service_group", "page_path"], allowed: ["intake_type", "page_group", "service_group", "page_path"] },
  seo_intake_preview_ready: { required: ["intake_type", "page_group", "service_group", "page_path", "preview_status"], allowed: ["intake_type", "page_group", "service_group", "page_path", "preview_status"] },
  seo_handoff_ready: { required: ["intake_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status"], allowed: ["intake_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status"] },
  website_project_intake_start: { required: ["intake_type", "page_group", "page_path"], allowed: ["intake_type", "page_group", "service_group", "page_path"] },
  website_project_preview_ready: { required: ["intake_type", "page_group", "page_path", "preview_status"], allowed: ["intake_type", "page_group", "service_group", "page_path", "preview_status"] },
  website_handoff_ready: { required: ["intake_type", "page_group", "page_path", "handoff_method", "preview_status"], allowed: ["intake_type", "page_group", "service_group", "page_path", "handoff_method", "preview_status"] },
};
export const geoCanonicalAnalyticsEventNames = Object.keys(eventRegistry).sort() as GeoCanonicalAnalyticsEvent[];
const familyEvents: Record<GeoAnalyticsAttributionMapInput["family"], GeoCanonicalAnalyticsEvent[]> = {
  carrier: ["commercial_cta_click", "carrier_intake_start", "carrier_intake_preview_ready", "carrier_handoff_ready", "carrier_delivery_confirmed"],
  vehicle_transport: ["commercial_cta_click", "vehicle_transport_intake_start", "vehicle_transport_preview_ready", "vehicle_transport_handoff_ready", "vehicle_transport_delivery_confirmed"],
  seo: ["commercial_cta_click", "seo_intake_start", "seo_intake_preview_ready", "seo_handoff_ready"],
  website_project: ["commercial_cta_click", "website_project_intake_start", "website_project_preview_ready", "website_handoff_ready"],
};
const deliveryEvent: Partial<Record<GeoAnalyticsAttributionMapInput["family"], GeoCanonicalAnalyticsEvent>> = { carrier: "carrier_delivery_confirmed", vehicle_transport: "vehicle_transport_delivery_confirmed" };
const ownershipFields = new Set(["checked_at", "ownership_state", "duplicate_tag_state", "evidence_class"]);
const receiptFields = new Set(["schema_version", "reference_id", "canonical_owner", "event_page_path", "event_name", "observed_at", "receipt_state", "synthetic", "parameter_keys", "evidence_class", "supersedes_reference_id"]);
const mapFields = new Set(["canonical_owner", "journey_path", "family"]);
const ownershipStates = new Set<GeoAnalyticsOwnershipState>(["existing_property_confirmed", "ownership_not_confirmed"]);
const duplicateStates = new Set<GeoDuplicateTagState>(["none_observed", "suspected", "confirmed", "not_checked"]);
const receiptStates = new Set<GeoAnalyticsReceiptState>(["observed_once", "observed_multiple", "not_observed"]);
const evidenceClasses = new Set<GeoAnalyticsEvidenceClass>(["platform_verified", "owner_provided_handoff", "unverified"]);
const eventNames = new Set<GeoCanonicalAnalyticsEvent>(geoCanonicalAnalyticsEventNames);
const families = new Set<GeoAnalyticsAttributionMapInput["family"]>(["carrier", "vehicle_transport", "seo", "website_project"]);
const timezoneIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const opaqueId = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const parameterName = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const asRecord = (value: unknown, label: string): Record<string, unknown> => { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`); return value as Record<string, unknown>; };
const exactFields = (row: Record<string, unknown>, fields: Set<string>, label: string) => { for (const key of Object.keys(row)) if (!fields.has(key)) throw new Error(`${label} contains unsupported field: ${key}`); for (const key of fields) if (!(key in row)) throw new Error(`${label} is missing field: ${key}`); };
const enumValue = <T extends string>(value: unknown, allowed: Set<T>, label: string): T => { if (typeof value !== "string" || !allowed.has(value as T)) throw new Error(`${label} has unsupported value`); return value as T; };
const cleanPath = (value: unknown, label: string) => { if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) throw new Error(`${label} must be a clean site-relative path`); return value; };
const timestamp = (value: unknown, label: string) => { if (typeof value !== "string" || !timezoneIso.test(value) || !Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp with explicit timezone`); return new Date(Date.parse(value)).toISOString(); };
const opaque = (value: unknown, label: string) => { if (typeof value !== "string" || !opaqueId.test(value)) throw new Error(`${label} must be an opaque safe identifier`); return value; };
const normalizedParameterKeys = (value: unknown) => { if (!Array.isArray(value) || value.length > 32) throw new Error("parameter_keys must be an array of at most 32 keys"); const keys = value.map((item) => { if (typeof item !== "string" || !parameterName.test(item)) throw new Error("parameter_keys contains an invalid key"); return item; }); if (new Set(keys).size !== keys.length) throw new Error("parameter_keys must be unique"); return [...keys].sort(); };

export const importGeoAnalyticsOwnershipAttestation = (input: unknown): GeoAnalyticsOwnershipAttestation => { const row = asRecord(input, "Analytics ownership attestation"); exactFields(row, ownershipFields, "Analytics ownership attestation"); return { checkedAt: timestamp(row.checked_at, "checked_at"), ownershipState: enumValue(row.ownership_state, ownershipStates, "ownership_state"), duplicateTagState: enumValue(row.duplicate_tag_state, duplicateStates, "duplicate_tag_state"), evidenceClass: enumValue(row.evidence_class, evidenceClasses, "evidence_class") }; };
export const importGeoAnalyticsReceipt = (input: unknown): GeoAnalyticsReceipt => { const row = asRecord(input, "Analytics receipt"); exactFields(row, receiptFields, "Analytics receipt"); if (row.schema_version !== geoAnalyticsReceiptVersion) throw new Error(`schema_version must be ${geoAnalyticsReceiptVersion}`); const eventName = enumValue(row.event_name, eventNames, "event_name"); const parameterKeys = normalizedParameterKeys(row.parameter_keys); const registry = eventRegistry[eventName]; const unexpectedParameterKeys = parameterKeys.filter((key) => !registry.allowed.includes(key)); const missingRequiredParameterKeys = registry.required.filter((key) => !parameterKeys.includes(key)); const receiptState = enumValue(row.receipt_state, receiptStates, "receipt_state"); if (typeof row.synthetic !== "boolean") throw new Error("synthetic must be boolean"); const referenceId = opaque(row.reference_id, "reference_id"); const supersedesReferenceId = row.supersedes_reference_id === null ? null : opaque(row.supersedes_reference_id, "supersedes_reference_id"); if (referenceId === supersedesReferenceId) throw new Error("Analytics receipt cannot supersede itself"); const evidenceClass = enumValue(row.evidence_class, evidenceClasses, "evidence_class"); return { schemaVersion: geoAnalyticsReceiptVersion, referenceId, canonicalOwner: cleanPath(row.canonical_owner, "canonical_owner"), eventPagePath: cleanPath(row.event_page_path, "event_page_path"), eventName, observedAt: timestamp(row.observed_at, "observed_at"), receiptState, synthetic: row.synthetic, parameterKeys, evidenceClass, supersedesReferenceId, unexpectedParameterKeys, missingRequiredParameterKeys, exactOnceVerified: row.synthetic === false && evidenceClass === "platform_verified" && receiptState === "observed_once" && unexpectedParameterKeys.length === 0 && missingRequiredParameterKeys.length === 0 }; };
export const importGeoAnalyticsReceiptBatch = (inputs: unknown[]) => { if (!Array.isArray(inputs) || inputs.length > 5000) throw new Error("Analytics receipt batch must contain at most 5000 rows"); const rows = inputs.map(importGeoAnalyticsReceipt); const byId = new Map<string, GeoAnalyticsReceipt>(); for (const row of rows) { if (byId.has(row.referenceId)) throw new Error(`Duplicate analytics receipt: ${row.referenceId}`); byId.set(row.referenceId, row); } for (const row of rows) { if (!row.supersedesReferenceId) continue; const prior = byId.get(row.supersedesReferenceId); if (!prior) throw new Error(`Superseded analytics receipt not found: ${row.supersedesReferenceId}`); if (prior.canonicalOwner !== row.canonicalOwner || prior.eventName !== row.eventName || prior.eventPagePath !== row.eventPagePath) throw new Error(`Analytics supersession must preserve owner/event/page: ${row.referenceId}`); if (prior.synthetic !== row.synthetic) throw new Error(`Analytics supersession cannot cross synthetic/real evidence: ${row.referenceId}`); if (Date.parse(row.observedAt) < Date.parse(prior.observedAt)) throw new Error(`Analytics superseding receipt cannot be older: ${row.referenceId}`); } return rows.sort((left, right) => left.canonicalOwner.localeCompare(right.canonicalOwner) || left.eventName.localeCompare(right.eventName) || left.observedAt.localeCompare(right.observedAt)); };
export const importGeoAnalyticsAttributionMap = (input: unknown): GeoAnalyticsAttributionMapInput => { const row = asRecord(input, "Analytics attribution map"); exactFields(row, mapFields, "Analytics attribution map"); return { canonical_owner: cleanPath(row.canonical_owner, "canonical_owner"), journey_path: cleanPath(row.journey_path, "journey_path"), family: enumValue(row.family, families, "family") }; };
const activeReceipts = (receipts: GeoAnalyticsReceipt[]) => { const superseded = new Set(receipts.map((item) => item.supersedesReferenceId).filter((item): item is string => Boolean(item))); return receipts.filter((item) => !superseded.has(item.referenceId)); };
export const buildGeoAnalyticsReceiptHealth = (receipts: GeoAnalyticsReceipt[]) => { const active = activeReceipts(receipts); const real = active.filter((item) => !item.synthetic); return { latestRealReceipts: real, exactOnce: real.filter((item) => item.exactOnceVerified), missingReceipt: real.filter((item) => item.receiptState === "not_observed"), duplicateReceipt: real.filter((item) => item.receiptState === "observed_multiple"), parameterPrivacyIssues: real.filter((item) => item.unexpectedParameterKeys.length > 0), parameterCompletenessIssues: real.filter((item) => item.missingRequiredParameterKeys.length > 0), syntheticExcludedCount: active.filter((item) => item.synthetic).length }; };
export const buildGeoAnalyticsFreshness = (receipts: GeoAnalyticsReceipt[], asOf: string, freshnessDays: number) => { const asOfMs = Date.parse(timestamp(asOf, "asOf")); if (!Number.isInteger(freshnessDays) || freshnessDays < 1 || freshnessDays > 90) throw new Error("freshnessDays must be 1-90"); return activeReceipts(receipts).map((receipt) => { const ageDays = Math.floor((asOfMs - Date.parse(receipt.observedAt)) / 86_400_000); if (ageDays < 0) throw new Error(`Analytics receipt ${receipt.referenceId} occurs after asOf`); const freshnessState: GeoAnalyticsFreshnessState = ageDays <= freshnessDays ? "current" : "stale"; return { ...receipt, ageDays, freshnessDays, freshnessState }; }); };
export const buildGeoAnalyticsOwnerCompleteness = (maps: GeoAnalyticsAttributionMapInput[], receipts: GeoAnalyticsReceipt[]) => { const active = activeReceipts(receipts).filter((item) => !item.synthetic); return maps.map((map) => { const states = familyEvents[map.family].map((eventName) => { const expectedPage = eventName === "commercial_cta_click" ? map.canonical_owner : map.journey_path; const candidates = active.filter((item) => item.canonicalOwner === map.canonical_owner && item.eventName === eventName && item.eventPagePath === expectedPage); const state = candidates.length === 0 ? "missing_evidence" as const : candidates.length > 1 ? "conflicting_active_receipts" as const : candidates[0].exactOnceVerified ? "exact_once_verified" as const : candidates[0].receiptState === "observed_multiple" ? "duplicate_receipt" as const : candidates[0].receiptState === "not_observed" ? "not_observed" as const : "receipt_not_verified" as const; return { eventName, expectedPage, state }; }); return { canonicalOwner: map.canonical_owner, journeyPath: map.journey_path, family: map.family, states, complete: states.every((item) => item.state === "exact_once_verified"), missingOrInvalidEvents: states.filter((item) => item.state !== "exact_once_verified").map((item) => item.eventName) }; }); };
export const reconcileGeoAnalyticsHandoffDelivery = (map: GeoAnalyticsAttributionMapInput, receipts: GeoAnalyticsReceipt[]) => { const expectedDelivery = deliveryEvent[map.family] ?? null; const handoffName: GeoCanonicalAnalyticsEvent = map.family === "carrier" ? "carrier_handoff_ready" : map.family === "vehicle_transport" ? "vehicle_transport_handoff_ready" : map.family === "seo" ? "seo_handoff_ready" : "website_handoff_ready"; const active = activeReceipts(receipts).filter((item) => !item.synthetic && item.canonicalOwner === map.canonical_owner); const handoffs = active.filter((item) => item.eventName === handoffName && item.eventPagePath === map.journey_path); const handoffExactOnce = handoffs.length === 1 && handoffs[0].exactOnceVerified; if (!expectedDelivery) return { canonicalOwner: map.canonical_owner, family: map.family, handoffExactOnce, deliveryEvent: null, deliveryState: "delivery_event_not_established_in_canonical_registry" as const }; const deliveries = active.filter((item) => item.eventName === expectedDelivery && item.eventPagePath === map.journey_path); return { canonicalOwner: map.canonical_owner, family: map.family, handoffExactOnce, deliveryEvent: expectedDelivery, deliveryState: deliveries.length === 0 ? "delivery_evidence_missing" as const : deliveries.length > 1 ? "delivery_evidence_conflict" as const : deliveries[0].exactOnceVerified ? "delivery_exact_once_verified" as const : "delivery_receipt_not_verified" as const }; };
export const geoAnalyticsRegistryContract = Object.fromEntries(geoCanonicalAnalyticsEventNames.map((eventName) => [eventName, { requiredParameterKeys: [...eventRegistry[eventName].required], allowedParameterKeys: [...eventRegistry[eventName].allowed] }])) as Record<GeoCanonicalAnalyticsEvent, { requiredParameterKeys: string[]; allowedParameterKeys: string[] }>;
