export type CatalogRequestType = "catalog-business-request" | "claim" | "catalog-growth";

export type CatalogRequestContext = {
  businessId: string;
  businessName: string;
  profileUrl: string;
  city: string;
  country: string;
  sourceRef: string;
};

export const buildCatalogRequestHref = (
  type: CatalogRequestType,
  context: CatalogRequestContext,
  interest = "",
) => {
  const params = new URLSearchParams({
    type,
    business: context.businessName,
    business_id: context.businessId,
    profile: context.profileUrl,
    city: context.city,
    country: context.country,
    source_ref: context.sourceRef,
  });
  if (interest) params.set("interest", interest);
  return `/businesses/request/?${params.toString()}`;
};
