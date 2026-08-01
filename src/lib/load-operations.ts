export type OperationsRole = "dispatcher" | "carrier";
export type RouteProofStatus = "observed" | "booked" | "completed" | "verified" | "published";
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

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
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

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseLine(line);
    if (values.length !== headers.length) throw new Error(`CSV row ${rowIndex + 2} has ${values.length} values; expected ${headers.length}`);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
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
  if (value === "observed" || value === "booked" || value === "completed" || value === "verified" || value === "published") return value;
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
