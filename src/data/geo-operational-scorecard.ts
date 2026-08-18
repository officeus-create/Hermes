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
} from "./geo-measurement-layer.ts";
import { buildGeoOwnerMeasurementLayer } from "./geo-owner-measurement.ts";

export const geoOperationalScorecardInputVersion = "geo_operational_scorecard_v1" as const;
export const geoOperationalScorecardReportVersion = "geo_operational_scorecard_report_v1" as const;

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
  windowDays: 7 | 28 | 90;
  journeyPath: string;
  rowCount: number;
  missingEvents: string[];
  registryGaps: string[];
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
    as_of: row.as_of,
    ai_visibility_evidence_class: row.ai_visibility_evidence_class as GeoAiEvidenceClass,
    ai_observations: arrayField(row, "ai_observations"),
    search_checkpoints: arrayField(row, "search_checkpoints"),
    analytics_events: arrayField(row, "analytics_events"),
    outcomes: arrayField(row, "outcomes"),
  };
};

const analyticsGroupKey = (family: GeoFunnelFamily, windowDays: number, journeyPath: string) =>
  `${family}|${windowDays}|${journeyPath}`;

export const buildGeoOperationalScorecardReport = (input: unknown) => {
  const bundle = parseBundle(input);
  const asOfMs = Date.parse(bundle.as_of);
  const asOfDate = new Date(asOfMs).toISOString().slice(0, 10);

  const aiObservations = importGeoAiObservationBatch(bundle.ai_observations);
  for (const observation of aiObservations) {
    if (Date.parse(observation.observedAt) > asOfMs) {
      throw new Error(`AI visibility observation ${observation.id} occurs after as_of`);
    }
  }

  const searchCheckpoints = importGeoSearchCheckpointBatch(bundle.search_checkpoints);
  const search: GeoSearchAggregate[] = [];
  const heldSearchCheckpoints: GeoHeldSearchCheckpoint[] = [];

  for (const checkpoint of searchCheckpoints) {
    if (checkpoint.endDate > asOfDate) {
      throw new Error(`Search checkpoint for ${checkpoint.pagePath} ends after as_of`);
    }
    const adapted = adaptExactSearchCheckpoint(checkpoint);
    if (adapted.status === "ready" && adapted.aggregate) {
      search.push(adapted.aggregate);
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
  const analyticsGroups = new Map<
    string,
    { family: GeoFunnelFamily; windowDays: 7 | 28 | 90; journeyPath: string; rows: typeof analyticsRows }
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
  for (const group of analyticsGroups.values()) {
    const adapted = adaptCanonicalAnalyticsFunnel(
      group.family,
      group.rows.map((row) => row.aggregate),
    );
    if (adapted.status === "ready" && adapted.aggregate) {
      funnel.push(adapted.aggregate);
    } else {
      incompleteFunnels.push({
        family: group.family,
        windowDays: group.windowDays,
        journeyPath: group.journeyPath,
        rowCount: group.rows.length,
        missingEvents: adapted.missingEvents,
        registryGaps: adapted.registryGaps,
      });
    }
  }

  const outcomes = importGeoOutcomeBatch(bundle.outcomes);

  const measurementInput: GeoMeasurementLayerInput = {
    asOf: bundle.as_of,
    aiObservations,
    aiVisibilityEvidenceClass: bundle.ai_visibility_evidence_class,
    search,
    funnel,
    outcomes,
  };

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
    scorecards: buildGeoMeasurementLayer(measurementInput),
    ownerScorecards: buildGeoOwnerMeasurementLayer(measurementInput),
  };
};
