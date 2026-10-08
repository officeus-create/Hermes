const PUBLIC_ASSETS = Object.freeze([
  Object.freeze({
    id: "mzm-junk-removal-real-job-evidence-local-seo-2026",
    website: "https://mzm-junk-removal.com/",
    companyName: "MZM Junk Removal",
    city: "Roseville",
    state: "CA",
    kind: "insight",
    title: "MZM Junk Removal: real-job evidence for local SEO",
    summary: "Source-backed Hermes analysis of MZM's public recent-job proof, service-area structure and evidence-driven local SEO.",
    href: "/insights/marketing/mzm-junk-removal-real-job-evidence-local-seo/",
    sourceUrl: "https://mzm-junk-removal.com/",
    publishedAt: "2026-10-08",
    evidenceClass: "FIRST_PARTY_PUBLIC_SOURCE",
  }),
]);

export const normalizeHomeServiceWebsite = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    if (!/^https?:$/.test(url.protocol)) return "";
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

const normalizeText = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

export function getHomeServicePublicAssets(companyOrWebsite) {
  const isWebsiteOnly = typeof companyOrWebsite === "string";
  const website = isWebsiteOnly
    ? companyOrWebsite
    : companyOrWebsite?.website ?? companyOrWebsite?.company_website ?? "";
  const key = normalizeHomeServiceWebsite(website);
  if (!key) return [];
  const companyName = isWebsiteOnly ? "" : normalizeText(companyOrWebsite?.companyName ?? companyOrWebsite?.company_name);
  return PUBLIC_ASSETS
    .filter((asset) => {
      if (normalizeHomeServiceWebsite(asset.website) !== key) return false;
      if (!isWebsiteOnly && normalizeText(asset.companyName) !== companyName) return false;
      return true;
    })
    .map((asset) => ({ ...asset }));
}

export const homeServicePublicAssets = PUBLIC_ASSETS;
