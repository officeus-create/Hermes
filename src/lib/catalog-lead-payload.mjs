export const buildCatalogLeadContext = ({
  businessId = "",
  profile = "",
  sourceRef = "",
  requestType = "catalog-growth",
  searchParams = new URLSearchParams(),
  referrer = "",
} = {}) => ({
  catalog_business_id: String(businessId || "").trim().slice(0, 180),
  catalog_profile: String(profile || "").trim().slice(0, 240),
  catalog_source_ref: String(sourceRef || "").trim().slice(0, 180),
  attribution: {
    utm_source: searchParams.get("utm_source") || "hermes_catalog",
    utm_medium: searchParams.get("utm_medium") || "internal",
    utm_campaign: searchParams.get("utm_campaign") || String(requestType || "catalog-growth"),
    utm_content: searchParams.get("utm_content") || "",
    utm_term: searchParams.get("utm_term") || "",
    gclid: searchParams.get("gclid") || "",
    gbraid: searchParams.get("gbraid") || "",
    wbraid: searchParams.get("wbraid") || "",
    fbclid: searchParams.get("fbclid") || "",
    referrer: String(referrer || "").slice(0, 500),
  },
});
