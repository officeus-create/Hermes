export const MANAGED_HOME_SERVICE_PUBLICATION_BASIS = "hermes_managed_client_public_facts";

export function homeServiceCatalogPublication(row) {
  const slug = String(row?.slug || "").trim();
  const status = String(row?.catalog_status || "");
  const managementMode = String(row?.management_mode || "owner_managed");
  const publicationBasis = String(row?.catalog_publication_basis || "owner_opt_in");
  const ownerOptIn = Number(row?.catalog_opt_in || 0) === 1;
  const ownerEligible = ownerOptIn && ["self_submitted", "verified_public"].includes(status);
  const managedEligible =
    managementMode === "hermes_managed" &&
    status === "verified_public" &&
    publicationBasis === MANAGED_HOME_SERVICE_PUBLICATION_BASIS;
  const eligible = Boolean(slug && (ownerEligible || managedEligible));
  return {
    eligible,
    path: eligible ? `/businesses/connect/company/${encodeURIComponent(slug)}/` : null,
    managementMode,
    publicationBasis,
    ownerOptInClaimed: ownerOptIn,
    managedPublicFacts: managedEligible,
  };
}
