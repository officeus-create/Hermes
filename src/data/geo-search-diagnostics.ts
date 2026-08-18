import type {
  GeoDiscoveryType,
  GeoEvidenceClass,
  GeoSearchSource,
  GeoWindowDays,
} from "./geo-measurement-layer.ts";

export type GeoSearchQueryIntent =
  | "commercial_service"
  | "comparison"
  | "pricing"
  | "local_service"
  | "informational"
  | "brand_navigation"
  | "career"
  | "academy"
  | "product"
  | "other_reviewed";

export type GeoSearchPageIntent =
  | "commercial_owner"
  | "local_service"
  | "resource"
  | "brand_hub"
  | "academy"
  | "career"
  | "product"
  | "other_reviewed";

export type GeoSearchDiscoveryReviewState = "reviewed" | "pending_review";
export type GeoSearchCountryBucket = "US" | "WORLDWIDE" | "OTHER";
export type GeoSearchDeviceBucket = "DESKTOP" | "MOBILE" | "TABLET" | "OTHER";
export type GeoSearchCtrBand = "ctr_0" | "ctr_under_2" | "ctr_2_to_under_5" | "ctr_5_plus";
export type GeoSearchPositionBand =
  | "position_1_to_3"
  | "position_4_to_10"
  | "position_11_to_20"
  | "position_21_to_50"
  | "position_51_plus";
export type GeoSearchDiscoveryTrend =
  | "recent_discovery"
  | "recent_gap"
  | "historical_only"
  | "not_observed";

export interface GeoSearchQueryPageAggregate {
  windowDays: GeoWindowDays;
  source: GeoSearchSource;
  /** Opaque reviewed query-group ID. Raw query text is forbidden. */
  queryKey: string;
  /** Opaque reviewed semantic-intent group used to detect competing owners. */
  intentGroupKey: string;
  pagePath: string;
  canonicalOwner: string;
  discoveryType: GeoDiscoveryType;
  discoveryReviewState: GeoSearchDiscoveryReviewState;
  queryIntent: GeoSearchQueryIntent;
  pageIntent: GeoSearchPageIntent;
  countryBucket: GeoSearchCountryBucket;
  deviceBucket: GeoSearchDeviceBucket;
  impressions: number;
  clicks: number;
  /** Aggregate platform position only; never a user-level observation. */
  averagePosition: number;
  evidenceClass: Extract<GeoEvidenceClass, "platform_verified" | "owner_provided_handoff" | "unverified">;
}

export interface GeoSearchDiagnosticGroup {
  key: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface GeoSearchQueryPageDiagnostic {
  queryKey: string;
  intentGroupKeys: string[];
  pages: string[];
  canonicalOwners: string[];
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  multiPage: boolean;
  multiOwner: boolean;
  ctrBand?: GeoSearchCtrBand;
  positionBand?: GeoSearchPositionBand;
}

export interface GeoSearchPageDiscoveryTrendRecord {
  pagePath: string;
  impressions7: number;
  impressions28: number;
  impressions90: number;
  state: GeoSearchDiscoveryTrend;
}

export interface GeoSearchDiagnostics {
  windowDays: GeoWindowDays;
  totals: {
    queryPageRows: number;
    uniqueQueryKeys: number;
    uniquePages: number;
    impressions: number;
    clicks: number;
    ctr: number;
  };
  byQueryIntent: GeoSearchDiagnosticGroup[];
  byPageIntent: GeoSearchDiagnosticGroup[];
  byCountry: GeoSearchDiagnosticGroup[];
  byDevice: GeoSearchDiagnosticGroup[];
  queryPage: GeoSearchQueryPageDiagnostic[];
  multiPageQueryKeys: string[];
  pendingDiscoveryReviewQueryKeys: string[];
  nonCanonicalQueryKeys: string[];
  competingOwnerIntentGroupKeys: string[];
  zeroClickOpportunityQueryKeys: string[];
  clicksWithoutCommercialCtaQueryKeys: string[];
  commercialCtaEvidenceProvided: boolean;
  platformEvidenceQueryKeys: string[];
  evidenceClasses: GeoSearchQueryPageAggregate["evidenceClass"][];
  pageDiscoveryTrends: GeoSearchPageDiscoveryTrendRecord[];
}

export interface GeoSearchDiagnosticOptions {
  /** Repository-verified canonical owners that expose an eligible commercial CTA. */
  commercialCtaOwners?: string[];
}

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const assertWholeNonNegative = (label: string, value: number) => {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer`);
};

const assertPosition = (value: number) => {
  if (!Number.isFinite(value) || value < 0) throw new Error("averagePosition must be a finite non-negative number");
};

const validateOpaqueKey = (label: string, value: string) => {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,79}$/.test(value)) {
    throw new Error(`${label} must be an opaque safe identifier: ${value}`);
  }
};

const validatePagePath = (pagePath: string) => {
  if (!pagePath.startsWith("/") || pagePath.startsWith("//") || /[?#]/.test(pagePath)) {
    throw new Error(`pagePath must be a clean site-relative path: ${pagePath}`);
  }
};

export const validateGeoSearchQueryPageRows = (rows: GeoSearchQueryPageAggregate[]) => {
  for (const row of rows) {
    validateOpaqueKey("queryKey", row.queryKey);
    validateOpaqueKey("intentGroupKey", row.intentGroupKey);
    validatePagePath(row.pagePath);
    validatePagePath(row.canonicalOwner);
    assertWholeNonNegative("impressions", row.impressions);
    assertWholeNonNegative("clicks", row.clicks);
    assertPosition(row.averagePosition);
    if (row.clicks > row.impressions) throw new Error("clicks cannot exceed impressions");
  }
  return rows;
};

const groupRows = (
  rows: GeoSearchQueryPageAggregate[],
  select: (row: GeoSearchQueryPageAggregate) => string,
): GeoSearchDiagnosticGroup[] => {
  const groups = new Map<string, { impressions: number; clicks: number }>();
  for (const row of rows) {
    const key = select(row);
    const current = groups.get(key) ?? { impressions: 0, clicks: 0 };
    current.impressions += row.impressions;
    current.clicks += row.clicks;
    groups.set(key, current);
  }
  return [...groups.entries()]
    .map(([key, values]) => ({
      key,
      impressions: values.impressions,
      clicks: values.clicks,
      ctr: rate(values.clicks, values.impressions),
    }))
    .sort((left, right) => right.impressions - left.impressions || left.key.localeCompare(right.key));
};

export const classifyGeoCtrBand = (ctr: number): GeoSearchCtrBand => {
  if (ctr === 0) return "ctr_0";
  if (ctr < 2) return "ctr_under_2";
  if (ctr < 5) return "ctr_2_to_under_5";
  return "ctr_5_plus";
};

export const classifyGeoPositionBand = (position: number): GeoSearchPositionBand => {
  if (position <= 3) return "position_1_to_3";
  if (position <= 10) return "position_4_to_10";
  if (position <= 20) return "position_11_to_20";
  if (position <= 50) return "position_21_to_50";
  return "position_51_plus";
};

const weightedPosition = (rows: GeoSearchQueryPageAggregate[]) => {
  const eligible = rows.filter((row) => row.impressions > 0);
  const impressions = eligible.reduce((total, row) => total + row.impressions, 0);
  if (impressions === 0) return 0;
  return Number(
    (
      eligible.reduce((total, row) => total + row.averagePosition * row.impressions, 0) /
      impressions
    ).toFixed(1),
  );
};

export const buildGeoPageDiscoveryTrends = (
  rows: GeoSearchQueryPageAggregate[],
): GeoSearchPageDiscoveryTrendRecord[] => {
  validateGeoSearchQueryPageRows(rows);
  const pages = [...new Set(rows.map((row) => row.pagePath))].sort();
  const impressionsFor = (pagePath: string, windowDays: GeoWindowDays) =>
    rows
      .filter((row) => row.pagePath === pagePath && row.windowDays === windowDays)
      .reduce((total, row) => total + row.impressions, 0);

  return pages.map((pagePath) => {
    const impressions7 = impressionsFor(pagePath, 7);
    const impressions28 = impressionsFor(pagePath, 28);
    const impressions90 = impressionsFor(pagePath, 90);
    const state: GeoSearchDiscoveryTrend =
      impressions7 > 0
        ? "recent_discovery"
        : impressions28 > 0
          ? "recent_gap"
          : impressions90 > 0
            ? "historical_only"
            : "not_observed";
    return { pagePath, impressions7, impressions28, impressions90, state };
  });
};

export const buildGeoSearchDiagnostics = (
  rows: GeoSearchQueryPageAggregate[],
  windowDays: GeoWindowDays,
  options: GeoSearchDiagnosticOptions = {},
): GeoSearchDiagnostics => {
  validateGeoSearchQueryPageRows(rows);
  const scoped = rows.filter((row) => row.windowDays === windowDays);
  const platformScoped = scoped.filter((row) => row.evidenceClass === "platform_verified");
  const commercialCtaOwners = options.commercialCtaOwners
    ? new Set(options.commercialCtaOwners)
    : null;

  if (commercialCtaOwners) {
    for (const owner of commercialCtaOwners) validatePagePath(owner);
  }

  const queryGroups = new Map<string, GeoSearchQueryPageAggregate[]>();
  for (const row of scoped) {
    queryGroups.set(row.queryKey, [...(queryGroups.get(row.queryKey) ?? []), row]);
  }

  const platformQueryKeys = new Set(platformScoped.map((row) => row.queryKey));
  const queryPage = [...queryGroups.entries()]
    .map(([queryKey, queryRows]) => {
      const pages = [...new Set(queryRows.map((row) => row.pagePath))].sort();
      const canonicalOwners = [...new Set(queryRows.map((row) => row.canonicalOwner))].sort();
      const intentGroupKeys = [...new Set(queryRows.map((row) => row.intentGroupKey))].sort();
      const impressions = queryRows.reduce((total, row) => total + row.impressions, 0);
      const clicks = queryRows.reduce((total, row) => total + row.clicks, 0);
      const platformRows = queryRows.filter((row) => row.evidenceClass === "platform_verified");
      const platformImpressions = platformRows.reduce((total, row) => total + row.impressions, 0);
      const platformClicks = platformRows.reduce((total, row) => total + row.clicks, 0);
      const platformCtr = rate(platformClicks, platformImpressions);
      const platformPosition = weightedPosition(platformRows);
      return {
        queryKey,
        intentGroupKeys,
        pages,
        canonicalOwners,
        impressions,
        clicks,
        ctr: rate(clicks, impressions),
        averagePosition: weightedPosition(queryRows),
        multiPage: pages.length > 1,
        multiOwner: canonicalOwners.length > 1,
        ctrBand: platformRows.length > 0 ? classifyGeoCtrBand(platformCtr) : undefined,
        positionBand:
          platformRows.some((row) => row.impressions > 0)
            ? classifyGeoPositionBand(platformPosition)
            : undefined,
      };
    })
    .sort((left, right) => right.impressions - left.impressions || left.queryKey.localeCompare(right.queryKey));

  const intentOwners = new Map<string, Set<string>>();
  for (const row of scoped.filter((item) => item.discoveryReviewState === "reviewed")) {
    const owners = intentOwners.get(row.intentGroupKey) ?? new Set<string>();
    owners.add(row.canonicalOwner);
    intentOwners.set(row.intentGroupKey, owners);
  }

  const impressions = scoped.reduce((total, row) => total + row.impressions, 0);
  const clicks = scoped.reduce((total, row) => total + row.clicks, 0);

  return {
    windowDays,
    totals: {
      queryPageRows: scoped.length,
      uniqueQueryKeys: queryGroups.size,
      uniquePages: new Set(scoped.map((row) => row.pagePath)).size,
      impressions,
      clicks,
      ctr: rate(clicks, impressions),
    },
    byQueryIntent: groupRows(scoped, (row) => row.queryIntent),
    byPageIntent: groupRows(scoped, (row) => row.pageIntent),
    byCountry: groupRows(scoped, (row) => row.countryBucket),
    byDevice: groupRows(scoped, (row) => row.deviceBucket),
    queryPage,
    multiPageQueryKeys: queryPage.filter((item) => item.multiPage).map((item) => item.queryKey),
    pendingDiscoveryReviewQueryKeys: [
      ...new Set(
        scoped
          .filter((row) => row.discoveryReviewState === "pending_review")
          .map((row) => row.queryKey),
      ),
    ].sort(),
    nonCanonicalQueryKeys: [
      ...new Set(scoped.filter((row) => row.pagePath !== row.canonicalOwner).map((row) => row.queryKey)),
    ].sort(),
    competingOwnerIntentGroupKeys: [...intentOwners.entries()]
      .filter(([, owners]) => owners.size > 1)
      .map(([intentGroupKey]) => intentGroupKey)
      .sort(),
    zeroClickOpportunityQueryKeys: queryPage
      .filter((item) => item.impressions > 0 && item.clicks === 0)
      .map((item) => item.queryKey),
    clicksWithoutCommercialCtaQueryKeys: commercialCtaOwners
      ? [
          ...new Set(
            scoped
              .filter((row) => row.clicks > 0 && !commercialCtaOwners.has(row.canonicalOwner))
              .map((row) => row.queryKey),
          ),
        ].sort()
      : [],
    commercialCtaEvidenceProvided: commercialCtaOwners !== null,
    platformEvidenceQueryKeys: [...platformQueryKeys].sort(),
    evidenceClasses: [...new Set(scoped.map((row) => row.evidenceClass))].sort(),
    pageDiscoveryTrends: buildGeoPageDiscoveryTrends(rows),
  };
};

export const findGeoSearchQueryDiagnostic = (
  diagnostics: GeoSearchDiagnostics,
  queryKey: string,
) => diagnostics.queryPage.find((item) => item.queryKey === queryKey) ?? null;
