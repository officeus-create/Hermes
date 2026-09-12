export type LoadBoardProviderId =
  | "central_dispatch"
  | "super_dispatch"
  | "truckstop"
  | "dat"
  | "ship_cars"
  | "direct_freight"
  | "loadboard_123"
  | "sanitized_csv";

export type AdapterTransport = "rest_api" | "soap_api" | "webhook" | "csv_export" | "manual_csv" | "partner_integration";
export type AdapterReadiness = "research_only" | "owner_approval_required" | "contract_required" | "preview_ready";
export type AdapterEnvironment = "preview" | "sandbox" | "production";
export type AdapterOperation = "import_preview" | "read_opportunities" | "receive_webhook" | "write_or_book" | "public_export";
export type AdapterCapability =
  | "search_loads"
  | "search_trucks"
  | "rates"
  | "tracking"
  | "offers"
  | "book_now"
  | "load_posting"
  | "documents"
  | "webhooks";

export const SCRAPING_ALLOWED = false;
export const OUTBOUND_PROVIDER_REQUESTS_ENABLED = false;
export const PUBLIC_MARKETPLACE_EXPORT_ENABLED = false;
export const REAL_PROVIDER_CREDENTIALS_CONFIGURED = false;

export type LoadBoardAdapterDefinition = Readonly<{
  id: LoadBoardProviderId;
  label: string;
  transports: readonly AdapterTransport[];
  capabilities: readonly AdapterCapability[];
  readiness: AdapterReadiness;
  providerConnectionEnabled: false;
  requiresOwnerApproval: boolean;
  requiresCommercialReview: boolean;
  requiresDataRightsReview: boolean;
  documentationUrl?: string;
  notes: string;
}>;

export type AdapterAccessRequest = Readonly<{
  providerId: LoadBoardProviderId;
  environment: AdapterEnvironment;
  operation: AdapterOperation;
  ownerApproved?: boolean;
  commercialReviewPassed?: boolean;
  dataRightsReviewPassed?: boolean;
  sourceApproved?: boolean;
  privacyReviewPassed?: boolean;
}>;

export type AdapterAccessDecision = Readonly<{
  allowed: boolean;
  providerId: LoadBoardProviderId;
  environment: AdapterEnvironment;
  operation: AdapterOperation;
  externalActionPerformed: false;
  reason: string;
}>;

const transportList = (...transports: AdapterTransport[]): readonly AdapterTransport[] => Object.freeze(transports);
const capabilityList = (...capabilities: AdapterCapability[]): readonly AdapterCapability[] => Object.freeze(capabilities);

export const LOAD_BOARD_ADAPTERS: Readonly<Record<LoadBoardProviderId, LoadBoardAdapterDefinition>> = Object.freeze({
  central_dispatch: Object.freeze({
    id: "central_dispatch",
    label: "Central Dispatch",
    transports: transportList("rest_api", "webhook", "partner_integration"),
    capabilities: capabilityList("load_posting", "rates", "offers", "documents", "webhooks"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://api-docs.centraldispatch.com/",
    notes: "Listings V2, Market Intelligence, Offers, documents, events and OAuth/bearer authentication are documented. Marketplace search rights for Hermes carrier workflows, storage, aggregation, display and retention still require provider approval.",
  }),
  super_dispatch: Object.freeze({
    id: "super_dispatch",
    label: "Super Dispatch",
    transports: transportList("rest_api", "webhook", "partner_integration"),
    capabilities: capabilityList("search_loads", "offers", "rates", "tracking", "documents", "webhooks", "load_posting"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://developer.superdispatch.com/",
    notes: "Official carrier and shipper APIs support orders, offers, loadboard workflows, pricing insights, tracking, eBOL/ePOD and webhooks. Production credentials and cross-system display/retention rights remain approval-gated.",
  }),
  truckstop: Object.freeze({
    id: "truckstop",
    label: "Truckstop",
    transports: transportList("rest_api", "soap_api", "partner_integration"),
    capabilities: capabilityList("search_loads", "search_trucks", "load_posting", "rates"),
    readiness: "contract_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://developer.truckstop.com/",
    notes: "Official SOAP Load Search and Truck Search plus REST Load Management are documented. A systems-integration agreement, enabled web-service products and explicit data-use rights are required before Hermes activates credentials.",
  }),
  dat: Object.freeze({
    id: "dat",
    label: "DAT",
    transports: transportList("rest_api", "partner_integration"),
    capabilities: capabilityList("search_loads", "book_now", "tracking", "load_posting", "rates"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://www.dat.com/api-integration",
    notes: "DAT advertises APIs for Load Board, BookNow, Tracking and Freight Posting through its Developer Portal. Endpoint access, licensing, retention, aggregation and deletion rights require an approved portal/account review.",
  }),
  ship_cars: Object.freeze({
    id: "ship_cars",
    label: "Ship.Cars",
    transports: transportList("rest_api", "csv_export", "partner_integration"),
    capabilities: capabilityList("search_loads", "rates", "offers", "tracking", "load_posting"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://shipcars.readme.io/",
    notes: "Official OAuth2 documentation and Loadboard v3 postings endpoint are public, including pickup/delivery, route, vehicle count, operability, trailer, payment, pay and price-per-mile filters. Hermes still needs account credentials and explicit internal display/retention rights before production sync.",
  }),
  direct_freight: Object.freeze({
    id: "direct_freight",
    label: "Direct Freight",
    transports: transportList("rest_api", "partner_integration"),
    capabilities: capabilityList("search_loads"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://github.com/Direct-Freight/df-api-docs",
    notes: "Direct Freight maintains a public OpenAPI/Swagger specification for its load-board API. Hermes can map the documented search model now, but production authentication, account entitlement, storage and redistribution rights must be confirmed before enabling requests.",
  }),
  loadboard_123: Object.freeze({
    id: "loadboard_123",
    label: "123Loadboard",
    transports: transportList("rest_api", "partner_integration"),
    capabilities: capabilityList("search_loads", "search_trucks", "rates", "offers", "book_now", "load_posting"),
    readiness: "contract_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    documentationUrl: "https://www.123loadboard.com/api/",
    notes: "123Loadboard advertises partner APIs for searching loads and trucks, rates, bidding, Book Now and load/truck posting. Partner onboarding and the provider's API/data-use agreement are required before Hermes activates a live connector.",
  }),
  sanitized_csv: Object.freeze({
    id: "sanitized_csv",
    label: "Owner-approved sanitized CSV",
    transports: transportList("manual_csv"),
    capabilities: capabilityList("search_loads"),
    readiness: "preview_ready",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: false,
    requiresDataRightsReview: true,
    notes: "The currently permitted local adapter path remains an owner-approved sanitized export entering preview/quarantine. It performs no provider write and grants no public redistribution rights.",
  }),
});

function decision(
  request: AdapterAccessRequest,
  allowed: boolean,
  reason: string,
): AdapterAccessDecision {
  return Object.freeze({
    allowed,
    providerId: request.providerId,
    environment: request.environment,
    operation: request.operation,
    externalActionPerformed: false,
    reason,
  });
}

export function getLoadBoardAdapter(providerId: LoadBoardProviderId): LoadBoardAdapterDefinition {
  return LOAD_BOARD_ADAPTERS[providerId];
}

export function evaluateLoadBoardAdapterAccess(request: AdapterAccessRequest): AdapterAccessDecision {
  const adapter = getLoadBoardAdapter(request.providerId);

  if (request.operation === "public_export") {
    return decision(request, false, "Public marketplace export is disabled");
  }
  if (request.operation === "write_or_book") {
    return decision(request, false, "Automated provider writes and bookings are disabled");
  }
  if (request.operation === "receive_webhook") {
    return decision(request, false, "Inbound provider webhooks are not configured or approved");
  }

  if (request.providerId === "sanitized_csv") {
    if (request.environment !== "preview") {
      return decision(request, false, "Sanitized CSV is limited to local preview and quarantine");
    }
    if (request.operation !== "import_preview") {
      return decision(request, false, "Sanitized CSV currently supports import preview only");
    }
    if (!request.ownerApproved || !request.sourceApproved || !request.privacyReviewPassed || !request.dataRightsReviewPassed) {
      return decision(
        request,
        false,
        "Owner approval, source approval, privacy review, and data-rights review are required",
      );
    }
    return decision(request, true, "Approved sanitized CSV may enter preview and quarantine without an external write");
  }

  if (!OUTBOUND_PROVIDER_REQUESTS_ENABLED || !REAL_PROVIDER_CREDENTIALS_CONFIGURED || !adapter.providerConnectionEnabled) {
    return decision(request, false, "Real provider adapters are disabled and no credentials are configured");
  }
  if (request.environment === "production") {
    return decision(request, false, "Production provider access requires a separate reviewed release");
  }
  if (!request.ownerApproved) return decision(request, false, "Owner approval is required");
  if (adapter.requiresCommercialReview && !request.commercialReviewPassed) {
    return decision(request, false, "Commercial and account eligibility review is required");
  }
  if (adapter.requiresDataRightsReview && !request.dataRightsReviewPassed) {
    return decision(request, false, "Storage, display, retention, deletion, and aggregation rights require review");
  }

  return decision(request, false, "Provider access remains disabled pending an approved adapter implementation");
}

export function listEnabledProviderConnections(): readonly LoadBoardProviderId[] {
  return Object.freeze(
    (Object.values(LOAD_BOARD_ADAPTERS) as LoadBoardAdapterDefinition[])
      .filter((adapter) => adapter.providerConnectionEnabled)
      .map((adapter) => adapter.id),
  );
}
