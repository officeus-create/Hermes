import type { AiVisibilityDirection } from "./ai-visibility-scorecard.ts";

export type SeoMarketDirectionKey = "logistics" | "marketing" | "academy" | "it_hermes_connect";

export interface GeoDirectionAlignment {
  geoDirection: AiVisibilityDirection;
  seoMarketDirection: SeoMarketDirectionKey;
  canonicalDirectionOwner: string;
  relationship: "shared_business_direction_separate_measurement_workstreams";
}

export const geoDirectionAlignment: Record<AiVisibilityDirection, GeoDirectionAlignment> = {
  logistics: {
    geoDirection: "logistics",
    seoMarketDirection: "logistics",
    canonicalDirectionOwner: "/paths/logistics/",
    relationship: "shared_business_direction_separate_measurement_workstreams",
  },
  marketing: {
    geoDirection: "marketing",
    seoMarketDirection: "marketing",
    canonicalDirectionOwner: "/paths/marketing/",
    relationship: "shared_business_direction_separate_measurement_workstreams",
  },
  academy: {
    geoDirection: "academy",
    seoMarketDirection: "academy",
    canonicalDirectionOwner: "/paths/academy/",
    relationship: "shared_business_direction_separate_measurement_workstreams",
  },
  technology: {
    geoDirection: "technology",
    seoMarketDirection: "it_hermes_connect",
    canonicalDirectionOwner: "/paths/technology/",
    relationship: "shared_business_direction_separate_measurement_workstreams",
  },
};

export const getGeoDirectionAlignment = (direction: AiVisibilityDirection) =>
  geoDirectionAlignment[direction];
