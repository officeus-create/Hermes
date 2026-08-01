export type OperationsRole = "dispatcher" | "carrier";
export type RouteProofStatus = "observed" | "completed" | "verified" | "published";
export type OfferFreshness = "fresh" | "expired";

export type ShipmentHistoryRecord = {
  shipmentId: string;
  proofStatus: RouteProofStatus;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  equipmentClass: string;
  pickupDate: string;
  deliveryDate: string;
  bookedRate: number;
  loadedMiles: number;
  deadheadMiles: number;
  sourceRecordId: string;
  deliveryConfirmed: boolean;
  bolOrPodConfirmed: boolean;
  manualOperationalConfirmed: boolean;
  cancellationsAndClaimsReviewed: boolean;
};

export type NormalizedOffer = {
  offerId: string;
  sourceName: string;
  sourceRecordId: string;
  observedAt: string;
  expiresAt: string;
  pickupDate: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  equipmentClass: string;
  postedRate: number;
  negotiatedRate: number | null;
  bookedRate: number | null;
  loadedMiles: number;
  deadheadMiles: number;
  freshness: OfferFreshness;
};

export type RateMetrics = {
  gross: number;
  rateBasis: "booked" | "negotiated" | "posted";
  loadedMiles: number;
  deadheadMiles: number;
  totalMiles: number;
  loadedRpm: number;
  totalMileRpm: number;
  deadheadPercent: number;
};

export type CanonicalOpportunity = {
  canonicalKey: string;
  origin: string;
  destination: string;
  equipmentClass: string;
  pickupDate: string;
  freshness: OfferFreshness;
  expiresAt: string;
  latestOffer: NormalizedOffer;
  sourceRecords: NormalizedOffer[];
};

export type ManualBookingHandoff = {
  canonicalKey: string;
  status: "requires_manual_review";
  externalActionPerformed: false;
  nextStep: string;
};

export type ImportPreviewStatus = "accepted" | "duplicate_candidate" | "expired" | "rejected" | "needs_review";
export type ImportQuarantineReason =
  | "DUPLICATE_CANONICAL_OPPORTUNITY"
  | "OFFER_EXPIRED"
  | "INVALID_ROW_VALUE"
  | "OBSERVED_AFTER_EXPIRY"
  | "OBSERVED_IN_FUTURE";

export type ImportQuarantineRow = {
  rowNumber: number;
  status: Exclude<ImportPreviewStatus, "accepted">;
  reasons: ImportQuarantineReason[];
};

export type OffersImportPreview = {
  mode: "synthetic_preview";
  externalWritePerformed: false;
  publicExportEnabled: false;
  summary: Record<ImportPreviewStatus, number>;
  acceptedOffers: NormalizedOffer[];
  quarantine: ImportQuarantineRow[];
};

export const PUBLIC_ROUTE_EXPORT_ENABLED = false;

const forbiddenColumns = new Set([
  "carrier_name",
  "customer_name",
  "broker_name",
  "contact_name",
  "email",
  "phone",
  "address",
  "pickup_address",
  "delivery_address",
  "vin",
  "mc",
  "dot",
  "order_id",
  "invoice",
  "invoice_id",
  "bol",
  "bol_reference",
  "pod",
  "pod_reference",
  "commission",
  "comments",
  "paid",
]);

const offerCsvHeaders = [
  "offer_id",
  "source_name",
  "source_record_id",
  "observed_at",
  "expires_at",
  "pickup_date",
  "origin_city",
  "origin_state",
  "destination_city",
  "destination_state",
  "equipment_class",
  "posted_rate",
  "negotiated_rate",
  "booked_rate",
  "loaded_miles",
  "deadhead_miles",
] as const;

function parseCsv(csv: string, expectedHeaders?: readonly string[]): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) throw new Error("Invalid CSV schema: header row is required");
  const parseLine = (line: string) => {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === "," && !quoted) {
        values.push(value.trim());
        value = "";
      } else {
        value += character;
      }
    }
    values.push(value.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((header) => header.toLowerCase());
  const forbidden = headers.filter((header) => forbiddenColumns.has(header));
  if (forbidden.length) throw new Error(`Private columns are not allowed in the mock adapter: ${forbidden.join(", ")}`);
  if (new Set(headers).size !== headers.length) throw new Error("Invalid CSV schema: duplicate column names are not allowed");
  if (expectedHeaders) {
    const missing = expectedHeaders.filter((header) => !headers.includes(header));
    const extra = headers.filter((header) => !expectedHeaders.includes(header));
    if (missing.length || extra.length) {
      throw new Error(`Invalid CSV schema: missing [${missing.join(", ")}]; extra [${extra.join(", ")}]`);
    }
  }

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseLine(line);
    if (values.length !== headers.length) throw new Error(`CSV row ${rowIndex + 2} has ${values.length} values; expected ${headers.length}`);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function assertSyntheticOfferRows(rows: Record<string, string>[]): void {
  const unsafe = rows.some((row) => (
    !/^(SYN|CLEAN)-[A-Z0-9-]+$/.test(row.offer_id?.trim() ?? "")
    || !/^(MOCK|CLEAN)-[A-Z0-9-]+$/.test(row.source_record_id?.trim() ?? "")
    || !/^(Mock|Synthetic|Cleaned)\b/i.test(row.source_name?.trim() ?? "")
  ));
  if (unsafe) {
    throw new Error("Only synthetic or cleaned mock identifiers are allowed in import preview");
  }
}

function required(row: Record<string, string>, field: string): string {
  const value = row[field]?.trim();
  if (!value) throw new Error(`Missing required CSV field: ${field}`);
  return value;
}

function nonNegativeNumber(row: Record<string, string>, field: string, nullable = false): number | null {
  const raw = row[field]?.trim() ?? "";
  if (nullable && raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid non-negative number in CSV field: ${field}`);
  return value;
}

function proofStatus(value: string): RouteProofStatus {
  if (value === "observed" || value === "completed" || value === "verified" || value === "published") return value;
  throw new Error(`Invalid proof_status: ${value}`);
}

function booleanField(row: Record<string, string>, field: string): boolean {
  const value = required(row, field).toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid boolean in CSV field: ${field}`);
}

export function importShipmentHistoryCsv(csv: string): ShipmentHistoryRecord[] {
  return parseCsv(csv).map((row) => {
    const record = {
      shipmentId: required(row, "shipment_id"),
      proofStatus: proofStatus(required(row, "proof_status")),
      originCity: required(row, "origin_city"),
      originState: required(row, "origin_state"),
      destinationCity: required(row, "destination_city"),
      destinationState: required(row, "destination_state"),
      equipmentClass: required(row, "equipment_class"),
      pickupDate: required(row, "pickup_date"),
      deliveryDate: required(row, "delivery_date"),
      bookedRate: nonNegativeNumber(row, "booked_rate") as number,
      loadedMiles: nonNegativeNumber(row, "loaded_miles") as number,
      deadheadMiles: nonNegativeNumber(row, "deadhead_miles") as number,
      sourceRecordId: required(row, "source_record_id"),
      deliveryConfirmed: booleanField(row, "delivery_confirmed"),
      bolOrPodConfirmed: booleanField(row, "bol_or_pod_confirmed"),
      manualOperationalConfirmed: booleanField(row, "manual_operational_confirmed"),
      cancellationsAndClaimsReviewed: booleanField(row, "cancellations_and_claims_reviewed"),
    };
    if (
      (record.proofStatus === "completed" || record.proofStatus === "verified" || record.proofStatus === "published")
      && (!record.deliveryConfirmed
        || (!record.bolOrPodConfirmed && !record.manualOperationalConfirmed)
        || !record.cancellationsAndClaimsReviewed)
    ) {
      throw new Error(`Shipment ${record.shipmentId} cannot be ${record.proofStatus} without delivery evidence and cancellation/claims review`);
    }
    return record;
  });
}

export function importOffersCsv(csv: string, now = new Date()): NormalizedOffer[] {
  return parseCsv(csv).map((row) => {
    const expiresAt = required(row, "expires_at");
    return {
      offerId: required(row, "offer_id"),
      sourceName: required(row, "source_name"),
      sourceRecordId: required(row, "source_record_id"),
      observedAt: required(row, "observed_at"),
      expiresAt,
      pickupDate: required(row, "pickup_date"),
      originCity: required(row, "origin_city"),
      originState: required(row, "origin_state"),
      destinationCity: required(row, "destination_city"),
      destinationState: required(row, "destination_state"),
      equipmentClass: required(row, "equipment_class"),
      postedRate: nonNegativeNumber(row, "posted_rate") as number,
      negotiatedRate: nonNegativeNumber(row, "negotiated_rate", true),
      bookedRate: nonNegativeNumber(row, "booked_rate", true),
      loadedMiles: nonNegativeNumber(row, "loaded_miles") as number,
      deadheadMiles: nonNegativeNumber(row, "deadhead_miles") as number,
      freshness: new Date(expiresAt).getTime() > now.getTime() ? "fresh" : "expired",
    };
  });
}

function normalizeOfferRow(row: Record<string, string>, now: Date): NormalizedOffer {
  const expiresAt = required(row, "expires_at");
  return {
    offerId: required(row, "offer_id"),
    sourceName: required(row, "source_name"),
    sourceRecordId: required(row, "source_record_id"),
    observedAt: required(row, "observed_at"),
    expiresAt,
    pickupDate: required(row, "pickup_date"),
    originCity: required(row, "origin_city"),
    originState: required(row, "origin_state"),
    destinationCity: required(row, "destination_city"),
    destinationState: required(row, "destination_state"),
    equipmentClass: required(row, "equipment_class"),
    postedRate: nonNegativeNumber(row, "posted_rate") as number,
    negotiatedRate: nonNegativeNumber(row, "negotiated_rate", true),
    bookedRate: nonNegativeNumber(row, "booked_rate", true),
    loadedMiles: nonNegativeNumber(row, "loaded_miles") as number,
    deadheadMiles: nonNegativeNumber(row, "deadhead_miles") as number,
    freshness: new Date(expiresAt).getTime() > now.getTime() ? "fresh" : "expired",
  };
}

export function previewOffersCsvImport(csv: string, now = new Date()): OffersImportPreview {
  const rows = parseCsv(csv, offerCsvHeaders);
  assertSyntheticOfferRows(rows);

  const summary: Record<ImportPreviewStatus, number> = {
    accepted: 0,
    duplicate_candidate: 0,
    expired: 0,
    rejected: 0,
    needs_review: 0,
  };
  const acceptedOffers: NormalizedOffer[] = [];
  const quarantine: ImportQuarantineRow[] = [];
  const canonicalKeys = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    let offer: NormalizedOffer;
    try {
      offer = normalizeOfferRow(row, now);
    } catch {
      summary.rejected += 1;
      quarantine.push({ rowNumber, status: "rejected", reasons: ["INVALID_ROW_VALUE"] });
      return;
    }

    const observedAt = new Date(offer.observedAt).getTime();
    const expiresAt = new Date(offer.expiresAt).getTime();
    if (!Number.isFinite(observedAt) || !Number.isFinite(expiresAt)) {
      summary.rejected += 1;
      quarantine.push({ rowNumber, status: "rejected", reasons: ["INVALID_ROW_VALUE"] });
      return;
    }
    const reviewReasons: ImportQuarantineReason[] = [];
    if (observedAt >= expiresAt) reviewReasons.push("OBSERVED_AFTER_EXPIRY");
    if (observedAt > now.getTime()) reviewReasons.push("OBSERVED_IN_FUTURE");
    if (reviewReasons.length) {
      summary.needs_review += 1;
      quarantine.push({ rowNumber, status: "needs_review", reasons: reviewReasons });
      return;
    }
    if (offer.freshness === "expired") {
      summary.expired += 1;
      quarantine.push({ rowNumber, status: "expired", reasons: ["OFFER_EXPIRED"] });
      return;
    }

    const canonicalKey = buildCanonicalKey(offer);
    if (canonicalKeys.has(canonicalKey)) {
      summary.duplicate_candidate += 1;
      quarantine.push({ rowNumber, status: "duplicate_candidate", reasons: ["DUPLICATE_CANONICAL_OPPORTUNITY"] });
      return;
    }
    canonicalKeys.add(canonicalKey);
    summary.accepted += 1;
    acceptedOffers.push(offer);
  });

  return Object.freeze({
    mode: "synthetic_preview",
    externalWritePerformed: false,
    publicExportEnabled: PUBLIC_ROUTE_EXPORT_ENABLED,
    summary: Object.freeze(summary),
    acceptedOffers: Object.freeze(acceptedOffers.map((offer) => Object.freeze(offer))),
    quarantine: Object.freeze(quarantine.map((entry) => Object.freeze({ ...entry, reasons: Object.freeze([...entry.reasons]) }))),
  }) as OffersImportPreview;
}

const normalizePart = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function buildCanonicalKey(offer: NormalizedOffer): string {
  return [
    normalizePart(`${offer.originCity}-${offer.originState}`),
    normalizePart(`${offer.destinationCity}-${offer.destinationState}`),
    normalizePart(offer.equipmentClass),
    offer.pickupDate,
  ].join("__");
}

export function buildCanonicalOpportunities(offers: NormalizedOffer[]): CanonicalOpportunity[] {
  const groups = new Map<string, NormalizedOffer[]>();
  for (const offer of offers) {
    const key = buildCanonicalKey(offer);
    groups.set(key, [...(groups.get(key) ?? []), offer]);
  }

  return [...groups.entries()].map(([canonicalKey, sourceRecords]) => {
    const ordered = [...sourceRecords].sort((left, right) => right.observedAt.localeCompare(left.observedAt));
    const latestOffer = ordered[0];
    const freshOffers = ordered.filter((offer) => offer.freshness === "fresh");
    const latestExpiry = [...ordered].sort((left, right) => right.expiresAt.localeCompare(left.expiresAt))[0].expiresAt;
    return {
      canonicalKey,
      origin: `${latestOffer.originCity}, ${latestOffer.originState}`,
      destination: `${latestOffer.destinationCity}, ${latestOffer.destinationState}`,
      equipmentClass: latestOffer.equipmentClass,
      pickupDate: latestOffer.pickupDate,
      freshness: freshOffers.length ? "fresh" : "expired",
      expiresAt: latestExpiry,
      latestOffer,
      sourceRecords: ordered,
    };
  });
}

const round = (value: number) => Math.round(value * 100) / 100;

export function calculateRateMetrics(offer: NormalizedOffer): RateMetrics {
  const gross = offer.bookedRate ?? offer.negotiatedRate ?? offer.postedRate;
  const rateBasis = offer.bookedRate !== null ? "booked" : offer.negotiatedRate !== null ? "negotiated" : "posted";
  const totalMiles = offer.loadedMiles + offer.deadheadMiles;
  return {
    gross,
    rateBasis,
    loadedMiles: offer.loadedMiles,
    deadheadMiles: offer.deadheadMiles,
    totalMiles,
    loadedRpm: offer.loadedMiles ? round(gross / offer.loadedMiles) : 0,
    totalMileRpm: totalMiles ? round(gross / totalMiles) : 0,
    deadheadPercent: totalMiles ? round((offer.deadheadMiles / totalMiles) * 100) : 0,
  };
}

export function createReadOnlyFeed(opportunities: CanonicalOpportunity[], role: OperationsRole) {
  const active = opportunities.filter((opportunity) => opportunity.freshness === "fresh");
  const view = active.map((opportunity) => {
    const latest = opportunity.latestOffer;
    const postedMetrics = calculateRateMetrics({ ...latest, bookedRate: null, negotiatedRate: null });
    if (role === "carrier") {
      return Object.freeze({
        canonicalKey: opportunity.canonicalKey,
        origin: opportunity.origin,
        destination: opportunity.destination,
        equipmentClass: opportunity.equipmentClass,
        pickupDate: opportunity.pickupDate,
        expiresAt: opportunity.expiresAt,
        sourceCount: opportunity.sourceRecords.length,
        postedRate: latest.postedRate,
        metrics: Object.freeze(postedMetrics),
      });
    }
    return Object.freeze({
      ...opportunity,
      sourceRecords: Object.freeze([...opportunity.sourceRecords]),
      metrics: Object.freeze(calculateRateMetrics(latest)),
    });
  });
  return Object.freeze(view);
}

export function prepareManualBookingHandoff(opportunity: CanonicalOpportunity): ManualBookingHandoff {
  return Object.freeze({
    canonicalKey: opportunity.canonicalKey,
    status: "requires_manual_review",
    externalActionPerformed: false,
    nextStep: "Dispatcher reviews the source records, confirms freshness and permissions, then continues in the existing manual booking process.",
  });
}

export function buildPublicRouteExport(history: ShipmentHistoryRecord[]): ShipmentHistoryRecord[] {
  if (!PUBLIC_ROUTE_EXPORT_ENABLED) return [];
  return history.filter((record) => record.proofStatus === "published");
}
