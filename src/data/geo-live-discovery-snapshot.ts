import type { GeoDiscoveryNode } from "./geo-discovery-graph-operations.ts";

export const geoLiveDiscoverySnapshotReviewedAt = "2026-08-19" as const;

export const geoLiveDiscoveryEvidence = [
  { edge: "/paths/logistics/ -> /logistics/car-hauling-dispatch/", evidenceReference: "repo:src/components/LogisticsCommercialLinks.astro" },
  { edge: "/paths/logistics/ -> /logistics/start-car-hauling-dispatch/", evidenceReference: "repo:src/components/LogisticsCommercialLinks.astro" },
  { edge: "/logistics/car-hauling-dispatch/ -> /logistics/start-car-hauling-dispatch/", evidenceReference: "repo:src/pages/logistics/car-hauling-dispatch/index.astro" },
  { edge: "/logistics/resources/broker-setup-packet-checklist/ -> /logistics/car-hauling-dispatch/", evidenceReference: "repo:src/pages/logistics/resources/broker-setup-packet-checklist/index.astro" },
  { edge: "/logistics/resources/new-authority-car-hauler-readiness-checklist/ -> /logistics/car-hauling-dispatch/", evidenceReference: "repo:src/pages/logistics/resources/new-authority-car-hauler-readiness-checklist/index.astro" },
  { edge: "/services/seo/ -> /services/seo-for-logistics-companies/", evidenceReference: "repo:src/pages/services/seo/index.astro" },
  { edge: "/case/ -> /services/seo-for-logistics-companies/", evidenceReference: "repo:src/pages/case/index.astro" },
  { edge: "/resources/logistics-seo-audit-sample/ -> /services/seo-for-logistics-companies/", evidenceReference: "repo:src/pages/resources/logistics-seo-audit-sample/index.astro" },
  { edge: "/services/seo-for-logistics-companies/ -> /paths/marketing/", evidenceReference: "repo:src/components/DigitalServicePage.astro#seoFunnels(logistics_seo)" },
] as const;

export const geoLiveDiscoverySnapshot: GeoDiscoveryNode[] = [
  {
    path: "/paths/logistics/",
    kind: "hub",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/", "/logistics/start-car-hauling-dispatch/"],
  },
  {
    path: "/logistics/car-hauling-dispatch/",
    kind: "commercial_owner",
    indexable: true,
    links: [
      "/logistics/start-car-hauling-dispatch/",
      "/logistics/direct-vehicle-transport-network/",
      "/logistics/resources/dispatch-service-vs-self-dispatch/",
      "/logistics/resources/car-hauler-capacity-checklist/",
    ],
  },
  {
    path: "/logistics/start-car-hauling-dispatch/",
    kind: "intake",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/"],
  },
  {
    path: "/logistics/resources/broker-setup-packet-checklist/",
    kind: "supporting_resource",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/"],
  },
  {
    path: "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
    kind: "supporting_resource",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/"],
  },
  {
    path: "/services/seo/",
    kind: "hub",
    indexable: true,
    links: ["/services/seo-for-logistics-companies/", "/resources/logistics-seo-audit-sample/"],
  },
  {
    path: "/services/seo-for-logistics-companies/",
    kind: "commercial_owner",
    indexable: true,
    links: ["/paths/marketing/", "/services/seo/", "/logistics/car-hauling-dispatch/"],
  },
  {
    path: "/paths/marketing/",
    kind: "hub",
    indexable: true,
    hasIntake: true,
    links: [],
  },
  {
    path: "/case/",
    kind: "case",
    indexable: true,
    links: ["/services/seo-for-logistics-companies/"],
  },
  {
    path: "/resources/logistics-seo-audit-sample/",
    kind: "supporting_resource",
    indexable: true,
    links: ["/services/seo-for-logistics-companies/"],
  },
  {
    path: "/logistics/direct-vehicle-transport-network/",
    kind: "supporting_resource",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/"],
  },
  {
    path: "/logistics/resources/dispatch-service-vs-self-dispatch/",
    kind: "supporting_resource",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/"],
  },
  {
    path: "/logistics/resources/car-hauler-capacity-checklist/",
    kind: "supporting_resource",
    indexable: true,
    links: ["/logistics/car-hauling-dispatch/"],
  },
];

export const geoLivePriorityOwners = [
  "/logistics/car-hauling-dispatch/",
  "/services/seo-for-logistics-companies/",
] as const;

export const geoLiveDiscoveryKnownSemanticGaps = [
  {
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    missingDirectRelatedOwner: "/logistics/resources/broker-setup-packet-checklist/",
    evidenceReference: "repo:src/pages/logistics/car-hauling-dispatch/index.astro",
  },
  {
    canonicalOwner: "/logistics/car-hauling-dispatch/",
    missingDirectRelatedOwner: "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
    evidenceReference: "repo:src/pages/logistics/car-hauling-dispatch/index.astro",
  },
] as const;
