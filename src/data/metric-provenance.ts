export const EVIDENCE_LABELS = [
  "interface_concept",
  "illustrative_sample",
  "demo_data",
  "local_reviewed_build_snapshot",
  "dated_production_snapshot",
  "production_verified",
  "planned",
  "unavailable",
] as const;

export const METRIC_DISPLAY_LABELS = [
  "illustrative_sample",
  "demo_data",
  "local_reviewed_build_snapshot",
  "dated_production_snapshot",
  "production_verified",
  "unavailable",
] as const;

export const METRIC_EVIDENCE_CLASSES = [
  "illustrative",
  "repository_verified",
  "receiver_verified",
  "platform_verified",
  "private_operations_verified",
  "unverified",
] as const;

export const METRIC_ENVIRONMENTS = [
  "illustrative",
  "local_reviewed_build",
  "preview",
  "production",
] as const;

export const METRIC_PRIVACY_CLASSES = [
  "public_safe",
  "aggregate_non_identifying",
  "private",
  "prohibited",
] as const;

export const METRIC_PUBLICATION_STATES = [
  "approved",
  "private",
  "blocked",
] as const;

export type EvidenceLabel = (typeof EVIDENCE_LABELS)[number];
export type MetricDisplayLabel = (typeof METRIC_DISPLAY_LABELS)[number];
export type MetricEvidenceClass = (typeof METRIC_EVIDENCE_CLASSES)[number];
export type MetricEnvironment = (typeof METRIC_ENVIRONMENTS)[number];
export type MetricPrivacyClass = (typeof METRIC_PRIVACY_CLASSES)[number];
export type MetricPublicationState = (typeof METRIC_PUBLICATION_STATES)[number];

export type MetricPeriod =
  | { kind: "as_of"; asOf: string }
  | { kind: "range"; start: string; end: string };

export interface MetricEvidenceRecord {
  metricId: string;
  label: string;
  value: string | number | null;
  unit: string;
  period: MetricPeriod;
  scope: string;
  sourceType: string;
  sourceName: string;
  calculationMethod: string;
  evidenceClass: MetricEvidenceClass;
  environment: MetricEnvironment;
  displayLabel: MetricDisplayLabel;
  lastVerified: string;
  reviewerRole: string;
  caveat: string;
  privacyClass: MetricPrivacyClass;
  publicationState: MetricPublicationState;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const publicPrivacyClasses = new Set<MetricPrivacyClass>([
  "public_safe",
  "aggregate_non_identifying",
]);
const strongProductionEvidence = new Set<MetricEvidenceClass>([
  "receiver_verified",
  "platform_verified",
  "private_operations_verified",
]);
const datedProductionEvidence = new Set<MetricEvidenceClass>([
  "repository_verified",
  ...strongProductionEvidence,
]);

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  if (!hasText(value) || !isoDatePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isEnumValue<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

export function validateMetricEvidenceRecord(record: MetricEvidenceRecord): string[] {
  const errors: string[] = [];

  if (!hasText(record.metricId) || !slugPattern.test(record.metricId)) {
    errors.push("metricId must be a lowercase kebab-case identifier");
  }
  if (!hasText(record.label)) errors.push("label is required");
  if (!hasText(record.unit)) errors.push("unit is required");
  if (!hasText(record.scope)) errors.push("scope is required");
  if (!hasText(record.sourceType)) errors.push("sourceType is required");
  if (!hasText(record.sourceName)) errors.push("sourceName is required");
  if (!hasText(record.calculationMethod)) errors.push("calculationMethod is required");
  if (!hasText(record.reviewerRole)) errors.push("reviewerRole is required");
  if (!hasText(record.caveat)) errors.push("caveat is required");
  if (!isIsoDate(record.lastVerified)) errors.push("lastVerified must be a valid YYYY-MM-DD date");

  if (!isEnumValue(METRIC_EVIDENCE_CLASSES, record.evidenceClass)) {
    errors.push("evidenceClass is not controlled");
  }
  if (!isEnumValue(METRIC_ENVIRONMENTS, record.environment)) {
    errors.push("environment is not controlled");
  }
  if (!isEnumValue(METRIC_DISPLAY_LABELS, record.displayLabel)) {
    errors.push("displayLabel is not controlled for metrics");
  }
  if (!isEnumValue(METRIC_PRIVACY_CLASSES, record.privacyClass)) {
    errors.push("privacyClass is not controlled");
  }
  if (!isEnumValue(METRIC_PUBLICATION_STATES, record.publicationState)) {
    errors.push("publicationState is not controlled");
  }

  if (record.period?.kind === "as_of") {
    if (!isIsoDate(record.period.asOf)) errors.push("period.asOf must be a valid YYYY-MM-DD date");
  } else if (record.period?.kind === "range") {
    if (!isIsoDate(record.period.start)) errors.push("period.start must be a valid YYYY-MM-DD date");
    if (!isIsoDate(record.period.end)) errors.push("period.end must be a valid YYYY-MM-DD date");
    if (
      isIsoDate(record.period.start) &&
      isIsoDate(record.period.end) &&
      record.period.start > record.period.end
    ) {
      errors.push("period.start must not be after period.end");
    }
  } else {
    errors.push("period must use as_of or range");
  }

  if (record.displayLabel === "unavailable") {
    if (record.value !== null) errors.push("unavailable metrics must use a null value");
    if (record.evidenceClass !== "unverified") {
      errors.push("unavailable metrics must use unverified evidence");
    }
  } else if (record.value === null || (typeof record.value === "string" && !record.value.trim())) {
    errors.push("available metrics require a non-empty value");
  }

  if (record.displayLabel === "illustrative_sample") {
    if (record.evidenceClass !== "illustrative" || record.environment !== "illustrative") {
      errors.push("illustrative samples require illustrative evidence and environment");
    }
  }

  if (record.displayLabel === "demo_data") {
    if (record.evidenceClass !== "illustrative") {
      errors.push("demo data requires illustrative evidence");
    }
    if (!new Set<MetricEnvironment>(["illustrative", "preview"]).has(record.environment)) {
      errors.push("demo data must use an illustrative or preview environment");
    }
  }

  if (record.displayLabel === "local_reviewed_build_snapshot") {
    if (
      record.evidenceClass !== "repository_verified" ||
      record.environment !== "local_reviewed_build"
    ) {
      errors.push("local reviewed-build snapshots require repository verification and local environment");
    }
  }

  if (record.displayLabel === "dated_production_snapshot") {
    if (record.environment !== "production") {
      errors.push("dated production snapshots require the production environment");
    }
    if (!datedProductionEvidence.has(record.evidenceClass)) {
      errors.push("dated production snapshots require verified evidence");
    }
    if (record.period?.kind !== "as_of") {
      errors.push("dated production snapshots require an as-of date");
    }
  }

  if (record.displayLabel === "production_verified") {
    if (record.environment !== "production") {
      errors.push("production-verified metrics require the production environment");
    }
    if (!strongProductionEvidence.has(record.evidenceClass)) {
      errors.push("production-verified metrics require receiver, platform, or private-operations evidence");
    }
  }

  if (record.publicationState === "approved") {
    if (!publicPrivacyClasses.has(record.privacyClass)) {
      errors.push("approved public metrics require a public-safe privacy class");
    }
    if (record.evidenceClass === "unverified" && record.displayLabel !== "unavailable") {
      errors.push("unverified values cannot be approved for public display");
    }
  }

  if (
    record.environment === "local_reviewed_build" &&
    new Set<MetricDisplayLabel>(["dated_production_snapshot", "production_verified"]).has(
      record.displayLabel,
    )
  ) {
    errors.push("local reviewed-build evidence cannot claim production status");
  }

  return [...new Set(errors)];
}

export function assertMetricEvidenceRecord(record: MetricEvidenceRecord): MetricEvidenceRecord {
  const errors = validateMetricEvidenceRecord(record);
  if (errors.length > 0) {
    throw new Error(`Invalid metric evidence record: ${errors.join("; ")}`);
  }
  return record;
}
