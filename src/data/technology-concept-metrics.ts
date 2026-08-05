import {
  assertMetricEvidenceRecord,
  type MetricEvidenceRecord,
} from "./metric-provenance";

export interface TechnologyConceptMetric extends MetricEvidenceRecord {
  uiNote: string;
}

const common = {
  period: { kind: "as_of", asOf: "2026-08-05" } as const,
  scope: "Executive Dashboard interface concept",
  sourceType: "synthetic_interface_concept",
  sourceName: "Hermes TechnologySolutionMockups fixture",
  calculationMethod:
    "Fixed synthetic value used only to explain the proposed interface layout; no production, customer, carrier, revenue, lead, task, or risk data is connected.",
  evidenceClass: "illustrative" as const,
  environment: "illustrative" as const,
  displayLabel: "illustrative_sample" as const,
  lastVerified: "2026-08-05",
  reviewerRole: "Repository reviewer",
  privacyClass: "public_safe" as const,
  publicationState: "approved" as const,
};

function defineMetric(metric: TechnologyConceptMetric): TechnologyConceptMetric {
  assertMetricEvidenceRecord(metric);
  return metric;
}

export const technologyDashboardMetrics: readonly TechnologyConceptMetric[] = [
  defineMetric({
    ...common,
    metricId: "technology-concept-leads",
    label: "Leads",
    value: "184",
    unit: "illustrative records",
    uiNote: "+12% sample",
    caveat:
      "The value and change note are synthetic samples and are not connected to a lead receiver, analytics property, CRM, or customer result.",
  }),
  defineMetric({
    ...common,
    metricId: "technology-concept-conversions",
    label: "Conversions",
    value: "28",
    unit: "illustrative records",
    uiNote: "15.2% sample",
    caveat:
      "The value and rate are synthetic samples and do not represent delivered, qualified, sold, or revenue-producing inquiries.",
  }),
  defineMetric({
    ...common,
    metricId: "technology-concept-active-tasks",
    label: "Active Tasks",
    value: "46",
    unit: "illustrative tasks",
    uiNote: "8 due today",
    caveat:
      "The task count and due-today note are synthetic and are not connected to a project, employee, candidate, carrier, customer, or operating queue.",
  }),
  defineMetric({
    ...common,
    metricId: "technology-concept-risks",
    label: "Risks",
    value: "7",
    unit: "illustrative review items",
    uiNote: "Needs review",
    caveat:
      "The risk count is synthetic; the interface concept preserves human review and does not claim an automated production risk decision.",
  }),
  defineMetric({
    ...common,
    metricId: "technology-concept-revenue-pipeline",
    label: "Revenue Pipeline",
    value: "$284K",
    unit: "illustrative currency value",
    uiNote: "Illustrative",
    caveat:
      "The currency value is illustrative only and is not connected to revenue, contracts, invoices, opportunities, customers, or an owner-controlled financial source.",
  }),
];
