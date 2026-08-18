import type {
  GeoEvidenceClass,
  GeoMeasurementScorecard,
  GeoWindowDays,
} from "./geo-measurement-layer.ts";
import type { GeoOwnerMeasurementRecord } from "./geo-owner-measurement.ts";

export type GeoEvidenceFreshnessState =
  | "fresh"
  | "aging"
  | "stale"
  | "undated"
  | "unverified"
  | "missing";

export type GeoEvidenceLayer = "ai_visibility" | "search" | "funnel" | "outcomes";

export interface GeoEvidenceFreshnessRecord {
  layer: GeoEvidenceLayer;
  windowDays: GeoWindowDays;
  canonicalOwner: string;
  evidenceClass?: GeoEvidenceClass;
  observedAt?: string;
  freshness: GeoEvidenceFreshnessState;
  ageDays?: number;
}

export interface GeoEvidenceHealthInputRecord {
  layer: GeoEvidenceLayer;
  windowDays: GeoWindowDays;
  canonicalOwner: string;
  evidenceClass?: GeoEvidenceClass;
  observedAt?: string;
}

export interface GeoOwnerReadinessRecord {
  canonicalOwner: string;
  windowDays: GeoWindowDays;
  readinessPercent: number;
  presentLayers: GeoEvidenceLayer[];
  missingLayers: GeoEvidenceLayer[];
  mixedEvidenceLayers: GeoEvidenceLayer[];
  evidenceClasses: GeoMeasurementScorecard["evidence"];
  reconciliationStatus: GeoOwnerMeasurementRecord["reconciliation"]["status"];
}

export interface GeoOwnerCoverageSummary {
  canonicalOwner: string;
  windowsWithAnyEvidence: GeoWindowDays[];
  completeWindows: GeoWindowDays[];
  inconsistentWindows: GeoWindowDays[];
  missingWindows: GeoWindowDays[];
}

const DAY_MS = 86_400_000;

const freshnessThresholds: Record<
  Exclude<GeoEvidenceClass, "unverified">,
  { freshThroughDays: number; agingThroughDays: number }
> = {
  repository_verified: { freshThroughDays: 30, agingThroughDays: 90 },
  production_verified: { freshThroughDays: 14, agingThroughDays: 45 },
  platform_verified: { freshThroughDays: 7, agingThroughDays: 28 },
  production_receiver_verified: { freshThroughDays: 7, agingThroughDays: 28 },
  private_operations_verified: { freshThroughDays: 7, agingThroughDays: 28 },
  owner_provided_handoff: { freshThroughDays: 7, agingThroughDays: 28 },
};

const parseTime = (label: string, value: string) => {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a valid ISO date/time`);
  return parsed;
};

export const classifyGeoEvidenceFreshness = (
  evidenceClass: GeoEvidenceClass | undefined,
  observedAt: string | undefined,
  asOf: string,
): { freshness: GeoEvidenceFreshnessState; ageDays?: number } => {
  const asOfMs = parseTime("asOf", asOf);
  if (!evidenceClass) return { freshness: "missing" };
  if (evidenceClass === "unverified") return { freshness: "unverified" };
  if (!observedAt) return { freshness: "undated" };

  const observedAtMs = parseTime("observedAt", observedAt);
  if (observedAtMs > asOfMs) throw new Error("Evidence observedAt cannot be after asOf");

  const ageDays = Math.floor((asOfMs - observedAtMs) / DAY_MS);
  const threshold = freshnessThresholds[evidenceClass];
  if (ageDays <= threshold.freshThroughDays) return { freshness: "fresh", ageDays };
  if (ageDays <= threshold.agingThroughDays) return { freshness: "aging", ageDays };
  return { freshness: "stale", ageDays };
};

export const buildGeoEvidenceFreshnessRecords = (
  records: GeoEvidenceHealthInputRecord[],
  asOf: string,
): GeoEvidenceFreshnessRecord[] =>
  records
    .map((record) => ({
      ...record,
      ...classifyGeoEvidenceFreshness(record.evidenceClass, record.observedAt, asOf),
    }))
    .sort(
      (left, right) =>
        left.windowDays - right.windowDays ||
        left.canonicalOwner.localeCompare(right.canonicalOwner) ||
        left.layer.localeCompare(right.layer) ||
        (left.observedAt ?? "").localeCompare(right.observedAt ?? ""),
    );

const layerKeys: readonly GeoEvidenceLayer[] = ["ai_visibility", "search", "funnel", "outcomes"];
const evidenceKeyForLayer: Record<GeoEvidenceLayer, keyof GeoMeasurementScorecard["evidence"]> = {
  ai_visibility: "aiVisibility",
  search: "search",
  funnel: "funnel",
  outcomes: "outcomes",
};

export const buildGeoOwnerReadiness = (
  ownerLayers: Array<{ windowDays: GeoWindowDays; owners: GeoOwnerMeasurementRecord[] }>,
): GeoOwnerReadinessRecord[] => {
  const records: GeoOwnerReadinessRecord[] = [];

  for (const layer of ownerLayers) {
    for (const owner of layer.owners) {
      const presentLayers = layerKeys.filter(
        (key) => owner.scorecard.evidence[evidenceKeyForLayer[key]].length > 0,
      );
      const missingLayers = layerKeys.filter((key) => !presentLayers.includes(key));
      const mixedEvidenceLayers = layerKeys.filter(
        (key) => owner.scorecard.evidence[evidenceKeyForLayer[key]].length > 1,
      );

      records.push({
        canonicalOwner: owner.canonicalOwner,
        windowDays: layer.windowDays,
        readinessPercent: Number(((presentLayers.length / layerKeys.length) * 100).toFixed(1)),
        presentLayers,
        missingLayers,
        mixedEvidenceLayers,
        evidenceClasses: owner.scorecard.evidence,
        reconciliationStatus: owner.reconciliation.status,
      });
    }
  }

  return records.sort(
    (left, right) =>
      left.canonicalOwner.localeCompare(right.canonicalOwner) || left.windowDays - right.windowDays,
  );
};

export const buildGeoOwnerCoverageSummary = (
  readiness: GeoOwnerReadinessRecord[],
): GeoOwnerCoverageSummary[] => {
  const owners = new Map<string, GeoOwnerReadinessRecord[]>();
  for (const record of readiness) {
    owners.set(record.canonicalOwner, [...(owners.get(record.canonicalOwner) ?? []), record]);
  }

  return [...owners.entries()]
    .map(([canonicalOwner, records]) => {
      const byWindow = new Map(records.map((record) => [record.windowDays, record]));
      const windows: GeoWindowDays[] = [7, 28, 90];
      return {
        canonicalOwner,
        windowsWithAnyEvidence: windows.filter((windowDays) => (byWindow.get(windowDays)?.presentLayers.length ?? 0) > 0),
        completeWindows: windows.filter(
          (windowDays) => byWindow.get(windowDays)?.reconciliationStatus === "complete",
        ),
        inconsistentWindows: windows.filter(
          (windowDays) => byWindow.get(windowDays)?.reconciliationStatus === "inconsistent",
        ),
        missingWindows: windows.filter((windowDays) => (byWindow.get(windowDays)?.presentLayers.length ?? 0) === 0),
      };
    })
    .sort((left, right) => left.canonicalOwner.localeCompare(right.canonicalOwner));
};

export const summarizeGeoEvidenceProvenance = (
  records: GeoEvidenceFreshnessRecord[],
) =>
  ([7, 28, 90] as const).map((windowDays) => {
    const rows = records.filter((record) => record.windowDays === windowDays);
    const byLayer = layerKeys.map((layer) => {
      const layerRows = rows.filter((record) => record.layer === layer);
      return {
        layer,
        records: layerRows.length,
        evidenceClasses: [...new Set(layerRows.flatMap((record) => record.evidenceClass ? [record.evidenceClass] : []))].sort(),
        freshnessStates: [...new Set(layerRows.map((record) => record.freshness))].sort(),
      };
    });

    return {
      windowDays,
      records: rows.length,
      byLayer,
    };
  });
