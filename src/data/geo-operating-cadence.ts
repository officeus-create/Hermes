export type GeoStandardWindow = 7 | 28 | 90;
export type GeoCadenceState = "current" | "due" | "overdue" | "never_checked";

const dayMs = 86_400_000;
const parseDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Expected YYYY-MM-DD: ${value}`);
  const parsed = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid date: ${value}`);
  return parsed;
};

export const exactInclusiveWindowDays = (startDate: string, endDate: string) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const days = Math.round((end - start) / dayMs) + 1;
  if (days < 1) throw new Error("endDate precedes startDate");
  return days;
};

export const classifyGeoEvidenceWindow = (startDate: string, endDate: string) => {
  const days = exactInclusiveWindowDays(startDate, endDate);
  return {
    startDate,
    endDate,
    inclusiveDays: days,
    standardWindow: ([7, 28, 90] as const).includes(days as GeoStandardWindow) ? days as GeoStandardWindow : null,
    comparisonClass: ([7, 28, 90] as const).includes(days as GeoStandardWindow) ? "standard_comparable" as const : "exact_checkpoint_only" as const,
  };
};

export const buildGeoCadenceState = (input: {
  lastCheckedAt: string | null;
  asOf: string;
  cadenceDays: GeoStandardWindow;
  dueSoonDays?: number;
}) => {
  const asOf = Date.parse(input.asOf);
  if (!Number.isFinite(asOf)) throw new Error("asOf must be a valid timestamp");
  if (input.lastCheckedAt === null) return { state: "never_checked" as const, ageDays: null, overdueDays: null };
  const checked = Date.parse(input.lastCheckedAt);
  if (!Number.isFinite(checked)) throw new Error("lastCheckedAt must be a valid timestamp");
  if (checked > asOf) throw new Error("lastCheckedAt cannot be in the future");
  const ageDays = Math.floor((asOf - checked) / dayMs);
  const dueSoonDays = input.dueSoonDays ?? 1;
  if (ageDays > input.cadenceDays) return { state: "overdue" as const, ageDays, overdueDays: ageDays - input.cadenceDays };
  if (ageDays >= input.cadenceDays - dueSoonDays) return { state: "due" as const, ageDays, overdueDays: 0 };
  return { state: "current" as const, ageDays, overdueDays: 0 };
};

export interface GeoComparableEvidenceWindow {
  canonicalOwner: string;
  startDate: string;
  endDate: string;
  scopeKey: string;
  evidenceClass: string;
}

export const compareGeoEvidenceWindows = (current: GeoComparableEvidenceWindow, previous: GeoComparableEvidenceWindow) => {
  const reasons: string[] = [];
  if (current.canonicalOwner !== previous.canonicalOwner) reasons.push("canonical_owner_changed");
  const currentWindow = classifyGeoEvidenceWindow(current.startDate, current.endDate);
  const previousWindow = classifyGeoEvidenceWindow(previous.startDate, previous.endDate);
  if (currentWindow.inclusiveDays !== previousWindow.inclusiveDays) reasons.push("window_length_changed");
  if (currentWindow.standardWindow !== previousWindow.standardWindow) reasons.push("standard_window_class_changed");
  if (current.scopeKey !== previous.scopeKey) reasons.push("scope_changed");
  if (current.evidenceClass !== previous.evidenceClass) reasons.push("evidence_class_changed");
  if (parseDateOnly(previous.endDate) >= parseDateOnly(current.startDate)) reasons.push("windows_overlap_or_reverse");
  return {
    comparable: reasons.length === 0,
    reasons,
    currentWindow,
    previousWindow,
  };
};

export interface GeoCadenceOwnerInput {
  canonicalOwner: string;
  commercialPriority: "high" | "medium" | "low";
  lastEvidenceHealthAt: string | null;
  last28DayComparisonAt: string | null;
  last90DayComparisonAt: string | null;
}

const priorityRank = { high: 3, medium: 2, low: 1 } as const;
const stateRank: Record<GeoCadenceState, number> = { overdue: 4, never_checked: 3, due: 2, current: 1 };

export const buildGeoOperatingCadenceQueue = (owners: GeoCadenceOwnerInput[], asOf: string) => owners.flatMap((owner) => {
  if (!owner.canonicalOwner.startsWith("/") || owner.canonicalOwner.startsWith("//") || /[?#]/.test(owner.canonicalOwner)) throw new Error(`Invalid canonical owner: ${owner.canonicalOwner}`);
  return [
    {
      canonicalOwner: owner.canonicalOwner,
      lane: "weekly_evidence_health" as const,
      cadenceDays: 7 as const,
      priority: owner.commercialPriority,
      ...buildGeoCadenceState({ lastCheckedAt: owner.lastEvidenceHealthAt, asOf, cadenceDays: 7 }),
    },
    {
      canonicalOwner: owner.canonicalOwner,
      lane: "primary_28_day_comparison" as const,
      cadenceDays: 28 as const,
      priority: owner.commercialPriority,
      ...buildGeoCadenceState({ lastCheckedAt: owner.last28DayComparisonAt, asOf, cadenceDays: 28, dueSoonDays: 2 }),
    },
    {
      canonicalOwner: owner.canonicalOwner,
      lane: "authority_90_day_trend" as const,
      cadenceDays: 90 as const,
      priority: owner.commercialPriority,
      ...buildGeoCadenceState({ lastCheckedAt: owner.last90DayComparisonAt, asOf, cadenceDays: 90, dueSoonDays: 7 }),
    },
  ];
}).sort((a, b) =>
  stateRank[b.state] - stateRank[a.state] ||
  priorityRank[b.priority] - priorityRank[a.priority] ||
  a.canonicalOwner.localeCompare(b.canonicalOwner) ||
  a.cadenceDays - b.cadenceDays,
);

export const geoCanonicalCurrentStateEntrypoint = "docs/GEO_CURRENT_STATE.md" as const;

export const auditGeoCurrentStateEntrypoints = (candidates: Array<{ path: string; current: boolean }>) => {
  const current = candidates.filter((item) => item.current);
  const issues: string[] = [];
  if (current.length !== 1) issues.push(`expected_one_current_entrypoint:${current.length}`);
  if (current.length === 1 && current[0].path !== geoCanonicalCurrentStateEntrypoint) issues.push(`unexpected_current_entrypoint:${current[0].path}`);
  return { ready: issues.length === 0, current: current.map((item) => item.path), issues };
};

export interface GeoGrowthWaveGateInput {
  evidenceTrigger: boolean;
  canonicalOwner: string | null;
  measurableOutcomeDefined: boolean;
  distinctEvidenceAvailable: boolean;
  conflictsWithOpenHigherPriorityGap: boolean;
  proposedMaterialVisualChange: boolean;
  ceoVisualApprovalPresent: boolean;
}

export const evaluateGeoNextGrowthWaveGate = (input: GeoGrowthWaveGateInput) => {
  const blockers: string[] = [];
  if (!input.evidenceTrigger) blockers.push("evidence_trigger_missing");
  if (!input.canonicalOwner) blockers.push("canonical_owner_missing");
  if (!input.measurableOutcomeDefined) blockers.push("measurable_outcome_missing");
  if (!input.distinctEvidenceAvailable) blockers.push("distinct_evidence_missing");
  if (input.conflictsWithOpenHigherPriorityGap) blockers.push("higher_priority_measurement_or_qualification_gap_open");
  if (input.proposedMaterialVisualChange && !input.ceoVisualApprovalPresent) blockers.push("ceo_visual_approval_missing");
  return {
    mayStart: blockers.length === 0,
    blockers,
    rule: "Start a growth wave only from verified evidence and a measurable owner-level outcome; do not prefer page count or novelty over higher-value measurement/qualification gaps.",
  };
};
