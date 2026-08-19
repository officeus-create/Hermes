export type GeoExternalEvidenceRequestType =
  | "gsc_us_owner_export"
  | "gsc_url_inspection"
  | "bing_exact_url"
  | "ga4_exact_once_receipt"
  | "private_funnel_aggregate"
  | "manual_ai_review";

export interface GeoExternalEvidenceRequest {
  id: string;
  type: GeoExternalEvidenceRequestType;
  canonicalOwner: string | null;
  source: "gsc" | "bing" | "ga4" | "private_operations" | "manual_ai_provider_review";
  requiredScope: Record<string, string>;
  requiredFields: string[];
  forbiddenFields: string[];
  acceptedEvidenceClass: "platform_verified" | "private_operations_verified";
  note: string;
}

const commonForbidden = [
  "account_id", "property_id", "stream_id", "user_id", "client_id", "email", "phone",
  "first_name", "last_name", "full_name", "company_name", "mc_number", "usdot", "vin",
  "cookie", "token", "password", "message_body", "raw_conversation", "revenue_amount", "deal_amount",
];

export const geoExternalEvidenceRequests: GeoExternalEvidenceRequest[] = [
  {
    id: "gsc-us-logistics-seo-owner",
    type: "gsc_us_owner_export",
    canonicalOwner: "/services/seo-for-logistics-companies/",
    source: "gsc",
    requiredScope: {
      country: "United States",
      page: "/services/seo-for-logistics-companies/",
      date_range: "exact_supplied_window",
    },
    requiredFields: ["start_date", "end_date", "clicks", "impressions", "ctr", "average_position"],
    forbiddenFields: commonForbidden,
    acceptedEvidenceClass: "platform_verified",
    note: "A country aggregate and a page aggregate are not enough. This request requires the country×page intersection for the exact owner.",
  },
  {
    id: "gsc-us-car-hauling-owner",
    type: "gsc_us_owner_export",
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    source: "gsc",
    requiredScope: {
      country: "United States",
      page: "/logistics/car-hauling-dispatch/",
      date_range: "exact_supplied_window",
    },
    requiredFields: ["start_date", "end_date", "clicks", "impressions", "ctr", "average_position"],
    forbiddenFields: commonForbidden,
    acceptedEvidenceClass: "platform_verified",
    note: "Do not infer U.S. owner performance from separate country and page aggregates.",
  },
  {
    id: "gsc-job-url-inspection",
    type: "gsc_url_inspection",
    canonicalOwner: "/careers/car-hauling-dispatcher/",
    source: "gsc",
    requiredScope: { url: "https://hermeslogisticsus.com/careers/car-hauling-dispatcher/" },
    requiredFields: ["checked_at", "index_status", "user_declared_canonical", "google_selected_canonical", "last_crawl_at", "evidence_reference"],
    forbiddenFields: commonForbidden,
    acceptedEvidenceClass: "platform_verified",
    note: "Store only exact-URL index/canonical evidence. Do not store account/property identifiers.",
  },
  {
    id: "bing-job-exact-url",
    type: "bing_exact_url",
    canonicalOwner: "/careers/car-hauling-dispatcher/",
    source: "bing",
    requiredScope: { url: "https://hermeslogisticsus.com/careers/car-hauling-dispatcher/" },
    requiredFields: ["checked_at", "url_status", "evidence_reference"],
    forbiddenFields: commonForbidden,
    acceptedEvidenceClass: "platform_verified",
    note: "IndexNow submission/acceptance is not sufficient for this request.",
  },
  {
    id: "ga4-carrier-delivery-exact-once",
    type: "ga4_exact_once_receipt",
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    source: "ga4",
    requiredScope: { event: "carrier_delivery_confirmed", property: "existing_production_property" },
    requiredFields: ["event_name", "observed_at", "observed_count", "page_path", "page_group", "service_group", "evidence_reference"],
    forbiddenFields: commonForbidden,
    acceptedEvidenceClass: "platform_verified",
    note: "Exact-once requires observed_count=1 on the existing production property. Do not create a replacement property for verification.",
  },
  {
    id: "private-owner-funnel-aggregate",
    type: "private_funnel_aggregate",
    canonicalOwner: null,
    source: "private_operations",
    requiredScope: { aggregation: "canonical_owner_x_exact_window" },
    requiredFields: ["canonical_owner", "window_days", "delivered", "reviewed", "qualified", "opportunity", "won", "revenue_reconciled_win", "evidence_reference"],
    forbiddenFields: commonForbidden,
    acceptedEvidenceClass: "private_operations_verified",
    note: "Counts only. No lead/customer identities, companies, deal amounts or revenue amounts.",
  },
  {
    id: "manual-ai-review-observation",
    type: "manual_ai_review",
    canonicalOwner: null,
    source: "manual_ai_provider_review",
    requiredScope: { registry: "canonical_48_prompt_registry", provider: "one_governed_provider" },
    requiredFields: ["prompt_id", "provider", "observed_at", "reviewer", "brand_mentioned", "linked_citation", "cited_path", "recommendation", "entity_accuracy", "description_accuracy", "factual_error", "evidence_reference"],
    forbiddenFields: [...commonForbidden, "raw_response", "transcript", "screenshot_text", "conversation"],
    acceptedEvidenceClass: "platform_verified",
    note: "Structured manual observation only. Do not copy the full provider answer into repository evidence.",
  },
];

const safeKey = /^[a-z0-9_]+$/;
const cleanOwner = (value: string | null) => value === null || (value.startsWith("/") && !value.startsWith("//") && !/[?#]/.test(value));

export const validateGeoExternalEvidenceRequest = (request: GeoExternalEvidenceRequest) => {
  if (!request.id.trim()) throw new Error("External evidence request id is required");
  if (!cleanOwner(request.canonicalOwner)) throw new Error(`Invalid canonicalOwner for ${request.id}`);
  if (!request.requiredFields.length) throw new Error(`${request.id} requires fields`);
  if (new Set(request.requiredFields).size !== request.requiredFields.length) throw new Error(`${request.id} has duplicate required fields`);
  if (!request.requiredFields.every((field) => safeKey.test(field))) throw new Error(`${request.id} has invalid required field name`);
  if (request.forbiddenFields.some((field) => request.requiredFields.includes(field))) throw new Error(`${request.id} requires a forbidden field`);
  return request;
};

export const validateGeoExternalEvidencePayload = (
  request: GeoExternalEvidenceRequest,
  payload: Record<string, unknown>,
) => {
  validateGeoExternalEvidenceRequest(request);
  const keys = Object.keys(payload);
  const missing = request.requiredFields.filter((field) => !(field in payload));
  const forbidden = request.forbiddenFields.filter((field) => field in payload);
  const allowed = new Set([...request.requiredFields, ...Object.keys(request.requiredScope), "evidence_class"]);
  const unexpected = keys.filter((key) => !allowed.has(key));
  const scopeMismatches = Object.entries(request.requiredScope).flatMap(([key, expected]) => {
    if (!(key in payload)) return [];
    return payload[key] === expected ? [] : [`${key}:${String(payload[key])}!=${expected}`];
  });
  const evidenceClassMismatch = payload.evidence_class !== undefined && payload.evidence_class !== request.acceptedEvidenceClass;
  return {
    ready: missing.length === 0 && forbidden.length === 0 && unexpected.length === 0 && scopeMismatches.length === 0 && !evidenceClassMismatch,
    missing,
    forbidden,
    unexpected,
    scopeMismatches,
    evidenceClassMismatch,
  };
};

export const buildGeoExternalEvidenceAcquisitionQueue = () => geoExternalEvidenceRequests.map((request) => ({
  requestId: request.id,
  type: request.type,
  canonicalOwner: request.canonicalOwner,
  source: request.source,
  status: "external_action_required" as const,
  acceptedEvidenceClass: request.acceptedEvidenceClass,
  requiredScope: request.requiredScope,
  requiredFields: request.requiredFields,
  note: request.note,
}));

geoExternalEvidenceRequests.forEach(validateGeoExternalEvidenceRequest);
