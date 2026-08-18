import type {
  GeoDiscoveryType,
  GeoEvidenceClass,
  GeoFunnelAggregate,
  GeoSearchAggregate,
  GeoSearchSource,
  GeoWindowDays,
} from "./geo-measurement-layer.ts";

export type GeoSearchEvidenceClass = Extract<
  GeoEvidenceClass,
  "platform_verified" | "owner_provided_handoff" | "unverified"
>;

export interface GeoExactSearchCheckpoint {
  source: GeoSearchSource;
  pagePath: string;
  discoveryType: GeoDiscoveryType;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  evidenceClass: GeoSearchEvidenceClass;
}

export interface GeoSearchAdapterResult {
  status: "ready" | "non_standard_window";
  windowDays: number;
  aggregate?: GeoSearchAggregate;
  reason?: string;
}

export type CanonicalCommercialAnalyticsEvent =
  | "commercial_cta_click"
  | "carrier_intake_start"
  | "carrier_intake_preview_ready"
  | "carrier_handoff_ready"
  | "carrier_delivery_confirmed"
  | "vehicle_transport_intake_start"
  | "vehicle_transport_preview_ready"
  | "vehicle_transport_handoff_ready"
  | "vehicle_transport_delivery_confirmed"
  | "seo_intake_start"
  | "seo_intake_preview_ready"
  | "seo_handoff_ready"
  | "website_project_intake_start"
  | "website_project_preview_ready"
  | "website_handoff_ready";

export type GeoFunnelFamily = "carrier" | "vehicle_transport" | "seo" | "website_project";
export type GeoFunnelRegistryGap = "delivery_confirmed_event_not_established";

export interface GeoAnalyticsEventAggregate {
  windowDays: GeoWindowDays;
  /** Canonical commercial/GEO owner that started the journey. */
  journeyPath: string;
  /** Route where the canonical analytics event actually occurred. */
  eventPagePath: string;
  eventName: CanonicalCommercialAnalyticsEvent;
  count: number;
  evidenceClass: Extract<
    GeoEvidenceClass,
    "platform_verified" | "owner_provided_handoff" | "unverified"
  >;
}

export interface GeoFunnelAdapterResult {
  status: "ready" | "incomplete";
  family: GeoFunnelFamily;
  missingEvents: CanonicalCommercialAnalyticsEvent[];
  registryGaps: GeoFunnelRegistryGap[];
  aggregate?: GeoFunnelAggregate;
}

const standardWindows = new Set<number>([7, 28, 90]);
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

const assertDateOnly = (label: string, value: string) => {
  if (!dateOnly.test(value) || !Number.isFinite(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
};

const assertSitePath = (label: string, pagePath: string) => {
  if (!pagePath.startsWith("/")) throw new Error(`${label} must be site-relative: ${pagePath}`);
};

const assertCount = (label: string, value: number) => {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer`);
};

export const inclusiveWindowDays = (startDate: string, endDate: string) => {
  assertDateOnly("startDate", startDate);
  assertDateOnly("endDate", endDate);
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (end < start) throw new Error("endDate must not be before startDate");
  return Math.round((end - start) / 86_400_000) + 1;
};

export const adaptExactSearchCheckpoint = (
  checkpoint: GeoExactSearchCheckpoint,
): GeoSearchAdapterResult => {
  assertSitePath("pagePath", checkpoint.pagePath);
  assertCount("search.impressions", checkpoint.impressions);
  assertCount("search.clicks", checkpoint.clicks);
  if (checkpoint.clicks > checkpoint.impressions) {
    throw new Error("search.clicks cannot exceed search.impressions");
  }

  const windowDays = inclusiveWindowDays(checkpoint.startDate, checkpoint.endDate);
  if (!standardWindows.has(windowDays)) {
    return {
      status: "non_standard_window",
      windowDays,
      reason: `Exact ${windowDays}-day evidence must remain a checkpoint; do not manufacture a 7/28/90-day row.`,
    };
  }

  return {
    status: "ready",
    windowDays,
    aggregate: {
      windowDays: windowDays as GeoWindowDays,
      source: checkpoint.source,
      pagePath: checkpoint.pagePath,
      discoveryType: checkpoint.discoveryType,
      impressions: checkpoint.impressions,
      clicks: checkpoint.clicks,
      evidenceClass: checkpoint.evidenceClass,
    },
  };
};

const funnelRequirements: Record<
  GeoFunnelFamily,
  {
    intake: CanonicalCommercialAnalyticsEvent;
    preview: CanonicalCommercialAnalyticsEvent;
    handoff: CanonicalCommercialAnalyticsEvent;
    delivery?: CanonicalCommercialAnalyticsEvent;
  }
> = {
  carrier: {
    intake: "carrier_intake_start",
    preview: "carrier_intake_preview_ready",
    handoff: "carrier_handoff_ready",
    delivery: "carrier_delivery_confirmed",
  },
  vehicle_transport: {
    intake: "vehicle_transport_intake_start",
    preview: "vehicle_transport_preview_ready",
    handoff: "vehicle_transport_handoff_ready",
    delivery: "vehicle_transport_delivery_confirmed",
  },
  seo: {
    intake: "seo_intake_start",
    preview: "seo_intake_preview_ready",
    handoff: "seo_handoff_ready",
  },
  website_project: {
    intake: "website_project_intake_start",
    preview: "website_project_preview_ready",
    handoff: "website_handoff_ready",
  },
};

const uniqueEvidenceClass = (rows: GeoAnalyticsEventAggregate[]) => {
  const classes = [...new Set(rows.map((row) => row.evidenceClass))];
  if (classes.length !== 1) {
    throw new Error("A funnel aggregate must use one reconciled evidence class per journey/window");
  }
  return classes[0];
};

const registryGapsForFamily = (family: GeoFunnelFamily): GeoFunnelRegistryGap[] =>
  funnelRequirements[family].delivery ? [] : ["delivery_confirmed_event_not_established"];

export const adaptCanonicalAnalyticsFunnel = (
  family: GeoFunnelFamily,
  rows: GeoAnalyticsEventAggregate[],
): GeoFunnelAdapterResult => {
  const requirements = funnelRequirements[family];
  const registryGaps = registryGapsForFamily(family);

  if (rows.length === 0) {
    return {
      status: "incomplete",
      family,
      missingEvents: [
        "commercial_cta_click",
        requirements.intake,
        requirements.preview,
        requirements.handoff,
        ...(requirements.delivery ? [requirements.delivery] : []),
      ],
      registryGaps,
    };
  }

  const windowDays = rows[0].windowDays;
  const journeyPath = rows[0].journeyPath;
  for (const row of rows) {
    assertSitePath("journeyPath", row.journeyPath);
    assertSitePath("eventPagePath", row.eventPagePath);
    assertCount(`analytics.${row.eventName}`, row.count);
    if (row.windowDays !== windowDays) throw new Error("Funnel rows must use one exact standard window");
    if (row.journeyPath !== journeyPath) throw new Error("Funnel rows must use one canonical journeyPath");
  }

  const requiredEvents: CanonicalCommercialAnalyticsEvent[] = [
    "commercial_cta_click",
    requirements.intake,
    requirements.preview,
    requirements.handoff,
    ...(requirements.delivery ? [requirements.delivery] : []),
  ];

  const counts = new Map<CanonicalCommercialAnalyticsEvent, number>();
  for (const row of rows) counts.set(row.eventName, (counts.get(row.eventName) ?? 0) + row.count);

  const missingEvents = requiredEvents.filter((eventName) => !counts.has(eventName));

  // The canonical registry explicitly records no family-specific delivery event
  // for SEO and website-project flows. Those families remain incomplete even if
  // CTA/intake/preview/handoff are all present. Handoff is never treated as delivery.
  if (registryGaps.length > 0) {
    return {
      status: "incomplete",
      family,
      missingEvents,
      registryGaps,
    };
  }

  if (missingEvents.length > 0) {
    return { status: "incomplete", family, missingEvents, registryGaps: [] };
  }

  const ctaClicks = counts.get("commercial_cta_click") ?? 0;
  const intakeStarts = counts.get(requirements.intake) ?? 0;
  const previewReady = counts.get(requirements.preview) ?? 0;
  const handoffReady = counts.get(requirements.handoff) ?? 0;
  const deliveryConfirmed = requirements.delivery ? counts.get(requirements.delivery) ?? 0 : 0;

  if (intakeStarts > ctaClicks) throw new Error("intake starts cannot exceed commercial CTA clicks in one reconciled funnel");
  if (previewReady > intakeStarts) throw new Error("preview ready cannot exceed intake starts in one reconciled funnel");
  if (handoffReady > previewReady) throw new Error("handoff ready cannot exceed preview ready in one reconciled funnel");
  if (deliveryConfirmed > handoffReady) throw new Error("delivery confirmed cannot exceed handoff ready in one reconciled funnel");

  return {
    status: "ready",
    family,
    missingEvents: [],
    registryGaps: [],
    aggregate: {
      windowDays,
      pagePath: journeyPath,
      ctaClicks,
      intakeStarts,
      previewReady,
      handoffReady,
      deliveryConfirmed,
      evidenceClass: uniqueEvidenceClass(rows),
    },
  };
};