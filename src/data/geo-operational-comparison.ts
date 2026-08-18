import type { GeoMeasurementScorecard, GeoWindowDays } from "./geo-measurement-layer.ts";

export interface GeoComparableOperationalReport {
  asOf: string;
  scorecards: GeoMeasurementScorecard[];
  ownerScorecards: Array<{
    windowDays: GeoWindowDays;
    owners: Array<{
      canonicalOwner: string;
      scorecard: GeoMeasurementScorecard;
    }>;
  }>;
}

export interface GeoComparableMetricDeltas {
  aiMentionRate: number;
  aiCitationRate: number;
  searchImpressions: number;
  searchClicks: number;
  searchCtr: number;
  nonBrandedImpressions: number;
  ctaClicks: number;
  intakeStarts: number;
  deliveryConfirmed: number;
  qualifiedLeads: number;
  opportunities: number;
  wins: number;
}

export interface GeoComparableWindowDelta {
  windowDays: GeoWindowDays;
  metrics: GeoComparableMetricDeltas;
}

export interface GeoComparableOwnerDelta extends GeoComparableWindowDelta {
  canonicalOwner: string;
}

const round = (value: number) => Number(value.toFixed(1));

const dateMs = (label: string, value: string) => {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a valid ISO date/time`);
  return parsed;
};

export const compareGeoMeasurementScorecards = (
  current: GeoMeasurementScorecard,
  previous: GeoMeasurementScorecard,
): GeoComparableMetricDeltas => {
  if (current.windowDays !== previous.windowDays) {
    throw new Error(
      `Cannot compare ${current.windowDays}-day scorecard with ${previous.windowDays}-day scorecard`,
    );
  }

  return {
    aiMentionRate: round(current.aiVisibility.mentionRate - previous.aiVisibility.mentionRate),
    aiCitationRate: round(current.aiVisibility.citationRate - previous.aiVisibility.citationRate),
    searchImpressions: current.search.impressions - previous.search.impressions,
    searchClicks: current.search.clicks - previous.search.clicks,
    searchCtr: round(current.search.ctr - previous.search.ctr),
    nonBrandedImpressions:
      current.search.nonBrandedImpressions - previous.search.nonBrandedImpressions,
    ctaClicks: current.funnel.ctaClicks - previous.funnel.ctaClicks,
    intakeStarts: current.funnel.intakeStarts - previous.funnel.intakeStarts,
    deliveryConfirmed: current.funnel.deliveryConfirmed - previous.funnel.deliveryConfirmed,
    qualifiedLeads: current.leadQuality.qualifiedLeads - previous.leadQuality.qualifiedLeads,
    opportunities: current.leadQuality.opportunities - previous.leadQuality.opportunities,
    wins: current.leadQuality.wins - previous.leadQuality.wins,
  };
};

const scorecardByWindow = (report: GeoComparableOperationalReport, windowDays: GeoWindowDays) => {
  const scorecard = report.scorecards.find((item) => item.windowDays === windowDays);
  if (!scorecard) throw new Error(`Report is missing ${windowDays}-day scorecard`);
  return scorecard;
};

export const compareGeoOperationalReports = (
  current: GeoComparableOperationalReport,
  previous: GeoComparableOperationalReport,
) => {
  const currentAsOf = dateMs("current.asOf", current.asOf);
  const previousAsOf = dateMs("previous.asOf", previous.asOf);
  if (currentAsOf <= previousAsOf) {
    throw new Error("current.asOf must be later than previous.asOf for a comparable delta");
  }

  const windows: GeoWindowDays[] = [7, 28, 90];
  const global: GeoComparableWindowDelta[] = windows.map((windowDays) => ({
    windowDays,
    metrics: compareGeoMeasurementScorecards(
      scorecardByWindow(current, windowDays),
      scorecardByWindow(previous, windowDays),
    ),
  }));

  const previousOwners = new Map<string, GeoMeasurementScorecard>();
  for (const layer of previous.ownerScorecards) {
    for (const owner of layer.owners) {
      previousOwners.set(`${layer.windowDays}|${owner.canonicalOwner}`, owner.scorecard);
    }
  }

  const owners: GeoComparableOwnerDelta[] = [];
  for (const layer of current.ownerScorecards) {
    for (const owner of layer.owners) {
      const previousScorecard = previousOwners.get(`${layer.windowDays}|${owner.canonicalOwner}`);
      if (!previousScorecard) continue;
      owners.push({
        canonicalOwner: owner.canonicalOwner,
        windowDays: layer.windowDays,
        metrics: compareGeoMeasurementScorecards(owner.scorecard, previousScorecard),
      });
    }
  }

  owners.sort(
    (left, right) =>
      left.canonicalOwner.localeCompare(right.canonicalOwner) || left.windowDays - right.windowDays,
  );

  return {
    currentAsOf: current.asOf,
    previousAsOf: previous.asOf,
    global,
    owners,
  };
};
