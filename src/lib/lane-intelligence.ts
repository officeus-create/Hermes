export type OfferStatus = "new" | "updated" | "possibly_booked" | "expired" | "removed";

export type SourceLoadOffer = {
  provider: string;
  providerLoadId: string;
  equipment: string;
  cargoCategory: string;
  cargoUnits: number;
  originMarket: string;
  destinationMarket: string;
  pickupDate: string;
  postedRate: number;
  loadedMiles: number;
  deadheadMiles: number;
  createdAt: string;
  seenAt: string;
  expiresAt: string;
  status: OfferStatus;
};

export type RankedOpportunity = {
  offer: SourceLoadOffer;
  totalMiles: number;
  ratePerLoadedMile: number;
  ratePerTotalMile: number;
  estimatedVariableCost: number;
  estimatedContribution: number;
  freshnessMinutes: number;
  active: boolean;
  score: number;
  reasons: string[];
};

const market = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const finite = (value: number) => Number.isFinite(value) ? value : 0;

export function normalizeManualOffer(input: Partial<SourceLoadOffer>): SourceLoadOffer {
  const required: (keyof SourceLoadOffer)[] = ["provider", "providerLoadId", "equipment", "originMarket", "destinationMarket", "pickupDate", "seenAt", "expiresAt"];
  for (const key of required) {
    if (!String(input[key] ?? "").trim()) throw new Error(`Missing manual offer field: ${key}`);
  }
  return {
    provider: String(input.provider).trim(),
    providerLoadId: String(input.providerLoadId).trim(),
    equipment: market(String(input.equipment)),
    cargoCategory: market(String(input.cargoCategory ?? "other")),
    cargoUnits: Math.max(1, Math.round(finite(Number(input.cargoUnits ?? 1)))),
    originMarket: market(String(input.originMarket)),
    destinationMarket: market(String(input.destinationMarket)),
    pickupDate: String(input.pickupDate),
    postedRate: Math.max(0, finite(Number(input.postedRate))),
    loadedMiles: Math.max(0, finite(Number(input.loadedMiles))),
    deadheadMiles: Math.max(0, finite(Number(input.deadheadMiles))),
    createdAt: String(input.createdAt ?? input.seenAt),
    seenAt: String(input.seenAt),
    expiresAt: String(input.expiresAt),
    status: input.status ?? "new",
  };
}

export function opportunityFingerprint(offer: SourceLoadOffer): string {
  return [
    market(offer.originMarket),
    market(offer.destinationMarket),
    offer.pickupDate.slice(0, 10),
    market(offer.equipment),
    market(offer.cargoCategory),
    offer.cargoUnits,
  ].join("|");
}

export function groupDuplicateOffers(offers: SourceLoadOffer[]) {
  const groups = new Map<string, SourceLoadOffer[]>();
  for (const offer of offers) {
    const key = opportunityFingerprint(offer);
    groups.set(key, [...(groups.get(key) ?? []), offer]);
  }
  return [...groups.entries()].map(([fingerprint, sources]) => ({
    canonicalOpportunityId: `manual:${fingerprint}`,
    fingerprint,
    sources: sources.sort((a, b) => Date.parse(b.seenAt) - Date.parse(a.seenAt)),
    matchConfidence: "high" as const,
    freshestSeenAt: sources.reduce((latest, source) => Date.parse(source.seenAt) > Date.parse(latest) ? source.seenAt : latest, sources[0].seenAt),
  }));
}

export function rankOffer(
  offer: SourceLoadOffer,
  options: { now: Date; costPerMile: number; tollEstimate?: number; reloadProbability?: number },
): RankedOpportunity {
  const totalMiles = offer.loadedMiles + offer.deadheadMiles;
  const freshnessMinutes = Math.max(0, (options.now.getTime() - Date.parse(offer.seenAt)) / 60_000);
  const active = ["new", "updated"].includes(offer.status)
    && Date.parse(offer.expiresAt) > options.now.getTime()
    && freshnessMinutes <= 24 * 60;
  const ratePerLoadedMile = offer.loadedMiles > 0 ? offer.postedRate / offer.loadedMiles : 0;
  const ratePerTotalMile = totalMiles > 0 ? offer.postedRate / totalMiles : 0;
  const estimatedVariableCost = totalMiles * Math.max(0, options.costPerMile) + Math.max(0, options.tollEstimate ?? 0);
  const estimatedContribution = offer.postedRate - estimatedVariableCost;
  const reloadProbability = Math.min(1, Math.max(0, options.reloadProbability ?? 0));
  const score = active
    ? ratePerTotalMile * 35 + Math.max(0, estimatedContribution) / 100 + reloadProbability * 20 - Math.min(freshnessMinutes / 60, 24)
    : 0;
  return {
    offer,
    totalMiles,
    ratePerLoadedMile,
    ratePerTotalMile,
    estimatedVariableCost,
    estimatedContribution,
    freshnessMinutes,
    active,
    score: Number(score.toFixed(3)),
    reasons: [
      `Posted rate: $${offer.postedRate.toFixed(2)}`,
      `Total-mile RPM: $${ratePerTotalMile.toFixed(2)}`,
      `Estimated contribution after variable cost: $${estimatedContribution.toFixed(2)}`,
      `Reload probability input: ${(reloadProbability * 100).toFixed(0)}%`,
      active ? "Offer is active and fresh enough to rank." : "Offer is stale, expired, removed, or possibly booked and cannot rank.",
    ],
  };
}

export function mayPublishLane(state: "preferred" | "observed" | "completed" | "verified" | "published", publicApproved: boolean) {
  return publicApproved && (state === "verified" || state === "published");
}
