export const geoGscFreshCheckpointVersion = "geo_gsc_checkpoint_v1" as const;
export type GeoGscCheckpointEvidenceClass = "owner_provided_handoff";

export interface GeoGscCountrySlice {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number | null;
}

export interface GeoGscPageSlice {
  canonicalOwner: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  averagePosition: number | null;
}

export interface GeoGscSearchAppearanceSlice {
  appearance: string;
  clicks: number | null;
  impressions: number;
  ctr: number | null;
  averagePosition: number;
}

export interface GeoGscExactCheckpoint {
  schemaVersion: typeof geoGscFreshCheckpointVersion;
  evidenceClass: GeoGscCheckpointEvidenceClass;
  sourceLabel: string;
  startDate: string;
  endDate: string;
  inclusiveDays: number;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number | null;
  countries: GeoGscCountrySlice[];
  pages: GeoGscPageSlice[];
  searchAppearances: GeoGscSearchAppearanceSlice[];
}

const round = (value: number, digits = 2) => Number(value.toFixed(digits));
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const inclusiveDays = (start: string, end: string) => Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
const percent = (clicks: number, impressions: number) => impressions === 0 ? 0 : round((clicks / impressions) * 100, 2);
const finiteNonNegative = (value: number, label: string) => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number`);
  return value;
};
const cleanPath = (value: string) => {
  if (!value.startsWith("/") || value.startsWith("//") || /[?#]/.test(value)) throw new Error(`canonical owner must be a clean site-relative path: ${value}`);
  return value;
};

export const geoFreshGscCheckpoint20260819: GeoGscExactCheckpoint = {
  schemaVersion: geoGscFreshCheckpointVersion,
  evidenceClass: "owner_provided_handoff",
  sourceLabel: "GSC export supplied 2026-08-19; sanitized aggregate checkpoint",
  startDate: "2026-07-30",
  endDate: "2026-08-16",
  inclusiveDays: 18,
  clicks: 18,
  impressions: 791,
  ctr: 2.28,
  averagePosition: null,
  countries: [
    { country: "United States", clicks: 2, impressions: 500, ctr: 0.4, averagePosition: 46.06 },
    { country: "Ukraine", clicks: 12, impressions: 53, ctr: 22.64, averagePosition: null },
  ],
  pages: [
    { canonicalOwner: "/services/seo-for-logistics-companies/", clicks: null, impressions: 242, ctr: null, averagePosition: null },
    { canonicalOwner: "/services/seo/", clicks: null, impressions: 89, ctr: null, averagePosition: null },
    { canonicalOwner: "/logistics/car-hauling-dispatch/", clicks: null, impressions: 20, ctr: null, averagePosition: null },
    { canonicalOwner: "/careers/car-hauling-dispatcher/", clicks: null, impressions: null, ctr: null, averagePosition: 5.12 },
  ],
  searchAppearances: [
    { appearance: "Job listings", clicks: null, impressions: 7, ctr: null, averagePosition: 2.71 },
  ],
};

export const validateGeoGscExactCheckpoint = (checkpoint: GeoGscExactCheckpoint) => {
  if (checkpoint.schemaVersion !== geoGscFreshCheckpointVersion) throw new Error(`Unsupported GSC checkpoint schema version`);
  if (checkpoint.evidenceClass !== "owner_provided_handoff") throw new Error(`Fresh checkpoint must preserve owner_provided_handoff provenance`);
  if (!dateOnly.test(checkpoint.startDate) || !dateOnly.test(checkpoint.endDate)) throw new Error(`GSC checkpoint dates must use YYYY-MM-DD`);
  const derivedDays = inclusiveDays(checkpoint.startDate, checkpoint.endDate);
  if (derivedDays < 1) throw new Error(`GSC checkpoint end date must not precede start date`);
  if (checkpoint.inclusiveDays !== derivedDays) throw new Error(`GSC checkpoint inclusiveDays mismatch`);
  finiteNonNegative(checkpoint.clicks, "clicks");
  finiteNonNegative(checkpoint.impressions, "impressions");
  if (checkpoint.clicks > checkpoint.impressions) throw new Error(`clicks cannot exceed impressions`);
  if (checkpoint.ctr !== percent(checkpoint.clicks, checkpoint.impressions)) throw new Error(`GSC checkpoint CTR does not reconcile to clicks/impressions`);
  for (const country of checkpoint.countries) {
    finiteNonNegative(country.clicks, `${country.country} clicks`);
    finiteNonNegative(country.impressions, `${country.country} impressions`);
    if (country.clicks > country.impressions) throw new Error(`${country.country} clicks cannot exceed impressions`);
    if (country.ctr !== percent(country.clicks, country.impressions)) throw new Error(`${country.country} CTR does not reconcile`);
    if (country.averagePosition !== null) finiteNonNegative(country.averagePosition, `${country.country} averagePosition`);
  }
  for (const page of checkpoint.pages) {
    cleanPath(page.canonicalOwner);
    if (page.clicks !== null) finiteNonNegative(page.clicks, `${page.canonicalOwner} clicks`);
    if (page.impressions !== null) finiteNonNegative(page.impressions, `${page.canonicalOwner} impressions`);
    if (page.ctr !== null) finiteNonNegative(page.ctr, `${page.canonicalOwner} ctr`);
    if (page.averagePosition !== null) finiteNonNegative(page.averagePosition, `${page.canonicalOwner} averagePosition`);
    if (page.clicks !== null && page.impressions !== null && page.ctr !== percent(page.clicks, page.impressions)) throw new Error(`${page.canonicalOwner} CTR does not reconcile`);
  }
  for (const appearance of checkpoint.searchAppearances) {
    finiteNonNegative(appearance.impressions, `${appearance.appearance} impressions`);
    finiteNonNegative(appearance.averagePosition, `${appearance.appearance} averagePosition`);
  }
  return checkpoint;
};

export const classifyGeoGscCheckpointWindow = (checkpoint: GeoGscExactCheckpoint) => {
  validateGeoGscExactCheckpoint(checkpoint);
  if (checkpoint.inclusiveDays === 7 || checkpoint.inclusiveDays === 28 || checkpoint.inclusiveDays === 90) {
    return { state: "standard_window" as const, windowDays: checkpoint.inclusiveDays as 7 | 28 | 90, heldReason: null };
  }
  return {
    state: "exact_checkpoint_held" as const,
    windowDays: null,
    heldReason: `exact_${checkpoint.inclusiveDays}_day_checkpoint_not_comparable_to_7_28_90`,
  };
};

export const buildGeoGscCountryOpportunity = (checkpoint: GeoGscExactCheckpoint, commercialTarget = "United States") => {
  validateGeoGscExactCheckpoint(checkpoint);
  return checkpoint.countries.map((country) => {
    const targetWeight = country.country === commercialTarget ? 100 : 0;
    const lowCtrPressure = round(country.impressions * (1 - country.ctr / 100), 2);
    const positionPressure = country.averagePosition === null ? 0 : round(Math.max(0, country.averagePosition - 10), 2);
    return {
      ...country,
      commercialTarget: country.country === commercialTarget,
      opportunityScore: round(targetWeight + lowCtrPressure + positionPressure, 2),
      diagnostic: country.averagePosition !== null && country.averagePosition > 40
        ? "ranking_and_ctr_review"
        : country.ctr < 2 && country.impressions >= 100
          ? "ctr_review"
          : "observe",
    };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions || a.country.localeCompare(b.country));
};

export const assertGeoGscCheckpointCannotEnterStandardDelta = (checkpoint: GeoGscExactCheckpoint, requestedWindow: 7 | 28 | 90) => {
  const classification = classifyGeoGscCheckpointWindow(checkpoint);
  if (classification.windowDays !== requestedWindow) {
    throw new Error(`Exact ${checkpoint.inclusiveDays}-day GSC checkpoint cannot be relabeled as ${requestedWindow}-day evidence`);
  }
  return true;
};

validateGeoGscExactCheckpoint(geoFreshGscCheckpoint20260819);
