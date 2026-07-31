export type LoadBoardProviderId =
  | "central_dispatch"
  | "super_dispatch"
  | "truckstop"
  | "dat"
  | "ship_cars"
  | "sanitized_csv";

export type AdapterTransport = "rest_api" | "webhook" | "csv_export" | "manual_csv" | "partner_integration";
export type AdapterReadiness = "research_only" | "owner_approval_required" | "contract_required" | "preview_ready";
export type AdapterEnvironment = "preview" | "sandbox" | "production";
export type AdapterOperation = "import_preview" | "read_opportunities" | "receive_webhook" | "write_or_book" | "public_export";

export const SCRAPING_ALLOWED = false;
export const OUTBOUND_PROVIDER_REQUESTS_ENABLED = false;
export const PUBLIC_MARKETPLACE_EXPORT_ENABLED = false;
export const REAL_PROVIDER_CREDENTIALS_CONFIGURED = false;

export type LoadBoardAdapterDefinition = Readonly<{
  id: LoadBoardProviderId;
  label: string;
  transports: readonly AdapterTransport[];
  readiness: AdapterReadiness;
  providerConnectionEnabled: false;
  requiresOwnerApproval: boolean;
  requiresCommercialReview: boolean;
  requiresDataRightsReview: boolean;
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

export const LOAD_BOARD_ADAPTERS: Readonly<Record<LoadBoardProviderId, LoadBoardAdapterDefinition>> = Object.freeze({
  central_dispatch: Object.freeze({
    id: "central_dispatch",
    label: "Central Dispatch",
    transports: transportList("rest_api", "webhook", "partner_integration"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    notes: "Official APIs are documented, but Hermes account eligibility, scopes, storage, aggregation, display, and retention rights require review.",
  }),
  super_dispatch: Object.freeze({
    id: "super_dispatch",
    label: "Super Dispatch",
    transports: transportList("rest_api", "webhook", "partner_integration"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    notes: "Official vehicle-transport APIs and webhooks are documented; production credentials and cross-system data rights are not approved.",
  }),
  truckstop: Object.freeze({
    id: "truckstop",
    label: "Truckstop",
    transports: transportList("rest_api", "partner_integration"),
    readiness: "contract_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    notes: "A signed systems-integration agreement and licensed products are required before credentials or implementation.",
  }),
  dat: Object.freeze({
    id: "dat",
    label: "DAT",
    transports: transportList("rest_api", "partner_integration"),
    readiness: "owner_approval_required",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    notes: "Official API families are advertised; detailed access, licensing, retention, and aggregation rights require Developer Portal review.",
  }),
  ship_cars: Object.freeze({
    id: "ship_cars",
    label: "Ship.Cars",
    transports: transportList("rest_api", "csv_export", "partner_integration"),
    readiness: "research_only",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: true,
    requiresDataRightsReview: true,
    notes: "Official products advertise API and CSV capabilities, but public endpoint, authentication, retention, and display documentation is incomplete.",
  }),
  sanitized_csv: Object.freeze({
    id: "sanitized_csv",
    label: "Owner-approved sanitized CSV",
    transports: transportList("manual_csv"),
    readiness: "preview_ready",
    providerConnectionEnabled: false,
    requiresOwnerApproval: true,
    requiresCommercialReview: false,
    requiresDataRightsReview: true,
    notes: "The only currently permitted adapter path is local preview and quarantine of an owner-approved sanitized export; no write or publication follows automatically.",
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
