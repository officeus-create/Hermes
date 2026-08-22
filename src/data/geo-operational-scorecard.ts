import { importGeoAiObservationBatch } from "./geo-ai-observation-import.ts";
import {
  adaptCanonicalAnalyticsFunnel,
  adaptExactSearchCheckpoint,
  type GeoFunnelFamily,
} from "./geo-measurement-adapters.ts";
import {
  importGeoAnalyticsEventBatch,
  importGeoOutcomeBatch,
  importGeoSearchCheckpointBatch,
} from "./geo-measurement-import.ts";
import {
  buildGeoMeasurementLayer,
  type GeoAiEvidenceClass,
  type GeoFunnelAggregate,
  type GeoMeasurementLayerInput,
  type GeoSearchAggregate,
  type GeoWindowDays,
} from "./geo-measurement-layer.ts";
import { buildGeoOwnerMeasurementLayer } from "./geo-owner-measurement.ts";
import {
  buildGeoEvidenceFreshnessRecords,
  buildGeoOwnerCoverageSummary,
  buildGeoOwnerReadiness,
  summarizeGeoEvidenceProvenance,
  type GeoEvidenceHealthInputRecord,
} from "./geo-evidence-health.ts";
import { findGeoOwnerForPrompt } from "./geo-prompt-owner-registry.ts";

export const geoOperationalScorecardInputVersion = "geo_operational_scorecard_v2" as const;
export const geoOperationalScorecardReportVersion = "geo_operational_scorecard_report_v2" as const;

const inputFields = new Set([
  "schema_version",
  "as_of",
  "ai_visibility_evidence_class",
  "ai_observations",
  "search_checkpoints",
  "analytics_events",
  "outcomes",
]);

const aiEvidenceClasses = new Set<GeoAiEvidenceClass>(["owner_provided_handoff", "unverified"]);
const windows: readonly GeoWindowDays[] = [7, 28, 90];
const DAY_MS = 86_400_000;

export interface GeoOperationalScorecardBundle {
  schema_version: typeof geoOperationalScorecardInputVersion;
  as_of: string;
  ai_visibility_evidence_class: GeoAiEvidenceClass;
  ai_observations: unknown[];
  search_checkpoints: unknown[];
  analytics_events: unknown[];
  outcomes: unknown[];
}

export interface GeoHeldSearchCheckpoint {
  source: "google" | "bing";
  pagePath: string;
  discoveryType: "branded" | "non_branded";
  startDate: string;
  endDate: string;
  windowDays: number;
  impressions: number;
  clicks: number;
  evidenceClass: string;
  reason: string;
}

export interface GeoIncompleteFunnel {
  family: GeoFunnelFamily;
  windowDays: GeoWindowDays;
  journeyPath: string;
  rowCount: number;
  missingEvents: string[];
  registryGaps: string[];
  observedAt: string;
}

export interface GeoHeldEvidence {
  layer: "search" | "funnel";
  canonicalOwner: string;
  windowDays: number;
  reasonCode: "non_standard_search_window" | "incomplete_funnel";
  reasons: string[];
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("GEO operational scorecard bundle must be an object");
  }
  return value as Record<string, unknown>;
};

const exactTopLevel = (row: Record<string, unknown>) => {
  for (const key of Object.keys(row)) {
    if (!inputFields.has(key)) throw new Error(`Unsupported GEO operational bundle field: ${key}`);
  }
  for (const field of inputFields) {
    if (!(field in row)) throw new Error(`Missing GEO operational bundle field: ${field}`);
  }
};

const arrayField = (row: Record<string, unknown>, field: string) => {
  if (!Array.isArray(row[field])) throw new Error(`${field} must be an array`);
  return row[field] as unknown[];
};

const parseBundle = (input: unknown): GeoOperationalScorecardBundle => {
  const row = asRecord(input);
  exactTopLevel(row);

  if (row.schema_version !== geoOperationalScorecardInputVersion) {
    throw new Error(`schema_version must be ${geoOperationalScorecardInputVersion}`);
  }
  if (typeof row.as_of !== "string" || !Number.isFinite(Date.parse(row.as_of))) {
    throw new Error("as_of must be a valid ISO date/time");
  }
  if (
    typeof row.ai_visibility_evidence_class !== "string" ||
    !aiEvidenceClasses.has(row.ai_visibility_evidence_class as GeoAiEvidenceClass)
  ) {
    throw new Error("ai_visibility_evidence_class must be owner_provided_handoff or unverified");
  }

  return {
    schema_version: geoOperationalScorecardInputVersion,
    as_of: new Date(Date.parse(row.as_of)).toISOString(),
    ai_visibility_evidence_class: row.ai_visibility_evidence_class as GeoAiEvidenceClass,
    ai_observations: arrayField(row, "ai_observations"),
    search_checkpoints: arrayField(row, "search_checkpoints"),
    analytics_events: arrayField(row, "analytics_events"),
    outcomes: arrayField(row, "outcomes"),
  };
};

const assertUniqueBy = <T>(rows: T[], keyFor: (row: T) => string, label: string) => {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = keyFor(row);
    if (seen.has(key)) throw new Error(`Duplicate ${label} aggregate: ${key}`);
    seen.add(key);
  }
};

const analyticsGroupKey = (family: GeoFunnelFamily, windowDays: number, journeyPath: string) =>
  `${family}|${windowDays}|${journeyPath}`;

const withinWindow = (observedAt: string, windowDays: GeoWindowDays, asOfMs: number) => {
  const observedAtMs = Date.parse(observedAt);
  return observedAtMs > asOfMs - windowDays * DAY_MS && observedAtMs <= asOfMs;
};

const searchObservedAt = (endDate: string, asOfDate: string, asOf: string) =>
  endDate === asOfDate ? asOf : `${endDate}T23:59:59.999Z`;

export const buildGeoOperationalScorecardReport = (input: unknown) => {
  const bundle = parseBundle(input);
  const asOfMs = Date.parse(bundle.as_of);
  const asOfDate = bundle.as_of.slice(0, 10);

  const aiObservations = importGeoAiObservationBatch(bundle.ai_observations);
  for (const observation of aiObservations) {
    if (Date.parse(observation.observedAt) > asOfMs) {
      throw new Error(`AI visibility observation ${observation.id} occurs after as_of`);
    }
  }

  const searchCheckpoints = importGeoSearchCheckpointBatch(bundle.search_checkpoints);
  assertUniqueBy(
    searchCheckpoints,
    (checkpoint) =>
      `${checkpoint.source}|${checkpoint.pagePath}|${checkpoint.discoveryType}|${checkpoint.startDate}|${checkpoint.endDate}`,
    "GEO search",
  );

  const search: GeoSearchAggregate[] = [];
  const heldSearchCheckpoints: GeoHeldSearchCheckpoint[] = [];
  const standardSearchEvidence: Array<{
    checkpoint: (typeof searchCheckpoints)[number];
    aggregate: GeoSearchAggregate;
  }> = [];

  for (const checkpoint of searchCheckpoints) {
    if (checkpoint.endDate > asOfDate) {
      throw new Error(`Search checkpoint for ${checkpoint.pagePath} ends after as_of`);
    }
    const adapted = adaptExactSearchCheckpoint(checkpoint);
    if (adapted.status === "ready" && adapted.aggregate) {
      search.push(adapted.aggregate);
      standardSearchEvidence.push({ checkpoint, aggregate: adapted.aggregate });
      continue;
    }
    heldSearchCheckpoints.push({
      source: checkpoint.source,
      pagePath: checkpoint.pagePath,
      discoveryType: checkpoint.discoveryType,
      startDate: checkpoint.startDate,
      endDate: checkpoint.endDate,
      windowDays: adapted.windowDays,
      impressions: checkpoint.impressions,
      clicks: checkpoint.clicks,
      evidenceClass: checkpoint.evidenceClass,
      reason: adapted.reason ?? "non-standard exact search checkpoint",
    });
  }

  const analyticsRows = importGeoAnalyticsEventBatch(bundle.analytics_events);
  for (const row of analyticsRows) {
    if (Date.parse(row.observedAt) > asOfMs) {
      throw new Error(`Analytics evidence for ${row.aggregate.journeyPath} occurs after as_of`);
    }
  }
  assertUniqueBy(
    analyticsRows,
    (row) =>
      `${row.family}|${row.aggregate.windowDays}|${row.aggregate.journeyPath}|${row.aggregate.eventPagePath}|${row.aggregate.eventName}`,
    "GEO analytics",
  );

  const analyticsGroups = new Map<
    string,
    {
      family: GeoFunnelFamily;
      windowDays: GeoWindowDays;
      journeyPath: string;
      rows: typeof analyticsRows;
    }
  >();

  for (const row of analyticsRows) {
    const key = analyticsGroupKey(row.family, row.aggregate.windowDays, row.aggregate.journeyPath);
    const existing = analyticsGroups.get(key);
    if (existing) {
      existing.rows.push(row);
    } else {
      analyticsGroups.set(key, {
        family: row.family,
        windowDays: row.aggregate.windowDays,
        journeyPath: row.aggregate.journeyPath,
        rows: [row],
      });
    }
  }

  const funnel: GeoFunnelAggregate[] = [];
  const incompleteFunnels: GeoIncompleteFunnel[] = [];
  const readyFunnelEvidence: Array<{
    aggregate: GeoFunnelAggregate;
    observedAt: string;
  }> = [];

  for (const group of analyticsGroups.values()) {
    const observedAtValues = [...new Set(group.rows.map((row) => row.observedAt))];
    if (observedAtValues.length !== 1) {
      throw new Error(
        `Analytics group ${group.family}|${group.windowDays}|${group.journeyPath} must use one observed_at snapshot`,
      );
    }
    const observedAt = observedAtValues[0];
    const adapted = adaptCanonicalAnalyticsFunnel(
      group.family,
      group.rows.map((row) => row.aggregate),
    );
    if (adapted.status === "ready" && adapted.aggregate) {
      funnel.push(adapted.aggregate);
      readyFunnelEvidence.push({ aggregate: adapted.aggregate, observedAt });
    } else {
      incompleteFunnels.push({
        family: group.family,
        windowDays: group.windowDays,
        journeyPath: group.journeyPath,
        rowCount: group.rows.length,
        missingEvents: adapted.missingEvents,
        registryGaps: adapted.registryGaps,
        observedAt,
      });
    }
  }

  const outcomes = importGeoOutcomeBatch(bundle.outcomes);
  for (const outcome of outcomes) {
    if (Date.parse(outcome.observedAt) > asOfMs) {
      throw new Error(`Private outcome evidence for ${outcome.pagePath} occurs after as_of`);
    }
  }
  assertUniqueBy(
    outcomes,
    (outcome) => `${outcome.windowDays}|${outcome.pagePath}`,
    "GEO outcome",
  );

  const measurementInput: GeoMeasurementLayerInput = {
    asOf: bundle.as_of,
    aiObservations,
    aiVisibilityEvidenceClass: bundle.ai_visibility_evidence_class,
    search,
    funnel,
    outcomes,
  };

  const scorecards = buildGeoMeasurementLayer(measurementInput);
  const ownerScorecards = buildGeoOwnerMeasurementLayer(measurementInput);

  const evidenceHealthInput: GeoEvidenceHealthInputRecord[] = [];
  for (const observation of aiObservations) {
    for (const windowDays of windows) {
      if (!withinWindow(observation.observedAt, windowDays, asOfMs)) continue;
      evidenceHealthInput.push({
        layer: "ai_visibility",
        windowDays,
        canonicalOwner: findGeoOwnerForPrompt(observation.promptId).canonicalOwner,
        evidenceClass: bundle.ai_visibility_evidence_class,
        observedAt: observation.observedAt,
      });
    }
  }
  for (const item of standardSearchEvidence) {
    evidenceHealthInput.push({
      layer: "search",
      windowDays: item.aggregate.windowDays,
      canonicalOwner: item.aggregate.pagePath,
      evidenceClass: item.aggregate.evidenceClass,
      observedAt: searchObservedAt(item.checkpoint.endDate, asOfDate, bundle.as_of),
    });
  }
  for (const item of readyFunnelEvidence) {
    evidenceHealthInput.push({
      layer: "funnel",
      windowDays: item.aggregate.windowDays,
      canonicalOwner: item.aggregate.pagePath,
      evidenceClass: item.aggregate.evidenceClass,
      observedAt: item.observedAt,
    });
  }
  for (const outcome of outcomes) {
    evidenceHealthInput.push({
      layer: "outcomes",
      windowDays: outcome.windowDays,
      canonicalOwner: outcome.pagePath,
      evidenceClass: outcome.evidenceClass,
      observedAt: outcome.observedAt,
    });
  }

  const evidenceFreshness = buildGeoEvidenceFreshnessRecords(evidenceHealthInput, bundle.as_of);
  const ownerReadiness = buildGeoOwnerReadiness(ownerScorecards);
  const ownerCoverage = buildGeoOwnerCoverageSummary(ownerReadiness);
  const mixedEvidenceWarnings = ownerReadiness
    .filter((record) => record.mixedEvidenceLayers.length > 0)
    .map((record) => ({
      canonicalOwner: record.canonicalOwner,
      windowDays: record.windowDays,
      mixedEvidenceLayers: record.mixedEvidenceLayers,
      evidenceClasses: record.evidenceClasses,
    }));

  const heldEvidence: GeoHeldEvidence[] = [
    ...heldSearchCheckpoints.map((checkpoint) => ({
      layer: "search" as const,
      canonicalOwner: checkpoint.pagePath,
      windowDays: checkpoint.windowDays,
      reasonCode: "non_standard_search_window" as const,
      reasons: [checkpoint.reason],
    })),
    ...incompleteFunnels.map((record) => ({
      layer: "funnel" as const,
      canonicalOwner: record.journeyPath,
      windowDays: record.windowDays,
      reasonCode: "incomplete_funnel" as const,
      reasons: [
        ...record.missingEvents.map((event) => `missing_event:${event}`),
        ...record.registryGaps.map((gap) => `registry_gap:${gap}`),
      ],
    })),
  ].sort(
    (left, right) =>
      left.canonicalOwner.localeCompare(right.canonicalOwner) ||
      left.windowDays - right.windowDays ||
      left.layer.localeCompare(right.layer),
  );

  return {
    schemaVersion: geoOperationalScorecardReportVersion,
    asOf: bundle.as_of,
    ingestion: {
      aiObservations: aiObservations.length,
      searchCheckpoints: searchCheckpoints.length,
      standardSearchAggregates: search.length,
      heldSearchCheckpoints: heldSearchCheckpoints.length,
      analyticsEventRows: analyticsRows.length,
      readyFunnels: funnel.length,
      incompleteFunnels: incompleteFunnels.length,
      outcomeRows: outcomes.length,
    },
    heldSearchCheckpoints,
    incompleteFunnels,
    heldEvidence,
    scorecards,
    ownerScorecards,
    evidenceHealth: {
      records: evidenceFreshness,
      provenanceByWindow: summarizeGeoEvidenceProvenance(evidenceFreshness),
    },
    ownerReadiness,
    ownerCoverage,
    mixedEvidenceWarnings,
  };
};
