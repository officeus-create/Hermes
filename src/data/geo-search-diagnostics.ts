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

export interface GeoSearchQueryPageAggregate {
  windowDays: GeoWindowDays;
  source: GeoSearchSource;
  queryKey: string;
  pagePath: string;
  discoveryType: GeoDiscoveryType;
  queryIntent: GeoSearchQueryIntent;
  pageIntent: GeoSearchPageIntent;
  countryCode: string;
  impressions: number;
  clicks: number;
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
  pages: string[];
  impressions: number;
  clicks: number;
  ctr: number;
  multiPage: boolean;
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
  queryPage: GeoSearchQueryPageDiagnostic[];
  multiPageQueryKeys: string[];
  evidenceClasses: GeoSearchQueryPageAggregate["evidenceClass"][];
}

const rate = (value: number, denominator: number) =>
  denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(1));

const assertWholeNonNegative = (label: string, value: number) => {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer`);
};

const validateQueryKey = (queryKey: string) => {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,79}$/.test(queryKey)) {
    throw new Error(`queryKey must be an opaque safe identifier: ${queryKey}`);
  }
};

const validateCountryCode = (countryCode: string) => {
  if (countryCode !== "ALL" && !/^[A-Z]{2}$/.test(countryCode)) {
    throw new Error(`countryCode must be ALL or a two-letter uppercase country code: ${countryCode}`);
  }
};

const validatePagePath = (pagePath: string) => {
  if (!pagePath.startsWith("/") || pagePath.startsWith("//") || /[?#]/.test(pagePath)) {
    throw new Error(`pagePath must be a clean site-relative path: ${pagePath}`);
  }
};

export const validateGeoSearchQueryPageRows = (rows: GeoSearchQueryPageAggregate[]) => {
  for (const row of rows) {
    validateQueryKey(row.queryKey);
    validatePagePath(row.pagePath);
    validateCountryCode(row.countryCode);
    assertWholeNonNegative("impressions", row.impressions);
    assertWholeNonNegative("clicks", row.clicks);
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

export const buildGeoSearchDiagnostics = (
  rows: GeoSearchQueryPageAggregate[],
  windowDays: GeoWindowDays,
): GeoSearchDiagnostics => {
  validateGeoSearchQueryPageRows(rows);
  const scoped = rows.filter((row) => row.windowDays === windowDays);

  const queryGroups = new Map<string, { pages: Set<string>; impressions: number; clicks: number }>();
  for (const row of scoped) {
    const current = queryGroups.get(row.queryKey) ?? {
      pages: new Set<string>(),
      impressions: 0,
      clicks: 0,
    };
    current.pages.add(row.pagePath);
    current.impressions += row.impressions;
    current.clicks += row.clicks;
    queryGroups.set(row.queryKey, current);
  }

  const queryPage = [...queryGroups.entries()]
    .map(([queryKey, values]) => ({
      queryKey,
      pages: [...values.pages].sort(),
      impressions: values.impressions,
      clicks: values.clicks,
      ctr: rate(values.clicks, values.impressions),
      multiPage: values.pages.size > 1,
    }))
    .sort((left, right) => right.impressions - left.impressions || left.queryKey.localeCompare(right.queryKey));

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
    byCountry: groupRows(scoped, (row) => row.countryCode),
    queryPage,
    multiPageQueryKeys: queryPage.filter((item) => item.multiPage).map((item) => item.queryKey),
    evidenceClasses: [...new Set(scoped.map((row) => row.evidenceClass))],
  };
};

export const findGeoSearchQueryDiagnostic = (
  diagnostics: GeoSearchDiagnostics,
  queryKey: string,
) => diagnostics.queryPage.find((item) => item.queryKey === queryKey) ?? null;
