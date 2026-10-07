// Mechanical publication readiness, not a verification or owner-review claim.
// Existing opted-in owners remain indexable; editorial promotion requires the Search Release Gate.
export function repairCatalogPublication(row) {
  const slug = String(row?.slug || "");
  const reasons = [];
  if (Number(row?.catalog_opt_in) !== 1) reasons.push("not_opted_in");
  if (!String(row?.id || "").trim()) reasons.push("missing_identity");
  if (!String(row?.name || "").trim()) reasons.push("missing_public_name");
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 80) reasons.push("invalid_slug");
  const eligible = reasons.length === 0;
  return {
    eligible,
    reasons,
    path: eligible ? `/businesses/connect/repair-shop/${slug}/` : null,
    entityId: eligible ? `repair-shop-crm:${row.id}` : null,
  };
}

export const REPAIR_CATALOG_CACHE_CONTROL = "no-store";
