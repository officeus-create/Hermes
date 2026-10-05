const CURATED_CATALOG_PROJECTIONS = Object.freeze([
  Object.freeze({
    vertical: "academy_business",
    websiteHosts: Object.freeze(["kons-na-bis.com"]),
    canonicalPath: "/businesses/ukraine/bila-tserkva/kons-na-bis/",
  }),
]);

function cleanHost(value) {
  if (!value) return "";
  try {
    const parsed = new URL(String(value).startsWith("http") ? String(value) : `https://${value}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function resolveCuratedCatalogProjection({ vertical = "", website = "" } = {}) {
  const host = cleanHost(website);
  if (!host) return null;
  const match = CURATED_CATALOG_PROJECTIONS.find((item) =>
    item.vertical === vertical && item.websiteHosts.includes(host)
  );
  return match?.canonicalPath || null;
}

export function catalogProjectionPath({ vertical = "", website = "", slug = "" } = {}) {
  return resolveCuratedCatalogProjection({ vertical, website }) ||
    (vertical === "academy_business" && slug
      ? `/businesses/connect/academy/${encodeURIComponent(String(slug))}/`
      : null);
}

export { CURATED_CATALOG_PROJECTIONS };
