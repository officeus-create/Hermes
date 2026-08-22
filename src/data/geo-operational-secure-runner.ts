import { buildGeoOperationalScorecardReport } from "./geo-operational-scorecard.ts";
import {
  assertGeoOperationalBundleSecurity,
  assertGeoOperationalReportPrivacy,
  stableGeoJsonStringify,
} from "./geo-operational-security.ts";

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("GEO operational input must be an object");
  }
  return value as Record<string, unknown>;
};

const sortedArray = (value: unknown) => {
  if (!Array.isArray(value)) return value;
  return [...value].sort((left, right) =>
    stableGeoJsonStringify(left, 0).localeCompare(stableGeoJsonStringify(right, 0)),
  );
};

/**
 * Canonicalize only top-level evidence row order before compilation.
 * The source evidence values are not modified; this removes import-order noise
 * from downstream maps and diagnostic arrays.
 */
export const canonicalizeGeoOperationalInput = (input: unknown) => {
  const row = asRecord(input);
  return {
    ...row,
    ai_observations: sortedArray(row.ai_observations),
    search_checkpoints: sortedArray(row.search_checkpoints),
    analytics_events: sortedArray(row.analytics_events),
    outcomes: sortedArray(row.outcomes),
  };
};

export const buildSecureGeoOperationalScorecardReport = (input: unknown) => {
  assertGeoOperationalBundleSecurity(input);
  const canonicalInput = canonicalizeGeoOperationalInput(input);
  const report = buildGeoOperationalScorecardReport(canonicalInput);
  assertGeoOperationalReportPrivacy(report);
  return report;
};

export const serializeSecureGeoOperationalScorecardReport = (input: unknown) =>
  `${stableGeoJsonStringify(buildSecureGeoOperationalScorecardReport(input), 2)}\n`;
