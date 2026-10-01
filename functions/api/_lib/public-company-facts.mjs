// Explicit public whitelist. Never spread a private canonical row into a response.
export function publicCompanyFacts(row) {
  return {id:row.id,companyName:row.company_name,slug:row.slug,companyType:row.company_type,city:row.city,state:row.state,countryCode:row.country_code||'US',status:row.catalog_status,source:'hermes_connect_company',profileUrl:null,services:[],verificationLabel:row.catalog_status==='verified_public'?'Verified':'Self-submitted · verification pending',createdAt:row.created_at,updatedAt:row.updated_at};
}
