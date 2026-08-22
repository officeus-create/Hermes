import type { AiVisibilityProvider } from "./ai-visibility-scorecard.ts";
import type { GeoEvidenceClass, GeoWindowDays } from "./geo-measurement-layer.ts";

export type GeoAiReferralAttributionState = "provider_identified" | "ai_referral_unresolved";
export type GeoAiReferralEvidenceClass = Extract<
  GeoEvidenceClass,
  "platform_verified" | "owner_provided_handoff" | "unverified"
>;

export interface GeoAiReferralAggregate {
  windowDays: GeoWindowDays;
  canonicalOwner: string;
  attributionState: GeoAiReferralAttributionState;
  provider: AiVisibilityProvider | null;
  landingSessions: number;
  ctaSessions: number;
  intakeSessions: number;
  evidenceClass: GeoAiReferralEvidenceClass;
}

export interface GeoAiReferralGroup {
  key: string;
  landingSessions: number;
  ctaSessions: number;
  intakeSessions: number;
  landingToCtaRate: number;
  ctaToIntakeRate: number;
}

export interface GeoAiReferralScorecard {
  windowDays: GeoWindowDays;
  totals: Omit<GeoAiReferralGroup, "key"> & {
    identifiedLandingSessions: number;
    unresolvedLandingSessions: number;
    providerIdentificationRate: number;
  };
  byProvider: GeoAiReferralGroup[];
  byOwner: GeoAiReferralGroup[];
  evidenceClasses: GeoAiReferralEvidenceClass[];
}

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const assertWholeNonNegative = (label: string, value: number) => {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer`);
};

const validateOwner = (canonicalOwner: string) => {
  if (!canonicalOwner.startsWith("/") || canonicalOwner.startsWith("//") || /[?#]/.test(canonicalOwner)) {
    throw new Error(`canonicalOwner must be a clean site-relative path: ${canonicalOwner}`);
  }
};

export const validateGeoAiReferralAggregates = (rows: GeoAiReferralAggregate[]) => {
  for (const row of rows) {
    validateOwner(row.canonicalOwner);
    assertWholeNonNegative("landingSessions", row.landingSessions);
    assertWholeNonNegative("ctaSessions", row.ctaSessions);
    assertWholeNonNegative("intakeSessions", row.intakeSessions);
    if (row.ctaSessions > row.landingSessions) {
      throw new Error("ctaSessions cannot exceed landingSessions");
    }
    if (row.intakeSessions > row.ctaSessions) {
      throw new Error("intakeSessions cannot exceed ctaSessions");
    }
    if (row.attributionState === "provider_identified" && !row.provider) {
      throw new Error("provider_identified rows require a provider");
    }
    if (row.attributionState === "ai_referral_unresolved" && row.provider !== null) {
      throw new Error("ai_referral_unresolved rows must not guess a provider");
    }
  }
  return rows;
};

const group = (
  rows: GeoAiReferralAggregate[],
  keyFor: (row: GeoAiReferralAggregate) => string,
): GeoAiReferralGroup[] => {
  const groups = new Map<string, { landingSessions: number; ctaSessions: number; intakeSessions: number }>();
  for (const row of rows) {
    const key = keyFor(row);
    const current = groups.get(key) ?? { landingSessions: 0, ctaSessions: 0, intakeSessions: 0 };
    current.landingSessions += row.landingSessions;
    current.ctaSessions += row.ctaSessions;
    current.intakeSessions += row.intakeSessions;
    groups.set(key, current);
  }
  return [...groups.entries()]
    .map(([key, values]) => ({
      key,
      ...values,
      landingToCtaRate: rate(values.ctaSessions, values.landingSessions),
      ctaToIntakeRate: rate(values.intakeSessions, values.ctaSessions),
    }))
    .sort((left, right) => right.landingSessions - left.landingSessions || left.key.localeCompare(right.key));
};

export const buildGeoAiReferralScorecard = (
  rows: GeoAiReferralAggregate[],
  windowDays: GeoWindowDays,
): GeoAiReferralScorecard => {
  validateGeoAiReferralAggregates(rows);
  const scoped = rows.filter((row) => row.windowDays === windowDays);
  const landingSessions = scoped.reduce((total, row) => total + row.landingSessions, 0);
  const ctaSessions = scoped.reduce((total, row) => total + row.ctaSessions, 0);
  const intakeSessions = scoped.reduce((total, row) => total + row.intakeSessions, 0);
  const identifiedLandingSessions = scoped
    .filter((row) => row.attributionState === "provider_identified")
    .reduce((total, row) => total + row.landingSessions, 0);
  const unresolvedLandingSessions = landingSessions - identifiedLandingSessions;

  return {
    windowDays,
    totals: {
      landingSessions,
      ctaSessions,
      intakeSessions,
      landingToCtaRate: rate(ctaSessions, landingSessions),
      ctaToIntakeRate: rate(intakeSessions, ctaSessions),
      identifiedLandingSessions,
      unresolvedLandingSessions,
      providerIdentificationRate: rate(identifiedLandingSessions, landingSessions),
    },
    byProvider: group(scoped, (row) => row.provider ?? "unresolved_ai_referral"),
    byOwner: group(scoped, (row) => row.canonicalOwner),
    evidenceClasses: [...new Set(scoped.map((row) => row.evidenceClass))],
  };
};
